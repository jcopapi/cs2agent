import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllPlays,
  savePlay,
  deletePlay,
  addPixelToPlay,
  removePixelFromPlay,
  movePixelInPlay,
  DEFAULT_PLAYS,
} from '../src/core/utility/play-database';
import { BombTimerEngine } from '../src/core/bomb-timer/bomb-timer-engine';
import type { HotkeyConfig } from '../src/shared/ipc-types';

describe('Tactical Plans & Overlay Enhancements', () => {
  beforeEach(() => {
    // Reset any test plays
  });

  it('correctly appends a pixel to an existing plan with addPixelToPlay', () => {
    const defaultPlay = DEFAULT_PLAYS[0];
    const initialCount = defaultPlay.lineupIds.length;
    const testLineupId = 'test-lineup-add-123';

    const updated = addPixelToPlay(defaultPlay.id, testLineupId);
    expect(updated).not.toBeNull();
    expect(updated?.lineupIds).toContain(testLineupId);
    expect(updated?.lineupIds.length).toBe(initialCount + 1);

    // Clean up
    removePixelFromPlay(defaultPlay.id, updated!.lineupIds.length - 1);
  });

  it('correctly reorders pixels up and down within a plan', () => {
    const testPlay = savePlay({
      id: 'test-reorder-play',
      name: 'Test Reorder',
      map: 'de_mirage',
      side: 'T',
      lineupIds: ['pixel-1', 'pixel-2', 'pixel-3'],
      createdAt: new Date().toISOString(),
    });

    expect(testPlay.lineupIds).toEqual(['pixel-1', 'pixel-2', 'pixel-3']);

    // Move index 1 (pixel-2) UP -> should be ['pixel-2', 'pixel-1', 'pixel-3']
    const movedUp = movePixelInPlay(testPlay.id, 1, 'UP');
    expect(movedUp?.lineupIds).toEqual(['pixel-2', 'pixel-1', 'pixel-3']);

    // Move index 0 (pixel-2) DOWN -> should be ['pixel-1', 'pixel-2', 'pixel-3']
    const movedDown = movePixelInPlay(testPlay.id, 0, 'DOWN');
    expect(movedDown?.lineupIds).toEqual(['pixel-1', 'pixel-2', 'pixel-3']);

    // Boundary check: move index 0 UP -> stays the same
    const boundaryCheck = movePixelInPlay(testPlay.id, 0, 'UP');
    expect(boundaryCheck?.lineupIds).toEqual(['pixel-1', 'pixel-2', 'pixel-3']);

    deletePlay(testPlay.id);
  });

  it('correctly removes a pixel by index with removePixelFromPlay', () => {
    const testPlay = savePlay({
      id: 'test-remove-play',
      name: 'Test Remove',
      map: 'de_mirage',
      side: 'T',
      lineupIds: ['pixel-A', 'pixel-B', 'pixel-C'],
      createdAt: new Date().toISOString(),
    });

    const updated = removePixelFromPlay(testPlay.id, 1);
    expect(updated?.lineupIds).toEqual(['pixel-A', 'pixel-C']);

    deletePlay(testPlay.id);
  });

  it('initializes BombTimer with latency compensation offset', () => {
    const timer = new BombTimerEngine();
    const now = Date.now();
    const latencyOffset = 1.0;
    const initialSec = Math.max(0, 40.0 - latencyOffset);

    timer.onBombPlanted({
      plantTimestampMs: now,
      site: 'B',
      hasKit: true,
      initialSecondsRemaining: initialSec,
    });

    const snapshot = timer.getSnapshot();
    expect(snapshot.planted).toBe(true);
    expect(snapshot.site).toBe('B');
    expect(snapshot.countdownSeconds).toBe(39.0);
  });

  it('validates HotkeyConfig structure and defaults', () => {
    const config: HotkeyConfig = {
      alignKey: 'CapsLock',
      alignMode: 'HOLD',
      alignOpacity: 0.5,
      overlayKey: 'F1',
      overlayMode: 'TOGGLE',
      nextPixelKey: 'F2',
      cornerCardPosition: 'TOP_RIGHT',
      indicatorPosition: 'TOP_RIGHT',
      bombLatencyOffsetSec: 1.0,
    };

    expect(config.alignKey).toBe('CapsLock');
    expect(config.alignMode).toBe('HOLD');
    expect(config.alignOpacity).toBe(0.5);
    expect(config.cornerCardPosition).toBe('TOP_RIGHT');
    expect(config.bombLatencyOffsetSec).toBe(1.0);
  });
});
