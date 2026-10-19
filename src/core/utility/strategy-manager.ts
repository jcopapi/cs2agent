/**
 * CS2 Assistant - Unified Strategy Manager, Validator & Sequencing Engine
 * File: src/core/utility/strategy-manager.ts
 *
 * Implements:
 * 1. StrategyValidator: Semantic validation enforcing monotonic timing, phase sequences,
 *    DAG acyclicity (cycle detection), role constraints, and lineup integrity.
 * 2. StrategySequencingEngine: Deterministic runtime state machine managing phase/step progression,
 *    parallel execution cues, and synchronization gates.
 * 3. StrategyManager: Unified facade integrating Strategy Database, Validator, Sequencing Engine,
 *    and Match Preparation Profiles.
 */

import type {
  Strategy,
  StrategyStep,
  TacticalPhase,
  SyncGate,
  StrategyFilter,
  CS2Map,
  TeamSide,
  CompletionType,
} from './types';
import { COMPETITIVE_STRATEGIES } from './strategy-database';
import { ProfileManager } from './profile-manager';

export type { Strategy, StrategyStep, TacticalPhase };

// ----------------------------------------------------------------------------
// 1. Strategy Validator
// ----------------------------------------------------------------------------

export interface StrategyValidationError {
  field: string;
  code:
    | 'NON_MONOTONIC_TIMING'
    | 'NEGATIVE_TIMING'
    | 'MISSING_LINEUP'
    | 'CYCLIC_DEPENDENCY'
    | 'INVALID_PHASE_SEQUENCE'
    | 'INSUFFICIENT_ROLES'
    | 'UTILITY_MISMATCH'
    | 'INVALID_METADATA';
  message: string;
}

export interface StrategyValidationResult {
  valid: boolean;
  errors: StrategyValidationError[];
}

export class StrategyValidator {
  /**
   * Validates a complete Strategy against all architectural and tactical invariants.
   */
  public static validate(strategy: Strategy, knownLineupIds?: Set<string>): StrategyValidationResult {
    const errors: StrategyValidationError[] = [];

    // 1. Metadata check
    if (!strategy.id || strategy.id.trim().length === 0) {
      errors.push({ field: 'id', code: 'INVALID_METADATA', message: 'Strategy ID cannot be empty.' });
    }
    if (!strategy.name || strategy.name.trim().length < 3) {
      errors.push({ field: 'name', code: 'INVALID_METADATA', message: 'Strategy name must be at least 3 characters.' });
    }
    if (!strategy.phases || strategy.phases.length === 0) {
      errors.push({ field: 'phases', code: 'INVALID_PHASE_SEQUENCE', message: 'Strategy must contain at least one phase.' });
      return { valid: false, errors };
    }

    // 2. Phase sequence and timing monotonicity
    let lastPhaseTiming = -1;
    const allStepIds = new Map<string, StrategyStep>();
    const distinctRoles = new Set<string>();

    for (let i = 0; i < strategy.phases.length; i++) {
      const phase = strategy.phases[i];
      const expectedPhaseNumber = i + 1;

      if (phase.phaseNumber !== expectedPhaseNumber) {
        errors.push({
          field: `phases[${i}].phaseNumber`,
          code: 'INVALID_PHASE_SEQUENCE',
          message: `Expected phase number ${expectedPhaseNumber}, but received ${phase.phaseNumber}.`,
        });
      }

      if (phase.timingSeconds < 0) {
        errors.push({
          field: `phases[${i}].timingSeconds`,
          code: 'NEGATIVE_TIMING',
          message: `Phase timing cannot be negative: ${phase.timingSeconds}s.`,
        });
      }

      if (phase.timingSeconds < lastPhaseTiming) {
        errors.push({
          field: `phases[${i}].timingSeconds`,
          code: 'NON_MONOTONIC_TIMING',
          message: `Phase ${phase.phaseNumber} start time (${phase.timingSeconds}s) is earlier than previous phase (${lastPhaseTiming}s).`,
        });
      }
      lastPhaseTiming = phase.timingSeconds;

      // Validate steps inside this phase (if defined)
      if (phase.steps && phase.steps.length > 0) {
        let lastStepTiming = phase.timingSeconds;
        for (let j = 0; j < phase.steps.length; j++) {
          const step = phase.steps[j];

          if (allStepIds.has(step.stepId)) {
            errors.push({
              field: `phases[${i}].steps[${j}].stepId`,
              code: 'INVALID_METADATA',
              message: `Duplicate stepId detected: "${step.stepId}".`,
            });
          }
          allStepIds.set(step.stepId, step);
          if (step.role) {
            distinctRoles.add(step.role);
          }

          if (step.timingOffsetSeconds < 0) {
            errors.push({
              field: `phases[${i}].steps[${j}].timingOffsetSeconds`,
              code: 'NEGATIVE_TIMING',
              message: `Step timing cannot be negative: ${step.timingOffsetSeconds}s.`,
            });
          }

          if (step.timingOffsetSeconds < lastStepTiming) {
            errors.push({
              field: `phases[${i}].steps[${j}].timingOffsetSeconds`,
              code: 'NON_MONOTONIC_TIMING',
              message: `Step "${step.stepId}" timing offset (${step.timingOffsetSeconds}s) is earlier than preceding step (${lastStepTiming}s).`,
            });
          }
          lastStepTiming = step.timingOffsetSeconds;

          // Lineup existence check
          if (step.lineupId && knownLineupIds && !knownLineupIds.has(step.lineupId)) {
            errors.push({
              field: `phases[${i}].steps[${j}].lineupId`,
              code: 'MISSING_LINEUP',
              message: `Referenced lineup "${step.lineupId}" does not exist in the database.`,
            });
          }
        }
      }
    }

    // 3. Dependency graph acyclicity and prerequisite order
    for (const [stepId, step] of allStepIds.entries()) {
      if (step.prerequisiteStepIds) {
        for (const prereqId of step.prerequisiteStepIds) {
          const prereqStep = allStepIds.get(prereqId);
          if (!prereqStep) {
            errors.push({
              field: `step[${stepId}].prerequisiteStepIds`,
              code: 'INVALID_METADATA',
              message: `Step "${stepId}" references non-existent prerequisite "${prereqId}".`,
            });
          } else if (prereqStep.timingOffsetSeconds > step.timingOffsetSeconds) {
            errors.push({
              field: `step[${stepId}].prerequisiteStepIds`,
              code: 'NON_MONOTONIC_TIMING',
              message: `Prerequisite "${prereqId}" (t=${prereqStep.timingOffsetSeconds}s) scheduled after dependent step "${stepId}" (t=${step.timingOffsetSeconds}s).`,
            });
          }
        }
      }
    }

    // Cycle detection using DFS
    if (StrategyValidator.hasCycles(allStepIds)) {
      errors.push({
        field: 'steps.dependencies',
        code: 'CYCLIC_DEPENDENCY',
        message: 'Circular dependency cycle detected in strategy step prerequisites.',
      });
    }

    // 4. Role requirements for COORDINATED tier
    const effectiveRoles = distinctRoles.size > 0 ? distinctRoles.size : strategy.recommendedRoles.length;
    if (strategy.difficulty === 'COORDINATED' && effectiveRoles < 2) {
      errors.push({
        field: 'recommendedRoles',
        code: 'INSUFFICIENT_ROLES',
        message: `Coordinated strategy requires at least 2 distinct player roles, but only found ${effectiveRoles}.`,
      });
    }

    return { valid: errors.length === 0, errors };
  }

  private static hasCycles(steps: Map<string, StrategyStep>): boolean {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (id: string): boolean => {
      visited.add(id);
      recStack.add(id);

      const step = steps.get(id);
      if (step?.prerequisiteStepIds) {
        for (const prereq of step.prerequisiteStepIds) {
          if (!visited.has(prereq)) {
            if (dfs(prereq)) return true;
          } else if (recStack.has(prereq)) {
            return true;
          }
        }
      }

      recStack.delete(id);
      return false;
    };

    for (const id of steps.keys()) {
      if (!visited.has(id)) {
        if (dfs(id)) return true;
      }
    }
    return false;
  }
}

// ----------------------------------------------------------------------------
// 2. Strategy Sequencing Engine
// ----------------------------------------------------------------------------

export type StrategyExecutionStatus =
  | 'IDLE'
  | 'PREPARING'
  | 'IN_PROGRESS'
  | 'GATE_WAIT'
  | 'COMPLETED'
  | 'ABORTED'
  | 'FAILED';

export type StepExecutionStatus =
  | 'PENDING'
  | 'READY'
  | 'ACTIVE'
  | 'EXECUTED'
  | 'SKIPPED'
  | 'FAILED';

export interface StepRuntimeState {
  step: StrategyStep;
  status: StepExecutionStatus;
  startedAt?: number;
  completedAt?: number;
  completionType?: CompletionType;
}

export interface PhaseRuntimeState {
  phase: TacticalPhase;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
  unlockedGates: Set<string>;
}

export class StrategySequencingEngine {
  private currentStrategy: Strategy | null = null;
  private status: StrategyExecutionStatus = 'IDLE';
  private elapsedSeconds: number = 0;
  private phaseStates: PhaseRuntimeState[] = [];
  private stepStates: Map<string, StepRuntimeState> = new Map();
  private executedLineupIds: Set<string> = new Set();

  public getStatus(): StrategyExecutionStatus {
    return this.status;
  }

  public getElapsedSeconds(): number {
    return this.elapsedSeconds;
  }

  public getActiveStrategy(): Strategy | null {
    return this.currentStrategy;
  }

  public loadStrategy(strategy: Strategy): void {
    this.currentStrategy = strategy;
    this.status = 'IDLE';
    this.elapsedSeconds = 0;
    this.executedLineupIds.clear();
    this.stepStates.clear();
    this.phaseStates = strategy.phases.map((p) => ({
      phase: p,
      status: 'PENDING',
      unlockedGates: new Set<string>(),
    }));

    for (const phase of strategy.phases) {
      if (phase.steps) {
        for (const step of phase.steps) {
          this.stepStates.set(step.stepId, {
            step,
            status: 'PENDING',
          });
        }
      }
    }
  }

  public start(): boolean {
    if (!this.currentStrategy) return false;
    this.status = 'IN_PROGRESS';
    this.elapsedSeconds = 0.0;
    this.evaluateState();
    return true;
  }

  /**
   * Advances the internal execution clock by deltaSeconds with precision clamping.
   */
  public tick(deltaSeconds: number): void {
    if (this.status !== 'IN_PROGRESS' && this.status !== 'GATE_WAIT') return;
    if (deltaSeconds < 0) return; // Clamped against clock rollback
    this.elapsedSeconds = Math.round((this.elapsedSeconds + deltaSeconds) * 100) / 100;
    this.evaluateState();
  }

  /**
   * Signals that a lineup was confirmed executed by the Lineup FSM.
   */
  public notifyLineupExecuted(lineupId: string, completionType: CompletionType = 'Confirmed thrown'): void {
    this.executedLineupIds.add(lineupId);

    // Find steps matching this lineup and mark them executed
    for (const state of this.stepStates.values()) {
      if (state.step.lineupId === lineupId && (state.status === 'ACTIVE' || state.status === 'READY' || state.status === 'PENDING')) {
        state.status = 'EXECUTED';
        state.completedAt = this.elapsedSeconds;
        state.completionType = completionType;
      }
    }
    this.evaluateState();
  }

  /**
   * Manually unlocks a synchronization gate (e.g. IGL voice callout).
   */
  public manualUnlockGate(gateId: string): void {
    for (const phaseState of this.phaseStates) {
      if (phaseState.phase.gates) {
        for (const gate of phaseState.phase.gates) {
          if (gate.gateId === gateId) {
            phaseState.unlockedGates.add(gateId);
          }
        }
      }
    }
    this.evaluateState();
  }

  /**
   * Evaluates state machine rules, gates, parallel steps, and phase completions.
   */
  private evaluateState(): void {
    if (this.status !== 'IN_PROGRESS' && this.status !== 'GATE_WAIT') return;

    let gateBlocking = false;

    for (const phaseState of this.phaseStates) {
      const phase = phaseState.phase;

      // Phase timing check
      if (this.elapsedSeconds >= phase.timingSeconds && phaseState.status === 'PENDING') {
        phaseState.status = 'ACTIVE';
      }

      if (phaseState.status === 'ACTIVE') {
        // Evaluate synchronization gates
        if (phase.gates) {
          for (const gate of phase.gates) {
            if (phaseState.unlockedGates.has(gate.gateId)) continue;

            let gateSatisfied = false;
            if (gate.type === 'TIME_ELAPSED' && gate.thresholdSeconds !== undefined) {
              gateSatisfied = this.elapsedSeconds >= gate.thresholdSeconds;
            } else if (gate.type === 'ALL_LINEUPS_EXECUTED' && gate.requiredLineupIds) {
              gateSatisfied = gate.requiredLineupIds.every((id) => this.executedLineupIds.has(id));
            }

            if (gateSatisfied) {
              phaseState.unlockedGates.add(gate.gateId);
            } else {
              gateBlocking = true;
            }
          }
        }

        // Update step states in active phase
        if (phase.steps) {
          for (const step of phase.steps) {
            const stepState = this.stepStates.get(step.stepId);
            if (!stepState) continue;
            if (stepState.status === 'EXECUTED' || stepState.status === 'SKIPPED') continue;

            // Check prerequisites
            const prereqsSatisfied =
              !step.prerequisiteStepIds ||
              step.prerequisiteStepIds.every((pId) => {
                const p = this.stepStates.get(pId);
                return p && (p.status === 'EXECUTED' || p.status === 'SKIPPED');
              });

            if (prereqsSatisfied) {
              if (this.elapsedSeconds >= step.timingOffsetSeconds) {
                stepState.status = 'ACTIVE';
                if (stepState.startedAt === undefined) stepState.startedAt = this.elapsedSeconds;
              } else {
                stepState.status = 'READY';
              }
            } else {
              stepState.status = 'PENDING';
            }
          }
        }

        // Check if all steps in this phase are done and gates unlocked
        const allStepsDone =
          !phase.steps ||
          phase.steps.every((s) => {
            const st = this.stepStates.get(s.stepId)?.status;
            return st === 'EXECUTED' || st === 'SKIPPED';
          });

        const allGatesUnlocked =
          !phase.gates || phase.gates.every((g) => phaseState.unlockedGates.has(g.gateId));

        if (allStepsDone && allGatesUnlocked) {
          phaseState.status = 'COMPLETED';
        }
      }
    }

    // Set overall engine status
    const activeSteps = this.getActiveSteps();
    if (activeSteps.length > 0) {
      this.status = 'IN_PROGRESS';
    } else if (gateBlocking) {
      this.status = 'GATE_WAIT';
    } else {
      this.status = 'IN_PROGRESS';
    }

    const allPhasesCompleted = this.phaseStates.every((p) => p.status === 'COMPLETED');
    if (allPhasesCompleted && this.phaseStates.length > 0) {
      this.status = 'COMPLETED';
    }
  }

  public getActiveSteps(): StrategyStep[] {
    const active: StrategyStep[] = [];
    for (const state of this.stepStates.values()) {
      if (state.status === 'ACTIVE') {
        active.push(state.step);
      }
    }
    return active;
  }

  public getStepStatus(stepId: string): StepExecutionStatus | undefined {
    return this.stepStates.get(stepId)?.status;
  }

  public abort(_reason: string = 'User aborted'): void {
    this.status = 'ABORTED';
  }

  public reset(): void {
    if (this.currentStrategy) {
      this.loadStrategy(this.currentStrategy);
    } else {
      this.status = 'IDLE';
    }
  }
}

// ----------------------------------------------------------------------------
// 3. Unified Strategy Manager Facade
// ----------------------------------------------------------------------------

export class StrategyManager {
  private strategies: Map<string, Strategy> = new Map();
  private sequencingEngine: StrategySequencingEngine;
  private profileManager: ProfileManager;
  private knownLineupIds: Set<string> = new Set();

  constructor(profileManager?: ProfileManager, knownLineupIds?: string[]) {
    this.profileManager = profileManager || new ProfileManager();
    this.sequencingEngine = new StrategySequencingEngine();
    if (knownLineupIds) {
      this.knownLineupIds = new Set(knownLineupIds);
    }
    // Register verified competitive strategies by default
    for (const strat of COMPETITIVE_STRATEGIES) {
      this.strategies.set(strat.id, { ...strat });
    }
  }

  public registerStrategy(strategy: Strategy): StrategyValidationResult {
    const validation = StrategyValidator.validate(
      strategy,
      this.knownLineupIds.size > 0 ? this.knownLineupIds : undefined
    );
    if (!validation.valid) {
      return validation;
    }
    this.strategies.set(strategy.id, { ...strategy });
    return validation;
  }

  public getById(id: string): Strategy | null {
    const s = this.strategies.get(id);
    return s ? { ...s } : null;
  }

  public getAll(filter?: StrategyFilter): Strategy[] {
    let result = Array.from(this.strategies.values());
    if (filter?.map) result = result.filter((s) => s.map === filter.map);
    if (filter?.side && filter.side !== 'ALL') {
      result = result.filter((s) => s.side === filter.side || s.side === 'BOTH');
    }
    if (filter?.difficulty && filter.difficulty !== 'ALL') {
      result = result.filter((s) => s.difficulty === filter.difficulty);
    }
    if (filter?.searchQuery && filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase().trim();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.objective.toLowerCase().includes(q));
    }
    return result.map((s) => ({ ...s }));
  }

  public delete(id: string): boolean {
    return this.strategies.delete(id);
  }

  public getSequencingEngine(): StrategySequencingEngine {
    return this.sequencingEngine;
  }

  public getProfileManager(): ProfileManager {
    return this.profileManager;
  }
}
