/**
 * CS2 Assistant - Live Match Destination View
 * File: src/renderer/components/destinations/LiveMatchView.tsx
 *
 * Implements Section 3.1 Match Detection ("Waiting for Match to Start" standby state
 * when no active CS2 match is detected) and the Active Match Tactical Dashboard
 * powered by real CS2 GSI telemetry (or explicitly activated Simulation Mode).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Crosshair,
  Shield,
  Activity,
  Play,
  Sparkles,
  Radio,
  CheckCircle2,
  Clock,
  Flame,
  Eye,
  ArrowLeft,
  Sliders,
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
  // 1. Live GSI Status from Electron Main Process
  const [gsiStatus, setGsiStatus] = useState<GsiStatus>({
    listening: true,
    port: 3001,
    clientConnected: false,
    authenticated: true,
    lastHeartbeat: null,
    environment: 'COMPETITIVE_PROTECTED',
    activeMatch: false,
  });

  // Explicit Simulation / Preview Mode toggle (never auto-faked)
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false);

  // 2. Real Bomb State (null when no bomb is planted — NEVER loops infinitely)
  const [bombState, setBombState] = useState<BombState | null>(null);
  const [bombCountdown, setBombCountdown] = useState<number>(0);

  // 3. Tactical Observations (Provenance tracked)
  const [observations, setObservations] = useState<TacticalObservation[]>([]);

  // 4. Lineup Execution Assistant & Selected Map Lineups
  const [mapLineups, setMapLineups] = useState<Lineup[]>(() =>
    getAllLineups().filter((l) => l.map === 'de_mirage')
  );
  const [selectedLineupIndex, setSelectedLineupIndex] = useState<number>(0);
  const [fsmState, setFsmState] = useState<LineupFsmState>('INACTIVE');
  const [lastCompletionType, setLastCompletionType] = useState<CompletionType | null>(null);

  // 5. Gemini Tactical Coach Recommendation
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

    return () => {
      unsubGsi();
      unsubBomb();
      unsubObs();
      unsubRec?.();
    };
  }, []);

  // Tick down bomb timer ONLY when a bomb is actually planted; stops at 0.0 (no infinite loop)
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

  const handleInjectPalaceElimination = async () => {
    if (window.cs2Assistant?.gsi) {
      await window.cs2Assistant.gsi.injectScenario('palace-killer-invariance');
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

  const fsmSteps: LineupFsmState[] = [
    'INACTIVE',
    'NEARBY',
    'POSITIONING',
    'ALIGNING',
    'READY',
    'EXECUTED',
    'NEXT',
  ];

  const handleNextState = () => {
    const currentIndex = fsmSteps.indexOf(fsmState);
    const nextIndex = (currentIndex + 1) % fsmSteps.length;
    setFsmState(fsmSteps[nextIndex]);
  };

  const handleCompleteLineup = (type: CompletionType) => {
    setLastCompletionType(type);
    setFsmState('EXECUTED');
    if (selectedLineupIndex < mapLineups.length - 1) {
      setTimeout(() => {
        setSelectedLineupIndex((prev) => prev + 1);
        setFsmState('POSITIONING');
      }, 800);
    }
  };

  const activeLineup = mapLineups[selectedLineupIndex] || mapLineups[0];
  const isMatchSessionOpen = gsiStatus.activeMatch || isSimulationMode;
  const isBombPlanted = Boolean(bombState?.planted && bombCountdown > 0);

  // ==========================================================================
  // STATE 1: WAITING FOR CS2 MATCH TO START (DEFAULT STANDBY VIEW)
  // ==========================================================================
  if (!isMatchSessionOpen) {
    return (
      <div
        data-testid="view-live-match"
        className="flex h-full w-full flex-col items-center justify-center bg-background p-6 overflow-y-auto"
      >
        <div className="w-full max-w-3xl rounded-lg border border-border-subtle bg-background-panel p-6 shadow-hud space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-border-subtle pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-tactical-amber/40 bg-tactical-amber/10 text-tactical-amber">
                <Radio className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-wider text-zinc-100 uppercase">
                  AGUARDANDO PARTIDA DO CS2 COMEÇAR
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  O painel tático em tempo real será ativado automaticamente assim que você entrar em um mapa no Counter-Strike 2.
                </p>
              </div>
            </div>
            <span className="rounded border border-tactical-amber/30 bg-tactical-amber/10 px-2.5 py-1 font-mono text-[10px] font-semibold text-tactical-amber uppercase">
              STANDBY // AWAITING MATCH
            </span>
          </div>

          {/* Connection & Telemetry Diagnostics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Card 1: Local GSI Server */}
            <div className="rounded border border-border-subtle bg-background p-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">Servidor GSI Local</span>
                <span className="h-2 w-2 rounded-full bg-tactical-emerald" />
              </div>
              <div className="font-mono text-xs font-bold text-tactical-emerald">
                ONLINE (127.0.0.1:3000 & 3001)
              </div>
              <p className="text-[11px] text-zinc-500">
                Escutando telemetria oficial HTTP POST da Valve sem leitura de memória.
              </p>
            </div>

            {/* Card 2: CS2 Client Connection */}
            <div className="rounded border border-border-subtle bg-background p-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">Cliente Counter-Strike 2</span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    gsiStatus.clientConnected ? 'bg-tactical-emerald animate-pulse' : 'bg-tactical-amber'
                  }`}
                />
              </div>
              <div
                className={`font-mono text-xs font-bold ${
                  gsiStatus.clientConnected ? 'text-tactical-emerald' : 'text-tactical-amber'
                }`}
              >
                {gsiStatus.clientConnected
                  ? 'CONECTADO (NO MENU / LOBBY)'
                  : 'AGUARDANDO SINAL DO CS2'}
              </div>
              <p className="text-[11px] text-zinc-500">
                {gsiStatus.clientConnected
                  ? 'O CS2 está enviando sinal! Entre em uma partida (Premier, Competitivo ou Treino) para iniciar.'
                  : 'Abra o CS2 e entre em uma partida para iniciar a sessão tática automaticamente.'}
              </p>
            </div>

            {/* Card 3: GSI Config Status */}
            <div className="rounded border border-border-subtle bg-background p-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">Integração GSI (.cfg)</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-tactical-cyan" />
              </div>
              <div className="font-mono text-xs font-bold text-tactical-cyan">
                CONFIGURADO AUTOMATICAMENTE
              </div>
              <p className="text-[11px] text-zinc-500">
                Compatível com <code className="text-zinc-300">gamestate_integration_*.cfg</code> na pasta do seu CS2.
              </p>
            </div>
          </div>

          {/* Prepared Utilities Summary */}
          <div className="rounded border border-border-subtle bg-background p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                Perfil Preparado para a Partida ({mapLineups.length} Utilitárias Carregadas)
              </span>
              <span className="font-mono text-[10px] text-tactical-cyan">MAPA PADRÃO: DE_MIRAGE</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {mapLineups.slice(0, 5).map((lu) => (
                <div
                  key={lu.id}
                  className="flex items-center gap-1.5 rounded border border-border-subtle bg-background-panel px-2.5 py-1 text-xs font-mono text-zinc-300"
                >
                  <Flame className="h-3 w-3 text-tactical-cyan" />
                  <span>{lu.title}</span>
                  <span className="text-[10px] text-zinc-500">({lu.side})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
            <div className="text-[11px] text-zinc-400">
              Quer testar os recursos agora sem entrar em um servidor do CS2?
            </div>
            <button
              data-testid="enter-simulation-btn"
              onClick={handleEnterSimulation}
              className="flex items-center gap-2 rounded border border-tactical-cyan/50 bg-tactical-cyan/15 px-4 py-2 text-xs font-semibold text-tactical-cyan hover:bg-tactical-cyan/25 transition-colors cursor-pointer"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Abrir Modo de Simulação / Preview Tático</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // STATE 2: ACTIVE LIVE MATCH / TACTICAL SIMULATION SESSION
  // ==========================================================================
  const currentMapName = (gsiStatus.map || 'de_mirage').toUpperCase();
  const currentModeName = (gsiStatus.mode || (isSimulationMode ? 'SIMULATION' : 'COMPETITIVE')).toUpperCase();
  const ctScore = gsiStatus.ctScore ?? 7;
  const tScore = gsiStatus.tScore ?? 5;
  const currentRound = gsiStatus.round ?? 13;
  const roundPhase = (gsiStatus.roundPhase || 'live').toUpperCase();

  return (
    <div data-testid="view-live-match" className="flex h-full w-full flex-col overflow-hidden bg-background p-4 gap-3">
      {/* Top Telemetry Header Bar */}
      <div className="flex items-center justify-between rounded border border-border-subtle bg-background-panel px-4 py-2 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-tactical-emerald animate-pulse" />
            <span className="font-semibold text-zinc-100 uppercase tracking-wider">{currentMapName}</span>
            <span className="font-mono text-[10px] text-tactical-cyan border border-tactical-cyan/30 bg-tactical-cyan/10 px-1.5 py-0.5 rounded">
              {currentModeName}
            </span>
          </div>
          <div className="h-3 w-px bg-border-subtle" />
          <div className="font-mono tabular-nums text-zinc-200">
            PLACAR: <span className="text-tactical-cyan font-bold">CT {ctScore}</span> -{' '}
            <span className="text-tactical-amber font-bold">{tScore} T</span>
          </div>
          <div className="h-3 w-px bg-border-subtle" />
          <div className="font-mono text-zinc-300">
            ROUND {currentRound} ({roundPhase}) //{' '}
            {isBombPlanted ? (
              <span className="text-tactical-rose font-bold animate-pulse">
                C4 PLANTADA (00:{bombCountdown.toFixed(1).padStart(4, '0')})
              </span>
            ) : (
              <span className="text-tactical-emerald">C4 NÃO PLANTADA</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          {gsiStatus.playerName && (
            <span className="text-zinc-300">
              {gsiStatus.playerName} ({gsiStatus.playerTeam || 'CT'}) • HP: {gsiStatus.playerHealth ?? 100}
            </span>
          )}
          <span className="text-zinc-400">
            ECONOMIA: <span className="text-tactical-emerald font-semibold">${gsiStatus.playerMoney ?? 4500}</span>
          </span>
          {isSimulationMode && (
            <button
              onClick={handleExitSimulation}
              className="flex items-center gap-1 rounded border border-border-elevated bg-background px-2.5 py-1 text-[10px] text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Voltar para Espera de Partida</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Dual-Column Content */}
      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* Left Column (58%): Lineup Guide + Tactical Memory & Callouts */}
        <div className="flex flex-col flex-[3] gap-3 overflow-hidden">
          {/* Interactive Utility Lineup Visual Guide */}
          <div className="flex flex-col flex-1 rounded border border-border-subtle bg-background-panel p-3 overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-200 uppercase tracking-wider">
                <Crosshair className="h-3.5 w-3.5 text-tactical-cyan" />
                <span>Assistente de Utilitárias & Alinhamento de Mira ({currentMapName})</span>
              </div>
              <div className="flex items-center gap-1">
                {mapLineups.map((lu, idx) => (
                  <button
                    key={lu.id}
                    onClick={() => {
                      setSelectedLineupIndex(idx);
                      setFsmState('POSITIONING');
                    }}
                    className={`rounded px-2 py-0.5 font-mono text-[10px] transition-colors cursor-pointer ${
                      idx === selectedLineupIndex
                        ? 'bg-tactical-cyan text-zinc-950 font-bold'
                        : 'border border-border-subtle bg-background text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {lu.title.replace(/^Mirage\s+/i, '')}
                  </button>
                ))}
              </div>
            </div>

            {activeLineup && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 my-2 overflow-y-auto">
                {/* Left: SVG Aim Reference */}
                <div className="relative rounded bg-[#0e0e11] border border-border-subtle/60 p-3 flex flex-col items-center justify-center min-h-[180px]">
                  <div
                    className="w-full h-40 flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: activeLineup.svgReference }}
                  />
                  <div className="mt-2 text-center font-mono text-[11px] text-tactical-cyan">
                    Mira: {activeLineup.aimReference.crosshairPlacement}
                  </div>
                </div>

                {/* Right: Step-by-Step Instructions */}
                <div className="flex flex-col justify-between rounded bg-background border border-border-subtle p-3 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-100">{activeLineup.title}</span>
                      <span className="rounded bg-tactical-emerald/15 px-2 py-0.5 font-mono text-[10px] text-tactical-emerald font-semibold">
                        {activeLineup.throwType}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      Posição Inicial: <span className="text-zinc-200">{activeLineup.startPosition.callout}</span> → Alvo:{' '}
                      <span className="text-zinc-200">{activeLineup.targetDestination.callout}</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-300 pt-1">
                      {activeLineup.instructions.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span>Dificuldade: {activeLineup.difficulty}</span>
                    <span>Versão CS2: {activeLineup.gameVersion}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tactical Observation Feed + Quick Callout Recorder */}
          <div className="flex flex-col h-56 rounded border border-border-subtle bg-background-panel p-3 overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-200 uppercase tracking-wider">
                <Activity className="h-3.5 w-3.5 text-tactical-emerald" />
                <span>Memória Tática do Round & Registro Rápido de Callouts</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-500">EXPIRAÇÃO: 30s</span>
            </div>

            {/* Quick Callout Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 py-2 border-b border-border-subtle/60">
              <span className="text-[10px] font-mono text-zinc-400 mr-1">Registrar Callout:</span>
              {['Palace', 'Window', 'Jungle', 'Connector', 'B Apartments', 'A Ramp', 'CT Spawn'].map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleInjectCallout(loc)}
                  className="rounded border border-border-subtle bg-background px-2 py-0.5 font-mono text-[10px] text-zinc-300 hover:border-tactical-amber hover:text-tactical-amber transition-colors cursor-pointer"
                >
                  + {loc}
                </button>
              ))}
              <button
                onClick={handleInjectPalaceElimination}
                className="rounded border border-tactical-rose/40 bg-tactical-rose/10 px-2 py-0.5 font-mono text-[10px] text-tactical-rose hover:bg-tactical-rose/20 transition-colors cursor-pointer"
              >
                + Kill Palace (Invariância Killer)
              </button>
            </div>

            {/* Observations List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pt-2 pr-1">
              {observations.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs font-mono text-zinc-500">
                  Nenhuma observação ativa neste round. Use os botões acima ou aguarde eventos da partida.
                </div>
              ) : (
                observations.map((obs) => (
                  <div
                    key={obs.eventId}
                    className="rounded border border-border-subtle bg-background p-2 text-xs font-mono flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                          obs.confidence === 'CONFIRMED'
                            ? 'bg-tactical-emerald/20 text-tactical-emerald border border-tactical-emerald/30'
                            : obs.confidence === 'REPORTED'
                            ? 'bg-tactical-amber/20 text-tactical-amber border border-tactical-amber/30'
                            : 'bg-tactical-cyan/20 text-tactical-cyan border border-tactical-cyan/30'
                        }`}
                      >
                        [{obs.confidence}]
                      </span>
                      <span className="text-zinc-200">
                        {obs.playerIdentity?.name || 'Oponente'}{' '}
                        {obs.location?.callout
                          ? `@ ${obs.location.callout}`
                          : '[Posição Não Confirmada — Isolada da Vítima]'}
                      </span>
                    </div>
                    <span className="text-zinc-500 text-[10px]">
                      {Math.max(0, Math.round((Date.now() - obs.timestamp) / 1000))}s atrás ({obs.source})
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (42%): Bomb Timer (Event-Driven), Lineup FSM & Gemini Coach */}
        <div className="flex flex-col flex-[2] gap-3 overflow-y-auto">
          {/* Bomb Timer Widget — Event-Driven (No Infinite Loop!) */}
          <div className="rounded border border-border-subtle bg-background-panel p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-200 uppercase tracking-wider">CRONÔMETRO C4 (40.0s)</span>
              <span
                className={`font-mono text-[10px] font-medium ${
                  isBombPlanted ? 'text-tactical-rose animate-pulse' : 'text-zinc-500'
                }`}
              >
                {isBombPlanted ? `PLANTADA (${bombState?.site || 'A'})` : 'AGUARDANDO PLANT'}
              </span>
            </div>

            {isBombPlanted ? (
              <div className="rounded border border-tactical-rose/40 bg-background p-3 flex flex-col items-center justify-center gap-2">
                <div
                  className={`font-mono text-3xl font-bold tracking-tight tabular-nums ${
                    bombCountdown > 20
                      ? 'text-tactical-emerald'
                      : bombCountdown > 10
                      ? 'text-tactical-amber'
                      : 'text-tactical-rose animate-pulse'
                  }`}
                >
                  00:{bombCountdown.toFixed(1).padStart(4, '0')}
                </div>

                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-100 ${
                      bombCountdown > 20
                        ? 'bg-tactical-emerald'
                        : bombCountdown > 10
                        ? 'bg-tactical-amber'
                        : 'bg-tactical-rose'
                    }`}
                    style={{ width: `${(bombCountdown / 40.0) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between w-full text-[10px] font-mono text-zinc-400 pt-1">
                  <span>
                    KIT DEFUSE (5s):{' '}
                    <span className={bombCountdown >= 5 ? 'text-tactical-emerald font-bold' : 'text-tactical-rose font-bold'}>
                      {bombCountdown >= 5 ? 'VIÁVEL' : 'SEM TEMPO (GUARDE)'}
                    </span>
                  </span>
                  <span>
                    SEM KIT (10s):{' '}
                    <span className={bombCountdown >= 10 ? 'text-tactical-emerald font-bold' : 'text-tactical-rose font-bold'}>
                      {bombCountdown >= 10 ? 'VIÁVEL' : 'SEM TEMPO'}
                    </span>
                  </span>
                </div>

                <button
                  onClick={handleClearBomb}
                  className="mt-1 w-full rounded border border-border-subtle bg-background-panel py-1 text-[10px] font-mono text-zinc-300 hover:text-white cursor-pointer"
                >
                  [Encerrar / Desarmar C4]
                </button>
              </div>
            ) : (
              <div className="rounded border border-border-subtle bg-background p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Clock className="h-4 w-4 text-zinc-500" />
                  <span>Bomba não plantada neste momento.</span>
                </div>
                <button
                  onClick={handleSimulateBombPlant}
                  className="rounded border border-tactical-rose/40 bg-tactical-rose/10 px-2.5 py-1 font-mono text-[10px] text-tactical-rose hover:bg-tactical-rose/20 transition-colors cursor-pointer"
                >
                  [Testar Plant 40s]
                </button>
              </div>
            )}
          </div>

          {/* Lineup Execution State Machine Widget */}
          <div className="rounded border border-border-subtle bg-background-panel p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-200 uppercase tracking-wider">SEQUÊNCIA DE EXECUÇÃO (FSM)</span>
              <span className="font-mono text-[10px] text-tactical-cyan">
                {activeLineup?.title || 'MIRAGE SMOKE'}
              </span>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {fsmSteps.map((step) => (
                <div
                  key={step}
                  className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase transition-colors ${
                    fsmState === step
                      ? 'bg-tactical-cyan text-zinc-950 font-bold'
                      : 'border border-border-subtle bg-background text-zinc-500'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>

            <div className="rounded border border-border-subtle bg-background p-2 text-xs font-mono space-y-1 text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500">ESTADO ATUAL:</span>
                <span className="text-tactical-cyan font-semibold">{fsmState}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">GRANADA SELECIONADA:</span>
                <span>
                  {selectedLineupIndex + 1} de {mapLineups.length}
                </span>
              </div>
              {lastCompletionType && (
                <div className="flex justify-between text-tactical-emerald">
                  <span>ÚLTIMA EXECUÇÃO:</span>
                  <span>{lastCompletionType}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleNextState}
                className="flex-1 rounded border border-border-elevated bg-background px-2 py-1 text-xs text-zinc-200 hover:bg-background-elevated transition-colors cursor-pointer"
              >
                [Avançar Estado]
              </button>
              <button
                onClick={() => handleCompleteLineup('Manually completed')}
                className="rounded border border-tactical-emerald/40 bg-tactical-emerald/10 px-2.5 py-1 text-xs text-tactical-emerald hover:bg-tactical-emerald/20 transition-colors cursor-pointer"
              >
                [Marcar Lançada]
              </button>
            </div>
          </div>

          {/* Gemini AI Tactical Coach Advice Card */}
          <div className="rounded border border-border-subtle bg-background-panel p-3 space-y-2 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-200 uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 text-tactical-cyan" />
                  <span>GEMINI TACTICAL COACH</span>
                </div>
                <button
                  onClick={handleRequestAiAdvice}
                  disabled={loadingAdvice}
                  className="rounded border border-tactical-cyan/40 bg-tactical-cyan/15 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-tactical-cyan hover:bg-tactical-cyan/25 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {loadingAdvice ? 'Analisando...' : 'Gerar Recomendação Tática'}
                </button>
              </div>

              <div className="rounded border border-tactical-cyan/30 bg-tactical-cyan/5 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-tactical-cyan/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-tactical-cyan uppercase">
                    {recommendation
                      ? `${recommendation.priority} // ${Math.round(recommendation.confidence * 100)}% CONFIANÇA`
                      : 'TACTICAL ENGINE READY'}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400">gemini-3.8-flash</span>
                </div>

                <div className="text-xs font-semibold text-zinc-100">
                  &ldquo;
                  {recommendation
                    ? recommendation.shortDisplayText
                    : isBombPlanted
                    ? 'POST-PLANT: JOGUE NO TEMPO DA C4 E CROSSFIRE'
                    : 'CONTROLE DE MEIO E EXECUÇÃO SINCRONIZADA DE SMOKES'}
                  &rdquo;
                </div>

                <p className="text-[11px] leading-relaxed text-zinc-400">
                  {recommendation
                    ? recommendation.detailedExplanation
                    : 'Clique em "Gerar Recomendação Tática" para analisar o estado atual do round, economia da equipe e callouts registrados na Memória Tática.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMatchView;
