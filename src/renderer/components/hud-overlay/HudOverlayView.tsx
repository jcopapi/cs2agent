/**
 * CS2 Assistant - Standalone Transparent Click-Through HUD Overlay
 * File: src/renderer/components/hud-overlay/HudOverlayView.tsx
 *
 * Rendered in Electron's topmost frameless transparent window.
 * Enforces 100% click-through (pointer-events-none + OS WS_EX_TRANSPARENT),
 * safe-zone exclusions, and large, glanceable typography for real-time in-game use.
 */

import React, { useState, useEffect } from 'react';
import type {
  HudConfig,
  BombState,
  TacticalObservation,
  TacticalRecommendation,
  GsiStatus,
} from '../../../shared/ipc-types';

export const HudOverlayView: React.FC = () => {
  const [hudConfig, setHudConfig] = useState<HudConfig>({
    enabled: true,
    scale: 1.0,
    opacity: 0.95,
    crosshairSafeZonePx: 450,
    showRadarOverlay: true,
    showBombTimer: true,
    showLastSeen: true,
    showTacticalFeed: true,
    calibrationMode: false,
  });

  const [gsiStatus, setGsiStatus] = useState<GsiStatus | null>(null);
  const [bombState, setBombState] = useState<BombState | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [observations, setObservations] = useState<TacticalObservation[]>([]);
  const [recommendation, setRecommendation] = useState<TacticalRecommendation | null>(null);

  // Ensure root HTML/body surfaces are 100% transparent in overlay window
  useEffect(() => {
    document.documentElement.style.backgroundColor = 'transparent';
    document.body.style.backgroundColor = 'transparent';
  }, []);

  // Subscribe to IPC configuration and real tactical state
  useEffect(() => {
    const api = window.cs2Assistant;
    if (!api) return;

    api.hud.getConfig().then((cfg) => {
      if (cfg) setHudConfig(cfg);
    }).catch(() => {});

    api.gsi.getStatus().then((st) => {
      if (st) setGsiStatus(st);
    }).catch(() => {});

    api.tactical.getBombState().then((b) => {
      setBombState(b);
      if (b?.planted) {
        setRemainingSeconds(b.countdownSeconds);
      }
    }).catch(() => {});

    api.tactical.getObservations().then((obs) => {
      if (obs) setObservations(obs);
    }).catch(() => {});

    const unsubConfig = api.hud.onConfigChange?.((cfg) => {
      setHudConfig(cfg);
    });

    const unsubGsi = api.gsi.onStatusChange((st) => {
      setGsiStatus(st);
    });

    const unsubBomb = api.tactical.onBombUpdate((b) => {
      setBombState(b);
      if (b?.planted) {
        setRemainingSeconds(b.countdownSeconds);
      } else {
        setRemainingSeconds(0);
      }
    });

    const unsubObs = api.tactical.onObservationUpdate((obs) => {
      setObservations(obs || []);
    });

    const unsubRec = api.onTacticalRecommendation?.((rec) => {
      setRecommendation(rec);
    });

    return () => {
      unsubConfig?.();
      unsubGsi?.();
      unsubBomb?.();
      unsubObs?.();
      unsubRec?.();
    };
  }, []);

  // Tick down active bomb timer only while planted, stopping at 0.0 (never looping)
  useEffect(() => {
    if (!bombState?.planted || remainingSeconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        const next = Number((prev - 0.1).toFixed(1));
        if (next <= 0) {
          setBombState(null);
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [bombState?.planted, remainingSeconds > 0]);

  if (!hudConfig.enabled) {
    return null;
  }

  const chDim = hudConfig.crosshairSafeZonePx || 450;
  const isBombActive = Boolean(bombState?.planted && remainingSeconds > 0);
  const activeObs = observations.slice(0, 3);
  const currentMap = (gsiStatus?.map || 'de_mirage').toUpperCase().replace('DE_', '');
  const roundNum = gsiStatus?.round ?? 1;

  return (
    <div
      data-testid="hud-overlay-container"
      className="relative h-screen w-screen overflow-hidden bg-transparent select-none pointer-events-none font-sans"
      style={{
        opacity: hudConfig.opacity,
        transform: `scale(${hudConfig.scale})`,
        transformOrigin: 'top left',
      }}
    >
      {/* ==================================================================== */}
      {/* 1. TOP-CENTER: SYNCHRONIZED BOMB TIMER (When Planted)                */}
      {/* ==================================================================== */}
      {hudConfig.showBombTimer && isBombActive && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-50">
          <div className="rounded-lg border-2 border-tactical-rose bg-zinc-950/95 backdrop-blur-md px-6 py-2 shadow-hud flex items-center gap-4 pointer-events-none">
            <span className="font-mono text-xs text-tactical-rose font-black uppercase tracking-widest animate-pulse">
              BOMB PLANTED
            </span>
            <span
              className={`font-mono text-3xl font-black tabular-nums ${
                remainingSeconds > 20
                  ? 'text-tactical-emerald'
                  : remainingSeconds > 10
                  ? 'text-tactical-amber'
                  : 'text-tactical-rose animate-pulse'
              }`}
            >
              00:{remainingSeconds.toFixed(1).padStart(4, '0')}
            </span>
            <div className="flex flex-col text-[10px] font-mono leading-tight">
              <span className={remainingSeconds >= 5 ? 'text-tactical-emerald font-bold' : 'text-tactical-rose font-bold'}>
                KIT (5s): {remainingSeconds >= 5 ? 'VIÁVEL' : 'SEM TEMPO'}
              </span>
              <span className={remainingSeconds >= 10 ? 'text-tactical-emerald font-bold' : 'text-tactical-rose font-bold'}>
                SEM KIT (10s): {remainingSeconds >= 10 ? 'VIÁVEL' : 'GUARDE'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. LATERAL SHELF (LEFT): STRATEGIC COACH CALLOUT & LINEUP WIDGET     */}
      {/* Positioned safely below CS2 radar (Y: 340px)                         */}
      {/* ==================================================================== */}
      <div className="absolute top-[340px] left-4 flex flex-col gap-2 max-w-[340px] pointer-events-none">
        {/* Tactical Coach Card */}
        <div className="rounded-lg border border-tactical-cyan/60 bg-zinc-950/92 backdrop-blur-md p-3 shadow-hud space-y-1.5 pointer-events-none">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="rounded bg-tactical-cyan/20 px-1.5 py-0.5 font-bold text-tactical-cyan uppercase">
              COACH // {currentMap} R{roundNum}
            </span>
            <span className="text-zinc-400 font-semibold">
              {isBombActive ? 'POST-PLANT' : 'ROUND CALL'}
            </span>
          </div>

          <div className="text-sm font-black text-zinc-100 leading-tight">
            {recommendation
              ? recommendation.shortDisplayText
              : isBombActive
              ? 'JOGUE NO TEMPO DA C4 & CRUZE A MIRA'
              : 'EXECUÇÃO SINCRONIZADA & CONTROLE DE MEIO'}
          </div>

          <p className="text-[11px] text-zinc-300 leading-snug">
            {recommendation
              ? recommendation.detailedExplanation
              : isBombActive
              ? 'Segure posição passiva. Force o CT a defusar sob o som da C4.'
              : 'Prepare granadas de utilitárias antes de avançar nos pontos.'}
          </p>
        </div>

        {/* Recent Tactical Callouts / Last Seen Shelf */}
        {hudConfig.showLastSeen && activeObs.length > 0 && (
          <div className="rounded-lg border border-border-subtle bg-zinc-950/90 backdrop-blur-md p-2.5 shadow-subtle space-y-1 pointer-events-none">
            <div className="text-[10px] font-mono font-bold text-tactical-amber uppercase tracking-wider">
              ÚLTIMAS POSIÇÕES INIMIGAS:
            </div>
            {activeObs.map((obs) => (
              <div key={obs.eventId} className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-200">
                  • <span className="font-bold text-tactical-amber">{obs.location?.callout || 'Meio'}</span>
                </span>
                <span className="text-zinc-400 text-[10px]">
                  {Math.max(0, Math.round((Date.now() - obs.timestamp) / 1000))}s atrás
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 3. CALIBRATION SAFE-ZONE GUIDES (When Calibration Active)            */}
      {/* ==================================================================== */}
      {hudConfig.calibrationMode && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute border border-dashed border-tactical-rose/60 bg-tactical-rose/5 flex items-center justify-center pointer-events-none"
            style={{
              width: `${chDim}px`,
              height: `${chDim}px`,
              left: `calc(50% - ${chDim / 2}px)`,
              top: `calc(50% - ${chDim / 2}px)`,
            }}
          >
            <span className="font-mono text-[10px] text-tactical-rose bg-background/80 px-2 py-0.5 rounded">
              CROSSHAIR SAFE ZONE ({chDim}x{chDim}px)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HudOverlayView;
