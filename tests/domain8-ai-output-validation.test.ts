/**
 * CS2 Assistant - Domain 8 Test Suite: AI Output Validation, Stale Rejection & History Loop
 * File: tests/domain8-ai-output-validation.test.ts
 */

import { describe, it, expect } from 'vitest';
import { validateTacticalRecommendation } from '../src/core/ai/validator';
import { GeminiTacticalCoach } from '../src/core/ai/gemini-coach';
import { HistoryAnalyticsEngine } from '../src/core/history/history-analytics';
import type { TacticalContext } from '../src/shared/ipc-types';

describe('Domain 8: Structured AI Output Validation, Stale Rejection & History Closed Loop', () => {
  const now = Date.now();
  const sampleContext: TacticalContext = {
    map: 'de_mirage',
    round: 10,
    score: { ct: 5, t: 4 },
    side: 'T',
    alivePlayers: { ct: 3, t: 4 },
    economy: { teamMoney: 16500, enemyEstimatedEconomy: 'FULL_BUY' },
    bombPlanted: false,
    recentObservations: [
      {
        eventId: 'evt-window-1',
        type: 'POSITION_REPORT',
        timestamp: now - 2000,
        roundId: 10,
        map: 'de_mirage',
        source: 'GSI_TELEMETRY',
        location: { callout: 'Window' },
        confidence: 'CONFIRMED',
        expiresAt: now + 28000,
      },
    ],
  };

  it('8.1: validates a well-formed TacticalRecommendation JSON payload', () => {
    const validPayload = {
      recommendationId: 'rec-101',
      type: 'EXECUTE_LINEUP',
      priority: 'CONTEXTUAL',
      confidence: 0.91,
      supportingEventIds: ['evt-window-1'],
      shortDisplayText: 'SMOKE WINDOW BEFORE MID PUSH',
      detailedExplanation: 'Confirmed operator at Window; deploy Top Mid Window smoke.',
      suggestedLineupId: 'mirage-t-smoke-window-spawn',
      expiresAt: now + 20000,
    };

    const res = validateTacticalRecommendation(validPayload, {
      nowMs: now,
      knownLineupIds: new Set(['mirage-t-smoke-window-spawn']),
      knownEventIds: new Set(['evt-window-1']),
    });

    expect(res.valid).toBe(true);
    expect(res.recommendation?.recommendationId).toBe('rec-101');
  });

  it('8.2: rejects hallucinated suggestedLineupId, >45 char HUD text, and expired timestamps', () => {
    const badPayload = {
      recommendationId: 'rec-bad',
      type: 'EXECUTE_LINEUP',
      priority: 'CRITICAL',
      confidence: 0.95,
      supportingEventIds: ['evt-window-1'],
      shortDisplayText: 'THIS DISPLAY TEXT IS WAY TOO LONG FOR THE MINIMALIST IN-GAME HUD OVERLAY',
      detailedExplanation: 'Invalid fields test',
      suggestedLineupId: 'hallucinated-nonexistent-lineup-999',
      expiresAt: now - 500, // Already expired
    };

    const res = validateTacticalRecommendation(badPayload, {
      nowMs: now,
      knownLineupIds: new Set(['mirage-t-smoke-window-spawn']),
    });

    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('45 character'))).toBe(true);
    expect(res.errors.some((e) => e.includes('Hallucinated suggestedLineupId'))).toBe(true);
    expect(res.errors.some((e) => e.includes('expired'))).toBe(true);
  });

  it('8.3: rejects stale AI responses that arrive after the round has ended', async () => {
    const coach = new GeminiTacticalCoach({ apiKey: 'AIzaSyTestValidFormatKey1234567890' });

    coach.setCustomGenerator(async () => {
      // Simulate round ending while Gemini request is in flight
      coach.onRoundEndOrCancel();
      return JSON.stringify({
        recommendationId: 'rec-late',
        type: 'FALLBACK_POSITION',
        priority: 'CONTEXTUAL',
        confidence: 0.85,
        supportingEventIds: ['evt-window-1'],
        shortDisplayText: 'LATE ADVICE FROM PREVIOUS ROUND',
        detailedExplanation: 'Should be discarded because round ended.',
        expiresAt: Date.now() + 20000,
      });
    });

    const result = await coach.analyzeContext(sampleContext);
    expect(result).toBeNull();
  });

  it('8.4: separates Measured Statistics from AI Interpretations in HistoryAnalyticsEngine and produces Utility Room deep links', () => {
    const history = new HistoryAnalyticsEngine();
    const report = history.generateReport();

    expect(report.measuredFacts.totalMatches).toBeGreaterThanOrEqual(3);
    expect(report.measuredFacts.winRatePercent).toBeCloseTo(66.7, 1);
    expect(report.aiInterpretations.length).toBeGreaterThan(0);

    const miragePractice = report.practiceRecommendations.find(
      (p) => p.targetMap === 'de_mirage'
    );
    expect(miragePractice).toBeDefined();
    expect(miragePractice?.buttonLabel).toBe('PRACTICE — MIRAGE A RETAKE');
    expect(miragePractice?.targetStrategyId).toBe('strat-mirage-a-retake');
  });
});
