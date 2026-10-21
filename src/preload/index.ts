/**
 * CS2 Assistant - Secure Preload Context Bridge
 * File: src/preload/index.ts
 *
 * Exposes window.cs2Assistant into the unprivileged renderer world.
 * Strict context isolation with zero direct Node access.
 */

import { contextBridge, ipcRenderer } from 'electron';
import type {
  ICS2AssistantAPI,
  GsiStatus,
  TacticalObservation,
  BombState,
  Lineup,
  LineupFilter,
  LineupExecutionState,
  Strategy,
  StrategyFilter,
  MatchPreparationProfile,
  MatchRecord,
  TacticalContext,
  TacticalRecommendation,
  AiUsageStats,
  HudConfig,
  SafeZones,
  ComplianceState,
  ComplianceSource,
  EnvironmentMode,
} from '../shared/ipc-types';

const isOverlay =
  process.argv.includes('--window-type=overlay') ||
  (typeof globalThis !== 'undefined' &&
    'location' in globalThis &&
    String((globalThis as { location?: { href?: string } }).location?.href || '').includes('overlay'));

const api: ICS2AssistantAPI = {
  isOverlay,
  // ----------------------------------------------------
  // GSI & Simulation
  // ----------------------------------------------------
  gsi: {
    getStatus: (): Promise<GsiStatus> => ipcRenderer.invoke('gsi:get-status'),
    onStatusChange: (callback: (status: GsiStatus) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: GsiStatus) => callback(data);
      ipcRenderer.on('gsi:status-changed', handler);
      return () => {
        ipcRenderer.removeListener('gsi:status-changed', handler);
      };
    },
    setSimulationMode: (enabled: boolean): Promise<void> =>
      ipcRenderer.invoke('gsi:set-simulation-mode', enabled),
    injectScenario: (scenarioId: string): Promise<void> =>
      ipcRenderer.invoke('gsi:inject-scenario', scenarioId),
  },

  // ----------------------------------------------------
  // Tactical Memory & Observations
  // ----------------------------------------------------
  tactical: {
    getObservations: (): Promise<TacticalObservation[]> =>
      ipcRenderer.invoke('tactical:get-observations'),
    onObservationUpdate: (callback: (obs: TacticalObservation[]) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: TacticalObservation[]) => callback(data);
      ipcRenderer.on('tactical:observation-updated', handler);
      return () => {
        ipcRenderer.removeListener('tactical:observation-updated', handler);
      };
    },
    getBombState: (): Promise<BombState | null> =>
      ipcRenderer.invoke('tactical:get-bomb-state'),
    onBombUpdate: (callback: (bomb: BombState | null) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: BombState | null) => callback(data);
      ipcRenderer.on('tactical:bomb-updated', handler);
      return () => {
        ipcRenderer.removeListener('tactical:bomb-updated', handler);
      };
    },
  },

  // ----------------------------------------------------
  // Lineup & State Machine
  // ----------------------------------------------------
  lineup: {
    getAll: (filter?: LineupFilter): Promise<Lineup[]> =>
      ipcRenderer.invoke('lineup:get-all', filter),
    getById: (id: string): Promise<Lineup | null> =>
      ipcRenderer.invoke('lineup:get-by-id', id),
    save: (lineup: Lineup): Promise<Lineup> =>
      ipcRenderer.invoke('lineup:save', lineup),
    delete: (id: string): Promise<boolean> =>
      ipcRenderer.invoke('lineup:delete', id),
    onExecutionStateChange: (callback: (state: LineupExecutionState) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: LineupExecutionState) => callback(data);
      ipcRenderer.on('lineup:execution-state-changed', handler);
      return () => {
        ipcRenderer.removeListener('lineup:execution-state-changed', handler);
      };
    },
    manualOverride: (action: 'NEXT' | 'CANCEL' | 'COMPLETE'): Promise<void> =>
      ipcRenderer.invoke('lineup:manual-override', action),
  },

  // ----------------------------------------------------
  // Strategy & Preparation Profiles
  // ----------------------------------------------------
  strategy: {
    getAll: (filter?: StrategyFilter): Promise<Strategy[]> =>
      ipcRenderer.invoke('strategy:get-all', filter),
    getById: (id: string): Promise<Strategy | null> =>
      ipcRenderer.invoke('strategy:get-by-id', id),
    save: (strategy: Strategy): Promise<Strategy> =>
      ipcRenderer.invoke('strategy:save', strategy),
    delete: (id: string): Promise<boolean> =>
      ipcRenderer.invoke('strategy:delete', id),
    getActiveProfile: (): Promise<MatchPreparationProfile | null> =>
      ipcRenderer.invoke('strategy:get-active-profile'),
    setActiveProfile: (profile: MatchPreparationProfile | null): Promise<void> =>
      ipcRenderer.invoke('strategy:set-active-profile', profile),
  },

  // ----------------------------------------------------
  // Match History & Analytics
  // ----------------------------------------------------
  history: {
    getAll: (): Promise<MatchRecord[]> =>
      ipcRenderer.invoke('history:get-all'),
    getById: (id: string): Promise<MatchRecord | null> =>
      ipcRenderer.invoke('history:get-by-id', id),
    save: (record: MatchRecord): Promise<MatchRecord> =>
      ipcRenderer.invoke('history:save', record),
    delete: (id: string): Promise<boolean> =>
      ipcRenderer.invoke('history:delete', id),
  },

  // ----------------------------------------------------
  // Gemini AI Tactical Coach
  // ----------------------------------------------------
  gemini: {
    hasKey: (): Promise<boolean> =>
      ipcRenderer.invoke('gemini:has-key'),
    storeKey: (key: string): Promise<boolean> =>
      ipcRenderer.invoke('gemini:store-key', key),
    removeKey: (): Promise<boolean> =>
      ipcRenderer.invoke('gemini:remove-key'),
    testKey: (key: string): Promise<{ valid: boolean; latencyMs?: number; error?: string }> =>
      ipcRenderer.invoke('gemini:test-key', key),
    requestAdvice: (context: TacticalContext): Promise<TacticalRecommendation | null> =>
      ipcRenderer.invoke('gemini:request-advice', context),
    getUsageStats: (): Promise<AiUsageStats> =>
      ipcRenderer.invoke('gemini:get-usage-stats'),
  },

  // ----------------------------------------------------
  // HUD & Safe Overlay
  // ----------------------------------------------------
  hud: {
    getConfig: (): Promise<HudConfig> =>
      ipcRenderer.invoke('hud:get-config'),
    updateConfig: (config: Partial<HudConfig>): Promise<HudConfig> =>
      ipcRenderer.invoke('hud:update-config', config),
    setCalibrationMode: (interactive: boolean): Promise<void> =>
      ipcRenderer.invoke('hud:set-calibration-mode', interactive),
    getSafeZones: (): Promise<SafeZones> =>
      ipcRenderer.invoke('hud:get-safe-zones'),
    setActiveLineupPhoto: (lineup: Lineup | null): Promise<void> =>
      ipcRenderer.invoke('hud:set-active-lineup-photo', lineup),
    getActiveLineupPhoto: (): Promise<Lineup | null> =>
      ipcRenderer.invoke('hud:get-active-lineup-photo'),
    toggleActiveLineupPhoto: (): Promise<void> =>
      ipcRenderer.invoke('hud:toggle-active-lineup-photo'),
    setAlignState: (active: boolean): Promise<void> =>
      ipcRenderer.invoke('hud:set-align-state', active),
    getAlignState: (): Promise<boolean> =>
      ipcRenderer.invoke('hud:get-align-state'),
    onAlignStateChange: (callback: (active: boolean) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: boolean) => callback(data);
      ipcRenderer.on('hud:align-state-changed', handler);
      return () => {
        ipcRenderer.removeListener('hud:align-state-changed', handler);
      };
    },
    getHotkeyConfig: (): Promise<any> =>
      ipcRenderer.invoke('hud:get-hotkey-config'),
    setHotkeyConfig: (config: any): Promise<any> =>
      ipcRenderer.invoke('hud:set-hotkey-config', config),
    setMainWindowVisible: (visible: boolean): Promise<void> =>
      ipcRenderer.invoke('hud:set-main-window-visible', visible),
    onHotkeyConfigChange: (callback: (config: any) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: any) => callback(data);
      ipcRenderer.on('hud:hotkey-config-changed', handler);
      return () => {
        ipcRenderer.removeListener('hud:hotkey-config-changed', handler);
      };
    },
    onActiveLineupPhotoChange: (callback: (lineup: Lineup | null) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: Lineup | null) => callback(data);
      ipcRenderer.on('hud:active-lineup-photo-changed', handler);
      return () => {
        ipcRenderer.removeListener('hud:active-lineup-photo-changed', handler);
      };
    },
    onConfigChange: (callback: (config: HudConfig) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: HudConfig) => callback(data);
      ipcRenderer.on('hud:config-updated', handler);
      return () => {
        ipcRenderer.removeListener('hud:config-updated', handler);
      };
    },
  },

  play: {
    nextPixel: (): Promise<void> =>
      ipcRenderer.invoke('play:next-pixel'),
    onNextPixel: (callback: () => void): (() => void) => {
      const handler = () => callback();
      ipcRenderer.on('play:next-pixel', handler);
      return () => {
        ipcRenderer.removeListener('play:next-pixel', handler);
      };
    },
  },

  // ----------------------------------------------------
  // Compliance & Gating
  // ----------------------------------------------------
  compliance: {
    getState: (): Promise<ComplianceState> =>
      ipcRenderer.invoke('compliance:get-state'),
    setEnvironment: (mode: EnvironmentMode): Promise<ComplianceState> =>
      ipcRenderer.invoke('compliance:set-environment', mode),
    getPrimarySources: (): Promise<ComplianceSource[]> =>
      ipcRenderer.invoke('compliance:get-primary-sources'),
  },

  // ----------------------------------------------------
  // Top-Level Convenience Methods (PROJECT.md §6 Parity)
  // ----------------------------------------------------
  getEnvironmentMode: (): Promise<EnvironmentMode> =>
    ipcRenderer.invoke('api:get-environment-mode'),
  setEnvironmentMode: (mode: EnvironmentMode): Promise<void> =>
    ipcRenderer.invoke('api:set-environment-mode', mode),
  saveApiKey: (key: string): Promise<boolean> =>
    ipcRenderer.invoke('api:save-api-key', key),
  getApiKey: (): Promise<string | null> =>
    ipcRenderer.invoke('api:get-api-key'),
  removeApiKey: (): Promise<boolean> =>
    ipcRenderer.invoke('api:remove-api-key'),
  testApiConnection: (key: string) =>
    ipcRenderer.invoke('api:test-api-connection', key),
  startGsiListener: (port?: number) =>
    ipcRenderer.invoke('api:start-gsi-listener', port),
  stopGsiListener: () =>
    ipcRenderer.invoke('api:stop-gsi-listener'),
  startSimulationMode: (scenarioId: string) =>
    ipcRenderer.invoke('api:start-simulation-mode', scenarioId),
  stopSimulationMode: () =>
    ipcRenderer.invoke('api:stop-simulation-mode'),

  onGsiUpdate: (callback: (data: GsiStatus) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: GsiStatus) => callback(data);
    ipcRenderer.on('gsi:update', handler);
    return () => {
      ipcRenderer.removeListener('gsi:update', handler);
    };
  },
  onTacticalRecommendation: (callback: (rec: TacticalRecommendation) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: TacticalRecommendation) => callback(data);
    ipcRenderer.on('tactical:recommendation', handler);
    return () => {
      ipcRenderer.removeListener('tactical:recommendation', handler);
    };
  },
  onBombTimerUpdate: (callback: (timer: BombState | null) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: BombState | null) => callback(data);
    ipcRenderer.on('bomb:timer-update', handler);
    return () => {
      ipcRenderer.removeListener('bomb:timer-update', handler);
    };
  },
  onLineupStateChange: (callback: (state: LineupExecutionState) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: LineupExecutionState) => callback(data);
    ipcRenderer.on('lineup:state-change', handler);
    return () => {
      ipcRenderer.removeListener('lineup:state-change', handler);
    };
  },
};

// Expose the strongly typed API surface into window
contextBridge.exposeInMainWorld('cs2Assistant', api);
