/**
 * CS2 Assistant - Ultra-Lightweight In-Match Overlay Center (Tactical Queues)
 * File: src/renderer/components/overlay-center/OverlayCenterView.tsx
 *
 * Dedicated in-match cockpit for managing live "Queues" and browsing pixels mid-game:
 * 1. Primary Left Tabs:
 *    - [PLANS]: Map-specific pre-made plans (Replace Queue / Add to Queue)
 *    - [ALL PIXELS]: Map pixel bank with filter/search to add any pixel on the fly
 *    - [FAVORITES]: Quick 1-click addition of favorite map lineups
 * 2. Right Panel (TACTICAL QUEUE):
 *    - Reorderable live queue of pixels (#01, #02, #03...)
 *    - Step cycling (F2), in-game pinning, clear & delete
 * 3. Hotkey status and zero-FPS-overhead architecture
 */

import React, { useState, useEffect, useMemo } from 'react';
import type { GsiStatus, Lineup, Play, CS2Map, UtilityType } from '../../../shared/ipc-types';
import {
  getAllPlays,
  TacticalQueue,
  getActiveQueue,
  addPixelToQueue,
  removePixelFromQueue,
  movePixelInQueue,
  loadPlanIntoQueue,
  clearQueue,
  saveActiveQueue,
} from '../../../core/utility/play-database';
import { getAllLineups, getLineupById, getLineupsByMap } from '../../../core/utility/lineup-database';

interface OverlayCenterViewProps {
  onOpenSettings: () => void;
  onGoToLauncher?: () => void;
}

export const OverlayCenterView: React.FC<OverlayCenterViewProps> = ({ onOpenSettings, onGoToLauncher }) => {
  const [matchStatus, setMatchStatus] = useState<GsiStatus | null>(null);
  const [plans, setPlans] = useState<Play[]>([]);
  const [activeQueue, setActiveQueueState] = useState<TacticalQueue>(() => getActiveQueue());
  const [pinnedLineup, setPinnedLineup] = useState<Lineup | null>(null);

  // Left Library Tabs & Filters
  const [libraryTab, setLibraryTab] = useState<'PLANS' | 'ALL_PIXELS' | 'FAVORITES'>('PLANS');
  const [pixelSearch, setPixelSearch] = useState<string>('');
  const [utilityFilter, setUtilityFilter] = useState<UtilityType | 'ALL'>('ALL');

  const currentMapId: CS2Map = (matchStatus?.map as CS2Map) || 'de_mirage';
  const currentMapLabel = currentMapId.replace('de_', '').toUpperCase();

  // Sync queue state to IPC in-game overlay
  const syncQueueToOverlay = (q: TacticalQueue, targetStepIndex?: number) => {
    setActiveQueueState(q);
    const stepIdx = typeof targetStepIndex === 'number' ? targetStepIndex : q.activeStepIndex;
    const pseudoPlay: Play = {
      id: 'active-match-queue',
      name: 'TACTICAL QUEUE',
      map: currentMapId,
      side: 'T',
      lineupIds: q.lineupIds,
      createdAt: new Date().toISOString(),
    };
    window.cs2Assistant?.play?.setActivePlan?.(pseudoPlay, stepIdx);

    if (q.lineupIds.length > 0 && typeof targetStepIndex === 'number') {
      const line = getLineupById(q.lineupIds[targetStepIndex]);
      if (line) {
        window.cs2Assistant?.hud.setActiveLineupPhoto(line);
        setPinnedLineup(line);
      }
    } else if (q.lineupIds.length === 0) {
      window.cs2Assistant?.hud.setActiveLineupPhoto(null);
      setPinnedLineup(null);
    }
  };

  // Refresh plans & active state
  const refreshData = () => {
    setPlans(getAllPlays());
    const q = getActiveQueue();
    setActiveQueueState(q);
  };

  useEffect(() => {
    refreshData();

    const api = window.cs2Assistant;
    if (!api) return;

    api.gsi.getStatus().then((status) => {
      setMatchStatus(status);
    }).catch(() => {});

    api.hud.getActiveLineupPhoto?.().then((lineup) => {
      setPinnedLineup(lineup);
    }).catch(() => {});

    const unsubGsi = api.gsi.onStatusChange((status) => {
      setMatchStatus(status);
    });

    const unsubPhoto = api.hud.onActiveLineupPhotoChange?.((lineup) => {
      setPinnedLineup(lineup);
    });

    const unsubPlay = api.play?.onNextPixel?.((data) => {
      const current = getActiveQueue();
      if (data && typeof data.stepIndex === 'number') {
        current.activeStepIndex = data.stepIndex;
        saveActiveQueue(current);
        setActiveQueueState({ ...current });
      }
    });

    const unsubStep = api.hud?.onPlanStepChange?.((step) => {
      const current = getActiveQueue();
      if (step && typeof step.stepIndex === 'number') {
        current.activeStepIndex = step.stepIndex;
        saveActiveQueue(current);
        setActiveQueueState({ ...current });
      }
    });

    return () => {
      unsubGsi?.();
      unsubPhoto?.();
      unsubPlay?.();
      unsubStep?.();
    };
  }, []);

  // Filter plans strictly by current match map
  const mapPlans = useMemo(() => {
    return plans.filter((p) => !p.map || p.map === currentMapId);
  }, [plans, currentMapId]);

  // Filter lineups for current map
  const mapLineups = useMemo(() => {
    const all = getAllLineups().filter((l) => l.map === currentMapId);
    return all.filter((l) => {
      if (utilityFilter !== 'ALL' && l.utilityType !== utilityFilter) return false;
      if (pixelSearch.trim()) {
        const q = pixelSearch.toLowerCase();
        const mTitle = l.title.toLowerCase().includes(q);
        const mSpot = l.startPosition?.callout?.toLowerCase().includes(q);
        if (!mTitle && !mSpot) return false;
      }
      return true;
    });
  }, [currentMapId, utilityFilter, pixelSearch]);

  const favoriteLineups = useMemo(() => {
    return mapLineups.filter((l) => Boolean(l.favorite));
  }, [mapLineups]);

  // Queue actions
  const handleLoadPlanToQueue = (planId: string, mode: 'REPLACE' | 'APPEND') => {
    const updated = loadPlanIntoQueue(planId, mode);
    syncQueueToOverlay(updated, 0);
  };

  const handleAddPixel = (lineupId: string) => {
    const updated = addPixelToQueue(lineupId);
    syncQueueToOverlay(updated);
  };

  const handleRemovePixel = (idx: number) => {
    const updated = removePixelFromQueue(idx);
    syncQueueToOverlay(updated);
  };

  const handleMovePixel = (idx: number, dir: 'UP' | 'DOWN') => {
    const updated = movePixelInQueue(idx, dir);
    syncQueueToOverlay(updated);
  };

  const handleClearQueue = () => {
    const updated = clearQueue();
    syncQueueToOverlay(updated);
  };

  const handlePinQueueStep = (idx: number) => {
    const q = getActiveQueue();
    q.activeStepIndex = idx;
    saveActiveQueue(q);
    syncQueueToOverlay(q, idx);
  };

  const handleUnpin = () => {
    window.cs2Assistant?.hud.setActiveLineupPhoto(null);
    setPinnedLineup(null);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#09090b] text-[#f4f4f5] font-mono select-none overflow-hidden p-4">
      {/* Top Bar: Minimal Map Indicator, Queue Counter & Navigation */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-black tracking-widest text-zinc-100 uppercase">
            [{currentMapLabel}]
          </span>
          <span className="text-[10px] font-bold text-cyan-400 border border-cyan-800 bg-cyan-950/70 px-2 py-0.5">
            QUEUE: {activeQueue.lineupIds.length} PIXELS
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onGoToLauncher && (
            <button
              onClick={onGoToLauncher}
              title="Return to Main Launcher to add plans / browse pixels"
              className="flex items-center gap-1.5 border border-zinc-700 bg-black/80 px-2.5 py-1 text-xs text-zinc-300 hover:text-cyan-300 hover:border-cyan-500 transition-colors"
            >
              <span>←</span>
              <span className="font-bold text-[10px] tracking-wide uppercase">LAUNCHER / PIXELS</span>
            </button>
          )}

          <button
            onClick={onOpenSettings}
            title="Settings"
            className="p-1.5 text-zinc-400 hover:text-cyan-300 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Split Cockpit: Left (Library: Plans / Pixels / Favs) | Right (Active Queue) */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 overflow-hidden">
        {/* ==================================================================== */}
        {/* LEFT COLUMN: LIBRARY (PLANS / ALL PIXELS / FAVORITES)                 */}
        {/* ==================================================================== */}
        <div className="flex flex-col border border-zinc-800 bg-[#0c0c0e] p-3 gap-2 overflow-hidden">
          {/* Sub-Tabs: PLANS (Main) / ALL PIXELS / FAVORITES */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 shrink-0">
            <div className="flex items-center gap-1 border border-zinc-800 bg-black p-0.5">
              <button
                onClick={() => setLibraryTab('PLANS')}
                className={`px-3 py-1 text-xs font-bold transition-colors ${
                  libraryTab === 'PLANS'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                PLANS ({mapPlans.length})
              </button>
              <button
                onClick={() => setLibraryTab('ALL_PIXELS')}
                className={`px-3 py-1 text-xs font-bold transition-colors ${
                  libraryTab === 'ALL_PIXELS'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                ALL PIXELS ({mapLineups.length})
              </button>
              <button
                onClick={() => setLibraryTab('FAVORITES')}
                className={`px-3 py-1 text-xs font-bold transition-colors ${
                  libraryTab === 'FAVORITES'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                ★ FAVS ({favoriteLineups.length})
              </button>
            </div>
          </div>

          {/* Search & Utility Filter (for Pixels & Favs tabs) */}
          {libraryTab !== 'PLANS' && (
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={pixelSearch}
                onChange={(e) => setPixelSearch(e.target.value)}
                placeholder="SEARCH PIXEL..."
                className="flex-1 bg-black border border-zinc-800 text-xs px-2.5 py-1 text-zinc-200 outline-none focus:border-cyan-500"
              />
              <div className="flex items-center border border-zinc-800 bg-black">
                {(['ALL', 'SMOKE', 'FLASHBANG', 'MOLOTOV'] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUtilityFilter(u)}
                    className={`px-1.5 py-0.5 text-[9px] font-bold ${
                      utilityFilter === u ? 'bg-cyan-950 text-cyan-300' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {u === 'ALL' ? 'ALL' : u === 'FLASHBANG' ? 'FLASH' : u === 'MOLOTOV' ? 'MOLY' : u}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 1: PLANS (Primary Category) */}
          {libraryTab === 'PLANS' && (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {mapPlans.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 border border-zinc-800 bg-black/60 hover:border-zinc-700 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex flex-col truncate flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-bold text-zinc-100 truncate">{p.name}</span>
                      <span className="text-[10px] text-cyan-400 font-bold tabular-nums">
                        [{p.lineupIds?.length || 0}]
                      </span>
                    </div>
                    {p.description && (
                      <span className="text-[10px] text-zinc-500 truncate">{p.description}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleLoadPlanToQueue(p.id, 'REPLACE')}
                      title="Replace current queue with this plan"
                      className="px-2 py-1 text-[9px] font-bold border border-cyan-700 bg-cyan-950/80 text-cyan-300 hover:bg-cyan-900 transition-colors"
                    >
                      LOAD QUEUE
                    </button>
                    <button
                      onClick={() => handleLoadPlanToQueue(p.id, 'APPEND')}
                      title="Append pixels from this plan to current queue"
                      className="px-2 py-1 text-[9px] font-bold border border-zinc-700 bg-black text-zinc-300 hover:border-cyan-500 hover:text-cyan-300 transition-colors"
                    >
                      + ADD
                    </button>
                  </div>
                </div>
              ))}

              {mapPlans.length === 0 && (
                <div className="h-full flex items-center justify-center text-zinc-600 text-xs">
                  NO PLANS FOR {currentMapLabel}
                </div>
              )}
            </div>
          )}

          {/* TAB 2 & 3: ALL PIXELS & FAVORITES */}
          {libraryTab !== 'PLANS' && (
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {(libraryTab === 'ALL_PIXELS' ? mapLineups : favoriteLineups).map((lineup) => (
                <div
                  key={lineup.id}
                  className="p-2 border border-zinc-800 bg-black/50 hover:border-zinc-700 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                    <div className="w-10 h-7 bg-zinc-900 border border-zinc-800 rounded shrink-0 overflow-hidden">
                      <img
                        src={lineup.imageUrl || lineup.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="font-bold text-zinc-200 truncate text-[11px]">{lineup.title}</span>
                      <span className="text-[9px] text-zinc-500 truncate">
                        {lineup.utilityType} • {lineup.startPosition?.callout || 'Spot'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleAddPixel(lineup.id)}
                      title="Add to Tactical Queue"
                      className="px-2 py-0.5 text-[9px] font-bold border border-cyan-800 bg-cyan-950 text-cyan-300 hover:bg-cyan-900 transition-colors"
                    >
                      + QUEUE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* RIGHT COLUMN: ACTIVE TACTICAL QUEUE (IN-GAME LIVE SEQUENCER)         */}
        {/* ==================================================================== */}
        <div className="flex flex-col border border-zinc-800 bg-[#0c0c0e] p-3 gap-2 overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 shrink-0">
            <div className="flex items-center gap-2 truncate">
              <span className="text-xs font-black text-cyan-400 tracking-wider uppercase">
                // TACTICAL QUEUE
              </span>
              <span className="text-[9px] font-black tracking-widest text-emerald-400 border border-emerald-800 bg-emerald-950 px-1.5 py-0.2">
                ● LIVE F2 SYNC
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {pinnedLineup && (
                <button
                  onClick={handleUnpin}
                  className="text-[9px] border border-rose-900 bg-rose-950/50 text-rose-300 px-2 py-0.5 hover:bg-rose-900 transition-colors"
                >
                  UNPIN
                </button>
              )}
              {activeQueue.lineupIds.length > 0 && (
                <button
                  onClick={handleClearQueue}
                  className="text-[9px] border border-zinc-700 bg-black text-zinc-400 hover:text-rose-400 hover:border-rose-900 px-2 py-0.5 transition-colors"
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>

          {/* Queue Items List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {activeQueue.lineupIds.map((lineupId, idx) => {
              const lineup = getLineupById(lineupId);
              if (!lineup) return null;
              const isPinned = pinnedLineup?.id === lineup.id;
              const isCurrentStep = idx === activeQueue.activeStepIndex;

              return (
                <div
                  key={`${lineupId}-${idx}`}
                  onClick={() => handlePinQueueStep(idx)}
                  className={`cursor-pointer p-2 border transition-all flex items-center justify-between gap-2 ${
                    isPinned
                      ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                      : isCurrentStep
                      ? 'border-cyan-700 bg-cyan-950/20'
                      : 'border-zinc-800 bg-black/50 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-zinc-500 tabular-nums">
                      #{String(idx + 1).padStart(2, '0')}
                    </span>

                    <div className="w-10 h-7 bg-zinc-900 border border-zinc-800 rounded shrink-0 overflow-hidden flex items-center justify-center">
                      <img
                        src={lineup.imageUrl || lineup.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col truncate">
                      <span className={`text-xs font-bold truncate ${isPinned ? 'text-cyan-300' : 'text-zinc-200'}`}>
                        {lineup.title}
                      </span>
                      <span className="text-[9px] text-zinc-500 truncate">
                        {lineup.throwType} • {lineup.startPosition?.callout || 'Spot'}
                      </span>
                    </div>
                  </div>

                  {/* Ordering (▲ / ▼), Pin Indicator, and Remove (✕) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMovePixel(idx, 'UP');
                      }}
                      className="p-0.5 text-zinc-500 hover:text-zinc-200 disabled:opacity-20 text-[10px]"
                    >
                      ▲
                    </button>
                    <button
                      disabled={idx === activeQueue.lineupIds.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMovePixel(idx, 'DOWN');
                      }}
                      className="p-0.5 text-zinc-500 hover:text-zinc-200 disabled:opacity-20 text-[10px]"
                    >
                      ▼
                    </button>

                    {isPinned ? (
                      <span className="text-[8px] font-black tracking-wider text-cyan-400 border border-cyan-800 bg-cyan-950 px-1.5 py-0.2">
                        PINNED
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePinQueueStep(idx);
                        }}
                        className="text-[9px] font-bold text-zinc-400 border border-zinc-800 px-1.5 py-0.2 hover:text-cyan-300 hover:border-cyan-500"
                      >
                        PIN
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePixel(idx);
                      }}
                      title="Remove from Queue"
                      className="p-0.5 text-zinc-500 hover:text-rose-400 text-xs ml-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}

            {activeQueue.lineupIds.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-xs gap-1">
                <span>TACTICAL QUEUE IS EMPTY</span>
                <span className="text-[9px] text-zinc-700">
                  Select a Plan on the left or add Pixels directly from the library
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Hotkey Reminder Bar */}
      <div className="flex items-center justify-between border-t border-zinc-800 pt-3 mt-3 text-[10px] text-zinc-500">
        <div className="flex items-center gap-4">
          <span>HOLD <strong className="text-zinc-300">[CAPSLOCK]</strong>: ALIGN CROSSHAIR</span>
          <span>PRESS <strong className="text-zinc-300">[F1]</strong>: CORNER OVERLAY</span>
          <span>PRESS <strong className="text-cyan-400">[F2]</strong>: NEXT PIXEL IN QUEUE</span>
        </div>
        <div className="text-[9px] text-zinc-600">
          ZERO BACKGROUND OVERHEAD // 100% NATIVE CS2 FPS
        </div>
      </div>
    </div>
  );
};

export default OverlayCenterView;