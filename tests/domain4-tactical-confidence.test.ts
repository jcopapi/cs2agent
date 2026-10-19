/**
 * CS2 Assistant - Domain 4 Test Suite: Tactical Confidence & Palace Killer Invariance
 * File: tests/domain4-tactical-confidence.test.ts
 *
 * Explicitly verifies Section 3.3 Critical Accuracy Example:
 * "If Player X dies at Palace and Player Y killed them, this does NOT automatically
 * mean Player Y was physically located at Palace."
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TacticalMemoryEngine } from '../src/core/match/tactical-memory';

describe('Domain 4: Tactical Confidence Classification & Palace Killer Invariance', () => {
  let memory: TacticalMemoryEngine;
  const now = 1700000000000;

  beforeEach(() => {
    memory = new TacticalMemoryEngine({ defaultTtlMs: 30000 });
  });

  it('4.1: CRITICAL INVARIANT — When Player Y kills Player X at Palace without independent sighting, Player Y is NEVER confirmed at Palace', () => {
    const result = memory.recordElimination({
      victimName: 'Player X',
      victimTeam: 'T',
      victimCallout: 'Palace',
      victimCoords: { x: -1450, y: -620, z: -160 },
      killerName: 'Player Y',
      killerTeam: 'CT',
      roundId: 11,
      map: 'de_mirage',
      timestamp: now,
    });

    // 1. Victim location at Palace is CONFIRMED
    expect(result.victimRecord.confidence).toBe('CONFIRMED');
    expect(result.victimRecord.location?.callout).toBe('Palace');
    expect(result.victimRecord.playerIdentity?.name).toBe('Player X');

    // 2. Killer identity is CONFIRMED, but killer location MUST be undefined
    expect(result.killerIdentityRecord.playerIdentity?.name).toBe('Player Y');
    expect(result.killerIdentityRecord.location).toBeUndefined();
    expect(result.killerIdentityRecord.actorLocationConfirmed).toBe(false);

    // 3. Querying confirmed player location for Player Y returns undefined (NOT 'Palace')
    expect(memory.getConfirmedPlayerLocation('Player Y', now + 500)).toBeUndefined();

    // 4. Sightline hypothesis is strictly classified as INFERRED and does not fabricate a callout coordinate
    expect(result.killerInferenceRecord).toBeDefined();
    expect(result.killerInferenceRecord?.confidence).toBe('INFERRED');
    expect(result.killerInferenceRecord?.location).toBeUndefined();
    expect(result.killerInferenceRecord?.inferredHypothesis).toContain('Palace');

    // 5. Last-known overlay annotations for CT team must NOT show Player Y at Palace
    const ctOverlay = memory.getLastKnownOverlayAnnotations('CT', now + 500);
    expect(ctOverlay.find((a) => a.playerName === 'Player Y')).toBeUndefined();
  });

  it('4.2: confirms killer location ONLY when independently observed at a verified callout', () => {
    const result = memory.recordElimination({
      victimName: 'Player X',
      victimTeam: 'T',
      victimCallout: 'Palace',
      killerName: 'Player Y',
      killerTeam: 'CT',
      killerIndependentlyObservedCallout: 'Stairs',
      roundId: 11,
      map: 'de_mirage',
      timestamp: now,
    });

    expect(result.killerIdentityRecord.location?.callout).toBe('Stairs');
    expect(result.killerIdentityRecord.actorLocationConfirmed).toBe(true);
    expect(memory.getConfirmedPlayerLocation('Player Y', now + 500)).toBe('Stairs');
  });
});
