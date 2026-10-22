/**
 * CS2 Assistant - Live Game Destination View (Ultra-Lightweight & Performance Focused)
 * File: src/renderer/components/destinations/LiveMatchView.tsx
 *
 * Designed for maximum in-game FPS and secondary monitor precision:
 * - Zero AI/Gemini overhead or background queries
 * - Full-Screen Crossing Lines Overlay Controller
 * - Customizable Overlay Hotkey (F1 / CapsLock / F3 / F4) with TOGGLE or HOLD trigger modes
 * - Active Tactical Play Sequencer (# 01, # 02, etc.)
 * - C4 Bomb Countdown & Defusal Viability Telemetry
 * - One-Click "Switch to Overlay-Only Mode" (closes heavy window during matches)
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Clock,
  ArrowRight,
  Layers,
  Settings,
  Minimize2,
  Check,
} from 'lucide-react';
import type {
  GsiStatus,
  BombState,
  Lineup,
  Play as TacticalPlay,
  HotkeyConfig,
} from '../../../shared/ipc-types';
import { getLineupById } from '../../../core/utility/lineup-database';
import {
  getAllPlays,
  getActivePlay,
  setActivePlayId,
  getActivePlayStepIndex,
  setActivePlayStepIndex,
  advanceActivePlayStep,
} from '../../../core/utility/play-database';

export const LiveMatchView: React.FC = () => {
  // GSI and Environment State
  const [gsiStatus, setGsiStatus] = useState<GsiStatus>({
    listening: true,
    port: 3001,
    clientConnected: false,
    authenticated: true,
    lastHeartbeat: null,
    environment: 'COMPETITIVE_PROTECTED',
    activeMatch: false,
  });

  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false);
  const [bombState, setBombState] = useState<BombState | null>(null);
  const [bombCountdown, setBombCountdown] = useState<number>(0);

  // Tactical Plays and Active Routine
  const [plays, setPlays] = useState<TacticalPlay[]>(() => getAllPlays());
  const [currentPlay, setCurrentPlay] = useState<TacticalPlay>(() => getActivePlay());
  const [activeStepIndex, setActiveStepIndexState] = useState<number>(() => getActivePlayStepIndex());
  const [activeLineupPhoto, setActiveLineupPhoto] = useState<Lineup | null>(null);

  // Hotkey & Trigger Configuration State
  const [hotkeyConfig, setHotkeyConfigState] = useState<HotkeyConfig>({
    key: 'F1',
    mode: 'TOGGLE',
  });

  // Subscribe to IPC channels
  useEffect(() => {
    const api = window.cs2Assistant;
    if (!api) return;

    api.gsi.getStatus().then((st) => {
      if (st) {
        setGsiStatus(st);
        if (st.environment === 'SIMULATION_PREVIEW') {
          setIsSimulationMode(true);
        }
      }
    }).catch(() => {});

    api.tactical.getBombState().then((b) => {
      setBombState(b);
      setBombCountdown(b?.planted ? b.countdownSeconds : 0);
    }).catch(() => {});

    api.hud.getActiveLineupPhoto?.().then((photo) => {
      setActiveLineupPhoto(photo);
    }).catch(() => {});

    api.hud.getHotkeyConfig?.().then((cfg) => {
      if (cfg) setHotkeyConfigState(cfg);
    }).catch(() => {});

    const unsubGsi = api.gsi.onStatusChange((st) => {
      setGsiStatus(st);
    });

    const unsubBomb = api.tactical.onBombUpdate((b) => {
      setBombState(b);
      setBombCountdown(b?.planted ? b.countdownSeconds : 0);
    });

    const unsubPhoto = api.hud.onActiveLineupPhotoChange?.((photo) => {
      setActiveLineupPhoto(photo);
    });

    const unsubHotkey = api.hud.onHotkeyConfigChange?.((cfg) => {
      setHotkeyConfigState(cfg);
    });

    return () => {
      unsubGsi();
      unsubBomb();
      unsubPhoto?.();
      unsubHotkey?.();
    };
  }, []);

  // C4 tickdown
  useEffect(() => {
    if (!bombState?.planted || bombCountdown <= 0) return;

    const timer = setInterval(() => {
      setBombCountdown((prev) => {
        const next = Number((prev - 0.1).toFixed(1));
        if (next <= 0) {
          setBombState(null);
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [bombState?.planted, bombCountdown > 0]);

  // Sync play lineups
  const playLineups = useMemo(() => {
    if (!currentPlay?.lineupIds) return [];
    return currentPlay.lineupIds
      .map((id) => getLineupById(id))
      .filter((l): l is Lineup => l !== null);
  }, [currentPlay]);

  const currentStepLineup = playLineups[activeStepIndex] || playLineups[0] || null;

  // Change active Play
  const handleSelectPlay = (playId: string) => {
    setActivePlayId(playId);
    const p = plays.find((x) => x.id === playId) || plays[0];
    setCurrentPlay(p);
    setActiveStepIndexState(0);
    if (p.lineupIds && p.lineupIds[0]) {
      const firstLineup = getLineupById(p.lineupIds[0]);
      if (firstLineup && window.cs2Assistant?.hud) {
        window.cs2Assistant.hud.setActiveLineupPhoto(firstLineup);
      }
    }
  };

  // Advance step (F2 action)
  const handleAdvanceStep = () => {
    const { play, stepIndex, lineupId } = advanceActivePlayStep();
    setCurrentPlay(play);
    setActiveStepIndexState(stepIndex);
    if (lineupId) {
      const nextL = getLineupById(lineupId);
      if (nextL && window.cs2Assistant?.hud) {
        window.cs2Assistant.hud.setActiveLineupPhoto(nextL);
      }
    }
  };

  // Select step directly
  const handleSelectStep = (idx: number) => {
    setActivePlayStepIndex(idx);
    setActiveStepIndexState(idx);
    const lId = currentPlay.lineupIds[idx];
    if (lId) {
      const l = getLineupById(lId);
      if (l && window.cs2Assistant?.hud) {
        window.cs2Assistant.hud.setActiveLineupPhoto(l);
      }
    }
  };

  // Toggle overlay photo manually
  const handleToggleOverlayPhoto = () => {
    if (window.cs2Assistant?.hud) {
      window.cs2Assistant.hud.toggleActiveLineupPhoto();
    }
  };

  // Update Hotkey or Trigger Mode
  const handleUpdateHotkeyConfig = async (patch: Partial<HotkeyConfig>) => {
    const updated: HotkeyConfig = { ...hotkeyConfig, ...patch };
    setHotkeyConfigState(updated);
    if (window.cs2Assistant?.hud?.setHotkeyConfig) {
      await window.cs2Assistant.hud.setHotkeyConfig(updated);
    }
  };

  // Close main heavy window and leave only lightweight overlay running
  const handleEnterOverlayOnlyMode = async () => {
    if (window.cs2Assistant?.hud?.setMainWindowVisible) {
      await window.cs2Assistant.hud.setMainWindowVisible(false);
    }
  };

  // Simulation Preview Mode
  const handleEnterSimulation = async () => {
    setIsSimulationMode(true);
    if (window.cs2Assistant?.gsi) {
      await window.cs2Assistant.gsi.setSimulationMode(true);
    }
  };

  const handleExitSimulation = async () => {
    setIsSimulationMode(false);
    setBombState(null);
    setBombCountdown(0);
    if (window.cs2Assistant?.gsi) {
      await window.cs2Assistant.gsi.setSimulationMode(false);
    }
  };

  const isMatchLive = gsiStatus.activeMatch || isSimulationMode;
  const activeMapName = (gsiStatus.map || currentPlay.map || 'de_mirage').toUpperCase().replace('DE_', '');
  const isBombPlanted = Boolean(bombState?.planted && bombCountdown > 0);

  // ==========================================================================
  // VIEW A: STANDBY
  // ==========================================================================
  if (!isMatchLive) {
    return (
      <div
        data-testid="view-live-match"
        className="flex h-full w-full flex-col items-center justify-center bg-[#09090b] p-6 select-none font-mono text-zinc-100"
      >
        <div className="w-full max-w-xl border border-zinc-800 bg-[#0c0c0e] p-6 shadow-2xl space-y-5 relative">
          <span className="absolute -top-1 -left-1 text-zinc-500 font-mono text-xs select-none">┌</span>
          <span className="absolute -top-1 -right-1 text-zinc-500 font-mono text-xs select-none">┐</span>
          <span className="absolute -bottom-1 -left-1 text-zinc-500 font-mono text-xs select-none">└</span>
          <span className="absolute -bottom-1 -right-1 text-zinc-500 font-mono text-xs select-none">┘</span>

          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="text-sm font-bold tracking-widest uppercase text-zinc-100">
              [LIVE GAME // STANDBY]
            </span>
            <span className="border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[10px] text-zinc-400">
              AWAITING CS2 MATCH
            </span>
          </div>

          <div className="space-y-2 text-xs text-zinc-400 leading-relaxed">
            <p># When you enter a match, this window automatically minimizes to maximize CS2 FPS.</p>
            <p># Only the ultra-lightweight overlay remains active on screen.</p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            <span className="text-[11px] text-zinc-500">Preview without starting CS2:</span>
            <button
              data-testid="enter-simulation-btn"
              onClick={handleEnterSimulation}
              className="flex items-center gap-2 border border-emerald-500/80 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-400 transition-colors cursor-pointer"
            >
              <Play className="h-3.5 w-3.5" />
              <span>[ LAUNCH SIMULATION ]</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // VIEW B: ACTIVE LIVE GAME INTERFACE
  // ==========================================================================
  return (
    <div
      data-testid="view-live-match"
      className="flex h-full w-full flex-col overflow-hidden bg-[#09090b] p-3 gap-2.5 select-none font-mono text-zinc-100"
    >
      {/* 1. TOP MINIMAL STATUS BAR */}
      <div className="flex items-center justify-between border border-zinc-800 bg-[#0c0c0e] px-4 py-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black tracking-widest text-zinc-100 uppercase">
              [LIVE // {activeMapName}]
            </span>
          </div>

          <span className="text-zinc-600">|</span>

          <span className="text-xs font-bold text-zinc-300">
            ROUND {gsiStatus.round || 1}
          </span>

          <span className="text-zinc-600">|</span>

          <span className="text-xs font-bold">
            <span className="text-cyan-400">CT {gsiStatus.ctScore ?? 7}</span>
            <span className="text-zinc-500"> : </span>
            <span className="text-amber-400">{gsiStatus.tScore ?? 5} T</span>
          </span>
        </div>

        {/* C4 BOMB STATUS */}
        {isBombPlanted ? (
          <div className="flex items-center gap-2.5 border border-rose-500/60 bg-rose-500/10 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-black text-rose-400 uppercase tracking-wider">
              C4 {bombState?.site ? `[SITE ${bombState.site}]` : ''} // {bombCountdown.toFixed(1)}s
            </span>
            <span className="text-[10px] text-zinc-300 font-bold border-l border-rose-500/40 pl-2">
              {bombCountdown >= 5 ? <span className="text-emerald-400">KIT: VIABLE</span> : <span className="text-rose-400">NO TIME</span>}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-zinc-500 text-xs">
            <Clock className="h-3.5 w-3.5 text-zinc-600" />
            <span>[C4: STANDBY]</span>
          </div>
        )}

        {/* Hotkey Indicators & Close Heavy Window Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <span className="border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-zinc-200 font-bold">
              {hotkeyConfig.key}
            </span>
            <span>{hotkeyConfig.mode === 'HOLD' ? 'Hold Overlay' : 'Toggle Overlay'}</span>
            <span className="text-zinc-600">/</span>
            <span className="border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-zinc-200 font-bold">
              F2
            </span>
            <span>Next Pixel</span>
          </div>

          <button
            onClick={handleEnterOverlayOnlyMode}
            className="flex items-center gap-1.5 border border-cyan-500/60 bg-cyan-950/40 hover:bg-cyan-900/60 px-2.5 py-1 text-xs font-bold text-cyan-300 transition-colors cursor-pointer"
            title="Minimizes this heavy window to give CS2 100% native FPS with zero lag"
          >
            <Minimize2 className="h-3 w-3" />
            <span>[ OVERLAY-ONLY MODE ]</span>
          </button>

          {isSimulationMode && (
            <button
              onClick={handleExitSimulation}
              className="border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-400 hover:text-zinc-100 cursor-pointer"
            >
              [EXIT]
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN WORKSPACE */}
      <div className="grid grid-cols-12 gap-2.5 flex-1 min-h-0 overflow-hidden">
        {/* ================================================================== */}
        {/* LEFT COLUMN: TACTICAL PLAY SEQUENCER (7 Cols)                      */}
        {/* ================================================================== */}
        <div className="col-span-7 flex flex-col border border-zinc-800 bg-[#0c0c0e] p-3 gap-2.5 overflow-hidden relative">
          <span className="absolute -top-1 -left-1 text-zinc-500 font-mono text-xs select-none">┌</span>
          <span className="absolute -top-1 -right-1 text-zinc-500 font-mono text-xs select-none">┐</span>
          <span className="absolute -bottom-1 -left-1 text-zinc-500 font-mono text-xs select-none">└</span>
          <span className="absolute -bottom-1 -right-1 text-zinc-500 font-mono text-xs select-none">┘</span>

          {/* Play Selector */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 shrink-0">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase text-zinc-100">
                [TACTICAL PLAY SEQUENCER]
              </span>
            </div>

            <select
              value={currentPlay.id}
              onChange={(e) => handleSelectPlay(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-xs font-bold text-cyan-400 px-2 py-1 outline-none cursor-pointer"
            >
              {plays.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.side})
                </option>
              ))}
            </select>
          </div>

          {/* Steps List */}
          <div className="grid grid-cols-2 gap-1.5 shrink-0">
            {playLineups.map((lineup, idx) => {
              const isActive = idx === activeStepIndex;
              return (
                <button
                  key={lineup.id}
                  onClick={() => handleSelectStep(idx)}
                  className={`flex items-center justify-between px-2 py-1.5 border text-left text-xs transition-colors cursor-pointer ${
                    isActive
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[10px] text-zinc-500 font-bold">#{idx + 1}.</span>
                    <span className="truncate">{lineup.title}</span>
                  </div>
                  <span className="text-[9px] border border-zinc-800 px-1 text-zinc-500 shrink-0 ml-1">
                    {lineup.utilityType}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Pixel Preview */}
          {currentStepLineup ? (
            <div className="flex-1 flex flex-col border border-zinc-800 bg-black/60 p-2.5 gap-2 min-h-0 overflow-hidden">
              <div className="flex items-center justify-between text-xs font-bold shrink-0">
                <span className="text-zinc-100 truncate">{currentStepLineup.title}</span>
                <div className="flex items-center gap-1 shrink-0 text-[10px]">
                  <span className="bg-surface-container-high text-zinc-300 px-1.5 py-0.5 rounded">
                    From: {currentStepLineup.startPosition?.callout || 'Spawn'}
                  </span>
                  <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded font-semibold">
                    To: {currentStepLineup.landingArea?.callout || 'Target'}
                  </span>
                </div>
              </div>

              {/* Landmark Screenshot Preview */}
              <div className="flex-1 relative bg-black border border-zinc-800 overflow-hidden flex items-center justify-center min-h-[160px]">
                <img
                  src={currentStepLineup.imageUrl || currentStepLineup.thumbnailUrl}
                  alt={currentStepLineup.title}
                  className="w-full h-full object-contain"
                />

                {/* Mathematically Centered Full Reticle Reference with Low-Opacity Red Dot */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(34, 211, 238, 0.7)" strokeWidth="1" />
                  <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(34, 211, 238, 0.7)" strokeWidth="1" />
                  <circle cx="50%" cy="50%" r="4" fill="none" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="1" />
                  <circle cx="50%" cy="50%" r="1.5" fill="rgba(244, 63, 94, 0.4)" />
                </svg>
              </div>

              {/* Instructions and Controls */}
              <div className="flex items-center justify-between pt-1 border-t border-zinc-800 text-xs shrink-0">
                <div className="text-zinc-300 truncate text-[11px]">
                  <span className="text-zinc-500 font-bold">STAND: </span>
                  <span className="font-semibold">{currentStepLineup.startPosition?.callout || 'Position'}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleToggleOverlayPhoto}
                    className="border border-zinc-700 bg-zinc-900 hover:border-zinc-500 px-2.5 py-1 text-xs font-bold text-zinc-200 cursor-pointer"
                  >
                    [{hotkeyConfig.key}: TOGGLE]
                  </button>
                  <button
                    onClick={handleAdvanceStep}
                    className="border border-cyan-500/80 bg-cyan-950/40 hover:bg-cyan-900/60 px-3 py-1 text-xs font-bold text-cyan-300 cursor-pointer flex items-center gap-1"
                  >
                    <span>[F2: NEXT]</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500 text-xs">
              No pixel registered in this Play.
            </div>
          )}
        </div>

        {/* ================================================================== */}
        {/* RIGHT COLUMN: HOTKEY & OVERLAY CONTROLS (5 Cols)                   */}
        {/* ================================================================== */}
        <div className="col-span-5 flex flex-col border border-zinc-800 bg-[#0c0c0e] p-3 gap-3 overflow-hidden relative">
          <span className="absolute -top-1 -left-1 text-zinc-500 font-mono text-xs select-none">┌</span>
          <span className="absolute -top-1 -right-1 text-zinc-500 font-mono text-xs select-none">┐</span>
          <span className="absolute -bottom-1 -left-1 text-zinc-500 font-mono text-xs select-none">└</span>
          <span className="absolute -bottom-1 -right-1 text-zinc-500 font-mono text-xs select-none">┘</span>

          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 shrink-0">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase text-zinc-100">
                [OVERLAY HOTKEY CONFIGURATION]
              </span>
            </div>
          </div>

          {/* Hotkey Key Selector (F1 / CapsLock / F3 / F4) */}
          <div className="space-y-1.5 text-xs">
            <span className="text-[10px] text-zinc-500 font-bold uppercase">
              SELECT OVERLAY HOTKEY:
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {(['F1', 'CapsLock', 'F3', 'F4'] as const).map((k) => {
                const isSelected = hotkeyConfig.key === k;
                return (
                  <button
                    key={k}
                    onClick={() => handleUpdateHotkeyConfig({ key: k })}
                    className={`py-1.5 px-2 border text-xs font-bold transition-colors cursor-pointer text-center ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    [{k === 'CapsLock' ? 'CAPS' : k}]
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trigger Mode Selector (TOGGLE vs HOLD) */}
          <div className="space-y-1.5 text-xs">
            <span className="text-[10px] text-zinc-500 font-bold uppercase">
              TRIGGER BEHAVIOR:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleUpdateHotkeyConfig({ mode: 'TOGGLE' })}
                className={`py-2 px-3 border text-xs font-bold transition-colors cursor-pointer text-center ${
                  hotkeyConfig.mode === 'TOGGLE'
                    ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                [TOGGLE (Press On/Off)]
              </button>
              <button
                onClick={() => handleUpdateHotkeyConfig({ mode: 'HOLD' })}
                className={`py-2 px-3 border text-xs font-bold transition-colors cursor-pointer text-center ${
                  hotkeyConfig.mode === 'HOLD'
                    ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                [HOLD (Hold to Show)]
              </button>
            </div>
          </div>

          {/* In-Game Overlay Crossing Lines Visual Guide Card */}
          <div className="border border-zinc-800 bg-black/60 p-3 space-y-2 text-xs">
            <span className="text-[10px] text-zinc-500 font-bold uppercase">
              LINEUP OVERLAY SYSTEM:
            </span>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              # Two crossing lines span the entire screen, crossing at the exact center crosshair.
            </p>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              # A compact reference card appears in the top-right showing position and landmark.
            </p>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              # Zero obstruction in the center of your view.
            </p>
          </div>

          {/* Switch to Overlay-Only Mode Card */}
          <div className="border border-emerald-500/40 bg-emerald-500/5 p-3 space-y-2 mt-auto text-xs">
            <span className="text-emerald-400 font-bold text-xs uppercase block">
              ZERO-LAG IN-GAME PERFORMANCE
            </span>
            <p className="text-[11px] text-zinc-400">
              Entering a match automatically hides this application. Click below to hide it manually now:
            </p>
            <button
              onClick={handleEnterOverlayOnlyMode}
              className="w-full border border-emerald-500/80 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-black py-2 text-xs uppercase cursor-pointer"
            >
              [ MINIMIZE TO OVERLAY-ONLY MODE ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMatchView;
