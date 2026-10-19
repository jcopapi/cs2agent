/**
 * CS2 Assistant - Top Navigation Header
 * File: src/renderer/components/navigation/Navbar.tsx
 *
 * Implements the 48px minimalist header bar featuring exactly
 * three primary destinations (LIVE MATCH, UTILITY ROOM, HISTORY),
 * environment badge, live GSI telemetry status, and secondary menu trigger.
 */

import React, { useEffect, useState } from 'react';
import { Crosshair, BookOpen, History, Settings, Radio } from 'lucide-react';
import type { GsiStatus, EnvironmentMode } from '../../../shared/ipc-types';

export interface NavbarProps {
  activeDestination: 'LIVE_MATCH' | 'UTILITY_ROOM' | 'HISTORY';
  onSelectDestination: (dest: 'LIVE_MATCH' | 'UTILITY_ROOM' | 'HISTORY') => void;
  onOpenSecondaryMenu: (tab?: 'GEMINI_API_KEY' | 'HUD_CONFIGURATION' | 'COMPLIANCE_MATRIX' | 'HELP') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeDestination,
  onSelectDestination,
  onOpenSecondaryMenu,
}) => {
  const [gsiStatus, setGsiStatus] = useState<GsiStatus>({
    listening: false,
    port: 3001,
    clientConnected: false,
    authenticated: false,
    lastHeartbeat: null,
    environment: 'COMPETITIVE_PROTECTED',
    activeMatch: false,
  });

  useEffect(() => {
    // If running in Electron context, subscribe to GSI status updates
    if (window.cs2Assistant?.gsi) {
      window.cs2Assistant.gsi.getStatus().then((status) => {
        if (status) setGsiStatus(status);
      }).catch(() => {});

      const unsubscribe = window.cs2Assistant.gsi.onStatusChange((status) => {
        setGsiStatus(status);
      });
      return unsubscribe;
    }
  }, []);

  const getEnvBadgeLabel = (env: EnvironmentMode): string => {
    switch (env) {
      case 'COMPETITIVE_PROTECTED':
        return 'COMPETITIVE';
      case 'PRACTICE_SERVER':
        return 'PRACTICE';
      case 'SIMULATION_PREVIEW':
        return 'SIMULATION';
      default:
        return 'COMPETITIVE';
    }
  };

  return (
    <header className="flex h-12 w-full items-center justify-between border-b border-border-subtle bg-background-container px-4 z-20 select-none">
      {/* Left: Brand Identity & Environment Mode */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded border border-border-elevated bg-background-panel text-tactical-cyan">
            <Radio className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-bold tracking-widest text-zinc-100 uppercase">
            CS2 ASSISTANT
          </span>
        </div>
        <span
          data-testid="environment-mode-badge"
          className="rounded border border-border-subtle bg-background-panel px-2 py-0.5 font-mono text-[10px] tracking-wider text-zinc-400 uppercase"
        >
          {getEnvBadgeLabel(gsiStatus.environment)}
        </span>
      </div>

      {/* Center: EXACTLY THREE Primary Destinations */}
      <nav data-testid="primary-navigation" className="flex items-center gap-1 rounded-lg border border-border-subtle bg-background p-1">
        <button
          data-testid="nav-tab-live-match"
          onClick={() => onSelectDestination('LIVE_MATCH')}
          className={`flex items-center gap-2 rounded px-3 py-1 text-xs font-medium tracking-wide transition-colors cursor-pointer ${
            activeDestination === 'LIVE_MATCH'
              ? 'bg-background-elevated text-zinc-100 border border-border-elevated shadow-subtle'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-background-panel border border-transparent'
          }`}
        >
          <Crosshair className="h-3.5 w-3.5 text-tactical-emerald" />
          <span>LIVE MATCH</span>
          <span className="font-mono text-[10px] text-zinc-500">[1]</span>
        </button>

        <button
          data-testid="nav-tab-utility-room"
          onClick={() => onSelectDestination('UTILITY_ROOM')}
          className={`flex items-center gap-2 rounded px-3 py-1 text-xs font-medium tracking-wide transition-colors cursor-pointer ${
            activeDestination === 'UTILITY_ROOM'
              ? 'bg-background-elevated text-zinc-100 border border-border-elevated shadow-subtle'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-background-panel border border-transparent'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5 text-tactical-cyan" />
          <span>UTILITY ROOM</span>
          <span className="font-mono text-[10px] text-zinc-500">[2]</span>
        </button>

        <button
          data-testid="nav-tab-history"
          onClick={() => onSelectDestination('HISTORY')}
          className={`flex items-center gap-2 rounded px-3 py-1 text-xs font-medium tracking-wide transition-colors cursor-pointer ${
            activeDestination === 'HISTORY'
              ? 'bg-background-elevated text-zinc-100 border border-border-elevated shadow-subtle'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-background-panel border border-transparent'
          }`}
        >
          <History className="h-3.5 w-3.5 text-tactical-amber" />
          <span>HISTORY</span>
          <span className="font-mono text-[10px] text-zinc-500">[3]</span>
        </button>
      </nav>

      {/* Right: Live GSI Telemetry Status & Secondary Menu Trigger */}
      <div className="flex items-center gap-3">
        <div
          data-testid="gsi-status-indicator"
          className="flex items-center gap-2 rounded-full border border-border-subtle bg-background-panel px-2.5 py-1 text-xs font-mono"
        >
          {gsiStatus.activeMatch ? (
            <>
              <span className="h-2 w-2 rounded-full bg-tactical-emerald animate-pulse" />
              <span className="text-tactical-emerald text-[11px] font-medium tracking-wide">ACTIVE MATCH</span>
            </>
          ) : gsiStatus.environment === 'SIMULATION_PREVIEW' ? (
            <>
              <span className="h-2 w-2 rounded-full bg-tactical-cyan" />
              <span className="text-tactical-cyan text-[11px] font-medium tracking-wide">SIMULATION MODE</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-tactical-amber" />
              <span className="text-zinc-400 text-[11px] font-medium tracking-wide">STANDBY — AWAITING CS2</span>
            </>
          )}
        </div>

        <button
          data-testid="secondary-menu-trigger"
          onClick={() => onOpenSecondaryMenu()}
          className="flex h-8 w-8 items-center justify-center rounded border border-border-subtle bg-background-panel text-zinc-400 hover:text-zinc-100 hover:bg-background-elevated transition-colors cursor-pointer"
          title="Open Settings and Configuration (S)"
          aria-label="Settings and Preferences"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
