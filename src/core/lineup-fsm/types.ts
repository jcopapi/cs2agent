/**
 * CS2 Assistant - Lineup Execution Engine Types
 * File: src/core/lineup-fsm/types.ts
 */

import type {
  LineupFsmState,
  CompletionType,
  Lineup,
  LineupExecutionState,
} from '../../shared/ipc-types';

export type { LineupFsmState, CompletionType, Lineup, LineupExecutionState };

export interface HysteresisThresholds {
  nearbyEnterUnits: number;      // e.g., 150
  nearbyExitUnits: number;       // e.g., 180
  positioningEnterUnits: number; // e.g., 30
  positioningExitUnits: number;  // e.g., 38
  aligningEnterUnits: number;    // e.g., 10
  aligningExitUnits: number;     // e.g., 15
  aligningEnterDeg: number;      // e.g., 15
  aligningExitDeg: number;       // e.g., 20
  readyEnterUnits: number;       // e.g., 5
  readyExitUnits: number;        // e.g., 10
  readyEnterDeg: number;         // e.g., 1.5
  readyExitDeg: number;          // e.g., 2.5
  transitionCooldownMs: number;  // e.g., 150ms anti-flicker hysteresis
}

export interface TelemetryFrame {
  distanceToStartUnits: number;
  angleOffsetDegrees: number;
  utilityEquipped: boolean;
  timestampMs?: number;
}
