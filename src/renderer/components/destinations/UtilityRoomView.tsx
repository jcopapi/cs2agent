/**
 * CS2 Assistant - Utility Room Destination View
 * File: src/renderer/components/destinations/UtilityRoomView.tsx
 *
 * Implements the precision cyber-brutalist strategic playbook:
 * - 6 Active Duty competitive map selector
 * - 3 Dedicated Modes: [LINEUPS] | [PLAYS] | [STRATEGIES]
 * - [PLAYS] Sequencer: Create plays, order pixel routines (▲ / ▼), and set active in-game routine
 * - [LINEUPS] Manager: Screenshot previews, 4.5x zoom loupe, favorites, and [ + ADD CUSTOM PIXEL ]
 * - 100% English language, monospace typography, corner notches, and zero GPU bloat
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  CheckCircle,
  ExternalLink,
  Target,
  Play,
  Star,
  Plus,
  Download,
  Layers,
  Clock,
  AlertTriangle,
  Radio,
  X,
  Pin,
  ArrowUp,
  ArrowDown,
  Trash2,
} from 'lucide-react';
import type {
  CS2Map,
  TeamSide,
  UtilityType,
  StrategyTier,
  Lineup,
  Strategy,
  MatchPreparationProfile,
} from '../../../core/utility/types';
import type { Play as TacticalPlay } from '../../../shared/ipc-types';
import { generateCsnadesUrl, generateScopeGgUrl } from '../../../core/utility/external-providers';
import { getAllLineups, saveLineup as dbSaveLineup } from '../../../core/utility/lineup-database';
import { getAllStrategies } from '../../../core/utility/strategy-database';
import {
  getAllPlays,
  savePlay as dbSavePlay,
  deletePlay as dbDeletePlay,
  reorderLineups as dbReorderLineups,
  getActivePlayId,
  setActivePlayId,
} from '../../../core/utility/play-database';
import LineupCreatorModal from '../utility-room/LineupCreatorModal';
import ImportExportModal from '../utility-room/ImportExportModal';

export interface UtilityRoomViewProps {
  initialMap?: string;
  initialStrategyId?: string;
}

const COMPETITIVE_MAPS: { id: CS2Map; label: string }[] = [
  { id: 'de_mirage', label: 'Mirage' },
  { id: 'de_inferno', label: 'Inferno' },
  { id: 'de_dust2', label: 'Dust II' },
  { id: 'de_nuke', label: 'Nuke' },
  { id: 'de_ancient', label: 'Ancient' },
  { id: 'de_anubis', label: 'Anubis' },
];

export const UtilityRoomView: React.FC<UtilityRoomViewProps> = ({
  initialMap,
  initialStrategyId,
}) => {
  // Navigation & Filter State
  const [selectedMap, setSelectedMap] = useState<CS2Map>((initialMap as CS2Map) || 'de_mirage');
  const [selectedSide, setSelectedSide] = useState<TeamSide | 'ALL'>('ALL');
  const [selectedUtility, setSelectedUtility] = useState<UtilityType | 'ALL'>('ALL');
  const [selectedTier, setSelectedTier] = useState<StrategyTier | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'LINEUPS' | 'PLAYS' | 'STRATEGIES'>('LINEUPS');

  // Database State
  const [lineups, setLineups] = useState<Lineup[]>(() => getAllLineups());
  const [strategies, setStrategies] = useState<Strategy[]>(() => getAllStrategies());
  const [plays, setPlays] = useState<TacticalPlay[]>(() => getAllPlays());
  const [activePlayIdState, setActivePlayIdState] = useState<string>(() => getActivePlayId());

  // Selection State
  const [selectedLineupId, setSelectedLineupId] = useState<string | null>(null);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(initialStrategyId || null);
  const [pinnedLineup, setPinnedLineup] = useState<Lineup | null>(null);

  // Play Creator State
  const [isCreatingPlay, setIsCreatingPlay] = useState<boolean>(false);
  const [newPlayName, setNewPlayName] = useState<string>('');
  const [newPlaySide, setNewPlaySide] = useState<TeamSide>('T');
  const [newPlayDescription, setNewPlayDescription] = useState<string>('');

  // Modals State
  const [isCreatorOpen, setIsCreatorOpen] = useState<boolean>(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState<boolean>(false);
  const [importExportTab, setImportExportTab] = useState<'IMPORT' | 'EXPORT'>('IMPORT');

  // Load active HUD photo
  useEffect(() => {
    if (window.cs2Assistant?.hud?.getActiveLineupPhoto) {
      window.cs2Assistant.hud.getActiveLineupPhoto().then((photo) => {
        if (photo) setPinnedLineup(photo);
      }).catch(() => {});
    }

    const unsubPhoto = window.cs2Assistant?.hud?.onActiveLineupPhotoChange?.((photo) => {
      setPinnedLineup(photo);
    });

    return () => unsubPhoto?.();
  }, []);

  // Filter Lineups
  const filteredLineups = useMemo(() => {
    return lineups.filter((l) => {
      if (l.map !== selectedMap) return false;
      if (selectedSide !== 'ALL' && l.side !== selectedSide && l.side !== 'BOTH') return false;
      if (selectedUtility !== 'ALL' && l.utilityType !== selectedUtility) return false;
      if (showFavoritesOnly && !l.favorite) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          l.title.toLowerCase().includes(q) ||
          l.startPosition.callout.toLowerCase().includes(q) ||
          l.targetDestination.callout.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [lineups, selectedMap, selectedSide, selectedUtility, showFavoritesOnly, searchQuery]);

  // Filter Strategies
  const filteredStrategies = useMemo(() => {
    return strategies.filter((s) => {
      if (s.map !== selectedMap) return false;
      if (selectedSide !== 'ALL' && s.side !== selectedSide && s.side !== 'BOTH') return false;
      if (selectedTier !== 'ALL' && s.difficulty !== selectedTier) return false;
      if (showFavoritesOnly && !s.favorite) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.objective.toLowerCase().includes(q) ||
          s.recommendedRoles.some((r) => r.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [strategies, selectedMap, selectedSide, selectedTier, showFavoritesOnly, searchQuery]);

  // Filter Plays for current map
  const mapPlays = useMemo(() => {
    return plays.filter((p) => p.map === selectedMap);
  }, [plays, selectedMap]);

  // Active Selected Items
  const activeLineup = useMemo(() => {
    if (selectedLineupId) {
      const found = filteredLineups.find((l) => l.id === selectedLineupId);
      if (found) return found;
    }
    return filteredLineups[0] || null;
  }, [filteredLineups, selectedLineupId]);

  const activeStrategy = useMemo(() => {
    if (selectedStrategyId) {
      const found = filteredStrategies.find((s) => s.id === selectedStrategyId);
      if (found) return found;
    }
    return filteredStrategies[0] || null;
  }, [filteredStrategies, selectedStrategyId]);

  // Favorite toggle
  const handleToggleFavoriteLineup = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLineups((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const updated = { ...l, favorite: !l.favorite };
          dbSaveLineup(updated as Lineup);
          return updated;
        }
        return l;
      })
    );
  }, []);

  // Save new Play
  const handleCreatePlay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayName.trim()) return;

    const newPlay: TacticalPlay = {
      id: `play-${selectedMap}-${Date.now()}`,
      name: newPlayName.trim(),
      map: selectedMap,
      side: newPlaySide,
      description: newPlayDescription.trim() || `Tactical routine for ${selectedMap}`,
      lineupIds: [],
      createdAt: new Date().toISOString(),
    };

    dbSavePlay(newPlay);
    setPlays(getAllPlays());
    setNewPlayName('');
    setNewPlayDescription('');
    setIsCreatingPlay(false);
  };

  // Set Play as Active in-game routine
  const handleSetActivePlay = (playId: string) => {
    setActivePlayId(playId);
    setActivePlayIdState(playId);
    const p = plays.find((x) => x.id === playId);
    if (p && p.lineupIds && p.lineupIds[0] && window.cs2Assistant?.hud) {
      const firstLineup = lineups.find((l) => l.id === p.lineupIds[0]);
      if (firstLineup) {
        window.cs2Assistant.hud.setActiveLineupPhoto(firstLineup);
        setPinnedLineup(firstLineup);
      }
    }
  };

  // Reorder lineup in Play
  const handleReorderPlayLineup = (playId: string, index: number, direction: 'UP' | 'DOWN') => {
    const play = plays.find((p) => p.id === playId);
    if (!play) return;
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= play.lineupIds.length) return;

    const updatedIds = [...play.lineupIds];
    const temp = updatedIds[index];
    updatedIds[index] = updatedIds[targetIndex];
    updatedIds[targetIndex] = temp;

    dbReorderLineups(playId, updatedIds);
    setPlays(getAllPlays());
  };

  // Remove lineup from Play
  const handleRemovePlayLineup = (playId: string, lineupId: string) => {
    const play = plays.find((p) => p.id === playId);
    if (!play) return;
    const updatedIds = play.lineupIds.filter((id) => id !== lineupId);
    dbReorderLineups(playId, updatedIds);
    setPlays(getAllPlays());
  };

  // Add lineup to Play
  const handleAddLineupToPlay = (playId: string, lineupId: string) => {
    const play = plays.find((p) => p.id === playId);
    if (!play || !lineupId) return;
    if (play.lineupIds.includes(lineupId)) return;
    const updatedIds = [...play.lineupIds, lineupId];
    dbReorderLineups(playId, updatedIds);
    setPlays(getAllPlays());
  };

  // Delete Play
  const handleDeletePlay = (playId: string) => {
    dbDeletePlay(playId);
    setPlays(getAllPlays());
  };

  return (
    <div
      data-testid="view-utility-room"
      className="flex h-full w-full flex-col overflow-hidden bg-[#09090b] p-3 gap-2.5 select-none font-mono text-zinc-100"
    >
      {/* 1. TOP HEADER: ACTIVE DUTY MAPS BAR & ACTIVE PLAY BADGE */}
      <div className="flex items-center justify-between border border-zinc-800 bg-[#0c0c0e] px-3.5 py-2 shrink-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest mr-2">
            [ACTIVE DUTY]:
          </span>
          {COMPETITIVE_MAPS.map((m) => {
            const isCurrent = selectedMap === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMap(m.id);
                  setSelectedLineupId(null);
                  setSelectedStrategyId(null);
                }}
                className={`px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer border ${
                  isCurrent
                    ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                [{m.label.toUpperCase()}]
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500">ACTIVE PLAY:</span>
          <span className="border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 truncate max-w-[220px]">
            {plays.find((p) => p.id === activePlayIdState)?.name || 'Default Execute'}
          </span>
        </div>
      </div>

      {/* 2. NAVIGATION & FILTER TOOLBAR */}
      <div className="flex items-center justify-between border border-zinc-800 bg-[#0c0c0e] px-3 py-2 text-xs gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Main Sub-Modes: [LINEUPS] | [PLAYS] | [STRATEGIES] */}
          <div className="flex items-center border border-zinc-800 bg-zinc-950 p-0.5 text-[11px]">
            <button
              onClick={() => setViewMode('LINEUPS')}
              className={`px-3 py-1 font-bold transition-colors cursor-pointer ${
                viewMode === 'LINEUPS'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              [LINEUPS ({filteredLineups.length})]
            </button>
            <button
              onClick={() => setViewMode('PLAYS')}
              className={`px-3 py-1 font-bold transition-colors cursor-pointer ${
                viewMode === 'PLAYS'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              [PLAYS ({mapPlays.length})]
            </button>
            <button
              onClick={() => setViewMode('STRATEGIES')}
              className={`px-3 py-1 font-bold transition-colors cursor-pointer ${
                viewMode === 'STRATEGIES'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              [STRATEGIES ({filteredStrategies.length})]
            </button>
          </div>

          {/* Side Filter */}
          <div className="flex items-center border border-zinc-800 bg-zinc-950 p-0.5 text-[11px]">
            {(['ALL', 'T', 'CT'] as const).map((side) => (
              <button
                key={side}
                onClick={() => setSelectedSide(side)}
                className={`px-2 py-0.5 transition-colors cursor-pointer font-bold ${
                  selectedSide === side
                    ? side === 'CT'
                      ? 'bg-cyan-950/80 text-cyan-300'
                      : side === 'T'
                      ? 'bg-amber-950/80 text-amber-300'
                      : 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {side}
              </button>
            ))}
          </div>

          {/* Utility Filter */}
          {viewMode === 'LINEUPS' && (
            <div className="flex items-center border border-zinc-800 bg-zinc-950 p-0.5 text-[11px]">
              {(['ALL', 'SMOKE', 'FLASHBANG', 'MOLOTOV_INCENDIARY'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setSelectedUtility(u as any)}
                  className={`px-2 py-0.5 transition-colors cursor-pointer ${
                    selectedUtility === u
                      ? 'bg-zinc-800 text-zinc-100 font-bold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {u === 'MOLOTOV_INCENDIARY' ? 'MOLLY' : u}
                </button>
              ))}
            </div>
          )}

          {/* Favorites Filter */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-1.5 border px-2 py-1 text-[11px] transition-colors cursor-pointer ${
              showFavoritesOnly
                ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-bold'
                : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Star className={`h-3 w-3 ${showFavoritesOnly ? 'fill-amber-400' : ''}`} />
            <span>[FAVORITES]</span>
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative w-52">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none pl-7"
            />
            <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-zinc-600" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1.5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Add Custom Pixel with Screenshot button */}
          <button
            onClick={() => setIsCreatorOpen(true)}
            className="flex items-center gap-1.5 border border-cyan-500/80 bg-cyan-950/40 hover:bg-cyan-900/60 px-2.5 py-1 text-xs font-bold text-cyan-300 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>[ + ADD CUSTOM PIXEL ]</span>
          </button>

          {/* Import / Export */}
          <button
            onClick={() => {
              setImportExportTab('IMPORT');
              setIsImportExportOpen(true);
            }}
            className="border border-zinc-800 bg-zinc-950 hover:border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            [JSON I/O]
          </button>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {/* ================================================================== */}
        {/* VIEW 1: PLAYS ROUTINE BUILDER                                      */}
        {/* ================================================================== */}
        {viewMode === 'PLAYS' && (
          <div className="flex h-full gap-3 overflow-hidden">
            {/* Left: Plays List & Creation Form */}
            <div className="w-1/2 flex flex-col border border-zinc-800 bg-[#0c0c0e] p-3 gap-3 overflow-y-auto relative">
              <span className="absolute -top-1 -left-1 text-zinc-500 font-mono text-xs select-none">┌</span>
              <span className="absolute -top-1 -right-1 text-zinc-500 font-mono text-xs select-none">┐</span>
              <span className="absolute -bottom-1 -left-1 text-zinc-500 font-mono text-xs select-none">└</span>
              <span className="absolute -bottom-1 -right-1 text-zinc-500 font-mono text-xs select-none">┘</span>

              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                  [TACTICAL PLAYS // {selectedMap.toUpperCase().replace('DE_', '')}]
                </span>
                <button
                  onClick={() => setIsCreatingPlay(!isCreatingPlay)}
                  className="border border-emerald-500/80 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-400 transition-colors cursor-pointer"
                >
                  {isCreatingPlay ? '[ CANCEL ]' : '[ + CREATE PLAY ]'}
                </button>
              </div>

              {/* Inline Create Form */}
              {isCreatingPlay && (
                <form
                  onSubmit={handleCreatePlay}
                  className="border border-zinc-800 bg-zinc-950 p-3 space-y-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newPlayName}
                      onChange={(e) => setNewPlayName(e.target.value)}
                      placeholder="Play Name (e.g. B Site Fast Split)"
                      className="flex-1 border border-zinc-800 bg-black px-2.5 py-1 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
                      required
                    />
                    <select
                      value={newPlaySide}
                      onChange={(e) => setNewPlaySide(e.target.value as TeamSide)}
                      className="border border-zinc-800 bg-black px-2 py-1 text-xs text-cyan-400 outline-none"
                    >
                      <option value="T">T SIDE</option>
                      <option value="CT">CT SIDE</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={newPlayDescription}
                    onChange={(e) => setNewPlayDescription(e.target.value)}
                    placeholder="Short description / tactical objective"
                    className="w-full border border-zinc-800 bg-black px-2.5 py-1 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="w-full border border-emerald-500 bg-emerald-500/20 hover:bg-emerald-500/30 py-1.5 text-xs font-bold text-emerald-300 cursor-pointer"
                  >
                    [ SAVE PLAY ROUTINE ]
                  </button>
                </form>
              )}

              {/* Plays List */}
              <div className="space-y-3">
                {mapPlays.length === 0 ? (
                  <div className="text-center text-zinc-500 text-xs py-8">
                    No plays registered for {selectedMap}. Click &quot;[ + CREATE PLAY ]&quot; to build one.
                  </div>
                ) : (
                  mapPlays.map((play) => {
                    const isActive = play.id === activePlayIdState;
                    return (
                      <div
                        key={play.id}
                        className={`border p-3 space-y-2 text-xs transition-colors ${
                          isActive
                            ? 'border-cyan-400 bg-cyan-950/20'
                            : 'border-zinc-800 bg-black/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-100 uppercase">{play.name}</span>
                            <span className="border border-zinc-800 bg-zinc-900 px-1.5 py-0.2 text-[10px] text-zinc-400">
                              {play.side}
                            </span>
                            {isActive && (
                              <span className="border border-emerald-500/60 bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 text-[9px] font-bold">
                                ACTIVE IN-GAME
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {!isActive && (
                              <button
                                onClick={() => handleSetActivePlay(play.id)}
                                className="border border-cyan-500/80 bg-cyan-950/40 hover:bg-cyan-900/60 px-2 py-0.5 text-[10px] font-bold text-cyan-300 cursor-pointer"
                              >
                                [ SET ACTIVE ]
                              </button>
                            )}
                            <button
                              onClick={() => handleDeletePlay(play.id)}
                              className="text-zinc-600 hover:text-rose-400 p-0.5 cursor-pointer"
                              title="Delete Play"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-zinc-400">{play.description}</p>

                        {/* Pixel sequence ordered list */}
                        <div className="space-y-1 pt-1 border-t border-zinc-900">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase">
                            ORDERED PIXEL SEQUENCE ({play.lineupIds.length}):
                          </span>
                          {play.lineupIds.length === 0 ? (
                            <div className="text-[10px] text-zinc-600 py-1">
                              No pixels added yet. Add from the selector below.
                            </div>
                          ) : (
                            play.lineupIds.map((lId, idx) => {
                              const l = lineups.find((item) => item.id === lId);
                              return (
                                <div
                                  key={lId}
                                  className="flex items-center justify-between border border-zinc-800 bg-zinc-950/80 px-2 py-1 text-xs"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="text-[10px] text-zinc-500 font-bold">
                                      # {String(idx + 1).padStart(2, '0')}.
                                    </span>
                                    <span className="truncate text-zinc-200">
                                      {l ? l.title : lId}
                                    </span>
                                    {l && (
                                      <span className="text-[9px] text-zinc-500 border border-zinc-800 px-1">
                                        {l.utilityType}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => handleReorderPlayLineup(play.id, idx, 'UP')}
                                      disabled={idx === 0}
                                      className="p-0.5 text-zinc-500 hover:text-zinc-200 disabled:opacity-30 cursor-pointer"
                                      title="Move Up"
                                    >
                                      <ArrowUp className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleReorderPlayLineup(play.id, idx, 'DOWN')}
                                      disabled={idx === play.lineupIds.length - 1}
                                      className="p-0.5 text-zinc-500 hover:text-zinc-200 disabled:opacity-30 cursor-pointer"
                                      title="Move Down"
                                    >
                                      <ArrowDown className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleRemovePlayLineup(play.id, lId)}
                                      className="p-0.5 text-zinc-600 hover:text-rose-400 cursor-pointer ml-1"
                                      title="Remove from play"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Add pixel to play selector */}
                        <div className="flex items-center gap-2 pt-1 border-t border-zinc-900">
                          <select
                            id={`add-select-${play.id}`}
                            className="flex-1 border border-zinc-800 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-300 outline-none"
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Select pixel to add...
                            </option>
                            {lineups
                              .filter((l) => l.map === selectedMap)
                              .map((l) => (
                                <option key={l.id} value={l.id}>
                                  {l.title} ({l.utilityType})
                                </option>
                              ))}
                          </select>
                          <button
                            onClick={() => {
                              const sel = document.getElementById(
                                `add-select-${play.id}`
                              ) as HTMLSelectElement;
                              if (sel && sel.value) {
                                handleAddLineupToPlay(play.id, sel.value);
                                sel.value = '';
                              }
                            }}
                            className="border border-zinc-700 bg-zinc-900 hover:border-zinc-500 px-2 py-1 text-[11px] font-bold text-zinc-300 cursor-pointer"
                          >
                            [ + ADD PIXEL ]
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Active Routine In-Game Guidance */}
            <div className="w-1/2 flex flex-col border border-zinc-800 bg-[#0c0c0e] p-4 gap-3 overflow-y-auto relative">
              <span className="absolute -top-1 -left-1 text-zinc-500 font-mono text-xs select-none">┌</span>
              <span className="absolute -top-1 -right-1 text-zinc-500 font-mono text-xs select-none">┐</span>
              <span className="absolute -bottom-1 -left-1 text-zinc-500 font-mono text-xs select-none">└</span>
              <span className="absolute -bottom-1 -right-1 text-zinc-500 font-mono text-xs select-none">┘</span>

              <div className="border-b border-zinc-800 pb-2">
                <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                  [IN-GAME PLAY OVERLAY WORKFLOW]
                </span>
              </div>

              <div className="space-y-3 text-xs text-zinc-400 leading-relaxed">
                <p>
                  # Once a Play is set as <strong className="text-emerald-400">Active</strong>, it synchronizes directly with the in-game transparent HUD overlay.
                </p>
                <div className="border border-zinc-800 bg-black/60 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="border border-cyan-500 bg-cyan-950 px-2 py-0.5 font-bold text-cyan-300">
                      F1
                    </span>
                    <span className="text-zinc-200 font-semibold">TOGGLE OVERLAY PHOTO</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Shows or hides the current pixel screenshot with high-contrast reticle and 4.5x zoom loupe right over CS2 without losing window focus.
                  </p>
                </div>

                <div className="border border-zinc-800 bg-black/60 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="border border-emerald-500 bg-emerald-950 px-2 py-0.5 font-bold text-emerald-300">
                      F2
                    </span>
                    <span className="text-zinc-200 font-semibold">NEXT PIXEL IN ROUTINE</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    After throwing a smoke or flash, press F2 anywhere in Windows to instantly step to the next pixel in your active tactical routine.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* VIEW 2: LINEUPS BROWSER & SCREENSHOT INSPECTOR                     */}
        {/* ================================================================== */}
        {viewMode === 'LINEUPS' && (
          <div className="flex h-full gap-3 overflow-hidden">
            {/* Left: Filtered Lineups Cards */}
            <div className="w-1/2 flex flex-col border border-zinc-800 bg-[#0c0c0e] p-3 gap-2 overflow-y-auto relative">
              <span className="absolute -top-1 -left-1 text-zinc-500 font-mono text-xs select-none">┌</span>
              <span className="absolute -top-1 -right-1 text-zinc-500 font-mono text-xs select-none">┐</span>
              <span className="absolute -bottom-1 -left-1 text-zinc-500 font-mono text-xs select-none">└</span>
              <span className="absolute -bottom-1 -right-1 text-zinc-500 font-mono text-xs select-none">┘</span>

              <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs">
                <span className="font-bold text-zinc-100 uppercase tracking-wider">
                  [TACTICAL LINEUPS ({filteredLineups.length})]
                </span>
                <span className="text-[10px] text-zinc-500">CSNADES VERIFIED</span>
              </div>

              {filteredLineups.length === 0 ? (
                <div className="text-center text-zinc-500 text-xs py-8">
                  No lineups match the selected filters.
                </div>
              ) : (
                filteredLineups.map((lineup) => {
                  const isSelected = activeLineup?.id === lineup.id;
                  return (
                    <div
                      key={lineup.id}
                      onClick={() => setSelectedLineupId(lineup.id)}
                      className={`border p-2.5 cursor-pointer transition-colors relative flex gap-3 ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/20'
                          : 'border-zinc-800 bg-black/60 hover:border-zinc-700'
                      }`}
                    >
                      {lineup.thumbnailUrl && (
                        <img
                          src={lineup.thumbnailUrl}
                          alt={lineup.title}
                          className="w-16 h-16 object-cover border border-zinc-800 shrink-0"
                        />
                      )}

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-zinc-100 truncate pr-2">
                            {lineup.title}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={(e) => handleToggleFavoriteLineup(lineup.id, e)}
                              className="text-zinc-500 hover:text-amber-400 p-0.5 cursor-pointer"
                            >
                              <Star
                                className={`h-3.5 w-3.5 ${
                                  lineup.favorite ? 'fill-amber-400 text-amber-400' : ''
                                }`}
                              />
                            </button>
                            <span className="border border-zinc-800 bg-zinc-900 px-1.5 py-0.2 text-[10px] text-zinc-400 font-bold">
                              {lineup.side}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-zinc-400">
                          <span className="truncate">FROM: {lineup.startPosition.callout}</span>
                          <span className="truncate">TO: {lineup.targetDestination.callout}</span>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="border border-zinc-800 bg-zinc-900 px-1.5 py-0.2 text-[9px] text-zinc-400">
                            {lineup.throwType}
                          </span>
                          <span className="border border-zinc-800 bg-zinc-900 px-1.5 py-0.2 text-[9px] text-zinc-400">
                            {lineup.utilityType}
                          </span>
                          {lineup.isCustom && (
                            <span className="border border-purple-500/60 bg-purple-500/20 px-1.5 py-0.2 text-[9px] text-purple-300 font-bold">
                              CUSTOM PRINT
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right: Screenshot Inspector with Reticle and Zoom Loupe */}
            <div className="w-1/2 flex flex-col border border-zinc-800 bg-[#0c0c0e] p-3 gap-2 overflow-y-auto relative">
              <span className="absolute -top-1 -left-1 text-zinc-500 font-mono text-xs select-none">┌</span>
              <span className="absolute -top-1 -right-1 text-zinc-500 font-mono text-xs select-none">┐</span>
              <span className="absolute -bottom-1 -left-1 text-zinc-500 font-mono text-xs select-none">└</span>
              <span className="absolute -bottom-1 -right-1 text-zinc-500 font-mono text-xs select-none">┘</span>

              {activeLineup ? (
                <>
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-xs">
                    <span className="font-bold text-zinc-100 uppercase tracking-wider">
                      [INSPECTOR & OVERLAY PREVIEW]
                    </span>

                    <button
                      onClick={async () => {
                        const isPinned = pinnedLineup?.id === activeLineup.id;
                        if (isPinned) {
                          await window.cs2Assistant?.hud.setActiveLineupPhoto(null);
                          setPinnedLineup(null);
                        } else {
                          await window.cs2Assistant?.hud.setActiveLineupPhoto(activeLineup);
                          setPinnedLineup(activeLineup);
                        }
                      }}
                      className={`flex items-center gap-1.5 border px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
                        pinnedLineup?.id === activeLineup.id
                          ? 'border-emerald-500/80 bg-emerald-500/20 text-emerald-300'
                          : 'border-cyan-500/80 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60'
                      }`}
                    >
                      <Pin className="h-3 w-3" />
                      <span>
                        {pinnedLineup?.id === activeLineup.id
                          ? '[ PINNED ON OVERLAY ]'
                          : '[ PIN TO IN-GAME OVERLAY (F1) ]'}
                      </span>
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">{activeLineup.title}</h3>
                    <p className="text-xs text-zinc-400">{activeLineup.movementRequirements}</p>
                  </div>

                  {/* Photo with Reticle and Loupe */}
                  <div className="relative flex flex-col items-center justify-center border border-zinc-800 bg-black min-h-[220px] overflow-hidden">
                    <img
                      src={activeLineup.imageUrl || activeLineup.thumbnailUrl}
                      alt={activeLineup.title}
                      className="w-full max-h-[260px] object-contain"
                    />

                    {/* Aim Reticle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                      <div className="w-8 h-8 rounded-full border-2 border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.95)] flex items-center justify-center animate-pulse">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                      </div>
                      <div className="absolute -left-3 w-2 h-0.5 bg-emerald-400" />
                      <div className="absolute -right-3 w-2 h-0.5 bg-emerald-400" />
                      <div className="absolute -top-3 h-2 w-0.5 bg-emerald-400" />
                      <div className="absolute -bottom-3 h-2 w-0.5 bg-emerald-400" />
                      <span className="absolute -bottom-4.5 bg-black/90 border border-rose-500 px-1 py-0.2 text-[8px] font-black text-rose-400 uppercase tracking-widest whitespace-nowrap">
                        AIM TARGET
                      </span>
                    </div>

                    {/* 4.5x Zoom Loupe */}
                    {activeLineup.imageUrl && (
                      <div className="absolute bottom-2 left-2 border border-cyan-400 bg-black/95 p-1 flex flex-col items-center">
                        <span className="text-[8px] font-bold text-cyan-400 px-1 mb-0.5 uppercase tracking-wider">
                          4.5X LOUPE
                        </span>
                        <div
                          className="w-28 h-20 border border-zinc-700 relative overflow-hidden"
                          style={{
                            backgroundImage: `url(${activeLineup.imageUrl})`,
                            backgroundPosition: 'center center',
                            backgroundSize: '450%',
                            backgroundRepeat: 'no-repeat',
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-full h-px bg-emerald-400/80 absolute" />
                            <div className="h-full w-px bg-emerald-400/80 absolute" />
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute ring-1 ring-emerald-400" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Aim Reference and Details */}
                  <div className="border border-zinc-800 bg-black/60 p-2.5 text-xs space-y-1">
                    <div className="text-zinc-400">
                      <span className="text-zinc-200 font-bold">AIM PLACEMENT: </span>
                      {activeLineup.aimReference?.crosshairPlacement || activeLineup.instructions?.[1]}
                    </div>
                    {activeLineup.aimReference?.visualLandmark && (
                      <div className="text-zinc-400">
                        <span className="text-zinc-200 font-bold">VISUAL LANDMARK: </span>
                        {activeLineup.aimReference.visualLandmark}
                      </div>
                    )}
                  </div>

                  {/* External links */}
                  <div className="flex items-center gap-3 pt-1 border-t border-zinc-800 text-xs">
                    <a
                      href={generateCsnadesUrl(activeLineup)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>CSNADES</span>
                    </a>
                    <a
                      href={generateScopeGgUrl(activeLineup)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Scope.gg</span>
                    </a>
                  </div>
                </>
              ) : (
                <div className="text-center text-zinc-500 text-xs py-8">
                  Select a lineup to inspect alignment details.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* VIEW 3: STRATEGIES PLAYBOOK                                        */}
        {/* ================================================================== */}
        {viewMode === 'STRATEGIES' && (
          <div className="flex h-full gap-3 overflow-hidden">
            <div className="w-1/2 flex flex-col border border-zinc-800 bg-[#0c0c0e] p-3 gap-2 overflow-y-auto relative">
              <span className="absolute -top-1 -left-1 text-zinc-500 font-mono text-xs select-none">┌</span>
              <span className="absolute -top-1 -right-1 text-zinc-500 font-mono text-xs select-none">┐</span>
              <span className="absolute -bottom-1 -left-1 text-zinc-500 font-mono text-xs select-none">└</span>
              <span className="absolute -bottom-1 -right-1 text-zinc-500 font-mono text-xs select-none">┘</span>

              <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs">
                <span className="font-bold text-zinc-100 uppercase tracking-wider">
                  [TACTICAL STRATEGIES ({filteredStrategies.length})]
                </span>
              </div>

              {filteredStrategies.map((strat) => {
                const isSelected = activeStrategy?.id === strat.id;
                return (
                  <div
                    key={strat.id}
                    onClick={() => setSelectedStrategyId(strat.id)}
                    className={`border p-3 cursor-pointer space-y-1.5 transition-colors ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/20'
                        : 'border-zinc-800 bg-black/60 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-cyan-400 truncate pr-2">
                        {strat.name}
                      </span>
                      <span className="border border-zinc-800 bg-zinc-900 px-1.5 py-0.2 text-[9px] text-amber-400 font-bold uppercase">
                        {strat.difficulty}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2">{strat.objective}</p>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 pt-1">
                      <span>PHASES: {strat.phases.length}</span>
                      <span>•</span>
                      <span>ROLES: {strat.recommendedRoles.join(', ')}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="w-1/2 flex flex-col border border-zinc-800 bg-[#0c0c0e] p-3 gap-3 overflow-y-auto relative">
              <span className="absolute -top-1 -left-1 text-zinc-500 font-mono text-xs select-none">┌</span>
              <span className="absolute -top-1 -right-1 text-zinc-500 font-mono text-xs select-none">┐</span>
              <span className="absolute -bottom-1 -left-1 text-zinc-500 font-mono text-xs select-none">└</span>
              <span className="absolute -bottom-1 -right-1 text-zinc-500 font-mono text-xs select-none">┘</span>

              {activeStrategy ? (
                <>
                  <div className="border-b border-zinc-800 pb-2">
                    <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                      [STRATEGY PHASES TIMELINE]
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">{activeStrategy.name}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{activeStrategy.objective}</p>
                  </div>

                  <div className="space-y-2">
                    {activeStrategy.phases.map((phase) => (
                      <div
                        key={phase.phaseNumber}
                        className="border border-zinc-800 bg-black/60 p-2.5 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-cyan-400">
                            PHASE {phase.phaseNumber}: {phase.name}
                          </span>
                          <span className="text-[10px] text-zinc-500">t = {phase.timingSeconds}s</span>
                        </div>
                        <p className="text-[11px] text-zinc-400">{phase.instructions}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center text-zinc-500 text-xs py-8">
                  Select a strategy to inspect its timeline.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. CUSTOM LINEUP CREATOR MODAL WITH SCREENSHOT / CLIPBOARD PASTE */}
      {isCreatorOpen && (
        <LineupCreatorModal
          currentMap={selectedMap}
          onClose={() => setIsCreatorOpen(false)}
          onSaveLineup={(newLineup) => {
            dbSaveLineup(newLineup);
            setLineups(getAllLineups());
            setSelectedLineupId(newLineup.id);
            setIsCreatorOpen(false);
          }}
        />
      )}

      {/* 5. JSON IMPORT / EXPORT MODAL */}
      {isImportExportOpen && (
        <ImportExportModal
          defaultTab={importExportTab}
          currentMap={selectedMap}
          existingLineups={lineups}
          existingStrategies={strategies}
          onClose={() => setIsImportExportOpen(false)}
          onImportComplete={({ lineups: updatedLineups, strategies: updatedStrategies }) => {
            setLineups(updatedLineups);
            setStrategies(updatedStrategies);
            setIsImportExportOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default UtilityRoomView;
