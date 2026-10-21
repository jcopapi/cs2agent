/**
 * CS2 Assistant - Precision Split-Screen Launcher
 * File: src/renderer/components/destinations/UtilityRoomView.tsx
 *
 * Implements the streamlined two-column split view:
 * - Left: Pixels Explorer (Map selector, C4/Kit side icons, Smoke/Bang/Molly/HE icons, search without text placeholder, cards with '+' button)
 * - Right Top: Plans Manager (Search, '+' create plan, 2-row plan selector, TR/CT side filter, trash can delete, ordered steps with ▲/▼/✕, active in-game sync)
 * - Right Bottom: Detailed Pixel Inspector (enlarged image with crossed lines on screenshot, reload button, stand/aim landmarks, written tutorial)
 * - Top-Left: Gear icon for Settings
 * - Custom tooltips on button hover
 * - Custom slim vertical scrollbars with zero horizontal overflow
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { CS2Map, TeamSide, UtilityType, Lineup } from '../../../core/utility/types';
import type { Play as TacticalPlan } from '../../../shared/ipc-types';
import { getAllLineups, saveLineup } from '../../../core/utility/lineup-database';
import {
  getAllPlays,
  savePlay as dbSavePlay,
  deletePlay as dbDeletePlay,
  getActivePlayId,
  setActivePlayId,
  addPixelToPlay,
  removePixelFromPlay,
  movePixelInPlay,
  exportPlayToCode,
  importPlayFromCode,
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
  const [planSideFilter, setPlanSideFilter] = useState<TeamSide | 'ALL'>('ALL');

  // Database States
  const [lineups, setLineups] = useState<Lineup[]>(() => getAllLineups());
  const [plans, setPlans] = useState<TacticalPlan[]>(() => getAllPlays());
  const [activePlanId, setActivePlanIdState] = useState<string>(() => getActivePlayId());
  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => getActivePlayId());

  // Detailed Pixel Inspector State (selected pixel for enlarged view & tutorial)
  const [inspectedLineup, setInspectedLineup] = useState<Lineup | null>(() => {
    const all = getAllLineups();
    return all.length > 0 ? all[0] : null;
  });

  // Failed image trackers for reload/retry
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [imageReloadKeys, setImageReloadKeys] = useState<Record<string, number>>({});

  // Plan creation & import inline state
  const [isCreatingPlan, setIsCreatingPlan] = useState<boolean>(false);
  const [newPlanName, setNewPlanName] = useState<string>('');
  const [newPlanSide, setNewPlanSide] = useState<TeamSide>('T');
  const [isImportingPlan, setIsImportingPlan] = useState<boolean>(false);
  const [importCodeValue, setImportCodeValue] = useState<string>('');

  // Pixel Renaming State
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [editingTitleValue, setEditingTitleValue] = useState<string>('');

  // Inspector Preview Mode: 'AIM' (aim point with crosshair) or 'RESULT' (smoke bloom result)
  const [inspectorViewMode, setInspectorViewMode] = useState<'AIM' | 'RESULT'>('AIM');

  const handleSelectInspectedLineup = (l: Lineup) => {
    setInspectedLineup(l);
    setIsEditingTitle(false);
    setInspectorViewMode('AIM');
  };

  const handleStartRename = (currentTitle: string) => {
    setEditingTitleValue(currentTitle);
    setIsEditingTitle(true);
  };

  const handleSaveRename = () => {
    if (!inspectedLineup || !editingTitleValue.trim()) {
      setIsEditingTitle(false);
      return;
    }
    const updated = saveLineup({
      ...inspectedLineup,
      title: editingTitleValue.trim(),
    });
    setLineups(getAllLineups());
    setInspectedLineup(updated);
    setIsEditingTitle(false);
    showToast(`PIXEL RENAMED`);
  };

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

  // Keep inspectedLineup in sync if filtered list changes
  useEffect(() => {
    if (filteredLineups.length > 0 && !inspectedLineup) {
      setInspectedLineup(filteredLineups[0]);
    }
  }, [filteredLineups, inspectedLineup]);

  // Filtered Plans (with TR / CT filter & search)
  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      if (planSideFilter !== 'ALL' && p.side && p.side !== planSideFilter) {
        return false;
      }
      if (planSearch.trim()) {
        const q = planSearch.toLowerCase();
        return p.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [plans, planSideFilter, planSearch]);

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
      side: newPlanSide,
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

  const handleExportPlan = (plan: TacticalPlan) => {
    const code = exportPlayToCode(plan);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
    }
    showToast(`PLAN CODE COPIED TO CLIPBOARD`);
  };

  const handleImportPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importCodeValue.trim()) return;
    const imported = importPlayFromCode(importCodeValue.trim());
    if (imported) {
      const all = getAllPlays();
      setPlans(all);
      setSelectedPlanId(imported.id);
      setIsImportingPlan(false);
      setImportCodeValue('');
      showToast(`PLAN IMPORTED: ${imported.name}`);
    } else {
      showToast(`INVALID PLAN CODE`);
    }
  };

  // Set as In-Game Active Plan
  const handleSetActivePlan = (id: string) => {
    setActivePlayId(id);
    setActivePlanIdState(id);
    const plan = plans.find((p) => p.id === id) || null;
    window.cs2Assistant?.play?.setActivePlan?.(plan, 0);
    showToast(`SYNCED TO IN-GAME OVERLAY`);
  };

  useEffect(() => {
    const active = plans.find((p) => p.id === activePlanId) || null;
    if (active) {
      window.cs2Assistant?.play?.setActivePlan?.(active, 0);
    }
  }, []);

  // Image load error & retry
  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const handleRetryImage = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: false }));
    setImageReloadKeys((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    showToast(`RELOADING IMAGE...`);
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

      {/* Main Split Layout: Left (Pixels) | Right (Plans & Inspector) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-x divide-zinc-800 overflow-hidden">
        {/* ==================================================================== */}
        {/* LEFT COLUMN: PIXELS EXPLORER                                        */}
        {/* ==================================================================== */}
        <div className="flex flex-col h-full overflow-hidden bg-[#09090b] p-3 gap-3">
          {/* 1. Map Selector (Names only with tooltips) */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar shrink-0">
            {COMPETITIVE_MAPS.map((m) => {
              const active = m.id === selectedMap;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMap(m.id)}
                  title={`Map: ${m.label}`}
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

          {/* 2. Filter Row: C4 (T) & Kit (CT) + Grenade Type Icons (with tooltips) */}
          <div className="flex items-center justify-between border border-zinc-800 bg-[#0c0c0e] px-3 py-1.5 shrink-0">
            {/* Side Icons */}
            <div className="flex items-center gap-1.5">
              {/* T Side: C4 Bomb Icon */}
              <button
                onClick={() => setSelectedSide(selectedSide === 'T' ? 'ALL' : 'T')}
                title="Terrorist (T Side - C4)"
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
                title="Counter-Terrorist (CT Side - Defuse Kit)"
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
                title="Smokes"
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
                title="Flashbangs"
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
                title="Molotovs / Incendiaries"
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
                title="HE Grenades"
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

          {/* 3. Search Bar for Pixels (Placeholder removed as requested) */}
          <div className="relative shrink-0">
            <input
              type="text"
              value={pixelSearch}
              onChange={(e) => setPixelSearch(e.target.value)}
              placeholder=""
              className="w-full bg-[#0c0c0e] border border-zinc-800 text-xs px-3 py-1.5 text-zinc-200 placeholder-zinc-600 focus:border-cyan-500 outline-none"
            />
            {pixelSearch ? (
              <button
                onClick={() => setPixelSearch('')}
                title="Clear Search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
              >
                ✕
              </button>
            ) : (
              <svg className="w-3.5 h-3.5 text-zinc-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>

          {/* 4. Pixels Grid with '+' Button & Image Retry */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredLineups.map((lineup) => {
              const hasFailed = failedImages[lineup.id];
              const reloadKey = imageReloadKeys[lineup.id] || 0;
              const imgUrl = lineup.imageUrl || lineup.thumbnailUrl;
              const isSelected = inspectedLineup?.id === lineup.id;

              return (
                <div
                  key={lineup.id}
                  onClick={() => handleSelectInspectedLineup(lineup)}
                  className={`p-2.5 border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-sm'
                      : 'border-zinc-800 bg-[#0c0c0e] hover:border-zinc-700'
                  }`}
                >
                  {/* Thumbnail / Image with Retry State */}
                  <div className="relative w-20 h-14 bg-black border border-zinc-800 rounded shrink-0 overflow-hidden flex items-center justify-center">
                    {hasFailed ? (
                      <div className="flex flex-col items-center justify-center gap-1 p-1">
                        <span className="text-amber-400 text-xs">⚠</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRetryImage(lineup.id);
                          }}
                          title="Retry Loading Image"
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddPixelToPlan(lineup);
                    }}
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
        {/* RIGHT COLUMN: PLANS (TOP) & DETAILED INSPECTOR (BOTTOM)              */}
        {/* ==================================================================== */}
        <div className="flex flex-col h-full overflow-hidden bg-[#09090b] p-3 gap-3">
          {/* ================= TOP HALF: PLANS MANAGER ================= */}
          <div className="flex flex-col h-1/2 overflow-hidden border border-zinc-800 bg-[#0c0c0e] p-2.5 gap-2">
            {/* 1. Plans Top Bar: Search, Side Filter (TR/CT), & '+' Create Button */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={planSearch}
                  onChange={(e) => setPlanSearch(e.target.value)}
                  placeholder=""
                  className="w-full bg-black border border-zinc-800 text-xs px-3 py-1 text-zinc-200 placeholder-zinc-600 focus:border-cyan-500 outline-none"
                />
                {planSearch ? (
                  <button
                    onClick={() => setPlanSearch('')}
                    title="Clear Search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
                  >
                    ✕
                  </button>
                ) : (
                  <svg className="w-3.5 h-3.5 text-zinc-600 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>

              {/* Side Filter for Plans: ALL / T / CT */}
              <div className="flex items-center border border-zinc-800 bg-black">
                <button
                  onClick={() => setPlanSideFilter('ALL')}
                  title="All Plans"
                  className={`px-2 py-0.5 text-[10px] font-bold transition-colors ${
                    planSideFilter === 'ALL' ? 'bg-cyan-950 text-cyan-300' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  ALL
                </button>
                <button
                  onClick={() => setPlanSideFilter('T')}
                  title="Terrorist Plans (T Side)"
                  className={`px-2 py-0.5 text-[10px] font-bold transition-colors ${
                    planSideFilter === 'T' ? 'bg-amber-950 text-amber-300' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  T
                </button>
                <button
                  onClick={() => setPlanSideFilter('CT')}
                  title="Counter-Terrorist Plans (CT Side)"
                  className={`px-2 py-0.5 text-[10px] font-bold transition-colors ${
                    planSideFilter === 'CT' ? 'bg-cyan-950 text-cyan-300' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  CT
                </button>
              </div>

              <button
                onClick={() => {
                  setIsCreatingPlan(!isCreatingPlan);
                  setIsImportingPlan(false);
                }}
                title="Create New Plan"
                className="w-7 h-7 border border-cyan-700 bg-cyan-950/70 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-900 font-bold flex items-center justify-center text-sm transition-colors shrink-0"
              >
                +
              </button>
              <button
                onClick={() => {
                  setIsImportingPlan(!isImportingPlan);
                  setIsCreatingPlan(false);
                }}
                title="Import Plan from Share Code"
                className="w-7 h-7 border border-zinc-700 bg-black text-cyan-400 hover:border-cyan-400 hover:bg-zinc-900 font-bold flex items-center justify-center text-xs transition-colors shrink-0"
              >
                ↓
              </button>
            </div>

            {/* Inline Plan Import Form */}
            {isImportingPlan && (
              <form onSubmit={handleImportPlanSubmit} className="flex items-center gap-2 border border-cyan-800 bg-cyan-950/30 p-1.5 shrink-0">
                <input
                  type="text"
                  autoFocus
                  value={importCodeValue}
                  onChange={(e) => setImportCodeValue(e.target.value)}
                  placeholder="PASTE PLAN CODE (JCO-...)"
                  className="flex-1 bg-black border border-zinc-700 text-xs px-2 py-0.5 text-zinc-200 outline-none focus:border-cyan-400 font-mono"
                />
                <button
                  type="submit"
                  className="text-xs border border-cyan-500 bg-cyan-950 px-2 py-0.5 text-cyan-300 font-bold hover:bg-cyan-900"
                >
                  IMPORT
                </button>
                <button
                  type="button"
                  onClick={() => setIsImportingPlan(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 px-1"
                >
                  ✕
                </button>
              </form>
            )}

            {/* Inline Plan Creation Form */}
            {isCreatingPlan && (
              <form onSubmit={handleCreatePlanSubmit} className="flex items-center gap-2 border border-cyan-800 bg-cyan-950/30 p-1.5 shrink-0">
                <input
                  type="text"
                  autoFocus
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  placeholder="PLAN NAME..."
                  className="flex-1 bg-black border border-zinc-700 text-xs px-2 py-0.5 text-zinc-200 outline-none focus:border-cyan-400"
                />
                <select
                  value={newPlanSide}
                  onChange={(e) => setNewPlanSide(e.target.value as TeamSide)}
                  className="bg-black border border-zinc-700 text-[10px] text-cyan-300 px-1 py-0.5 outline-none"
                >
                  <option value="T">T</option>
                  <option value="CT">CT</option>
                </select>
                <button
                  type="submit"
                  className="text-xs border border-cyan-500 bg-cyan-950 px-2 py-0.5 text-cyan-300 font-bold hover:bg-cyan-900"
                >
                  OK
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

            {/* 2. Multi-row Plans Selector (2 Rows to reduce horizontal scrolling) */}
            <div className="flex flex-wrap gap-1.5 max-h-[66px] overflow-y-auto pr-1 shrink-0">
              {filteredPlans.map((p) => {
                const isSelected = p.id === currentPlan?.id;
                const isLiveActive = p.id === activePlanId;

                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlanId(p.id)}
                    title={`Select Plan: ${p.name}`}
                    className={`px-2 py-1 text-[11px] border transition-colors shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/80 text-cyan-200'
                        : 'border-zinc-800 bg-black/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    {isLiveActive && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />}
                    <span className="font-bold truncate max-w-[130px]">{p.name}</span>
                    <span className="text-[10px] font-bold text-zinc-400 tabular-nums">{p.lineupIds?.length || 0}</span>
                  </button>
                );
              })}
            </div>

            {/* 3. Selected Plan Header with Active In-Game Sync, Export Share Code & Trash Can Delete */}
            {currentPlan && (
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 shrink-0">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-xs font-bold text-zinc-200 uppercase truncate">
                    {currentPlan.name}
                  </span>
                  <span className="text-[10px] font-bold text-cyan-400 tabular-nums">
                    [{currentPlan.lineupIds?.length || 0}]
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Share / Export Plan Code */}
                  <button
                    onClick={() => handleExportPlan(currentPlan)}
                    title="Export Plan Share Code"
                    className="p-1 text-zinc-400 hover:text-cyan-300 border border-zinc-800 hover:border-cyan-700 bg-black transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>

                  {currentPlan.id === activePlanId ? (
                    <span className="text-[9px] font-black tracking-wider text-cyan-400 border border-cyan-800 bg-cyan-950 px-2 py-0.5">
                      ● ACTIVE IN-GAME
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetActivePlan(currentPlan.id)}
                      title="Set as Active In-Game Overlay Plan"
                      className="text-[9px] font-bold border border-zinc-800 hover:border-cyan-500 text-zinc-400 hover:text-cyan-300 px-2 py-0.5 transition-colors"
                    >
                      SET ACTIVE
                    </button>
                  )}

                  {/* Trash Can Delete Icon Button (Strictly for plans as requested) */}
                  <button
                    onClick={() => {
                      if (confirm(`Delete plan "${currentPlan.name}"?`)) {
                        dbDeletePlay(currentPlan.id);
                        setPlans(getAllPlays());
                      }
                    }}
                    title="Delete Plan"
                    className="p-1 text-zinc-500 hover:text-rose-400 border border-transparent hover:border-rose-900 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* 4. Ordered Pixels in Selected Plan */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {currentPlan?.lineupIds?.map((lineupId, idx) => {
                const lineup = lineups.find((l) => l.id === lineupId);
                if (!lineup) return null;

                return (
                  <div
                    key={`${lineupId}-${idx}`}
                    onClick={() => handleSelectInspectedLineup(lineup)}
                    className="p-1.5 border border-zinc-800 bg-black/60 hover:border-zinc-700 cursor-pointer flex items-center justify-between gap-2 text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] font-bold text-zinc-500 tabular-nums">
                        #{String(idx + 1).padStart(2, '0')}
                      </span>

                      <div className="w-8 h-6 bg-black border border-zinc-800 rounded shrink-0 overflow-hidden flex items-center justify-center">
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
                        <span className="font-bold text-zinc-200 truncate text-[11px]">{lineup.title}</span>
                        <span className="text-[9px] text-zinc-500 truncate">{lineup.throwType}</span>
                      </div>
                    </div>

                    {/* Ordering (▲ / ▼) and Delete (✕) */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        disabled={idx === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMovePixel(idx, 'UP');
                        }}
                        title="Move Step Up"
                        className="p-0.5 text-zinc-500 hover:text-zinc-200 disabled:opacity-20 text-[10px]"
                      >
                        ▲
                      </button>
                      <button
                        disabled={idx === (currentPlan.lineupIds?.length || 0) - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMovePixel(idx, 'DOWN');
                        }}
                        title="Move Step Down"
                        className="p-0.5 text-zinc-500 hover:text-zinc-200 disabled:opacity-20 text-[10px]"
                      >
                        ▼
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePixel(idx);
                        }}
                        title="Remove from Plan"
                        className="p-0.5 text-zinc-500 hover:text-rose-400 text-xs ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}

              {(!currentPlan?.lineupIds || currentPlan.lineupIds.length === 0) && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-xs gap-1">
                  <span>THIS PLAN HAS NO PIXELS YET</span>
                  <span className="text-[9px] text-zinc-700">Click '+' on any pixel from the left column to add</span>
                </div>
              )}
            </div>
          </div>

          {/* ================= BOTTOM HALF: DETAILED PIXEL INSPECTOR ================= */}
          {/* Enlarged image with crossed lines on screenshot, reload button, stand/aim landmarks, written tutorial */}
          <div className="flex flex-col h-1/2 overflow-hidden border border-zinc-800 bg-[#0c0c0e] p-2.5 gap-2">
            {inspectedLineup ? (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Header: Title, Rename, Throw Type, and Reload Button */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 shrink-0 gap-2">
                  <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 shrink-0" />
                    {isEditingTitle ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSaveRename();
                        }}
                        className="flex items-center gap-1.5"
                      >
                        <input
                          type="text"
                          autoFocus
                          value={editingTitleValue}
                          onChange={(e) => setEditingTitleValue(e.target.value)}
                          className="bg-black border border-cyan-400 text-xs px-2 py-0.5 text-zinc-100 outline-none w-48"
                        />
                        <button
                          type="submit"
                          title="Save Name"
                          className="text-[9px] border border-cyan-500 bg-cyan-950 px-1.5 py-0.5 text-cyan-300 font-bold hover:bg-cyan-900"
                        >
                          SAVE
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingTitle(false)}
                          title="Cancel"
                          className="text-xs text-zinc-500 hover:text-zinc-300 px-1"
                        >
                          ✕
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-xs font-bold text-zinc-100 uppercase truncate">
                          {inspectedLineup.title}
                        </span>
                        <button
                          onClick={() => handleStartRename(inspectedLineup.title)}
                          title="Rename Pixel"
                          className="p-1 text-zinc-500 hover:text-cyan-300 transition-colors shrink-0"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <span className="border border-cyan-800 bg-cyan-950 text-cyan-300 px-1.5 py-0.2 text-[9px] font-bold shrink-0">
                      {inspectedLineup.throwType}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleRetryImage(inspectedLineup.id)}
                      title="Reload / Refresh Screenshot"
                      className="border border-zinc-700 bg-black text-[9px] px-2 py-0.5 text-cyan-300 hover:border-cyan-400 hover:bg-zinc-900 flex items-center gap-1 transition-colors"
                    >
                      <span>↻</span> RELOAD
                    </button>
                    <button
                      onClick={() => handleAddPixelToPlan(inspectedLineup)}
                      title="Add to Active Plan"
                      className="border border-cyan-700 bg-cyan-950 text-[9px] px-2 py-0.5 text-cyan-200 font-bold hover:bg-cyan-900 transition-colors"
                    >
                      + ADD TO PLAN
                    </button>
                  </div>
                </div>

                {/* Content: Enlarged Image (Left) + Description & Tutorial (Right) */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 overflow-hidden">
                  {/* Left: Enlarged Screenshot with Aim / Smoke Result Mode Switcher */}
                  <div className="relative h-full bg-black border border-zinc-800 rounded overflow-hidden flex items-center justify-center">
                    {/* View Mode Tabs: Aim Point vs Smoke Result */}
                    <div className="absolute top-1.5 left-1.5 z-20 flex items-center gap-1 bg-black/80 p-0.5 border border-zinc-800 rounded">
                      <button
                        onClick={() => setInspectorViewMode('AIM')}
                        className={`px-2 py-0.5 text-[9px] font-bold rounded transition-colors ${
                          inspectorViewMode === 'AIM'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        AIM POINT
                      </button>
                      {(inspectedLineup.thumbnailUrl || inspectedLineup.resultImageUrl) && (
                        <button
                          onClick={() => setInspectorViewMode('RESULT')}
                          className={`px-2 py-0.5 text-[9px] font-bold rounded transition-colors ${
                            inspectorViewMode === 'RESULT'
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          SMOKE RESULT
                        </button>
                      )}
                    </div>

                    {inspectedLineup.imageUrl || inspectedLineup.thumbnailUrl ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        {inspectorViewMode === 'AIM' ? (
                          <>
                            <img
                              key={`${inspectedLineup.id}-aim-${imageReloadKeys[inspectedLineup.id] || 0}`}
                              src={inspectedLineup.imageUrl || inspectedLineup.thumbnailUrl}
                              alt={inspectedLineup.title}
                              className="w-full h-full object-contain"
                            />
                            {/* Crossed lines on the aim screenshot with NO circle */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(34, 211, 238, 0.85)" strokeWidth="1.2" />
                              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(34, 211, 238, 0.85)" strokeWidth="1.2" />
                            </svg>

                            {/* Corner Inset: Click to switch to Smoke Result */}
                            {(inspectedLineup.thumbnailUrl || inspectedLineup.resultImageUrl) && (
                              <div
                                onClick={() => setInspectorViewMode('RESULT')}
                                title="Click to view Smoke Result / Bloom"
                                className="absolute bottom-1 right-1 w-20 h-14 bg-black/90 border border-cyan-500/60 rounded overflow-hidden shadow-lg cursor-pointer hover:border-cyan-300 transition-colors"
                              >
                                <img
                                  src={inspectedLineup.thumbnailUrl || inspectedLineup.resultImageUrl}
                                  alt="Smoke Result"
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-0 left-0 right-0 bg-black/80 text-[7px] text-cyan-300 font-bold text-center leading-none py-0.5">
                                  RESULT ↗
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <img
                              key={`${inspectedLineup.id}-res-${imageReloadKeys[inspectedLineup.id] || 0}`}
                              src={inspectedLineup.thumbnailUrl || inspectedLineup.resultImageUrl || inspectedLineup.imageUrl}
                              alt="Smoke Landing Result"
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute top-1.5 right-1.5 bg-black/80 border border-cyan-800 text-cyan-400 px-2 py-0.5 text-[8px] font-bold">
                              SMOKE BLOOM / LANDING
                            </div>

                            {/* Corner Inset: Click to switch back to Aim Point */}
                            <div
                              onClick={() => setInspectorViewMode('AIM')}
                              title="Click to view Aim Crosshair"
                              className="absolute bottom-1 right-1 w-20 h-14 bg-black/90 border border-cyan-500/60 rounded overflow-hidden shadow-lg cursor-pointer hover:border-cyan-300 transition-colors"
                            >
                              <img
                                src={inspectedLineup.imageUrl || inspectedLineup.thumbnailUrl}
                                alt="Aim Point"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-0 left-0 right-0 bg-black/80 text-[7px] text-cyan-300 font-bold text-center leading-none py-0.5">
                                AIM ↖
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-600 text-xs">NO SCREENSHOT</span>
                    )}
                  </div>

                  {/* Right: Stand, Aim, and Written Step-by-Step Tutorial */}
                  <div className="flex flex-col h-full overflow-y-auto space-y-2 pr-1 text-xs">
                    {/* Stand & Aim Landmarks */}
                    <div className="border border-zinc-800 bg-black/60 p-2 space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-zinc-500 font-bold shrink-0">STAND:</span>
                        <span className="text-zinc-200 text-right font-medium">
                          {inspectedLineup.startPosition?.callout || 'Position'}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-1 pt-1 border-t border-zinc-900">
                        <span className="text-cyan-400 font-bold shrink-0">AIM:</span>
                        <span className="text-cyan-200 text-right font-medium">
                          {inspectedLineup.aimReference?.crosshairPlacement ||
                            inspectedLineup.instructions?.[1] ||
                            'Aim at visual landmark'}
                        </span>
                      </div>
                    </div>

                    {/* Written Step-by-Step Tutorial */}
                    <div className="border border-zinc-800 bg-black/60 p-2 flex-1 space-y-1.5">
                      <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                        // STEP-BY-STEP TUTORIAL
                      </div>
                      <div className="space-y-1 text-[11px] text-zinc-300">
                        {inspectedLineup.instructions && inspectedLineup.instructions.length > 0 ? (
                          inspectedLineup.instructions.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-1.5">
                              <span className="text-cyan-500 font-bold">{sIdx + 1}.</span>
                              <span>{step}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-zinc-500">Stand at position and align crosshair with reference image.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-600 text-xs">
                SELECT A PIXEL TO VIEW DETAILS & TUTORIAL
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UtilityRoomView;
