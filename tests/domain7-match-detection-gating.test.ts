/**
 * CS2 Assistant - Domain 7 Test Suite: Match Detection, Bomb Timer & HUD Priority Arbitrage
 * File: tests/domain7-match-detection-gating.test.ts
 */

import { describe, it, expect } from 'vitest';
import { parseGsiPayload } from '../src/core/match/gsi-parser';
import { BombTimerEngine } from '../src/core/bomb-timer/bomb-timer-engine';
import { HudPriorityManager } from '../src/core/hud-manager/priority-manager';
import { CapabilityGate } from '../src/core/compliance/capability-gate';

describe('Domain 7: Match Detection, Bomb Timer Synchronization & HUD Priority Arbitrage', () => {
  it('7.1: marks match as inactive/ineligible when player is in main menu or no map is loaded', () => {
    const menuPayload = {
      player: { activity: 'menu' as const },
    };
    const res = parseGsiPayload(menuPayload);
    expect(res.valid).toBe(true);
    expect(res.eligibleMatchDetected).toBe(false);
    expect(res.capabilities.sourceType).toBe('DISCONNECTED');
  });

  it('7.2: synchronizes BombTimerEngine on verified plant event, compensates latency, and evaluates kit thresholds', () => {
    const bomb = new BombTimerEngine();
    const snapStart = bomb.onBombPlanted({
      plantTimestampMs: 1700000000000,
      latencyOffsetMs: 200, // 0.2s GSI network latency
      site: 'A',
      hasKit: false,
    });

    expect(snapStart.planted).toBe(true);
    expect(snapStart.countdownSeconds).toBeCloseTo(39.8, 1);
    expect(snapStart.urgencyStage).toBe('GREEN');
    expect(snapStart.canDefuse).toBe(true);

    // Tick down 31.8 seconds -> 8.0s remaining (No kit requires 10s -> canDefuse false, stage RED)
    const snap8s = bomb.tick(31.8);
    expect(snap8s.countdownSeconds).toBeCloseTo(8.0, 1);
    expect(snap8s.urgencyStage).toBe('RED');
    expect(snap8s.canDefuse).toBe(false);

    // Equip defuse kit (5s required) -> canDefuse becomes true at 8.0s
    bomb.setKitEquipped(true);
    expect(bomb.getSnapshot().canDefuse).toBe(true);

    // Clear on defusal/round end
    bomb.clear();
    expect(bomb.getSnapshot().planted).toBe(false);
    expect(bomb.getSnapshot().urgencyStage).toBe('CLEARED');
  });

  it('7.3: labels BombTimerEngine output as estimate (~00:XX (EST)) when exact timing is unreliable', () => {
    const bomb = new BombTimerEngine();
    const snap = bomb.onBombPlanted({
      initialSecondsRemaining: 24,
      isEstimate: true,
    });
    expect(snap.isEstimate).toBe(true);
    expect(snap.formattedDisplay).toContain('~00:24 (EST)');
  });

  it('7.4: arbitrates HUD priorities (CRITICAL suppresses PASSIVE globally and preempts same-region lower priority)', () => {
    const gate = new CapabilityGate('SIMULATION_PREVIEW');
    const hud = new HudPriorityManager({ width: 1920, height: 1080 }, gate);
    const now = 1700000000000;

    // Register PASSIVE panel in safe lateral shelf
    hud.registerPanel(
      {
        id: 'passive-status',
        module: 'STATUS',
        priority: 'PASSIVE',
        placement: 'TOP_LEFT_BELOW_RADAR',
        bounds: { x: 40, y: 400, width: 200, height: 60 },
      },
      now
    );

    // Register CONTEXTUAL panel in MID_RIGHT_COMPACT
    hud.registerPanel(
      {
        id: 'ctx-lineup',
        module: 'LINEUP',
        priority: 'CONTEXTUAL',
        placement: 'MID_RIGHT_COMPACT',
        bounds: { x: 1550, y: 400, width: 250, height: 100 },
      },
      now
    );

    // Register CRITICAL panel in MID_RIGHT_COMPACT (same region as ctx-lineup)
    hud.registerPanel(
      {
        id: 'crit-bomb',
        module: 'BOMB_TIMER',
        priority: 'CRITICAL',
        placement: 'MID_RIGHT_COMPACT',
        bounds: { x: 1550, y: 400, width: 250, height: 80 },
      },
      now
    );

    const evaluated = hud.evaluateVisiblePanels(now + 100);
    const crit = evaluated.find((p) => p.id === 'crit-bomb')!;
    const ctx = evaluated.find((p) => p.id === 'ctx-lineup')!;
    const passive = evaluated.find((p) => p.id === 'passive-status')!;

    expect(crit.visible).toBe(true);
    expect(ctx.visible).toBe(false);
    expect(ctx.suppressedBy).toBe('crit-bomb');
    expect(passive.visible).toBe(false);
    expect(passive.suppressedBy).toBe('crit-bomb');
  });
});
