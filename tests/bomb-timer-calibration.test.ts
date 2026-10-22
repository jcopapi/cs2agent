/**
 * CS2 Assistant - Bomb Timer Calibration Test Suite
 * File: tests/bomb-timer-calibration.test.ts
 *
 * Verifies exact C4 40.0s countdown synchronization and critical defusal cutoff thresholds:
 * - 10.0s: critical cutoff for defusal without kit
 * - 5.0s: critical cutoff for defusal with kit
 * - Exact sync without latency distortion
 */

import { describe, it, expect } from 'vitest';
import { BombTimerEngine } from '../src/core/bomb-timer/bomb-timer-engine';

describe('Bomb Timer Calibration & Cutoff Thresholds', () => {
  it('starts exactly at 40.0s upon verified plant event without negative offsets', () => {
    const engine = new BombTimerEngine();
    const snap = engine.onBombPlanted({
      plantTimestampMs: Date.now(),
      site: 'A',
      hasKit: false,
    });

    expect(snap.planted).toBe(true);
    expect(snap.countdownSeconds).toBe(40.0);
    expect(snap.site).toBe('A');
    expect(snap.urgencyStage).toBe('GREEN');
    expect(snap.canDefuse).toBe(true);
  });

  it('correctly evaluates 10.0s cutoff without defuse kit', () => {
    const engine = new BombTimerEngine();
    engine.onBombPlanted({ initialSecondsRemaining: 10.0, hasKit: false });

    // Exactly 10.0s remaining: defuse is theoretically possible
    expect(engine.canDefuseInTime()).toBe(true);

    // At 9.9s remaining: defusing without kit takes 10.0s, so it is impossible
    engine.tick(0.1);
    expect(engine.getSnapshot().countdownSeconds).toBe(9.9);
    expect(engine.canDefuseInTime()).toBe(false);
    expect(engine.getUrgencyStage()).toBe('RED');
  });

  it('correctly evaluates 5.0s cutoff with defuse kit equipped', () => {
    const engine = new BombTimerEngine();
    engine.onBombPlanted({ initialSecondsRemaining: 5.0, hasKit: true });

    // Exactly 5.0s remaining with kit: defuse is theoretically possible
    expect(engine.canDefuseInTime()).toBe(true);

    // At 4.9s remaining with kit: defusing takes 5.0s, impossible
    engine.tick(0.1);
    expect(engine.getSnapshot().countdownSeconds).toBe(4.9);
    expect(engine.canDefuseInTime()).toBe(false);
    expect(engine.getUrgencyStage()).toBe('FLASHING');
  });

  it('synchronizes directly with CS2 authoritative GSI phase_ends_in without distortion', () => {
    const engine = new BombTimerEngine();
    engine.onBombPlanted({ initialSecondsRemaining: 40.0 });

    // Authoritative GSI update arrives stating 24.3 seconds remain
    engine.syncRemainingSeconds(24.3);
    const snap = engine.getSnapshot();
    expect(snap.countdownSeconds).toBe(24.3);
    expect(snap.urgencyStage).toBe('GREEN');

    // Authoritative GSI update arrives stating 10.0 seconds remain
    engine.syncRemainingSeconds(10.0);
    expect(engine.getSnapshot().countdownSeconds).toBe(10.0);

    // Clear on defuse
    engine.clear();
    expect(engine.getSnapshot().planted).toBe(false);
    expect(engine.getSnapshot().countdownSeconds).toBe(0);
  });
});
