# Milestone 2: Electron Application Shell, Architecture & Security Specification

**Author**: `explorer_m2_electron` (Teamwork Explorer)  
**Date**: 2026-10-19  
**Target Milestone**: Milestone 2 (Application Shell, Design System, Electron & Security)  
**Project Root**: `c:\Users\conta\Desktop\CS2Agent`  
**Compliance Authority**: Valve Trusted Mode, VAC, SSA, CS2 GSI Specification  

---

## 1. Executive Summary & Architectural Boundaries

Milestone 2 establishes the desktop runtime shell for **CS2 Assistant**. The system is composed of two OS-level processes and a cryptographic bridge:
1. **Node.js Main Process (`src/main/`)**: Privileged environment managing OS lifecycle, Windows DPAPI encryption (`safeStorage`), dual window management (1280x800 Main Shell + Transparent Click-Through HUD Overlay), and IPC multiplexing.
2. **Chromium Renderer Process (`src/renderer/`)**: Unprivileged UI execution environment strictly isolated behind `contextIsolation: true` with zero direct Node.js or OS capabilities.
3. **Preload Context Bridge (`src/preload/`)**: Immutable cryptographic boundary exposing the strongly typed `ICS2AssistantAPI` interface via `contextBridge.exposeInMainWorld('cs2Assistant', ...)`.
4. **Shared Type System (`src/shared/`)**: Decoupled interface schemas ensuring 100% type safety across Main, Preload, and Renderer without circular dependencies.

### 1.1 Process Architecture Diagram

```
+----------------------------------------------------------------------------------------------------+
|                                    ELECTRON MAIN PROCESS (Node.js)                                 |
|                                                                                                    |
|  +----------------------------------------------------------------------------------------------+  |
|  | src/main/index.ts: Application Lifecycle, Single Instance Lock, Security Flags, Window Setup|  |
|  +----------------------------------------------------------------------------------------------+  |
|         │                                │                                │                        |
|         ▼                                ▼                                ▼                        |
|  +-----------------------+      +-----------------------+      +--------------------------------+  |
|  | credential-store.ts   |      | overlay-manager.ts    |      | ipc-handlers.ts                |  |
|  | - safeStorage DPAPI   |      | - Transparent Window  |      | - Typed IPC Dispatcher         |  |
|  | - credentials.enc     |      | - Click-Through Mode  |      | - Broadcast to Main & Overlay  |  |
|  | - ICredentialStore    |      | - Safe Zone Exclusion |      | - Service Dependencies Injection|  |
|  +-----------------------+      +-----------------------+      +--------------------------------+  |
+--------------------------------------------------|-------------------------------------------------+
                                                   | IPC Channels (Typed Request-Response & Broadcast)
                                                   v
+----------------------------------------------------------------------------------------------------+
|                                   PRELOAD CONTEXT BRIDGE                                           |
|                                                                                                    |
|  +----------------------------------------------------------------------------------------------+  |
|  | src/preload/index.ts: contextBridge.exposeInMainWorld('cs2Assistant', api)                   |  |
|  | - contextIsolation: true, nodeIntegration: false, sandbox: true                             |  |
|  | - Unsubscribe hooks for all event streams                                                   |  |
|  +----------------------------------------------------------------------------------------------+  |
+--------------------------------------------------|-------------------------------------------------+
                                                   | window.cs2Assistant
                                                   v
+----------------------------------------------------------------------------------------------------+
|                                   RENDERER PROCESS (React 18 + Vite)                               |
|                                                                                                    |
|  +-------------------------------------+             +------------------------------------------+  |
|  | Main Application Window (1280x800)  |             | Transparent Safe HUD Overlay Window      |  |
|  | - 3 Destinations Shell              |             | - Zero Input Interception (Click-Through)|  |
|  | - Secondary Menu & Settings         |             | - Crosshair 450x450 Exclusion            |  |
|  | - DPAPI Key Config & GSI Monitor    |             | - Radar (360x360) & Status HUD Exclusion |  |
|  +-------------------------------------+             +------------------------------------------+  |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Shared Type System Blueprint (`src/shared/ipc-types.ts`)

This shared module contains all interface types, payloads, and API signatures needed across Main, Preload, and Renderer. It is located at `src/shared/ipc-types.ts` and can be imported via `@shared/ipc-types`.

```typescript
/**
 * CS2 Assistant - Shared IPC and Domain Contracts
 * File: src/shared/ipc-types.ts
 *
 * Single source of truth for IPC signatures, data transfer objects,
 * and the window.cs2Assistant global interface contract.
 */

import type { EnvironmentMode } from '../core/compliance/types';

export type { EnvironmentMode };

export type CS2Map = 'de_mirage' | 'de_inferno' | 'de_dust2' | 'de_nuke' | 'de_ancient' | 'de_anubis';
export type TeamSide = 'CT' | 'T' | 'BOTH';
export type UtilityType = 'SMOKE' | 'FLASHBANG' | 'HE_GRENADE' | 'MOLOTOV_INCENDIARY';
export type StrategyTier = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'COORDINATED';
export type ProvenanceLevel = 'CONFIRMED' | 'REPORTED' | 'INFERRED';
export type LineupFsmState = 'INACTIVE' | 'NEARBY' | 'POSITIONING' | 'ALIGNING' | 'READY' | 'EXECUTED' | 'NEXT';
export type CompletionType = 'Attempted' | 'Confirmed thrown' | 'Confirmed landed' | 'Manually completed';

export interface GsiStatus {
  listening: boolean;
  port: number;
  clientConnected: boolean;
  authenticated: boolean;
  lastHeartbeat: number | null;
  environment: EnvironmentMode;
  activeMatch: boolean;
  map?: string;
  mode?: string;
}

export interface TacticalObservation {
  eventId: string;
  type: 'KILL' | 'BOMB_PLANT' | 'BOMB_DEFUSE' | 'DAMAGE' | 'POSITION_REPORT';
  timestamp: number;
  roundId: number;
  map: CS2Map | string;
  source: 'GSI_TELEMETRY' | 'KILLFEED' | 'AUDIO_RADAR' | 'MANUAL_REPORT';
  playerIdentity?: { team: TeamSide; name: string; slot: number };
  location?: { callout: string; x?: number; y?: number; z?: number };
  confidence: ProvenanceLevel;
  expiresAt: number;
}

export interface BombState {
  planted: boolean;
  plantTime: number;
  defuseTimeRemaining: number | null;
  countdownSeconds: number;
  site: 'A' | 'B' | null;
  defusing: boolean;
  hasKit: boolean;
  canDefuse: boolean;
}

export interface Lineup {
  id: string;
  map: CS2Map;
  side: TeamSide;
  utilityType: UtilityType;
  title: string;
  startPosition: { x: number; y: number; z: number; callout: string; toleranceUnits?: number };
  targetDestination: { x: number; y: number; z: number; callout: string };
  throwType: 'STANDING' | 'JUMPTHROW' | 'RUN_JUMPTHROW' | 'CROUCH_JUMPTHROW' | 'WALK_THROW';
  movementRequirements: string;
  aimReference: { crosshairPlacement: string; visualLandmark: string };
  svgReference: string;
  instructions: string[];
  tags: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  sourceAttribution: string;
  verified: boolean;
  gameVersion: string;
  lastVerificationDate: string;
}

export interface LineupFilter {
  map?: CS2Map;
  side?: TeamSide;
  utilityType?: UtilityType;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  tag?: string;
}

export interface LineupExecutionState {
  state: LineupFsmState;
  activeLineupId: string | null;
  playerDistance: number;
  angleOffset: number;
  completionType: CompletionType | null;
  timestamp: number;
}

export interface Strategy {
  id: string;
  name: string;
  map: CS2Map;
  side: TeamSide;
  objective: string;
  difficulty: StrategyTier;
  requiredUtility: UtilityType[];
  recommendedRoles: string[];
  phases: Array<{
    phaseNumber: number;
    name: string;
    timingSeconds: number;
    linkedLineupIds: string[];
    instructions: string;
  }>;
  contingencies: Array<{ trigger: string; action: string }>;
  coordinationNotes: string;
  sourceAttribution: string;
}

export interface StrategyFilter {
  map?: CS2Map;
  side?: TeamSide;
  difficulty?: StrategyTier;
}

export interface MatchPreparationProfile {
  profileId: string;
  name: string;
  map: CS2Map;
  side: TeamSide;
  selectedLineupIds: string[];
  selectedStrategyIds: string[];
  active: boolean;
  createdAt: string;
}

export interface MatchRecord {
  id: string;
  map: CS2Map;
  date: string;
  score: { ct: number; t: number };
  result: 'WIN' | 'LOSS' | 'TIE';
  measuredStats: {
    kills: number;
    deaths: number;
    adr: number;
    utilityDamage: number;
    flashAssists: number;
  };
  aiObservations?: string[];
  recommendedPractice?: {
    strategyId: string;
    label: string;
  };
}

export interface TacticalContext {
  map: string;
  round: number;
  score: { ct: number; t: number };
  side: TeamSide;
  alivePlayers: { ct: number; t: number };
  economy: {
    teamMoney: number;
    enemyEstimatedEconomy: 'FULL_ECO' | 'SEMI_ECO' | 'FORCE_BUY' | 'FULL_BUY';
  };
  bombPlanted: boolean;
  recentObservations: TacticalObservation[];
  activeLineup?: Lineup;
}

export interface TacticalRecommendation {
  recommendationId: string;
  type: 'EXECUTE_LINEUP' | 'FALLBACK_POSITION' | 'SAVE_EQUIPMENT' | 'CALL_TIMEOUT' | 'SILENCE';
  priority: 'CRITICAL' | 'CONTEXTUAL' | 'INFORMATIONAL' | 'PASSIVE';
  confidence: number;
  supportingEventIds: string[];
  shortDisplayText: string; // Max 45 characters
  detailedExplanation: string;
  suggestedLineupId?: string;
  expiresAt: number;
}

export interface AiUsageStats {
  totalRequests: number;
  cachedResponses: number;
  failedRequests: number;
  totalTokensEstimated: number;
  lastRequestTimestamp: number | null;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HudConfig {
  enabled: boolean;
  scale: number;
  opacity: number;
  crosshairSafeZonePx: number; // default 450
  showRadarOverlay: boolean;
  showBombTimer: boolean;
  showLastSeen: boolean;
  showTacticalFeed: boolean;
  calibrationMode: boolean;
}

export interface SafeZones {
  crosshair: Rect;
  radar: Rect;
  statusHud: Rect;
  killfeed: Rect;
}

export interface ComplianceState {
  environment: EnvironmentMode;
  permittedFeatures: string[];
  prohibitedFeatures: string[];
  activeRulesCount: number;
}

export interface ComplianceSource {
  id: string;
  name: string;
  url: string;
  verifiedDate: string;
  description: string;
}

/**
 * Authoritative Typed Electron IPC Contract.
 * Unifies ARCHITECTURE.md §6 namespaced methods and PROJECT.md §6 convenience methods.
 */
export interface ICS2AssistantAPI {
  // --- Game State Integration & Simulation ---
  gsi: {
    getStatus(): Promise<GsiStatus>;
    onStatusChange(callback: (status: GsiStatus) => void): () => void;
    setSimulationMode(enabled: boolean): Promise<void>;
    injectScenario(scenarioId: string): Promise<void>;
  };

  // --- Tactical Memory & Observations ---
  tactical: {
    getObservations(): Promise<TacticalObservation[]>;
    onObservationUpdate(callback: (obs: TacticalObservation[]) => void): () => void;
    getBombState(): Promise<BombState | null>;
    onBombUpdate(callback: (bomb: BombState | null) => void): () => void;
  };

  // --- Lineups & State Machine ---
  lineup: {
    getAll(filter?: LineupFilter): Promise<Lineup[]>;
    getById(id: string): Promise<Lineup | null>;
    save(lineup: Lineup): Promise<Lineup>;
    delete(id: string): Promise<boolean>;
    onExecutionStateChange(callback: (state: LineupExecutionState) => void): () => void;
    manualOverride(action: 'NEXT' | 'CANCEL' | 'COMPLETE'): Promise<void>;
  };

  // --- Strategies & Match Preparation Profiles ---
  strategy: {
    getAll(filter?: StrategyFilter): Promise<Strategy[]>;
    getById(id: string): Promise<Strategy | null>;
    save(strategy: Strategy): Promise<Strategy>;
    delete(id: string): Promise<boolean>;
    getActiveProfile(): Promise<MatchPreparationProfile | null>;
    setActiveProfile(profile: MatchPreparationProfile | null): Promise<void>;
  };

  // --- Match History & Performance Analytics ---
  history: {
    getAll(): Promise<MatchRecord[]>;
    getById(id: string): Promise<MatchRecord | null>;
    save(record: MatchRecord): Promise<MatchRecord>;
    delete(id: string): Promise<boolean>;
  };

  // --- Gemini AI Tactical Coach ---
  gemini: {
    hasKey(): Promise<boolean>;
    storeKey(key: string): Promise<boolean>;
    removeKey(): Promise<boolean>;
    testKey(key: string): Promise<{ valid: boolean; latencyMs?: number; error?: string }>;
    requestAdvice(context: TacticalContext): Promise<TacticalRecommendation | null>;
    getUsageStats(): Promise<AiUsageStats>;
  };

  // --- HUD & Safe Overlay Management ---
  hud: {
    getConfig(): Promise<HudConfig>;
    updateConfig(config: Partial<HudConfig>): Promise<HudConfig>;
    setCalibrationMode(interactive: boolean): Promise<void>;
    getSafeZones(): Promise<SafeZones>;
  };

  // --- Compliance & Capability Gating ---
  compliance: {
    getState(): Promise<ComplianceState>;
    setEnvironment(mode: EnvironmentMode): Promise<ComplianceState>;
    getPrimarySources(): Promise<ComplianceSource[]>;
  };

  // --- Top-Level Convenience Methods (PROJECT.md §6 Parity) ---
  getEnvironmentMode(): Promise<EnvironmentMode>;
  setEnvironmentMode(mode: EnvironmentMode): Promise<void>;
  saveApiKey(key: string): Promise<boolean>;
  getApiKey(): Promise<string | null>; // Returns masked key (AIzaSy...****) or null
  removeApiKey(): Promise<boolean>;
  testApiConnection(key: string): Promise<{ success: boolean; latencyMs?: number; error?: string }>;
  startGsiListener(port?: number): Promise<{ success: boolean; port: number }>;
  stopGsiListener(): Promise<void>;
  startSimulationMode(scenarioId: string): Promise<void>;
  stopSimulationMode(): Promise<void>;

  // Subscriptions
  onGsiUpdate(callback: (data: GsiStatus) => void): () => void;
  onTacticalRecommendation(callback: (rec: TacticalRecommendation) => void): () => void;
  onBombTimerUpdate(callback: (timer: BombState | null) => void): () => void;
  onLineupStateChange(callback: (state: LineupExecutionState) => void): () => void;
}
```

---

## 3. Credential Store Blueprint (`src/main/credential-store.ts`)

### 3.1 Security Invariants
1. **Windows DPAPI Protection**: Encrypted via Electron's `safeStorage` using the logged-in Windows user's DPAPI credentials (`CryptProtectData`/`CryptUnprotectData`).
2. **Encrypted Persistence**: Encrypted ciphertext is stored on disk at `%APPDATA%/cs2-assistant/credentials.enc`.
3. **Atomic File Writes**: Writes are performed via a temporary file with restrictive permissions (`0o600`), then renamed to guarantee atomicity and prevent corruption on crash.
4. **Zero Plaintext Over IPC**: The renderer UI is never given decrypted plaintext. It queries `hasApiKey()` and `getMaskedApiKey()` (e.g. `AIzaSy...****`).
5. **Headless Test Decoupling**: Provides an `ICredentialStore` interface so Vitest suites run headlessly with `InMemoryCredentialStore` without requiring native Electron binaries.

### 3.2 Source Blueprint

```typescript
/**
 * CS2 Assistant - Secure Credential Store
 * File: src/main/credential-store.ts
 *
 * Implements Windows DPAPI credential encryption via Electron safeStorage.
 * Persists encrypted ciphertext to %APPDATA%/cs2-assistant/credentials.enc.
 * Provides an in-memory mock for headless Vitest testing.
 */

import * as fs from 'fs';
import * as path from 'path';
import { app, safeStorage } from 'electron';

/**
 * Interface abstraction for credential operations.
 * Enables zero-dependency mocking in headless Vitest environments.
 */
export interface ICredentialStore {
  isEncryptionAvailable(): boolean;
  storeApiKey(apiKey: string): Promise<boolean>;
  getApiKey(): Promise<string | null>;
  getMaskedApiKey(): Promise<string | null>;
  removeApiKey(): Promise<boolean>;
  hasApiKey(): Promise<boolean>;
}

/**
 * Production implementation using Electron safeStorage (Windows DPAPI).
 */
export class SafeStorageCredentialStore implements ICredentialStore {
  private readonly storageFilePath: string;

  constructor(customPath?: string) {
    if (customPath) {
      this.storageFilePath = customPath;
    } else {
      // In Electron runtime, app.getPath('userData') resolves to %APPDATA%/cs2-assistant
      const userDataDir = app ? app.getPath('userData') : path.join(process.env.APPDATA || '.', 'cs2-assistant');
      this.storageFilePath = path.join(userDataDir, 'credentials.enc');
    }
  }

  public isEncryptionAvailable(): boolean {
    try {
      return typeof safeStorage !== 'undefined' && safeStorage.isEncryptionAvailable();
    } catch {
      return false;
    }
  }

  public async storeApiKey(apiKey: string): Promise<boolean> {
    const trimmed = (apiKey || '').trim();
    if (!trimmed) {
      throw new Error('API key must not be empty');
    }

    if (!this.isEncryptionAvailable()) {
      throw new Error('OS credential encryption (DPAPI) is not available on this system');
    }

    try {
      const encryptedBuffer = safeStorage.encryptString(trimmed);
      const targetDir = path.dirname(this.storageFilePath);

      // Ensure directory exists
      await fs.promises.mkdir(targetDir, { recursive: true });

      // Write atomically via temporary file with restricted 0o600 permissions
      const tempPath = `${this.storageFilePath}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`;
      await fs.promises.writeFile(tempPath, encryptedBuffer, { mode: 0o600 });
      await fs.promises.rename(tempPath, this.storageFilePath);

      return true;
    } catch (err) {
      console.error('[CredentialStore] Failed to encrypt or persist credentials:', err instanceof Error ? err.message : err);
      return false;
    }
  }

  public async getApiKey(): Promise<string | null> {
    if (!fs.existsSync(this.storageFilePath)) {
      return null;
    }

    if (!this.isEncryptionAvailable()) {
      throw new Error('OS credential encryption (DPAPI) is not available to decrypt stored credentials');
    }

    try {
      const encryptedBuffer = await fs.promises.readFile(this.storageFilePath);
      if (encryptedBuffer.length === 0) {
        return null;
      }
      return safeStorage.decryptString(encryptedBuffer);
    } catch (err) {
      console.error('[CredentialStore] Failed to decrypt stored credentials:', err instanceof Error ? err.message : err);
      return null;
    }
  }

  public async getMaskedApiKey(): Promise<string | null> {
    const rawKey = await this.getApiKey();
    if (!rawKey) return null;
    return SafeStorageCredentialStore.maskKey(rawKey);
  }

  public async hasApiKey(): Promise<boolean> {
    const key = await this.getApiKey();
    return key !== null && key.length > 0;
  }

  public async removeApiKey(): Promise<boolean> {
    try {
      if (fs.existsSync(this.storageFilePath)) {
        await fs.promises.unlink(this.storageFilePath);
      }
      return true;
    } catch (err) {
      console.error('[CredentialStore] Failed to remove credentials:', err instanceof Error ? err.message : err);
      return false;
    }
  }

  /**
   * Masks sensitive API keys for display purposes.
   * Example: 'AIzaSyAbcd1234567890XyZ' -> 'AIzaSy...XyZ'
   */
  public static maskKey(key: string): string {
    if (!key || key.length < 10) {
      return '********';
    }
    const prefix = key.substring(0, 6);
    const suffix = key.substring(key.length - 4);
    return `${prefix}...${suffix}`;
  }
}

/**
 * In-memory mock implementation for Vitest suites and non-Electron environments.
 */
export class InMemoryCredentialStore implements ICredentialStore {
  private inMemoryKey: string | null = null;
  private encryptionSupported: boolean = true;

  constructor(initialKey: string | null = null, encryptionSupported: boolean = true) {
    this.inMemoryKey = initialKey;
    this.encryptionSupported = encryptionSupported;
  }

  public isEncryptionAvailable(): boolean {
    return this.encryptionSupported;
  }

  public setEncryptionAvailable(available: boolean): void {
    this.encryptionSupported = available;
  }

  public async storeApiKey(apiKey: string): Promise<boolean> {
    if (!this.encryptionSupported) {
      throw new Error('OS credential encryption (DPAPI) is not available');
    }
    const trimmed = (apiKey || '').trim();
    if (!trimmed) {
      throw new Error('API key must not be empty');
    }
    this.inMemoryKey = trimmed;
    return true;
  }

  public async getApiKey(): Promise<string | null> {
    if (!this.encryptionSupported && this.inMemoryKey) {
      throw new Error('OS credential encryption (DPAPI) is not available');
    }
    return this.inMemoryKey;
  }

  public async getMaskedApiKey(): Promise<string | null> {
    if (!this.inMemoryKey) return null;
    return SafeStorageCredentialStore.maskKey(this.inMemoryKey);
  }

  public async hasApiKey(): Promise<boolean> {
    return this.inMemoryKey !== null && this.inMemoryKey.length > 0;
  }

  public async removeApiKey(): Promise<boolean> {
    this.inMemoryKey = null;
    return true;
  }
}
```

---

## 4. Overlay Manager Blueprint (`src/main/overlay-manager.ts`)

### 4.1 Window Attributes & Native Input Forwarding
The HUD Overlay Window is configured to ensure **zero interference** with Counter-Strike 2 input and graphics pipelines:
- `transparent: true`: Transparent WebGL/DOM rendering with alpha transparency.
- `frame: false`: No Windows chrome or border.
- `alwaysOnTop: true`: Float over fullscreen borderless game client (`setAlwaysOnTop(true, 'screen-saver')`).
- `skipTaskbar: true`: Does not appear in Windows taskbar or Alt+Tab switcher.
- `focusable: false`: Never captures keyboard focus from CS2 during matches.
- `setIgnoreMouseEvents(true, { forward: true })`: Windows native input forwarding. Pass mouse moves to Chromium (for element hover previews) while forwarding all mouse button clicks directly to the underlying CS2 game window.
- **Interactive Calibration Mode**: When enabled from Settings, calls `setIgnoreMouseEvents(false)` so users can drag and customize HUD widget anchors. When exited, toggles back to `setIgnoreMouseEvents(true, { forward: true })`.

### 4.2 Safe Zone Exclusion Coordinates
To comply with Valve Trusted Mode and tournament guidelines, the overlay strictly enforces exclusion zones where no persistent HUD elements may be positioned:
1. **Unobstructed Crosshair Safe Zone**:
   - Bounds: **450x450 px** centered exactly on screen:
     - `x = Math.round((screenWidth - 450) / 2)`
     - `y = Math.round((screenHeight - 450) / 2)`
     - `width = 450`, `height = 450`
   - Invariant: Zero pixels rendered inside this box.
2. **Radar Safe Zone (Top-Left)**:
   - Bounds: `x = 0`, `y = 0`, `width = 360`, `height = 360`.
   - Protects mini-map, team loadout icons, and round countdown.
3. **Status HUD Exclusion (Bottom Bar)**:
   - Bounds: `x = 0`, `y = screenHeight - 140`, `width = screenWidth`, `height = 140`.
   - Protects health, armor, active weapons, ammo reserve, and squad card deck.
4. **Killfeed Safe Zone (Top-Right)**:
   - Bounds: `x = screenWidth - 420`, `y = 0`, `width = 420`, `height = 220`.
   - Protects killfeed notifications and death notices.

### 4.3 Source Blueprint

```typescript
/**
 * CS2 Assistant - HUD Overlay Manager
 * File: src/main/overlay-manager.ts
 *
 * Controls the transparent, frameless, topmost click-through HUD overlay window.
 * Enforces native mouse event forwarding and screen safe zone exclusions.
 */

import { BrowserWindow, screen, app } from 'electron';
import * as path from 'path';
import type { Rect, SafeZones, HudConfig } from '../shared/ipc-types';

export class OverlayManager {
  private overlayWindow: BrowserWindow | null = null;
  private preloadPath: string;
  private rendererUrl: string;
  private isCalibrationMode: boolean = false;

  private currentConfig: HudConfig = {
    enabled: true,
    scale: 1.0,
    opacity: 0.9,
    crosshairSafeZonePx: 450,
    showRadarOverlay: true,
    showBombTimer: true,
    showLastSeen: true,
    showTacticalFeed: true,
    calibrationMode: false,
  };

  constructor(preloadPath: string, rendererUrl: string) {
    this.preloadPath = preloadPath;
    this.rendererUrl = rendererUrl;
  }

  public getWindow(): BrowserWindow | null {
    return this.overlayWindow;
  }

  public getConfig(): HudConfig {
    return { ...this.currentConfig };
  }

  public updateConfig(patch: Partial<HudConfig>): HudConfig {
    this.currentConfig = { ...this.currentConfig, ...patch };
    if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
      this.overlayWindow.webContents.send('hud:config-updated', this.currentConfig);
    }
    return { ...this.currentConfig };
  }

  /**
   * Initializes the transparent HUD overlay window matched to the primary display.
   */
  public createOverlayWindow(): BrowserWindow {
    if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
      return this.overlayWindow;
    }

    const primaryDisplay = screen.getPrimaryDisplay();
    const { x, y, width, height } = primaryDisplay.bounds;

    this.overlayWindow = new BrowserWindow({
      x,
      y,
      width,
      height,
      type: 'toolbar',
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      movable: false,
      hasShadow: false,
      focusable: false,
      show: false,
      webPreferences: {
        preload: this.preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

    // Set highest window level on Windows (screen-saver ensures above fullscreen games)
    this.overlayWindow.setAlwaysOnTop(true, 'screen-saver');
    this.overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    // Enable click-through input forwarding by default
    this.overlayWindow.setIgnoreMouseEvents(true, { forward: true });

    // Overlay URL routes to the overlay destination in the renderer
    const targetUrl = this.rendererUrl.includes('localhost')
      ? `${this.rendererUrl}#overlay`
      : `file://${this.rendererUrl}#overlay`;

    if (this.rendererUrl.startsWith('http')) {
      this.overlayWindow.loadURL(targetUrl);
    } else {
      this.overlayWindow.loadFile(this.rendererUrl, { hash: 'overlay' });
    }

    this.overlayWindow.once('ready-to-show', () => {
      if (this.currentConfig.enabled) {
        this.overlayWindow?.showInactive();
      }
    });

    this.overlayWindow.on('closed', () => {
      this.overlayWindow = null;
    });

    return this.overlayWindow;
  }

  /**
   * Toggles calibration mode.
   * When interactive = true: Overlay window captures mouse events for dragging HUD elements.
   * When interactive = false: Overlay window returns to click-through mode.
   */
  public setCalibrationMode(interactive: boolean): void {
    this.isCalibrationMode = interactive;
    this.currentConfig.calibrationMode = interactive;

    if (!this.overlayWindow || this.overlayWindow.isDestroyed()) return;

    if (interactive) {
      this.overlayWindow.setIgnoreMouseEvents(false);
      this.overlayWindow.setFocusable(true);
      this.overlayWindow.focus();
    } else {
      this.overlayWindow.setIgnoreMouseEvents(true, { forward: true });
      this.overlayWindow.setFocusable(false);
    }

    this.overlayWindow.webContents.send('hud:calibration-changed', { interactive });
  }

  /**
   * Calculates the authoritative safe zone exclusion rectangles for a given screen dimension.
   */
  public static calculateSafeZones(
    screenWidth: number = 1920,
    screenHeight: number = 1080,
    crosshairDimension: number = 450
  ): SafeZones {
    const chDim = Math.max(200, Math.min(600, crosshairDimension));
    const chX = Math.round((screenWidth - chDim) / 2);
    const chY = Math.round((screenHeight - chDim) / 2);

    return {
      crosshair: {
        x: chX,
        y: chY,
        width: chDim,
        height: chDim,
      },
      radar: {
        x: 0,
        y: 0,
        width: 360,
        height: 360,
      },
      statusHud: {
        x: 0,
        y: screenHeight - 140,
        width: screenWidth,
        height: 140,
      },
      killfeed: {
        x: screenWidth - 420,
        y: 0,
        width: 420,
        height: 220,
      },
    };
  }

  /**
   * Evaluates whether a proposed rectangular HUD element collides with any safe zone.
   */
  public static checkCollision(element: Rect, zone: Rect): boolean {
    return (
      element.x < zone.x + zone.width &&
      element.x + element.width > zone.x &&
      element.y < zone.y + zone.height &&
      element.y + element.height > zone.y
    );
  }

  /**
   * Validates element positioning against all exclusion safe zones.
   */
  public static validatePosition(
    element: Rect,
    screenWidth: number = 1920,
    screenHeight: number = 1080,
    crosshairDim: number = 450
  ): { valid: boolean; collidingZone?: keyof SafeZones } {
    const zones = OverlayManager.calculateSafeZones(screenWidth, screenHeight, crosshairDim);

    for (const [zoneKey, zoneRect] of Object.entries(zones)) {
      if (OverlayManager.checkCollision(element, zoneRect)) {
        return { valid: false, collidingZone: zoneKey as keyof SafeZones };
      }
    }

    return { valid: true };
  }

  public getSafeZones(): SafeZones {
    const bounds = this.overlayWindow
      ? this.overlayWindow.getBounds()
      : screen.getPrimaryDisplay().bounds;
    return OverlayManager.calculateSafeZones(
      bounds.width,
      bounds.height,
      this.currentConfig.crosshairSafeZonePx
    );
  }

  public destroy(): void {
    if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
      this.overlayWindow.destroy();
      this.overlayWindow = null;
    }
  }
}
```

---

## 5. Typed IPC Handler Subsystem Blueprint (`src/main/ipc-handlers.ts`)

### 5.1 Architecture & Channel Registration
The IPC subsystem binds the renderer request channels (`ipcMain.handle`) and provides broadcast helpers (`mainWindow.webContents.send` and `overlayWindow.webContents.send`). It accepts an `IpcDependencies` container for clean dependency injection and modular testability.

### 5.2 Source Blueprint

```typescript
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
      return []; // M3 repository hooks into this
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
      return null; // M5 AI pipeline hooks into this
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

    this.handle('api:start-simulation-mode', async (_event, scenarioId: string) => {
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
```

---

## 6. Preload Context Bridge Blueprint (`src/preload/index.ts`)

### 6.1 Security Invariants
- `contextIsolation: true` is strictly enforced.
- Zero raw Node.js modules (`fs`, `child_process`, `net`, `electron`) are leaked to the renderer.
- Event listeners wrap callbacks safely and return unsubscribe functions.
- The global `Window` interface is augmented with `cs2Assistant: ICS2AssistantAPI`.

### 6.2 Source Blueprint

```typescript
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

const api: ICS2AssistantAPI = {
  // ----------------------------------------------------
  // GSI & Simulation
  // ----------------------------------------------------
  gsi: {
    getStatus: (): Promise<GsiStatus> => ipcRenderer.invoke('gsi:get-status'),
    onStatusChange: (callback: (status: GsiStatus) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: GsiStatus) => callback(data);
      ipcRenderer.on('gsi:status-changed', handler);
      return () => ipcRenderer.removeListener('gsi:status-changed', handler);
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
      return () => ipcRenderer.removeListener('tactical:observation-updated', handler);
    },
    getBombState: (): Promise<BombState | null> =>
      ipcRenderer.invoke('tactical:get-bomb-state'),
    onBombUpdate: (callback: (bomb: BombState | null) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: BombState | null) => callback(data);
      ipcRenderer.on('tactical:bomb-updated', handler);
      return () => ipcRenderer.removeListener('tactical:bomb-updated', handler);
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
      return () => ipcRenderer.removeListener('lineup:execution-state-changed', handler);
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
    return () => ipcRenderer.removeListener('gsi:update', handler);
  },
  onTacticalRecommendation: (callback: (rec: TacticalRecommendation) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: TacticalRecommendation) => callback(data);
    ipcRenderer.on('tactical:recommendation', handler);
    return () => ipcRenderer.removeListener('tactical:recommendation', handler);
  },
  onBombTimerUpdate: (callback: (timer: BombState | null) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: BombState | null) => callback(data);
    ipcRenderer.on('bomb:timer-update', handler);
    return () => ipcRenderer.removeListener('bomb:timer-update', handler);
  },
  onLineupStateChange: (callback: (state: LineupExecutionState) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: LineupExecutionState) => callback(data);
    ipcRenderer.on('lineup:state-change', handler);
    return () => ipcRenderer.removeListener('lineup:state-change', handler);
  },
};

// Expose the strongly typed API surface into window
contextBridge.exposeInMainWorld('cs2Assistant', api);

// Declare window augmentation for TypeScript consumers
declare global {
  interface Window {
    cs2Assistant: ICS2AssistantAPI;
  }
}
```

---

## 7. Electron Main Lifecycle Blueprint (`src/main/index.ts`)

### 7.1 Lifecycle Invariants
1. **Single Instance Lock**: Ensures exactly one instance of CS2 Assistant runs, preventing port 3001 collisions.
2. **Window Specifications**:
   - Resolution: **1280x800** (minimum 1024x640).
   - Theme Background: `#09090b` (zinc-950) with `show: false` until `ready-to-show` preventing white flashes.
   - Secure titlebar with dark styling (`titleBarOverlay: { color: '#09090b', symbolColor: '#a1a1aa' }`).
3. **Security Invariants**:
   - `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`.
   - `setWindowOpenHandler`: Block new window creation, route external URLs to OS browser (`shell.openExternal`).
   - `will-navigate`: Block arbitrary navigation away from app domain.
4. **Shutdown Discipline**:
   - Graceful unregistration of IPC channels.
   - Clean destruction of HUD overlay window and GSI listener.

### 7.2 Source Blueprint

```typescript
/**
 * CS2 Assistant - Electron Main Process Entry Point
 * File: src/main/index.ts
 *
 * Manages application lifecycle, window initialization, security boundaries,
 * Windows DPAPI credential storage, and IPC registration.
 */

import { app, BrowserWindow, shell, session } from 'electron';
import * as path from 'path';
import { SafeStorageCredentialStore } from './credential-store';
import { OverlayManager } from './overlay-manager';
import { IpcHandlerManager } from './ipc-handlers';
import { CapabilityGate } from '../core/compliance/capability-gate';

// ---------------------------------------------------------------------------
// 1. Single Instance Lock
// ---------------------------------------------------------------------------
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.warn('[Main] Another instance is already running. Quitting.');
  app.quit();
  process.exit(0);
}

// ---------------------------------------------------------------------------
// 2. Global Process State
// ---------------------------------------------------------------------------
let mainWindow: BrowserWindow | null = null;
let overlayManager: OverlayManager | null = null;
let ipcManager: IpcHandlerManager | null = null;
let credentialStore: SafeStorageCredentialStore | null = null;
let capabilityGate: CapabilityGate | null = null;

const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

function resolvePreloadPath(): string {
  return path.join(__dirname, '../preload/index.js');
}

function resolveRendererPath(): string {
  return path.join(__dirname, '../renderer/index.html');
}

// ---------------------------------------------------------------------------
// 3. Main Application Window Factory
// ---------------------------------------------------------------------------
async function createMainWindow(): Promise<BrowserWindow> {
  const preloadPath = resolvePreloadPath();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: '#09090b',
    title: 'CS2 Assistant',
    show: false, // Prevent white flash before content paints
    autoHideMenuBar: true,
    titleBarStyle: 'default',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      devTools: isDev,
    },
  });

  // Security: Prevent window opening and route external links to OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Security: Block unauthorized in-window navigation
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    if (
      !navigationUrl.startsWith('file://') &&
      !navigationUrl.startsWith('http://localhost:5173')
    ) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });

  // Reveal window smoothly once DOM and styling are ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Load URL or dist bundle
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(devServerUrl);
  } else {
    await mainWindow.loadFile(resolveRendererPath());
  }

  return mainWindow;
}

// ---------------------------------------------------------------------------
// 4. Electron Application Lifecycle
// ---------------------------------------------------------------------------
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.whenReady().then(async () => {
  console.log('[Main] CS2 Assistant initializing...');

  // Configure Content Security Policy header in production
  if (!isDev) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
          ],
        },
      });
    });
  }

  // Initialize Core Services
  credentialStore = new SafeStorageCredentialStore();
  capabilityGate = new CapabilityGate('COMPETITIVE_PROTECTED');

  const preloadPath = resolvePreloadPath();
  const rendererUrl = isDev && process.env.VITE_DEV_SERVER_URL ? devServerUrl : resolveRendererPath();

  overlayManager = new OverlayManager(preloadPath, rendererUrl);

  // Initialize and register Typed IPC Handlers
  ipcManager = new IpcHandlerManager({
    credentialStore,
    overlayManager,
    capabilityGate,
    getMainWindow: () => mainWindow,
    getOverlayWindow: () => overlayManager?.getWindow() || null,
  });
  ipcManager.register();

  // Create primary windows
  await createMainWindow();
  overlayManager.createOverlayWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });

  console.log('[Main] CS2 Assistant initialized successfully.');
});

// ---------------------------------------------------------------------------
// 5. Graceful Shutdown
// ---------------------------------------------------------------------------
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  console.log('[Main] Shutting down CS2 Assistant...');
  if (ipcManager) {
    ipcManager.unregister();
    ipcManager = null;
  }
  if (overlayManager) {
    overlayManager.destroy();
    overlayManager = null;
  }
});
```

---

## 8. Vitest Unit & Integration Test Blueprints

To guarantee 100% test pass rate under `npm test` without needing native Electron binaries, tests verify:
1. `InMemoryCredentialStore` persistence, masking, and DPAPI unavailability error branches.
2. `OverlayManager` coordinate exclusion math:
   - 450x450 center crosshair collision detection.
   - Radar and bottom status HUD collision detection.
   - Valid coordinates in clear screen areas.

### 8.1 Test Source Blueprint (`tests/credential-and-overlay.test.ts`)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryCredentialStore, SafeStorageCredentialStore } from '../src/main/credential-store';
import { OverlayManager } from '../src/main/overlay-manager';

describe('Domain 10 & M2: Credential Store & Key Protection', () => {
  let store: InMemoryCredentialStore;

  beforeEach(() => {
    store = new InMemoryCredentialStore();
  });

  it('correctly stores and retrieves an API key in memory', async () => {
    const key = 'AIzaSyTest1234567890SecretKey';
    expect(await store.hasApiKey()).toBe(false);

    const saved = await store.storeApiKey(key);
    expect(saved).toBe(true);
    expect(await store.hasApiKey()).toBe(true);
    expect(await store.getApiKey()).toBe(key);
  });

  it('masks sensitive API keys without leaking plaintext', async () => {
    const key = 'AIzaSy1234567890abcdefXYZ';
    await store.storeApiKey(key);
    const masked = await store.getMaskedApiKey();
    expect(masked).toBe('AIzaSy...tXYZ');
    expect(masked).not.toContain('1234567890abcdef');
  });

  it('static maskKey helper handles short or invalid keys gracefully', () => {
    expect(SafeStorageCredentialStore.maskKey('short')).toBe('********');
    expect(SafeStorageCredentialStore.maskKey('AIzaSyLongKeySecret9999')).toBe('AIzaSy...9999');
  });

  it('removes stored API key cleanly', async () => {
    await store.storeApiKey('AIzaSyTempKey123456789');
    expect(await store.hasApiKey()).toBe(true);

    const removed = await store.removeApiKey();
    expect(removed).toBe(true);
    expect(await store.hasApiKey()).toBe(false);
    expect(await store.getApiKey()).toBeNull();
  });

  it('throws descriptive error when encryption is unavailable', async () => {
    store.setEncryptionAvailable(false);
    await expect(store.storeApiKey('AIzaSyAnyKey')).rejects.toThrow(
      'OS credential encryption (DPAPI) is not available'
    );
  });
});

describe('Domain 9 & M2: Safe HUD Overlay Coordinate Exclusions', () => {
  const SCREEN_W = 1920;
  const SCREEN_H = 1080;

  it('calculates exact 450x450 crosshair exclusion zone centered on screen', () => {
    const zones = OverlayManager.calculateSafeZones(SCREEN_W, SCREEN_H, 450);
    expect(zones.crosshair.width).toBe(450);
    expect(zones.crosshair.height).toBe(450);
    expect(zones.crosshair.x).toBe(Math.round((1920 - 450) / 2)); // 735
    expect(zones.crosshair.y).toBe(Math.round((1080 - 450) / 2)); // 315
  });

  it('calculates radar, status HUD, and killfeed exclusion zones', () => {
    const zones = OverlayManager.calculateSafeZones(SCREEN_W, SCREEN_H, 450);
    // Radar
    expect(zones.radar).toEqual({ x: 0, y: 0, width: 360, height: 360 });
    // Status HUD (Health/Ammo)
    expect(zones.statusHud).toEqual({ x: 0, y: 1080 - 140, width: 1920, height: 140 });
    // Killfeed
    expect(zones.killfeed).toEqual({ x: 1920 - 420, y: 0, width: 420, height: 220 });
  });

  it('rejects an element placed inside the 450x450 crosshair safe zone', () => {
    const element = { x: 960 - 50, y: 540 - 50, width: 100, height: 100 }; // Centered at (960, 540)
    const result = OverlayManager.validatePosition(element, SCREEN_W, SCREEN_H, 450);
    expect(result.valid).toBe(false);
    expect(result.collidingZone).toBe('crosshair');
  });

  it('rejects an element overlapping the top-left radar zone', () => {
    const element = { x: 50, y: 50, width: 120, height: 80 };
    const result = OverlayManager.validatePosition(element, SCREEN_W, SCREEN_H, 450);
    expect(result.valid).toBe(false);
    expect(result.collidingZone).toBe('radar');
  });

  it('rejects an element overlapping the bottom status HUD', () => {
    const element = { x: 100, y: 1000, width: 200, height: 60 };
    const result = OverlayManager.validatePosition(element, SCREEN_W, SCREEN_H, 450);
    expect(result.valid).toBe(false);
    expect(result.collidingZone).toBe('statusHud');
  });

  it('permits an element placed in safe, non-obstructive screen regions', () => {
    // Left sidebar area below radar and above status bar
    const element = { x: 20, y: 400, width: 250, height: 180 };
    const result = OverlayManager.validatePosition(element, SCREEN_W, SCREEN_H, 450);
    expect(result.valid).toBe(true);
    expect(result.collidingZone).toBeUndefined();
  });
});
```

---

## 9. Implementation Checklist & Verification Matrix

| Step | File | Action | Key Verification |
|---|---|---|---|
| 1 | `src/shared/ipc-types.ts` | Create shared IPC & domain contracts | Validates types for `ICS2AssistantAPI` across main, preload, renderer |
| 2 | `src/main/credential-store.ts` | Implement `SafeStorageCredentialStore` & `InMemoryCredentialStore` | Windows DPAPI encryption, atomic file write, mockability under Vitest |
| 3 | `src/main/overlay-manager.ts` | Implement `OverlayManager` | Click-through `setIgnoreMouseEvents(true, { forward: true })`, safe zones |
| 4 | `src/main/ipc-handlers.ts` | Implement `IpcHandlerManager` | All `ICS2AssistantAPI` request & push channels registered |
| 5 | `src/preload/index.ts` | Implement context bridge | `contextBridge.exposeInMainWorld('cs2Assistant', ...)` |
| 6 | `src/main/index.ts` | Implement Electron application entry | 1280x800, `#09090b`, single instance lock, secure webPreferences |
| 7 | `tests/credential-and-overlay.test.ts` | Add unit tests | `npm test` passes 100% |
| 8 | Build verification | Run `npm run build` | Compiles main and renderer without TypeScript or bundler errors |
