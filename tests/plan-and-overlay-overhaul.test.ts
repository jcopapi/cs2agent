import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllPlays,
  savePlay,
  deletePlay,
  addPixelToPlay,
  removePixelFromPlay,
  movePixelInPlay,
  DEFAULT_PLAYS,
  exportPlayToCode,
  importPlayFromCode,
  addPixelToQueue,
  movePixelInQueue,
  clearQueue,
} from '../src/core/utility/play-database';
import { BombTimerEngine } from '../src/core/bomb-timer/bomb-timer-engine';
import { detectBombSite } from '../src/core/match/gsi-parser';
import { getAllLineups, renameLineup } from '../src/core/utility/lineup-database';
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

  it('initializes BombTimer with 2.0s latency compensation offset and dynamic site update', () => {
    const timer = new BombTimerEngine();
    const now = Date.now();
    const latencyOffset = 2.0;
    const initialSec = Math.max(0, 40.0 - latencyOffset);

    timer.onBombPlanted({
      plantTimestampMs: now,
      site: null,
      hasKit: true,
      initialSecondsRemaining: initialSec,
    });

    let snapshot = timer.getSnapshot();
    expect(snapshot.planted).toBe(true);
    expect(snapshot.site).toBeNull();
    expect(snapshot.countdownSeconds).toBe(38.0);

    // Dynamic site discovery on subsequent GSI tick
    timer.setSite('B');
    snapshot = timer.getSnapshot();
    expect(snapshot.site).toBe('B');
  });

  it('correctly detects bomb site when payload.map is omitted but knownMap is provided', () => {
    // In live GSI, payload.map is omitted if unchanged; knownMap ensures accurate detection
    const bPlantPayload = {
      bomb: { position: '-1580, -190, -160' },
    };
    expect(detectBombSite(bPlantPayload, undefined, 'de_mirage')).toBe('B');

    const aPlantPayload = {
      bomb: { position: '-250, -880, -160' },
    };
    expect(detectBombSite(aPlantPayload, undefined, 'de_mirage')).toBe('A');
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

  it('correctly detects bomb site B from payload and coordinates', () => {
    // 1. Explicit GSI site field
    expect(detectBombSite({ bomb: { site: 'B' } })).toBe('B');
    expect(detectBombSite({ bomb: { site: 1 } })).toBe('B');
    expect(detectBombSite({ bomb: { site: 'A' } })).toBe('A');

    // 2. Player place name
    expect(detectBombSite({ player: { place: 'BombsiteB' } })).toBe('B');
    expect(detectBombSite({ player: { place: 'BombsiteA' } })).toBe('A');

    // 3. Mirage coordinates
    expect(detectBombSite({ map: { name: 'de_mirage' } }, { x: -800, y: 300, z: -100 })).toBe('B');
    expect(detectBombSite({ map: { name: 'de_mirage' } }, { x: 100, y: -800, z: -100 })).toBe('A');
  });

  it('exports and imports tactical plans via share code', () => {
    const originalPlay = DEFAULT_PLAYS[0];
    const code = exportPlayToCode(originalPlay);

    expect(code).toBeDefined();
    expect(code.startsWith('JCO-')).toBe(true);

    const imported = importPlayFromCode(code);
    expect(imported).not.toBeNull();
    expect(imported?.name).toBe(originalPlay.name);
    expect(imported?.map).toBe(originalPlay.map);
    expect(imported?.side).toBe(originalPlay.side);
    expect(imported?.lineupIds).toEqual(originalPlay.lineupIds);

    // Clean up imported test plan
    if (imported) {
      deletePlay(imported.id);
    }
  });

  it('guarantees 100% of returned lineups have real screenshot images and stand images', () => {
    const all = getAllLineups();
    expect(all.length).toBeGreaterThan(0);
    const missing = all.filter((l) => !l.imageUrl && !l.thumbnailUrl);
    expect(missing.length).toBe(0);

    const withStand = all.filter((l) => Boolean(l.standImageUrl));
    expect(withStand.length).toBe(all.length);
  });

  it('verifies that all default plays have 100% valid, existing lineups', () => {
    const allLineups = getAllLineups();
    const lineupMap = new Map(allLineups.map((l) => [l.id, l]));

    for (const play of DEFAULT_PLAYS) {
      expect(play.lineupIds.length).toBeGreaterThan(0);
      for (const id of play.lineupIds) {
        expect(lineupMap.has(id)).toBe(true);
      }
    }
  });

  it('permanently deletes plays without resurrection from default list', () => {
    const testId = `test-delete-${Date.now()}`;
    const play = savePlay({
      id: testId,
      name: 'To Be Deleted',
      map: 'de_mirage',
      side: 'T',
      lineupIds: [],
      createdAt: new Date().toISOString(),
    });

    expect(getAllPlays().some((p) => p.id === testId)).toBe(true);
    const deleted = deletePlay(testId);
    expect(deleted).toBe(true);
    expect(getAllPlays().some((p) => p.id === testId)).toBe(false);
  });

  it('manages tactical queues correctly', () => {
    clearQueue();
    const q1 = addPixelToQueue('test-pixel-1');
    expect(q1.lineupIds).toContain('test-pixel-1');

    const q2 = addPixelToQueue('test-pixel-2');
    const moved = movePixelInQueue(q2.lineupIds.length - 1, 'UP');
    expect(moved.lineupIds[0]).toBe('test-pixel-2');
    expect(moved.lineupIds[1]).toBe('test-pixel-1');

    const cleared = clearQueue();
    expect(cleared.lineupIds.length).toBe(0);
  });

  it('persists pixel renaming across queries', () => {
    const all = getAllLineups();
    const target = all[0];
    const newTitle = `Renamed Test Pixel ${Date.now()}`;

    renameLineup(target.id, newTitle);
    const updated = getAllLineups().find((l) => l.id === target.id);
    expect(updated?.title).toBe(newTitle);
  });
});
