/**
 * CS2 Assistant - Tactical Plays & Sequence Database
 * File: src/core/utility/play-database.ts
 *
 * Implements persistent storage, ordering, and management of "Plays" (tactical sequences of pixels).
 */

import type { Play, CS2Map } from '../../shared/ipc-types';

export const DEFAULT_PLAYS: Play[] = [
  {
    id: 'play-mirage-a-execute',
    name: 'A Site Full Execute',
    map: 'de_mirage',
    side: 'T',
    description: 'Classic 3-smoke wall covering Stairs, Jungle, and CT Spawn with A Ramp flash',
    lineupIds: [
      'lineup-mirage-a-stairs',
      'lineup-mirage-a-jungle',
      'lineup-mirage-a-ct-box',
      'lineup-mirage-a-retake-flash',
    ],
    createdAt: '2026-10-20T00:00:00Z',
  },
  {
    id: 'play-mirage-mid-control',
    name: 'Mid Take & B Split',
    map: 'de_mirage',
    side: 'T',
    description: 'Instant Window & Top Mid smokes to isolate sniper angles and split Catwalk',
    lineupIds: [
      'lineup-mirage-mid-window',
      'lineup-mirage-b-short',
      'lineup-mirage-connector-from-spawn',
    ],
    createdAt: '2026-10-20T00:00:00Z',
  },
  {
    id: 'play-inferno-banana-control',
    name: 'Banana Aggression & B Take',
    map: 'de_inferno',
    side: 'T',
    description: 'Clears Car and deep Banana, then isolates Coffins and CT Spawn for fast plant',
    lineupIds: [
      'lineup-inferno-banana-flash',
      'lineup-inferno-b-coffins',
      'lineup-inferno-b-ct-smoke',
      'lineup-inferno-banana-deep-ct-moly',
    ],
    createdAt: '2026-10-20T00:00:00Z',
  },
  {
    id: 'play-dust2-a-long-take',
    name: 'Long A Take & Cross',
    map: 'de_dust2',
    side: 'T',
    description: 'Flushes Pit and Long corner, smoking off CT Spawn with zero-gap crossing',
    lineupIds: [
      'lineup-dust2-long-corner-flash',
      'lineup-dust2-long-corner-smoke',
      'lineup-dust2-ct-cross-smoke',
    ],
    createdAt: '2026-10-20T00:00:00Z',
  },
];

const STORAGE_KEY = 'cs2_assistant_custom_plays_v1';

function getLocalStorage(): { getItem(k: string): string | null; setItem(k: string, v: string): void } | null {
  if (typeof globalThis !== 'undefined' && 'localStorage' in (globalThis as Record<string, unknown>)) {
    return (globalThis as unknown as { localStorage: { getItem(k: string): string | null; setItem(k: string, v: string): void } }).localStorage;
  }
  return null;
}

function getStoredPlays(): Play[] {
  const storage = getLocalStorage();
  if (!storage) {
    return [...DEFAULT_PLAYS];
  }
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_PLAYS];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge with default plays so user always has standard plays
      const customIds = new Set(parsed.map((p: Play) => p.id));
      const missingDefaults = DEFAULT_PLAYS.filter((d) => !customIds.has(d.id));
      return [...parsed, ...missingDefaults];
    }
  } catch (err) {
    console.warn('[PlayDatabase] Failed to read plays from localStorage:', err);
  }
  return [...DEFAULT_PLAYS];
}

function persistPlays(plays: Play[]): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(plays));
  } catch (err) {
    console.warn('[PlayDatabase] Failed to save plays to localStorage:', err);
  }
}

let memoryPlays: Play[] = getStoredPlays();

export function getAllPlays(): Play[] {
  memoryPlays = getStoredPlays();
  return memoryPlays.map((p) => ({ ...p }));
}

export function getPlaysByMap(map: CS2Map): Play[] {
  return getAllPlays().filter((p) => p.map === map);
}

export function getPlayById(id: string): Play | null {
  const found = getAllPlays().find((p) => p.id === id);
  return found ? { ...found } : null;
}

export function savePlay(play: Play): Play {
  const existing = getAllPlays();
  const index = existing.findIndex((p) => p.id === play.id);
  const updatedPlay: Play = {
    ...play,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    existing[index] = updatedPlay;
  } else {
    existing.unshift(updatedPlay);
  }

  persistPlays(existing);
  memoryPlays = existing;
  return updatedPlay;
}

export function deletePlay(id: string): boolean {
  const existing = getAllPlays();
  const filtered = existing.filter((p) => p.id !== id);
  if (filtered.length === existing.length) return false;
  persistPlays(filtered);
  memoryPlays = filtered;
  return true;
}

export function reorderLineups(playId: string, lineupIds: string[]): Play | null {
  const play = getPlayById(playId);
  if (!play) return null;
  play.lineupIds = [...lineupIds];
  return savePlay(play);
}

const ACTIVE_PLAY_KEY = 'cs2_assistant_active_play_id';
const ACTIVE_PLAY_STEP_KEY = 'cs2_assistant_active_play_step';

export function getActivePlayId(): string {
  const storage = getLocalStorage();
  if (!storage) {
    return DEFAULT_PLAYS[0].id;
  }
  return storage.getItem(ACTIVE_PLAY_KEY) || DEFAULT_PLAYS[0].id;
}

export function setActivePlayId(id: string): void {
  const storage = getLocalStorage();
  if (!storage) return;
  storage.setItem(ACTIVE_PLAY_KEY, id);
  storage.setItem(ACTIVE_PLAY_STEP_KEY, '0');
}

export function getActivePlay(): Play {
  const activeId = getActivePlayId();
  const found = getPlayById(activeId);
  return found || DEFAULT_PLAYS[0];
}

export function getActivePlayStepIndex(): number {
  const storage = getLocalStorage();
  if (!storage) return 0;
  const raw = storage.getItem(ACTIVE_PLAY_STEP_KEY);
  return raw ? parseInt(raw, 10) || 0 : 0;
}

export function setActivePlayStepIndex(idx: number): void {
  const storage = getLocalStorage();
  if (!storage) return;
  storage.setItem(ACTIVE_PLAY_STEP_KEY, String(idx));
}

export function advanceActivePlayStep(): { play: Play; stepIndex: number; lineupId: string | null } {
  const play = getActivePlay();
  if (!play.lineupIds || play.lineupIds.length === 0) {
    return { play, stepIndex: 0, lineupId: null };
  }
  const currentStep = getActivePlayStepIndex();
  const nextStep = (currentStep + 1) % play.lineupIds.length;
  setActivePlayStepIndex(nextStep);
  return { play, stepIndex: nextStep, lineupId: play.lineupIds[nextStep] };
}
