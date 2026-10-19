/**
 * CS2 Assistant - Standalone Transparent Click-Through HUD Overlay
 * File: src/renderer/components/hud-overlay/HudOverlayView.tsx
 *
 * Rendered in Electron's topmost frameless transparent window.
 * Enforces zero input blocking (100% pointer-events-none + OS WS_EX_TRANSPARENT),
 * safe-zone exclusions (450x450 crosshair, radar, status HUD, killfeed),
 * and only displays widgets when actual tactical telemetry or calibration is active.
 */

import React, { useState, useEffect } from 'react';
import type {
  HudConfig,
  EnvironmentMode,
  BombState,
  TacticalObservation,
} from '../../../shared/ipc-types';

export const HudOverlayView: React.FC = () => {
  const [hudConfig, setHudConfig] = useState<HudConfig>({
    enabled: false,
    scale: 1.0,
    opacity: 0.9,
    crosshairSafeZonePx: 450,
    showRadarOverlay: true,
    showBombTimer: true,
    showLastSeen: true,
    showTacticalFeed: true,
    calibrationMode: false,
  });

  const [environmentMode, setEnvironmentMode] = useState<EnvironmentMode>('COMPETITIVE_PROTECTED');
  const [bombState, setBombState] = useState<BombState | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [observations, setObservations] = useState<TacticalObservation[]>([]);

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

    api.compliance.getState().then((st) => {
      if (st) setEnvironmentMode(st.environment);
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

    return () => {
      unsubConfig?.();
      unsubBomb?.();
      unsubObs?.();
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
  const latestObservation = observations.length > 0 ? observations[0] : null;

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
      {/* CALIBRATION MODE: SAFE-ZONE GUIDES OVERLAY                           */}
      {/* ==================================================================== */}
      {hudConfig.calibrationMode && (
        <div className="absolute inset-0 pointer-events-none">
          {/* 1. Crosshair Center Safe Zone (450x450px) */}
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
              CROSSHAIR SAFE ZONE ({chDim}x{chDim}px) — CLICK-THROUGH ACTIVE
            </span>
          </div>

          {/* 2. Top-Left Radar Safe Zone (320x320px) */}
          <div
            className="absolute top-0 left-0 border border-dashed border-tactical-cyan/60 bg-tactical-cyan/5 flex items-center justify-center pointer-events-none"
            style={{ width: '320px', height: '320px' }}
          >
            <span className="font-mono text-[10px] text-tactical-cyan bg-background/80 px-2 py-0.5 rounded">
              RADAR SAFE ZONE (320x320)
            </span>
          </div>

          {/* 3. Bottom Status HUD Safe Zone */}
          <div
            className="absolute bottom-0 left-0 w-full border-t border-dashed border-tactical-amber/60 bg-tactical-amber/5 flex items-center justify-center pointer-events-none"
            style={{ height: '140px' }}
          >
            <span className="font-mono text-[10px] text-tactical-amber bg-background/80 px-2 py-0.5 rounded">
              CS2 STATUS HUD (HEALTH / ARMOR / AMMO) — CLEAR
            </span>
          </div>

          {/* 4. Top-Right Killfeed Safe Zone */}
          <div
            className="absolute top-0 right-0 border border-dashed border-zinc-500/60 bg-zinc-500/5 flex items-center justify-center pointer-events-none"
            style={{ width: '400px', height: '200px' }}
          >
            <span className="font-mono text-[10px] text-zinc-400 bg-background/80 px-2 py-0.5 rounded">
              KILLFEED SAFE ZONE (400x200)
            </span>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* CRITICAL PRIORITY WIDGET: SYNCHRONIZED BOMB TIMER (Top-Center)      */}
      {/* Only shown when bomb is actually planted (or static in calibration)  */}
      {/* ==================================================================== */}
      {hudConfig.showBombTimer && (isBombActive || hudConfig.calibrationMode) && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
          <div className="rounded border border-border-subtle bg-background-panel/90 backdrop-blur-xs px-4 py-1.5 shadow-hud flex items-center gap-3 pointer-events-none">
            <span className="font-mono text-[10px] text-tactical-rose font-bold uppercase tracking-wider">
              {isBombActive ? 'BOMB PLANTED' : 'BOMB WIDGET (CALIBRATION)'}
            </span>
            <span
              className={`font-mono text-lg font-bold tabular-nums ${
                !isBombActive
                  ? 'text-tactical-emerald'
                  : remainingSeconds > 20
                  ? 'text-tactical-emerald'
                  : remainingSeconds > 10
                  ? 'text-tactical-amber'
                  : 'text-tactical-rose animate-pulse'
              }`}
            >
              00:{(isBombActive ? remainingSeconds : 40.0).toFixed(1).padStart(4, '0')}
            </span>
            <span className="font-mono text-[10px] text-tactical-emerald">
              {!isBombActive || remainingSeconds >= 5 ? 'KIT: FEASIBLE' : 'NO TIME'}
            </span>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* INFORMATIONAL: OPPONENT LAST-SEEN ANNOTATION (Safe Lateral Shelf)    */}
      {/* Only shown when an active observation exists (or in calibration)     */}
      {/* ==================================================================== */}
      {hudConfig.showLastSeen && (latestObservation || hudConfig.calibrationMode) && (
        <div className="absolute top-[340px] left-4 flex flex-col gap-1.5 pointer-events-none">
          <div className="rounded border border-border-subtle/80 bg-background-panel/80 backdrop-blur-xs p-2 text-xs font-mono shadow-subtle space-y-0.5 max-w-[260px] pointer-events-none">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-tactical-amber font-semibold">
                [{latestObservation ? latestObservation.confidence : 'CALIBRATION'}] LAST KNOWN
              </span>
              <span className="text-zinc-500">
                {latestObservation
                  ? `${Math.max(0, Math.round((Date.now() - latestObservation.timestamp) / 1000))}s ago`
                  : 'Preview'}
              </span>
            </div>
            <div className="text-zinc-200 text-[11px]">
              {latestObservation
                ? `${latestObservation.playerIdentity?.name || 'Opponent'} @ ${latestObservation.location?.callout || 'Unknown'}`
                : 'Lateral Safe Shelf (Y: 340px)'}
            </div>
            <div className="text-zinc-500 text-[9px]">
              Source: {latestObservation ? latestObservation.source : 'Safe-Zone Calibration Guide'}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* CONTEXTUAL: PRACTICE DRILL GUIDES (Only in PRACTICE_SERVER)          */}
      {/* Strictly suppressed in COMPETITIVE_PROTECTED                         */}
      {/* ==================================================================== */}
      {environmentMode === 'PRACTICE_SERVER' && (
        <div className="absolute bottom-[160px] left-1/2 -translate-x-1/2 rounded border border-tactical-cyan/60 bg-background-panel/90 px-4 py-2 font-mono text-xs text-tactical-cyan shadow-hud flex items-center gap-2 pointer-events-none">
          <span>PRACTICE MODE ACTIVE: Stand at T Roof wooden beam corner (±6 units)</span>
        </div>
      )}
    </div>
  );
};

export default HudOverlayView;
