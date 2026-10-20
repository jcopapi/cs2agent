/**
 * CS2 Assistant - Verified Bomb Timer Engine
 * File: src/core/bomb-timer/bomb-timer-engine.ts
 *
 * Implements Section 7 Bomb Timer:
 * - Starts/synchronizes from verified plant events (40.0s standard CS2 C4 duration).
 * - Accounts for GSI event latency offset.
 * - Adapts urgency stages (GREEN -> AMBER -> RED -> FLASHING -> CLEARED).
 * - Evaluates 10.0s (no kit) and 5.0s (defuse kit) feasibility thresholds.
 * - Labels estimate explicitly if exact timing cannot be established.
 * - Clears immediately on defusal, explosion, or round end.
 */

import type { BombUrgencyStage, BombTimerSnapshot } from './types';

export class BombTimerEngine {
  private static readonly STANDARD_C4_DURATION_SEC = 40.0;
  private static readonly KIT_DEFUSE_SEC = 5.0;
  private static readonly NO_KIT_DEFUSE_SEC = 10.0;

  private planted: boolean = false;
  private plantTimestampMs: number = 0;
  private remainingSeconds: number = 0;
  private site: 'A' | 'B' | null = null;
  private defusing: boolean = false;
  private hasKit: boolean = false;
  private isEstimate: boolean = false;

  /**
   * Starts or synchronizes the bomb timer from a verified plant event.
   */
  public onBombPlanted(options?: {
    plantTimestampMs?: number;
    latencyOffsetMs?: number;
    site?: 'A' | 'B' | null;
    hasKit?: boolean;
    isEstimate?: boolean;
    initialSecondsRemaining?: number;
  }): BombTimerSnapshot {
    const now = options?.plantTimestampMs ?? Date.now();
    const latencySec = Math.max(0, (options?.latencyOffsetMs ?? 0) / 1000);
    const baseDuration =
      options?.initialSecondsRemaining ?? BombTimerEngine.STANDARD_C4_DURATION_SEC;

    this.planted = true;
    this.plantTimestampMs = now;
    this.remainingSeconds = Math.max(0, Number((baseDuration - latencySec).toFixed(2)));
    this.site = options?.site ?? null;
    this.defusing = false;
    this.hasKit = Boolean(options?.hasKit);
    this.isEstimate = Boolean(options?.isEstimate);

    return this.getSnapshot();
  }

  /**
   * Synchronizes with authoritative CS2 phase_countdowns telemetry without resetting.
   */
  public syncRemainingSeconds(exactSeconds: number): void {
    if (this.planted && Number.isFinite(exactSeconds) && exactSeconds >= 0) {
      this.remainingSeconds = Number(exactSeconds.toFixed(1));
    }
  }

  /**
   * Advances the countdown timer by `deltaSeconds`.
   */
  public tick(deltaSeconds: number): BombTimerSnapshot {
    if (!this.planted) {
      return this.getSnapshot();
    }
    if (Number.isFinite(deltaSeconds) && deltaSeconds > 0) {
      this.remainingSeconds = Math.max(
        0,
        Number((this.remainingSeconds - deltaSeconds).toFixed(2))
      );
      if (this.remainingSeconds <= 0) {
        this.clear();
      }
    }
    return this.getSnapshot();
  }

  public setKitEquipped(hasKit: boolean): void {
    this.hasKit = Boolean(hasKit);
  }

  public setDefusing(defusing: boolean): void {
    this.defusing = Boolean(defusing);
  }

  /**
   * Terminates and removes the timer on bomb defusal, explosion, or round end.
   */
  public clear(): void {
    this.planted = false;
    this.plantTimestampMs = 0;
    this.remainingSeconds = 0;
    this.site = null;
    this.defusing = false;
    this.isEstimate = false;
  }

  public getUrgencyStage(): BombUrgencyStage {
    if (!this.planted || this.remainingSeconds <= 0) {
      return 'CLEARED';
    }
    if (this.remainingSeconds > 20.0) {
      return 'GREEN';
    }
    if (this.remainingSeconds > 10.0) {
      return 'AMBER';
    }
    if (this.remainingSeconds > 5.0) {
      return 'RED';
    }
    return 'FLASHING';
  }

  public canDefuseInTime(): boolean {
    if (!this.planted) return false;
    const requiredSec = this.hasKit
      ? BombTimerEngine.KIT_DEFUSE_SEC
      : BombTimerEngine.NO_KIT_DEFUSE_SEC;
    return this.remainingSeconds >= requiredSec;
  }

  public getSnapshot(): BombTimerSnapshot {
    const stage = this.getUrgencyStage();
    const wholeSec = Math.ceil(this.remainingSeconds);
    const padded = String(Math.max(0, wholeSec)).padStart(2, '0');
    const timeStr = this.isEstimate ? `~00:${padded} (EST)` : `00:${padded}`;
    const requiredDefuse = this.hasKit
      ? BombTimerEngine.KIT_DEFUSE_SEC
      : BombTimerEngine.NO_KIT_DEFUSE_SEC;

    return {
      planted: this.planted,
      plantTime: this.plantTimestampMs,
      defuseTimeRemaining: this.defusing ? requiredDefuse : null,
      countdownSeconds: this.remainingSeconds,
      site: this.site,
      defusing: this.defusing,
      hasKit: this.hasKit,
      canDefuse: this.canDefuseInTime(),
      urgencyStage: stage,
      progressRatio: this.planted
        ? Math.min(1, Math.max(0, this.remainingSeconds / BombTimerEngine.STANDARD_C4_DURATION_SEC))
        : 0,
      formattedDisplay: this.planted ? `BOMB PLANTED\n${timeStr}` : 'INACTIVE',
      isEstimate: this.isEstimate,
    };
  }
}
