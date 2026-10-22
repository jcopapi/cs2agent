/**
 * CS2 Assistant - Ultra-Lightweight In-Game Overlay
 * File: src/renderer/components/hud-overlay/HudOverlayView.tsx
 *
 * Dedicated strictly to:
 * 1. C4 Bomb Countdown (minimalist, lower down, only timer & [A]/[B], no 'KIT')
 * 2. "Align with Crosshair" mode (centered screenshot at low opacity with throw text on top)
 * 3. Compact Corner Reference Card (single clean photo showing landmark, configurable position)
 * 4. Low-opacity Key Hint badge in corner when overlay is closed
 *
 * 100% Native CS2 FPS - Zero mouse event blocking, zero shader passes.
 */

import React, { useState, useEffect } from 'react';
import type {
  HudConfig,
  BombState,
  Lineup,
  HotkeyConfig,
  ScreenCorner,
} from '../../../shared/ipc-types';
import { getActivePlay } from '../../../core/utility/play-database';
import { getLineupById } from '../../../core/utility/lineup-database';
import { C4AudioPitchDetector } from '../../../core/bomb-timer/c4-audio-pitch-detector';

function getCornerClass(corner?: ScreenCorner, defaultCorner: ScreenCorner = 'TOP_RIGHT'): string {
  const c = corner || defaultCorner;
  switch (c) {
    case 'TOP_LEFT':
      return 'top-4 left-4';
    case 'BOTTOM_RIGHT':
      return 'bottom-4 right-4';
    case 'BOTTOM_LEFT':
      return 'bottom-4 left-4';
    case 'TOP_RIGHT':
    default:
      return 'top-4 right-4';
  }
}

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

  const [hotkeyConfig, setHotkeyConfig] = useState<HotkeyConfig>({
    alignKey: 'CapsLock',
    alignMode: 'HOLD',
    alignOpacity: 0.5,
    overlayKey: 'F1',
    overlayMode: 'TOGGLE',
    nextPixelKey: 'F2',
    cornerCardPosition: 'TOP_RIGHT',
    indicatorPosition: 'TOP_RIGHT',
    bombLatencyOffsetSec: 2.0,
  });

  const [bombState, setBombState] = useState<BombState | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [activeLineupPhoto, setActiveLineupPhoto] = useState<Lineup | null>(null);
  const [isAlignActive, setIsAlignActive] = useState<boolean>(false);
  const [isMatchActive, setIsMatchActive] = useState<boolean>(false);
  const [planStep, setPlanStep] = useState<{ stepIndex: number; totalSteps: number; planName?: string } | null>(null);
  const [audioResolvedSite, setAudioResolvedSite] = useState<'A' | 'B' | null>(null);

  // Audio Beep Acoustic Pitch Listener (Detects A vs B from first C4 beep)
  useEffect(() => {
    if (bombState?.planted && !bombState.site && !audioResolvedSite) {
      const cancelAudio = C4AudioPitchDetector.listenAndIdentifySite((res) => {
        setAudioResolvedSite(res.site);
      }, 2500);
      return cancelAudio;
    } else if (!bombState?.planted && audioResolvedSite) {
      setAudioResolvedSite(null);
    }
  }, [bombState?.planted, bombState?.site, audioResolvedSite]);

  // Transparent root canvas
  useEffect(() => {
    document.documentElement.style.backgroundColor = 'transparent';
    document.body.style.backgroundColor = 'transparent';
  }, []);

  // Subscriptions & Initial State
  useEffect(() => {
    const api = window.cs2Assistant;
    if (!api) return;

    api.hud.getConfig().then((cfg) => {
      if (cfg) setHudConfig(cfg);
    }).catch(() => {});

    api.hud.getHotkeyConfig?.().then((cfg) => {
      if (cfg) setHotkeyConfig((prev) => ({ ...prev, ...cfg }));
    }).catch(() => {});

    api.hud.getPlanStep?.().then((step) => {
      if (step && step.totalSteps > 0) setPlanStep(step);
    }).catch(() => {});

    api.hud.getActiveLineupPhoto?.().then((lineup) => {
      if (lineup) {
        setActiveLineupPhoto(lineup);
      } else {
        // Fallback: load first pixel from active tactical plan
        const plan = getActivePlay();
        if (plan?.lineupIds && plan.lineupIds.length > 0) {
          const first = getLineupById(plan.lineupIds[0]);
          if (first) setActiveLineupPhoto(first);
          setPlanStep({ stepIndex: 0, totalSteps: plan.lineupIds.length, planName: plan.name });
        }
      }
    }).catch(() => {});

    api.hud.getAlignState?.().then((active) => {
      setIsAlignActive(Boolean(active));
    }).catch(() => {});

    api.gsi.getStatus().then((status) => {
      setIsMatchActive(Boolean(status?.activeMatch));
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

    const unsubHotkey = api.hud.onHotkeyConfigChange?.((cfg) => {
      setHotkeyConfig((prev) => ({ ...prev, ...cfg }));
    });

    const unsubStep = api.hud.onPlanStepChange?.((step) => {
      if (step && step.totalSteps > 0) setPlanStep(step);
    });

    const unsubPlay = api.play?.onNextPixel?.((data) => {
      if (data?.totalSteps) setPlanStep(data);
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

    const unsubAlign = api.hud.onAlignStateChange?.((active) => {
      setIsAlignActive(Boolean(active));
    });

    const unsubGsi = api.gsi.onStatusChange((status) => {
      setIsMatchActive(Boolean(status?.activeMatch));
    });

    return () => {
      unsubConfig?.();
      unsubHotkey?.();
      unsubStep?.();
      unsubPlay?.();
      unsubBomb?.();
      unsubPhoto?.();
      unsubAlign?.();
      unsubGsi?.();
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
  const currentLineup = activeLineupPhoto || (() => {
    const plan = getActivePlay();
    return plan?.lineupIds?.length ? getLineupById(plan.lineupIds[0]) : null;
  })();

  const cornerPosClass = getCornerClass(hotkeyConfig.cornerCardPosition, 'TOP_RIGHT');
  const indicatorPosClass = getCornerClass(hotkeyConfig.indicatorPosition, 'TOP_RIGHT');

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
      {/* 1. C4 BOMB COUNTDOWN (Lower down, strictly timer & site [A]/[B])     */}
      {/* ==================================================================== */}
      {isBombActive && !isAlignActive && (
        <div className="absolute top-9 left-1/2 -translate-x-1/2 pointer-events-none z-50">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3.5 py-1 shadow-lg">
            <span
              className={`h-2 w-2 rounded-full ${
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
            {bombState?.site || audioResolvedSite ? (
              <span className="text-xs font-bold text-zinc-300 uppercase pl-1.5 border-l border-white/15">
                [{bombState?.site || audioResolvedSite}]
              </span>
            ) : (
              <span className="text-xs font-bold text-zinc-500 uppercase pl-1.5 border-l border-white/15">
                [?]
              </span>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. "ALIGN WITH CROSSHAIR" MODE (Hold Key: Centered Transparent Pixel) */}
      {/* Shows ONLY the lineup image centered on screen with throw note on top */}
      {/* ==================================================================== */}
      {isAlignActive && currentLineup && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50 overflow-hidden">
          {/* Centered Lineup Image */}
          {(currentLineup.imageUrl || currentLineup.thumbnailUrl) && (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={currentLineup.imageUrl || currentLineup.thumbnailUrl}
                alt=""
                className="w-full h-full object-contain pointer-events-none"
                style={{ opacity: hotkeyConfig.alignOpacity ?? 0.5 }}
              />
              {/* Crossed lines on the centered image cleanly intersecting */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(34, 211, 238, 0.8)" strokeWidth="1.2" />
                <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(34, 211, 238, 0.8)" strokeWidth="1.2" />
              </svg>
            </div>
          )}

          {/* Simple Lightweight Throw & Utility Instruction at Top */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 pointer-events-none z-50">
            <div className="flex items-center gap-2 border border-white/10 bg-black/70 px-4 py-1 text-xs font-bold text-cyan-300 tracking-wider shadow-lg">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span className="text-white font-black">[{currentLineup.utilityType === 'FLASHBANG' ? 'FLASH' : currentLineup.utilityType}]</span>
              <span>[{currentLineup.throwType}]</span>
              {currentLineup.movementRequirements && (
                <span className="text-zinc-400 font-normal">
                  • {currentLineup.movementRequirements}
                </span>
              )}
            </div>
          </div>

          {/* Docked Stand Thumbnail at Bottom of Screen in Align Mode */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-50">
            <div className="flex items-center gap-2 border border-zinc-700 bg-black/85 px-3 py-1 rounded shadow-xl">
              <div className="w-16 h-11 bg-black rounded border border-zinc-600 shrink-0 overflow-hidden">
                <img
                  src={currentLineup.standImageUrl || currentLineup.thumbnailUrl || currentLineup.imageUrl}
                  alt="Stand"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wide">ONDE FICAR:</span>
                <span className="text-[10px] font-bold text-zinc-100">{currentLineup.startPosition?.callout || 'Stand'}</span>
                <span className="text-[8px] text-cyan-300">{currentLineup.movementRequirements}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. CORNER REFERENCE CARD (When Overlay is Open & NOT Aligning)       */}
      {/* Shows ONLY the pixel name, step indicator, utility type, and image   */}
      {/* with crossing lines. Zero clutter, zero text descriptions.           */}
      {/* ==================================================================== */}
      {!isAlignActive && isPhotoActive && currentLineup && (
        <div className={`absolute ${cornerPosClass} flex flex-col gap-1.5 pointer-events-none z-50 w-72 border border-zinc-800 bg-[#09090b]/90 p-2 shadow-2xl`}>
          {/* Cyber-brutalist Corner Notches */}
          <span className="absolute -top-1 -left-1 text-cyan-400 text-xs select-none">┌</span>
          <span className="absolute -top-1 -right-1 text-cyan-400 text-xs select-none">┐</span>
          <span className="absolute -bottom-1 -left-1 text-cyan-400 text-xs select-none">└</span>
          <span className="absolute -bottom-1 -right-1 text-cyan-400 text-xs select-none">┘</span>

          {/* Title & Plan Step Indicator & Utility Type Badge */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1 text-xs font-bold gap-2">
            <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shrink-0" />
              {planStep && planStep.totalSteps > 0 && (
                <span className="text-cyan-400 font-black text-[11px] tracking-wider shrink-0">
                  [{planStep.stepIndex + 1}/{planStep.totalSteps}]
                </span>
              )}
              <span className="text-zinc-100 uppercase tracking-wide truncate text-[11px]">
                {currentLineup.title}
              </span>
            </div>

            <span
              className={`px-1.5 py-0.2 text-[8px] font-black tracking-wider uppercase shrink-0 border ${
                currentLineup.utilityType === 'SMOKE'
                  ? 'border-cyan-800 bg-cyan-950/80 text-cyan-300'
                  : currentLineup.utilityType === 'FLASHBANG'
                  ? 'border-amber-800 bg-amber-950/80 text-amber-300'
                  : currentLineup.utilityType === 'MOLOTOV' || currentLineup.utilityType === 'MOLOTOV_INCENDIARY'
                  ? 'border-orange-800 bg-orange-950/80 text-orange-400'
                  : 'border-rose-800 bg-rose-950/80 text-rose-300'
              }`}
            >
              {currentLineup.utilityType === 'FLASHBANG'
                ? 'FLASH'
                : currentLineup.utilityType === 'MOLOTOV_INCENDIARY'
                ? 'MOLY'
                : currentLineup.utilityType}
            </span>
          </div>

          {/* Reference Screenshot: photo with crossing lines ON THE IMAGE showing aim point */}
          <div className="relative w-full h-40 bg-black rounded border border-zinc-800 overflow-hidden flex items-center justify-center">
            {currentLineup.imageUrl || currentLineup.thumbnailUrl ? (
              <>
                <img
                  src={currentLineup.imageUrl || currentLineup.thumbnailUrl}
                  alt={currentLineup.title}
                  className="w-full h-full object-contain"
                />
                {/* Crossed lines on the screenshot intersecting across the entire image */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(34, 211, 238, 0.85)" strokeWidth="1.2" />
                  <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(34, 211, 238, 0.85)" strokeWidth="1.2" />
                </svg>
              </>
            ) : (
              <span className="text-zinc-600 text-xs">NO SCREENSHOT</span>
            )}
          </div>

          {/* Stand / Positioning Photo directly below the main overlay in smaller scale */}
          <div className="flex items-center gap-2 border border-zinc-800/80 bg-black/85 p-1.5 rounded">
            <div className="relative w-20 h-14 bg-black rounded border border-zinc-700/80 shrink-0 overflow-hidden flex items-center justify-center">
              <img
                src={currentLineup.standImageUrl || currentLineup.thumbnailUrl || currentLineup.imageUrl}
                alt="Stand Position"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 left-0 right-0 bg-black/85 text-[7px] text-cyan-300 font-bold text-center leading-none py-0.5">
                STAND
              </span>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">
                POSIÇÃO / ENCAIXE:
              </span>
              <span className="text-[10px] font-bold text-zinc-100 truncate">
                {currentLineup.startPosition?.callout || 'Position'}
              </span>
              <span className="text-[8px] text-cyan-400/90 truncate">
                {currentLineup.movementRequirements || currentLineup.throwType}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. PERSISTENT KEY PROMPT BADGE (Low-opacity hint when overlay is off) */}
      {/* Only states what button opens the overlay                             */}
      {/* ==================================================================== */}
      {!isAlignActive && !isPhotoActive && isMatchActive && (
        <div className={`absolute ${indicatorPosClass} pointer-events-none z-40`}>
          <div className="flex items-center gap-2 border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] font-bold text-zinc-400 opacity-40 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span>[{hotkeyConfig.overlayKey}] OVERLAY</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HudOverlayView;
