/**
 * CS2 Assistant - Intelligent Lineup Execution Engine (7-State FSM)
 * File: src/core/lineup-fsm/lineup-engine.ts
 *
 * Implements the controlled 7-state machine (Section 6):
 * INACTIVE -> NEARBY -> POSITIONING -> ALIGNING -> READY -> EXECUTED -> NEXT
 *
 * Includes dual-radius spatial & angular hysteresis, cooldown protection against
 * overlay flickering, sequence management, manual overrides, and strict separation
 * of the 4 completion types:
 * - 'Attempted'
 * - 'Confirmed thrown'
 * - 'Confirmed landed'
 * - 'Manually completed'
 */

import type {
  LineupFsmState,
  CompletionType,
  LineupExecutionState,
  HysteresisThresholds,
  TelemetryFrame,
} from './types';

export const DEFAULT_HYSTERESIS: HysteresisThresholds = {
  nearbyEnterUnits: 150,
  nearbyExitUnits: 180,
  positioningEnterUnits: 30,
  positioningExitUnits: 38,
  aligningEnterUnits: 10,
  aligningExitUnits: 15,
  aligningEnterDeg: 15,
  aligningExitDeg: 20,
  readyEnterUnits: 5,
  readyExitUnits: 10,
  readyEnterDeg: 1.5,
  readyExitDeg: 2.5,
  transitionCooldownMs: 0,
};

export class LineupExecutionEngine {
  private state: LineupFsmState = 'INACTIVE';
  private sequenceLineupIds: string[] = [];
  private currentIndex: number = 0;
  private completionType: CompletionType | null = null;
  private completedLineupRecords: Map<string, CompletionType> = new Map();
  private lastDistance: number = Infinity;
  private lastAngleOffset: number = 180;
  private lastTransitionAt: number = 0;
  private thresholds: HysteresisThresholds;

  constructor(sequenceIds: string[] = [], thresholds?: Partial<HysteresisThresholds>) {
    this.sequenceLineupIds = [...sequenceIds];
    this.thresholds = { ...DEFAULT_HYSTERESIS, ...thresholds };
  }

  public setSequence(lineupIds: string[]): void {
    this.sequenceLineupIds = [...lineupIds];
    this.currentIndex = 0;
    this.state = 'INACTIVE';
    this.completionType = null;
    this.completedLineupRecords.clear();
  }

  public getActiveLineupId(): string | null {
    return this.sequenceLineupIds[this.currentIndex] ?? null;
  }

  public getState(): LineupFsmState {
    return this.state;
  }

  public getLastCompletionType(): CompletionType | null {
    return this.completionType;
  }

  public getSnapshot(nowMs: number = Date.now()): LineupExecutionState {
    return {
      state: this.state,
      activeLineupId: this.getActiveLineupId(),
      playerDistance: this.lastDistance,
      angleOffset: this.lastAngleOffset,
      completionType: this.completionType,
      timestamp: nowMs,
    };
  }

  public getCompletedMap(): Record<string, CompletionType> {
    return Object.fromEntries(this.completedLineupRecords.entries());
  }

  /**
   * Evaluates spatial and angular telemetry with dual-radius hysteresis.
   */
  public evaluateTelemetry(frame: TelemetryFrame): LineupFsmState {
    const now = frame.timestampMs ?? Date.now();
    this.lastDistance = frame.distanceToStartUnits;
    this.lastAngleOffset = frame.angleOffsetDegrees;

    if (this.state === 'EXECUTED' || this.state === 'NEXT') {
      return this.state;
    }

    if (
      this.thresholds.transitionCooldownMs > 0 &&
      this.lastTransitionAt > 0 &&
      now - this.lastTransitionAt < this.thresholds.transitionCooldownMs
    ) {
      return this.state;
    }

    const prevState = this.state;
    const d = frame.distanceToStartUnits;
    const a = frame.angleOffsetDegrees;
    const eq = frame.utilityEquipped;
    const t = this.thresholds;

    // 1. De-escalation checks (wider exit hysteresis boundaries prevent rapid flickering)
    if (this.state === 'READY') {
      if (!eq || d > t.readyExitUnits || a > t.readyExitDeg) {
        this.state = 'ALIGNING';
      }
    }
    if (this.state === 'ALIGNING') {
      if (d > t.aligningExitUnits || a > t.aligningExitDeg) {
        this.state = 'POSITIONING';
      }
    }
    if (this.state === 'POSITIONING') {
      if (d > t.positioningExitUnits) {
        this.state = 'NEARBY';
      }
    }
    if (this.state === 'NEARBY') {
      if (d > t.nearbyExitUnits) {
        this.state = 'INACTIVE';
      }
    }

    // 2. Escalation checks (tighter entry hysteresis boundaries)
    if (this.state === 'INACTIVE' && d <= t.nearbyEnterUnits) {
      this.state = 'NEARBY';
    }
    if (this.state === 'NEARBY' && d <= t.positioningEnterUnits) {
      this.state = 'POSITIONING';
    }
    if (this.state === 'POSITIONING' && d <= t.aligningEnterUnits && a <= t.aligningEnterDeg) {
      this.state = 'ALIGNING';
    }
    if (
      this.state === 'ALIGNING' &&
      d <= t.readyEnterUnits &&
      a <= t.readyEnterDeg &&
      eq
    ) {
      this.state = 'READY';
    }

    if (this.state !== prevState) {
      this.lastTransitionAt = now;
    }

    return this.state;
  }

  /**
   * Section 6 Execution Confirmation:
   * Do not treat an attack button press alone as proof of a landed lineup.
   * Distinguishes:
   * - 'Attempted' (attack input without release/detonation telemetry)
   * - 'Confirmed thrown' (utility inventory decremented / release verified)
   * - 'Confirmed landed' (detonation/bloom telemetry verified)
   * - 'Manually completed' (explicit player confirmation)
   */
  public recordExecution(options: {
    attackTriggered?: boolean;
    throwConfirmed?: boolean;
    landedConfirmed?: boolean;
    manualOverride?: boolean;
    timestampMs?: number;
  }): CompletionType {
    const now = options.timestampMs ?? Date.now();
    let resolvedType: CompletionType;

    if (options.manualOverride) {
      resolvedType = 'Manually completed';
    } else if (options.landedConfirmed) {
      resolvedType = 'Confirmed landed';
    } else if (options.throwConfirmed) {
      resolvedType = 'Confirmed thrown';
    } else {
      resolvedType = 'Attempted';
    }

    this.state = 'EXECUTED';
    this.completionType = resolvedType;
    this.lastTransitionAt = now;

    const activeId = this.getActiveLineupId();
    if (activeId) {
      this.completedLineupRecords.set(activeId, resolvedType);
    }

    return resolvedType;
  }

  /**
   * Transitions from EXECUTED -> NEXT and advances the sequence index if more lineups remain.
   */
  public advanceToNext(timestampMs: number = Date.now()): {
    state: LineupFsmState;
    nextLineupId: string | null;
  } {
    this.state = 'NEXT';
    this.lastTransitionAt = timestampMs;

    if (this.currentIndex + 1 < this.sequenceLineupIds.length) {
      this.currentIndex += 1;
      return {
        state: this.state,
        nextLineupId: this.getActiveLineupId(),
      };
    }

    return {
      state: this.state,
      nextLineupId: null,
    };
  }

  /**
   * Begins positioning for the newly queued lineup after NEXT state.
   */
  public activateQueuedLineup(): LineupFsmState {
    if (this.getActiveLineupId()) {
      this.state = 'INACTIVE';
      this.completionType = null;
    }
    return this.state;
  }

  /**
   * Manual override / cancellation returning the engine to INACTIVE.
   */
  public cancel(timestampMs: number = Date.now()): void {
    this.state = 'INACTIVE';
    this.completionType = null;
    this.lastTransitionAt = timestampMs;
  }
}
