/**
 * CS2 Assistant - Domain 11 Test Suite: Resilience, Failure Recovery & Edge Cases
 * File: tests/domain11-resilience-recovery.test.ts
 *
 * Tests edge cases required by Section 16:
 * - Gemini becomes unavailable / network error -> deterministic fallback
 * - Game disconnects / match ends unexpectedly
 * - External provider data format changes / malformed JSON import
 * - Overlay initialization in restricted environment
 * - Tactical Context Engine silence when evidence is insufficient
 */

import { describe, it, expect } from 'vitest';
import { GeminiTacticalCoach } from '../src/core/ai/gemini-coach';
import { TacticalContextEngine } from '../src/core/match/context-engine';
import { TacticalMemoryEngine } from '../src/core/match/tactical-memory';
import { deserializeAndValidate, validateLineup } from '../src/core/utility/json-io';
import { CapabilityGate } from '../src/core/compliance/capability-gate';
import { HudPriorityManager } from '../src/core/hud-manager/priority-manager';

describe('Domain 11: Resilience, Failure Recovery & Section 16 Edge Cases', () => {
  it('11.1: falls back gracefully to deterministic offline tactical advice when Gemini throws a network/API error', async () => {
    const coach = new GeminiTacticalCoach({ apiKey: 'AIzaSyTestValidFormatKey1234567890' });
    coach.setCustomGenerator(async () => {
      throw new Error('503 Service Unavailable: Gemini endpoint unreachable');
    });

    const fallback = await coach.analyzeContext({
      map: 'de_mirage',
      round: 12,
      score: { ct: 6, t: 5 },
      side: 'CT',
      alivePlayers: { ct: 3, t: 2 },
      economy: { teamMoney: 12000, enemyEstimatedEconomy: 'FULL_BUY' },
      bombPlanted: true,
      recentObservations: [],
    });

    expect(fallback).not.toBeNull();
    expect(fallback?.priority).toBe('CRITICAL');
    expect(fallback?.shortDisplayText.length).toBeLessThanOrEqual(45);
  });

  it('11.2: remains silent in TacticalContextEngine when round is over, disconnected, or observations are insufficient', () => {
    const ctxEngine = new TacticalContextEngine();
    const resOver = ctxEngine.evaluate({
      roundPhase: 'over',
      map: 'de_mirage',
      side: 'T',
      bombPlanted: false,
      aliveCount: { friendly: 0, enemy: 2 },
      availableUtility: [],
      observations: [],
      activeProfile: null,
      availableLineups: [],
      availableStrategies: [],
    });

    expect(resOver.shouldRemainSilent).toBe(true);

    const resEmptyLive = ctxEngine.evaluate({
      roundPhase: 'live',
      map: 'de_mirage',
      side: 'T',
      bombPlanted: false,
      aliveCount: { friendly: 5, enemy: 5 },
      availableUtility: [],
      observations: [],
      activeProfile: null,
      availableLineups: [],
      availableStrategies: [],
    });

    expect(resEmptyLive.shouldRemainSilent).toBe(true);
  });

  it('11.3: recovers cleanly when a provider or user import changes data format or injects malformed schema', () => {
    const corruptedImport = JSON.stringify([
      {
        id: 12345,
        startPosition: 'invalid-coords',
        brokenField: '<script>alert(1)</script>',
      },
    ]);

    const result = deserializeAndValidate(corruptedImport);
    expect(result.summary.importedCount).toBe(0);
    expect(result.summary.errors.length).toBeGreaterThan(0);

    const directVal = validateLineup({ id: '', map: 'invalid_map' });
    expect(directVal.valid).toBe(false);
    expect(directVal.errors.length).toBeGreaterThan(0);
  });

  it('11.4: suppresses restricted HUD modules when running in COMPETITIVE_PROTECTED environment', () => {
    const gate = new CapabilityGate('COMPETITIVE_PROTECTED');
    const hud = new HudPriorityManager({ width: 1920, height: 1080 }, gate);

    hud.registerPanel({
      id: 'restricted-live-overlay',
      module: 'IN_GAME_OVERLAY',
      priority: 'CONTEXTUAL',
      placement: 'MID_RIGHT_COMPACT',
      bounds: { x: 1550, y: 400, width: 220, height: 90 },
      requiredFeatureId: 'IN_GAME_CROSSHAIR_OVERLAY',
    });

    const visible = hud.evaluateVisiblePanels();
    expect(visible[0].visible).toBe(false);
    expect(visible[0].suppressionReason).toContain('Compliance Layer');
  });

  it('11.5: clears all round and map state cleanly upon unexpected match disconnect', () => {
    const memory = new TacticalMemoryEngine();
    memory.recordObservation({
      type: 'POSITION_REPORT',
      source: 'GSI_TELEMETRY',
      confidence: 'CONFIRMED',
      location: { callout: 'Connector' },
    });
    expect(memory.getActiveObservations().length).toBe(1);

    memory.clearAll();
    expect(memory.getActiveObservations().length).toBe(0);
  });
});
