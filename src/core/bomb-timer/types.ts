/**
 * CS2 Assistant - Bomb Timer Engine Types
 * File: src/core/bomb-timer/types.ts
 */

import type { BombState } from '../../shared/ipc-types';

export type { BombState };

export type BombUrgencyStage = 'GREEN' | 'AMBER' | 'RED' | 'FLASHING' | 'CLEARED';

export interface BombTimerSnapshot extends BombState {
  urgencyStage: BombUrgencyStage;
  progressRatio: number; // 0.0 to 1.0
  formattedDisplay: string; // e.g., "BOMB PLANTED\n00:24" or "BOMB PLANTED\n~00:24 (EST)"
  isEstimate: boolean;
}
