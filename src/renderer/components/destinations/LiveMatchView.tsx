/**
 * CS2 Assistant - Live Match Destination View
 * File: src/renderer/components/destinations/LiveMatchView.tsx
 *
 * Implements real-time match telemetry, 2D tactical radar overview,
 * provenance-tracked tactical observation feed with Palace killer invariance,
 * bomb timer widget, lineup execution FSM, and Gemini coach card.
 */

import React, { useState, useEffect } from 'react';
import {
  Crosshair,
  Shield,
  Activity,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Bot,
  MapPin,
} from 'lucide-react';
import type {
  LineupFsmState,
  CompletionType,
  TacticalObservation,
} from '../../../shared/ipc-types';

export const LiveMatchView: React.FC = () => {
  const [isMatchActive, setIsMatchActive] = useState<boolean>(true);
  const [bombCountdown, setBombCountdown] = useState<number>(24.2);
  const [fsmState, setFsmState] = useState<LineupFsmState>('POSITIONING');
  const [lastCompletionType, setLastCompletionType] = useState<CompletionType | null>(null);

  // Sample tactical observations demonstrating Palace killer invariance
  const [observations, setObservations] = useState<TacticalObservation[]>([
    {
      eventId: 'evt-101',
      type: 'KILL',
      timestamp: Date.now() - 3200,
      roundId: 13,
      map: 'de_mirage',
      source: 'KILLFEED',
      playerIdentity: { team: 'T', name: 'Player X', slot: 1 },
      location: { callout: 'Palace', x: -1450, y: -620, z: -160 },
      confidence: 'CONFIRMED',
      expiresAt: Date.now() + 26800,
    },
    {
      eventId: 'evt-102',
      type: 'POSITION_REPORT',
      timestamp: Date.now() - 8500,
      roundId: 13,
      map: 'de_mirage',
      source: 'AUDIO_RADAR',
      playerIdentity: { team: 'T', name: 'Unknown Opponent', slot: 2 },
      location: { callout: 'B Apartments', x: -1100, y: 800, z: -150 },
      confidence: 'REPORTED',
      expiresAt: Date.now() + 21500,
    },
    {
      eventId: 'evt-103',
      type: 'POSITION_REPORT',
      timestamp: Date.now() - 14000,
      roundId: 13,
      map: 'de_mirage',
      source: 'MANUAL_REPORT',
      playerIdentity: { team: 'T', name: 'Rotator', slot: 3 },
      location: { callout: 'Connector / Short', x: -450, y: -200, z: -160 },
      confidence: 'INFERRED',
      expiresAt: Date.now() + 16000,
    },
  ]);

  // Simulate countdown tick for active bomb timer
  useEffect(() => {
    if (!isMatchActive) return;
    const timer = setInterval(() => {
      setBombCountdown((prev) => {
        if (prev <= 0.1) return 40.0;
        return Number((prev - 0.1).toFixed(1));
      });
    }, 100);
    return () => clearInterval(timer);
  }, [isMatchActive]);

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
  };

  const handleCancelLineup = () => {
    setFsmState('INACTIVE');
    setLastCompletionType(null);
  };

  return (
    <div data-testid="view-live-match" className="flex h-full w-full flex-col overflow-hidden bg-background p-4 gap-3">
      {/* Top Telemetry Header Bar */}
      <div className="flex items-center justify-between rounded border border-border-subtle bg-background-panel px-4 py-2 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-100 uppercase tracking-wider">DE_MIRAGE</span>
            <span className="font-mono text-[10px] text-zinc-400 border border-border-subtle px-1.5 py-0.5 rounded">
              PREMIER
            </span>
          </div>
          <div className="h-3 w-px bg-border-subtle" />
          <div className="font-mono tabular-nums text-zinc-200">
            SCORE: <span className="text-tactical-cyan font-bold">CT 7</span> - <span className="text-tactical-amber font-bold">5 T</span>
          </div>
          <div className="h-3 w-px bg-border-subtle" />
          <div className="font-mono text-zinc-300">
            ROUND 13 // <span className="text-tactical-rose font-medium">BOMB PLANTED (00:{bombCountdown.toFixed(1).padStart(4, '0')})</span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-zinc-400">TEAM ECONOMY: <span className="text-tactical-emerald font-semibold">$14,200</span></span>
          <button
            onClick={() => setIsMatchActive(!isMatchActive)}
            className="rounded border border-border-elevated bg-background px-2.5 py-1 text-[10px] text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            {isMatchActive ? 'Pause Telemetry' : 'Resume Telemetry'}
          </button>
        </div>
      </div>

      {/* Main Dual-Column Content */}
      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* Left Column (60%): 2D Tactical Radar + Observation Feed */}
        <div className="flex flex-col flex-[3] gap-3 overflow-hidden">
          {/* 2D Radar Tactical Map Container */}
          <div className="flex flex-col flex-1 rounded border border-border-subtle bg-background-panel p-3 overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-200 uppercase tracking-wider">
                <Crosshair className="h-3.5 w-3.5 text-tactical-cyan" />
                <span>2D Tactical Radar & Location Annotations</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-500">SCALE: 1:1 CS2 GSI NORM</span>
            </div>

            {/* Radar Canvas / Visualizer */}
            <div className="relative flex-1 rounded bg-[#0e0e11] border border-border-subtle/50 my-2 overflow-hidden flex items-center justify-center">
              {/* Grid Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181c_1px,transparent_1px),linear-gradient(to_bottom,#18181c_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />

              {/* Tactical Callout Landmarks */}
              <div className="absolute top-10 left-12 flex flex-col items-center">
                <span className="font-mono text-[10px] text-zinc-400 bg-background/80 px-1.5 py-0.5 rounded border border-border-subtle">
                  B APARTMENTS
                </span>
                <span className="mt-1 h-2 w-2 rounded-full bg-tactical-amber animate-ping" />
              </div>

              <div className="absolute top-24 left-1/3 flex flex-col items-center">
                <span className="font-mono text-[10px] text-zinc-400 bg-background/80 px-1.5 py-0.5 rounded border border-border-subtle">
                  MID // CONNECTOR
                </span>
              </div>

              <div className="absolute bottom-16 right-16 flex flex-col items-center">
                <span className="font-mono text-[10px] text-tactical-cyan bg-background/80 px-1.5 py-0.5 rounded border border-tactical-cyan/40">
                  A SITE (BOMB PLANTED)
                </span>
                <span className="mt-1 h-3 w-3 rounded-full bg-tactical-rose animate-pulse" />
              </div>

              {/* Palace Elimination Landmark */}
              <div className="absolute bottom-8 right-1/3 flex flex-col items-center">
                <span className="font-mono text-[10px] text-tactical-rose bg-tactical-rose/10 px-1.5 py-0.5 rounded border border-tactical-rose/40">
                  PALACE (VICTIM ELIMINATED)
                </span>
                <span className="mt-0.5 text-[9px] font-mono text-zinc-400">
                  Killer: Player Y [LOCATION UNKNOWN]
                </span>
              </div>

              {/* Friendly Player Position */}
              <div className="absolute bottom-12 left-1/2 flex items-center gap-1.5 bg-background-elevated px-2 py-0.5 rounded border border-border-elevated">
                <span className="h-2 w-2 rounded-full bg-tactical-emerald" />
                <span className="font-mono text-[10px] text-zinc-100">YOU (STAIRS ANCHOR)</span>
              </div>
            </div>
          </div>

          {/* Tactical Observation Feed (Provenance Tracked) */}
          <div className="flex flex-col h-48 rounded border border-border-subtle bg-background-panel p-3 overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-200 uppercase tracking-wider">
                <Activity className="h-3.5 w-3.5 text-tactical-emerald" />
                <span>Tactical Observation Feed (Provenance Tracked)</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-500">DECAY TTL: 30s</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pt-2 pr-1">
              {observations.map((obs) => (
                <div
                  key={obs.eventId}
                  className="rounded border border-border-subtle bg-background p-2 text-xs font-mono space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
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
                        {obs.type === 'KILL' && `${obs.playerIdentity?.name} eliminated at ${obs.location?.callout}`}
                        {obs.type === 'POSITION_REPORT' && `Enemy audio/sighting near ${obs.location?.callout}`}
                      </span>
                    </div>
                    <span className="text-zinc-500 text-[10px]">{obs.source}</span>
                  </div>

                  {/* Palace Killer Invariance Rule Verification */}
                  {obs.eventId === 'evt-101' && (
                    <div className="pl-4 text-[10px] text-zinc-400 border-l border-border-subtle ml-2">
                      <span>└─ Killer: </span>
                      <span className="text-zinc-300 font-semibold">Player Y</span>
                      <span className="text-tactical-amber ml-2">
                        [Location: UNKNOWN — Strictly isolated from victim Palace coordinates]
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (40%): Bomb Timer, Lineup FSM & Gemini Coach */}
        <div className="flex flex-col flex-[2] gap-3 overflow-y-auto">
          {/* Bomb Timer Widget */}
          <div className="rounded border border-border-subtle bg-background-panel p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-200 uppercase tracking-wider">BOMB TIMER WIDGET</span>
              <span className="font-mono text-[10px] text-tactical-rose font-medium">SITE A PLANTED</span>
            </div>

            <div className="rounded border border-border-subtle bg-background p-3 flex flex-col items-center justify-center gap-2">
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

              {/* Progress Bar */}
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
                <span>DEFUSAL KIT: <span className="text-tactical-emerald font-semibold">EQUIPPED (5s)</span></span>
                <span>STATUS: <span className="text-tactical-emerald font-semibold">FEASIBLE</span></span>
              </div>
            </div>
          </div>

          {/* Lineup Execution State Machine Widget */}
          <div className="rounded border border-border-subtle bg-background-panel p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-200 uppercase tracking-wider">LINEUP EXECUTION ENGINE</span>
              <span className="font-mono text-[10px] text-tactical-cyan">MIRAGE A STAIRS SMOKE</span>
            </div>

            {/* 7-State FSM Ribbon */}
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

            {/* FSM Diagnostics */}
            <div className="rounded border border-border-subtle bg-background p-2 text-xs font-mono space-y-1 text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500">ACTIVE STATE:</span>
                <span className="text-tactical-cyan font-semibold">{fsmState}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">DISTANCE TO ANCHOR:</span>
                <span>14.2 units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">ANGULAR OFFSET:</span>
                <span>0.4° (ALIGNED)</span>
              </div>
              {lastCompletionType && (
                <div className="flex justify-between text-tactical-emerald">
                  <span>LAST COMPLETION:</span>
                  <span>{lastCompletionType}</span>
                </div>
              )}
            </div>

            {/* FSM Manual Control Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleNextState}
                className="flex-1 rounded border border-border-elevated bg-background px-2 py-1 text-xs text-zinc-200 hover:bg-background-elevated transition-colors cursor-pointer"
              >
                [NEXT STATE]
              </button>
              <button
                onClick={() => handleCompleteLineup('Confirmed thrown')}
                className="rounded border border-tactical-emerald/40 bg-tactical-emerald/10 px-2.5 py-1 text-xs text-tactical-emerald hover:bg-tactical-emerald/20 transition-colors cursor-pointer"
              >
                [COMPLETE]
              </button>
              <button
                onClick={handleCancelLineup}
                className="rounded border border-border-subtle bg-background px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                [CANCEL]
              </button>
            </div>
          </div>

          {/* Gemini AI Tactical Coach Advice Card */}
          <div className="rounded border border-border-subtle bg-background-panel p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-200 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-tactical-cyan" />
                <span>GEMINI TACTICAL COACH</span>
              </div>
              <span className="font-mono text-[9px] text-zinc-500">gemini-3.8-flash</span>
            </div>

            <div className="rounded border border-tactical-cyan/30 bg-tactical-cyan/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="rounded bg-tactical-cyan/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-tactical-cyan uppercase">
                  CRITICAL // 92% CONFIDENCE
                </span>
                <span className="font-mono text-[10px] text-zinc-400">Expires in 11s</span>
              </div>

              <div className="text-xs font-semibold text-zinc-100">
                &ldquo;FALLBACK SITE — 2V4 POST-PLANT CROSSFIRE&rdquo;
              </div>

              <p className="text-[11px] leading-relaxed text-zinc-400">
                Opponents rotating from Palace and Connector. Hold crossfire from CT Spawn and Ninja box. Delay defusal with Stairs molotov.
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-border-subtle/50 text-[10px] font-mono text-zinc-500">
                <span>SUPPORTING EVENTS: evt-101, evt-103</span>
                <span>LATENCY: 142ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMatchView;
