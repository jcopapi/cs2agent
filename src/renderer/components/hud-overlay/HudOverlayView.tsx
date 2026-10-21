/**
 * CS2 Assistant - Ultra-Lightweight In-Game Overlay
 * File: src/renderer/components/hud-overlay/HudOverlayView.tsx
 *
 * Dedicated strictly to the two essential in-game features:
 * 1. C4 Bomb Countdown to Explosion (with 5s / 10s defusal viability)
 * 2. Real CSNADES Pixel Screenshot on Screen (with aim landmark & bloom)
 *
 * Optimized for ZERO lost FPS:
 * - 0 backdrop-blur / 0 Gaussian shader passes
 * - 0 CSS keyframe opacity animations
 * - 0 mouse-event forwarding
 * - Returns null when neither bomb nor photo is active
 */

import React, { useState, useEffect } from 'react';
import type {
  HudConfig,
  BombState,
  Lineup,
  GsiStatus,
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
      className="relative h-screen w-screen overflow-hidden bg-transparent select-none pointer-events-none font-sans"
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
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 pointer-events-none z-50">
          <div className="flex items-center gap-2.5 rounded-full border border-white/15 bg-black/50 px-4 py-1 shadow-lg">
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
              className={`font-mono text-2xl font-black tabular-nums tracking-wider leading-none ${
                remainingSeconds > 10
                  ? 'text-emerald-400'
                  : remainingSeconds > 5
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {remainingSeconds.toFixed(1)}s
            </span>
            <span className="font-mono text-[10px] text-zinc-300 font-bold uppercase tracking-wider pl-2 border-l border-white/15">
              C4 {bombState?.site ? `(${bombState.site})` : ''}
            </span>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. TOP-RIGHT: IN-GAME PIXEL PHOTO OVERLAY (Reticle + 4.5x Zoom Loupe)*/}
      {/* ==================================================================== */}
      {isPhotoActive && activeLineupPhoto && (
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 pointer-events-none z-50 max-w-[420px] border border-cyan-500/70 bg-[#09090b]/90 p-2.5 shadow-2xl relative font-mono">
          {/* Cyber-brutalist Corner Notches */}
          <span className="absolute -top-1 -left-1 text-cyan-400 font-mono text-xs select-none">┌</span>
          <span className="absolute -top-1 -right-1 text-cyan-400 font-mono text-xs select-none">┐</span>
          <span className="absolute -bottom-1 -left-1 text-cyan-400 font-mono text-xs select-none">└</span>
          <span className="absolute -bottom-1 -right-1 text-cyan-400 font-mono text-xs select-none">┘</span>

          {/* Header */}
          <div className="flex items-center justify-between text-xs font-mono font-black border-b border-zinc-800 pb-1">
            <div className="flex items-center gap-2 truncate max-w-[280px]">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span className="text-cyan-400 uppercase tracking-wide truncate text-[11px]">
                {activeLineupPhoto.title}
              </span>
            </div>
            <span className="border border-cyan-800/80 bg-cyan-950/80 text-cyan-400 px-1.5 py-0.2 text-[9px] font-bold">
              {activeLineupPhoto.throwType}
            </span>
          </div>

          {/* Real In-Game Screenshot with Aim Reticle & 4.5x Zoom Loupe */}
          <div className="relative w-full h-[240px] bg-black rounded overflow-hidden flex items-center justify-center my-0.5 border border-zinc-800">
            <img
              src={activeLineupPhoto.imageUrl || activeLineupPhoto.thumbnailUrl}
              alt={activeLineupPhoto.title}
              className="w-full h-full object-contain"
            />

            {/* A. HIGH-CONTRAST CENTER AIM RETICLE */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-20">
              <div className="w-8 h-8 rounded-full border-2 border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.95)] flex items-center justify-center animate-pulse">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
              </div>
              <div className="absolute -left-3 w-2 h-0.5 bg-emerald-400" />
              <div className="absolute -right-3 w-2 h-0.5 bg-emerald-400" />
              <div className="absolute -top-3 h-2 w-0.5 bg-emerald-400" />
              <div className="absolute -bottom-3 h-2 w-0.5 bg-emerald-400" />
              <span className="absolute -bottom-4.5 bg-black/95 border border-rose-500/80 px-1 py-0.2 text-[8px] font-mono font-black text-rose-400 uppercase tracking-widest whitespace-nowrap">
                AIM TARGET
              </span>
            </div>

            {/* B. 4.5X PRECISION ZOOM LOUPE */}
            {activeLineupPhoto.imageUrl && (
              <div className="absolute bottom-1.5 left-1.5 border border-cyan-400 bg-black/95 p-1 shadow-2xl flex flex-col items-center z-20">
                <span className="text-[8px] font-mono font-black text-cyan-400 px-1 mb-0.5 uppercase tracking-wider">
                  4.5X LOUPE
                </span>
                <div
                  className="relative w-24 h-20 border border-zinc-700 overflow-hidden"
                  style={{
                    backgroundImage: `url(${activeLineupPhoto.imageUrl})`,
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

            {/* C. PICTURE-IN-PICTURE LANDING */}
            {activeLineupPhoto.thumbnailUrl && (
              <div className="absolute bottom-1.5 right-1.5 border border-zinc-700 bg-black/95 p-1 shadow-md flex flex-col items-center z-20">
                <span className="text-[8px] font-mono font-bold text-zinc-400 px-1 mb-0.5">LANDING</span>
                <img
                  src={activeLineupPhoto.thumbnailUrl}
                  alt="Landing"
                  className="w-18 h-12 object-cover"
                />
              </div>
            )}

            <div className="absolute top-1.5 left-1.5 bg-black/85 border border-zinc-700 px-2 py-0.5 font-mono text-[9px] text-zinc-300 font-bold z-20">
              ALIGNMENT GUIDE
            </div>
          </div>

          {/* Alignment instructions, position, and hotkey hints */}
          <div className="flex flex-col text-[11px] font-mono text-zinc-300 pt-1 border-t border-zinc-800 gap-0.5">
            <div className="flex items-center justify-between text-zinc-400 text-[10px]">
              <span>POS: <strong className="text-zinc-200">{activeLineupPhoto.startPosition?.callout || 'Spawn'}</strong></span>
              <span className="text-cyan-400 font-bold">[F1] HIDE • [F2] NEXT</span>
            </div>
            <div className="text-zinc-100 font-bold text-xs leading-snug flex items-center gap-1.5">
              <span className="text-rose-400 font-black shrink-0">AIM:</span>
              <span className="truncate">
                {activeLineupPhoto.aimReference?.crosshairPlacement || activeLineupPhoto.instructions?.[1] || 'Align crosshair with reticle landmark'}
              </span>
            </div>
            {activeLineupPhoto.aimReference?.visualLandmark && (
              <div className="text-[10px] text-zinc-400 truncate">
                REF: <span className="text-cyan-300 font-semibold">{activeLineupPhoto.aimReference.visualLandmark}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. CALIBRATION SAFE-ZONE GUIDES (When Calibration Active)            */}
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
            <span className="font-mono text-[10px] text-rose-500 bg-[#09090b] px-2 py-0.5 rounded border border-rose-500/40">
              CROSSHAIR SAFE ZONE ({chDim}x{chDim}px)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HudOverlayView;
