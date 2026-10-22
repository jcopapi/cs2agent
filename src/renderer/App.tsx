/**
 * CS2 Assistant - Root Application Shell
 * File: src/renderer/App.tsx
 *
 * Streamlined launcher:
 * - Utility Room (Split-screen Pixels & Plans) as primary launcher
 * - Seamless transition to in-match OverlayCenterView when CS2 match is active
 * - Settings modal accessible via gear icon in top-left
 * - Transparent HudOverlayView for in-game overlay window
 */

import React, { useState, useEffect } from 'react';
import UtilityRoomView from './components/destinations/UtilityRoomView';
import OverlayCenterView from './components/overlay-center/OverlayCenterView';
import HudOverlayView from './components/hud-overlay/HudOverlayView';
import SettingsModal from './components/settings/SettingsModal';
import { advanceActivePlayStep } from '../core/utility/play-database';
import { getLineupById } from '../core/utility/lineup-database';

export default function App(): JSX.Element {
  // 1. Transparent Overlay Window Routing
  const isOverlayMode =
    Boolean(window.cs2Assistant?.isOverlay) ||
    window.location.hash.includes('overlay') ||
    window.location.search.includes('overlay');

  if (isOverlayMode) {
    return <HudOverlayView />;
  }

  // 2. Active Match & Settings State
  const [isMatchActive, setIsMatchActive] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [userViewOverride, setUserViewOverride] = useState<'UTILITY' | 'OVERLAY_CENTER' | null>(null);

  // 3. Match Lifecycle Listener via Valve GSI
  useEffect(() => {
    const api = window.cs2Assistant;
    if (!api?.gsi) return;

    api.gsi.getStatus().then((status) => {
      if (status?.activeMatch) {
        setIsMatchActive(true);
      } else {
        setIsMatchActive(false);
        setUserViewOverride(null);
      }
    }).catch(() => {});

    const unsubGsi = api.gsi.onStatusChange((status) => {
      const active = Boolean(status?.activeMatch);
      setIsMatchActive(active);
      if (!active) {
        setUserViewOverride(null);
      }
    });

    return unsubGsi;
  }, []);

  // 4. Global Hotkey F2: Step through pixels in active Tactical Plan
  useEffect(() => {
    const api = window.cs2Assistant;
    if (!api?.play?.onNextPixel) return;

    const unsubPlay = api.play.onNextPixel((data) => {
      if (data && typeof data.stepIndex === 'number') {
        setActivePlayStepIndex(data.stepIndex);
        return;
      }
      const { lineupId } = advanceActivePlayStep();
      if (lineupId) {
        const lineup = getLineupById(lineupId);
        if (lineup) {
          api.hud.setActiveLineupPhoto(lineup);
        }
      }
    });

    return unsubPlay;
  }, []);

  const showOverlayCenter = isMatchActive && (userViewOverride === 'OVERLAY_CENTER' || userViewOverride === null);

  return (
    <div
      data-testid="app-shell"
      className="flex h-screen w-screen flex-col bg-[#09090b] text-[#f4f4f5] select-none overflow-hidden font-mono"
    >
      <main data-testid="active-view-container" className="flex-1 overflow-hidden relative">
        {showOverlayCenter ? (
          <OverlayCenterView
            onOpenSettings={() => setIsSettingsOpen(true)}
            onGoToLauncher={() => setUserViewOverride('UTILITY')}
          />
        ) : (
          <UtilityRoomView
            onOpenSettings={() => setIsSettingsOpen(true)}
            isMatchActive={isMatchActive}
            onGoToOverlayCenter={() => setUserViewOverride('OVERLAY_CENTER')}
          />
        )}
      </main>

      {/* Global Configuration Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
