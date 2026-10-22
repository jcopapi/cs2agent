# CS2 Assistant — Technical Architecture & System Specification

**Document Version**: 1.0.0  
**Target Platform**: Windows 10 / 11 (x64)  
**Technology Stack**: Electron, React 18, TypeScript 5.6, Vite 5.4, Vitest 2.1, Tailwind CSS 3.4, `@google/genai`  

---

## 1. System Topology & Architectural Philosophy

CS2 Assistant is engineered on three core architectural principles:
1. **Absolute Separation of Concerns**: Pure domain logic is decoupled from OS and UI runtimes.
2. **Non-Invasive Passive Telemetry**: The application strictly operates out-of-process, ingesting game state exclusively via official Valve HTTP GSI push events.
3. **Deterministic Fair Play Compliance**: Features are continuously gated at runtime based on the detected competitive environment.

### 1.1 High-Level Process Architecture Diagram

```
+----------------------------------------------------------------------------------------------------+
|                                    COUNTER-STRIKE 2 GAME ENGINE                                    |
|                                                                                                    |
|    CS2 Process (cs2.exe)  ──[ HTTP POST JSON Telemetry ]──>  Port 3001 (127.0.0.1)                 |
+-------------------------------------------------------------------|--------------------------------+
                                                                    |
                                                                    v
+----------------------------------------------------------------------------------------------------+
|                                      MAIN PROCESS (Node.js)                                        |
|                                                                                                    |
|  +------------------------+      +---------------------------+      +---------------------------+  |
|  |     GSI HTTP Server    | ---> | Event Engine & Normalizer | ---> |      Tactical Memory      |  |
|  | (Port 3001, Auth Token)|      | (Observation vs Interp.)  |      | (Decay, Provenance Store) |  |
|  +------------------------+      +---------------------------+      +---------------------------+  |
|              |                                                                    |                |
|              v                                                                    v                |
|  +------------------------+      +---------------------------+      +---------------------------+  |
|  |   Simulation Engine    |      |  Windows DPAPI Store      |      |   Lineup State Machine    |  |
|  | (Offline Scenarios)    |      |  (Electron safeStorage)   |      |  & Bomb Timer Synchronizer|  |
|  +------------------------+      +---------------------------+      +---------------------------+  |
|                                                                                   |                |
|  +--------------------------------------------------------------------------------+                |
|  | Window Manager: Main App Window (1440x900) & Safe HUD Overlay Window (transparent click-through)|
|  +-------------------------------------------------------------------------------------------------+
+--------------------------------------------------|-------------------------------------------------+
                                                   | IPC Channels (Strict Typed Contracts)
                                                   v
+----------------------------------------------------------------------------------------------------+
|                                    PRELOAD / CONTEXT BRIDGE                                        |
|            contextBridge.exposeInMainWorld('cs2Assistant', typedIpcBridge)                         |
+--------------------------------------------------|-------------------------------------------------+
                                                   | Isolated Context
                                                   v
+----------------------------------------------------------------------------------------------------+
|                                    RENDERER PROCESS (React 18+)                                    |
|                                                                                                    |
|  +----------------------------------------------------------------------------------------------+  |
|  | Header: CS2 Assistant Title, Live Match Status Pill, Simulation Mode Toggle, Settings Button |  |
|  +----------------------------------------------------------------------------------------------+  |
|  | Primary Navigation: [ 1. LIVE MATCH ]       [ 2. UTILITY ROOM ]       [ 3. HISTORY ]         |  |
|  +----------------------------------------------------------------------------------------------+  |
|  | Destination Views:                                                                           |  |
|  |  - LIVE MATCH: Opponent Last-Seen Tracker, Bomb Countdown, Active Lineup Step, AI Coach Feed |  |
|  |  - UTILITY ROOM: Map Selector, Strategy Library, Interactive Lineup Cards, Preparation Drawer|  |
|  |  - HISTORY: Match Logs, Measured vs Inferred Analytics, [PRACTICE — MIRAGE A RETAKE] Loop    |  |
|  +----------------------------------------------------------------------------------------------+  |
|  | Secondary Drawer/Modal: Settings, Gemini Key Config, HUD Overlay Controls, Valve Compliance  |  |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. The Four Decoupled Layers

```
c:\Users\conta\Desktop\CS2Agent/src/
├── core/         # Layer 1: Pure Headless TypeScript Domain Logic (Zero DOM/Electron)
├── main/         # Layer 2: Electron Host, GSI Server, DPAPI Storage, Window Manager
├── preload/      # Layer 3: Context Isolation Barrier & Typed IPC Bridge
└── renderer/     # Layer 4: React 18+ UI & Minimalist Dark Design System
```

### 2.1 Layer 1: Core Domain (`src/core/`)
The Core Domain is written in strict, modern TypeScript with **zero** dependencies on Electron, Node internal libraries (except standard data structures), or the browser DOM.

It encapsulates:
- **`compliance/`**: Capability Gating Engine (`ICapabilityGate`), environment detection (`COMPETITIVE_PROTECTED`, `PRACTICE_SERVER`, `SIMULATION_PREVIEW`), and the compliance matrix.
- **`match/`**: GSI parser, event normalizer, observation provenance classifier, tactical memory store, and the Palace Killer Invariance evaluator.
- **`utility/`**: Normalized Lineup database, Strategy library (Tiers: `BASIC`, `INTERMEDIATE`, `ADVANCED`, `COORDINATED`), external provider deep-links (CSNADES/Scope.gg), sanitized JSON import/export, and Match Preparation Profiles.
- **`lineup-fsm/`**: 7-stage Lineup Execution Finite State Machine with dual-radius hysteresis and 4 completion classifications.
- **`bomb-timer/`**: Millisecond-accurate synchronized countdown synchronizer with 10-second and 5-second defuse kit thresholds.
- **`hud-manager/`**: Priority Arbitrage Engine (`CRITICAL`, `CONTEXTUAL`, `INFORMATIONAL`, `PASSIVE`) and CS2 screen safe zone collision guards.
- **`ai/`**: Asynchronous Gemini Tactical Coach pipeline, tactical context compression, system prompt compiler, JSON schema validation, token budgeting, response caching, and deterministic offline fallback.
- **`history/`**: Chronological match records, evidence-based performance analytics separating measured GSI facts from AI inferences, and the closed-loop practice trigger.

**Testing Superpower**: Because `src/core/` contains no UI or Electron bindings, the entire business logic is executed headlessly in milliseconds under Vitest (`npm test`).

### 2.2 Layer 2: Main Process (`src/main/`)
The Main Process executes in Node.js and manages platform-specific resources:
- **Application Lifecycle**: Single-instance lock (`app.requestSingleInstanceLock()`) preventing duplicate instances or port collisions.
- **GSI HTTP Listener**: Native lightweight HTTP server on port 3001 receiving GSI POST payloads. Enforces authentication tokens and maintains a 15-second heartbeat timer; if no packet arrives, state switches to `INACTIVE_NO_MATCH`.
- **Simulation Subsystem**: Independent mock GSI engine generating realistic telemetry for testing and offline demonstrations without running CS2.
- **Windows DPAPI Credential Store**: Utilizes Electron's native `safeStorage` API to encrypt and decrypt the user's Gemini API key with OS-level credentials (`CryptProtectData`/`CryptUnprotectData`).
- **Window Management**: Controls the Main Application Window (1440x900) and the Transparent Click-Through HUD Overlay Window.
- **IPC Dispatchers**: Implements handlers for all typed IPC channels.

### 2.3 Layer 3: Preload Layer (`src/preload/`)
The Preload script acts as a secure cryptographic boundary between the privileged Node.js main process and the unprivileged Chromium renderer:
- Configured with `contextIsolation: true`, `nodeIntegration: false`, `sandbox: false`.
- Exposes an immutable, strongly typed API object (`window.cs2Assistant`) via `contextBridge.exposeInMainWorld`.
- Ensures no raw Node.js primitives (`fs`, `child_process`, `net`) or unvalidated IPC channels leak to the UI.

### 2.4 Layer 4: Renderer Process (`src/renderer/`)
The Renderer Process is a single-page React 18+ application built with Vite:
- **Design System**: Precision minimalist dark aesthetic featuring `#09090b` (zinc-950) base, subtle 1px `#27272a` (zinc-800) borders, restrained typography, and functional tactical color accents (Cyan, Emerald, Amber, Rose).
- **Navigation Architecture**: Landing interface with **only three primary destinations** (`LIVE MATCH`, `UTILITY ROOM`, `HISTORY`) plus a compact secondary drawer for settings and compliance inspection.
- **Reactive Subscriptions**: React hooks subscribing to typed IPC streams for live match state, bomb timer ticks, lineup state transitions, and AI coach callouts.

---

## 3. Data Flow Architecture

### 3.1 GSI Telemetry Ingress & Processing Flow

```
[CS2 Game Client]
       │
       │ (HTTP POST JSON - Port 3001)
       ▼
[GSI HTTP Server] ──(Validates Auth Token & Packet Structure)
       │
       ▼
[Event Normalizer] ──(Clamps Abnormal Bounds, Sanitizes Nodes)
       │
       ├──> [Tactical Memory]
       │       ├── Observation Provenance (CONFIRMED / REPORTED / INFERRED)
       │       ├── Palace Killer Invariance (Victim Confirmed, Killer Unconfirmed)
       │       └── Visual Staleness Decay Curve (30s Eviction)
       │
       ├──> [Bomb Timer Engine]
       │       └── Plant Event Sync -> 40s Countdown -> Kit Defusal Feasibility
       │
       └──> [Lineup State Machine]
               └── Distance / Angle Check -> Hysteresis Buffer -> State Transition
```

### 3.2 The 8-Stage Gemini Tactical Coach Pipeline

```
1. Observation Sources (GSI Ingress, Killfeed, Equipment)
       │
       ▼
2. Event Normalization & Provenance Tagging
       │
       ▼
3. Tactical Memory Integration (Round-scoped deduplication)
       │
       ▼
4. Context Builder & Compression (Transforms state to < 400 token dense summary)
       │
       ▼
5. Lineup & Strategy Matcher (Injects active Match Preparation Profile)
       │
       ▼
6. Gemini Model Query (@google/genai client.interactions.create with gemini-3.8-flash)
       │  [Fallback: Deterministic Local Offline Rule Engine if unconfigured/offline]
       ▼
7. Recommendation Validation (Strict JSON schema check & Stale-Response Rejection Guard)
       │
       ▼
8. HUD Priority Arbitrage & Presentation (Dispatches to Overlay / UI)
```

---

## 4. Security Architecture & DPAPI Safe Storage

### 4.1 Cryptographic Credential Management
Storing third-party API keys (such as Google Gemini API keys) in plain text or standard configuration files is a security violation. CS2 Assistant utilizes **Windows Data Protection API (DPAPI)**:

```
[User Input API Key]
       │
       ▼ (Typed IPC: cs2Assistant.gemini.storeKey)
[Main Process CredentialStore]
       │
       ├── Electron safeStorage.isEncryptionAvailable() (Verifies DPAPI binding)
       ├── safeStorage.encryptString(apiKey) -> Buffer
       └── Atomic Write: %APPDATA%/cs2-assistant/credentials.enc
```

### 4.2 Security Invariants
1. **Zero Plaintext at Rest**: Credentials on disk are encrypted using the Windows user login credential matrix.
2. **Zero Plaintext Across IPC**: The renderer never receives the decrypted key; it queries `cs2Assistant.gemini.hasKey()` returning `{ hasKey: boolean, maskedKey: "AIzaSy...****" }`.
3. **Zero Log Leakage**: Logging filters redact any string matching API key patterns (`AIzaSy...`).
4. **Secure Key Removal**: Invoking `removeKey()` unlinks the encrypted file from storage and zeroes in-memory string references.
5. **Headless Test Decoupling**: For Vitest execution where Electron native modules are absent, `ICredentialStore` supports an abstracted in-memory mock.

---

## 5. Safe HUD Overlay & Priority Arbitrage

### 5.1 Click-Through Transparent Window
The in-game HUD is rendered using a dedicated Electron window:
- Properties: `transparent: true`, `frame: false`, `alwaysOnTop: true`, `skipTaskbar: true`.
- Native Input Forwarding: `hudWindow.setIgnoreMouseEvents(true, { forward: true })` ensures zero mouse clicks or cursor inputs are trapped by the overlay during competitive play.
- Interactive Calibration Mode: Toggled exclusively in settings (`setIgnoreMouseEvents(false)`) allowing users to drag overlay anchors.

### 5.2 Safe Zone Exclusion Coordinates
To prevent obstructing critical game information or violating tournament rules, the screen viewport enforces strict exclusion zones:

```
+-----------------------------------------------------------------+
|  [ TOP-LEFT RADAR ZONE ]                       [ KILLFEED ZONE] |
|       (320 x 320 px)                            (400 x 200 px)  |
|                                                                 |
|                                                                 |
|                      [ CENTER CROSSHAIR ]                       |
|                         (200 x 200 px)                          |
|                       PERMANENT EXCLUSION                       |
|                                                                 |
|                                                                 |
| [ WEAPONS & AMMO ]       [ HEALTH & ARMOR ]     [ ACTIVE SQUAD] |
|                     BOTTOM ZONE (120 px height)                 |
+-----------------------------------------------------------------+
```

### 5.3 Priority Arbitrage Hierarchy
When multiple events occur simultaneously, the HUD Arbitrage Engine allocates screen real estate based on priority tiers:
1. **`CRITICAL`**: Active Bomb Timer countdown (`BOMB PLANTED 00:24`) and lethal utility warnings.
2. **`CONTEXTUAL`**: Active lineup alignment guides, triggered only when player coordinates enter the lineup's position radius.
3. **`INFORMATIONAL`**: Opponent last-known location markers with fading staleness decay.
4. **`PASSIVE`**: Match score, round phase, economy counters (hidden during active firefights).

---

## 6. Typed Electron IPC Contracts

The interface between the Renderer and Main process is governed by the strongly typed `ICS2AssistantAPI` contract:

```typescript
export interface ICS2AssistantAPI {
  // Game State Integration & Simulation
  gsi: {
    getStatus(): Promise<GsiStatus>;
    onStatusChange(callback: (status: GsiStatus) => void): () => void;
    setSimulationMode(enabled: boolean): Promise<void>;
    injectScenario(scenarioId: string): Promise<void>;
  };

  // Tactical Memory & Observations
  tactical: {
    getObservations(): Promise<TacticalObservation[]>;
    onObservationUpdate(callback: (obs: TacticalObservation[]) => void): () => void;
    getBombState(): Promise<BombState | null>;
    onBombUpdate(callback: (bomb: BombState | null) => void): () => void;
  };

  // Lineups & State Machine
  lineup: {
    getAll(filter?: LineupFilter): Promise<Lineup[]>;
    getById(id: string): Promise<Lineup | null>;
    save(lineup: Lineup): Promise<Lineup>;
    delete(id: string): Promise<boolean>;
    onExecutionStateChange(callback: (state: LineupExecutionState) => void): () => void;
    manualOverride(action: 'NEXT' | 'CANCEL' | 'COMPLETE'): Promise<void>;
  };

  // Strategies & Match Preparation Profiles
  strategy: {
    getAll(filter?: StrategyFilter): Promise<Strategy[]>;
    getById(id: string): Promise<Strategy | null>;
    save(strategy: Strategy): Promise<Strategy>;
    delete(id: string): Promise<boolean>;
    getActiveProfile(): Promise<MatchPreparationProfile | null>;
    setActiveProfile(profile: MatchPreparationProfile | null): Promise<void>;
  };

  // Match History & Performance Analytics
  history: {
    getAll(): Promise<MatchRecord[]>;
    getById(id: string): Promise<MatchRecord | null>;
    save(record: MatchRecord): Promise<MatchRecord>;
    delete(id: string): Promise<boolean>;
  };

  // Gemini AI Tactical Coach
  gemini: {
    hasKey(): Promise<boolean>;
    storeKey(key: string): Promise<boolean>;
    removeKey(): Promise<void>;
    testKey(key: string): Promise<{ valid: boolean; latencyMs?: number; error?: string }>;
    requestAdvice(context: TacticalContext): Promise<TacticalRecommendation | null>;
    getUsageStats(): Promise<AiUsageStats>;
  };

  // HUD & Safe Overlay Management
  hud: {
    getConfig(): Promise<HudConfig>;
    updateConfig(config: Partial<HudConfig>): Promise<HudConfig>;
    setCalibrationMode(interactive: boolean): Promise<void>;
  };

  // Compliance & Capability Gating
  compliance: {
    getState(): Promise<ComplianceState>;
    setEnvironment(mode: EnvironmentMode): Promise<ComplianceState>;
    getPrimarySources(): Promise<ComplianceSource[]>;
  };
}
```

---

## 7. Headless Testing Strategy (The 11 Domains)

To achieve 100% test reliability with zero UI flakiness, the core test suite executes headlessly under Vitest against `src/core/`:

| Domain | Scope | Test File | Critical Assertions |
|:---|:---|:---|:---|
| **1. Event Normalization** | GSI payload validation | `domain1-event-normalization.test.ts` | Handles missing nodes, corrupt JSON, negative health, money > $16,000. |
| **2. Observation Provenance** | Provenance attribution | `domain2-observation-provenance.test.ts` | Validates immutable tagging of `CONFIRMED`, `REPORTED`, and `INFERRED`. |
| **3. Last-Seen Decay** | Temporal visual decay | `domain3-last-seen-decay.test.ts` | Verifies opacity decay curve across 30s and round-boundary eviction. |
| **4. Tactical Confidence** | Observation vs Interpretation | `domain4-tactical-confidence.test.ts` | **Palace Killer Invariance**: Victim at Palace is confirmed; killer is NOT. |
| **5. Lineup State Machine** | 7-State FSM Transitions | `domain5-lineup-fsm.test.ts` | Verifies hysteresis buffers, angular thresholds, and 4 completion types. |
| **6. Strategy Sequencing** | Playbook execution | `domain6-strategy-sequencing.test.ts` | Validates multi-phase progression and Match Preparation Profile binding. |
| **7. Match Detection & Gating** | Lifecycle state & isolation | `domain7-match-detection-gating.test.ts` | Asserts 15s GSI timeout to standby; verifies simulation engine separation. |
| **8. AI Output Validation** | LLM validation & guards | `domain8-ai-output-validation.test.ts` | Enforces JSON schema, rejects post-round stale recommendations, falls back offline. |
| **9. Capability Gating** | Fair play environment gating | `domain9-permission-capability.test.ts` | In `COMPETITIVE_PROTECTED`, verifies crosshair overlays are suppressed. |
| **10. Persistence Layer** | Atomic disk storage | `domain10-persistence.test.ts` | Tests serialization of profiles, lineups, history, and recovers corrupt files. |
| **11. Resilience & Recovery** | Fault tolerance | `domain11-resilience-recovery.test.ts` | Recovers from GSI port conflicts, external JSON schema changes, network drops. |
