/**
 * CS2 Assistant - Ultra-Lightweight In-Game Overlay
 * File: src/renderer/components/hud-overlay/HudOverlayView.tsx
 *
 * Dedicated strictly to the two essential in-game features:
 * 1. C4 Bomb Countdown to Explosion (with 5s / 10s defusal viability)
 * 2. Full-Screen Lineup Crosshair (two crossing lines, exactly like CS2 grenade pin hold)
 *    + Compact corner reference card showing where to stand & aim.
 *
 * Optimized for ZERO lost FPS:
 * - 0 backdrop-blur / 0 Gaussian shader passes
 * - 0 center-screen giant obstructions
 * - 0 mouse-event forwarding
 * - Returns null when neither bomb nor photo is active
 */

import React, { useState, useEffect } from 'react';
import type {
  HudConfig,
  BombState,
  Lineup,
} from '../../../shared/ipc-types';

export const HudOverlayView: React.FC = () => {
  const [hudConfig, setHudConfig] = useState<HudConfig>({
    enabled: true,
    scale: 1.0,
    opacity: 1.0,
    crosshairSafeZonePx: 450,
    showRadarOverlay: false,
    showBombTimer: true,
    showPixelPhoto: true,
    showLastSeen: false,
    showTacticalFeed: false,
    calibrationMode: false,
  });

  const [bombState, setBombState] = useState<BombState | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [activeLineupPhoto, setActiveLineupPhoto] = useState<Lineup | null>(null);

  // Ensure root surfaces remain 100% transparent
  useEffect(() => {
    document.documentElement.style.backgroundColor = 'transparent';
    document.body.style.backgroundColor = 'transparent';
  }, []);

  // Subscribe to real-time events
  useEffect(() => {
    const api = window.cs2Assistant;
    if (!api) return;

    api.hud.getConfig().then((cfg) => {
      if (cfg) setHudConfig(cfg);
    }).catch(() => {});

    api.hud.getActiveLineupPhoto?.().then((lineup) => {
      if (lineup) setActiveLineupPhoto(lineup);
    }).catch(() => {});

    api.tactical.getBombState().then((b) => {
      setBombState(b);
      if (b?.planted) {
        setRemainingSeconds(b.countdownSeconds);
      }
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

    const unsubPhoto = api.hud.onActiveLineupPhotoChange?.((lineup) => {
      setActiveLineupPhoto(lineup);
    });

    return () => {
      unsubConfig?.();
      unsubBomb?.();
      unsubPhoto?.();
    };
  }, []);

  // Smooth local tickdown only while bomb is planted
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

  // Global escape key to close lineup photo on screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeLineupPhoto) {
        window.cs2Assistant?.hud.setActiveLineupPhoto(null);
        setActiveLineupPhoto(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLineupPhoto]);

  if (!hudConfig.enabled) {
    return null;
  }

  const isBombActive = Boolean(hudConfig.showBombTimer !== false && bombState?.planted && remainingSeconds > 0);
  const isPhotoActive = Boolean(hudConfig.showPixelPhoto !== false && activeLineupPhoto);
  const chDim = hudConfig.crosshairSafeZonePx || 450;

  // Ultra-optimized: If nothing is active, render NOTHING!
  if (!isBombActive && !isPhotoActive && !hudConfig.calibrationMode) {
    return null;
  }

  return (
    <div
      data-testid="hud-overlay-container"
      className="relative h-screen w-screen overflow-hidden bg-transparent select-none pointer-events-none font-mono"
      style={{
        opacity: hudConfig.opacity,
        transform: `scale(${hudConfig.scale})`,
        transformOrigin: 'top left',
      }}
    >
      {/* ==================================================================== */}
      {/* 1. TOP-CENTER: C4 BOMB COUNTDOWN (Ultra-minimalist, low opacity)     */}
      {/* ==================================================================== */}
      {isBombActive && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none z-50">
          <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-black/50 px-4 py-1 shadow-lg">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                remainingSeconds > 10
                  ? 'bg-emerald-400'
                  : remainingSeconds > 5
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-rose-500 animate-ping'
              }`}
            />
            <span
              className={`text-2xl font-black tabular-nums tracking-wider leading-none ${
                remainingSeconds > 10
                  ? 'text-emerald-400'
                  : remainingSeconds > 5
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {remainingSeconds.toFixed(1)}s
            </span>
            <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider pl-2 border-l border-white/15">
              C4 {bombState?.site ? `[SITE ${bombState.site}]` : ''}
            </span>
            <span className="text-[9px] font-bold pl-1">
              {remainingSeconds >= 5 ? (
                <span className="text-emerald-400">KIT: OK</span>
              ) : (
                <span className="text-rose-400">KIT: NO TIME</span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. FULL-SCREEN LINEUP CROSSHAIR (Two Crossing Alignment Lines)       */}
      {/* Exactly like holding left-click with a grenade in CS2                */}
      {/* ==================================================================== */}
      {isPhotoActive && activeLineupPhoto && (
        <>
          {/* Horizontal Line Across Screen */}
          <div className="fixed top-1/2 left-0 w-screen h-[1.5px] bg-cyan-400/80 pointer-events-none z-30 shadow-[0_0_2px_rgba(0,0,0,0.9)]" />

          {/* Vertical Line Across Screen */}
          <div className="fixed left-1/2 top-0 h-screen w-[1.5px] bg-cyan-400/80 pointer-events-none z-30 shadow-[0_0_2px_rgba(0,0,0,0.9)]" />

          {/* High-Contrast Intersection Crosshair Reticle at Exact Center */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border border-cyan-300/90 flex items-center justify-center shadow-[0_0_4px_rgba(6,182,212,0.8)]">
              <div className="w-1 h-1 bg-rose-500 rounded-full" />
            </div>
          </div>

          {/* ================================================================== */}
          {/* 3. COMPACT CORNER REFERENCE CARD (Top-Right Docked, Leaves Center)  */}
          {/* ================================================================== */}
          <div className="absolute top-4 right-4 flex flex-col gap-1.5 pointer-events-none z-50 w-72 border border-zinc-800 bg-[#09090b]/90 p-2.5 shadow-2xl relative">
            {/* Cyber-brutalist Corner Notches */}
            <span className="absolute -top-1 -left-1 text-cyan-400 text-xs select-none">┌</span>
            <span className="absolute -top-1 -right-1 text-cyan-400 text-xs select-none">┐</span>
            <span className="absolute -bottom-1 -left-1 text-cyan-400 text-xs select-none">└</span>
            <span className="absolute -bottom-1 -right-1 text-cyan-400 text-xs select-none">┘</span>

            {/* Title & Utility Type */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1 text-xs font-bold">
              <div className="flex items-center gap-1.5 truncate">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                <span className="text-zinc-100 uppercase tracking-wide truncate text-[11px]">
                  {activeLineupPhoto.title}
                </span>
              </div>
              <span className="border border-cyan-800 bg-cyan-950 text-cyan-400 px-1.5 py-0.2 text-[9px] font-bold">
                {activeLineupPhoto.throwType}
              </span>
            </div>

            {/* Reference Screenshot showing Landmark Alignment */}
            <div className="relative w-full h-36 bg-black rounded border border-zinc-800 overflow-hidden flex items-center justify-center">
              <img
                src={activeLineupPhoto.imageUrl || activeLineupPhoto.thumbnailUrl}
                alt={activeLineupPhoto.title}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-1 left-1 bg-black/85 border border-zinc-700 px-1.5 py-0.2 text-[8px] text-zinc-300 font-bold">
                ALIGNMENT REFERENCE
              </div>
            </div>

            {/* Where to Stand & Where to Aim */}
            <div className="space-y-1 text-[11px] pt-1 border-t border-zinc-800 text-zinc-300">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-bold">STAND:</span>
                <span className="text-zinc-100 font-semibold truncate">
                  {activeLineupPhoto.startPosition?.callout || 'Position'}
                </span>
              </div>

              <div className="flex items-start justify-between gap-1">
                <span className="text-zinc-500 font-bold shrink-0">AIM:</span>
                <span className="text-cyan-300 text-[10px] text-right truncate">
                  {activeLineupPhoto.aimReference?.crosshairPlacement ||
                    activeLineupPhoto.instructions?.[1] ||
                    'Align crossing lines at landmark'}
                </span>
              </div>
            </div>

            {/* Hotkey Helpers */}
            <div className="flex items-center justify-between pt-1 border-t border-zinc-900 text-[10px] text-zinc-500">
              <span>[HOTKEY] TOGGLE</span>
              <span className="text-cyan-400 font-bold">[F2] NEXT PIXEL</span>
            </div>
          </div>
        </>
      )}

      {/* ==================================================================== */}
      {/* 4. CALIBRATION SAFE-ZONE GUIDES                                      */}
      {/* ==================================================================== */}
      {hudConfig.calibrationMode && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute border border-dashed border-rose-500/60 bg-rose-500/5 flex items-center justify-center pointer-events-none"
            style={{
              width: `${chDim}px`,
              height: `${chDim}px`,
              left: `calc(50% - ${chDim / 2}px)`,
              top: `calc(50% - ${chDim / 2}px)`,
            }}
          >
            <span className="text-[10px] text-rose-500 bg-[#09090b] px-2 py-0.5 rounded border border-rose-500/40">
              CROSSHAIR SAFE ZONE ({chDim}x{chDim}px)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HudOverlayView;
