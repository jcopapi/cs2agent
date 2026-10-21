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
      {/* 1. TOP-CENTER: C4 BOMB COUNTDOWN (Appears ONLY when planted)         */}
      {/* ==================================================================== */}
      {isBombActive && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-50">
          <div className="rounded-lg border-2 border-rose-500 bg-[#09090b] px-6 py-2.5 shadow-2xl flex items-center gap-5 pointer-events-none">
            <div className="flex flex-col">
              <span className="font-mono text-[11px] text-rose-500 font-black uppercase tracking-widest leading-tight">
                C4 EXPLOSÃO {bombState?.site ? `// SITE ${bombState.site}` : ''}
              </span>
              <span
                className={`font-mono text-3xl font-black tabular-nums leading-none mt-0.5 ${
                  remainingSeconds > 20
                    ? 'text-emerald-400'
                    : remainingSeconds > 10
                    ? 'text-amber-400'
                    : 'text-rose-500'
                }`}
              >
                00:{remainingSeconds.toFixed(1).padStart(4, '0')}
              </span>
            </div>

            <div className="flex flex-col text-[11px] font-mono font-bold leading-snug border-l border-zinc-800 pl-4">
              <span className={remainingSeconds >= 5 ? 'text-emerald-400' : 'text-rose-500'}>
                KIT (5s): {remainingSeconds >= 5 ? '✓ TEMPO DE SOBRA' : '✕ SEM TEMPO'}
              </span>
              <span className={remainingSeconds >= 10 ? 'text-emerald-400' : 'text-rose-500'}>
                SEM KIT (10s): {remainingSeconds >= 10 ? '✓ TEMPO DE SOBRA' : '✕ GUARDE A ARMA'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. TOP-RIGHT: FOTO DO PIXEL NA TELA (Real CS2 Screenshot)            */}
      {/* ==================================================================== */}
      {isPhotoActive && activeLineupPhoto && (
        <div className="absolute top-4 right-4 flex flex-col gap-1.5 pointer-events-none z-50 max-w-[440px] rounded-lg border-2 border-cyan-500 bg-[#09090b] p-2.5 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between text-xs font-mono font-black border-b border-zinc-800 pb-1.5">
            <div className="flex items-center gap-2 truncate max-w-[320px]">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span className="text-cyan-400 uppercase tracking-wide truncate">
                {activeLineupPhoto.title}
              </span>
            </div>
            <span className="rounded bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 text-[10px] font-bold">
              {activeLineupPhoto.throwType}
            </span>
          </div>

          {/* Real CSNADES In-Game Photo */}
          <div className="relative w-full h-[250px] bg-black rounded overflow-hidden flex items-center justify-center my-0.5">
            <img
              src={activeLineupPhoto.imageUrl || activeLineupPhoto.thumbnailUrl}
              alt={activeLineupPhoto.title}
              className="w-full h-full object-contain rounded"
            />
            {/* Picture-in-picture Landing Bloom Result */}
            {activeLineupPhoto.thumbnailUrl && (
              <div className="absolute bottom-1.5 right-1.5 rounded border border-cyan-500 bg-[#09090b] p-0.5 shadow-md flex flex-col items-center">
                <span className="text-[8px] font-mono font-bold text-cyan-400 px-1">BLOOM</span>
                <img
                  src={activeLineupPhoto.thumbnailUrl}
                  alt="Bloom"
                  className="w-20 h-13 object-cover rounded"
                />
              </div>
            )}
            <div className="absolute top-1.5 left-1.5 bg-[#09090b]/90 border border-zinc-700 px-2 py-0.5 rounded font-mono text-[9px] text-zinc-300 font-bold">
              PIXEL CS2 OFICIAL
            </div>
          </div>

          {/* Alignment instruction & position */}
          <div className="flex flex-col text-[11px] font-mono text-zinc-300 pt-1 border-t border-zinc-800 gap-0.5">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Posição: <strong className="text-zinc-200">{activeLineupPhoto.startPosition?.callout || 'Spawn'}</strong></span>
              <span className="text-cyan-400 font-bold text-[10px]">[ESC] FECHAR</span>
            </div>
            <div className="text-zinc-300 font-semibold truncate">
              {activeLineupPhoto.aimReference?.crosshairPlacement || activeLineupPhoto.instructions?.[1] || 'Alinhe a mira no pixel indicado'}
            </div>
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
