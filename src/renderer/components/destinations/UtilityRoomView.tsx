/**
 * CS2 Assistant - Utility Room Destination View
 * File: src/renderer/components/destinations/UtilityRoomView.tsx
 *
 * Implements the strategic playbook, 6 Active Duty competitive map selector,
 * filterable lineup library, SVG landmark visual reference preview,
 * multi-phase strategy timeline viewer, and Match Preparation Profiles.
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
import { generateCsnadesUrl, generateScopeGgUrl } from '../../../core/utility/external-providers';
import { getAllLineups } from '../../../core/utility/lineup-database';
import { getAllStrategies } from '../../../core/utility/strategy-database';
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
  const [viewMode, setViewMode] = useState<'LINEUPS' | 'STRATEGIES'>('LINEUPS');

  // Database State (initialized with verified pre-populated datasets)
  const [lineups, setLineups] = useState<Lineup[]>(() => getAllLineups());
  const [strategies, setStrategies] = useState<Strategy[]>(() => getAllStrategies());
  const [selectedLineupId, setSelectedLineupId] = useState<string | null>(null);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(initialStrategyId || null);

  // Preparation Profile State
  const [activeProfile, setActiveProfile] = useState<MatchPreparationProfile | null>(null);
  const [isProfileBound, setIsProfileBound] = useState<boolean>(false);

  // Modal Visibility State
  const [isCreatorOpen, setIsCreatorOpen] = useState<boolean>(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState<boolean>(false);
  const [importExportTab, setImportExportTab] = useState<'IMPORT' | 'EXPORT'>('IMPORT');

  // -------------------------------------------------------------------------
  // Load Data from IPC if available, otherwise keep verified defaults
  // -------------------------------------------------------------------------
  useEffect(() => {
    async function loadData() {
      try {
        if (window.cs2Assistant?.lineup?.getAll) {
          const loadedLineups = await window.cs2Assistant.lineup.getAll();
          if (loadedLineups && loadedLineups.length > 0) {
            setLineups(loadedLineups as unknown as Lineup[]);
          }
        }
        if (window.cs2Assistant?.strategy?.getAll) {
          const loadedStrategies = await window.cs2Assistant.strategy.getAll();
          if (loadedStrategies && loadedStrategies.length > 0) {
            setStrategies(loadedStrategies as unknown as Strategy[]);
          }
        }
        if (window.cs2Assistant?.strategy?.getActiveProfile) {
          const profile = await window.cs2Assistant.strategy.getActiveProfile();
          if (profile) {
            setActiveProfile(profile);
            setIsProfileBound(profile.active);
          }
        }
      } catch (err) {
        console.error('[UtilityRoomView] Error loading data from IPC:', err);
      }
    }
    loadData();
  }, []);

  // Synchronize when initial props change (e.g. from History closed loop trigger)
  useEffect(() => {
    if (initialMap) setSelectedMap(initialMap as CS2Map);
    if (initialStrategyId) {
      setSelectedStrategyId(initialStrategyId);
      setViewMode('STRATEGIES');
    }
  }, [initialMap, initialStrategyId]);

  // Compute Active Counts per map
  const mapCounts = useMemo(() => {
    const counts: Record<CS2Map, { lineups: number; strategies: number }> = {
      de_mirage: { lineups: 0, strategies: 0 },
      de_inferno: { lineups: 0, strategies: 0 },
      de_dust2: { lineups: 0, strategies: 0 },
      de_nuke: { lineups: 0, strategies: 0 },
      de_ancient: { lineups: 0, strategies: 0 },
      de_anubis: { lineups: 0, strategies: 0 },
    };

    for (const l of lineups) {
      if (counts[l.map]) counts[l.map].lineups++;
    }
    for (const s of strategies) {
      if (counts[s.map]) counts[s.map].strategies++;
    }
    return counts;
  }, [lineups, strategies]);

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

  // Active Selected Item
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

  // Toggle Favorite Handler
  const handleToggleFavoriteLineup = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setLineups((prev) =>
        prev.map((l) => {
          if (l.id === id) {
            const updated = { ...l, favorite: !l.favorite };
            window.cs2Assistant?.lineup?.save?.(updated as any);
            return updated;
          }
          return l;
        })
      );
    },
    []
  );

  // Toggle Profile Binding
  const handleToggleProfileBinding = useCallback(async () => {
    const nextBound = !isProfileBound;
    setIsProfileBound(nextBound);

    const profile: MatchPreparationProfile = activeProfile || {
      profileId: `profile-${selectedMap}-custom`,
      name: `Custom ${COMPETITIVE_MAPS.find((m) => m.id === selectedMap)?.label} Preparation`,
      map: selectedMap,
      side: 'T',
      selectedLineupIds: filteredLineups.map((l) => l.id),
      selectedStrategyIds: filteredStrategies.map((s) => s.id),
      active: nextBound,
      createdAt: new Date().toISOString(),
    };

    profile.active = nextBound;
    setActiveProfile(profile);

    try {
      await window.cs2Assistant?.strategy?.setActiveProfile?.(nextBound ? profile : null);
    } catch (err) {
      console.error('[UtilityRoomView] Error setting active profile:', err);
    }
  }, [isProfileBound, activeProfile, selectedMap, filteredLineups, filteredStrategies]);

  return (
    <div
      data-testid="view-utility-room"
      className="flex h-full w-full flex-col overflow-hidden bg-background p-4 gap-3 select-none"
    >
      {/* 1. Header: 6 Active Duty Maps Tabs & Preparation Profile */}
      <div className="flex items-center justify-between border-b border-border-subtle bg-background-panel px-4 py-2.5 rounded text-xs">
        {/* Active Duty Maps */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mr-1">
            ACTIVE DUTY:
          </span>
          {COMPETITIVE_MAPS.map((m) => {
            const isCurrent = selectedMap === m.id;
            const count = mapCounts[m.id];
            return (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMap(m.id);
                  setSelectedLineupId(null);
                  setSelectedStrategyId(null);
                }}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-tactical-cyan text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-background-elevated'
                }`}
              >
                <span>{m.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[9px] font-mono ${
                    isCurrent ? 'bg-zinc-950/20 text-zinc-950' : 'bg-background-elevated text-zinc-500'
                  }`}
                >
                  {count.lineups + count.strategies}
                </span>
              </button>
            );
          })}
        </div>

        {/* Match Preparation Profile Selector */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-zinc-400">ACTIVE PROFILE:</span>
          <span className="rounded border border-border-subtle bg-background px-2.5 py-1 font-mono text-[11px] text-zinc-200">
            {activeProfile?.name ||
              `[${COMPETITIVE_MAPS.find((m) => m.id === selectedMap)?.label} Default Execution]`}
          </span>
          <button
            onClick={handleToggleProfileBinding}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              isProfileBound
                ? 'bg-tactical-emerald text-zinc-950 font-bold shadow-sm'
                : 'border border-border-elevated bg-background hover:bg-background-elevated text-zinc-200'
            }`}
          >
            {isProfileBound ? (
              <>
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Bound to Live Context</span>
              </>
            ) : (
              <>
                <Radio className="h-3.5 w-3.5 text-zinc-400" />
                <span>Bind to Live Match</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Filter & Action Toolbar */}
      <div className="flex items-center justify-between rounded border border-border-subtle bg-background-container p-2 text-xs gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle: Lineups vs Strategies */}
          <div className="flex items-center rounded border border-border-subtle bg-background p-0.5 font-mono text-[11px]">
            <button
              onClick={() => setViewMode('LINEUPS')}
              className={`rounded px-2.5 py-0.5 transition-colors cursor-pointer ${
                viewMode === 'LINEUPS'
                  ? 'bg-tactical-cyan text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              LINEUPS ({filteredLineups.length})
            </button>
            <button
              onClick={() => setViewMode('STRATEGIES')}
              className={`rounded px-2.5 py-0.5 transition-colors cursor-pointer ${
                viewMode === 'STRATEGIES'
                  ? 'bg-tactical-cyan text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              STRATEGIES ({filteredStrategies.length})
            </button>
          </div>

          {/* Side Filter */}
          <div className="flex items-center rounded border border-border-subtle bg-background p-0.5 font-mono text-[11px]">
            {(['ALL', 'T', 'CT'] as const).map((side) => (
              <button
                key={side}
                onClick={() => setSelectedSide(side)}
                className={`rounded px-2 py-0.5 transition-colors cursor-pointer ${
                  selectedSide === side
                    ? side === 'CT'
                      ? 'bg-tactical-cyan/20 text-tactical-cyan font-bold'
                      : side === 'T'
                      ? 'bg-tactical-amber/20 text-tactical-amber font-bold'
                      : 'bg-background-elevated text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {side}
              </button>
            ))}
          </div>

          {/* Utility Filter (when in LINEUPS view) */}
          {viewMode === 'LINEUPS' && (
            <div className="flex items-center rounded border border-border-subtle bg-background p-0.5 font-mono text-[11px]">
              {(['ALL', 'SMOKE', 'FLASHBANG', 'MOLOTOV_INCENDIARY'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setSelectedUtility(u as any)}
                  className={`rounded px-2 py-0.5 transition-colors cursor-pointer ${
                    selectedUtility === u
                      ? 'bg-background-elevated text-zinc-100 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {u === 'MOLOTOV_INCENDIARY' ? 'MOLOTOV' : u}
                </button>
              ))}
            </div>
          )}

          {/* Strategy Tier Filter (when in STRATEGIES view) */}
          {viewMode === 'STRATEGIES' && (
            <div className="flex items-center rounded border border-border-subtle bg-background p-0.5 font-mono text-[11px]">
              {(['ALL', 'BASIC', 'INTERMEDIATE', 'ADVANCED', 'COORDINATED'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier as any)}
                  className={`rounded px-2 py-0.5 transition-colors cursor-pointer ${
                    selectedTier === tier
                      ? 'bg-background-elevated text-zinc-100 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          )}

          {/* Favorites Filter */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-1 rounded border px-2 py-1 font-mono text-[11px] transition-colors cursor-pointer ${
              showFavoritesOnly
                ? 'border-tactical-amber bg-tactical-amber/10 text-tactical-amber font-bold'
                : 'border-border-subtle bg-background text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Star className={`h-3 w-3 ${showFavoritesOnly ? 'fill-tactical-amber' : ''}`} />
            <span>FAVORITES</span>
          </button>
        </div>

        {/* Search Bar & Actions */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative w-56">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search playbook..."
              className="w-full rounded border border-border-subtle bg-background px-3 py-1 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-border-active focus:outline-none pl-8"
            />
            <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-zinc-500" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1.5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Action: New Item */}
          <button
            onClick={() => setIsCreatorOpen(true)}
            className="flex items-center gap-1 rounded border border-border-elevated bg-background hover:bg-background-elevated px-2.5 py-1 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-tactical-cyan" />
            <span>Create</span>
          </button>

          {/* Action: Import / Export */}
          <button
            onClick={() => {
              setImportExportTab('IMPORT');
              setIsImportExportOpen(true);
            }}
            className="flex items-center gap-1 rounded border border-border-elevated bg-background hover:bg-background-elevated px-2.5 py-1 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-zinc-400" />
            <span>JSON I/O</span>
          </button>
        </div>
      </div>

      {/* 3. Main Two-Panel Layout */}
      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* Left Panel (50%): Lineup or Strategy Playbook List */}
        <div className="flex flex-col flex-1 rounded border border-border-subtle bg-background-panel p-3 overflow-hidden space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-xs">
            <span className="font-semibold text-zinc-200 uppercase tracking-wider">
              {viewMode === 'LINEUPS' ? 'TACTICAL LINEUPS' : 'COORDINATED STRATEGIES'} (
              {viewMode === 'LINEUPS' ? filteredLineups.length : filteredStrategies.length})
            </span>
            <span className="font-mono text-[10px] text-zinc-500">CSNADES & SCOPE.GG VERIFIED</span>
          </div>

          {/* Cards List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {viewMode === 'LINEUPS' ? (
              filteredLineups.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-zinc-500 text-xs">
                  <Target className="h-8 w-8 mb-2 opacity-40" />
                  <span>No lineups match the selected criteria.</span>
                </div>
              ) : (
                filteredLineups.map((lineup) => {
                  const isSelected = activeLineup?.id === lineup.id;
                  return (
                    <div
                      key={lineup.id}
                      onClick={() => setSelectedLineupId(lineup.id)}
                      className={`rounded border p-2.5 cursor-pointer transition-colors relative flex gap-2.5 ${
                        isSelected
                          ? 'border-tactical-cyan bg-background-elevated'
                          : 'border-border-subtle bg-background hover:border-border-elevated'
                      }`}
                    >
                      {lineup.thumbnailUrl && (
                        <img
                          src={lineup.thumbnailUrl}
                          alt={lineup.title}
                          className="w-14 h-14 object-cover rounded border border-border-subtle flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs text-zinc-200 truncate pr-2">
                            {lineup.title}
                          </span>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={(e) => handleToggleFavoriteLineup(lineup.id, e)}
                              className="text-zinc-500 hover:text-tactical-amber transition-colors p-0.5 cursor-pointer"
                            >
                              <Star
                                className={`h-3.5 w-3.5 ${
                                  lineup.favorite ? 'fill-tactical-amber text-tactical-amber' : ''
                                }`}
                              />
                            </button>
                            <span
                              className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                lineup.side === 'CT'
                                  ? 'bg-tactical-cyan/20 text-tactical-cyan'
                                  : 'bg-tactical-amber/20 text-tactical-amber'
                              }`}
                            >
                              {lineup.side}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                          <span className="truncate">De: {lineup.startPosition.callout}</span>
                          <span className="truncate">Para: {lineup.targetDestination.callout}</span>
                        </div>

                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <span className="rounded bg-background-panel border border-border-subtle px-1.5 py-0.5 font-mono text-[9px] text-zinc-400">
                            {lineup.throwType}
                          </span>
                          <span className="rounded bg-background-panel border border-border-subtle px-1.5 py-0.5 font-mono text-[9px] text-zinc-400">
                            {lineup.difficulty}
                          </span>
                          {lineup.isCustom && (
                            <span className="rounded bg-tactical-purple/20 border border-tactical-purple/30 px-1.5 py-0.5 font-mono text-[9px] text-tactical-purple">
                              CUSTOM
                            </span>
                          )}
                          <span className="flex items-center gap-1 font-mono text-[9px] text-tactical-emerald ml-auto">
                            <CheckCircle className="h-2.5 w-2.5" />
                            <span>CSNADES</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            ) : filteredStrategies.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-zinc-500 text-xs">
                <Layers className="h-8 w-8 mb-2 opacity-40" />
                <span>No strategies match the selected criteria.</span>
              </div>
            ) : (
              filteredStrategies.map((strat) => {
                const isSelected = activeStrategy?.id === strat.id;
                return (
                  <div
                    key={strat.id}
                    onClick={() => setSelectedStrategyId(strat.id)}
                    className={`rounded border p-3 cursor-pointer transition-colors space-y-1.5 ${
                      isSelected
                        ? 'border-tactical-cyan bg-background-elevated'
                        : 'border-border-subtle bg-background hover:border-border-elevated'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-tactical-cyan truncate pr-2">
                        {strat.name}
                      </span>
                      <span className="rounded bg-tactical-amber/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-tactical-amber uppercase">
                        {strat.difficulty}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2">{strat.objective}</p>
                    <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500 pt-1">
                      <span>PHASES: {strat.phases.length}</span>
                      <span>•</span>
                      <span>ROLES: {strat.recommendedRoles.join(', ')}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel (50%): Detail Inspector (Lineup or Strategy) */}
        <div className="flex flex-col flex-1 rounded border border-border-subtle bg-background-panel p-3 overflow-y-auto space-y-3">
          {viewMode === 'LINEUPS' ? (
            activeLineup ? (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-xs">
                  <span className="font-semibold text-zinc-200 uppercase tracking-wider">
                    LINEUP & LANDMARK INSPECTOR
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={generateCsnadesUrl(activeLineup)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[11px] text-tactical-cyan hover:underline cursor-pointer"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>CSNADES</span>
                    </a>
                    <a
                      href={generateScopeGgUrl(activeLineup)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[11px] text-tactical-amber hover:underline cursor-pointer"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Scope.gg</span>
                    </a>
                  </div>
                </div>

                {/* Title and metadata */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">{activeLineup.title}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{activeLineup.movementRequirements}</p>
                </div>

                {/* Photo & Crosshair Landmark Visual Reference Box */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-mono text-[10px] uppercase font-bold text-tactical-cyan">
                      {activeLineup.imageUrl ? 'FOTO REAL CSNADES (PIXEL & MIRA)' : 'SVG Crosshair Landmark'}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-500">
                      TOLERÂNCIA: ±{activeLineup.startPosition.toleranceUnits || 6} UNITS
                    </span>
                  </div>
                  {activeLineup.imageUrl ? (
                    <div className="relative flex flex-col items-center justify-center rounded-lg border border-border-subtle bg-zinc-950 p-2 overflow-hidden">
                      <img
                        src={activeLineup.imageUrl}
                        alt={activeLineup.title}
                        className="w-full max-h-[300px] object-contain rounded"
                      />
                      {activeLineup.thumbnailUrl && (
                        <div className="absolute bottom-3 right-3 rounded border border-tactical-cyan/60 bg-zinc-950/90 backdrop-blur-md p-1 shadow-xl flex flex-col items-center">
                          <span className="text-[9px] font-mono font-bold text-tactical-cyan mb-0.5">ONDE CAI (BLOOM)</span>
                          <img
                            src={activeLineup.thumbnailUrl}
                            alt="Landing bloom"
                            className="w-28 h-18 object-cover rounded"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="flex items-center justify-center rounded border border-border-subtle bg-background p-4 min-h-[160px]"
                      dangerouslySetInnerHTML={{ __html: activeLineup.svgReference }}
                    />
                  )}
                </div>

                {/* Aim Reference */}
                <div className="rounded border border-border-subtle bg-background p-2.5 space-y-1 text-xs">
                  <div className="text-zinc-400">
                    <span className="font-semibold text-zinc-200">Crosshair Placement: </span>
                    {activeLineup.aimReference.crosshairPlacement}
                  </div>
                  <div className="text-zinc-400">
                    <span className="font-semibold text-zinc-200">Visual Landmark: </span>
                    {activeLineup.aimReference.visualLandmark}
                  </div>
                </div>

                {/* Step-by-Step Instructions */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                    Execution Protocol
                  </h4>
                  <ol className="space-y-1.5 text-xs text-zinc-300 list-decimal pl-4">
                    {activeLineup.instructions.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Coordinates and Engine Verification */}
                <div className="rounded border border-border-subtle bg-background p-2 text-[10px] font-mono text-zinc-400 space-y-1 mt-auto">
                  <div className="flex justify-between">
                    <span>ANCHOR COORDINATES:</span>
                    <span>
                      ({activeLineup.startPosition.x}, {activeLineup.startPosition.y},{' '}
                      {activeLineup.startPosition.z})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>TARGET DESTINATION:</span>
                    <span>
                      ({activeLineup.targetDestination.x}, {activeLineup.targetDestination.y},{' '}
                      {activeLineup.targetDestination.z}) — {activeLineup.targetDestination.callout}
                    </span>
                  </div>
                  <div className="flex justify-between text-tactical-emerald">
                    <span>SOURCE ATTRIBUTION:</span>
                    <span>{activeLineup.sourceAttribution}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-xs">
                <span>Select a lineup to inspect coordinates and visual landmarks.</span>
              </div>
            )
          ) : activeStrategy ? (
            <>
              {/* Strategy Header */}
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-xs">
                <span className="font-semibold text-zinc-200 uppercase tracking-wider">
                  STRATEGY TIMELINE & PHASES
                </span>
                <span className="rounded bg-tactical-amber/20 px-2 py-0.5 font-mono text-[10px] font-bold text-tactical-amber uppercase">
                  {activeStrategy.difficulty}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-zinc-100">{activeStrategy.name}</h3>
                <p className="text-xs text-zinc-400 mt-1">{activeStrategy.objective}</p>
              </div>

              {/* Roles Breakdown */}
              <div className="rounded border border-border-subtle bg-background p-2.5 space-y-1 text-xs">
                <span className="font-mono text-[10px] text-zinc-500 uppercase">RECOMMENDED ROLES:</span>
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  {activeStrategy.recommendedRoles.map((role, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-background-panel border border-border-subtle px-2 py-0.5 font-mono text-[10px] text-zinc-300"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Execution Timeline Phases */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                  Tactical Phases Timeline
                </h4>
                <div className="space-y-2.5">
                  {activeStrategy.phases.map((phase) => (
                    <div
                      key={phase.phaseNumber}
                      className="rounded border border-border-subtle bg-background p-2.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-tactical-cyan/20 px-1.5 py-0.2 font-mono text-[10px] font-bold text-tactical-cyan">
                            PHASE {phase.phaseNumber}
                          </span>
                          <span className="text-xs font-medium text-zinc-200">{phase.name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-zinc-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> t = {phase.timingSeconds}.0s
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">{phase.instructions}</p>

                      {/* Linked Lineups */}
                      {phase.linkedLineupIds.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                          <span className="font-mono text-[9px] text-zinc-500">LINEUPS:</span>
                          {phase.linkedLineupIds.map((lid) => {
                            const linked = lineups.find((l) => l.id === lid);
                            return (
                              <button
                                key={lid}
                                onClick={() => {
                                  if (linked) {
                                    setSelectedLineupId(linked.id);
                                    setViewMode('LINEUPS');
                                  }
                                }}
                                className="rounded bg-background-panel border border-border-subtle px-2 py-0.5 font-mono text-[9px] text-tactical-cyan hover:border-tactical-cyan cursor-pointer transition-colors"
                              >
                                {linked ? linked.title : lid}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contingencies & Comms */}
              {activeStrategy.contingencies.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-tactical-amber" />
                    <span>Contingency Protocols</span>
                  </h4>
                  <div className="space-y-1">
                    {activeStrategy.contingencies.map((c, idx) => (
                      <div
                        key={idx}
                        className="rounded border border-border-subtle bg-background p-2 text-xs space-y-0.5"
                      >
                        <div className="text-tactical-amber font-medium text-[11px]">If: {c.trigger}</div>
                        <div className="text-zinc-400 text-[11px]">Action: {c.action}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeStrategy.coordinationNotes && (
                <div className="rounded border border-border-subtle bg-background p-2 text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-200">Voice Comms Protocol: </span>
                  {activeStrategy.coordinationNotes}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-xs">
              <span>Select a strategy to inspect its timeline and phases.</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Custom Lineup & Strategy Creator Modal */}
      {isCreatorOpen && (
        <LineupCreatorModal
          currentMap={selectedMap}
          onClose={() => setIsCreatorOpen(false)}
          onSaveLineup={(newLineup) => {
            setLineups((prev) => [newLineup, ...prev]);
            setSelectedLineupId(newLineup.id);
            setIsCreatorOpen(false);
          }}
        />
      )}

      {/* 5. JSON Import & Export Modal */}
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
