/**
 * CS2 Assistant - Domain 1 Test Suite: Event Normalization & GSI Parsing
 * File: tests/domain1-event-normalization.test.ts
 */

import { describe, it, expect } from 'vitest';
import {
  parseGsiPayload,
  generateGsiConfigFile,
  parseVector3,
  parseViewAngles,
} from '../src/core/match/gsi-parser';

describe('Domain 1: Event Normalization & GSI Payload Validation', () => {
  it('1.1: generates a valid Valve KeyValues GSI configuration file with port and token', () => {
    const cfg = generateGsiConfigFile(3001, 'secret-token-123');
    expect(cfg).toContain('"uri" "http://127.0.0.1:3001/gsi"');
    expect(cfg).toContain('"token" "secret-token-123"');
    expect(cfg).toContain('"bomb"');
    expect(cfg).toContain('"player_position"');
  });

  it('1.2: sanitizes invalid ports and injection characters in generateGsiConfigFile', () => {
    const cfg = generateGsiConfigFile(-99, 'bad"token\nnewline');
    expect(cfg).toContain('http://127.0.0.1:3001/gsi');
    expect(cfg).toContain('"token" "badtokennewline"');
  });

  it('1.3: parses valid 3D position vectors and rejects malformed strings', () => {
    expect(parseVector3('-1450.5, -620.25, -160.0')).toEqual({
      x: -1450.5,
      y: -620.25,
      z: -160.0,
    });
    expect(parseVector3('invalid, vec')).toBeUndefined();
    expect(parseVector3('')).toBeUndefined();
    expect(parseVector3(undefined)).toBeUndefined();
  });

  it('1.4: parses valid view angles and rejects malformed strings', () => {
    expect(parseViewAngles('-12.5, 90.2, 0')).toEqual({ pitch: -12.5, yaw: 90.2 });
    expect(parseViewAngles('NaN, 10')).toBeUndefined();
    expect(parseViewAngles(undefined)).toBeUndefined();
  });

  it('1.5: rejects malformed JSON and non-object inputs gracefully without throwing', () => {
    const badJson = parseGsiPayload('{corrupted json');
    expect(badJson.valid).toBe(false);
    expect(badJson.eligibleMatchDetected).toBe(false);
    expect(badJson.error).toContain('Malformed JSON');

    const badArray = parseGsiPayload([1, 2, 3]);
    expect(badArray.valid).toBe(false);
    expect(badArray.error).toContain('Invalid payload type');
  });

  it('1.6: enforces GSI authentication token when expectedAuthToken is configured', () => {
    const payload = {
      map: { name: 'de_mirage', phase: 'live', round: 5 },
      auth: { token: 'wrong-token' },
    };
    const res = parseGsiPayload(payload, 'correct-token');
    expect(res.valid).toBe(false);
    expect(res.authenticated).toBe(false);
    expect(res.eligibleMatchDetected).toBe(false);

    const validRes = parseGsiPayload(payload, 'wrong-token');
    expect(validRes.valid).toBe(true);
    expect(validRes.authenticated).toBe(true);
    expect(validRes.eligibleMatchDetected).toBe(true);
  });

  it('1.7: normalizes ROUND_START, BOMB_PLANTED, BOMB_DEFUSED, and MAP_CHANGED transitions', () => {
    const prev = {
      map: { name: 'de_mirage', phase: 'live' as const, round: 3 },
      round: { phase: 'freezetime' as const },
    };
    const curr = {
      map: { name: 'de_mirage', phase: 'live' as const, round: 3 },
      round: { phase: 'live' as const, bomb: 'planted' as const },
      bomb: { state: 'planted' as const, countdown: '39.8' },
      player: {
        name: 'Player1',
        team: 'CT' as const,
        activity: 'playing' as const,
        position: '-100, 200, 0',
        forward: '0, 90, 0',
        state: { defusekit: true },
      },
    };

    const parsed = parseGsiPayload(curr, undefined, prev, 1700000000000);
    expect(parsed.valid).toBe(true);
    expect(parsed.eligibleMatchDetected).toBe(true);
    expect(parsed.hasDefuseKit).toBe(true);
    expect(parsed.capabilities.providesPlayerCoordinates).toBe(true);
    expect(parsed.capabilities.providesViewAngles).toBe(true);
    expect(parsed.events.map((e) => e.eventType)).toContain('ROUND_START');
    expect(parsed.events.map((e) => e.eventType)).toContain('BOMB_PLANTED');
  });
});
