/**
 * CS2 Assistant - Gemini Tactical Coach Types
 * File: src/core/ai/types.ts
 */

import type {
  TacticalContext,
  TacticalRecommendation,
  AiUsageStats,
} from '../../shared/ipc-types';

export type { TacticalContext, TacticalRecommendation, AiUsageStats };

export interface RecommendationValidationResult {
  valid: boolean;
  recommendation?: TacticalRecommendation;
  errors: string[];
}

export interface GeminiCoachOptions {
  apiKey?: string | null;
  model?: string;
  maxRequestsPerMinute?: number;
  maxTokenBudget?: number;
  cacheTtlMs?: number;
  knownLineupIds?: Iterable<string>;
}
