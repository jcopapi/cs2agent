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
  {
    id: 'play-nuke-outside-take',
    name: 'Outside Wall of Smokes',
    map: 'de_nuke',
    side: 'T',
    description: 'Cross smokes sealing Garage and Secret sightlines for fast lower bombsite take',
    lineupIds: [
      'lineup-nuke-outside-cross-close',
      'lineup-nuke-outside-cross-far',
      'lineup-nuke-garage-smoke',
    ],
    createdAt: '2026-10-20T00:00:00Z',
  },
  {
    id: 'play-ancient-a-split',
    name: 'A Site Split & Donut',
    map: 'de_ancient',
    side: 'T',
    description: 'Smokes Donut and Main cross while isolating temple and CT crossfires',
    lineupIds: [
      'lineup-ancient-donut-smoke',
      'lineup-ancient-a-temple-smoke',
      'lineup-ancient-b-cave-smoke',
    ],
    createdAt: '2026-10-20T00:00:00Z',
  },
  {
    id: 'play-anubis-b-execute',
    name: 'B Site Execute & Connector',
    map: 'de_anubis',
    side: 'T',
    description: 'Connector and Heaven smokes with Mid house control for effortless B site plant',
    lineupIds: [
      'lineup-anubis-b-connector-smoke',
      'lineup-anubis-a-heaven-smoke',
      'lineup-anubis-mid-house-smoke',
    ],
    createdAt: '2026-10-20T00:00:00Z',
  },
];

const STORAGE_KEY = 'cs2_assistant_custom_plays_v1';
const DELETED_PLAYS_KEY = 'cs2_assistant_deleted_plays_v1';
const ACTIVE_QUEUE_KEY = 'cs2_assistant_active_queue_v1';

function getLocalStorage(): { getItem(k: string): string | null; setItem(k: string, v: string): void } | null {
  if (typeof globalThis !== 'undefined' && 'localStorage' in (globalThis as Record<string, unknown>)) {
    return (globalThis as unknown as { localStorage: { getItem(k: string): string | null; setItem(k: string, v: string): void } }).localStorage;
  }
  return null;
}

function getDeletedPlayIds(): Set<string> {
  const storage = getLocalStorage();
  if (!storage) return new Set();
  try {
    const raw = storage.getItem(DELETED_PLAYS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function markPlayDeleted(id: string): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    const deleted = getDeletedPlayIds();
    deleted.add(id);
    storage.setItem(DELETED_PLAYS_KEY, JSON.stringify(Array.from(deleted)));
  } catch {}
}

function getStoredPlays(): Play[] {
  const storage = getLocalStorage();
  if (!storage) {
    return [...DEFAULT_PLAYS];
  }
  const deletedIds = getDeletedPlayIds();
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PLAYS.filter((d) => !deletedIds.has(d.id));
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Merge with default plays that haven't been deleted
      const customIds = new Set(parsed.map((p: Play) => p.id));
      const missingDefaults = DEFAULT_PLAYS.filter((d) => !customIds.has(d.id) && !deletedIds.has(d.id));
      return [...parsed, ...missingDefaults];
    }
  } catch (err) {
    console.warn('[PlayDatabase] Failed to read plays from localStorage:', err);
  }
  return DEFAULT_PLAYS.filter((d) => !deletedIds.has(d.id));
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
  markPlayDeleted(id);
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

export function addPixelToPlay(playId: string, lineupId: string): Play | null {
  const play = getPlayById(playId);
  if (!play) return null;
  play.lineupIds = [...(play.lineupIds || []), lineupId];
  return savePlay(play);
}

export function removePixelFromPlay(playId: string, index: number): Play | null {
  const play = getPlayById(playId);
  if (!play || !play.lineupIds) return null;
  const next = [...play.lineupIds];
  next.splice(index, 1);
  play.lineupIds = next;
  return savePlay(play);
}

export function movePixelInPlay(playId: string, index: number, direction: 'UP' | 'DOWN'): Play | null {
  const play = getPlayById(playId);
  if (!play || !play.lineupIds) return null;
  const targetIndex = direction === 'UP' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= play.lineupIds.length) return play;
  const next = [...play.lineupIds];
  const item = next[index];
  next[index] = next[targetIndex];
  next[targetIndex] = item;
  play.lineupIds = next;
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

export function exportPlayToCode(play: Play): string {
  const payload = {
    n: play.name,
    m: play.map,
    s: play.side,
    d: play.description || '',
    l: play.lineupIds || [],
  };
  const jsonStr = JSON.stringify(payload);
  let b64: string;
  if (typeof Buffer !== 'undefined') {
    b64 = Buffer.from(jsonStr, 'utf8').toString('base64');
  } else {
    b64 = btoa(unescape(encodeURIComponent(jsonStr)));
  }
  return `JCO-${b64}`;
}

export function importPlayFromCode(rawCode: string): Play | null {
  try {
    let clean = rawCode.trim();
    if (clean.startsWith('JCO-') || clean.startsWith('JCO:')) {
      clean = clean.slice(4);
    }
    let jsonStr: string;
    if (typeof Buffer !== 'undefined') {
      jsonStr = Buffer.from(clean, 'base64').toString('utf8');
    } else {
      jsonStr = decodeURIComponent(escape(atob(clean)));
    }
    const data = JSON.parse(jsonStr);
    if (!data.n || !Array.isArray(data.l)) {
      return null;
    }
    const newPlay: Play = {
      id: `play-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: String(data.n),
      map: (data.m as CS2Map) || 'de_mirage',
      side: data.s || 'T',
      description: data.d || 'Imported Plan',
      lineupIds: data.l,
      createdAt: new Date().toISOString(),
    };
    savePlay(newPlay);
    return newPlay;
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------------------
// In-Match Tactical Queues (Mid-Game Flexible Lineup Ordering)
// ----------------------------------------------------------------------------

export interface TacticalQueue {
  lineupIds: string[];
  activeStepIndex: number;
}

export function getActiveQueue(): TacticalQueue {
  const storage = getLocalStorage();
  if (storage) {
    try {
      const raw = storage.getItem(ACTIVE_QUEUE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.lineupIds)) return parsed;
      }
    } catch {}
  }
  const activePlay = getActivePlay();
  return {
    lineupIds: [...(activePlay?.lineupIds || [])],
    activeStepIndex: getActivePlayStepIndex(),
  };
}

export function saveActiveQueue(queue: TacticalQueue): TacticalQueue {
  const storage = getLocalStorage();
  if (storage) {
    try {
      storage.setItem(ACTIVE_QUEUE_KEY, JSON.stringify(queue));
    } catch {}
  }
  return queue;
}

export function addPixelToQueue(lineupId: string): TacticalQueue {
  const q = getActiveQueue();
  q.lineupIds.push(lineupId);
  return saveActiveQueue(q);
}

export function removePixelFromQueue(index: number): TacticalQueue {
  const q = getActiveQueue();
  if (index >= 0 && index < q.lineupIds.length) {
    q.lineupIds.splice(index, 1);
    if (q.activeStepIndex >= q.lineupIds.length) {
      q.activeStepIndex = Math.max(0, q.lineupIds.length - 1);
    }
    saveActiveQueue(q);
  }
  return q;
}

export function movePixelInQueue(index: number, direction: 'UP' | 'DOWN'): TacticalQueue {
  const q = getActiveQueue();
  const targetIndex = direction === 'UP' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= q.lineupIds.length) return q;
  const item = q.lineupIds[index];
  q.lineupIds.splice(index, 1);
  q.lineupIds.splice(targetIndex, 0, item);
  return saveActiveQueue(q);
}

export function loadPlanIntoQueue(planId: string, mode: 'REPLACE' | 'APPEND' = 'REPLACE'): TacticalQueue {
  const plan = getPlayById(planId);
  const q = getActiveQueue();
  const newIds = plan?.lineupIds || [];
  if (mode === 'REPLACE') {
    q.lineupIds = [...newIds];
    q.activeStepIndex = 0;
  } else {
    q.lineupIds = [...q.lineupIds, ...newIds];
  }
  return saveActiveQueue(q);
}

export function clearQueue(): TacticalQueue {
  const q: TacticalQueue = { lineupIds: [], activeStepIndex: 0 };
  return saveActiveQueue(q);
}
