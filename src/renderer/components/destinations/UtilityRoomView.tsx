/**
 * CS2 Assistant - Precision Tactical HUD Launcher (Stitch UI Overhaul)
 * File: src/renderer/components/destinations/UtilityRoomView.tsx
 *
 * Implements the Google Stitch Tactical HUD aesthetic:
 * - Top App Bar: Brand mark, Active Status, Lineups / Overlay Center navigation, Settings
 * - Left Column (5 Cols): Map Selector Chips with counts, Icon-First Faction & Utility Filters,
 *   Action Buttons (Import from Web, Add Custom Pixel), Search with counter, Lineup Cards
 * - Right Column (7 Cols):
 *   - Top Section (45%): Tactical Plan Manager (Share Code, Quick-Switch Pills, Reorderable Steps)
 *   - Bottom Section (55%): Detailed Inspector Viewport (Reticle Hairlines, Stand Thumbnail, Inline Rename, Tutorial)
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
import { LineupCreatorModal } from '../utility-room/LineupCreatorModal';
import { WebUtilityImporterModal } from '../utility-room/WebUtilityImporterModal';

interface UtilityRoomViewProps {
  onOpenSettings: () => void;
  onGoToOverlayCenter?: () => void;
  isMatchActive?: boolean;
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
  onOpenSettings,
  onGoToOverlayCenter,
  isMatchActive,
}) => {
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

  // Detailed Pixel Inspector State
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

  // Custom Pixel & Web Importer Modals
  const [isCreatingPixel, setIsCreatingPixel] = useState<boolean>(false);
  const [isImportingWeb, setIsImportingWeb] = useState<boolean>(false);

  // Inspector Preview Mode: 'AIM' or 'RESULT'
  const [inspectorViewMode, setInspectorViewMode] = useState<'AIM' | 'RESULT'>('AIM');

  // Toast feedback
  const [actionToast, setActionToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 2000);
  }, []);

  const handleSaveCustomLineup = (newPixel: Lineup) => {
    saveLineup(newPixel);
    const all = getAllLineups();
    setLineups(all);
    setInspectedLineup(newPixel);
    setIsCreatingPixel(false);
    showToast(`CUSTOM PIXEL CREATED: ${newPixel.title}`);
  };

  const handleWebPacksUpdated = () => {
    const all = getAllLineups();
    setLineups(all);
    showToast(`UTILITIES UPDATED FROM WEB`);
  };

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

  // Map total lineup counts
  const mapCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of COMPETITIVE_MAPS) {
      counts[m.id] = lineups.filter((l) => l.map === m.id).length;
    }
    return counts;
  }, [lineups]);

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

  // Filtered Plans (strictly scoped to selectedMap, with TR / CT filter & search)
  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      if (p.map && p.map !== selectedMap) {
        return false;
      }
      if (planSideFilter !== 'ALL' && p.side && p.side !== planSideFilter) {
        return false;
      }
      if (planSearch.trim()) {
        const q = planSearch.toLowerCase();
        return p.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [plans, selectedMap, planSideFilter, planSearch]);

  // Current selected plan object
  const currentPlan = useMemo(() => {
    const match = filteredPlans.find((p) => p.id === selectedPlanId);
    return match || filteredPlans[0] || null;
  }, [filteredPlans, selectedPlanId]);

  // When selected map changes, switch selectedPlanId to first plan of new map if needed
  useEffect(() => {
    const mapPlans = plans.filter((p) => !p.map || p.map === selectedMap);
    if (mapPlans.length > 0 && !mapPlans.some((p) => p.id === selectedPlanId)) {
      setSelectedPlanId(mapPlans[0].id);
    }
  }, [selectedMap, plans]);

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
    showToast(`COPIED CODE: ${code}`);
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

  // Helper for utility icon & color
  const getUtilityMeta = (type: UtilityType) => {
    switch (type) {
      case 'SMOKE':
        return { icon: 'cloud', colorText: 'text-secondary', colorBg: 'bg-secondary' };
      case 'FLASHBANG':
        return { icon: 'flare', colorText: 'text-tertiary', colorBg: 'bg-tertiary' };
      case 'MOLOTOV':
        return { icon: 'local_fire_department', colorText: 'text-danger', colorBg: 'bg-danger' };
      case 'HE_GRENADE':
        return { icon: 'bomb', colorText: 'text-success', colorBg: 'bg-success' };
      default:
        return { icon: 'layers', colorText: 'text-primary', colorBg: 'bg-primary' };
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-surface text-text-primary antialiased select-none overflow-hidden font-sans">
      {/* ==================================================================== */}
      {/* TOP APP BAR (Stitch Design)                                         */}
      {/* ==================================================================== */}
      <header className="h-12 w-full bg-surface-subtle/80 backdrop-blur-md border-b border-border-subtle shrink-0 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-4">
          {/* Brand Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary-container to-secondary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-white">center_focus_strong</span>
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">jco cs2 assistant</span>
          </div>

          <div className="h-4 w-px bg-border-subtle" />

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5">
            <span className="px-3 py-1 rounded-lg text-xs font-medium bg-surface-container text-white border border-border-subtle transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-primary">layers</span>
              Lineups
            </span>
          </nav>
        </div>

        {/* Center Toast Feedback */}
        {actionToast && (
          <div className="px-3 py-1 rounded-full bg-primary/15 border border-primary/40 text-primary text-xs font-mono tracking-wide animate-pulse">
            {actionToast}
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <button
              onClick={onOpenSettings}
              className="w-7 h-7 rounded-lg hover:bg-surface-container hover:text-white flex items-center justify-center transition-colors"
              title="Settings"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* MAIN DUAL-COLUMN WORKSPACE (5 Cols Left / 7 Cols Right)             */}
      {/* ==================================================================== */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-surface">
        {/* ==================================================================== */}
        {/* LEFT COLUMN: LINEUP EXPLORER (Cols 5)                                */}
        {/* ==================================================================== */}
        <div className="lg:col-span-5 border-r border-border-subtle flex flex-col h-full bg-surface-subtle/40 overflow-hidden">
          {/* Map Selector Strip (Smooth rounded chips with badges) */}
          <div className="p-2.5 border-b border-border-subtle flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {COMPETITIVE_MAPS.map((m) => {
              const active = m.id === selectedMap;
              const count = mapCounts[m.id] || 0;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMap(m.id)}
                  title={`Map: ${m.label}`}
                  type="button"
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 ${
                    active
                      ? 'bg-primary text-surface font-semibold shadow-sm'
                      : 'text-text-secondary hover:text-white hover:bg-surface-container'
                  }`}
                >
                  <span>{m.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      active ? 'bg-black/25 text-white' : 'bg-surface-container text-text-muted'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Icon-First Filter & Action Bar */}
          <div className="px-3 py-2 border-b border-border-subtle flex items-center justify-between gap-2 shrink-0">
            {/* Faction Filter Toggle */}
            <div className="flex items-center p-0.5 rounded-xl bg-surface-container border border-border-subtle">
              <button
                onClick={() => setSelectedSide('ALL')}
                title="All Sides"
                type="button"
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedSide === 'ALL'
                    ? 'bg-surface-container-high text-white font-semibold'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedSide(selectedSide === 'T' ? 'ALL' : 'T')}
                title="Terrorist (T-Side)"
                type="button"
                className={`px-2 py-1 rounded-lg transition-all flex items-center justify-center ${
                  selectedSide === 'T'
                    ? 'bg-tertiary-soft text-tertiary font-semibold'
                    : 'text-text-muted hover:text-tertiary'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
              </button>
              <button
                onClick={() => setSelectedSide(selectedSide === 'CT' ? 'ALL' : 'CT')}
                title="Counter-Terrorist (CT-Side)"
                type="button"
                className={`px-2 py-1 rounded-lg transition-all flex items-center justify-center ${
                  selectedSide === 'CT'
                    ? 'bg-secondary-soft text-secondary font-semibold'
                    : 'text-text-muted hover:text-secondary'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">shield</span>
              </button>
            </div>

            {/* Grenade Icon Toggles */}
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-surface-container border border-border-subtle">
              <button
                onClick={() => setSelectedUtility(selectedUtility === 'SMOKE' ? 'ALL' : 'SMOKE')}
                title="Smokes"
                type="button"
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  selectedUtility === 'SMOKE'
                    ? 'bg-surface-container-high text-secondary shadow-sm'
                    : 'text-text-muted hover:text-secondary'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">cloud</span>
              </button>
              <button
                onClick={() => setSelectedUtility(selectedUtility === 'FLASHBANG' ? 'ALL' : 'FLASHBANG')}
                title="Flashbangs"
                type="button"
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  selectedUtility === 'FLASHBANG'
                    ? 'bg-surface-container-high text-tertiary shadow-sm'
                    : 'text-text-muted hover:text-tertiary'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">flare</span>
              </button>
              <button
                onClick={() => setSelectedUtility(selectedUtility === 'MOLOTOV' ? 'ALL' : 'MOLOTOV')}
                title="Molotovs / Incendiaries"
                type="button"
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  selectedUtility === 'MOLOTOV'
                    ? 'bg-surface-container-high text-danger shadow-sm'
                    : 'text-text-muted hover:text-danger'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
              </button>
              <button
                onClick={() => setSelectedUtility(selectedUtility === 'HE_GRENADE' ? 'ALL' : 'HE_GRENADE')}
                title="HE Grenades"
                type="button"
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  selectedUtility === 'HE_GRENADE'
                    ? 'bg-surface-container-high text-success shadow-sm'
                    : 'text-text-muted hover:text-success'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">bomb</span>
              </button>
            </div>

            {/* Action Buttons: Import from Web & Add Custom Pixel */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={() => setIsImportingWeb(true)}
                title="Import Lineup Packs from Web (Scope.gg, TotalCSGO, HLTV)"
                type="button"
                className="w-8 h-8 rounded-xl bg-surface-container border border-border-subtle text-text-secondary hover:text-white hover:border-border-medium flex items-center justify-center transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">cloud_download</span>
              </button>
              <button
                onClick={() => setIsCreatingPixel(true)}
                title="Create Custom Pixel"
                type="button"
                className="w-8 h-8 rounded-xl bg-primary text-surface font-semibold hover:bg-primary/90 flex items-center justify-center transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          </div>

          {/* Search Input Bar with Counter */}
          <div className="px-3 py-2 border-b border-border-subtle shrink-0">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-2.5 text-[16px] text-text-muted pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={pixelSearch}
                onChange={(e) => setPixelSearch(e.target.value)}
                placeholder="Search position, site, callout..."
                className="w-full pl-8 pr-16 py-1.5 text-xs bg-surface-container rounded-xl border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-focus font-sans"
              />
              <span className="absolute right-2.5 text-[10px] font-mono text-text-muted">
                {filteredLineups.length} / {mapCounts[selectedMap] || 0}
              </span>
            </div>
          </div>

          {/* Lineup Cards List (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredLineups.map((lineup) => {
              const hasFailed = failedImages[lineup.id];
              const reloadKey = imageReloadKeys[lineup.id] || 0;
              const imgUrl = lineup.imageUrl || lineup.thumbnailUrl;
              const isSelected = inspectedLineup?.id === lineup.id;
              const meta = getUtilityMeta(lineup.utilityType);

              return (
                <div
                  key={lineup.id}
                  onClick={() => handleSelectInspectedLineup(lineup)}
                  className={`group relative p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-sm ${
                    isSelected
                      ? 'bg-surface-container border-primary/50 ring-1 ring-primary/30'
                      : 'bg-surface-container/60 border-border-subtle hover:border-border-medium hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Thumbnail preview */}
                    <div className="relative w-16 h-12 rounded-xl bg-surface-container-high border border-border-subtle overflow-hidden shrink-0 flex items-center justify-center">
                      {hasFailed ? (
                        <div className="flex flex-col items-center justify-center gap-0.5 p-1">
                          <span className="text-tertiary text-xs">⚠</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRetryImage(lineup.id);
                            }}
                            title="Retry"
                            className="text-[8px] border border-border-medium bg-surface-container-highest px-1 text-primary"
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
                        <span className={`material-symbols-outlined ${meta.colorText} text-[20px] opacity-75`}>
                          {meta.icon}
                        </span>
                      )}
                      <span className={`absolute top-1 left-1 w-2 h-2 rounded-full ${meta.colorBg}`} />
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-white truncate">{lineup.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-container-highest text-secondary font-mono">
                          {lineup.throwType}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-text-muted mt-0.5 truncate">
                        <span>{lineup.startPosition?.callout || 'Spot'}</span>
                        <span>•</span>
                        <span className="text-text-secondary">{lineup.side}-Side</span>
                      </div>
                    </div>
                  </div>

                  {/* Bookmark / Add to Plan Icon Button */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddPixelToPlan(lineup);
                      }}
                      title={`Add to Plan: ${currentPlan?.name || 'Active'}`}
                      type="button"
                      className="w-8 h-8 rounded-xl bg-surface-container-high hover:bg-primary hover:text-surface text-text-secondary flex items-center justify-center transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">bookmark_add</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredLineups.length === 0 && (
              <div className="h-48 flex flex-col items-center justify-center text-text-muted text-xs gap-1">
                <span className="material-symbols-outlined text-[24px]">search_off</span>
                <span>No lineups match the selected filters</span>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* RIGHT COLUMN: TACTICAL PLANS & DETAILED INSPECTOR (Cols 7)           */}
        {/* ==================================================================== */}
        <div className="lg:col-span-7 flex flex-col h-full bg-surface overflow-hidden divide-y divide-border-subtle">
          {/* ================= TOP SECTION: TACTICAL PLAN MANAGER (45%) ================= */}
          <div className="p-4 flex flex-col gap-3 h-[45%] overflow-hidden bg-surface-subtle/30">
            {/* Plan Header & Action Toolbar */}
            <div className="flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-primary text-[20px]">alt_route</span>
                <div className="flex items-baseline gap-2 truncate">
                  <h2 className="text-sm font-semibold text-white truncate">
                    {currentPlan ? currentPlan.name : 'Select a Plan'}
                  </h2>
                  <span className="text-[11px] text-text-muted font-mono shrink-0">
                    {currentPlan?.lineupIds?.length || 0} items
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Share Code Button */}
                {currentPlan && (
                  <button
                    onClick={() => handleExportPlan(currentPlan)}
                    title="Copy Share Code"
                    type="button"
                    className="h-8 px-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-border-subtle text-xs font-mono text-text-secondary hover:text-white flex items-center gap-1.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-[15px]">share</span>
                    <span>{exportPlayToCode(currentPlan)}</span>
                  </button>
                )}

                {/* Active in-game indicator or trigger */}
                {currentPlan && (
                  currentPlan.id === activePlanId ? (
                    <span className="h-8 px-2.5 rounded-xl bg-primary/20 border border-primary/40 text-[11px] font-mono text-primary flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      LIVE
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetActivePlan(currentPlan.id)}
                      title="Set as In-Game Overlay Active Plan"
                      type="button"
                      className="h-8 px-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-border-subtle text-[11px] font-mono text-text-secondary hover:text-white flex items-center gap-1 transition-all"
                    >
                      <span className="material-symbols-outlined text-[14px]">play_circle</span>
                      ACTIVATE
                    </button>
                  )
                )}

                {/* New Plan Button */}
                <button
                  onClick={() => {
                    setIsCreatingPlan(!isCreatingPlan);
                    setIsImportingPlan(false);
                  }}
                  title="New Tactical Plan"
                  type="button"
                  className="w-8 h-8 rounded-xl bg-surface-container hover:bg-surface-container-high border border-border-subtle text-text-secondary hover:text-white flex items-center justify-center transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </button>

                {/* Import Plan Button */}
                <button
                  onClick={() => {
                    setIsImportingPlan(!isImportingPlan);
                    setIsCreatingPlan(false);
                  }}
                  title="Import Plan from Code"
                  type="button"
                  className="w-8 h-8 rounded-xl bg-surface-container hover:bg-surface-container-high border border-border-subtle text-text-secondary hover:text-white flex items-center justify-center transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                </button>

                {/* Delete Plan Button */}
                {currentPlan && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete tactical plan "${currentPlan.name}"?`)) {
                        dbDeletePlay(currentPlan.id);
                        const updated = getAllPlays();
                        setPlans(updated);
                        const remaining = updated.filter((p) => !p.map || p.map === selectedMap);
                        setSelectedPlanId(remaining[0]?.id || '');
                        showToast(`PLAN DELETED`);
                      }
                    }}
                    title="Delete Plan"
                    type="button"
                    className="w-8 h-8 rounded-xl bg-surface-container hover:bg-danger-soft hover:text-danger border border-border-subtle text-text-muted flex items-center justify-center transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                )}
              </div>
            </div>

            {/* Inline Import Plan Form */}
            {isImportingPlan && (
              <form onSubmit={handleImportPlanSubmit} className="flex items-center gap-2 p-2 rounded-xl bg-surface-container border border-primary/40 shrink-0">
                <input
                  type="text"
                  autoFocus
                  value={importCodeValue}
                  onChange={(e) => setImportCodeValue(e.target.value)}
                  placeholder="Paste share code (e.g. MRG-9402)..."
                  className="flex-1 bg-transparent text-xs text-white placeholder:text-text-muted outline-none font-mono px-2 py-1"
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-primary text-surface font-semibold text-xs hover:bg-primary/90 transition-colors"
                >
                  Import
                </button>
                <button
                  type="button"
                  onClick={() => setIsImportingPlan(false)}
                  className="w-7 h-7 rounded-lg text-text-muted hover:text-white flex items-center justify-center"
                >
                  ✕
                </button>
              </form>
            )}

            {/* Inline Create Plan Form */}
            {isCreatingPlan && (
              <form onSubmit={handleCreatePlanSubmit} className="flex items-center gap-2 p-2 rounded-xl bg-surface-container border border-primary/40 shrink-0">
                <input
                  type="text"
                  autoFocus
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  placeholder="Plan name (e.g. A Site Full Execute)..."
                  className="flex-1 bg-transparent text-xs text-white placeholder:text-text-muted outline-none px-2 py-1"
                />
                <select
                  value={newPlanSide}
                  onChange={(e) => setNewPlanSide(e.target.value as TeamSide)}
                  className="bg-surface-container-high border border-border-subtle rounded-lg text-xs text-white px-2 py-1 outline-none font-mono"
                >
                  <option value="T">T-Side</option>
                  <option value="CT">CT-Side</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-primary text-surface font-semibold text-xs hover:bg-primary/90 transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingPlan(false)}
                  className="w-7 h-7 rounded-lg text-text-muted hover:text-white flex items-center justify-center"
                >
                  ✕
                </button>
              </form>
            )}

            {/* Plan Quick-Switch Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 pb-0.5">
              {filteredPlans.map((p) => {
                const isSelected = p.id === currentPlan?.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlanId(p.id)}
                    type="button"
                    className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all ${
                      isSelected
                        ? 'bg-primary text-surface font-semibold shadow-sm'
                        : 'text-text-secondary hover:text-white hover:bg-surface-container'
                    }`}
                  >
                    <span>{p.name}</span>
                    <span
                      className={`text-[10px] px-1 rounded-full font-mono ${
                        isSelected ? 'bg-black/25 text-white' : 'bg-surface-container text-text-muted'
                      }`}
                    >
                      {p.lineupIds?.length || 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Ordered Plan Steps Sequence List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {currentPlan?.lineupIds?.map((lineupId, idx) => {
                const lineup = lineups.find((l) => l.id === lineupId);
                if (!lineup) return null;
                const meta = getUtilityMeta(lineup.utilityType);

                return (
                  <div
                    key={`${lineupId}-${idx}`}
                    onClick={() => handleSelectInspectedLineup(lineup)}
                    className="flex items-center justify-between p-2 rounded-xl bg-surface-container border border-border-subtle group hover:border-border-medium transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-lg bg-surface-container-high text-primary font-mono text-[11px] font-semibold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className={`material-symbols-outlined ${meta.colorText} text-[16px]`}>
                        {meta.icon}
                      </span>
                      <span className="text-xs font-medium text-white truncate">{lineup.title}</span>
                      <span className="text-[10px] font-mono text-text-muted px-1.5 py-0.5 rounded-md bg-surface-container-high">
                        {lineup.throwType}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-text-muted shrink-0">
                      <button
                        disabled={idx === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMovePixel(idx, 'UP');
                        }}
                        title="Move Up"
                        type="button"
                        className="w-6 h-6 rounded hover:bg-surface-container-high hover:text-white flex items-center justify-center disabled:opacity-20"
                      >
                        <span className="material-symbols-outlined text-[14px]">expand_less</span>
                      </button>
                      <button
                        disabled={idx === (currentPlan.lineupIds?.length || 0) - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMovePixel(idx, 'DOWN');
                        }}
                        title="Move Down"
                        type="button"
                        className="w-6 h-6 rounded hover:bg-surface-container-high hover:text-white flex items-center justify-center disabled:opacity-20"
                      >
                        <span className="material-symbols-outlined text-[14px]">expand_more</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePixel(idx);
                        }}
                        title="Remove Step"
                        type="button"
                        className="w-6 h-6 rounded hover:bg-danger-soft hover:text-danger flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {(!currentPlan?.lineupIds || currentPlan.lineupIds.length === 0) && (
                <div className="h-full flex flex-col items-center justify-center text-text-muted text-xs gap-1">
                  <span>This tactical plan has no steps yet</span>
                  <span className="text-[10px] text-text-muted/60">
                    Click the bookmark icon on any pixel on the left to add it here
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ================= BOTTOM SECTION: DETAILED INSPECTOR VIEWPORT & GUIDE (55%) ================= */}
          <div className="p-4 flex flex-col gap-3 h-[55%] overflow-hidden bg-surface">
            {inspectedLineup ? (
              <>
                {/* Inspector Header */}
                <div className="flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="material-symbols-outlined text-secondary text-[20px]">center_focus_strong</span>
                    {isEditingTitle ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSaveRename();
                        }}
                        className="flex items-center gap-1.5 flex-1"
                      >
                        <input
                          type="text"
                          autoFocus
                          value={editingTitleValue}
                          onChange={(e) => setEditingTitleValue(e.target.value)}
                          className="text-sm font-semibold text-white bg-surface-container border border-primary/50 outline-none rounded-lg px-2 py-0.5 flex-1"
                        />
                        <button
                          type="submit"
                          className="px-2 py-0.5 rounded-lg bg-primary text-surface text-xs font-semibold"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingTitle(false)}
                          className="w-6 h-6 rounded text-text-muted hover:text-white"
                        >
                          ✕
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          onClick={() => handleStartRename(inspectedLineup.title)}
                          title="Click to rename pixel"
                          className="text-sm font-semibold text-white truncate cursor-pointer hover:text-primary transition-colors"
                        >
                          {inspectedLineup.title}
                        </span>
                        <button
                          onClick={() => handleStartRename(inspectedLineup.title)}
                          title="Rename Pixel"
                          type="button"
                          className="w-6 h-6 rounded text-text-muted hover:text-primary flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-2.5 py-0.5 rounded-lg bg-surface-container text-[11px] font-mono text-secondary">
                      {inspectedLineup.throwType}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-surface-container text-[11px] font-mono text-text-muted">
                      {inspectedLineup.side}-Side
                    </span>
                    <button
                      onClick={() => handleRetryImage(inspectedLineup.id)}
                      title="Reload Screenshot"
                      type="button"
                      className="w-7 h-7 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-muted hover:text-white flex items-center justify-center transition-all"
                    >
                      <span className="material-symbols-outlined text-[15px]">refresh</span>
                    </button>
                    <button
                      onClick={() => handleAddPixelToPlan(inspectedLineup)}
                      title="Add to Active Plan"
                      type="button"
                      className="px-2.5 py-1 rounded-xl bg-primary text-surface font-semibold text-xs hover:bg-primary/90 flex items-center gap-1 transition-all"
                    >
                      <span className="material-symbols-outlined text-[15px]">bookmark_add</span>
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Dual Pane: Screenshot Viewport (Left) + Step Instructions (Right) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 min-h-0">
                  {/* Left: Game Viewport (7 Cols) */}
                  <div className="md:col-span-7 flex flex-col gap-2 min-h-0">
                    <div className="relative flex-1 w-full rounded-2xl bg-surface-container border border-border-subtle overflow-hidden group flex items-center justify-center">
                      {/* View Mode Switcher Pills (Top Left) */}
                      <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 bg-surface-subtle/85 backdrop-blur-md p-0.5 rounded-xl border border-border-subtle">
                        <button
                          onClick={() => setInspectorViewMode('AIM')}
                          type="button"
                          className={`px-2.5 py-0.5 text-[10px] font-medium rounded-lg transition-colors ${
                            inspectorViewMode === 'AIM'
                              ? 'bg-primary text-surface font-semibold shadow-sm'
                              : 'text-text-muted hover:text-white'
                          }`}
                        >
                          Aim Point
                        </button>
                        {(inspectedLineup.thumbnailUrl || inspectedLineup.resultImageUrl) && (
                          <button
                            onClick={() => setInspectorViewMode('RESULT')}
                            type="button"
                            className={`px-2.5 py-0.5 text-[10px] font-medium rounded-lg transition-colors ${
                              inspectorViewMode === 'RESULT'
                                ? 'bg-primary text-surface font-semibold shadow-sm'
                                : 'text-text-muted hover:text-white'
                            }`}
                          >
                            Landing Bloom
                          </button>
                        )}
                      </div>

                      {/* Main Screenshot with Crosshair Reticle Hairlines (True intersecting, no circle) */}
                      {inspectedLineup.imageUrl || inspectedLineup.thumbnailUrl ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          {inspectorViewMode === 'AIM' ? (
                            <>
                              <img
                                key={`${inspectedLineup.id}-aim-${imageReloadKeys[inspectedLineup.id] || 0}`}
                                src={inspectedLineup.imageUrl || inspectedLineup.thumbnailUrl}
                                alt={inspectedLineup.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/25 pointer-events-none" />

                              {/* Intersecting hairlines */}
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-full h-px bg-secondary/70" />
                                <div className="h-full w-px bg-secondary/70 absolute" />
                                <div className="w-3.5 h-3.5 rounded border border-secondary bg-secondary/20 flex items-center justify-center">
                                  <div className="w-1 h-1 rounded-full bg-white" />
                                </div>
                              </div>

                              {/* Corner Stand Thumbnail (User requested: photo of where you have to stand in smaller scale) */}
                              <div
                                onClick={() => setInspectorViewMode('RESULT')}
                                title="Click to view landing bloom / stand reference"
                                className="absolute bottom-2.5 right-2.5 w-24 h-16 rounded-xl bg-surface-container-high border border-border-medium overflow-hidden shadow-lg cursor-pointer hover:border-primary transition-all group/thumb"
                              >
                                <img
                                  src={inspectedLineup.thumbnailUrl || inspectedLineup.resultImageUrl || inspectedLineup.imageUrl}
                                  alt="Reference Thumbnail"
                                  className="w-full h-full object-cover opacity-85 group-hover/thumb:opacity-100 transition-opacity"
                                />
                                <span className="absolute bottom-0 inset-x-0 bg-surface-subtle/90 text-[8px] font-mono text-center text-secondary py-0.5">
                                  LANDING ↗
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <img
                                key={`${inspectedLineup.id}-res-${imageReloadKeys[inspectedLineup.id] || 0}`}
                                src={inspectedLineup.thumbnailUrl || inspectedLineup.resultImageUrl || inspectedLineup.imageUrl}
                                alt="Landing Result"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-surface-subtle/80 backdrop-blur-md border border-border-subtle text-[10px] font-mono text-primary">
                                LANDING BLOOM
                              </div>

                              {/* Corner Switch back to Aim */}
                              <div
                                onClick={() => setInspectorViewMode('AIM')}
                                title="Click to view Aim Crosshair"
                                className="absolute bottom-2.5 right-2.5 w-24 h-16 rounded-xl bg-surface-container-high border border-border-medium overflow-hidden shadow-lg cursor-pointer hover:border-primary transition-all group/thumb"
                              >
                                <img
                                  src={inspectedLineup.imageUrl || inspectedLineup.thumbnailUrl}
                                  alt="Aim Reference"
                                  className="w-full h-full object-cover opacity-85 group-hover/thumb:opacity-100 transition-opacity"
                                />
                                <span className="absolute bottom-0 inset-x-0 bg-surface-subtle/90 text-[8px] font-mono text-center text-secondary py-0.5">
                                  AIM ↖
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1 text-text-muted text-xs">
                          <span className="material-symbols-outlined text-[24px]">image_not_supported</span>
                          <span>No screenshot available</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Stand, Aim & Tutorial Instructions (5 Cols) */}
                  <div className="md:col-span-5 flex flex-col gap-2 min-h-0 overflow-y-auto pr-1">
                    {/* Stand & Aim Landmarks */}
                    <div className="p-3 rounded-xl bg-surface-container border border-border-subtle space-y-2 shrink-0">
                      <div>
                        <div className="text-[10px] font-mono text-text-muted uppercase tracking-wider">STAND POSITION</div>
                        <div className="text-xs font-medium text-white mt-0.5">
                          {inspectedLineup.startPosition?.callout || 'Position on map'}
                        </div>
                      </div>
                      <div className="pt-2 border-t border-border-subtle">
                        <div className="text-[10px] font-mono text-secondary uppercase tracking-wider">AIM REFERENCE</div>
                        <div className="text-xs font-medium text-text-primary mt-0.5">
                          {inspectedLineup.aimReference?.crosshairPlacement ||
                            inspectedLineup.instructions?.[1] ||
                            'Align crosshair with precision reticle'}
                        </div>
                      </div>
                    </div>

                    {/* Step-by-Step Instructions */}
                    <div className="p-3 rounded-xl bg-surface-container border border-border-subtle flex-1 flex flex-col gap-2">
                      <div className="text-[10px] font-mono text-primary uppercase tracking-wider">
                        TACTICAL EXECUTION GUIDE
                      </div>
                      <div className="space-y-1.5 text-xs text-text-secondary overflow-y-auto">
                        {inspectedLineup.instructions && inspectedLineup.instructions.length > 0 ? (
                          inspectedLineup.instructions.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-surface-container-high text-primary font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {sIdx + 1}
                              </span>
                              <span className="leading-relaxed">{step}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-text-muted">Stand at designated spot and align crosshair with reference image.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-text-muted text-xs gap-1">
                <span className="material-symbols-outlined text-[24px]">visibility</span>
                <span>Select a pixel from the list to inspect details</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Custom Pixel Creator Modal */}
      {isCreatingPixel && (
        <LineupCreatorModal
          currentMap={selectedMap}
          onClose={() => setIsCreatingPixel(false)}
          onSaveLineup={handleSaveCustomLineup}
        />
      )}

      {/* Web Utility Packs Importer Modal */}
      {isImportingWeb && (
        <WebUtilityImporterModal
          isOpen={isImportingWeb}
          onClose={() => setIsImportingWeb(false)}
          onPacksUpdated={handleWebPacksUpdated}
        />
      )}
    </div>
  );
};

export default UtilityRoomView;
