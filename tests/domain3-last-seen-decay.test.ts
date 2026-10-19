/**
 * CS2 Assistant - Domain 3 Test Suite: Last-Seen Expiration & Visual Decay
 * File: tests/domain3-last-seen-decay.test.ts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TacticalMemoryEngine } from '../src/core/match/tactical-memory';

describe('Domain 3: Last-Seen Expiration & Visual Prominence Decay (Section 3.4)', () => {
  let memory: TacticalMemoryEngine;
  const t0 = 1700000000000;

  beforeEach(() => {
    memory = new TacticalMemoryEngine({ defaultTtlMs: 30000, lastKnownOverlayEnabled: true });
  });

  it('3.1: computes FRESH, AGING, STALE, and EXPIRED staleness tiers with decaying opacity', () => {
    const rec = memory.recordObservation({
      eventId: 'obs-yellow-palace',
      type: 'POSITION_REPORT',
      timestamp: t0,
      roundId: 4,
      map: 'de_mirage',
      source: 'MANUAL_REPORT',
      playerIdentity: { name: 'ENEMY YELLOW', team: 'T', slot: 3 },
      location: { callout: 'Palace' },
      confidence: 'REPORTED',
      ttlMs: 30000,
    });

    // At +2s -> FRESH, high opacity
    const dFresh = memory.computeDecay(rec, t0 + 2000);
    expect(dFresh.stalenessTier).toBe('FRESH');
    expect(dFresh.elapsedSeconds).toBe(2);
    expect(dFresh.opacity).toBeGreaterThan(0.9);

    // At +10s -> AGING, reduced opacity
    const dAging = memory.computeDecay(rec, t0 + 10000);
    expect(dAging.stalenessTier).toBe('AGING');
    expect(dAging.opacity).toBeLessThan(dFresh.opacity);

    // At +18s -> STALE (Matches prompt example: "18 seconds ago / Source: Teammate callout")
    const dStale = memory.computeDecay(rec, t0 + 18000);
    expect(dStale.stalenessTier).toBe('STALE');
    expect(dStale.elapsedSeconds).toBe(18);
    expect(dStale.opacity).toBeLessThan(dAging.opacity);
    expect(dStale.opacity).toBeGreaterThanOrEqual(0.25);

    // At +31s -> EXPIRED, zero opacity
    const dExpired = memory.computeDecay(rec, t0 + 31000);
    expect(dExpired.stalenessTier).toBe('EXPIRED');
    expect(dExpired.opacity).toBe(0);
  });

  it('3.2: generates Last Known Information Overlay annotations and excludes expired observations', () => {
    memory.recordObservation({
      eventId: 'obs-yellow-1',
      type: 'POSITION_REPORT',
      timestamp: t0,
      roundId: 4,
      map: 'de_mirage',
      source: 'MANUAL_REPORT',
      playerIdentity: { name: 'ENEMY YELLOW', team: 'T', slot: 3 },
      location: { callout: 'Palace' },
      confidence: 'REPORTED',
      ttlMs: 30000,
    });

    const at18s = memory.getLastKnownOverlayAnnotations('T', t0 + 18000);
    expect(at18s.length).toBe(1);
    expect(at18s[0].playerName).toBe('ENEMY YELLOW');
    expect(at18s[0].lastSeenCallout).toBe('Palace');
    expect(at18s[0].elapsedSeconds).toBe(18);
    expect(at18s[0].source).toBe('Teammate callout');

    // Once expired (+30.5s), old observations never appear as current facts
    const at31s = memory.getLastKnownOverlayAnnotations('T', t0 + 30500);
    expect(at31s.length).toBe(0);
  });

  it('3.3: respects user module toggle to disable Last Known Information Overlay', () => {
    memory.recordObservation({
      type: 'POSITION_REPORT',
      timestamp: t0,
      roundId: 4,
      map: 'de_mirage',
      source: 'GSI_TELEMETRY',
      playerIdentity: { name: 'ENEMY GREEN', team: 'T', slot: 4 },
      location: { callout: 'Window' },
      confidence: 'CONFIRMED',
    });

    memory.setLastKnownOverlayEnabled(false);
    expect(memory.isLastKnownOverlayEnabled()).toBe(false);
    expect(memory.getLastKnownOverlayAnnotations('T', t0 + 1000)).toEqual([]);
  });
});
