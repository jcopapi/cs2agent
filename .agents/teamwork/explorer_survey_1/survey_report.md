# CS2 Assistant — Technical Architecture, Stack, and Greenfield Survey Report

**Author**: `explorer_survey_1` (Teamwork Explorer)  
**Date**: 2026-10-19  
**Milestone**: 0 (Survey & Architectural Specification)  
**Target Project**: `cs2-assistant` (`c:\Users\conta\Desktop\CS2Agent`)  

---

## 1. Executive Summary & Greenfield Workspace Survey

### 1.1 Current Workspace State
An inspection of `c:\Users\conta\Desktop\CS2Agent` reveals a completely greenfield workspace:
- **Git Status**: No Git repository is currently initialized (`fatal: not a git repository`).
- **Files Present**: Only `.agents/` (teamwork metadata and task logs) and `ORIGINAL_REQUEST.md` (authoritative specification).
- **Environment**:
  - Windows OS (PowerShell shell environment).
  - Node.js runtime: **v24.21.0**.
  - Package manager: **npm 11.19.0**.
  - Version control: **git version 2.56.0.windows.1**.
  - Package registry connectivity: Verified (`npm ping` PONG 287ms).

### 1.2 Greenfield Initialization Requirements
To achieve a clean, standardized, production-ready foundation, the implementation team must execute the following initial setup:
1. **Git Repository Setup**:
   - Execute `git init` in `c:\Users\conta\Desktop\CS2Agent`.
   - Configure `.gitignore` to prevent committing build artifacts, cache directories, or secrets:
     ```gitignore
     node_modules/
     dist/
     out/
     release/
     *.local
     .env
     .env.*
     npm-debug.log*
     yarn-debug.log*
     yarn-error.log*
     coverage/
     .vite/
     *.tsbuildinfo
     ```
2. **Root Governance and Architectural Files**:
   - `README.md`: Project summary, architecture, quickstart (`npm install`, `npm test`, `npm run build`, `npm run dev`), system requirements, zero-injection compliance guarantee.
   - `ARCHITECTURE.md`: Process model (Main, Preload, Renderer), event flow, GSI pipeline, DPAPI credential store, safe HUD overlay arbitrage, and state management.
   - `COMPLIANCE.md`: Valve & Steam primary source documentation with exact URLs, verification dates, and the 3-tier capability matrix (`VERIFIED PERMITTED`, `REQUIRES APPROVAL`, `PROHIBITED`).
   - `CHANGELOG.md`: Standard Keep-a-Changelog structure recording incremental milestones.
   - `PROJECT.md`: Project plan, decomposition milestones, interface contracts, and directory layout enforcement.

---

## 2. Technical Stack & Package Specification

The project requires zero compromise between developer ergonomics, runtime speed, anti-cheat compliance, and robust testability.

### 2.1 Core Dependency Matrix

| Category | Package | Version | Justification |
| :--- | :--- | :--- | :--- |
| **Desktop Framework** | `electron` | `^33.2.1` | Stable Chromium/Node runtime for Windows desktop with native DPAPI via `safeStorage`. |
| **UI Framework** | `react`, `react-dom` | `^18.3.1` | Battle-tested component lifecycle, fast rendering, concurrent rendering support. |
| **AI Tactical Coach** | `@google/genai` | `^2.30.0` | Official Google Gen AI SDK (satisfies `>= 2.29.1`), supports `client.interactions.create` with `gemini-3.8-flash` and structured JSON schema output. |
| **Bundler / Dev Server** | `vite` | `^5.4.11` | Instant HMR, ESM native dev server, optimized production bundling. |
| **React Vite Plugin** | `@vitejs/plugin-react` | `^4.3.3` | Fast JSX/TSX compilation with Fast Refresh. |
| **Language & Typings** | `typescript` | `^5.6.3` | Strict type safety across main, preload, core domain, and renderer. |
| **Test Runner** | `vitest` | `^2.1.4` | Blazing fast ESM-native test runner with out-of-the-box TypeScript support, compatible with Jest DOM. |
| **Testing Utilities** | `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` | `^16.0.1`, `^6.6.2`, `^25.0.1` | Accessible DOM assertions and headless React component testing for all test domains. |
| **Styling & Design System** | `tailwindcss`, `postcss`, `autoprefixer` | `^3.4.14`, `^8.4.47`, `^10.4.20` | Minimalist dark palette styling, predictable utility classes, zero CSS bloat. |
| **Icons & Utilities** | `lucide-react`, `clsx`, `tailwind-merge` | `^1.59.0`, `^2.1.1`, `^3.0.0` | Restrained geometric icons, clean conditional class merging. |
| **Desktop Packager** | `electron-builder` | `^25.1.8` | Standard Windows NSIS and portable installer generator. |

### 2.2 Native Windows DPAPI & Security Architecture
- **Elimination of node-gyp risk**: Rather than relying on external unmaintained C++ native addons (like `node-dpapi` or `keytar` which often fail compilation on modern Node 24+ without Visual Studio build tools), the application utilizes Electron's built-in `electron.safeStorage` API.
- **Under the hood**: On Windows, `safeStorage.encryptString()` and `safeStorage.decryptString()` directly call Windows Cryptography Architecture / DPAPI (`CryptProtectData` and `CryptUnprotectData`), tied to the current Windows user login.
- **Test environment compatibility**: In pure Node/Vitest environments where Electron's `safeStorage` is unavailable, the application uses an abstracted `ICredentialStore` with a fallback `InMemoryCredentialStore` or encrypted file mock, ensuring 100% test pass rate in headless test runs.

---

## 3. High-Level Process Architecture

```
+----------------------------------------------------------------------------------------------------+
|                                      MAIN PROCESS (Node.js)                                        |
|                                                                                                    |
|  +------------------------+      +---------------------------+      +---------------------------+  |
|  |     GSI HTTP Server    | ---> | Event Engine & Normalizer | ---> |      Tactical Memory      |  |
|  | (Port 3001, Auth Token)|      | (Observation vs Interp.)  |      | (Decay, Provenance Store) |  |
|  +------------------------+      +---------------------------+      +---------------------------+  |
|              ^                                                                    |                |
|              | (HTTP POST)                                                        v                |
|  +------------------------+      +---------------------------+      +---------------------------+  |
|  | CS2 Game / Simulation  |      |   DPAPI Credential Store  |      |   Lineup State Machine    |  |
|  | (gamestate_integration)|      | (safeStorage / API Keys)  |      |  & Bomb Timer Synchronizer|  |
|  +------------------------+      +---------------------------+      +---------------------------+  |
|                                                                                   |                |
|  +--------------------------------------------------------------------------------+                |
|  | Window Manager: MainWindow (1440x900) & Safe HUD Overlay Window (transparent, click-through)    |
|  +-------------------------------------------------------------------------------------------------+
+--------------------------------------------------|-------------------------------------------------+
                                                   | IPC Channels (Typed Contracts)
                                                   v
+----------------------------------------------------------------------------------------------------+
|                                    PRELOAD / CONTEXT BRIDGE                                        |
|  contextBridge.exposeInMainWorld('api', { gsi, tactical, lineup, strategy, history, gemini, hud }) |
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

## 4. Main Process Architecture (`src/main/`)

### 4.1 Entry Point & Lifecycle (`src/main/index.ts`)
- Configures single-instance lock (`app.requestSingleInstanceLock()`) to prevent duplicate GSI port collisions.
- Sequentially boots subsystems:
  1. `CredentialStore`: Initializes DPAPI `safeStorage` (with fallback provider detection).
  2. `GsiServer`: Spawns lightweight native Node `http.createServer` on port 3001.
  3. `TacticalMemory`: In-memory round-scoped state manager with automatic garbage collection on round end.
  4. `LineupStateMachine`: Hysteresis-governed 7-stage engine.
  5. `BombTimer`: High-resolution plant countdown tracker with latency compensation.
  6. `WindowManager`: Creates the Main Application Window and HUD Overlay Window.
  7. `IpcDispatcher`: Mounts all strongly typed IPC handlers.

### 4.2 Safe HUD Overlay Manager (`src/main/window/hud-overlay-manager.ts`)
- **Transparency & Positioning**:
  - `transparent: true`, `frame: false`, `alwaysOnTop: true`, `skipTaskbar: true`.
  - Level: `setAlwaysOnTop(true, 'screen-saver')`.
- **Zero Input Interference**:
  - In Live Match Mode: `hudWindow.setIgnoreMouseEvents(true, { forward: true })`, ensuring the HUD never absorbs clicks or interferes with mouse aim.
  - In Configuration / Calibration Mode: `hudWindow.setIgnoreMouseEvents(false)` so users can drag or scale overlay anchors.
- **Safe Zone Collision Protection**:
  - Screen dimensions are partitioned with rigid exclusion zones:
    - **Crosshair Zone**: Center 200x200px box is permanently blacklisted. No HUD element can occupy or overlap this coordinate area.
    - **Radar Zone**: Top-left 320x320px exclusion zone (CS2 radar position).
    - **Killfeed Zone**: Top-right 400x200px exclusion zone.
    - **Weapon & Health HUD**: Bottom 120px exclusion zone across the viewport width.
- **Priority Arbitrage**:
  - Prioritizes content into four strict tiers:
    1. `CRITICAL`: Active Bomb Timer countdown (`BOMB PLANTED 00:24`) and lethal utility alerts.
    2. `CONTEXTUAL`: Lineup execution guide (alignment reference, throw indicator) displayed only when player position matches a lineup threshold.
    3. `INFORMATIONAL`: Opponent last-known location pills with fading staleness decay.
    4. `PASSIVE`: Round status, score, inactive when match is silent.

### 4.3 GSI HTTP Listener (`src/main/gsi/gsi-server.ts`)
- Native Node.js `http.createServer` handling `POST` requests.
- Port: Configurable, default `3001` (avoids common React dev port 3000).
- Authentication: Compares `req.headers['authorization']` or JSON `auth.token` against the configured local secret token.
- High-throughput buffer parsing: Ingests raw chunks, parses JSON safely with `try/catch` and malformed data filters.
- Heartbeat & Capability Gating:
  - If no GSI payload is received for > 15 seconds, marks state `INACTIVE_NO_MATCH` and silences all overlay rendering.
- Dedicated Simulation Engine (`src/main/gsi/gsi-simulation.ts`):
  - Completely decoupled from the live network listener.
  - Injects pre-recorded or synthetic match scenarios for Mirage, Inferno, Dust2 with round transitions, plant countdowns, and kill events for safe testing and demonstration.

### 4.4 Windows DPAPI Credential Store (`src/main/security/credential-store.ts`)
- **Storage Location**: `%APPDATA%/cs2-assistant/credentials.enc`.
- **Encryption**: Uses `safeStorage.encryptString(apiKey)` before writing to disk.
- **Decryption**: `safeStorage.decryptString(buffer)` on app launch or when instantiating the Gemini Tactical Coach client.
- **Security Invariants**:
  - The API key is NEVER logged to stdout, stderr, or log files.
  - The API key is NEVER transmitted across unencrypted IPC; renderer only receives a masked string (`AIzaSy...****`) and a boolean `hasKey: boolean`.
  - Clean deletion via `removeKey()` removes the encrypted file from disk and zeroes in-memory buffers.

---

## 5. Preload Script & Context Bridge (`src/preload/index.ts`)

Strict Electron security rules are enforced:
- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: false` (to bridge native IPC securely)

### 5.1 Typed IPC API Contract (`src/shared/types/ipc.ts`)

```typescript
export interface ICS2AssistantAPI {
  // Game State Integration
  gsi: {
    getStatus: () => Promise<GsiStatus>;
    onStatusChange: (callback: (status: GsiStatus) => void) => () => void;
    setSimulationMode: (enabled: boolean) => Promise<void>;
    injectScenario: (scenarioId: string) => Promise<void>;
  };

  // Tactical Memory & Observations
  tactical: {
    getObservations: () => Promise<TacticalObservation[]>;
    onObservationUpdate: (callback: (obs: TacticalObservation[]) => void) => () => void;
    getBombState: () => Promise<BombState | null>;
    onBombUpdate: (callback: (bomb: BombState | null) => void) => () => void;
  };

  // Lineup & Execution State Machine
  lineup: {
    getAll: (filter?: LineupFilter) => Promise<Lineup[]>;
    getById: (id: string) => Promise<Lineup | null>;
    save: (lineup: Lineup) => Promise<Lineup>;
    delete: (id: string) => Promise<boolean>;
    onExecutionStateChange: (callback: (state: LineupExecutionState) => void) => () => void;
    manualOverride: (action: 'NEXT' | 'CANCEL' | 'COMPLETE') => Promise<void>;
  };

  // Strategy & Preparation Profiles
  strategy: {
    getAll: (filter?: StrategyFilter) => Promise<Strategy[]>;
    getById: (id: string) => Promise<Strategy | null>;
    save: (strategy: Strategy) => Promise<Strategy>;
    delete: (id: string) => Promise<boolean>;
    getActiveProfile: () => Promise<MatchPreparationProfile | null>;
    setActiveProfile: (profile: MatchPreparationProfile | null) => Promise<void>;
  };

  // Match History & Analytics
  history: {
    getAll: () => Promise<MatchRecord[]>;
    getById: (id: string) => Promise<MatchRecord | null>;
    save: (record: MatchRecord) => Promise<MatchRecord>;
    delete: (id: string) => Promise<boolean>;
  };

  // Gemini AI Tactical Coach
  gemini: {
    hasKey: () => Promise<boolean>;
    storeKey: (key: string) => Promise<boolean>;
    removeKey: () => Promise<void>;
    testKey: (key: string) => Promise<{ valid: boolean; error?: string }>;
    requestAdvice: (context: TacticalContext) => Promise<AiTacticalAdvice | null>;
    getUsageStats: () => Promise<AiUsageStats>;
  };

  // HUD & Safe Overlay
  hud: {
    getConfig: () => Promise<HudConfig>;
    updateConfig: (config: Partial<HudConfig>) => Promise<HudConfig>;
    setCalibrationMode: (interactive: boolean) => Promise<void>;
  };

  // Compliance & Runtime Gating
  compliance: {
    getStatus: () => Promise<ComplianceState>;
    setEnvironment: (mode: EnvironmentMode) => Promise<ComplianceState>;
    getPrimarySources: () => Promise<ComplianceSource[]>;
  };
}
```

---

## 6. Renderer Process & Design System (`src/renderer/`)

### 6.1 Minimalist Dark Design System
Adheres to a precision minimalist dark aesthetic designed for competitive players:
- **Palette**:
  - Background Base: `#09090b` (zinc-950)
  - Surface Container: `#121215` (dark charcoal)
  - Panel & Card Background: `#18181c`
  - Subtle Borders: `1px solid #27272a` (zinc-800)
  - Text Primary: `#f4f4f5` (zinc-100)
  - Text Secondary: `#a1a1aa` (zinc-400)
  - Text Muted: `#71717a` (zinc-500)
- **Functional Tactical Accents** (strictly no gamer-RGB clutter):
  - Cyan (`#06b6d4` / `#22d3ee`): Tactical positioning, lineups, utility paths.
  - Emerald (`#10b981`): Confirmed observations, successful execution, verified status.
  - Amber (`#f59e0b`): Reported observations, intermediate states, caution.
  - Rose (`#f43f5e`): Bomb plant countdown, lethal danger, critical alerts.
- **Typography**: Clean monospace accents for coordinates/timers (`font-mono`), legible sans-serif for descriptions (`font-sans`).
- **Keyboard Navigation**: Native `Tab`, `Arrow` keys, shortcuts (`1` = Live, `2` = Utility, `3` = History, `Ctrl+,` = Settings).

### 6.2 Top Header Bar
- Title: **CS2 ASSISTANT** (clean typography, no oversized logos).
- Live Match Status Pill:
  - When Live: Green dot `LIVE MATCH` — `MIRAGE` — `CT 8 : 7 T`.
  - When Simulating: Amber dot `SIMULATION MODE` — `INFERNO` — `TEST SCENARIO`.
  - When Inactive: Grey dot `STANDBY — WAITING FOR CS2 MATCH`.
- Fast Actions:
  - Simulation Toggle: Instantly toggle demonstration mode on/off.
  - Settings Icon: Opens compact secondary drawer/modal.
  - Window control buttons (min, max, close).

### 6.3 The Three Primary Destinations

#### 1. LIVE MATCH (`/live`)
- **Opponent Last-Known Information**:
  - Opponents list with last-known callout (e.g. `B Apartments`, `Palace`, `Mid Doors`).
  - Elapsed seconds timer with visual decay (opacity fades from 1.0 down to 0.2 over 30 seconds).
  - Provenance badges: `CONFIRMED` (green), `REPORTED` (amber), `INFERRED` (cyan).
  - Strict discipline: If Player Y kills Player X at Palace, victim X is marked at Palace; killer Y location is marked `UNCONFIRMED`.
- **Bomb Timer Synchronizer**:
  - Active 40-second C4 countdown: `BOMB PLANTED 00:24`.
  - Color transitions: Green (> 20s) -> Amber (10s - 20s) -> Pulsing Rose (< 10s).
  - 10-second (no kit) and 5-second (kit) defuse feasibility markers.
  - Automatic removal upon defusal, explosion, or round reset.
- **Active Lineup Execution State Machine**:
  - Displays the active lineup for current player position:
    - Current State pill: `INACTIVE` -> `NEARBY` -> `POSITIONING` -> `ALIGNING` -> `READY` -> `EXECUTED` -> `NEXT`.
    - Compact SVG aim crosshair diagram with step-by-step cue.
    - Throw technique indicator (Jumpthrow, Stand, Run).
    - Completion status buttons: `[Attempted]`, `[Confirmed Thrown]`, `[Confirmed Landed]`, `[Manual Skip]`.
- **Gemini Tactical Coach Live Feed**:
  - Streamlined, non-intrusive callouts generated via `@google/genai`.
  - Tactical advice card: Recommendation type (`RETREAT`, `ROTATE`, `EXECUTE`, `SAVE`), confidence score (`92%`), supporting evidence citations.
  - Expandable "Reasoning" toggle and explicit fallback state when offline.

#### 2. UTILITY ROOM (`/utility`)
- **Interactive Map Selector**: Mirage, Inferno, Dust2, Nuke, Ancient, Anubis.
- **Side & Utility Filters**: CT / T, Smoke, Flashbang, HE Grenade, Molotov/Incendiary.
- **Strategy Library**:
  - Structured tactical plays tiered into `BASIC`, `INTERMEDIATE`, `ADVANCED`, `COORDINATED`.
  - Multi-phase execution stages, assigned roles, linked lineups, timing requirements, and failure contingencies.
- **Lineup Card & Explorer**:
  - Start position, target destination, throw type, movement requirement, aim reference, compact visual SVG diagram.
  - Verification badge (Valve game version, last verified date).
  - "Add to Favorites" and "Add to Match Profile" buttons.
- **Custom Lineup & Strategy Creator**: Modal for adding custom personal lineups with tag support.
- **External Provider Architecture**:
  - Safe URL references to CSNADES and Scope.gg.
  - User-provided JSON file import (with schema validation, zero web scraping).
- **Match Preparation Profiles**:
  - Side drawer allowing users to assemble an active profile (e.g. "Mirage A-Site Offensive Smoke Pack & Retake Protocol").
  - Seamlessly binds directly into the Live Match Engine and Gemini Coach context!

#### 3. HISTORY (`/history`)
- **Chronological Match Records**: List of past matches with date, map, score, and performance indicators.
- **Evidence-Based Analytics**:
  - Strict separation: **Measured Statistics** (K/D, utility damage, flash duration, bomb plants) vs **AI Inferred Interpretations** (tactical decision efficiency, positioning risks).
- **Tactical Improvement Insights**: Post-match analysis identifying recurring tactical vulnerabilities (e.g. "Low success rate on Mirage B site retakes when smokes are exhausted").
- **The One-Click Practice Ecosystem Loop**:
  - Prominent action button: **`[PRACTICE — MIRAGE A RETAKE]`**.
  - Clicking this button immediately routes to the **Utility Room**, automatically selecting map `Mirage`, filtering to `A Site Retake`, and opening the exact linked lineup sequence!
  - Fully closes the operational loop: `UTILITY ROOM -> LIVE MATCH -> HISTORY -> UTILITY ROOM`.

### 6.4 Compact Secondary Settings Menus
- Accessible via subtle header button (`Ctrl+,`):
  1. **Gemini API Key Configuration**:
     - Masked input field.
     - Saves securely to OS credential store via Windows DPAPI.
     - "Test Connection" button calling `ai.models.generateContent` or `ai.interactions.create` with lightweight probe.
     - "Remove Key" button.
     - Status indicator (Key Active / Missing / Invalid).
  2. **HUD & Safe Overlay Configuration**:
     - HUD Opacity (20% - 100%) and Scaling (0.8x - 1.4x) sliders.
     - Safe Zone Guides overlay toggle.
     - Interactive Calibration Mode toggle (allows moving HUD anchors).
  3. **GSI Configuration**:
     - Port selector (default 3001).
     - Auth token input / generator.
     - "Generate CS2 Config" helper creating `gamestate_integration_cs2agent.cfg` for CS2 installation directory.
  4. **Compliance & Capability Settings**:
     - Environment Mode selector:
       - `COMPETITIVE_PROTECTED` (strictest gating, HUD passive, zero sound/input cues).
       - `PRACTICE_SERVER` (full interactive lineup execution guides, trajectory hints).
       - `SIMULATION_PREVIEW` (full simulation mode with demo data).
     - Live Capability Matrix table (`VERIFIED PERMITTED`, `REQUIRES APPROVAL`, `PROHIBITED`).
  5. **Help & Documentation**:
     - Exact links to official Valve Steam Subscriber Agreement, CS2 Trusted Mode FAQ, VAC, and GSI wiki.
     - Anti-cheat compliance certification.

---

## 7. Build System & Packaging Configuration

### 7.1 Unified Scripts in `package.json`

```json
{
  "name": "cs2-assistant",
  "version": "1.0.0",
  "private": true,
  "description": "Production-grade, Valve-compliant Windows desktop tactical companion for Counter-Strike 2",
  "main": "dist/main/index.js",
  "scripts": {
    "dev": "vite",
    "build:main": "tsc -p tsconfig.node.json",
    "build:renderer": "vite build",
    "build": "npm run build:main && npm run build:renderer",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "tsc --noEmit",
    "package": "npm run build && electron-builder"
  }
}
```

### 7.2 TypeScript Configuration

- **`tsconfig.json`** (Base configuration with project references):
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "NodeNext",
      "moduleResolution": "NodeNext",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true,
      "resolveJsonModule": true
    },
    "files": [],
    "references": [
      { "path": "./tsconfig.node.json" },
      { "path": "./tsconfig.web.json" }
    ]
  }
  ```

- **`tsconfig.node.json`** (For Main, Preload, and Core Domain logic):
  ```json
  {
    "compilerOptions": {
      "composite": true,
      "target": "ES2022",
      "module": "NodeNext",
      "moduleResolution": "NodeNext",
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true
    },
    "include": ["src/main/**/*", "src/preload/**/*", "src/core/**/*", "src/shared/**/*"]
  }
  ```

- **`tsconfig.web.json`** (For React Renderer and Components):
  ```json
  {
    "compilerOptions": {
      "composite": true,
      "target": "ES2022",
      "useDefineForClassFields": true,
      "lib": ["DOM", "DOM.Iterable", "ES2022"],
      "module": "ESNext",
      "skipLibCheck": true,
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": false,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "jsx": "react-jsx",
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true
    },
    "include": ["src/renderer/**/*", "src/shared/**/*"]
  }
  ```

### 7.3 Vite Configuration (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'src/renderer'),
  base: './',
  build: {
    outDir: path.resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@renderer': path.resolve(__dirname, 'src/renderer'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@core': path.resolve(__dirname, 'src/core'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
```

### 7.4 Vitest Configuration (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/core/**/*', 'src/shared/**/*'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@core': path.resolve(__dirname, 'src/core'),
    },
  },
});
```

---

## 8. Modular Architecture & The 11 Test Domains

To guarantee zero-compromise automated testing (`npm test`), the core logic (`src/core/`) is completely decoupled from Electron windowing and the live CS2 process. All 11 required domains map to isolated, deterministic unit/integration suites:

| Domain | Description & Requirements | Test Implementation File | Key Assertions / Edge Cases |
| :--- | :--- | :--- | :--- |
| **1. Event Normalization** | Normalizes incoming raw GSI payloads; handles malformed, partial, or unexpected types without throwing. | `src/tests/domain1-event-normalization.test.ts` | Validates missing nodes, corrupted JSON strings, negative timers, unexpected steamID types, weapon arrays. |
| **2. Observation Provenance** | Tags all tactical observations with provenance (`CONFIRMED`, `REPORTED`, `INFERRED`), source, timestamp, and confidence. | `src/tests/domain2-observation-provenance.test.ts` | Ensures provenance cannot be altered downstream; verifies immutable event ID and timestamp assignment. |
| **3. Last-Seen Expiration & Decay** | Computes visual opacity staleness decay curve (1.0 down to 0.0) over configurable duration; purges expired observations. | `src/tests/domain3-last-seen-decay.test.ts` | Asserts linear/exponential decay formula, exact 30s expiration, round-transition purge. |
| **4. Tactical Confidence & Interpretation Discipline** | Strictly distinguishes observation from interpretation. When Player X dies at Palace and Player Y kills them: victim X location is CONFIRMED at Palace; killer Y location is NOT at Palace. | `src/tests/domain4-tactical-confidence.test.ts` | **Critical Test**: Ingest kill event where victim was at Palace. Assert victim observation is CONFIRMED at Palace. Assert killer observation does NOT confirm killer at Palace. |
| **5. Lineup State Machine** | Governs transitions (`INACTIVE` -> `NEARBY` -> `POSITIONING` -> `ALIGNING` -> `READY` -> `EXECUTED` -> `NEXT`) with hysteresis and completion types (`Attempted`, `Confirmed thrown`, `Confirmed landed`, `Manually completed`). | `src/tests/domain5-lineup-state-machine.test.ts` | Tests hysteresis threshold buffer to prevent rapid state oscillation near distance boundaries; tests manual override skip. |
| **6. Strategy Sequencing & Profile Binding** | Multi-phase strategy coordination and binding of active Match Preparation Profiles to live match context. | `src/tests/domain6-strategy-sequencing.test.ts` | Validates phase advancement when required lineups are executed; asserts profile correctly binds when map matches. |
| **7. Match Detection & Capability Gating** | Inactive standby state when no match is present, separation of live GSI from simulation mode, graceful disconnect recovery. | `src/tests/domain7-match-detection-gating.test.ts` | Asserts timeout after 15s GSI silence; verifies simulation engine operates completely isolated from live GSI socket. |
| **8. AI Output Validation** | Validates Gemini structured output schema (`recommendationId`, `type`, `priority`, `confidence`, etc.), rejects stale responses arriving after round end, handles offline gracefully. | `src/tests/domain8-ai-output-validation.test.ts` | Mocks Gemini response; rejects schema violations; rejects responses whose `roundId` does not match active round; verifies fallback. |
| **9. Permission & Environment Gating** | Enforces capability matrix across `COMPETITIVE_PROTECTED`, `PRACTICE_SERVER`, `SIMULATION_PREVIEW`. | `src/tests/domain9-capability-gating.test.ts` | In `COMPETITIVE_PROTECTED`, asserts trajectory guides and audio cues are blocked. In `PRACTICE_SERVER`, asserts full guides are enabled. |
| **10. Persistence Layer** | Persistence of user settings, favorites, custom lineups, collections, preparation profiles, and match history. | `src/tests/domain10-persistence-layer.test.ts` | Tests file read/write roundtrips, atomic saving, corrupted file recovery. |
| **11. Fault Recovery & Resilience** | Recovery from malformed HTTP payloads, network drops, provider JSON format changes, and HUD overlay re-initialization. | `src/tests/domain11-fault-resilience.test.ts` | Injects corrupt CSNADES/Scope.gg JSON format shifts; asserts parser produces clear error without crashing. |

---

## 9. End-to-End Operational Workflow Loop

The application architecture fulfills the end-to-end loop:
$$\text{UTILITY ROOM} \longrightarrow \text{LIVE MATCH} \longrightarrow \text{HISTORY} \longrightarrow \text{UTILITY ROOM}$$

```
Step 1: Preparation (UTILITY ROOM)
  - User reviews Mirage A-Site Retake strategy and lineups.
  - Adds smoke and flashbang lineups to the active "Match Preparation Profile".

Step 2: Execution (LIVE MATCH)
  - CS2 match detected on Mirage. The engine automatically binds the Preparation Profile.
  - As player approaches A Ticket booth, the Lineup State Machine triggers: NEARBY -> POSITIONING -> ALIGNING -> READY.
  - Bomb planted event synchronizes the 40s countdown timer.
  - Gemini Tactical Coach suggests a retake timing window based on remaining utility.

Step 3: Reflection (HISTORY)
  - Post-match record is saved.
  - Measured stats (utility damage, round duration) are cataloged alongside AI coaching notes.
  - An identified weakness ("Slow A Retake Smokes") displays an action badge:
    [ PRACTICE — MIRAGE A RETAKE ]

Step 4: Re-entry (Loop Complete)
  - Clicking [ PRACTICE — MIRAGE A RETAKE ] navigates directly back into the UTILITY ROOM with Mirage A Retake pre-filtered and queued for practice!
```

---

## 10. Complete Recommended Project Directory Tree

```
c:\Users\conta\Desktop\CS2Agent/
├── .gitignore
├── README.md
├── ARCHITECTURE.md
├── COMPLIANCE.md
├── CHANGELOG.md
├── PROJECT.md
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.web.json
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── src/
│   ├── main/
│   │   ├── index.ts
│   │   ├── gsi/
│   │   │   ├── gsi-server.ts
│   │   │   ├── gsi-authenticator.ts
│   │   │   ├── gsi-detector.ts
│   │   │   └── gsi-simulation.ts
│   │   ├── security/
│   │   │   ├── credential-store.ts
│   │   │   └── key-validator.ts
│   │   ├── window/
│   │   │   ├── window-manager.ts
│   │   │   └── hud-overlay-manager.ts
│   │   └── ipc/
│   │       ├── ipc-handlers.ts
│   │       └── ipc-broadcaster.ts
│   ├── preload/
│   │   └── index.ts
│   ├── core/
│   │   ├── compliance/
│   │   │   ├── compliance-matrix.ts
│   │   │   ├── capability-gate.ts
│   │   │   └── anti-cheat-rules.ts
│   │   ├── event-engine/
│   │   │   ├── event-normalizer.ts
│   │   │   ├── observation-provenance.ts
│   │   │   └── decay-calculator.ts
│   │   ├── tactical-memory/
│   │   │   ├── tactical-memory.ts
│   │   │   ├── confidence-classifier.ts
│   │   │   └── tactical-context-builder.ts
│   │   ├── lineup-engine/
│   │   │   ├── lineup-state-machine.ts
│   │   │   ├── hysteresis.ts
│   │   │   └── completion-classifier.ts
│   │   ├── strategy-engine/
│   │   │   ├── strategy-sequencer.ts
│   │   │   └── profile-binder.ts
│   │   ├── match-detection/
│   │   │   ├── match-detector.ts
│   │   │   └── disconnect-recovery.ts
│   │   ├── ai-coach/
│   │   │   ├── gemini-client.ts
│   │   │   ├── prompt-builder.ts
│   │   │   ├── response-validator.ts
│   │   │   ├── rate-limiter.ts
│   │   │   └── fallback-advisor.ts
│   │   ├── hud/
│   │   │   ├── priority-arbitrage.ts
│   │   │   ├── safe-zones.ts
│   │   │   └── bomb-timer-calculator.ts
│   │   ├── persistence/
│   │   │   ├── local-store.ts
│   │   │   ├── lineup-repository.ts
│   │   │   └── strategy-repository.ts
│   │   └── resilience/
│   │       ├── fault-recovery.ts
│   │       └── provider-adapter.ts
│   ├── shared/
│   │   ├── types/
│   │   │   ├── gsi.ts
│   │   │   ├── tactical.ts
│   │   │   ├── lineup.ts
│   │   │   ├── strategy.ts
│   │   │   ├── profile.ts
│   │   │   ├── ai.ts
│   │   │   ├── hud.ts
│   │   │   ├── compliance.ts
│   │   │   └── ipc.ts
│   │   └── constants/
│   │       ├── maps.ts
│   │       ├── callouts.ts
│   │       └── compliance-sources.ts
│   ├── renderer/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── PrimaryNav.tsx
│   │   │   │   └── SafeZoneGuide.tsx
│   │   │   ├── destinations/
│   │   │   │   ├── live/
│   │   │   │   │   ├── LiveMatchView.tsx
│   │   │   │   │   ├── LastKnownOverlay.tsx
│   │   │   │   │   ├── BombTimerWidget.tsx
│   │   │   │   │   ├── LineupExecutionGuide.tsx
│   │   │   │   │   └── AiCoachFeed.tsx
│   │   │   │   ├── utility/
│   │   │   │   │   ├── UtilityRoomView.tsx
│   │   │   │   │   ├── MapSelector.tsx
│   │   │   │   │   ├── LineupCard.tsx
│   │   │   │   │   ├── LineupDetailModal.tsx
│   │   │   │   │   ├── StrategyLibrary.tsx
│   │   │   │   │   ├── MatchPreparationDrawer.tsx
│   │   │   │   │   └── ExternalImportModal.tsx
│   │   │   │   └── history/
│   │   │   │       ├── HistoryView.tsx
│   │   │   │       ├── MatchCard.tsx
│   │   │   │       ├── PerformanceAnalytics.tsx
│   │   │   │       └── PracticeLoopButton.tsx
│   │   │   └── settings/
│   │   │       ├── SettingsModal.tsx
│   │   │       ├── GeminiKeyConfig.tsx
│   │   │       ├── HudConfigPanel.tsx
│   │   │       ├── GsiConfigPanel.tsx
│   │   │       └── ComplianceModal.tsx
│   │   └── hooks/
│   │       ├── useGsiState.ts
│   │       ├── useTacticalMemory.ts
│   │       ├── useLineupStateMachine.ts
│   │       ├── useGeminiCoach.ts
│   │       └── useMatchPreparation.ts
│   └── tests/
│       ├── setup.ts
│       ├── domain1-event-normalization.test.ts
│       ├── domain2-observation-provenance.test.ts
│       ├── domain3-last-seen-decay.test.ts
│       ├── domain4-tactical-confidence.test.ts
│       ├── domain5-lineup-state-machine.test.ts
│       ├── domain6-strategy-sequencing.test.ts
│       ├── domain7-match-detection-gating.test.ts
│       ├── domain8-ai-output-validation.test.ts
│       ├── domain9-capability-gating.test.ts
│       ├── domain10-persistence-layer.test.ts
│       ├── domain11-fault-resilience.test.ts
│       └── e2e-workflow-loop.test.ts
```

---

## 11. Conclusion & Actionable Next Steps

1. **Orchestrator Milestone Decompositions**:
   - **Milestone 1**: Greenfield initialization (`git init`, `.gitignore`, `package.json`, `tsconfig*.json`, `vite.config.ts`, `vitest.config.ts`, `README.md`, `ARCHITECTURE.md`, `COMPLIANCE.md`, `CHANGELOG.md`).
   - **Milestone 2**: Shared types, core domain engines (Event Normalizer, Tactical Memory, Lineup State Machine, Bomb Timer, Capability Gates, Resilience) + Automated Tests for Domains 1-7, 9-11.
   - **Milestone 3**: Electron Main Process (GSI HTTP server, DPAPI safeStorage, safe transparent HUD window) and Preload typed IPC bridge.
   - **Milestone 4**: Gemini Tactical Coach integration (`@google/genai` >= 2.30.0, `interactions.create`, prompt compression, JSON schema validation, offline fallback) + Domain 8 tests.
   - **Milestone 5**: Minimalist Dark UI (Header, 3 Primary Destinations, Settings Drawer, Practice Loop) + End-to-End Workflow Verification + Clean Build (`npm run build` & `npm test`).
