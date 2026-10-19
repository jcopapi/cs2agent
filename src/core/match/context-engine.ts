/**
 * CS2 Assistant - Deterministic Tactical Context Engine & Simulation Scenarios
 * File: src/core/match/context-engine.ts
 *
 * Evaluates current round state, observed tactical events, player equipment,
 * selected utility lineups, and prepared strategies.
 * Knows when to remain silent when evidence or relevance is insufficient.
 */

import type {
  Lineup,
  Strategy,
  MatchPreparationProfile,
  TacticalObservation,
  TeamSide,
} from '../../shared/ipc-types';

export interface ContextEvaluationInput {
  roundPhase: 'freezetime' | 'live' | 'over' | 'inactive';
  map: string;
  side: TeamSide;
  bombPlanted: boolean;
  aliveCount: { friendly: number; enemy: number };
  availableUtility: string[];
  observations: TacticalObservation[];
  activeProfile: MatchPreparationProfile | null;
  availableLineups: Lineup[];
  availableStrategies: Strategy[];
  playerPosition?: { x: number; y: number; z: number };
  nowMs?: number;
}

export interface ContextEvaluationResult {
  shouldRemainSilent: boolean;
  silenceReason?: string;
  relevantLineups: Lineup[];
  activeStrategy: Strategy | null;
  tacticalSummary: string | null;
  priority: 'CRITICAL' | 'CONTEXTUAL' | 'INFORMATIONAL' | 'PASSIVE';
}

export class TacticalContextEngine {
  private dismissedRecommendationKeys: Set<string> = new Set();

  public dismissContextKey(key: string): void {
    this.dismissedRecommendationKeys.add(key);
  }

  public resetDismissals(): void {
    this.dismissedRecommendationKeys.clear();
  }

  /**
   * Deterministically evaluates whether tactical assistance should be surfaced
   * or whether the assistant should remain silent (Section 3.5).
   */
  public evaluate(input: ContextEvaluationInput): ContextEvaluationResult {
    const now = input.nowMs ?? Date.now();

    if (input.roundPhase === 'inactive' || input.roundPhase === 'over') {
      return {
        shouldRemainSilent: true,
        silenceReason: 'Round is not active',
        relevantLineups: [],
        activeStrategy: null,
        tacticalSummary: null,
        priority: 'PASSIVE',
      };
    }

    // Filter observations to non-expired items on current map
    const validObservations = input.observations.filter(
      (o) => o.expiresAt > now && (!o.map || o.map === input.map)
    );

    // Filter lineups matching map, side, and preparation profile (if active)
    const profileLineupIds = input.activeProfile?.active
      ? new Set(input.activeProfile.selectedLineupIds)
      : null;

    const relevantLineups = input.availableLineups.filter((l) => {
      if (l.map !== input.map) return false;
      if (l.side !== 'BOTH' && l.side !== input.side) return false;
      if (profileLineupIds && profileLineupIds.size > 0 && !profileLineupIds.has(l.id)) {
        return false;
      }
      return true;
    });

    // Find active strategy from preparation profile
    let activeStrategy: Strategy | null = null;
    if (input.activeProfile?.active && input.activeProfile.selectedStrategyIds.length > 0) {
      activeStrategy =
        input.availableStrategies.find(
          (s) =>
            s.map === input.map &&
            input.activeProfile!.selectedStrategyIds.includes(s.id)
        ) || null;
    }

    // Bomb planted high-priority state
    if (input.bombPlanted) {
      const key = `bomb-${input.map}-${input.aliveCount.friendly}v${input.aliveCount.enemy}`;
      if (this.dismissedRecommendationKeys.has(key)) {
        return {
          shouldRemainSilent: true,
          silenceReason: 'Recommendation dismissed by player',
          relevantLineups,
          activeStrategy,
          tacticalSummary: null,
          priority: 'PASSIVE',
        };
      }
      const isRetake = input.side === 'CT';
      return {
        shouldRemainSilent: false,
        relevantLineups,
        activeStrategy,
        tacticalSummary: isRetake
          ? `RET-A/B: ${input.aliveCount.friendly}v${input.aliveCount.enemy} retake state`
          : `POST-PLANT: ${input.aliveCount.friendly}v${input.aliveCount.enemy} crossfire hold`,
        priority: 'CRITICAL',
      };
    }

    // Freezetime preparation state
    if (input.roundPhase === 'freezetime' && activeStrategy) {
      return {
        shouldRemainSilent: false,
        relevantLineups,
        activeStrategy,
        tacticalSummary: `PREP: ${activeStrategy.name} (${relevantLineups.length} lineups ready)`,
        priority: 'CONTEXTUAL',
      };
    }

    // Live round with confirmed or reported observations
    const highConfidenceObs = validObservations.filter(
      (o) => o.confidence === 'CONFIRMED' || o.confidence === 'REPORTED'
    );

    if (highConfidenceObs.length === 0 && relevantLineups.length === 0) {
      return {
        shouldRemainSilent: true,
        silenceReason: 'Insufficient confirmed tactical observations or prepared lineups',
        relevantLineups: [],
        activeStrategy: null,
        tacticalSummary: null,
        priority: 'PASSIVE',
      };
    }

    if (highConfidenceObs.length > 0) {
      const latest = highConfidenceObs[highConfidenceObs.length - 1];
      const loc = latest.location?.callout || 'Unknown sector';
      return {
        shouldRemainSilent: false,
        relevantLineups,
        activeStrategy,
        tacticalSummary: `[${latest.confidence}] Activity at ${loc}`,
        priority: 'CONTEXTUAL',
      };
    }

    return {
      shouldRemainSilent: false,
      relevantLineups,
      activeStrategy,
      tacticalSummary: `${relevantLineups.length} prepared lineups available for ${input.map}`,
      priority: 'INFORMATIONAL',
    };
  }
}
