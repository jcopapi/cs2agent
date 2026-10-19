# Project: CS2 Assistant

## Architecture

CS2 Assistant is a production-grade, Valve-compliant Windows desktop tactical companion for Counter-Strike 2.
The application is structured into four decoupled layers:
1. **Core Domain (`src/core/`)**: Pure TypeScript business logic with zero Electron/DOM dependencies. Implements compliance capability gating, GSI parsing, tactical memory with event provenance, lineup execution state machine, bomb timer, Gemini coach pipeline, data schemas, and history analytics. This layer is 100% headlessly testable under Vitest across all 11 test domains.
2. **Main Process (`src/main/`)**: Electron host managing application lifecycle, local GSI HTTP listener (port 3001), DPAPI secure credential storage via Electron `safeStorage`, window management (main UI window + transparent click-through HUD overlay window), and IPC dispatch.
3. **Preload Layer (`src/preload/`)**: Context isolation barrier exposing a strictly typed, secure IPC bridge (`window.cs2Assistant`) to the renderer.
4. **Renderer Layer (`src/renderer/`)**: React 18+ desktop interface using Vite and Tailwind CSS. Implements a precision minimalist dark aesthetic (zinc-950, 1px subtle borders, typography, zero gamer-RGB clutter) featuring **only three primary navigation destinations** (`LIVE MATCH`, `UTILITY ROOM`, `HISTORY`) plus a compact secondary menu for Gemini API Key, HUD configuration, GSI settings, Compliance Matrix, and Help.

### System Diagram
```
[CS2 Game Client]
       │ (HTTP POST JSON - Port 3001)
       ▼
[Electron Main: GSI Listener] ──> [Safe Storage: DPAPI]
       │
       ▼ (Typed IPC)
[Core Domain Engine] ───────────> [Google Gemini API (@google/genai)]
       │ (Tactical Memory, FSM, Bomb Timer, Capability Gating)
       ▼
[Renderer: 3 Primary Destinations] ──> [Transparent Safe HUD Overlay]
  ├── LIVE MATCH
  ├── UTILITY ROOM
  └── HISTORY ──(Practice Retake Trigger)──> [UTILITY ROOM]
```

---

## Feature Inventory

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Git Repository & Docs | Initialized Git repo with `.gitignore`, `README.md`, `ARCHITECTURE.md`, `CHANGELOG.md` | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Valve Compliance Documentation | `COMPLIANCE.md` with 6 official primary sources, exact URLs, verification dates, Anti-Claim Invariant, and Six Zero Invariants | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Feature Compliance Matrix | Matrix classifying features into `VERIFIED PERMITTED`, `REQUIRES APPROVAL`, `PROHIBITED` | M1 | ORIGINAL_REQUEST §R1 |
| 4 | Capability Gating Engine | Active runtime gating across `COMPETITIVE_PROTECTED`, `PRACTICE_SERVER`, and `SIMULATION_PREVIEW` environments | M1 | ORIGINAL_REQUEST §R1, §R4 |
| 5 | Build & Test Tooling | Package setup with Electron, React, Vite, TypeScript, Vitest, and Tailwind CSS | M1 | ORIGINAL_REQUEST §R1 |
| 6 | Precision Dark Design System | Charcoal/zinc-950 aesthetic, 1px borders, restrained typography, keyboard navigation, zero gamer-RGB clutter | M2 | ORIGINAL_REQUEST §R2 |
| 7 | Three Primary Destinations Shell | Navigation shell featuring **only three primary destinations** (`LIVE MATCH`, `UTILITY ROOM`, `HISTORY`) | M2 | ORIGINAL_REQUEST §R2 |
| 8 | Compact Secondary Menu | Secondary drawer/menu for Settings, API Key, HUD Config, Compliance Matrix, and Help | M2 | ORIGINAL_REQUEST §R2 |
| 9 | Secure Credential Storage | OS credential encryption (Windows DPAPI via Electron safeStorage) with connection testing and key removal | M2 | ORIGINAL_REQUEST §R2 |
| 10 | Transparent HUD Overlay Window | Click-through overlay with CS2 HUD safe zone enforcement (crosshair, radar, status HUD exclusion) | M2 | ORIGINAL_REQUEST §R2, §R4 |
| 11 | Lineup Data Structure & DB | Normalized database with comprehensive lineup metadata across 6 Active Duty maps | M3 | ORIGINAL_REQUEST §R3 |
| 12 | Strategy Library & Tactical Tiers | Multi-phase strategies across `BASIC`, `INTERMEDIATE`, `ADVANCED`, `COORDINATED` tiers | M3 | ORIGINAL_REQUEST §R3 |
| 13 | Custom Lineup & Strategy Creator | Custom creation/editing, personal collections, tags, and favorites | M3 | ORIGINAL_REQUEST §R3 |
| 14 | External Provider Architecture | Zero-scraping URL generation for CSNADES and Scope.gg reference links | M3 | ORIGINAL_REQUEST §R3 |
| 15 | Schema-Validated JSON Import | Secure import/export of user-created lineups and strategies with script sanitization | M3 | ORIGINAL_REQUEST §R3 |
| 16 | Match Preparation Profiles | Planning Mode profiles binding directly into Live Match and AI context | M3 | ORIGINAL_REQUEST §R3 |
| 17 | GSI HTTP Listener & Cfg Gen | KeyValues `.cfg` generator, HTTP listener on port 3001, auth token validation, inactive match state | M4 | ORIGINAL_REQUEST §R4 |
| 18 | Simulation / Demo Mode | Dedicated offline simulation mode cleanly separated from live GSI telemetry | M4 | ORIGINAL_REQUEST §R4 |
| 19 | Event Engine & Tactical Memory | Provenance-tracked events (`CONFIRMED`, `REPORTED`, `INFERRED`), decay curves, round boundary flush | M4 | ORIGINAL_REQUEST §R4 |
| 20 | Palace Killer Invariance | Strict observation discipline: victim at Palace is confirmed, killer location is unconfirmed | M4 | ORIGINAL_REQUEST §R4 |
| 21 | Last-Known Information Overlay | Opponent last-seen annotations, elapsed seconds, visual decay, user toggle | M4 | ORIGINAL_REQUEST §R4 |
| 22 | Lineup Execution State Machine | 7 states (`INACTIVE` -> `NEARBY` -> `POSITIONING` -> `ALIGNING` -> `READY` -> `EXECUTED` -> `NEXT`), hysteresis, 4 completion types | M4 | ORIGINAL_REQUEST §R4 |
| 23 | High-Precision Bomb Timer | Plant-synchronized countdown (`BOMB PLANTED 00:24`), latency compensation, 10s/5s defuse thresholds | M4 | ORIGINAL_REQUEST §R4 |
| 24 | Global HUD Priority Arbitrage | Priority manager (`CRITICAL`, `CONTEXTUAL`, `INFORMATIONAL`, `PASSIVE`), collision avoidance, safe zones | M4 | ORIGINAL_REQUEST §R4 |
| 25 | Gemini SDK Client Integration | Official `@google/genai` (>= 2.29.1) integration with `client.interactions.create`, `gemini-3.8-flash` | M5 | ORIGINAL_REQUEST §R5 |
| 26 | Tactical AI System Prompt | System prompt enforcing identity, evidence discipline, CS2 callouts (<= 45 chars), uncertainty silence | M5 | ORIGINAL_REQUEST §R5 |
| 27 | Structured Recommendation Schema | JSON schema validated outputs (`recommendationId`, `type`, `priority`, `confidence`, `supportingEventIds`, etc.) | M5 | ORIGINAL_REQUEST §R5 |
| 28 | Asynchronous AI Pipeline & Resilience | 8-stage pipeline, context compression, rate limiting, token/cost budgeting, 5s cache, offline fallback | M5 | ORIGINAL_REQUEST §R5 |
| 29 | History Match Records & Analytics | Chronological match history with evidence-based analytics separating statistics from AI interpretation | M5 | ORIGINAL_REQUEST §R5 |
| 30 | Closed Ecosystem Loop | One-click `History -> Utility Room` practice trigger (`PRACTICE — MIRAGE A RETAKE`) completing the loop | M5 | ORIGINAL_REQUEST §R5 |
| 31 | 11-Domain Core Engine Test Suite | Exhaustive unit & integration test suite covering all 11 domains from Acceptance Criteria §16 | M6 | ORIGINAL_REQUEST §Acceptance |
| 32 | Opaque-Box E2E Test Suite (T1-T4) | Multi-tier requirement-driven opaque-box test suite passing 100% | M6 | PROJECT Pattern |
| 33 | Adversarial Coverage Hardening (T5) | White-box stress-testing, edge case verification, and forensic audit clean verdict | M6 | PROJECT Pattern |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Repository Foundation & Compliance Engine | Git init, docs (`README`, `ARCHITECTURE`, `COMPLIANCE`, `CHANGELOG`), build setup, core domain structure, Capability Gating Engine | none | DONE |
| M2 | Application Shell & Design System | Electron main/preload, React 18+ Vite UI, Minimalist Dark Design System, 3 destinations shell, secondary menu, DPAPI safeStorage, HUD overlay window | M1 | IN_PROGRESS |
| M3 | Utility Room & Strategy Library | Normalized lineups and multi-phase strategies across 6 maps, SVG diagrams, custom editor, CSNADES/Scope.gg links, JSON import/export, Match Preparation Profiles | M1 | PLANNED |
| M4 | Live Match Engine & GSI Subsystem | GSI listener & cfg generator, simulation mode, tactical memory with provenance & Palace invariance, lineup FSM, bomb timer, HUD priority arbitrage | M1, M3 | PLANNED |
| M5 | Gemini Tactical Coach & History Intelligence | `@google/genai` SDK integration, Tactical AI prompt, structured schema, async pipeline with cache/offline fallback, match history analytics, closed loop `[PRACTICE — MIRAGE A RETAKE]` | M3, M4 | PLANNED |
| M6 | Final Verification & Adversarial Hardening | 100% pass of E2E test suite (Tiers 1-4) published in `TEST_READY.md`, all 11 test domains passing under `npm test`, clean `npm run build`, Tier 5 adversarial hardening, and clean forensic audit | M1-M5, TEST_READY | PLANNED |

---

## Interface Contracts

### 1. Capability Gating Contract (`src/core/compliance/types.ts`)
```typescript
export type EnvironmentMode = 'COMPETITIVE_PROTECTED' | 'PRACTICE_SERVER' | 'SIMULATION_PREVIEW';
export type ComplianceStatus = 'VERIFIED_PERMITTED' | 'REQUIRES_APPROVAL' | 'PROHIBITED';

export interface ICapabilityGate {
  currentEnvironment: EnvironmentMode;
  setEnvironment(env: EnvironmentMode): void;
  isFeaturePermitted(featureId: string): boolean;
  getPermittedFeatures(): string[];
}
```

### 2. Lineup & Strategy Data Contract (`src/core/utility/types.ts`)
```typescript
export type CS2Map = 'de_mirage' | 'de_inferno' | 'de_dust2' | 'de_nuke' | 'de_ancient' | 'de_anubis';
export type TeamSide = 'CT' | 'T' | 'BOTH';
export type UtilityType = 'SMOKE' | 'FLASHBANG' | 'HE_GRENADE' | 'MOLOTOV_INCENDIARY';
export type StrategyTier = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'COORDINATED';

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

export interface Strategy {
  id: string;
  name: string;
  map: CS2Map;
  side: TeamSide;
  objective: string;
  difficulty: StrategyTier;
  requiredUtility: UtilityType[];
  recommendedRoles: string[];
  phases: Array<{ phaseNumber: number; name: string; timingSeconds: number; linkedLineupIds: string[]; instructions: string }>;
  contingencies: Array<{ trigger: string; action: string }>;
  coordinationNotes: string;
  sourceAttribution: string;
}
```

### 3. Tactical Memory & GSI Contract (`src/core/match/types.ts`)
```typescript
export type ProvenanceLevel = 'CONFIRMED' | 'REPORTED' | 'INFERRED';

export interface TacticalObservation {
  eventId: string;
  type: 'KILL' | 'BOMB_PLANT' | 'BOMB_DEFUSE' | 'DAMAGE' | 'POSITION_REPORT';
  timestamp: number;
  roundId: number;
  map: CS2Map;
  source: 'GSI_TELEMETRY' | 'KILLFEED' | 'AUDIO_RADAR' | 'MANUAL_REPORT';
  playerIdentity?: { team: TeamSide; name: string; slot: number };
  location?: { callout: string; x?: number; y?: number; z?: number };
  confidence: ProvenanceLevel;
  expiresAt: number;
}
```

### 4. Lineup State Machine Contract (`src/core/lineup-fsm/types.ts`)
```typescript
export type LineupFsmState = 'INACTIVE' | 'NEARBY' | 'POSITIONING' | 'ALIGNING' | 'READY' | 'EXECUTED' | 'NEXT';
export type CompletionType = 'Attempted' | 'Confirmed thrown' | 'Confirmed landed' | 'Manually completed';
```

### 5. Gemini AI Tactical Coach Contract (`src/core/ai/types.ts`)
```typescript
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
```

### 6. Typed Electron IPC Contract (`src/preload/index.ts`)
```typescript
export interface ICS2AssistantAPI {
  // Navigation & Config
  getEnvironmentMode(): Promise<EnvironmentMode>;
  setEnvironmentMode(mode: EnvironmentMode): Promise<void>;
  
  // Credentials (DPAPI)
  saveApiKey(key: string): Promise<boolean>;
  getApiKey(): Promise<string | null>;
  removeApiKey(): Promise<boolean>;
  testApiConnection(key: string): Promise<{ success: boolean; latencyMs?: number; error?: string }>;
  
  // GSI Telemetry & Simulation
  startGsiListener(port?: number): Promise<{ success: boolean; port: number }>;
  stopGsiListener(): Promise<void>;
  startSimulationMode(scenarioId: string): Promise<void>;
  stopSimulationMode(): Promise<void>;
  
  // Subscriptions
  onGsiUpdate(callback: (data: any) => void): () => void;
  onTacticalRecommendation(callback: (rec: TacticalRecommendation) => void): () => void;
  onBombTimerUpdate(callback: (timer: any) => void): () => void;
  onLineupStateChange(callback: (state: any) => void): () => void;
}
```

---

## Code Layout

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
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── src/
│   ├── core/                      # Pure headless TypeScript domain logic
│   │   ├── compliance/            # Capability Gating, sources, invariants
│   │   ├── utility/               # Lineups DB, Strategies, Profiles, JSON parser
│   │   ├── match/                 # GSI parser, Tactical Memory, Provenance
│   │   ├── lineup-fsm/            # 7-state FSM, dual-radius hysteresis
│   │   ├── bomb-timer/            # High-precision synchronized timer
│   │   ├── hud-manager/           # Priority arbitrage, safe zones
│   │   ├── ai/                    # @google/genai client, prompt, offline fallback
│   │   └── history/               # Match records, performance analytics, loop trigger
│   ├── main/                      # Electron main process
│   │   ├── index.ts               # Electron lifecycle, window creation
│   │   ├── gsi-listener.ts        # HTTP listener on port 3001
│   │   ├── credential-store.ts    # Windows DPAPI safeStorage wrapper
│   │   ├── overlay-manager.ts     # Transparent HUD overlay window
│   │   └── ipc-handlers.ts        # IPC bridge handlers
│   ├── preload/                   # Electron preload scripts
│   │   └── index.ts               # contextBridge typed API
│   └── renderer/                  # React 18+ Vite application
│       ├── index.tsx              # App root
│       ├── App.tsx                # 3 Destinations router & layout
│       ├── styles/                # Tailwind minimalist dark styling
│       ├── components/            # Precision minimalist UI components
│       │   ├── common/            # Buttons, Badges, Modals, Sliders
│       │   ├── navigation/        # 3 Primary Destinations navbar, Secondary Menu
│       │   ├── live-match/        # Live dashboard, Bomb Timer, FSM visualizer
│       │   ├── utility-room/      # Lineup browser, Strategy viewer, Creator, SVG
│       │   ├── history/           # Match analytics, Practice Retake 1-click trigger
│       │   └── hud-overlay/       # In-game HUD overlay component
│       └── hooks/                 # React state hooks & IPC subscriptions
└── tests/                         # Vitest automated test suite (11 domains)
    ├── domain1-event-normalization.test.ts
    ├── domain2-observation-provenance.test.ts
    ├── domain3-last-seen-decay.test.ts
    ├── domain4-tactical-confidence.test.ts
    ├── domain5-lineup-fsm.test.ts
    ├── domain6-strategy-sequencing.test.ts
    ├── domain7-match-detection-gating.test.ts
    ├── domain8-ai-output-validation.test.ts
    ├── domain9-permission-capability.test.ts
    ├── domain10-persistence.test.ts
    ├── domain11-resilience-recovery.test.ts
    └── e2e/                       # Opaque-box E2E test runner and scenarios
        ├── runner.ts
        ├── tier1-feature-coverage.test.ts
        ├── tier2-boundary-corner.test.ts
        ├── tier3-pairwise-combinations.test.ts
        └── tier4-real-world-scenarios.test.ts
```
