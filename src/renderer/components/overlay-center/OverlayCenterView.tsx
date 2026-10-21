/**
 * CS2 Assistant - Ultra-Lightweight In-Match Overlay Center
 * File: src/renderer/components/overlay-center/OverlayCenterView.tsx
 *
 * Dedicated in-match cockpit for selecting active tactical plans and pinning pixels.
 * Uses 0 heavy assets and 0 background AI requests to ensure zero FPS impact.
 */

import React, { useState, useEffect } from 'react';
import type { GsiStatus, Lineup, Play } from '../../../shared/ipc-types';
import {
  getAllPlays,
  getActivePlay,
  setActivePlayId,
  getActivePlayStepIndex,
  setActivePlayStepIndex,
} from '../../../core/utility/play-database';
import { getLineupById } from '../../../core/utility/lineup-database';

interface OverlayCenterViewProps {
  onOpenSettings: () => void;
}

export const OverlayCenterView: React.FC<OverlayCenterViewProps> = ({ onOpenSettings }) => {
  const [matchStatus, setMatchStatus] = useState<GsiStatus | null>(null);
  const [plays, setPlays] = useState<Play[]>([]);
  const [activePlan, setActivePlan] = useState<Play | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [pinnedLineup, setPinnedLineup] = useState<Lineup | null>(null);

  // Load plans and active step
  const refreshData = () => {
    const all = getAllPlays();
    setPlays(all);
    const curr = getActivePlay();
    setActivePlan(curr);
    setActiveStepIndex(getActivePlayStepIndex());
  };

  useEffect(() => {
    refreshData();

    const api = window.cs2Assistant;
    if (!api) return;

    api.gsi.getStatus().then((status) => {
      setMatchStatus(status);
    }).catch(() => {});

    api.hud.getActiveLineupPhoto?.().then((lineup) => {
      setPinnedLineup(lineup);
    }).catch(() => {});

    const unsubGsi = api.gsi.onStatusChange((status) => {
      setMatchStatus(status);
    });

    const unsubPhoto = api.hud.onActiveLineupPhotoChange?.((lineup) => {
      setPinnedLineup(lineup);
    });

    const unsubPlay = api.play?.onNextPixel?.((data) => {
      if (data && typeof data.stepIndex === 'number') {
        setActiveStepIndex(data.stepIndex);
      }
      refreshData();
    });

    const unsubStep = api.hud?.onPlanStepChange?.((step) => {
      if (step && typeof step.stepIndex === 'number') {
        setActiveStepIndex(step.stepIndex);
      }
      refreshData();
    });

    return () => {
      unsubGsi?.();
      unsubPhoto?.();
      unsubPlay?.();
      unsubStep?.();
    };
  }, []);

  const handleSelectPlan = (planId: string) => {
    setActivePlayId(planId);
    const updated = getAllPlays().find((p) => p.id === planId) || null;
    setActivePlan(updated);
    setActiveStepIndex(0);
    window.cs2Assistant?.play?.setActivePlan?.(updated, 0);

    // Auto-pin the first pixel of the newly chosen plan
    if (updated?.lineupIds && updated.lineupIds.length > 0) {
      const firstLineup = getLineupById(updated.lineupIds[0]);
      if (firstLineup) {
        window.cs2Assistant?.hud.setActiveLineupPhoto(firstLineup);
        setPinnedLineup(firstLineup);
      }
    }
  };

  const handlePinPixel = (lineupId: string, idx: number) => {
    setActivePlayStepIndex(idx);
    setActiveStepIndex(idx);
    window.cs2Assistant?.play?.setActivePlan?.(activePlan, idx);
    const lineup = getLineupById(lineupId);
    if (lineup) {
      window.cs2Assistant?.hud.setActiveLineupPhoto(lineup);
      setPinnedLineup(lineup);
    }
  };

  const handleUnpin = () => {
    window.cs2Assistant?.hud.setActiveLineupPhoto(null);
    setPinnedLineup(null);
  };

  const currentMap = matchStatus?.map ? matchStatus.map.replace('de_', '').toUpperCase() : 'MATCH';
  const ctScore = matchStatus?.ctScore ?? 0;
  const tScore = matchStatus?.tScore ?? 0;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#09090b] text-[#f4f4f5] font-mono select-none overflow-hidden p-4">
      {/* Top Bar: Minimal Map Indicator & Settings Icon */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-black tracking-widest text-zinc-100 uppercase">
            [{currentMap}]
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            title="Settings"
            className="p-1.5 text-zinc-400 hover:text-cyan-300 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 overflow-hidden">
        {/* Left: Active Plans Quick Switcher */}
        <div className="flex flex-col border border-zinc-800 bg-[#0c0c0e] p-3 overflow-hidden">
          <div className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase mb-2">
            // TACTICAL PLANS
          </div>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {plays.map((p) => {
              const isActive = p.id === activePlan?.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPlan(p.id)}
                  className={`w-full text-left p-2.5 text-xs border transition-colors flex flex-col gap-1 ${
                    isActive
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200'
                      : 'border-zinc-800 bg-black/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold truncate">{p.name}</span>
                    <span className="text-[10px] font-bold text-zinc-400 tabular-nums">
                      {p.lineupIds?.length || 0}
                    </span>
                  </div>
                  {isActive && (
                    <span className="text-[8px] font-black text-cyan-400 tracking-widest uppercase">
                      ● ACTIVE IN-GAME
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Pixels in Selected Plan */}
        <div className="md:col-span-2 flex flex-col border border-zinc-800 bg-[#0c0c0e] p-3 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase truncate">
              // PLAN PIXELS: {activePlan?.name || 'NONE'}
            </div>
            {pinnedLineup && (
              <button
                onClick={handleUnpin}
                className="text-[9px] border border-rose-900 bg-rose-950/50 text-rose-300 px-2 py-0.5 hover:bg-rose-900 transition-colors"
              >
                UNPIN ALL
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {activePlan?.lineupIds?.map((lineupId, idx) => {
              const lineup = getLineupById(lineupId);
              if (!lineup) return null;
              const isPinned = pinnedLineup?.id === lineup.id;
              const isCurrentStep = idx === activeStepIndex;

              return (
                <div
                  key={`${lineupId}-${idx}`}
                  onClick={() => handlePinPixel(lineupId, idx)}
                  className={`cursor-pointer p-2.5 border transition-all flex items-center justify-between gap-3 ${
                    isPinned
                      ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                      : 'border-zinc-800 bg-black/50 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="text-xs font-bold text-zinc-500 tabular-nums">
                      # {String(idx + 1).padStart(2, '0')}.
                    </span>

                    {/* Miniature thumbnail */}
                    <div className="w-12 h-8 bg-zinc-900 border border-zinc-800 rounded shrink-0 overflow-hidden flex items-center justify-center">
                      {lineup.imageUrl || lineup.thumbnailUrl ? (
                        <img
                          src={lineup.imageUrl || lineup.thumbnailUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[8px] text-zinc-600">NO IMG</span>
                      )}
                    </div>

                    <div className="flex flex-col truncate">
                      <span className={`text-xs font-bold truncate ${isPinned ? 'text-cyan-300' : 'text-zinc-200'}`}>
                        {lineup.title}
                      </span>
                      <span className="text-[10px] text-zinc-500 truncate">
                        {lineup.throwType} • {lineup.startPosition?.callout || 'Spot'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isPinned ? (
                      <span className="text-[9px] font-black tracking-wider text-cyan-400 border border-cyan-800 bg-cyan-950 px-2 py-0.5">
                        PINNED IN-GAME
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePinPixel(lineupId, idx);
                        }}
                        className="text-[9px] font-bold text-zinc-400 border border-zinc-800 px-2 py-0.5 hover:text-cyan-300 hover:border-cyan-500"
                      >
                        PIN
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {(!activePlan?.lineupIds || activePlan.lineupIds.length === 0) && (
              <div className="h-full flex items-center justify-center text-zinc-600 text-xs">
                NO PIXELS IN THIS PLAN
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Hotkey Reminder Bar */}
      <div className="flex items-center justify-between border-t border-zinc-800 pt-3 mt-3 text-[10px] text-zinc-500">
        <div className="flex items-center gap-4">
          <span>HOLD <strong className="text-zinc-300">[CAPSLOCK]</strong>: ALIGN CROSSHAIR</span>
          <span>PRESS <strong className="text-zinc-300">[F1]</strong>: CORNER OVERLAY</span>
          <span>PRESS <strong className="text-cyan-400">[F2]</strong>: NEXT PIXEL IN PLAN</span>
        </div>
        <div className="text-[9px] text-zinc-600">
          ZERO BACKGROUND OVERHEAD // 100% NATIVE CS2 FPS
        </div>
      </div>
    </div>
  );
};

export default OverlayCenterView;
