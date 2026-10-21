/**
 * CS2 Assistant - Live Game Destination View (Second Monitor Optimized)
 * File: src/renderer/components/destinations/LiveMatchView.tsx
 *
 * Implements the cyber-brutalist monospace tactical dashboard for the secondary screen:
 * - Minimalist top status bar (Zero HP/Armor/Money clutter)
 * - Tactical Play Sequencer: active routine, ordered pixel steps (# 01, # 02), hotkey hints (F1, F2)
 * - In-game overlay photo status & quick selector
 * - Gemini AI Coach with real-time round analysis toggle & instant strategy terminal
 * - Ultra-lightweight with zero Gaussian blur passes
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Crosshair,
  Play,
  Sparkles,
  Radio,
  Clock,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Check,
  Flame,
  Layers,
  Terminal,
} from 'lucide-react';
import type {
  GsiStatus,
  BombState,
  Lineup,
  TacticalRecommendation,
  Play as TacticalPlay,
} from '../../../shared/ipc-types';
import { getAllLineups, getLineupById } from '../../../core/utility/lineup-database';
import {
  getAllPlays,
  getActivePlay,
  getActivePlayId,
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

  // Gemini AI Coach State
  const [realtimeCoachEnabled, setRealtimeCoachEnabled] = useState<boolean>(() => {
    return localStorage.getItem('cs2_assistant_realtime_coach') === 'true';
  });
  const [recommendation, setRecommendation] = useState<TacticalRecommendation | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState<boolean>(false);
  const [adviceLog, setAdviceLog] = useState<string[]>([]);

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

    const unsubRec = api.onTacticalRecommendation?.((rec) => {
      setRecommendation(rec);
    });

    return () => {
      unsubGsi();
      unsubBomb();
      unsubPhoto?.();
      unsubRec?.();
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

  // Current active lineup in the play sequence
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

  // Select specific step directly
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

  // Toggle in-game overlay photo (F1 action)
  const handleToggleOverlayPhoto = () => {
    if (window.cs2Assistant?.hud) {
      window.cs2Assistant.hud.toggleActiveLineupPhoto();
    }
  };

  // Toggle Real-Time Gemini Round Coach
  const handleToggleRealtimeCoach = () => {
    const nextVal = !realtimeCoachEnabled;
    setRealtimeCoachEnabled(nextVal);
    localStorage.setItem('cs2_assistant_realtime_coach', String(nextVal));
  };

  // Request Strategic Advice from Gemini
  const handleRequestAdvice = useCallback(async (promptModifier?: string) => {
    setLoadingAdvice(true);
    const activeMap = gsiStatus.map || currentPlay.map || 'de_mirage';
    const side = gsiStatus.playerTeam === 'T' ? 'T' : 'CT';
    const round = gsiStatus.round || 1;

    try {
      if (window.cs2Assistant?.gemini) {
        const rec = await window.cs2Assistant.gemini.requestAdvice({
          map: activeMap,
          round,
          score: {
            ct: gsiStatus.ctScore ?? 7,
            t: gsiStatus.tScore ?? 5,
          },
          side,
          alivePlayers: { ct: 4, t: 4 },
          economy: {
            teamMoney: gsiStatus.playerMoney || 4200,
            enemyEstimatedEconomy: 'FULL_BUY',
          },
          bombPlanted: Boolean(bombState?.planted),
          recentObservations: [],
          instructions: promptModifier || `Optimize execution for Play: ${currentPlay.name}`,
        });

        if (rec) {
          setRecommendation(rec);
          setAdviceLog((prev) => [
            `[ROUND ${round}]: ${rec.summary} -> ${rec.suggestedExecution.join(' ')}`,
            ...prev.slice(0, 5),
          ]);
        }
      }
    } finally {
      setLoadingAdvice(false);
    }
  }, [gsiStatus, currentPlay, bombState]);

  // Simulation Preview Mode Toggles
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
  // VIEW A: STANDBY SCREEN (WHEN NO CS2 MATCH IS ACTIVE)
  // ==========================================================================
  if (!isMatchLive) {
    return (
      <div
        data-testid="view-live-match"
        className="flex h-full w-full flex-col items-center justify-center bg-[#09090b] p-8 select-none font-mono text-zinc-100"
      >
        <div className="w-full max-w-2xl border border-zinc-800 bg-[#0c0c0e] p-6 shadow-2xl space-y-6 relative">
          {/* Cyber-brutalist Corner Notches */}
          <span className="absolute -top-1 -left-1 text-zinc-500 font-mono text-xs select-none">┌</span>
          <span className="absolute -top-1 -right-1 text-zinc-500 font-mono text-xs select-none">┐</span>
          <span className="absolute -bottom-1 -left-1 text-zinc-500 font-mono text-xs select-none">└</span>
          <span className="absolute -bottom-1 -right-1 text-zinc-500 font-mono text-xs select-none">┘</span>

          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-sm font-bold tracking-widest uppercase text-zinc-200">
                [LIVE GAME // STANDBY]
              </span>
            </div>
            <span className="border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[10px] uppercase text-zinc-400 tracking-wider">
              AWAITING CS2 TELEMETRY
            </span>
          </div>

          <div className="space-y-3 text-xs text-zinc-400 leading-relaxed">
            <p>
              # CS2 Assistant automatically opens Live Game and suspends all other views when a match starts.
            </p>
            <p>
              # Zero CPU and RAM are wasted in the background during live competitive gameplay.
            </p>
            <p>
              # GSI Telemetry Listener active on <span className="text-zinc-200 font-bold">127.0.0.1:3001</span>.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <span className="text-[11px] text-zinc-500">
              Preview the 2nd monitor tactical interface right now:
            </span>
            <button
              data-testid="enter-simulation-btn"
              onClick={handleEnterSimulation}
              className="flex items-center gap-2 border border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-400 transition-colors cursor-pointer"
            >
              <Play className="h-3.5 w-3.5" />
              <span>[ LAUNCH SIMULATION PREVIEW ]</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // VIEW B: ACTIVE LIVE GAME INTERFACE (OPTIMIZED FOR 2ND MONITOR)
  // ==========================================================================
  return (
    <div
      data-testid="view-live-match"
      className="flex h-full w-full flex-col overflow-hidden bg-[#09090b] p-3 gap-2.5 select-none font-mono text-zinc-100"
    >
      {/* 1. TOP MINIMALIST STATUS BAR (NO HP/MONEY/ARMOR CLUTTER) */}
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
            ROUND {gsiStatus.round || 1} <span className="text-zinc-500">({(gsiStatus.roundPhase || 'LIVE').toUpperCase()})</span>
          </span>

          <span className="text-zinc-600">|</span>

          <span className="text-xs font-bold">
            <span className="text-cyan-400">CT {gsiStatus.ctScore ?? 7}</span>
            <span className="text-zinc-500"> : </span>
            <span className="text-amber-400">{gsiStatus.tScore ?? 5} T</span>
          </span>
        </div>

        {/* C4 BOMB STATUS (Ultra-minimalist pill) */}
        {isBombPlanted ? (
          <div className="flex items-center gap-3 border border-rose-500/60 bg-rose-500/10 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-black text-rose-400 uppercase tracking-wider">
              C4 {bombState?.site ? `[SITE ${bombState.site}]` : ''} // {bombCountdown.toFixed(1)}s
            </span>
            <span className="text-[10px] text-zinc-300 font-bold border-l border-rose-500/40 pl-2">
              KIT: {bombCountdown >= 5 ? <span className="text-emerald-400">VIABLE</span> : <span className="text-rose-400">NO TIME</span>}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-zinc-500 text-xs">
            <Clock className="h-3.5 w-3.5 text-zinc-600" />
            <span>[C4: STANDBY]</span>
          </div>
        )}

        {/* Hotkey Guide Pill */}
        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
          <span className="border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-zinc-300 font-bold">F1</span>
          <span>Toggle Overlay</span>
          <span className="text-zinc-600">/</span>
          <span className="border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-zinc-300 font-bold">F2</span>
          <span>Next Pixel</span>

          {isSimulationMode && (
            <button
              onClick={handleExitSimulation}
              className="ml-2 border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-400 hover:text-zinc-100 cursor-pointer"
            >
              [EXIT PREVIEW]
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN TACTICAL WORKSPACE */}
      <div className="grid grid-cols-12 gap-2.5 flex-1 min-h-0 overflow-hidden">
        {/* ================================================================== */}
        {/* LEFT COLUMN: TACTICAL PLAY SEQUENCER (7 Cols)                      */}
        {/* ================================================================== */}
        <div className="col-span-7 flex flex-col border border-zinc-800 bg-[#0c0c0e] p-3 gap-3 overflow-hidden relative">
          {/* Cyber-brutalist Corner Notches */}
          <span className="absolute -top-1 -left-1 text-zinc-500 font-mono text-xs select-none">┌</span>
          <span className="absolute -top-1 -right-1 text-zinc-500 font-mono text-xs select-none">┐</span>
          <span className="absolute -bottom-1 -left-1 text-zinc-500 font-mono text-xs select-none">└</span>
          <span className="absolute -bottom-1 -right-1 text-zinc-500 font-mono text-xs select-none">┘</span>

          {/* Section Header & Play Selector */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 shrink-0">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold tracking-wider uppercase text-zinc-100">
                [TACTICAL PLAY SEQUENCER]
              </span>
            </div>

            {/* Play Selector Dropdown */}
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

          {/* Play Sequence Steps List */}
          <div className="flex flex-col gap-1.5 shrink-0">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>ORDERED PIXEL SEQUENCE:</span>
              <span className="text-cyan-400 font-bold">
                STEP {activeStepIndex + 1} OF {playLineups.length || 1}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {playLineups.map((lineup, idx) => {
                const isActive = idx === activeStepIndex;
                return (
                  <button
                    key={lineup.id}
                    onClick={() => handleSelectStep(idx)}
                    className={`flex items-center justify-between px-2.5 py-1.5 border text-left text-xs transition-colors cursor-pointer ${
                      isActive
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold'
                        : 'border-zinc-800 bg-zinc-950/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] text-zinc-500 font-bold">
                        # {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <span className="truncate">{lineup.title}</span>
                    </div>
                    <span className="text-[9px] px-1 py-0.2 border border-zinc-800 bg-zinc-900 text-zinc-400 ml-1 shrink-0">
                      {lineup.utilityType}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Pixel Card & Alignment Photo Preview */}
          {currentStepLineup ? (
            <div className="flex-1 flex flex-col border border-zinc-800 bg-black/60 p-2.5 gap-2 min-h-0 overflow-hidden">
              <div className="flex items-center justify-between text-xs font-bold shrink-0">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  <span className="text-zinc-100 uppercase tracking-wide">
                    {currentStepLineup.title}
                  </span>
                  <span className="text-[10px] border border-cyan-800 bg-cyan-950 px-1.5 py-0.2 text-cyan-400">
                    {currentStepLineup.throwType}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400">
                    OVERLAY:{' '}
                    {activeLineupPhoto?.id === currentStepLineup.id ? (
                      <span className="text-emerald-400 font-bold">ACTIVE</span>
                    ) : (
                      <span className="text-zinc-500">STANDBY</span>
                    )}
                  </span>
                </div>
              </div>

              {/* In-Game Photo with Aim Target and Loupe */}
              <div className="flex-1 relative bg-black rounded border border-zinc-800 overflow-hidden flex items-center justify-center min-h-[160px]">
                <img
                  src={currentStepLineup.imageUrl || currentStepLineup.thumbnailUrl}
                  alt={currentStepLineup.title}
                  className="w-full h-full object-contain"
                />

                {/* High-Contrast Aim Reticle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-full border-2 border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.95)] flex items-center justify-center animate-pulse">
                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                  </div>
                  <div className="absolute -left-3 w-2 h-0.5 bg-emerald-400" />
                  <div className="absolute -right-3 w-2 h-0.5 bg-emerald-400" />
                  <div className="absolute -top-3 h-2 w-0.5 bg-emerald-400" />
                  <div className="absolute -bottom-3 h-2 w-0.5 bg-emerald-400" />
                  <span className="absolute -bottom-4.5 bg-black/90 border border-rose-500 px-1 py-0.2 text-[8px] font-black text-rose-400 uppercase tracking-widest whitespace-nowrap">
                    AIM HERE
                  </span>
                </div>

                {/* 4.5x Zoom Loupe */}
                {currentStepLineup.imageUrl && (
                  <div className="absolute bottom-2 left-2 border border-cyan-400 bg-black/95 p-1 shadow-2xl flex flex-col items-center">
                    <span className="text-[8px] font-black text-cyan-400 px-1 mb-0.5 uppercase tracking-wider">
                      4.5X LOUPE
                    </span>
                    <div
                      className="w-24 h-16 border border-zinc-700 relative overflow-hidden"
                      style={{
                        backgroundImage: `url(${currentStepLineup.imageUrl})`,
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

                {/* Landing preview */}
                {currentStepLineup.thumbnailUrl && (
                  <div className="absolute bottom-2 right-2 border border-zinc-700 bg-black/95 p-1 flex flex-col items-center">
                    <span className="text-[8px] text-zinc-400 px-1 mb-0.5">LANDING</span>
                    <img
                      src={currentStepLineup.thumbnailUrl}
                      alt="Landing"
                      className="w-20 h-14 object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Instructions and Controls */}
              <div className="flex items-center justify-between pt-1 border-t border-zinc-800 text-xs shrink-0">
                <div className="flex items-center gap-2 truncate text-zinc-300">
                  <span className="text-zinc-500 font-bold">AIM:</span>
                  <span className="truncate">
                    {currentStepLineup.aimReference?.crosshairPlacement ||
                      currentStepLineup.instructions?.[1] ||
                      'Align crosshair at reticle target'}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleToggleOverlayPhoto}
                    className="border border-zinc-700 bg-zinc-900 hover:border-zinc-500 px-3 py-1 text-xs font-bold text-zinc-200 transition-colors cursor-pointer"
                  >
                    [F1: TOGGLE]
                  </button>
                  <button
                    onClick={handleAdvanceStep}
                    className="border border-cyan-500/60 bg-cyan-950/40 hover:bg-cyan-900/60 px-3 py-1 text-xs font-bold text-cyan-300 transition-colors cursor-pointer flex items-center gap-1"
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
        {/* RIGHT COLUMN: GEMINI AI COACH & LIVE STRATEGY (5 Cols)             */}
        {/* ================================================================== */}
        <div className="col-span-5 flex flex-col border border-zinc-800 bg-[#0c0c0e] p-3 gap-3 overflow-hidden relative">
          {/* Cyber-brutalist Corner Notches */}
          <span className="absolute -top-1 -left-1 text-zinc-500 font-mono text-xs select-none">┌</span>
          <span className="absolute -top-1 -right-1 text-zinc-500 font-mono text-xs select-none">┐</span>
          <span className="absolute -bottom-1 -left-1 text-zinc-500 font-mono text-xs select-none">└</span>
          <span className="absolute -bottom-1 -right-1 text-zinc-500 font-mono text-xs select-none">┘</span>

          {/* Section Header & Real-Time Coach Toggle */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold tracking-wider uppercase text-zinc-100">
                [GEMINI COACH // LIVE ADVICE]
              </span>
            </div>

            <button
              onClick={handleToggleRealtimeCoach}
              className={`flex items-center gap-1.5 border px-2 py-0.5 text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                realtimeCoachEnabled
                  ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-400'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${realtimeCoachEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
              <span>LIVE COACH: {realtimeCoachEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Action Button: Request Advice (Hatched Cyber-Brutalist Button) */}
          <button
            onClick={() => handleRequestAdvice()}
            disabled={loadingAdvice}
            className={`w-full py-2 px-3 border border-emerald-500/80 text-xs font-black uppercase tracking-wider text-emerald-300 hatched-bg transition-opacity cursor-pointer ${
              loadingAdvice ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
            }`}
          >
            {loadingAdvice ? '[ GENERATING STRATEGY... ]' : '[ REQUEST PLAY STRATEGY ]'}
          </button>

          {/* Quick Tactical Prompt Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 text-[10px]">
            <button
              onClick={() => handleRequestAdvice('Recommend A Site Execute coordination')}
              className="border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 px-2 py-1 text-zinc-400 hover:text-zinc-200 cursor-pointer whitespace-nowrap"
            >
              # A EXECUTE
            </button>
            <button
              onClick={() => handleRequestAdvice('Recommend Mid Control & Split')}
              className="border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 px-2 py-1 text-zinc-400 hover:text-zinc-200 cursor-pointer whitespace-nowrap"
            >
              # MID SPLIT
            </button>
            <button
              onClick={() => handleRequestAdvice('Recommend Retake Strategy')}
              className="border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 px-2 py-1 text-zinc-400 hover:text-zinc-200 cursor-pointer whitespace-nowrap"
            >
              # RETAKE
            </button>
            <button
              onClick={() => handleRequestAdvice('Eco round save and stack advice')}
              className="border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 px-2 py-1 text-zinc-400 hover:text-zinc-200 cursor-pointer whitespace-nowrap"
            >
              # ECO STACK
            </button>
          </div>

          {/* Tactical Advice Terminal Output */}
          <div className="flex-1 flex flex-col border border-zinc-800 bg-black/80 p-3 min-h-0 overflow-y-auto font-mono text-xs text-zinc-300 gap-2">
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 border-b border-zinc-900 pb-1.5 shrink-0">
              <Terminal className="h-3 w-3 text-emerald-400" />
              <span>TACTICAL TERMINAL OUTPUT:</span>
            </div>

            {loadingAdvice ? (
              <div className="flex items-center gap-2 text-emerald-400 py-4 animate-pulse">
                <span>&gt; Processing live telemetry with Gemini...</span>
              </div>
            ) : recommendation ? (
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-emerald-400 font-bold">&gt; PLAN: </span>
                  <span className="text-zinc-100 font-semibold">{recommendation.summary}</span>
                </div>

                {recommendation.suggestedExecution && recommendation.suggestedExecution.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-zinc-500 text-[10px] font-bold">EXECUTION SEQUENCE:</span>
                    {recommendation.suggestedExecution.map((step, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-zinc-300">
                        <span className="text-cyan-400 shrink-0"># {i + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}

                {recommendation.economyNote && (
                  <div className="border-t border-zinc-900 pt-1.5 text-[11px] text-amber-300/90">
                    <span className="font-bold text-amber-400">ECONOMY: </span>
                    <span>{recommendation.economyNote}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-500 text-xs p-4 space-y-2">
                <Sparkles className="h-5 w-5 text-zinc-600 mb-1" />
                <p>Click &quot;[ REQUEST PLAY STRATEGY ]&quot; or enable Live Coach for automatic round advice.</p>
                <p className="text-[10px] text-zinc-600">Requires configured Gemini API Key in Settings.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMatchView;
