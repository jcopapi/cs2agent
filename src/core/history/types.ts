/**
 * CS2 Assistant - History & Performance Intelligence Types
 * File: src/core/history/types.ts
 */

import type { CS2Map, MatchRecord } from '../../shared/ipc-types';

export type { CS2Map, MatchRecord };

export interface MeasuredPerformanceSummary {
  totalMatches: number;
  wins: number;
  losses: number;
  ties: number;
  winRatePercent: number;
  averageKills: number;
  averageDeaths: number;
  kdRatio: number;
  averageAdr: number;
  averageUtilityDamage: number;
  averageFlashAssists: number;
}

export interface PracticeDeepLinkRecommendation {
  id: string;
  title: string;
  evidenceSummary: string;
  targetMap: CS2Map;
  targetStrategyId: string;
  buttonLabel: string; // e.g., "PRACTICE — MIRAGE A RETAKE"
}

export interface HistoryAnalysisReport {
  measuredFacts: MeasuredPerformanceSummary;
  aiInterpretations: string[];
  practiceRecommendations: PracticeDeepLinkRecommendation[];
}
