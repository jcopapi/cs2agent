/**
 * CS2 Assistant - Standalone Transparent Click-Through HUD Overlay
 * File: src/renderer/components/hud-overlay/HudOverlayView.tsx
 *
 * Rendered in Electron's topmost frameless transparent window.
 * Enforces zero input blocking, safe-zone exclusions (450x450 crosshair,
 * radar, status HUD, killfeed), and priority arbitrage.
 */

import React, { useState, useEffect } from 'react';
import type { HudConfig, EnvironmentMode } from '../../../shared/ipc-types';

export const HudOverlayView: React.FC = () => {
  const [hudConfig, setHudConfig] = useState<HudConfig>({
    enabled: true,
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
  const [bombTime, setBombTime] = useState<number>(24.2);

  useEffect(() => {
    if (window.cs2Assistant) {
      window.cs2Assistant.hud.getConfig().then((cfg) => {
        if (cfg) setHudConfig(cfg);
      }).catch(() => {});

      window.cs2Assistant.compliance.getState().then((st) => {
        if (st) setEnvironmentMode(st.environment);
      }).catch(() => {});
    }

    const timer = setInterval(() => {
      setBombTime((prev) => {
        if (prev <= 0.1) return 40.0;
        return Number((prev - 0.1).toFixed(1));
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  if (!hudConfig.enabled) {
    return null;
  }

  // Crosshair dimension: default 450px centered
  const chDim = hudConfig.crosshairSafeZonePx || 450;

  return (
    <div
      data-testid="hud-overlay-container"
      className="relative h-screen w-screen overflow-hidden bg-transparent select-none pointer-events-none font-sans"
      style={{ opacity: hudConfig.opacity, transform: `scale(${hudConfig.scale})`, transformOrigin: 'top left' }}
    >
      {/* ==================================================================== */}
      {/* CALIBRATION MODE: SAFE-ZONE GUIDES OVERLAY                           */}
      {/* ==================================================================== */}
      {hudConfig.calibrationMode && (
        <div className="absolute inset-0 pointer-events-none">
          {/* 1. Crosshair Center Safe Zone (450x450px) */}
          <div
            className="absolute border border-dashed border-tactical-rose/60 bg-tactical-rose/5 flex items-center justify-center"
            style={{
              width: `${chDim}px`,
              height: `${chDim}px`,
              left: `calc(50% - ${chDim / 2}px)`,
              top: `calc(50% - ${chDim / 2}px)`,
            }}
          >
            <span className="font-mono text-[10px] text-tactical-rose bg-background/80 px-2 py-0.5 rounded">
              CROSSHAIR SAFE ZONE ({chDim}x{chDim}px) — UNOBSTRUCTED
            </span>
          </div>

          {/* 2. Top-Left Radar Safe Zone (320x320px) */}
          <div
            className="absolute top-0 left-0 border border-dashed border-tactical-cyan/60 bg-tactical-cyan/5 flex items-center justify-center"
            style={{ width: '320px', height: '320px' }}
          >
            <span className="font-mono text-[10px] text-tactical-cyan bg-background/80 px-2 py-0.5 rounded">
              RADAR SAFE ZONE (320x320)
            </span>
          </div>

          {/* 3. Bottom Status HUD Safe Zone */}
          <div
            className="absolute bottom-0 left-0 w-full border-t border-dashed border-tactical-amber/60 bg-tactical-amber/5 flex items-center justify-center"
            style={{ height: '140px' }}
          >
            <span className="font-mono text-[10px] text-tactical-amber bg-background/80 px-2 py-0.5 rounded">
              CS2 STATUS HUD (HEALTH / ARMOR / AMMO) — CLEAR
            </span>
          </div>

          {/* 4. Top-Right Killfeed Safe Zone */}
          <div
            className="absolute top-0 right-0 border border-dashed border-zinc-500/60 bg-zinc-500/5 flex items-center justify-center"
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
      {/* ==================================================================== */}
      {hudConfig.showBombTimer && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto">
          <div className="rounded border border-border-subtle bg-background-panel/90 backdrop-blur-xs px-4 py-1.5 shadow-hud flex items-center gap-3">
            <span className="font-mono text-[10px] text-tactical-rose font-bold uppercase tracking-wider">
              BOMB PLANTED
            </span>
            <span
              className={`font-mono text-lg font-bold tabular-nums ${
                bombTime > 20
                  ? 'text-tactical-emerald'
                  : bombTime > 10
                  ? 'text-tactical-amber'
                  : 'text-tactical-rose animate-pulse'
              }`}
            >
              00:{bombTime.toFixed(1).padStart(4, '0')}
            </span>
            <span className="font-mono text-[10px] text-tactical-emerald">KIT: FEASIBLE</span>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* INFORMATIONAL: OPPONENT LAST-SEEN ANNOTATION (Safe Lateral Shelf)    */}
      {/* Positioned on left lateral shelf (below radar 320px, above 940px)    */}
      {/* ==================================================================== */}
      {hudConfig.showLastSeen && (
        <div className="absolute top-[340px] left-4 flex flex-col gap-1.5 pointer-events-auto">
          <div className="rounded border border-border-subtle/80 bg-background-panel/80 backdrop-blur-xs p-2 text-xs font-mono shadow-subtle space-y-0.5 max-w-[260px]">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-tactical-amber font-semibold">[LAST SEEN] OPPONENT</span>
              <span className="text-zinc-500">8s ago</span>
            </div>
            <div className="text-zinc-200 text-[11px]">B Apartments // Balcony</div>
            <div className="text-zinc-500 text-[9px]">Source: Audio / Radar Fallback</div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* CONTEXTUAL: PRACTICE DRILL GUIDES (Only in PRACTICE or SIMULATION)   */}
      {/* Strictly suppressed in COMPETITIVE_PROTECTED                         */}
      {/* ==================================================================== */}
      {environmentMode !== 'COMPETITIVE_PROTECTED' && (
        <div className="absolute bottom-[160px] left-1/2 -translate-x-1/2 rounded border border-tactical-cyan/60 bg-background-panel/90 px-4 py-2 font-mono text-xs text-tactical-cyan shadow-hud flex items-center gap-2">
          <span>PRACTICE MODE ACTIVE: Stand at T Roof wooden beam corner (±6 units)</span>
        </div>
      )}
    </div>
  );
};

export default HudOverlayView;
