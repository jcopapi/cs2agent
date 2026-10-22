/**
 * CS2 Assistant - In-Match Overlay Manager (Stitch UI Overhaul)
 * File: src/renderer/components/overlay-center/OverlayCenterView.tsx
 *
 * Implements the Google Stitch Overlay Manager aesthetic:
 * - Top Header: Map & Queue status, Settings, Window actions (no manual cross-navigation button)
 * - On-Demand Lazy Pixel Loading:
 *   - By default, pixels are completely unloaded to preserve zero-overhead native CS2 FPS
 *   - Explicit "Carregar Pixels" option to load map lineups on-demand; can be unloaded at any time
 * - Left Column (7 Cols):
 *   - Map Selector row (Mirage, Inferno, Dust II, Nuke, Ancient, Anubis)
 *   - Unified Category Bar (Plans, All, Smokes, Flashes, Molotovs, HE) + T/CT Side Toggle
 *   - Search & Quick Filter bar
 *   - Tactical Plans Grid (with Load Queue & Add actions)
 *   - Fast Add Spot to Queue (individual utility cards with 1-click addition once loaded)
 * - Right Column (5 Cols):
 *   - In-Game Tactical Queue Cockpit
 *   - Pulsing live indicator, Clear & Reverse sequence controls
 *   - F2 / F3 Hotkey badges
 *   - Ordered Queue List with thumbnails, live step highlight, PIN indicators, and reorder controls
 */

import React, { useState, useEffect, useMemo } from 'react';
import type { GsiStatus, Lineup, Play, CS2Map, UtilityType, TeamSide } from '../../../shared/ipc-types';
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
import { getAllLineups, getLineupById } from '../../../core/utility/lineup-database';

interface OverlayCenterViewProps {
  onOpenSettings: () => void;
  onGoToLauncher?: () => void;
}

const COMPETITIVE_MAPS: { id: CS2Map; label: string }[] = [
  { id: 'de_mirage', label: 'Mirage' },
  { id: 'de_inferno', label: 'Inferno' },
  { id: 'de_dust2', label: 'Dust II' },
  { id: 'de_nuke', label: 'Nuke' },
  { id: 'de_ancient', label: 'Ancient' },
  { id: 'de_anubis', label: 'Anubis' },
];

export const OverlayCenterView: React.FC<OverlayCenterViewProps> = ({
  onOpenSettings,
}) => {
  const [matchStatus, setMatchStatus] = useState<GsiStatus | null>(null);
  const [plans, setPlans] = useState<Play[]>([]);
  const [activeQueue, setActiveQueueState] = useState<TacticalQueue>(() => getActiveQueue());
  const [pinnedLineup, setPinnedLineup] = useState<Lineup | null>(null);

  // Active Map (default from GSI or manual selection)
  const [selectedMap, setSelectedMap] = useState<CS2Map>(() => {
    return (matchStatus?.map as CS2Map) || 'de_mirage';
  });

  // Keep selectedMap in sync if GSI updates map
  useEffect(() => {
    if (matchStatus?.map) {
      setSelectedMap(matchStatus.map as CS2Map);
    }
  }, [matchStatus?.map]);

  // Category & Side Filters
  const [categoryTab, setCategoryTab] = useState<'PLANS' | 'ALL' | UtilityType>('PLANS');
  const [selectedSide, setSelectedSide] = useState<TeamSide | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // On-demand pixel loading state (starts unloaded as requested to preserve maximum performance)
  const [isPixelsLoaded, setIsPixelsLoaded] = useState<boolean>(false);
  const [loadedLineups, setLoadedLineups] = useState<Lineup[]>([]);

  const handleLoadPixels = () => {
    setLoadedLineups(getAllLineups());
    setIsPixelsLoaded(true);
  };

  const handleUnloadPixels = () => {
    setLoadedLineups([]);
    setIsPixelsLoaded(false);
    if (categoryTab !== 'PLANS') {
      setCategoryTab('PLANS');
    }
  };

  // Sync queue state to IPC in-game overlay
  const syncQueueToOverlay = (q: TacticalQueue, targetStepIndex?: number) => {
    setActiveQueueState(q);
    const stepIdx = typeof targetStepIndex === 'number' ? targetStepIndex : q.activeStepIndex;
    const pseudoPlay: Play = {
      id: 'active-match-queue',
      name: 'TACTICAL QUEUE',
      map: selectedMap,
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

    return () => {
      unsubGsi?.();
      unsubPhoto?.();
    };
  }, []);

  // Filter plans for selected map
  const mapPlans = useMemo(() => {
    return plans.filter((p) => {
      if (p.map && p.map !== selectedMap) return false;
      if (selectedSide !== 'ALL' && p.side && p.side !== selectedSide) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [plans, selectedMap, selectedSide, searchQuery]);

  // Filter lineups for selected map (only computed from loadedLineups)
  const mapLineups = useMemo(() => {
    if (!isPixelsLoaded) return [];
    const all = loadedLineups.filter((l) => l.map === selectedMap);
    return all.filter((l) => {
      if (categoryTab !== 'PLANS' && categoryTab !== 'ALL' && l.utilityType !== categoryTab) return false;
      if (selectedSide !== 'ALL' && l.side !== selectedSide) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTitle = l.title.toLowerCase().includes(q);
        const mSpot = l.startPosition?.callout?.toLowerCase().includes(q);
        if (!mTitle && !mSpot) return false;
      }
      return true;
    });
  }, [loadedLineups, isPixelsLoaded, selectedMap, categoryTab, selectedSide, searchQuery]);

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

  const handleReverseQueue = () => {
    const q = getActiveQueue();
    q.lineupIds.reverse();
    q.activeStepIndex = 0;
    saveActiveQueue(q);
    syncQueueToOverlay(q, 0);
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

  const activeLineup = useMemo(() => {
    if (pinnedLineup) return pinnedLineup;
    if (activeQueue.lineupIds.length > 0 && activeQueue.activeStepIndex < activeQueue.lineupIds.length) {
      return getLineupById(activeQueue.lineupIds[activeQueue.activeStepIndex]);
    }
    return null;
  }, [pinnedLineup, activeQueue, loadedLineups]);

  // Helper for utility icons and color accents
  const getUtilityMeta = (type: UtilityType) => {
    switch (type) {
      case 'SMOKE':
        return { icon: 'cloud', textClass: 'text-secondary', bgClass: 'bg-secondary' };
      case 'FLASHBANG':
        return { icon: 'flare', textClass: 'text-tertiary', bgClass: 'bg-tertiary' };
      case 'MOLOTOV':
        return { icon: 'local_fire_department', textClass: 'text-danger', bgClass: 'bg-danger' };
      case 'HE_GRENADE':
        return { icon: 'bomb', textClass: 'text-success', bgClass: 'bg-success' };
      default:
        return { icon: 'layers', textClass: 'text-primary', bgClass: 'bg-primary' };
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-surface text-text-primary antialiased select-none overflow-hidden font-sans">
      {/* ==================================================================== */}
      {/* TOP APP BAR (Stitch Design, no cross-navigation buttons)             */}
      {/* ==================================================================== */}
      <header className="h-12 w-full bg-surface-subtle/80 backdrop-blur-md border-b border-border-subtle shrink-0 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-white">
              Overlay Manager
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-container text-secondary">
              {activeQueue.lineupIds.length} IN QUEUE
            </span>
          </div>

          <div className="h-4 w-px bg-border-subtle" />

          {/* On-Demand Pixel Loading Option Pill */}
          {isPixelsLoaded ? (
            <button
              onClick={handleUnloadPixels}
              title="Clique para descarregar os pixels da memória"
              type="button"
              className="px-2.5 py-0.5 rounded-lg bg-success-soft border border-success/30 text-success text-[11px] font-mono flex items-center gap-1.5 hover:bg-danger-soft hover:text-danger hover:border-danger/30 transition-all"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span>PIXELS CARREGADOS</span>
              <span className="material-symbols-outlined text-[13px]">eject</span>
            </button>
          ) : (
            <button
              onClick={handleLoadPixels}
              title="Carregar banco de pixels na memória"
              type="button"
              className="px-2.5 py-0.5 rounded-lg bg-surface-container hover:bg-primary hover:text-surface border border-border-subtle hover:border-transparent text-text-secondary text-[11px] font-medium flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[14px] text-primary">download</span>
              <span>Carregar Pixels</span>
            </button>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {pinnedLineup && (
            <button
              onClick={handleUnpin}
              className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-danger-soft text-danger border border-danger/30 hover:bg-danger hover:text-white transition-all"
            >
              UNPIN HUD
            </button>
          )}

          <button
            onClick={() => window.open('https://github.com/jcopapi/csoverlayassistant', '_blank')}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high hover:text-white text-text-secondary text-xs font-mono transition-all border border-border-subtle"
            title="View GitHub Repository"
            type="button"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>github/jcopapi</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-7 h-7 rounded-lg hover:bg-surface-container hover:text-white flex items-center justify-center transition-colors text-text-secondary"
            title="Settings"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
          </button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* MAIN ASYMMETRIC COCKPIT (7 Cols Left / 5 Cols Right)                 */}
      {/* ==================================================================== */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-surface p-3 gap-3">
        {/* ==================================================================== */}
        {/* LEFT COLUMN: TACTICS & PRESET EXPLORER (7 Cols)                      */}
        {/* ==================================================================== */}
        <div className="lg:col-span-7 flex flex-col h-full bg-surface-container-lowest p-3 rounded-2xl border border-border-subtle gap-3 overflow-hidden shadow-sm">
          {/* Map Selector Row */}
          <div className="flex flex-wrap gap-1 p-1 bg-surface-container-low rounded-xl shrink-0">
            {COMPETITIVE_MAPS.map((m) => {
              const active = m.id === selectedMap;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMap(m.id)}
                  type="button"
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-primary text-surface font-semibold shadow-sm'
                      : 'text-text-secondary hover:text-white hover:bg-surface-container'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Unified Category & Faction Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-surface-container-low p-1.5 rounded-xl shrink-0">
            {/* Category Tabs with Plans first */}
            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => setCategoryTab('PLANS')}
                type="button"
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                  categoryTab === 'PLANS'
                    ? 'bg-surface-container-high text-primary font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-white hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">tactic</span>
                <span>Plans</span>
              </button>

              <button
                onClick={() => {
                  setCategoryTab('ALL');
                  if (!isPixelsLoaded) handleLoadPixels();
                }}
                type="button"
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                  categoryTab === 'ALL'
                    ? 'bg-surface-container-high text-white font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-white hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">apps</span>
                <span>All</span>
              </button>

              <button
                onClick={() => {
                  setCategoryTab('SMOKE');
                  if (!isPixelsLoaded) handleLoadPixels();
                }}
                type="button"
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                  categoryTab === 'SMOKE'
                    ? 'bg-surface-container-high text-secondary font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-white hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">cloud</span>
                <span>Smokes</span>
              </button>

              <button
                onClick={() => {
                  setCategoryTab('FLASHBANG');
                  if (!isPixelsLoaded) handleLoadPixels();
                }}
                type="button"
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                  categoryTab === 'FLASHBANG'
                    ? 'bg-surface-container-high text-tertiary font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-white hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">flare</span>
                <span>Flashes</span>
              </button>

              <button
                onClick={() => {
                  setCategoryTab('MOLOTOV');
                  if (!isPixelsLoaded) handleLoadPixels();
                }}
                type="button"
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                  categoryTab === 'MOLOTOV'
                    ? 'bg-surface-container-high text-danger font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-white hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
                <span>Molotovs</span>
              </button>

              <button
                onClick={() => {
                  setCategoryTab('HE_GRENADE');
                  if (!isPixelsLoaded) handleLoadPixels();
                }}
                type="button"
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                  categoryTab === 'HE_GRENADE'
                    ? 'bg-surface-container-high text-success font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-white hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">bomb</span>
                <span>HE</span>
              </button>
            </div>

            {/* Side Toggle Pill */}
            <div className="flex items-center bg-surface-container p-0.5 rounded-full">
              <button
                onClick={() => setSelectedSide(selectedSide === 'T' ? 'ALL' : 'T')}
                type="button"
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
                  selectedSide === 'T'
                    ? 'bg-tertiary text-on-tertiary font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">groups</span>
                <span>T-Side</span>
              </button>
              <button
                onClick={() => setSelectedSide(selectedSide === 'CT' ? 'ALL' : 'CT')}
                type="button"
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
                  selectedSide === 'CT'
                    ? 'bg-secondary text-surface font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">shield</span>
                <span>CT-Side</span>
              </button>
            </div>
          </div>

          {/* Search & Quick Filter Bar */}
          <div className="flex items-center justify-between gap-3 px-1 shrink-0">
            <div className="flex items-center gap-2 text-text-secondary text-xs">
              <span className="material-symbols-outlined text-[18px] text-primary">tactic</span>
              <span className="text-white font-semibold">
                {categoryTab === 'PLANS' ? 'Tactical Plans' : 'Utility Spot Bank'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container text-text-muted">
                {categoryTab === 'PLANS'
                  ? `${mapPlans.length} PRESETS`
                  : isPixelsLoaded
                  ? `${mapLineups.length} SPOTS`
                  : 'DESCARREGADO'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-xl border border-border-subtle">
              <span className="material-symbols-outlined text-text-muted text-[16px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter plans or spots..."
                className="bg-transparent text-xs text-white focus:outline-none placeholder:text-text-muted/60 w-36"
              />
            </div>
          </div>

          {/* Content Area: Plans Grid OR Lineup Spots Grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            {categoryTab === 'PLANS' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {mapPlans.map((p) => {
                  return (
                    <div
                      key={p.id}
                      className="bg-surface-container-low hover:bg-surface-container p-3 rounded-2xl border border-border-subtle hover:border-border-medium transition-all flex flex-col justify-between gap-3 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-surface transition-all shrink-0">
                            <span className="material-symbols-outlined text-[20px]">flag</span>
                          </div>
                          <div className="truncate">
                            <h3 className="text-xs font-semibold text-white truncate">{p.name}</h3>
                            <p className="text-[11px] text-text-muted truncate">
                              {p.side ? `${p.side}-Side` : 'Execute'} • {p.lineupIds?.length || 0} Lineups
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-primary shrink-0">
                          {p.lineupIds?.length || 0} Items
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        {/* Miniature Utility preview pills */}
                        <div className="flex -space-x-1 overflow-hidden">
                          {p.lineupIds?.slice(0, 4).map((lid, i) => {
                            const l = getLineupById(lid);
                            const meta = l ? getUtilityMeta(l.utilityType) : { icon: 'layers', textClass: 'text-text-muted' };
                            return (
                              <span
                                key={i}
                                className="w-5 h-5 rounded-full bg-surface-container-highest border border-border-subtle flex items-center justify-center text-[11px]"
                              >
                                <span className={`material-symbols-outlined ${meta.textClass} text-[12px]`}>
                                  {meta.icon}
                                </span>
                              </span>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleLoadPlanToQueue(p.id, 'REPLACE')}
                            title="Replace active queue"
                            type="button"
                            className="px-2.5 py-1 rounded-xl bg-surface-container-high hover:bg-primary hover:text-surface text-xs font-medium text-white transition-all flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[15px]">play_circle</span>
                            <span>Load Queue</span>
                          </button>
                          <button
                            onClick={() => handleLoadPlanToQueue(p.id, 'APPEND')}
                            title="Append to active queue"
                            type="button"
                            className="px-2 py-1 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs text-text-secondary hover:text-white transition-all"
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {mapPlans.length === 0 && (
                  <div className="col-span-2 h-40 flex flex-col items-center justify-center text-text-muted text-xs gap-1">
                    <span className="material-symbols-outlined text-[24px]">flag</span>
                    <span>No plans found for this map</span>
                  </div>
                )}
              </div>
            ) : !isPixelsLoaded ? (
              /* If user switched to pixels but hasn't loaded them yet */
              <div className="h-56 flex flex-col items-center justify-center text-text-muted text-xs gap-3 p-4">
                <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[26px]">memory</span>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold text-sm">Banco de Pixels Descarregado</div>
                  <div className="text-[11px] text-text-muted mt-1 max-w-xs">
                    Por padrão, os pixels não são mantidos na memória para garantir 0% de interferência e performance máxima durante o jogo.
                  </div>
                </div>
                <button
                  onClick={handleLoadPixels}
                  type="button"
                  className="px-4 py-2 rounded-xl bg-primary text-surface font-semibold text-xs hover:bg-primary/90 flex items-center gap-2 shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Carregar Pixels do Mapa</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {mapLineups.map((lineup) => {
                  const meta = getUtilityMeta(lineup.utilityType);
                  return (
                    <div
                      key={lineup.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low hover:bg-surface-container border border-border-subtle hover:border-border-medium transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Landing Result Photo */}
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-surface-container shrink-0 border border-border-subtle flex items-center justify-center">
                          {lineup.thumbnailUrl || lineup.resultImageUrl ? (
                            <img src={lineup.thumbnailUrl || lineup.resultImageUrl} alt="Onde Cai" className="w-full h-full object-cover" />
                          ) : (
                            <span className={`material-symbols-outlined ${meta.textClass} text-[18px]`}>
                              {meta.icon}
                            </span>
                          )}
                          <span className={`absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full ${meta.bgClass}`} />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-medium text-white truncate">{lineup.title}</div>
                          <div className="flex items-center gap-1.5 mt-0.5 truncate text-[10px]">
                            <span className="text-text-muted">From: <strong className="text-white font-medium">{lineup.startPosition?.callout || lineup.throwPosition?.callout || 'Spawn'}</strong></span>
                            <span>•</span>
                            <span className="text-primary font-medium">To: {lineup.landingArea?.callout || lineup.targetDestination?.callout || 'Target'}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddPixel(lineup.id)}
                        title="Add spot to queue"
                        type="button"
                        className="w-7 h-7 rounded-lg bg-surface-container hover:bg-primary hover:text-surface text-text-secondary flex items-center justify-center transition-all shrink-0 ml-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>
                  );
                })}

                {mapLineups.length === 0 && (
                  <div className="col-span-2 h-40 flex flex-col items-center justify-center text-text-muted text-xs gap-1">
                    <span className="material-symbols-outlined text-[24px]">filter_alt_off</span>
                    <span>No lineups match this category</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* RIGHT COLUMN: ACTIVE EXECUTION QUEUE COCKPIT (5 Cols)                */}
        {/* ==================================================================== */}
        <div className="lg:col-span-5 flex flex-col h-full bg-surface-container-lowest p-3 rounded-2xl border border-border-subtle gap-3 overflow-hidden shadow-md">
          {/* Queue Header */}
          <div className="flex flex-col gap-1 pb-2 border-b border-border-subtle shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
                <h2 className="text-sm font-semibold text-white">In-Game Queue</h2>
              </div>

              <div className="flex items-center gap-1">
                {activeQueue.lineupIds.length > 0 && (
                  <>
                    <button
                      onClick={handleReverseQueue}
                      title="Reverse sequence"
                      type="button"
                      className="w-7 h-7 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-white flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">swap_vert</span>
                    </button>
                    <button
                      onClick={handleClearQueue}
                      title="Clear queue"
                      type="button"
                      className="w-7 h-7 rounded-lg bg-surface-container hover:bg-danger-soft hover:text-danger text-text-secondary flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Hotkey Quick Indicators */}
            <div className="flex items-center gap-2 pt-1">
              <span className="px-2 py-0.5 rounded-md bg-surface-container font-mono text-[10px] text-text-muted">
                HOTKEY <strong className="text-secondary font-semibold">F2</strong> : CYCLE NEXT
              </span>
              <span className="px-2 py-0.5 rounded-md bg-surface-container font-mono text-[10px] text-text-muted">
                HOTKEY <strong className="text-white font-semibold">F1</strong> : HUD
              </span>
            </div>
          </div>

          {/* Ordered Queue List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {activeQueue.lineupIds.map((lineupId, idx) => {
              const lineup = getLineupById(lineupId);
              if (!lineup) return null;
              const isCurrent = idx === activeQueue.activeStepIndex;
              const isPinned = pinnedLineup?.id === lineup.id;
              const meta = getUtilityMeta(lineup.utilityType);
              const imgUrl = lineup.imageUrl || lineup.thumbnailUrl;

              return (
                <div
                  key={`${lineupId}-${idx}`}
                  onClick={() => handlePinQueueStep(idx)}
                  className={`p-2.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer group relative overflow-hidden ${
                    isCurrent
                      ? 'bg-surface-container border border-primary/50 shadow-md ring-1 ring-primary/30'
                      : 'bg-surface-container-low hover:bg-surface-container border border-border-subtle hover:border-border-medium'
                  }`}
                >
                  {isCurrent && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}

                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex flex-col items-center shrink-0 w-6">
                      <span className={`font-mono text-xs font-bold ${isCurrent ? 'text-primary' : 'text-text-muted'}`}>
                        #{idx + 1}
                      </span>
                      {isCurrent && (
                        <span className="font-mono text-[8px] uppercase tracking-wider text-primary">LIVE</span>
                      )}
                    </div>

                    {/* Dual Thumbnails: Mira (Aim) + Onde Cai (Landing Result) */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Aim Thumbnail */}
                      <div className="w-11 h-11 rounded-lg overflow-hidden bg-surface-container-highest shrink-0 relative border border-border-subtle flex items-center justify-center" title="Ponto de Mira">
                        {lineup.imageUrl ? (
                          <img src={lineup.imageUrl} alt="Mira" className="w-full h-full object-cover" />
                        ) : (
                          <span className={`material-symbols-outlined ${meta.textClass} text-[16px]`}>
                            {meta.icon}
                          </span>
                        )}
                        <span className="absolute bottom-0 left-0 right-0 bg-black/85 text-[7px] text-text-muted font-bold text-center leading-none py-0.5">
                          MIRA
                        </span>
                        <span className={`absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full ${meta.bgClass}`} />
                      </div>

                      {/* Landing Result Thumbnail */}
                      <div className="w-11 h-11 rounded-lg overflow-hidden bg-surface-container-highest shrink-0 relative border border-primary/40 ring-1 ring-primary/20 flex items-center justify-center" title={`Onde Cai: ${lineup.landingArea?.callout || 'Destino'}`}>
                        {lineup.thumbnailUrl || lineup.resultImageUrl ? (
                          <img src={lineup.thumbnailUrl || lineup.resultImageUrl} alt="Onde Cai" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-primary text-[16px]">location_on</span>
                        )}
                        <span className="absolute bottom-0 left-0 right-0 bg-primary/95 text-[7px] text-surface font-black text-center leading-none py-0.5">
                          ONDE CAI
                        </span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`material-symbols-outlined ${meta.textClass} text-[15px]`}>
                          {meta.icon}
                        </span>
                        <span className="text-xs font-semibold text-white truncate">{lineup.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 truncate text-[9px]">
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-surface-container-high text-text-muted truncate">
                          <span>From:</span>
                          <strong className="text-white font-medium">{lineup.startPosition?.callout || lineup.throwPosition?.callout || 'Spot'}</strong>
                        </span>
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-primary-soft text-primary font-semibold truncate">
                          <span>To:</span>
                          <span>{lineup.landingArea?.callout || lineup.targetDestination?.callout || 'Target'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row Controls: Move Up, Move Down, Pin, Remove */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMovePixel(idx, 'UP');
                      }}
                      title="Move Up"
                      type="button"
                      className="w-6 h-6 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-muted hover:text-white flex items-center justify-center disabled:opacity-20"
                    >
                      <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                    </button>
                    <button
                      disabled={idx === activeQueue.lineupIds.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMovePixel(idx, 'DOWN');
                      }}
                      title="Move Down"
                      type="button"
                      className="w-6 h-6 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-muted hover:text-white flex items-center justify-center disabled:opacity-20"
                    >
                      <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                    </button>

                    {isPinned ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-primary text-surface">
                        PINNED
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePinQueueStep(idx);
                        }}
                        title="Pin to HUD"
                        type="button"
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono text-text-muted hover:text-secondary hover:bg-surface-container"
                      >
                        PIN
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePixel(idx);
                      }}
                      title="Remove from queue"
                      type="button"
                      className="w-6 h-6 rounded-lg bg-surface-container hover:bg-danger-soft hover:text-danger text-text-muted flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {activeQueue.lineupIds.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-text-muted text-xs gap-2 py-8">
                <span className="material-symbols-outlined text-[28px] text-text-muted/60">queue_music</span>
                <span>Tactical Queue is empty</span>
                <span className="text-[10px] text-text-muted/60 text-center max-w-[220px]">
                  Select a Plan on the left or load pixels to add individual spots
                </span>
              </div>
            )}
          </div>

          {/* Active Lineup Inspection Cockpit with Large Landing Result Photo */}
          {activeLineup ? (
            <div className="p-3 rounded-2xl bg-surface-container border border-border-subtle flex flex-col gap-2 shrink-0 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-1.5 truncate">
                  <span className={`material-symbols-outlined ${getUtilityMeta(activeLineup.utilityType).textClass} text-[16px]`}>
                    {getUtilityMeta(activeLineup.utilityType).icon}
                  </span>
                  <span className="text-white truncate">{activeLineup.title}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0 text-[10px]">
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-text-muted">
                    From: <strong className="text-white">{activeLineup.startPosition?.callout || activeLineup.throwPosition?.callout || 'Spawn'}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">
                    To: {activeLineup.landingArea?.callout || activeLineup.targetDestination?.callout || 'Target'}
                  </span>
                </div>
              </div>

              {/* Side-by-Side Dual Photos: Aim View (Left) + Landing Result View (Right) */}
              <div className="grid grid-cols-2 gap-2 h-28">
                {/* Aim Point */}
                <div className="relative rounded-xl overflow-hidden bg-black border border-border-subtle flex items-center justify-center group" title="Ponto de Mira / Alinhamento">
                  {activeLineup.imageUrl ? (
                    <img
                      src={activeLineup.imageUrl}
                      alt="Posicionamento e Mira"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[11px] text-text-muted">Sem foto de mira</span>
                  )}
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-bold text-white tracking-wider">
                    1. PONTO DE MIRA
                  </div>
                </div>

                {/* Where it Lands (Landing Bloom) */}
                <div className="relative rounded-xl overflow-hidden bg-black border border-primary/40 ring-1 ring-primary/20 flex items-center justify-center group" title={`Onde a granada cai: ${activeLineup.landingArea?.callout || 'Destino'}`}>
                  {activeLineup.thumbnailUrl || activeLineup.resultImageUrl ? (
                    <img
                      src={activeLineup.thumbnailUrl || activeLineup.resultImageUrl}
                      alt="Onde Cai (Impacto)"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[11px] text-primary">Sem foto de impacto</span>
                  )}
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-primary text-[8px] font-extrabold text-surface tracking-wider">
                    2. ONDE CAI (IMPACTO)
                  </div>
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/85 text-[8px] font-semibold text-primary truncate max-w-[120px]">
                    {activeLineup.landingArea?.callout || 'Landing'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-surface-container border border-border-subtle flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">adjust</span>
                <div>
                  <div className="text-xs font-medium text-white">Manual Selection Mode</div>
                  <div className="text-[10px] text-text-muted">Overlay maintains your selected pixel steadily</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-secondary">STEADY</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OverlayCenterView;
