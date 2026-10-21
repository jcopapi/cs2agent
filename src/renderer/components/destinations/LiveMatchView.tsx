/**
 * CS2 Assistant - Live Match Destination View (Second Monitor Optimized)
 * File: src/renderer/components/destinations/LiveMatchView.tsx
 *
 * Designed for rapid glanceability on a secondary monitor:
 * - Zero redundant HUD clutter (no HP/money/armor that is already on CS2 HUD)
 * - Large high-contrast Tactical Coach & Round Callout
 * - Full-size CSGONADE-style 3-Panel Pixel Alignment Guide with 4x Zoom Loupe
 * - Synchronized 40.0s C4 Bomb Timer
 * - Tactical Memory & Enemy Last Known Callouts
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Crosshair,
  Activity,
  Play,
  Sparkles,
  Radio,
  CheckCircle2,
  Clock,
  Flame,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  MapPin,
  Pin,
} from 'lucide-react';
import type {
  GsiStatus,
  BombState,
  Lineup,
  LineupFsmState,
  CompletionType,
  TacticalObservation,
  TacticalRecommendation,
} from '../../../shared/ipc-types';
import { getAllLineups } from '../../../core/utility/lineup-database';

export const LiveMatchView: React.FC = () => {
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
  const [observations, setObservations] = useState<TacticalObservation[]>([]);

  // Lineup Selection & Execution
  const [mapLineups, setMapLineups] = useState<Lineup[]>(() =>
    getAllLineups().filter((l) => l.map === 'de_mirage')
  );
  const [selectedLineupIndex, setSelectedLineupIndex] = useState<number>(0);
  const [fsmState, setFsmState] = useState<LineupFsmState>('POSITIONING');
  const [lastCompletionType, setLastCompletionType] = useState<CompletionType | null>(null);
  const [pinnedLineup, setPinnedLineup] = useState<Lineup | null>(null);
  const [autoPinToOverlay, setAutoPinToOverlay] = useState<boolean>(false);

  // Gemini Tactical Coach Recommendation
  const [recommendation, setRecommendation] = useState<TacticalRecommendation | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState<boolean>(false);

  // Subscribe to Electron IPC channels
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

    api.tactical.getObservations().then((obs) => {
      if (obs) setObservations(obs);
    }).catch(() => {});

    api.hud.getActiveLineupPhoto?.().then((photo) => {
      setPinnedLineup(photo);
    }).catch(() => {});

    const unsubGsi = api.gsi.onStatusChange((st) => {
      setGsiStatus(st);
      if (st.map) {
        const filtered = getAllLineups().filter((l) => l.map === st.map);
        if (filtered.length > 0) {
          setMapLineups(filtered);
        }
      }
    });

    const unsubBomb = api.tactical.onBombUpdate((b) => {
      setBombState(b);
      setBombCountdown(b?.planted ? b.countdownSeconds : 0);
    });

    const unsubObs = api.tactical.onObservationUpdate((obs) => {
      setObservations(obs || []);
    });

    const unsubRec = api.onTacticalRecommendation?.((rec) => {
      setRecommendation(rec);
    });

    const unsubPhoto = api.hud.onActiveLineupPhotoChange?.((photo) => {
      setPinnedLineup(photo);
    });

    return () => {
      unsubGsi();
      unsubBomb();
      unsubObs();
      unsubRec?.();
      unsubPhoto?.();
    };
  }, []);

  // Countdown timer for bomb
  useEffect(() => {
    if (!bombState?.planted || bombCountdown <= 0) {
      return;
    }

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

  const handleSimulateBombPlant = async () => {
    if (window.cs2Assistant?.gsi) {
      await window.cs2Assistant.gsi.injectScenario('bomb-plant-retake');
    } else {
      setBombState({
        planted: true,
        plantTime: Date.now(),
        defuseTimeRemaining: null,
        countdownSeconds: 40.0,
        site: 'A',
        defusing: false,
        hasKit: true,
        canDefuse: true,
      });
      setBombCountdown(40.0);
    }
  };

  const handleClearBomb = async () => {
    setBombState(null);
    setBombCountdown(0);
    if (window.cs2Assistant?.gsi) {
      await window.cs2Assistant.gsi.injectScenario('bomb-defuse');
    }
  };

  const handleInjectCallout = async (callout: string) => {
    if (window.cs2Assistant?.gsi) {
      await window.cs2Assistant.gsi.injectScenario(`callout:${callout}`);
    } else {
      const now = Date.now();
      setObservations((prev) => [
        {
          eventId: `obs-${now}`,
          type: 'POSITION_REPORT',
          timestamp: now,
          roundId: gsiStatus.round || 1,
          map: gsiStatus.map || 'de_mirage',
          source: 'MANUAL_REPORT',
          playerIdentity: { team: 'T', name: 'Inimigo Avistado', slot: 1 },
          location: { callout },
          confidence: 'REPORTED',
          expiresAt: now + 30000,
        },
        ...prev,
      ]);
    }
  };

  const handleRequestAiAdvice = useCallback(async () => {
    setLoadingAdvice(true);
    try {
      const activeMap = gsiStatus.map || 'de_mirage';
      const side = gsiStatus.playerTeam === 'T' ? 'T' : 'CT';
      if (window.cs2Assistant?.gemini) {
        const rec = await window.cs2Assistant.gemini.requestAdvice({
          map: activeMap,
          round: gsiStatus.round || 1,
          score: {
            ct: gsiStatus.ctScore ?? 7,
            t: gsiStatus.tScore ?? 5,
          },
          side,
          alivePlayers: { ct: 4, t: 4 },
          economy: {
            teamMoney: gsiStatus.playerMoney || 4500,
            enemyEstimatedEconomy: 'FULL_BUY',
          },
          bombPlanted: Boolean(bombState?.planted),
          recentObservations: observations,
        });
        if (rec) {
          setRecommendation(rec);
        }
      }
    } finally {
      setLoadingAdvice(false);
    }
  }, [gsiStatus, bombState, observations]);

  const activeLineup = mapLineups[selectedLineupIndex] || mapLineups[0];
  const isMatchSessionOpen = gsiStatus.activeMatch || isSimulationMode;
  const isBombPlanted = Boolean(bombState?.planted && bombCountdown > 0);

  // Auto-pin active lineup photo to HUD overlay when auto-pin is enabled
  useEffect(() => {
    if (autoPinToOverlay && activeLineup && window.cs2Assistant?.hud) {
      window.cs2Assistant.hud.setActiveLineupPhoto(activeLineup);
      setPinnedLineup(activeLineup);
    }
  }, [autoPinToOverlay, activeLineup]);

  // ==========================================================================
  // STATE 1: WAITING FOR CS2 MATCH (STANDBY)
  // ==========================================================================
  if (!isMatchSessionOpen) {
    return (
      <div
        data-testid="view-live-match"
        className="flex h-full w-full flex-col items-center justify-center bg-background p-6 select-none overflow-y-auto"
      >
        <div className="w-full max-w-3xl rounded-xl border border-border-subtle bg-background-panel p-6 shadow-hud space-y-6">
          <div className="flex items-start justify-between border-b border-border-subtle pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-tactical-amber/50 bg-tactical-amber/10 text-tactical-amber">
                <Radio className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-base font-black tracking-wider text-zinc-100 uppercase">
                  AGUARDANDO PARTIDA DO CS2 COMEÇAR
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Esta tela do segundo monitor exibirá automaticamente o Coach Estratégico e o Pixel de Granadas quando você entrar no mapa.
                </p>
              </div>
            </div>
            <span className="rounded border border-tactical-amber/30 bg-tactical-amber/10 px-3 py-1 font-mono text-xs font-bold text-tactical-amber uppercase">
              STANDBY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border-subtle bg-background p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-zinc-300">Conexão com o CS2</span>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    gsiStatus.clientConnected ? 'bg-tactical-emerald animate-pulse' : 'bg-tactical-amber'
                  }`}
                />
              </div>
              <div className={`font-mono text-sm font-bold ${gsiStatus.clientConnected ? 'text-tactical-emerald' : 'text-tactical-amber'}`}>
                {gsiStatus.clientConnected ? 'CS2 CONECTADO (NO MENU / LOBBY)' : 'AGUARDANDO SINAL DO CS2'}
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {gsiStatus.clientConnected
                  ? 'O jogo está enviando dados! Entre em qualquer partida (Competitivo, Premier, Casual ou Treino com Bots) para iniciar.'
                  : 'Abra o CS2 e entre em um mapa. O assistente iniciará automaticamente.'}
              </p>
            </div>

            <div className="rounded-lg border border-border-subtle bg-background p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-zinc-300">Integração GSI (.cfg)</span>
                <CheckCircle2 className="h-4 w-4 text-tactical-cyan" />
              </div>
              <div className="font-mono text-sm font-bold text-tactical-cyan">
                PORTAS 3000 E 3001 ATIVAS
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Escutando a telemetria oficial da Valve com zero interferência ou leitura de memória.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
            <span className="text-xs text-zinc-400">
              Quer ver a interface do segundo monitor agora mesmo sem entrar no CS2?
            </span>
            <button
              data-testid="enter-simulation-btn"
              onClick={handleEnterSimulation}
              className="flex items-center gap-2 rounded-lg border border-tactical-cyan/50 bg-tactical-cyan/15 px-5 py-2.5 text-xs font-bold text-tactical-cyan hover:bg-tactical-cyan/25 transition-colors cursor-pointer"
            >
              <Play className="h-4 w-4" />
              <span>Abrir Modo de Simulação / Preview no 2º Monitor</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // STATE 2: ACTIVE MATCH / SECOND MONITOR GLANCEABLE INTERFACE
  // ==========================================================================
  const currentMapName = (gsiStatus.map || 'de_mirage').toUpperCase().replace('DE_', '');
  const ctScore = gsiStatus.ctScore ?? 7;
  const tScore = gsiStatus.tScore ?? 5;
  const currentRound = gsiStatus.round ?? 13;
  const roundPhase = (gsiStatus.roundPhase || 'live').toUpperCase();

  return (
    <div data-testid="view-live-match" className="flex h-full w-full flex-col overflow-hidden bg-background p-3 gap-2.5 select-none font-sans">
      {/* 1. TOP HEADER: MAP, SCORE, ROUND & HUGE BOMB TIMER (When Planted) */}
      <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-background-panel px-4 py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-tactical-emerald animate-pulse" />
            <span className="text-sm font-black text-zinc-100 tracking-wider uppercase">{currentMapName}</span>
            <span className="rounded bg-tactical-cyan/15 px-2 py-0.5 font-mono text-[11px] font-bold text-tactical-cyan">
              ROUND {currentRound} ({roundPhase})
            </span>
          </div>

          <div className="h-4 w-px bg-border-subtle" />

          <div className="font-mono text-sm font-bold">
            PLACAR: <span className="text-tactical-cyan">CT {ctScore}</span> - <span className="text-tactical-amber">{tScore} T</span>
          </div>

          <div className="h-4 w-px bg-border-subtle" />

          {/* Real CS2 In-Game Detected Position */}
          <div className="flex items-center gap-2 rounded bg-zinc-900 border border-zinc-700/60 px-3 py-1">
            <MapPin className="h-3.5 w-3.5 text-tactical-cyan" />
            <span className="font-mono text-xs font-bold text-zinc-200">
              {gsiStatus.playerPlace
                ? `POSIÇÃO: ${gsiStatus.playerPlace.toUpperCase()}`
                : gsiStatus.playerPosition
                ? `POSIÇÃO: (${Math.round(gsiStatus.playerPosition.x)}, ${Math.round(gsiStatus.playerPosition.y)})`
                : 'POSIÇÃO: EM JOGO'}
            </span>
          </div>
        </div>

        {/* BOMB TIMER DISPLAY (When Planted: Huge, Instant Glanceability) */}
        {isBombPlanted ? (
          <div className="flex items-center gap-4 bg-tactical-rose/15 border border-tactical-rose/40 px-4 py-1 rounded-lg animate-pulse">
            <span className="font-mono text-xs font-black text-tactical-rose uppercase tracking-wider">
              BOMBA PLANTADA ({bombState?.site || 'A'})
            </span>
            <span className="font-mono text-2xl font-black text-tactical-rose tabular-nums">
              00:{bombCountdown.toFixed(1).padStart(4, '0')}
            </span>
            <div className="flex gap-2 font-mono text-[11px]">
              <span className={bombCountdown >= 5 ? 'text-tactical-emerald font-bold' : 'text-tactical-rose font-bold'}>
                KIT: {bombCountdown >= 5 ? 'VIÁVEL (5s)' : 'SEM TEMPO'}
              </span>
              <span className={bombCountdown >= 10 ? 'text-tactical-emerald font-bold' : 'text-tactical-rose font-bold'}>
                SEM KIT: {bombCountdown >= 10 ? 'VIÁVEL (10s)' : 'GUARDE'}
              </span>
            </div>
            <button
              onClick={handleClearBomb}
              className="rounded bg-background border border-border-subtle px-2 py-0.5 text-[10px] text-zinc-300 hover:text-white cursor-pointer"
            >
              [Desarmar]
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateBombPlant}
              className="rounded border border-tactical-rose/40 bg-tactical-rose/10 px-3 py-1 font-mono text-xs text-tactical-rose hover:bg-tactical-rose/20 cursor-pointer"
            >
              [Simular Plant C4 40s]
            </button>
            {isSimulationMode && (
              <button
                onClick={handleExitSimulation}
                className="flex items-center gap-1 rounded border border-border-elevated bg-background px-3 py-1 text-xs text-zinc-300 hover:text-white cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Voltar</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. MAIN 2-COLUMN SPLIT: LEFT = GIANT PIXEL GUIDE (CSGONADES), RIGHT = STRATEGIC COACH */}
      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* ==================================================================== */}
        {/* LEFT COLUMN (56%): GIANT CSGONADES PIXEL VISUALIZER (3 PANELS)        */}
        {/* ==================================================================== */}
        <div className="flex flex-col flex-[3] rounded-lg border border-border-subtle bg-background-panel p-3 overflow-hidden space-y-2">
          {/* Header & Quick Grenade Selectors */}
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <div className="flex items-center gap-2">
              <Crosshair className="h-4 w-4 text-tactical-cyan" />
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                GUIA VISUAL DO PIXEL & ALINHAMENTO DE MIRA
              </span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <label className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoPinToOverlay}
                  onChange={(e) => setAutoPinToOverlay(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-tactical-cyan accent-tactical-cyan h-3 w-3 cursor-pointer"
                />
                <span>Auto-fixar na tela</span>
              </label>

              <div className="h-3 w-px bg-border-subtle" />

              <div className="flex items-center gap-1 flex-wrap">
                {mapLineups.map((lu, idx) => (
                  <button
                    key={lu.id}
                    onClick={() => setSelectedLineupIndex(idx)}
                    className={`rounded px-2.5 py-1 font-mono text-xs font-bold transition-colors cursor-pointer ${
                      idx === selectedLineupIndex
                        ? 'bg-tactical-cyan text-zinc-950 shadow-sm'
                        : 'border border-border-subtle bg-background text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {lu.title.replace(/^(Mirage|Inferno|Dust II|Nuke|Ancient|Anubis)\s+/i, '')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* GIANT PIXEL CARD (REAL CSNADES FIRST-PERSON SCREENSHOT & BLOOM THUMBNAIL) */}
          {activeLineup && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden gap-2">
              {/* Photo Container: Real CS2 In-Game Lineup Screenshot */}
              <div className="relative flex-1 rounded-lg bg-zinc-950 border border-border-subtle/80 p-2 flex items-center justify-center overflow-hidden">
                {activeLineup.imageUrl ? (
                  <div className="relative w-full h-full max-h-[350px] flex items-center justify-center">
                    <img
                      src={activeLineup.imageUrl}
                      alt={activeLineup.title}
                      className="w-full h-full max-h-[350px] object-contain rounded-lg"
                    />

                    {/* 1. HIGH-CONTRAST CENTER AIM RETICLE (Exact Landmark Target) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-20">
                      <div className="w-9 h-9 rounded-full border-2 border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.95)] flex items-center justify-center animate-pulse">
                        <div className="w-2 h-2 bg-rose-500 rounded-full" />
                      </div>
                      <div className="absolute -left-3.5 w-3 h-0.5 bg-emerald-400" />
                      <div className="absolute -right-3.5 w-3 h-0.5 bg-emerald-400" />
                      <div className="absolute -top-3.5 h-3 w-0.5 bg-emerald-400" />
                      <div className="absolute -bottom-3.5 h-3 w-0.5 bg-emerald-400" />
                      <span className="absolute -bottom-5 rounded bg-black/95 border border-rose-500/80 px-1.5 py-0.2 text-[9px] font-mono font-black text-rose-400 uppercase tracking-widest whitespace-nowrap shadow-lg">
                        MIRAR NO CENTRO
                      </span>
                    </div>

                    {/* 2. 4.5X PRECISION ZOOM LOUPE (Magnifies exact pixel at center) */}
                    <div className="absolute bottom-2 left-2 rounded-lg border-2 border-tactical-cyan/80 bg-zinc-950/95 p-1.5 shadow-2xl flex flex-col items-center z-20">
                      <span className="text-[9px] font-mono font-black text-tactical-cyan px-1 mb-0.5 uppercase tracking-wider">
                        LUPA ZOOM 4X (PIXEL EXATO)
                      </span>
                      <div
                        className="relative w-36 h-28 rounded border border-zinc-700 overflow-hidden"
                        style={{
                          backgroundImage: `url(${activeLineup.imageUrl})`,
                          backgroundPosition: 'center center',
                          backgroundSize: '450%',
                          backgroundRepeat: 'no-repeat',
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-full h-px bg-emerald-400/90 absolute" />
                          <div className="h-full w-px bg-emerald-400/90 absolute" />
                          <div className="w-2 h-2 rounded-full bg-rose-500 absolute ring-2 ring-emerald-400" />
                        </div>
                      </div>
                    </div>

                    {/* 3. Picture-in-picture: Landing Bloom Result */}
                    {activeLineup.thumbnailUrl && (
                      <div className="absolute top-2 right-2 rounded-lg border-2 border-tactical-cyan/60 bg-zinc-950/90 backdrop-blur-md p-1 shadow-2xl flex flex-col items-center z-20">
                        <span className="font-mono text-[9px] font-black text-tactical-cyan uppercase tracking-wider mb-0.5">
                          IMPACTO / BLOOM
                        </span>
                        <img
                          src={activeLineup.thumbnailUrl}
                          alt="Landing bloom"
                          className="w-32 h-20 object-cover rounded"
                        />
                      </div>
                    )}

                    {/* Badge: Official CSNADES Foto */}
                    <div className="absolute top-2 left-2 flex items-center gap-2 z-20">
                      <span className="rounded bg-tactical-cyan text-zinc-950 px-2 py-0.5 font-mono text-[10px] font-black uppercase">
                        FOTO REAL CSNADES
                      </span>
                      <span className="rounded bg-zinc-900/90 text-zinc-200 px-2 py-0.5 font-mono text-[10px] font-bold border border-zinc-700">
                        {activeLineup.aimReference.crosshairPlacement}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-full h-full max-h-[340px] flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-[340px]"
                    dangerouslySetInnerHTML={{ __html: activeLineup.svgReference }}
                  />
                )}
              </div>

              {/* Instructions & Execution Action Bar */}
              <div className="rounded-lg border border-border-subtle bg-background p-2.5 flex items-center justify-between text-xs font-mono">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-zinc-100">{activeLineup.title}</span>
                    <span className="rounded bg-tactical-emerald/20 px-2 py-0.5 text-xs font-bold text-tactical-emerald">
                      {activeLineup.throwType}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400">
                    Trave em: <span className="text-zinc-200 font-bold">{activeLineup.startPosition.callout}</span> → Alvo:{' '}
                    <span className="text-tactical-cyan font-bold">{activeLineup.targetDestination.callout}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
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
                    className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-bold text-xs transition-colors cursor-pointer ${
                      pinnedLineup?.id === activeLineup.id
                        ? 'bg-tactical-emerald text-zinc-950 shadow-sm'
                        : 'border border-tactical-cyan/40 bg-tactical-cyan/15 text-tactical-cyan hover:bg-tactical-cyan/25'
                    }`}
                    title="Fixa ou remove a foto real do pixel na tela/overlay do CS2"
                  >
                    <Pin className="h-3.5 w-3.5" />
                    <span>
                      {pinnedLineup?.id === activeLineup.id
                        ? 'Foto Fixada no CS2'
                        : 'Fixar na Tela (Overlay)'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      if (selectedLineupIndex < mapLineups.length - 1) {
                        setSelectedLineupIndex((prev) => prev + 1);
                      } else {
                        setSelectedLineupIndex(0);
                      }
                    }}
                    className="flex items-center gap-1 rounded bg-background border border-border-elevated text-zinc-300 hover:text-white px-3 py-1.5 font-bold text-xs hover:bg-background-elevated cursor-pointer"
                  >
                    <span>Próxima</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* RIGHT COLUMN (44%): STRATEGIC COACH & TACTICAL MEMORY (GLANCEABLE)    */}
        {/* ==================================================================== */}
        <div className="flex flex-col flex-[2] gap-2.5 overflow-hidden">
          {/* 1. STRATEGIC COACH CARD (LARGE FONTS FOR INSTANT ABSORPTION) */}
          <div className="rounded-lg border-2 border-tactical-cyan/60 bg-background-panel p-4 shadow-hud space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-tactical-cyan" />
                <span className="text-xs font-black text-tactical-cyan uppercase tracking-wider">
                  COACH TÁTICO // PLANO DA RODADA
                </span>
              </div>
              <button
                onClick={handleRequestAiAdvice}
                disabled={loadingAdvice}
                className="rounded border border-tactical-cyan/40 bg-tactical-cyan/15 px-2.5 py-1 font-mono text-[11px] font-bold text-tactical-cyan hover:bg-tactical-cyan/25 disabled:opacity-50 cursor-pointer"
              >
                {loadingAdvice ? 'Analisando...' : 'Re-Analisar Round'}
              </button>
            </div>

            {/* Huge Headline Call */}
            <div className="text-lg font-black text-zinc-100 leading-tight">
              &ldquo;
              {recommendation
                ? recommendation.shortDisplayText
                : isBombPlanted
                ? 'JOGUE NO TEMPO DA C4 E CRUZE A MIRA'
                : 'EXECUÇÃO COORDENADA COM SMOKES E CONTROLE DE MEIO'}
              &rdquo;
            </div>

            {/* Clear Strategic Explanation */}
            <p className="text-sm text-zinc-300 leading-relaxed">
              {recommendation
                ? recommendation.detailedExplanation
                : isBombPlanted
                ? 'A C4 está no chão. Segure posições passivas de crossfire, use granadas incendiárias/molotov para atrasar e não dê a cara antes de ouvir o som do defuse.'
                : 'Use as utilitárias preparadas na esquerda para isolar os pontos de sniper (Janela/Cabecinha/Selva) antes de entrar no bomb.'}
            </p>
          </div>

          {/* 2. RECENT ENEMY CALLOUTS (TACTICAL MEMORY WITH DECAY COUNTERS) */}
          <div className="flex-1 rounded-lg border border-border-subtle bg-background-panel p-3 overflow-hidden flex flex-col space-y-2">
            <div className="flex items-center justify-between border-b border-border-subtle pb-1.5">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-tactical-amber" />
                <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  ÚLTIMAS POSIÇÕES INIMIGAS (MEMÓRIA TÁTICA)
                </span>
              </div>
              <span className="font-mono text-[10px] text-zinc-500">DECAIMENTO: 30s</span>
            </div>

            {/* Quick Callout Buttons for the Map */}
            <div className="flex flex-wrap items-center gap-1 py-1">
              <span className="text-[10px] font-mono text-zinc-400 mr-1">Registrar Call:</span>
              {['Palace', 'Window', 'Jungle', 'Connector', 'B Apps', 'A Ramp'].map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleInjectCallout(loc)}
                  className="rounded border border-border-subtle bg-background px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-300 hover:border-tactical-amber hover:text-tactical-amber cursor-pointer"
                >
                  + {loc}
                </button>
              ))}
            </div>

            {/* Active Enemy Observations */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {observations.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs font-mono text-zinc-500">
                  Nenhuma observação inimiga ativa neste momento.
                </div>
              ) : (
                observations.map((obs) => {
                  const ageSec = Math.max(0, Math.round((Date.now() - obs.timestamp) / 1000));
                  return (
                    <div
                      key={obs.eventId}
                      className="rounded border border-border-subtle bg-background p-2 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-tactical-amber/20 border border-tactical-amber/30 px-1.5 py-0.5 text-[10px] font-bold text-tactical-amber">
                          {obs.confidence}
                        </span>
                        <span className="text-sm font-bold text-zinc-100">
                          {obs.location?.callout || 'Posição Desconhecida'}
                        </span>
                      </div>
                      <span className="text-xs text-tactical-amber font-bold">{ageSec}s atrás</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMatchView;
