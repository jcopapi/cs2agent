/**
 * CS2 Assistant - Root Application Shell
 * File: src/renderer/App.tsx
 *
 * Implements the precision minimalist dark design system shell,
 * coordinates exactly three primary destinations (LIVE MATCH, UTILITY ROOM, HISTORY),
 * the compact secondary menu drawer, keyboard shortcuts, and HUD overlay routing.
 */

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/navigation/Navbar';
import SecondaryMenu, { type SecondaryMenuTab } from './components/navigation/SecondaryMenu';
import LiveMatchView from './components/destinations/LiveMatchView';
import UtilityRoomView from './components/destinations/UtilityRoomView';
import HistoryView from './components/destinations/HistoryView';
import HudOverlayView from './components/hud-overlay/HudOverlayView';

export type PrimaryDestination = 'LIVE_MATCH' | 'UTILITY_ROOM' | 'HISTORY';

export default function App(): JSX.Element {
  // 1. Overlay Window Detection (for Electron transparent window)
  const isOverlayMode =
    window.location.hash.includes('overlay') ||
    window.location.search.includes('overlay=true');

  if (isOverlayMode) {
    return <HudOverlayView />;
  }

  // 2. Primary Navigation State (default: LIVE_MATCH)
  const [activeDestination, setActiveDestination] = useState<PrimaryDestination>('LIVE_MATCH');
  const [isSecondaryMenuOpen, setIsSecondaryMenuOpen] = useState<boolean>(false);
  const [secondaryMenuTab, setSecondaryMenuTab] = useState<SecondaryMenuTab>('GEMINI_API_KEY');

  // 3. Closed Loop Deep-Link State (History -> Utility Room)
  const [utilitySelection, setUtilitySelection] = useState<{ map?: string; strategyId?: string }>({});

  // 4. Closed Loop Practice Retake Trigger Handler
  const handleTriggerPracticeRetake = useCallback((map: string, strategyId: string) => {
    setUtilitySelection({ map, strategyId });
    setActiveDestination('UTILITY_ROOM');
  }, []);

  // 5. Global Keyboard Shortcuts (1, 2, 3, S, Esc, ?)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Input isolation: Ignore number shortcuts when typing in inputs/textareas
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if (e.key === '1' || (e.altKey && e.key === '1')) {
        e.preventDefault();
        setActiveDestination('LIVE_MATCH');
      } else if (e.key === '2' || (e.altKey && e.key === '2')) {
        e.preventDefault();
        setActiveDestination('UTILITY_ROOM');
      } else if (e.key === '3' || (e.altKey && e.key === '3')) {
        e.preventDefault();
        setActiveDestination('HISTORY');
      } else if (e.key.toLowerCase() === 's' || (e.ctrlKey && e.key === ',')) {
        e.preventDefault();
        setIsSecondaryMenuOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (isSecondaryMenuOpen) {
          e.preventDefault();
          setIsSecondaryMenuOpen(false);
        }
      } else if (e.key === '?') {
        e.preventDefault();
        setSecondaryMenuTab('HELP');
        setIsSecondaryMenuOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSecondaryMenuOpen]);

  return (
    <div
      data-testid="app-shell"
      className="flex h-screen w-screen flex-col bg-background text-zinc-100 select-none overflow-hidden font-sans"
    >
      <Navbar
        activeDestination={activeDestination}
        onSelectDestination={setActiveDestination}
        onOpenSecondaryMenu={(tab) => {
          if (tab) setSecondaryMenuTab(tab);
          setIsSecondaryMenuOpen(true);
        }}
      />

      <main data-testid="active-view-container" className="flex-1 overflow-hidden relative">
        {activeDestination === 'LIVE_MATCH' && <LiveMatchView />}
        {activeDestination === 'UTILITY_ROOM' && (
          <UtilityRoomView
            initialMap={utilitySelection.map}
            initialStrategyId={utilitySelection.strategyId}
          />
        )}
        {activeDestination === 'HISTORY' && (
          <HistoryView onTriggerPracticeRetake={handleTriggerPracticeRetake} />
        )}
      </main>

      {/* Slide-out Secondary Menu Drawer */}
      <SecondaryMenu
        isOpen={isSecondaryMenuOpen}
        activeTab={secondaryMenuTab}
        onSelectTab={setSecondaryMenuTab}
        onClose={() => setIsSecondaryMenuOpen(false)}
      />
    </div>
  );
}
