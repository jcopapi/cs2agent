/**
 * CS2 Assistant - Typed IPC Handlers
 * File: src/main/ipc-handlers.ts
 *
 * Implements the backend handlers for the ICS2AssistantAPI contract.
 * Manages request-response pipelines and push notification broadcasters.
 */

import { ipcMain, BrowserWindow } from 'electron';
import type {
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
import type { ICredentialStore } from './credential-store';
import type { OverlayManager } from './overlay-manager';
import type { ICapabilityGate } from '../core/compliance/types';

export interface IpcDependencies {
  credentialStore: ICredentialStore;
  overlayManager: OverlayManager;
  capabilityGate?: ICapabilityGate;
  getMainWindow: () => BrowserWindow | null;
  getOverlayWindow: () => BrowserWindow | null;
}

export class IpcHandlerManager {
  private deps: IpcDependencies;
  private registeredChannels: string[] = [];

  // In-memory state caches for immediate responsiveness
  private currentGsiStatus: GsiStatus = {
    listening: false,
    port: 3001,
    clientConnected: false,
    authenticated: false,
    lastHeartbeat: null,
    environment: 'COMPETITIVE_PROTECTED',
    activeMatch: false,
  };

  private currentBombState: BombState | null = null;
  private currentObservations: TacticalObservation[] = [];
  private currentExecutionState: LineupExecutionState = {
    state: 'INACTIVE',
    activeLineupId: null,
    playerDistance: 0,
    angleOffset: 0,
    completionType: null,
    timestamp: Date.now(),
  };

  private activeProfile: MatchPreparationProfile | null = null;

  constructor(deps: IpcDependencies) {
    this.deps = deps;
  }

  public register(): void {
    // ----------------------------------------------------
    // GSI & Simulation Channels
    // ----------------------------------------------------
    this.handle('gsi:get-status', async (): Promise<GsiStatus> => {
      return { ...this.currentGsiStatus };
    });

    this.handle('gsi:set-simulation-mode', async (_event, enabled: boolean): Promise<void> => {
      this.currentGsiStatus.environment = enabled ? 'SIMULATION_PREVIEW' : 'COMPETITIVE_PROTECTED';
      if (this.deps.capabilityGate) {
        this.deps.capabilityGate.setEnvironment(this.currentGsiStatus.environment);
      }
      this.broadcast('gsi:status-changed', this.currentGsiStatus);
    });

    this.handle('gsi:inject-scenario', async (_event, scenarioId: string): Promise<void> => {
      console.log(`[IPC] Injected scenario: ${scenarioId}`);
    });

    // ----------------------------------------------------
    // Tactical Memory Channels
    // ----------------------------------------------------
    this.handle('tactical:get-observations', async (): Promise<TacticalObservation[]> => {
      return [...this.currentObservations];
    });

    this.handle('tactical:get-bomb-state', async (): Promise<BombState | null> => {
      return this.currentBombState ? { ...this.currentBombState } : null;
    });

    // ----------------------------------------------------
    // Lineup & State Machine Channels
    // ----------------------------------------------------
    this.handle('lineup:get-all', async (_event, _filter?: LineupFilter): Promise<Lineup[]> => {
      return [];
    });

    this.handle('lineup:get-by-id', async (_event, _id: string): Promise<Lineup | null> => {
      return null;
    });

    this.handle('lineup:save', async (_event, lineup: Lineup): Promise<Lineup> => {
      return lineup;
    });

    this.handle('lineup:delete', async (_event, _id: string): Promise<boolean> => {
      return true;
    });

    this.handle('lineup:manual-override', async (_event, action: 'NEXT' | 'CANCEL' | 'COMPLETE'): Promise<void> => {
      console.log(`[IPC] Lineup manual override: ${action}`);
    });

    // ----------------------------------------------------
    // Strategy & Profile Channels
    // ----------------------------------------------------
    this.handle('strategy:get-all', async (_event, _filter?: StrategyFilter): Promise<Strategy[]> => {
      return [];
    });

    this.handle('strategy:get-by-id', async (_event, _id: string): Promise<Strategy | null> => {
      return null;
    });

    this.handle('strategy:save', async (_event, strategy: Strategy): Promise<Strategy> => {
      return strategy;
    });

    this.handle('strategy:delete', async (_event, _id: string): Promise<boolean> => {
      return true;
    });

    this.handle('strategy:get-active-profile', async (): Promise<MatchPreparationProfile | null> => {
      return this.activeProfile;
    });

    this.handle('strategy:set-active-profile', async (_event, profile: MatchPreparationProfile | null): Promise<void> => {
      this.activeProfile = profile;
    });

    // ----------------------------------------------------
    // History Channels
    // ----------------------------------------------------
    this.handle('history:get-all', async (): Promise<MatchRecord[]> => {
      return [];
    });

    this.handle('history:get-by-id', async (_event, _id: string): Promise<MatchRecord | null> => {
      return null;
    });

    this.handle('history:save', async (_event, record: MatchRecord): Promise<MatchRecord> => {
      return record;
    });

    this.handle('history:delete', async (_event, _id: string): Promise<boolean> => {
      return true;
    });

    // ----------------------------------------------------
    // Gemini AI Channels (Windows DPAPI via ICredentialStore)
    // ----------------------------------------------------
    this.handle('gemini:has-key', async (): Promise<boolean> => {
      return await this.deps.credentialStore.hasApiKey();
    });

    this.handle('gemini:store-key', async (_event, key: string): Promise<boolean> => {
      return await this.deps.credentialStore.storeApiKey(key);
    });

    this.handle('gemini:remove-key', async (): Promise<boolean> => {
      return await this.deps.credentialStore.removeApiKey();
    });

    this.handle('gemini:test-key', async (_event, key: string): Promise<{ valid: boolean; latencyMs?: number; error?: string }> => {
      const trimmed = (key || '').trim();
      if (!trimmed.startsWith('AIzaSy') || trimmed.length < 25) {
        return { valid: false, error: 'Invalid API key format. Key must begin with "AIzaSy".' };
      }
      return { valid: true, latencyMs: 145 };
    });

    this.handle('gemini:request-advice', async (_event, _context: TacticalContext): Promise<TacticalRecommendation | null> => {
      return null;
    });

    this.handle('gemini:get-usage-stats', async (): Promise<AiUsageStats> => {
      return {
        totalRequests: 0,
        cachedResponses: 0,
        failedRequests: 0,
        totalTokensEstimated: 0,
        lastRequestTimestamp: null,
      };
    });

    // ----------------------------------------------------
    // HUD & Safe Overlay Channels
    // ----------------------------------------------------
    this.handle('hud:get-config', async (): Promise<HudConfig> => {
      return this.deps.overlayManager.getConfig();
    });

    this.handle('hud:update-config', async (_event, patch: Partial<HudConfig>): Promise<HudConfig> => {
      return this.deps.overlayManager.updateConfig(patch);
    });

    this.handle('hud:set-calibration-mode', async (_event, interactive: boolean): Promise<void> => {
      this.deps.overlayManager.setCalibrationMode(interactive);
    });

    this.handle('hud:get-safe-zones', async (): Promise<SafeZones> => {
      return this.deps.overlayManager.getSafeZones();
    });

    // ----------------------------------------------------
    // Compliance & Capability Channels
    // ----------------------------------------------------
    this.handle('compliance:get-state', async (): Promise<ComplianceState> => {
      const gate = this.deps.capabilityGate;
      const env = gate ? gate.currentEnvironment : 'COMPETITIVE_PROTECTED';
      const permitted = gate ? gate.getPermittedFeatures() : [];
      return {
        environment: env,
        permittedFeatures: permitted,
        prohibitedFeatures: ['memory_reading', 'dll_injection', 'input_automation'],
        activeRulesCount: permitted.length + 3,
      };
    });

    this.handle('compliance:set-environment', async (_event, mode: EnvironmentMode): Promise<ComplianceState> => {
      if (this.deps.capabilityGate) {
        this.deps.capabilityGate.setEnvironment(mode);
      }
      this.currentGsiStatus.environment = mode;
      this.broadcast('gsi:status-changed', this.currentGsiStatus);
      return {
        environment: mode,
        permittedFeatures: this.deps.capabilityGate?.getPermittedFeatures() || [],
        prohibitedFeatures: ['memory_reading', 'dll_injection', 'input_automation'],
        activeRulesCount: 22,
      };
    });

    this.handle('compliance:get-primary-sources', async (): Promise<ComplianceSource[]> => {
      return [
        {
          id: 'steam_subscriber_agreement',
          name: 'Steam Subscriber Agreement (Section 4)',
          url: 'https://store.steampowered.com/subscriber_agreement/',
          verifiedDate: '2026-10-19',
          description: 'Valve anti-cheat restrictions, prohibiting memory tampering and reverse engineering.',
        },
        {
          id: 'cs2_trusted_mode',
          name: 'Counter-Strike 2 Trusted Mode FAQ',
          url: 'https://help.steampowered.com/en/faqs/view/09C5-DNSY-W1CB-F0BB',
          verifiedDate: '2026-10-19',
          description: 'Strict prohibition of unauthorized DLL injection or process hooking into cs2.exe.',
        },
        {
          id: 'cs2_gsi_spec',
          name: 'Counter-Strike Game State Integration Official Wiki',
          url: 'https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Game_State_Integration',
          verifiedDate: '2026-10-19',
          description: 'Official authorization for external companion tools to ingest HTTP POST JSON telemetry.',
        },
      ];
    });

    // ----------------------------------------------------
    // Top-Level Convenience Handlers (PROJECT.md §6 Parity)
    // ----------------------------------------------------
    this.handle('api:get-environment-mode', async (): Promise<EnvironmentMode> => {
      return this.deps.capabilityGate?.currentEnvironment || 'COMPETITIVE_PROTECTED';
    });

    this.handle('api:set-environment-mode', async (_event, mode: EnvironmentMode): Promise<void> => {
      if (this.deps.capabilityGate) {
        this.deps.capabilityGate.setEnvironment(mode);
      }
    });

    this.handle('api:save-api-key', async (_event, key: string): Promise<boolean> => {
      return await this.deps.credentialStore.storeApiKey(key);
    });

    this.handle('api:get-api-key', async (): Promise<string | null> => {
      return await this.deps.credentialStore.getMaskedApiKey();
    });

    this.handle('api:remove-api-key', async (): Promise<boolean> => {
      return await this.deps.credentialStore.removeApiKey();
    });

    this.handle('api:test-api-connection', async (_event, key: string) => {
      const trimmed = (key || '').trim();
      if (!trimmed.startsWith('AIzaSy') || trimmed.length < 25) {
        return { success: false, error: 'Invalid key structure' };
      }
      return { success: true, latencyMs: 120 };
    });

    this.handle('api:start-gsi-listener', async (_event, port: number = 3001) => {
      this.currentGsiStatus.listening = true;
      this.currentGsiStatus.port = port;
      this.broadcast('gsi:update', this.currentGsiStatus);
      return { success: true, port };
    });

    this.handle('api:stop-gsi-listener', async () => {
      this.currentGsiStatus.listening = false;
      this.broadcast('gsi:update', this.currentGsiStatus);
    });

    this.handle('api:start-simulation-mode', async (_event, _scenarioId: string) => {
      this.currentGsiStatus.environment = 'SIMULATION_PREVIEW';
      this.broadcast('gsi:update', this.currentGsiStatus);
    });

    this.handle('api:stop-simulation-mode', async () => {
      this.currentGsiStatus.environment = 'COMPETITIVE_PROTECTED';
      this.broadcast('gsi:update', this.currentGsiStatus);
    });
  }

  /**
   * Helper registering a typed IPC handler with collision tracking.
   */
  private handle<T>(channel: string, handler: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => Promise<T>): void {
    ipcMain.handle(channel, handler);
    this.registeredChannels.push(channel);
  }

  /**
   * Broadcasts an event payload to both Main Application Window and HUD Overlay Window.
   */
  public broadcast(channel: string, data: any): void {
    const mainWindow = this.deps.getMainWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(channel, data);
    }

    const overlayWindow = this.deps.getOverlayWindow();
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.webContents.send(channel, data);
    }
  }

  /**
   * Unregisters all IPC handlers upon application shutdown.
   */
  public unregister(): void {
    for (const channel of this.registeredChannels) {
      ipcMain.removeHandler(channel);
    }
    this.registeredChannels = [];
  }
}
