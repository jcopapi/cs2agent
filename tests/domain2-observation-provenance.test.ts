/**
 * CS2 Assistant - Domain 2 Test Suite: Observation Provenance
 * File: tests/domain2-observation-provenance.test.ts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TacticalMemoryEngine } from '../src/core/match/tactical-memory';

describe('Domain 2: Observation Provenance & Metadata Tracking', () => {
  let memory: TacticalMemoryEngine;

  beforeEach(() => {
    memory = new TacticalMemoryEngine({ defaultTtlMs: 30000 });
  });

  it('2.1: records eventId, type, timestamp, roundId, map, source, playerIdentity, location, confidence, and expiresAt', () => {
    const now = 1700000000000;
    const obs = memory.recordObservation({
      eventId: 'evt-prov-1',
      type: 'POSITION_REPORT',
      timestamp: now,
      roundId: 7,
      map: 'de_mirage',
      source: 'GSI_TELEMETRY',
      playerIdentity: { name: 'EnemyYellow', team: 'T', slot: 2 },
      location: { callout: 'Palace', x: -1400, y: -600, z: -160 },
      confidence: 'CONFIRMED',
    });

    expect(obs.eventId).toBe('evt-prov-1');
    expect(obs.type).toBe('POSITION_REPORT');
    expect(obs.timestamp).toBe(now);
    expect(obs.roundId).toBe(7);
    expect(obs.map).toBe('de_mirage');
    expect(obs.source).toBe('GSI_TELEMETRY');
    expect(obs.playerIdentity?.name).toBe('EnemyYellow');
    expect(obs.location?.callout).toBe('Palace');
    expect(obs.confidence).toBe('CONFIRMED');
    expect(obs.confidenceScore).toBe(1.0);
    expect(obs.expiresAt).toBe(now + 30000);
  });

  it('2.2: distinguishes CONFIRMED (1.0), REPORTED (0.75), and INFERRED (0.40) provenance tiers', () => {
    const c = memory.recordObservation({
      type: 'POSITION_REPORT',
      source: 'GSI_TELEMETRY',
      confidence: 'CONFIRMED',
    });
    const r = memory.recordObservation({
      type: 'POSITION_REPORT',
      source: 'MANUAL_REPORT',
      confidence: 'REPORTED',
    });
    const i = memory.recordObservation({
      type: 'POSITION_REPORT',
      source: 'AUDIO_RADAR',
      confidence: 'INFERRED',
      inferredHypothesis: 'Likely rotating via CT Spawn',
    });

    expect(c.confidenceScore).toBe(1.0);
    expect(r.confidenceScore).toBe(0.75);
    expect(i.confidenceScore).toBe(0.4);
    expect(i.inferredHypothesis).toBe('Likely rotating via CT Spawn');
  });

  it('2.3: flushes round-scoped observations when roundId or map changes', () => {
    const now = 1700000000000;
    memory.recordObservation({
      type: 'POSITION_REPORT',
      roundId: 1,
      map: 'de_mirage',
      source: 'GSI_TELEMETRY',
      confidence: 'CONFIRMED',
      timestamp: now,
    });
    expect(memory.getActiveObservations(now).length).toBe(1);

    // Advance to round 2
    memory.recordObservation({
      type: 'POSITION_REPORT',
      roundId: 2,
      map: 'de_mirage',
      source: 'GSI_TELEMETRY',
      confidence: 'CONFIRMED',
      timestamp: now + 1000,
    });
    const activeR2 = memory.getActiveObservations(now + 1000);
    expect(activeR2.length).toBe(1);
    expect(activeR2[0].roundId).toBe(2);

    // Change map to de_inferno
    memory.onMapChange('de_inferno');
    expect(memory.getActiveObservations(now + 2000).length).toBe(0);
  });
});
