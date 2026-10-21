/**
 * CS2 Assistant - Precision Split-Screen Launcher
 * File: src/renderer/components/destinations/UtilityRoomView.tsx
 *
 * Implements the streamlined two-column split view:
 * - Left: Pixels Explorer (Map selector, C4/Kit side icons, Smoke/Bang/Molly/HE icons, search, cards with '+' button)
 * - Right: Plans Manager (Search, '+' create plan, ordered steps with ▲/▼/✕, active in-game sync)
 * - Top-Left: Gear icon for Settings
 * - Custom slim vertical scrollbars with zero horizontal overflow
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { CS2Map, TeamSide, UtilityType, Lineup } from '../../../core/utility/types';
import type { Play as TacticalPlan } from '../../../shared/ipc-types';
import { getAllLineups } from '../../../core/utility/lineup-database';
import {
  getAllPlays,
  savePlay as dbSavePlay,
  deletePlay as dbDeletePlay,
  getActivePlayId,
  setActivePlayId,
  addPixelToPlay,
  removePixelFromPlay,
  movePixelInPlay,
} from '../../../core/utility/play-database';

interface UtilityRoomViewProps {
  onOpenSettings: () => void;
}

const COMPETITIVE_MAPS: { id: CS2Map; label: string }[] = [
  { id: 'de_mirage', label: 'Mirage' },
  { id: 'de_inferno', label: 'Inferno' },
  { id: 'de_dust2', label: 'Dust II' },
  { id: 'de_nuke', label: 'Nuke' },
  { id: 'de_ancient', label: 'Ancient' },
  { id: 'de_anubis', label: 'Anubis' },
];

export const UtilityRoomView: React.FC<UtilityRoomViewProps> = ({ onOpenSettings }) => {
  // Filter States
  const [selectedMap, setSelectedMap] = useState<CS2Map>('de_mirage');
  const [selectedSide, setSelectedSide] = useState<TeamSide | 'ALL'>('ALL');
  const [selectedUtility, setSelectedUtility] = useState<UtilityType | 'ALL'>('ALL');
  const [pixelSearch, setPixelSearch] = useState<string>('');
  const [planSearch, setPlanSearch] = useState<string>('');

  // Database States
  const [lineups, setLineups] = useState<Lineup[]>(() => getAllLineups());
  const [plans, setPlans] = useState<TacticalPlan[]>(() => getAllPlays());
  const [activePlanId, setActivePlanIdState] = useState<string>(() => getActivePlayId());
  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => getActivePlayId());

  // Failed image trackers for reload/retry
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [imageReloadKeys, setImageReloadKeys] = useState<Record<string, number>>({});

  // Plan creation inline state
  const [isCreatingPlan, setIsCreatingPlan] = useState<boolean>(false);
  const [newPlanName, setNewPlanName] = useState<string>('');

  // Toast feedback
  const [actionToast, setActionToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 1800);
  }, []);

  // Filtered Lineups
  const filteredLineups = useMemo(() => {
    return lineups.filter((l) => {
      if (l.map !== selectedMap) return false;
      if (selectedSide !== 'ALL' && l.side !== selectedSide) return false;
      if (selectedUtility !== 'ALL' && l.utilityType !== selectedUtility) return false;
      if (pixelSearch.trim()) {
        const query = pixelSearch.toLowerCase();
        const matchesTitle = l.title.toLowerCase().includes(query);
        const matchesStand = l.startPosition?.callout?.toLowerCase().includes(query);
        const matchesAim = l.aimReference?.crosshairPlacement?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesStand && !matchesAim) return false;
      }
      return true;
    });
  }, [lineups, selectedMap, selectedSide, selectedUtility, pixelSearch]);

  // Filtered Plans
  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      if (planSearch.trim()) {
        const q = planSearch.toLowerCase();
        return p.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [plans, planSearch]);

  // Current selected plan object
  const currentPlan = useMemo(() => {
    return plans.find((p) => p.id === selectedPlanId) || plans[0] || null;
  }, [plans, selectedPlanId]);

  // Add pixel to current plan
  const handleAddPixelToPlan = (lineup: Lineup) => {
    if (!currentPlan) return;
    const updated = addPixelToPlay(currentPlan.id, lineup.id);
    if (updated) {
      setPlans(getAllPlays());
      showToast(`+ ADDED TO [${currentPlan.name}]`);
    }
  };

  // Remove pixel from plan
  const handleRemovePixel = (idx: number) => {
    if (!currentPlan) return;
    const updated = removePixelFromPlay(currentPlan.id, idx);
    if (updated) {
      setPlans(getAllPlays());
    }
  };

  // Move pixel up/down
  const handleMovePixel = (idx: number, dir: 'UP' | 'DOWN') => {
    if (!currentPlan) return;
    const updated = movePixelInPlay(currentPlan.id, idx, dir);
    if (updated) {
      setPlans(getAllPlays());
    }
  };

  // Create new Plan
  const handleCreatePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim()) return;
    const newPlay: TacticalPlan = {
      id: `plan-${Date.now()}`,
      name: newPlanName.trim(),
      map: selectedMap,
      side: 'T',
      lineupIds: [],
      createdAt: new Date().toISOString(),
    };
    dbSavePlay(newPlay);
    const updated = getAllPlays();
    setPlans(updated);
    setSelectedPlanId(newPlay.id);
    setNewPlanName('');
    setIsCreatingPlan(false);
    showToast(`PLAN CREATED`);
  };

  // Set as In-Game Active Plan
  const handleSetActivePlan = (id: string) => {
    setActivePlayId(id);
    setActivePlanIdState(id);
    showToast(`SYNCED TO IN-GAME OVERLAY`);
  };

  // Image load error & retry
  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const handleRetryImage = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: false }));
    setImageReloadKeys((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#09090b] text-[#f4f4f5] font-mono select-none overflow-hidden">
      {/* Top Bar: Settings Button (Left) & Active Status Toast (Right) */}
      <div className="h-10 border-b border-zinc-800 bg-[#0c0c0e] px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
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

        {actionToast && (
          <div className="text-[10px] font-bold text-cyan-400 bg-cyan-950 border border-cyan-800 px-3 py-0.5 tracking-wider uppercase animate-fade-in">
            {actionToast}
          </div>
        )}
      </div>

      {/* Main Split Layout: Left (Pixels) | Right (Plans) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-x divide-zinc-800 overflow-hidden">
        {/* ==================================================================== */}
        {/* LEFT COLUMN: PIXELS EXPLORER                                        */}
        {/* ==================================================================== */}
        <div className="flex flex-col h-full overflow-hidden bg-[#09090b] p-3 gap-3">
          {/* 1. Map Selector (Names only) */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar shrink-0">
            {COMPETITIVE_MAPS.map((m) => {
              const active = m.id === selectedMap;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMap(m.id)}
                  className={`px-3 py-1 text-xs font-bold border transition-colors shrink-0 ${
                    active
                      ? 'border-cyan-400 bg-cyan-950/70 text-cyan-300'
                      : 'border-zinc-800 bg-black/60 text-zinc-500 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* 2. Filter Row: C4 (T) & Kit (CT) + Grenade Type Icons (Strictly icons) */}
          <div className="flex items-center justify-between border border-zinc-800 bg-[#0c0c0e] px-3 py-1.5 shrink-0">
            {/* Side Icons */}
            <div className="flex items-center gap-1.5">
              {/* T Side: C4 Bomb Icon */}
              <button
                onClick={() => setSelectedSide(selectedSide === 'T' ? 'ALL' : 'T')}
                title="T Side (C4)"
                className={`p-1.5 border transition-colors ${
                  selectedSide === 'T'
                    ? 'border-amber-500 bg-amber-950/60 text-amber-400'
                    : 'border-zinc-800 bg-black/50 text-zinc-600 hover:text-zinc-300'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="4" y="6" width="16" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M7 10h10M7 14h10" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                </svg>
              </button>

              {/* CT Side: Defuse Kit Icon */}
              <button
                onClick={() => setSelectedSide(selectedSide === 'CT' ? 'ALL' : 'CT')}
                title="CT Side (Defuse Kit)"
                className={`p-1.5 border transition-colors ${
                  selectedSide === 'CT'
                    ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300'
                    : 'border-zinc-800 bg-black/50 text-zinc-600 hover:text-zinc-300'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
                  <path d="M9 8V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3" />
                  <path d="M12 11v6M9 14h6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Utility Type Icons */}
            <div className="flex items-center gap-1.5">
              {/* Smoke */}
              <button
                onClick={() => setSelectedUtility(selectedUtility === 'SMOKE' ? 'ALL' : 'SMOKE')}
                title="Smoke"
                className={`p-1.5 border transition-colors ${
                  selectedUtility === 'SMOKE'
                    ? 'border-zinc-300 bg-zinc-800 text-zinc-100'
                    : 'border-zinc-800 bg-black/50 text-zinc-600 hover:text-zinc-300'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="7" y="7" width="10" height="14" rx="2" />
                  <path d="M10 7V4h4v3" />
                  <circle cx="12" cy="14" r="2" />
                </svg>
              </button>

              {/* Flashbang */}
              <button
                onClick={() => setSelectedUtility(selectedUtility === 'FLASHBANG' ? 'ALL' : 'FLASHBANG')}
                title="Flashbang"
                className={`p-1.5 border transition-colors ${
                  selectedUtility === 'FLASHBANG'
                    ? 'border-amber-400 bg-amber-950/60 text-amber-300'
                    : 'border-zinc-800 bg-black/50 text-zinc-600 hover:text-zinc-300'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </button>

              {/* Molotov */}
              <button
                onClick={() => setSelectedUtility(selectedUtility === 'MOLOTOV' ? 'ALL' : 'MOLOTOV')}
                title="Molotov"
                className={`p-1.5 border transition-colors ${
                  selectedUtility === 'MOLOTOV'
                    ? 'border-rose-500 bg-rose-950/60 text-rose-300'
                    : 'border-zinc-800 bg-black/50 text-zinc-600 hover:text-zinc-300'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
              </button>

              {/* HE Grenade */}
              <button
                onClick={() => setSelectedUtility(selectedUtility === 'HE_GRENADE' ? 'ALL' : 'HE_GRENADE')}
                title="HE Grenade"
                className={`p-1.5 border transition-colors ${
                  selectedUtility === 'HE_GRENADE'
                    ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300'
                    : 'border-zinc-800 bg-black/50 text-zinc-600 hover:text-zinc-300'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="14" r="7" />
                  <path d="M12 7V3M9 5h6" />
                </svg>
              </button>
            </div>
          </div>

          {/* 3. Search Bar for Pixels */}
          <div className="relative shrink-0">
            <input
              type="text"
              value={pixelSearch}
              onChange={(e) => setPixelSearch(e.target.value)}
              placeholder="SEARCH PIXELS..."
              className="w-full bg-[#0c0c0e] border border-zinc-800 text-xs px-3 py-1.5 text-zinc-200 placeholder-zinc-600 focus:border-cyan-500 outline-none"
            />
            {pixelSearch && (
              <button
                onClick={() => setPixelSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
              >
                ✕
              </button>
            )}
          </div>

          {/* 4. Pixels Grid with '+' Button & Image Retry */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredLineups.map((lineup) => {
              const hasFailed = failedImages[lineup.id];
              const reloadKey = imageReloadKeys[lineup.id] || 0;
              const imgUrl = lineup.imageUrl || lineup.thumbnailUrl;

              return (
                <div
                  key={lineup.id}
                  className="p-2.5 border border-zinc-800 bg-[#0c0c0e] hover:border-zinc-700 transition-colors flex items-center justify-between gap-3"
                >
                  {/* Thumbnail / Image with Retry State */}
                  <div className="relative w-20 h-14 bg-black border border-zinc-800 rounded shrink-0 overflow-hidden flex items-center justify-center">
                    {hasFailed ? (
                      <div className="flex flex-col items-center justify-center gap-1 p-1">
                        <span className="text-amber-400 text-xs">⚠</span>
                        <button
                          onClick={() => handleRetryImage(lineup.id)}
                          className="text-[8px] border border-zinc-700 bg-zinc-900 px-1 py-0.2 text-cyan-400 hover:border-cyan-400"
                        >
                          RETRY
                        </button>
                      </div>
                    ) : imgUrl ? (
                      <img
                        key={`${lineup.id}-${reloadKey}`}
                        src={imgUrl}
                        alt=""
                        onError={() => handleImageError(lineup.id)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[9px] text-zinc-600">NO IMG</span>
                    )}
                  </div>

                  {/* Title & Callouts */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <span className="text-xs font-bold text-zinc-100 truncate">
                      {lineup.title}
                    </span>
                    <span className="text-[10px] text-zinc-400 truncate">
                      {lineup.throwType} • {lineup.startPosition?.callout || 'Spot'}
                    </span>
                    {lineup.aimReference?.crosshairPlacement && (
                      <span className="text-[9px] text-cyan-400/80 truncate">
                        AIM: {lineup.aimReference.crosshairPlacement}
                      </span>
                    )}
                  </div>

                  {/* '+' Button (Strictly '+', no text) */}
                  <button
                    onClick={() => handleAddPixelToPlan(lineup)}
                    title={`Add to Plan: ${currentPlan?.name || 'Active'}`}
                    className="w-8 h-8 rounded border border-zinc-700 bg-black hover:border-cyan-400 hover:text-cyan-300 text-zinc-300 font-bold flex items-center justify-center text-sm transition-colors shrink-0"
                  >
                    +
                  </button>
                </div>
              );
            })}

            {filteredLineups.length === 0 && (
              <div className="h-48 flex items-center justify-center text-zinc-600 text-xs">
                NO PIXELS MATCHING CURRENT FILTERS
              </div>
            )}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* RIGHT COLUMN: PLANS (Tactical Playbook)                             */}
        {/* ==================================================================== */}
        <div className="flex flex-col h-full overflow-hidden bg-[#09090b] p-3 gap-3">
          {/* 1. Plans Top Bar: Search & '+' Button to Create */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex-1">
              <input
                type="text"
                value={planSearch}
                onChange={(e) => setPlanSearch(e.target.value)}
                placeholder="SEARCH PLANS..."
                className="w-full bg-[#0c0c0e] border border-zinc-800 text-xs px-3 py-1.5 text-zinc-200 placeholder-zinc-600 focus:border-cyan-500 outline-none"
              />
              {planSearch && (
                <button
                  onClick={() => setPlanSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={() => setIsCreatingPlan(!isCreatingPlan)}
              title="Create New Plan"
              className="w-8 h-8 border border-cyan-700 bg-cyan-950/70 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-900 font-bold flex items-center justify-center text-base transition-colors shrink-0"
            >
              +
            </button>
          </div>

          {/* Inline Plan Creation Form */}
          {isCreatingPlan && (
            <form onSubmit={handleCreatePlanSubmit} className="flex items-center gap-2 border border-cyan-800 bg-cyan-950/30 p-2 shrink-0">
              <input
                type="text"
                autoFocus
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                placeholder="PLAN NAME..."
                className="flex-1 bg-black border border-zinc-700 text-xs px-2 py-1 text-zinc-200 outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="text-xs border border-cyan-500 bg-cyan-950 px-3 py-1 text-cyan-300 font-bold hover:bg-cyan-900"
              >
                CREATE
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingPlan(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300 px-1"
              >
                ✕
              </button>
            </form>
          )}

          {/* 2. Plans Selector Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
            {filteredPlans.map((p) => {
              const isSelected = p.id === currentPlan?.id;
              const isLiveActive = p.id === activePlanId;

              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  className={`px-3 py-1.5 text-xs border transition-colors shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200'
                      : 'border-zinc-800 bg-[#0c0c0e] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {isLiveActive && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />}
                  <span className="font-bold truncate max-w-[120px]">{p.name}</span>
                  <span className="text-[9px] text-zinc-500 tabular-nums">({p.lineupIds?.length || 0})</span>
                </button>
              );
            })}
          </div>

          {/* 3. Selected Plan Header with Active In-Game Sync */}
          {currentPlan && (
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 shrink-0">
              <div className="flex items-center gap-2 truncate">
                <span className="text-xs font-bold text-zinc-200 uppercase truncate">
                  {currentPlan.name}
                </span>
                <span className="text-[10px] text-zinc-500 tabular-nums">
                  [{currentPlan.lineupIds?.length || 0} PIXELS]
                </span>
              </div>

              <div className="flex items-center gap-2">
                {currentPlan.id === activePlanId ? (
                  <span className="text-[9px] font-black tracking-wider text-cyan-400 border border-cyan-800 bg-cyan-950 px-2 py-0.5">
                    ● ACTIVE IN-GAME
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetActivePlan(currentPlan.id)}
                    className="text-[9px] font-bold border border-zinc-800 hover:border-cyan-500 text-zinc-400 hover:text-cyan-300 px-2 py-0.5 transition-colors"
                  >
                    SET ACTIVE
                  </button>
                )}

                <button
                  onClick={() => {
                    if (confirm(`Delete plan "${currentPlan.name}"?`)) {
                      dbDeletePlay(currentPlan.id);
                      setPlans(getAllPlays());
                    }
                  }}
                  title="Delete Plan"
                  className="text-zinc-600 hover:text-rose-400 text-xs px-1"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* 4. Ordered Pixels in Selected Plan */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {currentPlan?.lineupIds?.map((lineupId, idx) => {
              const lineup = lineups.find((l) => l.id === lineupId);
              if (!lineup) return null;

              return (
                <div
                  key={`${lineupId}-${idx}`}
                  className="p-2 border border-zinc-800 bg-[#0c0c0e] flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-[11px] font-bold text-zinc-500 tabular-nums">
                      #{String(idx + 1).padStart(2, '0')}
                    </span>

                    {/* Miniature thumbnail */}
                    <div className="w-10 h-7 bg-black border border-zinc-800 rounded shrink-0 overflow-hidden flex items-center justify-center">
                      {lineup.imageUrl || lineup.thumbnailUrl ? (
                        <img
                          src={lineup.imageUrl || lineup.thumbnailUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[7px] text-zinc-600">NO IMG</span>
                      )}
                    </div>

                    <div className="flex flex-col truncate">
                      <span className="font-bold text-zinc-200 truncate">{lineup.title}</span>
                      <span className="text-[9px] text-zinc-500 truncate">{lineup.throwType}</span>
                    </div>
                  </div>

                  {/* Ordering (▲ / ▼) and Delete (✕) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMovePixel(idx, 'UP')}
                      title="Move Up"
                      className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20 text-[10px]"
                    >
                      ▲
                    </button>
                    <button
                      disabled={idx === (currentPlan.lineupIds?.length || 0) - 1}
                      onClick={() => handleMovePixel(idx, 'DOWN')}
                      title="Move Down"
                      className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20 text-[10px]"
                    >
                      ▼
                    </button>
                    <button
                      onClick={() => handleRemovePixel(idx)}
                      title="Remove"
                      className="p-1 text-zinc-500 hover:text-rose-400 text-xs ml-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}

            {(!currentPlan?.lineupIds || currentPlan.lineupIds.length === 0) && (
              <div className="h-48 flex flex-col items-center justify-center text-zinc-600 text-xs gap-1">
                <span>THIS PLAN HAS NO PIXELS YET</span>
                <span className="text-[10px] text-zinc-700">Click '+' on any pixel from the left column to add</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UtilityRoomView;
