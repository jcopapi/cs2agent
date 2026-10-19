/**
 * CS2 Assistant - Asynchronous Gemini Tactical Coach Pipeline
 * File: src/core/ai/gemini-coach.ts
 *
 * Implements Section 8.3 AI Analysis Pipeline using the official @google/genai SDK
 * (client.interactions.create with model 'gemini-3.8-flash'):
 * - Context compression
 * - Request cancellation & round-epoch stale response rejection
 * - Sliding-window rate limiting & token budgeting
 * - Cost/usage monitoring
 * - Response caching (5s TTL)
 * - Deterministic offline fallback when Gemini is unavailable or unconfigured
 */

import { GoogleGenAI } from '@google/genai';
import type {
  TacticalContext,
  TacticalRecommendation,
  AiUsageStats,
  GeminiCoachOptions,
} from './types';
import {
  TACTICAL_AI_SYSTEM_PROMPT,
  TACTICAL_RECOMMENDATION_JSON_SCHEMA,
} from './system-prompt';
import { validateTacticalRecommendation } from './validator';
import { getAllLineups } from '../utility/lineup-database';

interface CacheEntry {
  recommendation: TacticalRecommendation;
  cachedAt: number;
}

export class GeminiTacticalCoach {
  private apiKey: string | null = null;
  private model: string;
  private maxRequestsPerMinute: number;
  private maxTokenBudget: number;
  private cacheTtlMs: number;
  private knownLineupIds: Set<string>;
  private dismissedIds: Set<string> = new Set();

  // Rate limiting & token accounting
  private requestTimestamps: number[] = [];
  private currentRoundEpoch: number = 1;
  private activeAbortController: AbortController | null = null;
  private responseCache: Map<string, CacheEntry> = new Map();

  private stats: AiUsageStats = {
    totalRequests: 0,
    cachedResponses: 0,
    failedRequests: 0,
    totalTokensEstimated: 0,
    lastRequestTimestamp: null,
  };

  // Optional injectable transport for unit testing without live network calls
  private customGenerator?: (prompt: string, signal: AbortSignal) => Promise<string>;

  constructor(options?: GeminiCoachOptions) {
    this.apiKey = options?.apiKey ?? null;
    // Per gemini-api-dev skill: always use gemini-3.8-flash (never deprecated 2.5/2.0/1.5)
    this.model = options?.model || 'gemini-3.8-flash';
    this.maxRequestsPerMinute = options?.maxRequestsPerMinute ?? 12;
    this.maxTokenBudget = options?.maxTokenBudget ?? 50000;
    this.cacheTtlMs = options?.cacheTtlMs ?? 5000;

    if (options?.knownLineupIds) {
      this.knownLineupIds = new Set(options.knownLineupIds);
    } else {
      this.knownLineupIds = new Set(getAllLineups().map((l) => l.id));
    }
  }

  public setApiKey(key: string | null): void {
    this.apiKey = key ? key.trim() : null;
  }

  public setCustomGenerator(
    fn?: (prompt: string, signal: AbortSignal) => Promise<string>
  ): void {
    this.customGenerator = fn;
  }

  public dismissRecommendation(recommendationId: string): void {
    this.dismissedIds.add(recommendationId);
  }

  /**
   * Cancels any in-flight Gemini request and increments the round epoch so any
   * late-arriving response from a previous round is strictly rejected.
   */
  public onRoundEndOrCancel(): void {
    this.currentRoundEpoch += 1;
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
  }

  public getUsageStats(): AiUsageStats {
    return { ...this.stats };
  }

  /**
   * Compresses TacticalContext into a minimal token-efficient payload for Gemini.
   */
  public compressContext(context: TacticalContext): string {
    const compactObs = context.recentObservations.slice(-5).map((o) => ({
      id: o.eventId,
      t: o.type,
      c: o.confidence,
      loc: o.location?.callout ?? 'UNKNOWN',
      src: o.source,
    }));

    return JSON.stringify({
      map: context.map,
      round: context.round,
      side: context.side,
      alive: context.alivePlayers,
      eco: context.economy.enemyEstimatedEconomy,
      bombPlanted: context.bombPlanted,
      activeLineupId: context.activeLineup?.id ?? null,
      obs: compactObs,
    });
  }

  /**
   * Generates a deterministic, evidence-grounded offline fallback recommendation
   * when Gemini is unavailable, rate-limited, or unconfigured (Section 8.4).
   */
  public buildOfflineFallback(
    context: TacticalContext,
    nowMs: number = Date.now()
  ): TacticalRecommendation {
    const supportingIds = context.recentObservations.map((o) => o.eventId);

    if (context.bombPlanted) {
      const isRetake = context.side === 'CT';
      return {
        recommendationId: `offline-bomb-${context.round}-${nowMs}`,
        type: isRetake ? 'EXECUTE_LINEUP' : 'FALLBACK_POSITION',
        priority: 'CRITICAL',
        confidence: 0.88,
        supportingEventIds: supportingIds,
        shortDisplayText: isRetake
          ? 'COORDINATE RETAKE UTILITY'
          : 'PLAY POST-PLANT CROSSFIRE',
        detailedExplanation: isRetake
          ? 'Bomb is planted. Group with surviving teammates and deploy retake smoke/flash utility before swinging site.'
          : 'Bomb is planted. Hold passive crossfire angles and delay defusal with utility.',
        suggestedLineupId: context.activeLineup?.id,
        expiresAt: nowMs + 15000,
      };
    }

    if (context.activeLineup && this.knownLineupIds.has(context.activeLineup.id)) {
      return {
        recommendationId: `offline-lineup-${context.round}-${nowMs}`,
        type: 'EXECUTE_LINEUP',
        priority: 'CONTEXTUAL',
        confidence: 0.85,
        supportingEventIds: supportingIds,
        shortDisplayText: `READY: ${context.activeLineup.title.slice(0, 35).toUpperCase()}`,
        detailedExplanation: `Prepared lineup "${context.activeLineup.title}" is available for ${context.map}.`,
        suggestedLineupId: context.activeLineup.id,
        expiresAt: nowMs + 20000,
      };
    }

    if (context.recentObservations.length === 0) {
      return {
        recommendationId: `offline-silence-${context.round}-${nowMs}`,
        type: 'SILENCE',
        priority: 'PASSIVE',
        confidence: 1.0,
        supportingEventIds: [],
        shortDisplayText: 'HOLD DEFAULT — AWAITING INTEL',
        detailedExplanation: 'Insufficient verified observations to recommend a rotation or execute.',
        expiresAt: nowMs + 10000,
      };
    }

    return {
      recommendationId: `offline-ctx-${context.round}-${nowMs}`,
      type: 'FALLBACK_POSITION',
      priority: 'INFORMATIONAL',
      confidence: 0.75,
      supportingEventIds: supportingIds,
      shortDisplayText: 'ANCHOR SITE & TRADE ANGLES',
      detailedExplanation: 'Maintain disciplined spacing based on recent reported activity.',
      expiresAt: nowMs + 15000,
    };
  }

  /**
   * Executes the asynchronous AI analysis pipeline with caching, rate limiting,
   * round-epoch staleness verification, and schema validation.
   */
  public async analyzeContext(
    context: TacticalContext,
    nowMs: number = Date.now()
  ): Promise<TacticalRecommendation | null> {
    const compressed = this.compressContext(context);

    // 1. Check 5s response cache
    const cached = this.responseCache.get(compressed);
    if (
      cached &&
      nowMs - cached.cachedAt <= this.cacheTtlMs &&
      cached.recommendation.expiresAt > nowMs &&
      !this.dismissedIds.has(cached.recommendation.recommendationId)
    ) {
      this.stats.cachedResponses += 1;
      return cached.recommendation;
    }

    // 2. If no API key and no custom test generator, return deterministic fallback
    if (!this.apiKey && !this.customGenerator) {
      return this.buildOfflineFallback(context, nowMs);
    }

    // 3. Enforce sliding-window rate limit & token budget
    this.requestTimestamps = this.requestTimestamps.filter((t) => nowMs - t < 60000);
    if (
      this.requestTimestamps.length >= this.maxRequestsPerMinute ||
      this.stats.totalTokensEstimated >= this.maxTokenBudget
    ) {
      return this.buildOfflineFallback(context, nowMs);
    }

    const requestEpoch = this.currentRoundEpoch;
    const requestRound = context.round;
    const controller = new AbortController();
    this.activeAbortController = controller;

    this.requestTimestamps.push(nowMs);
    this.stats.totalRequests += 1;
    this.stats.lastRequestTimestamp = nowMs;

    const estimatedTokens = Math.ceil((compressed.length + TACTICAL_AI_SYSTEM_PROMPT.length) / 4);
    this.stats.totalTokensEstimated += estimatedTokens;

    try {
      let rawResponseText: string;

      if (this.customGenerator) {
        rawResponseText = await this.customGenerator(compressed, controller.signal);
      } else {
        const client = new GoogleGenAI({ apiKey: this.apiKey! });
        const interaction = await client.interactions.create({
          model: this.model,
          system_instruction: TACTICAL_AI_SYSTEM_PROMPT,
          input: `Analyze this verified CS2 match context and return a JSON TacticalRecommendation:\n${compressed}`,
          response_format: [
            {
              type: 'text',
              mime_type: 'application/json',
              schema: TACTICAL_RECOMMENDATION_JSON_SCHEMA,
            },
          ],
        });
        rawResponseText = interaction.output_text || '';
      }

      // Stale-response rejection: if round ended or request was cancelled while awaiting Gemini
      if (
        controller.signal.aborted ||
        requestEpoch !== this.currentRoundEpoch ||
        context.round !== requestRound
      ) {
        return null;
      }

      const knownEventIds = new Set(context.recentObservations.map((o) => o.eventId));
      const validation = validateTacticalRecommendation(rawResponseText, {
        nowMs: Date.now(),
        knownLineupIds: this.knownLineupIds,
        knownEventIds: knownEventIds.size > 0 ? knownEventIds : undefined,
        dismissedRecommendationIds: this.dismissedIds,
      });

      if (!validation.valid || !validation.recommendation) {
        this.stats.failedRequests += 1;
        return null;
      }

      if (validation.recommendation.type === 'SILENCE') {
        return null;
      }

      this.responseCache.set(compressed, {
        recommendation: validation.recommendation,
        cachedAt: Date.now(),
      });

      return validation.recommendation;
    } catch {
      this.stats.failedRequests += 1;
      if (controller.signal.aborted || requestEpoch !== this.currentRoundEpoch) {
        return null;
      }
      return this.buildOfflineFallback(context, Date.now());
    }
  }
}
