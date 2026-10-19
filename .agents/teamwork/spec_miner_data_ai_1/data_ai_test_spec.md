# CS2 Assistant — Data, Tactical AI, and Test Domain Specification
**Document Version:** 1.0.0  
**Target Architecture:** Electron + React + TypeScript + Vite  
**Author:** spec_miner_data_ai_1  
**Authoritative Reference:** `ORIGINAL_REQUEST.md` (Requirements R1, R2, R3, R4, R5, Acceptance Criteria 1-11)

---

## Executive Summary

This specification establishes the authoritative engineering contracts, data schemas, algorithmic state machines, prompt designs, and comprehensive test domain requirements for three core subsystems of **CS2 Assistant**:
1. **Utility Room & Strategy Library**: Pre-populated and custom utility lineups, multi-phase tactical strategies across 4 tiers (`BASIC`, `INTERMEDIATE`, `ADVANCED`, `COORDINATED`), 6 active competitive maps, external provider reference architecture without web scraping, and Match Preparation Profiles.
2. **Gemini Tactical Coach & History Performance Intelligence**: Official `@google/genai` (>= 2.29.1) integration using `client.interactions.create` with `gemini-3.8-flash`, structured JSON schema enforcement, strict tactical system prompt, asynchronous pipeline with context compression, token/cost budgeting, stale-response rejection, and the closed `HISTORY → UTILITY ROOM` practice loop.
3. **Core Engine Automated Test Suite (11 Domains)**: Rigorous test specifications defining exact inputs, expected behaviors, edge cases, and failure modes for all 11 test domains defined in Section 16 of the Acceptance Criteria.

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Utility Library | Competitive Map Taxonomy | Canonical definition of the 6 Active Duty maps (Mirage, Inferno, Dust2, Nuke, Ancient, Anubis) with standard callouts and coordinates | Map ID string (`de_mirage`, etc.) | Normalized map model with callout bounding volumes | Throws `UnknownMapError` for unsupported maps | ORIGINAL_REQUEST.md § R3 |
| 2 | Utility Library | Lineup Data Schema | Fully typed metadata structure for smokes, flashes, molotovs, HEs, and decoys | Raw Lineup Object / JSON | Validated `Lineup` domain model with unique slug | Validation error array if mandatory fields missing | ORIGINAL_REQUEST.md § R3 |
| 3 | Utility Library | Compact Vector / SVG Crosshair Reference | Visual alignment HUD element rendered via SVG paths without raster image bloat | Landmark coordinates and offset vector | Scalable SVG XML string / React SVG component | Fallback to text alignment landmark if SVG missing | ORIGINAL_REQUEST.md § R3 |
| 4 | Strategy Library | Multi-Phase Strategy Schema | Multi-player tactical execute/retake playbook structured across sequential time-window phases | Raw Strategy JSON | Validated `Strategy` model with linked lineups | Rejects if linked lineups do not exist in library | ORIGINAL_REQUEST.md § R3 |
| 5 | Strategy Library | Tactical Strategy Tiers | Categorization of strategies into `BASIC`, `INTERMEDIATE`, `ADVANCED`, and `COORDINATED` | Tier string / Player count / Utility count | Validated tier enum with complexity requirements | Throws validation error if tier prerequisites unmet | ORIGINAL_REQUEST.md § R3 |
| 6 | Custom Utility | Lineup & Strategy CRUD | User creation, editing, tagging, cloning, and deletion of custom lineups/strategies | Lineup / Strategy payload | Persisted user entity in local storage / SQLite | Emits duplicate ID error, rejects invalid coordinates | ORIGINAL_REQUEST.md § R3 |
| 7 | Custom Utility | Favorites & Collections | Organization of lineups and entire strategies into personal named collections and favorites | Entity ID, Collection ID, favorite boolean | Updated collection manifests and favorite indices | Safe no-op on duplicate addition, not-found error on removal | ORIGINAL_REQUEST.md § R3 |
| 8 | External Provider | Non-Scraping Reference Architecture | Authorized deep links to CSNADES and Scope.gg plus manual JSON imports without web scraping | Provider name, lineup metadata or import JSON | Canonical URL string or imported Lineup model | Schema validation error on corrupt import; zero network scraping | ORIGINAL_REQUEST.md § R3 |
| 9 | Match Preparation | Planning Mode & Preparation Profiles | Match Preparation Profiles binding chosen lineups/strategies to live match runtime and AI context | Map ID, profile name, active strategy IDs | Active `MatchPreparationProfile` bound to state | Falls back to default map profile if not configured | ORIGINAL_REQUEST.md § R3, R4 |
| 10 | Gemini Tactical AI | Official `@google/genai` SDK Client | Modern SDK client initialized via OS credential-backed API key (DPAPI / safeStorage) | Encrypted API key, configuration | Authenticated `GoogleGenAI` client instance | Disables AI Coach gracefully when unconfigured or invalid | ORIGINAL_REQUEST.md § R2, R5 |
| 11 | Gemini Tactical AI | `client.interactions.create` Pipeline | Direct interaction invocation with model `gemini-3.8-flash` and `response_format` | Compressed tactical context string + system prompt | Raw interaction output object with structured JSON text | Catches network/API exceptions; falls back to offline rules | ORIGINAL_REQUEST.md § R5, SDK docs |
| 12 | Gemini Tactical AI | Tactical AI System Prompt | System instructions enforcing Identity, Evidence discipline, CS2 callouts, Silence, and Strategy integration | Base prompt template + active Match Profile | Compiled immutable system instruction string | Prompt compilation error if profile schema invalid | ORIGINAL_REQUEST.md § R5 |
| 13 | Gemini Tactical AI | Structured Response Schema Validation | Strict JSON schema enforcement for `TacticalRecommendation` (`recommendationId`, `type`, `priority`, etc.) | Model JSON output text | Validated `TacticalRecommendation` object | Discards malformed AI output; increments parsing error metric | ORIGINAL_REQUEST.md § R5 |
| 14 | Gemini Tactical AI | Context Compression Engine | Minimization of raw GSI and tactical memory events into dense tactical summary (< 400 tokens) | Full GSI state, recent 10s events, active profile | Dense context summary string | Sanitizes sensitive tokens, truncates overflow events | ORIGINAL_REQUEST.md § R5 |
| 15 | Gemini Tactical AI | Dynamic Request Cancellation | AbortController cancellation on round phase shift, player death, or bomb plant | GSI state change event | In-flight HTTP request aborted | Silently drops aborted promises without throwing uncaught errors | ORIGINAL_REQUEST.md § R5 |
| 16 | Gemini Tactical AI | Token Budgeting & Cost Monitoring | Session and monthly tracking of input/output tokens and estimated USD expenditure | Token counts from API response metadata | Updated budget state with auto-throttle triggers | Throttles to offline engine if user budget ceiling reached | ORIGINAL_REQUEST.md § R5 |
| 17 | Gemini Tactical AI | Context Hashing & Cache | MD5/SHA256 cache of tactical situation to prevent redundant API calls during stable rounds | Hash of (map, round, aliveCounts, bombState, pos) | Cached `TacticalRecommendation` | Cache miss continues to API call; TTL expiration after 5s | ORIGINAL_REQUEST.md § R5 |
| 18 | Gemini Tactical AI | Stale-Response Rejection Guard | Time-to-live and phase check rejecting responses arriving after round end or death | Inbound recommendation, current GSI timestamp | Approved recommendation or rejected drop event | Drops recommendation with audit log if expired or phase shifted | ORIGINAL_REQUEST.md § R5 |
| 19 | Gemini Tactical AI | Graceful Offline Fallback Engine | Deterministic heuristic engine providing baseline tactical advice when Gemini is unavailable | Tactical memory snapshot, active profile | Baseline `TacticalRecommendation` with 0.80 confidence | Always succeeds; returns SILENCE if no heuristic matches | ORIGINAL_REQUEST.md § R5 |
| 20 | History & Analytics | Chronological Match Records | Persistent recording of completed matches with round breakdown, scores, and economy | GSI game-over payload, round history | Structured `HistoricalMatch` stored locally | Atomic file write; recovers gracefully if disk write fails | ORIGINAL_REQUEST.md § R5 |
| 21 | History & Analytics | Evidence-Based Analytics Engine | Clear separation of measured statistics (GSI truth) from AI retrospective interpretation | Raw match round events | `PerformanceAnalytics` (ADR, utility efficiency, retakes) | Handles zero-division edge cases (e.g. 0 flashes thrown) | ORIGINAL_REQUEST.md § R5 |
| 22 | Ecosystem Loop | History → Utility Room Practice Loop | Interactive action (`PRACTICE — MIRAGE A RETAKE`) linking match review directly to Utility Room | Historical round ID / weak phase trigger | Navigation event to Utility Room with filtered collection | Defaults to general map lineups if specific strategy absent | ORIGINAL_REQUEST.md § R5 |
| 23 | Test Domain 1 | Event Normalization | Ingestion and normalization of GSI JSON packets into uniform domain events | Raw GSI JSON payloads (valid and malformed) | Normalized `GsiState` and `GameEvent` stream | Discards corrupted packets without crashing state machine | ORIGINAL_REQUEST.md § Acceptance Criteria 16.1 |
| 24 | Test Domain 2 | Observation Provenance | Provenance tracking classifying events as `CONFIRMED`, `REPORTED`, or `INFERRED` | Game events, killfeed, manual inputs | Provenance-tagged `Observation` with source & timestamp | Rejects state changes lacking valid provenance source | ORIGINAL_REQUEST.md § Acceptance Criteria 16.2 |
| 25 | Test Domain 3 | Last-Seen Expiration & Visual Decay | Continuous decay of enemy last-seen visual markers across 30 seconds | Elapsed time delta (0s, 5s, 15s, 30s) | Opacity (1.0 -> 0.15) and decay state flag | Marks `EXPIRED` and evicts marker after 30 seconds | ORIGINAL_REQUEST.md § Acceptance Criteria 16.3 |
| 26 | Test Domain 4 | Tactical Confidence Classification | Palace Killer Invariance: killer location remains unconfirmed when victim dies at Palace | Kill event (Victim X @ Palace, Killer Y unknown) | Victim pos CONFIRMED; Killer pos UNKNOWN/INFERRED | Fails test if killer Y is assigned victim X coordinates | ORIGINAL_REQUEST.md § Acceptance Criteria 16.4 |
| 27 | Test Domain 5 | Lineup State Machine Transitions | Multi-stage state machine (`INACTIVE` -> `NEARBY` -> `POSITIONING` -> `ALIGNING` -> `READY` -> `EXECUTED` -> `NEXT`) | Player coordinates, view angles, weapon equipped | Updated `LineupExecutionState` with completion type | Hysteresis prevents rapid toggling; timeout resets state | ORIGINAL_REQUEST.md § Acceptance Criteria 16.5 |
| 28 | Test Domain 6 | Strategy Sequencing & Profile Binding | Sequential progression of strategy phases and runtime profile integration | GSI round clock, active profile, phase completions | Current active strategy phase, next required utility | Transitions to contingency branch on failure event | ORIGINAL_REQUEST.md § Acceptance Criteria 16.6 |
| 29 | Test Domain 7 | Match Detection & Capability Gating | Detection of match presence and isolation of Simulation/Demonstration mode | GSI heartbeat, match ID, simulation toggle | Engine state (`NO_MATCH`, `LIVE_MATCH`, `SIMULATION`) | Halts live overlays if match disconnects for > 10 seconds | ORIGINAL_REQUEST.md § Acceptance Criteria 16.7 |
| 30 | Test Domain 8 | AI Output Validation & Lifecycle Guards | Validation of model JSON responses and rejection of stale/invalid outputs | Raw LLM output string, current game timestamp | Validated recommendation or rejection drop log | Discards output on JSON parse error or post-round arrival | ORIGINAL_REQUEST.md § Acceptance Criteria 16.8 |
| 31 | Test Domain 9 | Permission & Capability Gating | Strict environment gating (`COMPETITIVE_PROTECTED`, `PRACTICE_SERVER`, `SIMULATION_PREVIEW`) | Detected game environment enum | Active capability set allowed by Compliance Matrix | Disables restricted features in `COMPETITIVE_PROTECTED` | ORIGINAL_REQUEST.md § Acceptance Criteria 16.9 |
| 32 | Test Domain 10 | Persistence & Data Integrity | Atomic serialization and migration of settings, favorites, lineups, and match history | Data models to persist, corrupted file samples | Verified disk files, automated migration to latest schema | Atomic write via temp file prevents data corruption | ORIGINAL_REQUEST.md § Acceptance Criteria 16.10 |
| 33 | Test Domain 11 | Connection Failure & Restriction Recovery | Recovery from GSI port conflicts, external JSON schema changes, and overlay restrictions | Port collision, unknown JSON fields, DPI changes | Automatic port failover, normalized schema, DPI re-scale | Emits user-actionable notifications on unrecoverable bind | ORIGINAL_REQUEST.md § Acceptance Criteria 16.11 |

---

## Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Lineup State Machine | Player stands at exact lineup coordinates but aims 180 degrees away | State remains `POSITIONING`. Does NOT advance to `ALIGNING` or `READY` until yaw/pitch fall within angular tolerance (±1.5°). |
| 2 | Lineup State Machine | Player jitters across the 30-unit boundary between `NEARBY` and `POSITIONING` at 60 Hz | Hysteresis buffer requires distance to exceed boundary by +15% (34.5 units) for >= 300ms before de-escalating. No state flapping. |
| 3 | Lineup Completion | Player executes grenade throw while in `READY`, but grenade bounces off a teammate and fails | State classifies completion as `Attempted` or `Confirmed thrown`, but NOT `Confirmed landed`. Sequence pauses or triggers contingency. |
| 4 | Palace Killer Invariance | Player X killed at Palace by sniper rifle through smoke from unseen enemy | Victim position is recorded as `Palace` (`CONFIRMED`). Killer position is marked `UNKNOWN` with confidence `0.0`. Overlay displays killer identity without any map marker. |
| 5 | GSI Ingestion | GSI packet arrives with `round.phase = "over"` but `player.state.health = 100` | State machine transitions immediately to `ROUND_OVER`. Any in-flight Gemini AI request is cancelled via AbortController. |
| 6 | GSI Ingestion | GSI sends corrupted JSON string truncated midway through a packet | Parser catches JSON syntax error, logs warning, increments error counter, and maintains previous valid GSI snapshot without crashing. |
| 7 | GSI Ingestion | GSI client sends negative player health or money exceeding $16,000 | Normalizer clamps health to `[0, 100]` and money to `[0, 16000]`. Logs warning for abnormal game state. |
| 8 | Last-Seen Decay | Enemy spotted at 00:45; clock reaches 01:16 without new sightings (31s elapsed) | At 0s-5s opacity is 1.0 (green). At 15s opacity is 0.5 (amber). At 29s opacity is 0.16 (gray). At 31s marker is evicted from active HUD. |
| 9 | Gemini Coach | AI responds with valid JSON schema, but suggests `suggestedLineupId: "non_existent_lineup_999"` | Validation layer verifies `suggestedLineupId` against local database. Nullifies invalid ID, displays recommendation text, logs warning. |
| 10 | Gemini Coach | User is in 1v4 clutch situation; confidence of available tactical actions is 0.55 | System prompt uncertainty rule triggers: model returns `type: "SAVE"` or `type: "SILENCE"` with `priority: "PASSIVE"`. No spam on HUD. |
| 11 | Gemini Coach | In-flight AI request takes 4500ms; during transit, bomb is defused and round ends | Response handler inspects `expiresAt` and current round phase (`freezetime`). Response is rejected as STALE. HUD overlay remains clean. |
| 12 | Gemini Coach | User has no internet connection or Gemini API key is unset | Asynchronous pipeline catches connection failure / key absence and silently delegates to Local Deterministic Fallback Engine. Zero crash. |
| 13 | History Practice Loop | User clicks `PRACTICE — MIRAGE A RETAKE` on a match played on Ancient | System warns user of map mismatch, switches active map context to Mirage, loads the retake collection, and sets Preparation Profile. |
| 14 | External JSON Import | User imports JSON containing `<script>alert('xss')</script>` in lineup notes | JSON import sanitization strips all HTML/script tags, validates string lengths, and coerces numeric fields into strict bounded floats. |
| 15 | Capability Gating | User switches from Practice Server to Official Matchmaking while trajectory visualizer is on | Capability Detector detects `COMPETITIVE_PROTECTED`. Automatically forces trajectory preview OFF and disables practice commands. |

---

## Section 1: Utility Room & Strategy Library Specification

### 1.1 Map Taxonomy & Canonical Coordinate Systems

The system natively supports the six Valve Active Duty competitive maps. Each map utilizes a normalized coordinate frame mapped to Valve Hammer Units, standardized callout volumes, and bomb site boundaries.

```typescript
export type CompetitiveMapId =
  | 'de_mirage'
  | 'de_inferno'
  | 'de_dust2'
  | 'de_nuke'
  | 'de_ancient'
  | 'de_anubis';

export interface MapMetadata {
  id: CompetitiveMapId;
  displayName: string;
  radarPackagePath: string; // Internal SVG/PNG asset
  worldBounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  };
  radarScale: number; // Pixels per Hammer Unit
  radarOffset: { x: number; y: number };
  sites: {
    a: { callout: string; center: Vector3D; radius: number };
    b: { callout: string; center: Vector3D; radius: number };
  };
  callouts: Record<string, CalloutZone>;
}

export interface CalloutZone {
  name: string;
  region: 'A_SITE' | 'B_SITE' | 'MID' | 'T_SPAWN' | 'CT_SPAWN' | 'ROTATION';
  bounds: {
    min: Vector3D;
    max: Vector3D;
  };
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Angle2D {
  pitch: number; // View angle vertical: -89.0 (looking up) to 89.0 (looking down)
  yaw: number;   // View angle horizontal: -180.0 to 180.0
}
```

#### Canonical Callout Taxonomies per Map:
1. **Mirage (`de_mirage`)**:
   - `T Spawn`, `T Roof`, `A Ramp`, `Palace`, `Palace Balcony`, `Tetris`, `Default A`, `Firebox`, `Triple Box`, `Stairs`, `Connector`, `Jungle`, `Ticket Booth`, `CT Spawn`, `Top Mid`, `Mid Boxes`, `Cart`, `Window`, `Vent`, `Catwalk`, `Short`, `Underpass`, `B Apartments`, `B Balcony`, `Van`, `Default B`, `Bench`, `Market / Kitchen`, `Market Window`, `Market Door`, `Arches`.
2. **Inferno (`de_inferno`)**:
   - `T Spawn`, `T Ramp`, `Banana`, `Logs / Tree`, `Car`, `Sandbags`, `B Site`, `Coffins / Wood`, `Dark / Emo`, `Pool / Fountain`, `Construction / Church`, `CT Spawn`, `Arch`, `Library`, `Speedway`, `Short / Porch`, `Boiler`, `Long / Quad`, `Pit`, `Graveyard`, `Default A`, `Apartments / Boiler Stairs`, `Second Mid`, `Alt Mid`, `Balcony`.
3. **Dust II (`de_dust2`)**:
   - `T Spawn`, `Outside Long`, `Long Doors`, `Long Corner`, `Pit`, `Blue Box`, `A Ramp`, `A Site / Default`, `Goose`, `Cross`, `CT Spawn`, `Elevator`, `Short / Catwalk`, `Stairs`, `Xbox`, `Top Mid`, `Mid Doors`, `Lower Tunnels`, `Upper Tunnels`, `B Doors`, `B Window`, `Car`, `B Site / Default`, `Back Plat`.
4. **Nuke (`de_nuke`)**:
   - `T Spawn`, `T Roof`, `Silo`, `Lobby`, `Trophy`, `Radio`, `Ramp`, `Bottom Ramp`, `Hell`, `Heaven`, `Locker Room`, `A Site`, `A Hut`, `Mini / Main`, `Secret`, `B Site`, `Vents`, `Decon`, `Bottom Vents`, `Tunnel`, `Outside`, `Garage`, `Red Box`, `CT Spawn`.
5. **Ancient (`de_ancient`)**:
   - `T Spawn`, `A Main`, `A Site`, `A Plateau`, `Donut`, `Mid`, `Top Mid`, `Elbow`, `B Ramp`, `B Site`, `Catwalk`, `Cave`, `Temple`, `CT Spawn`, `Alley`.
6. **Anubis (`de_anubis`)**:
   - `T Spawn`, `Canal`, `A Main`, `A Site`, `A Walkway`, `Heaven`, `Mid`, `Plaza`, `Bridge`, `Water`, `B Main`, `B Site`, `Connector`, `Palace`, `T Alley`, `CT Spawn`.

---

### 1.2 Lineup Data Schema

Every lineup represents a deterministic physical utility throw with comprehensive spatial, movement, visual, and attribution metadata.

```typescript
export type UtilityType = 'SMOKE' | 'FLASH' | 'MOLOTOV' | 'HE' | 'DECOY';
export type TeamSide = 'T' | 'CT' | 'BOTH';
export type MovementRequirement =
  | 'STAND'
  | 'CROUCH'
  | 'RUN'
  | 'WALK'
  | 'JUMP'
  | 'RUN_JUMP'
  | 'FORWARD_JUMP'
  | 'W_JUMP'
  | 'CROUCH_JUMP';

export type MouseButton = 'LEFT_CLICK' | 'RIGHT_CLICK' | 'BOTH_CLICK';
export type LineupDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
export type VerificationStatus =
  | 'VERIFIED_OFFICIAL'
  | 'COMMUNITY_VERIFIED'
  | 'UNVERIFIED'
  | 'BROKEN_IN_PATCH';

export interface Lineup {
  id: string; // e.g. "mirage-t-smoke-stairs-standard"
  name: string; // e.g. "A Stairs Smoke from T Roof"
  map: CompetitiveMapId;
  side: TeamSide;
  utilityType: UtilityType;
  difficulty: LineupDifficulty;
  
  // Positional coordinates
  startPosition: {
    callout: string;
    coordinates: Vector3D;
    toleranceRadius: number; // in Hammer units (typically 15-25)
    alignmentDescription: string; // Step 1 landmark
  };
  
  destination: {
    callout: string;
    targetCoordinates: Vector3D;
    bloomRadius: number;
    description: string;
  };
  
  // Aiming specification
  aim: {
    viewAngles: Angle2D; // pitch and yaw
    pitchTolerance: number; // degrees (e.g. ±1.5)
    yawTolerance: number;   // degrees (e.g. ±1.5)
    visualLandmark: string; // "Aim at apex of second antenna wire"
    zoomLevel: 'NO_ZOOM' | 'SINGLE_ZOOM' | 'DOUBLE_ZOOM';
    crosshairHudSvg: string; // Vector alignment SVG markup
  };
  
  // Execution mechanical requirements
  execution: {
    movement: MovementRequirement;
    mouseButton: MouseButton;
    jumpthrowBindSupported: boolean;
    subTickTimingMs?: number; // Optional timing window in milliseconds
    detailedSteps: string[];
  };
  
  // Taxonomy, Attribution, and Compliance
  tags: string[]; // ["a-execute", "default", "anti-awp", "safe"]
  isFavorite: boolean;
  isCustom: boolean; // true if created by user
  source: {
    author: string;
    organization?: string;
    externalProviderUrl?: string; // Authorized link (CSNADES / Scope.gg)
  };
  verification: {
    status: VerificationStatus;
    gameVersionTested: string;
    lastVerifiedDate: string; // ISO 8601
  };
}
```

#### JSON Schema Definition for Lineup:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Lineup",
  "type": "object",
  "required": [
    "id", "name", "map", "side", "utilityType", "difficulty",
    "startPosition", "destination", "aim", "execution", "tags",
    "isFavorite", "isCustom", "source", "verification"
  ],
  "properties": {
    "id": { "type": "string", "pattern": "^[a-z0-9-]+$" },
    "name": { "type": "string", "minLength": 3, "maxLength": 80 },
    "map": { "type": "string", "enum": ["de_mirage", "de_inferno", "de_dust2", "de_nuke", "de_ancient", "de_anubis"] },
    "side": { "type": "string", "enum": ["T", "CT", "BOTH"] },
    "utilityType": { "type": "string", "enum": ["SMOKE", "FLASH", "MOLOTOV", "HE", "DECOY"] },
    "difficulty": { "type": "string", "enum": ["EASY", "MEDIUM", "HARD", "EXPERT"] },
    "startPosition": {
      "type": "object",
      "required": ["callout", "coordinates", "toleranceRadius", "alignmentDescription"],
      "properties": {
        "callout": { "type": "string" },
        "coordinates": {
          "type": "object",
          "required": ["x", "y", "z"],
          "properties": {
            "x": { "type": "number" },
            "y": { "type": "number" },
            "z": { "type": "number" }
          }
        },
        "toleranceRadius": { "type": "number", "minimum": 1.0 },
        "alignmentDescription": { "type": "string" }
      }
    },
    "destination": {
      "type": "object",
      "required": ["callout", "targetCoordinates", "bloomRadius", "description"],
      "properties": {
        "callout": { "type": "string" },
        "targetCoordinates": {
          "type": "object",
          "required": ["x", "y", "z"],
          "properties": {
            "x": { "type": "number" },
            "y": { "type": "number" },
            "z": { "type": "number" }
          }
        },
        "bloomRadius": { "type": "number" },
        "description": { "type": "string" }
      }
    },
    "aim": {
      "type": "object",
      "required": ["viewAngles", "pitchTolerance", "yawTolerance", "visualLandmark", "zoomLevel", "crosshairHudSvg"],
      "properties": {
        "viewAngles": {
          "type": "object",
          "required": ["pitch", "yaw"],
          "properties": {
            "pitch": { "type": "number", "minimum": -89.0, "maximum": 89.0 },
            "yaw": { "type": "number", "minimum": -180.0, "maximum": 180.0 }
          }
        },
        "pitchTolerance": { "type": "number", "minimum": 0.1, "maximum": 10.0 },
        "yawTolerance": { "type": "number", "minimum": 0.1, "maximum": 10.0 },
        "visualLandmark": { "type": "string" },
        "zoomLevel": { "type": "string", "enum": ["NO_ZOOM", "SINGLE_ZOOM", "DOUBLE_ZOOM"] },
        "crosshairHudSvg": { "type": "string" }
      }
    },
    "execution": {
      "type": "object",
      "required": ["movement", "mouseButton", "jumpthrowBindSupported", "detailedSteps"],
      "properties": {
        "movement": {
          "type": "string",
          "enum": ["STAND", "CROUCH", "RUN", "WALK", "JUMP", "RUN_JUMP", "FORWARD_JUMP", "W_JUMP", "CROUCH_JUMP"]
        },
        "mouseButton": { "type": "string", "enum": ["LEFT_CLICK", "RIGHT_CLICK", "BOTH_CLICK"] },
        "jumpthrowBindSupported": { "type": "boolean" },
        "subTickTimingMs": { "type": "number" },
        "detailedSteps": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "tags": { "type": "array", "items": { "type": "string" } },
    "isFavorite": { "type": "boolean" },
    "isCustom": { "type": "boolean" },
    "source": {
      "type": "object",
      "required": ["author"],
      "properties": {
        "author": { "type": "string" },
        "organization": { "type": "string" },
        "externalProviderUrl": { "type": "string", "format": "uri" }
      }
    },
    "verification": {
      "type": "object",
      "required": ["status", "gameVersionTested", "lastVerifiedDate"],
      "properties": {
        "status": {
          "type": "string",
          "enum": ["VERIFIED_OFFICIAL", "COMMUNITY_VERIFIED", "UNVERIFIED", "BROKEN_IN_PATCH"]
        },
        "gameVersionTested": { "type": "string" },
        "lastVerifiedDate": { "type": "string" }
      }
    }
  }
}
```

---

### 1.3 Strategy Data Schema & Tactical Strategy Tiers

Strategies represent coordinated multi-player tactical plans broken into timed phases with explicit contingency branches.

```typescript
export type StrategyTier = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'COORDINATED';
export type PlayerRole =
  | 'ENTRY'
  | 'SUPPORT_UTIL'
  | 'LURKER'
  | 'AWPER'
  | 'IGL_PLAYMAKER'
  | 'ANCHOR'
  | 'ROTATOR';

export interface Strategy {
  id: string; // e.g. "strat-mirage-t-a-execute-standard"
  name: string; // e.g. "Mirage A Site Classic Smoke Wall & Pincer"
  map: CompetitiveMapId;
  side: TeamSide;
  tier: StrategyTier;
  objective: string;
  
  requiredUtility: {
    smoke: number;
    flash: number;
    molotov: number;
    he: number;
  };
  
  recommendedPlayerRoles: PlayerRole[];
  
  // Ordered execution phases
  phases: StrategyPhase[];
  
  // List of all lineup IDs utilized in this strategy
  linkedLineupIds: string[];
  
  // Branches and failure contingencies
  contingencies: StrategyContingency[];
  
  coordinationNotes: string;
  isFavorite: boolean;
  isCustom: boolean;
  sourceAttribution: string;
}

export interface StrategyPhase {
  phaseIndex: number;
  phaseName: string; // e.g. "Phase 1: Deep Utility & Site Isolation"
  timeWindowSeconds: {
    startRoundTime: number; // e.g. 105 (1:45 remaining)
    endRoundTime: number;   // e.g. 75  (1:15 remaining)
  };
  description: string;
  assignedLineupIds: {
    role: PlayerRole;
    lineupId: string;
    timingOffsetSeconds: number; // relative to phase start
  }[];
  movementDirectives: {
    role: PlayerRole;
    targetCallout: string;
    directive: string;
  }[];
}

export interface StrategyContingency {
  triggerCondition:
    | 'ENTRY_FRAG_LOST'
    | 'SMOKE_MISSED'
    | 'EARLY_ENEMY_PUSH'
    | 'BOMB_DROPPED_EARLY'
    | 'TIME_EXPIRED';
  conditionDetails: string; // e.g. "Lurker dies in Palace with bomb before smokes land"
  actionDirective: string;  // e.g. "Abort A site push; fall back to T Roof, rotate 4 to B Apartments via Underpass"
  fallbackStrategyId?: string;
}
```

#### Detailed Tactical Strategy Tiers:
1. **`BASIC`**:
   - Scope: 1-2 players.
   - Requirements: Simple isolated utility (1 smoke + 1 flash). No strict sub-second timing.
   - Example: *Mirage Default T-Mid Smoke from T Spawn* or *Inferno B Solo Banana Retake Smoke*.
2. **`INTERMEDIATE`**:
   - Scope: 2-3 players.
   - Requirements: Synchronized paired utility (e.g. Stairs smoke + Jungle smoke), coordinated entry path.
   - Example: *Mirage A Site 3-Man Split (Stairs/Jungle smokes + Ramp entry)*.
3. **`ADVANCED`**:
   - Scope: 3-5 players.
   - Requirements: Full site utility coverage, dedicated lurk/distraction, timed site pop-flashes.
   - Example: *Inferno A Long Execute with Arch Smoke, Library Molotov, and Boiler flash*.
4. **`COORDINATED`**:
   - Scope: Full 5-player roster.
   - Requirements: Micro-timed utility releases (synchronized jumpthrows), crossfire trading protocols, automated contingency triggers, precise post-plant lockups.
   - Example: *Nuke Secret-to-B Fast Wipe with Outer Smoke Wall, Vent Rush, and Lower Site Molotovs*.

---

### 1.4 Custom Lineups, Collections, Favorites, and Tags

1. **Custom Authoring & Editing**:
   - Users can create custom lineups via the Utility Room authoring modal.
   - System auto-generates a unique deterministic slug: `${map}-${side}-${utilityType}-${slugify(name)}`.
   - All custom lineups are flagged with `isCustom: true` and stored in local atomic persistence.
2. **Personal Collections**:
   - Collections group lineups and strategies into named playlists (e.g. `"Solo Queue Mirage Essentials"`, `"Inferno B Defense Playbook"`).
   - Schema:
     ```typescript
     export interface PersonalCollection {
       id: string;
       name: string;
       description: string;
       map: CompetitiveMapId;
       lineupIds: string[];
       strategyIds: string[];
       createdAt: string;
       updatedAt: string;
     }
     ```
3. **Favorites System**:
   - Both individual Lineups and entire Strategies contain an `isFavorite: boolean` toggle.
   - Dedicated "Favorites" view filters the active library by `isFavorite === true`.
4. **Tagging & Filtering**:
   - Multi-facet search supports filtering by: Map, Side, Utility Type, Difficulty, Tier, Tags, and Source.

---

### 1.5 External Provider Reference Architecture (Zero Scraping)

To comply strictly with Valve and third-party terms of service, the application **never** performs web scraping, DOM parsing, or automated crawling of external websites. Instead, it utilizes an authorized metadata link generator and structured user JSON import.

```typescript
export class ExternalProviderService {
  // Pure mathematical URL construction without HTTP requests
  static generateCsnadesUrl(map: CompetitiveMapId, utility: UtilityType, target: string): string {
    const mapSlug = map.replace('de_', '');
    const utilSlug = utility.toLowerCase();
    const targetSlug = encodeURIComponent(target.toLowerCase().replace(/\s+/g, '-'));
    return `https://csnades.gg/maps/${mapSlug}/${utilSlug}/${targetSlug}`;
  }

  static generateScopeGgUrl(map: CompetitiveMapId, utility: UtilityType): string {
    const mapSlug = map.replace('de_', '');
    return `https://app.scope.gg/grenades/${mapSlug}`;
  }

  // Schema-validated user JSON import
  static parseUserImportJson(jsonString: string): { lineups: Lineup[]; strategies: Strategy[] } {
    // 1. Parse JSON safely
    let raw: unknown;
    try {
      raw = JSON.parse(jsonString);
    } catch {
      throw new Error('INVALID_JSON_SYNTAX: Supplied file is not valid JSON');
    }

    // 2. Validate schema and sanitize
    return validateAndSanitizeImportPayload(raw);
  }
}
```

#### Sanitization Rules for Imports:
- Strip any HTML, scripts, or markdown image injection from strings.
- Enforce length limits: Names <= 80 chars, descriptions <= 500 chars.
- Coordinate range validation: Clamped within Hammer World Bounds (`-16384` to `+16384`).
- Duplicate resolution options: `OVERWRITE`, `RENAME_DUPLICATE`, or `SKIP`.

---

### 1.6 Planning Mode & Match Preparation Profiles

Match Preparation Profiles establish pre-match tactical intent that binds directly into the Live Match Runtime and conditions the Gemini Tactical AI.

```typescript
export interface MatchPreparationProfile {
  id: string;
  name: string; // e.g. "Competitive Mirage Pug Profile"
  map: CompetitiveMapId;
  tPrimaryStrategyId?: string;
  ctPrimaryStrategyId?: string;
  quickAccessLineupIds: string[]; // Up to 6 lineups bound to quick-inspect keys
  tacticalNotes: string;
  activeCollectionId?: string;
  autoActivateOnMapDetect: boolean;
}
```

#### Runtime Binding Flow:
1. GSI emits map load event: `map.name = "de_mirage"`.
2. Engine checks for active or auto-activate profile matching `de_mirage`.
3. If found, engine binds the profile:
   - Quick-access lineups are pre-loaded into the Lineup State Machine cache.
   - Strategies are passed to the Tactical Context Engine as primary tactical priors.
   - Gemini Tactical AI receives the active profile in its system prompt and context builder.

---

## Section 2: Gemini Tactical Coach & History Performance Intelligence

### 2.1 Official `@google/genai` SDK Integration

The AI Coach integrates strictly with the modern official `@google/genai` SDK (version `>= 2.29.1`) using `client.interactions.create` with model `gemini-3.8-flash` and structured `response_format`.

#### Client Instantiation:
```typescript
import { GoogleGenAI } from '@google/genai';

export class GeminiCoachClient {
  private client: GoogleGenAI | null = null;
  private currentApiKey: string | null = null;

  initialize(apiKey: string) {
    if (!apiKey || apiKey.trim().length === 0) {
      this.client = null;
      this.currentApiKey = null;
      return;
    }
    this.currentApiKey = apiKey.trim();
    // Instantiate official SDK client
    this.client = new GoogleGenAI({ apiKey: this.currentApiKey });
  }

  isConfigured(): boolean {
    return this.client !== null;
  }
}
```

#### Direct Interaction Invocation with Structured Schema:
```typescript
const interaction = await this.client.interactions.create({
  model: 'gemini-3.8-flash',
  system_instruction: CS2_TACTICAL_AI_SYSTEM_PROMPT,
  input: compressedTacticalContext,
  response_format: {
    type: 'text',
    mime_type: 'application/json',
    schema: TACTICAL_RECOMMENDATION_JSON_SCHEMA,
  },
  // Dynamic AbortController signal for cancellation
  signal: abortController.signal,
});

// Extract text response
const outputText = interaction.output_text ?? interaction.outputs?.[0]?.text;
```

---

### 2.2 Tactical AI System Prompt

The System Prompt is immutable during execution and enforces five non-negotiable principles:

```text
YOU ARE CS2 TACTICAL COACH, A DETERMINISTIC-GROUNDED, ELITE COUNTER-STRIKE 2 STRATEGIC ANALYST EMBEDDED IN A LIVE DESKTOP COMPANION.

YOUR MISSION IS TO PROVIDE ACTIONABLE, PRECISE, CONCISE TACTICAL ADVICE TO THE LOCAL PLAYER IN REAL-TIME WITHOUT INTERFERING WITH COMBAT FOCUS.

YOU MUST OPERATE ACCORDING TO THESE FIVE CORE PRINCIPLES:

1. EVIDENCE DISCIPLINE & PROVENANCE GROUNDING:
- You must strictly distinguish between CONFIRMED observations (direct local GSI coordinates, validated killfeed events), REPORTED events, and INFERRED hypotheses.
- NEVER state an inference as a confirmed fact.
- CRITICAL INVARIANT: If Player X is killed at Palace by Player Y, Player X's death at Palace is CONFIRMED. Player Y's identity is CONFIRMED. However, Player Y's location is UNKNOWN unless an independent observation confirms it. DO NOT infer or claim that Player Y is at Palace.

2. CS2 CALLOUT COMMUNICATION:
- Use standard, exact competitive CS2 callouts (e.g. Mirage: 'Palace', 'Tetris', 'Jungle', 'Stairs', 'Connector', 'Ticket', 'Market Window').
- shortDisplayText MUST be 45 characters or fewer.
- Use imperative, punchy tactical phrasing: 'SMOKE STAIRS NOW', 'HOLD PALACE CROSS', 'ROTATE B VIA CT', 'SAVE AWP - 1V4', 'DELAY PUSH - BOMB SPOTTED MID'.
- detailedExplanation must be 2 to 3 sentences explaining the tactical rationale.

3. UNCERTAINTY SILENCE:
- Competitive CS2 requires extreme audio/visual focus. Erroneous or speculative advice is catastrophic.
- If your tactical confidence is below 0.70, or if evidence is insufficient to make a decisive tactical call, return type: 'SILENCE' with priority: 'PASSIVE'.
- When the correct play is uncertain, SILENCE IS ALWAYS PREFERRED.

4. STRATEGY & LINEUP INTEGRATION:
- When a Match Preparation Profile or Strategy is active, cross-reference the situation with the active strategy phases.
- If recommending utility, you MUST supply the matching suggestedLineupId from the library if available.
- Prioritize executing the active strategy unless combat events demand a contingency branch.

5. OUTPUT COMPLIANCE:
- You must respond ONLY with a valid JSON object strictly matching the prescribed JSON schema.
- Do not wrap in markdown fences; return raw JSON conforming to the schema.
```

---

### 2.3 Structured Response Schema (`TacticalRecommendation`)

```typescript
export type RecommendationType =
  | 'EXECUTE_STRATEGY'
  | 'EXECUTE_LINEUP'
  | 'ROTATE'
  | 'FALLBACK'
  | 'SAVE'
  | 'HOLD_ANGLE'
  | 'UTILITY_INTERRUPT'
  | 'POST_PLANT_SETUP'
  | 'RETAKE_SETUP'
  | 'SILENCE';

export type PriorityLevel = 'CRITICAL' | 'CONTEXTUAL' | 'INFORMATIONAL' | 'PASSIVE';

export interface TacticalRecommendation {
  recommendationId: string; // UUID v4
  type: RecommendationType;
  priority: PriorityLevel;
  confidence: number; // 0.00 to 1.00
  supportingEventIds: string[]; // Provenance IDs of events in Tactical Memory justifying this
  shortDisplayText: string; // Max 45 characters for HUD quick glance
  detailedExplanation: string; // 2-3 sentences max
  suggestedLineupId: string | null; // ID of lineup from library or null
  expiresAt: number; // UNIX epoch timestamp in milliseconds when advice becomes invalid
}
```

#### JSON Schema Specification for `response_format`:
```json
{
  "type": "object",
  "required": [
    "recommendationId",
    "type",
    "priority",
    "confidence",
    "supportingEventIds",
    "shortDisplayText",
    "detailedExplanation",
    "suggestedLineupId",
    "expiresAt"
  ],
  "properties": {
    "recommendationId": {
      "type": "string",
      "description": "Unique UUID v4 identifier for this recommendation"
    },
    "type": {
      "type": "string",
      "enum": [
        "EXECUTE_STRATEGY",
        "EXECUTE_LINEUP",
        "ROTATE",
        "FALLBACK",
        "SAVE",
        "HOLD_ANGLE",
        "UTILITY_INTERRUPT",
        "POST_PLANT_SETUP",
        "RETAKE_SETUP",
        "SILENCE"
      ]
    },
    "priority": {
      "type": "string",
      "enum": ["CRITICAL", "CONTEXTUAL", "INFORMATIONAL", "PASSIVE"]
    },
    "confidence": {
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.0
    },
    "supportingEventIds": {
      "type": "array",
      "items": { "type": "string" }
    },
    "shortDisplayText": {
      "type": "string",
      "maxLength": 45
    },
    "detailedExplanation": {
      "type": "string",
      "maxLength": 300
    },
    "suggestedLineupId": {
      "type": ["string", "null"]
    },
    "expiresAt": {
      "type": "number"
    }
  }
}
```

---

### 2.4 Asynchronous Pipeline Architecture

The tactical decision loop executes through an 8-stage asynchronous pipeline:

```
[Observation Sources]
        │ (GSI, Bomb Event, Killfeed, User Hotkey)
        ▼
[Event Normalization]
        │ (Validate payload, clamp coordinates, drop corrupt packets)
        ▼
[Tactical Memory]
        │ (Provenance tagging: CONFIRMED/REPORTED/INFERRED, decay updates)
        ▼
[Context Builder & Compression]
        │ (Filter to recent 10s combat, alive counts, economy, hash check)
        ▼
[Relevant Utility / Strategy Retrieval]
        │ (Query local library for active map/side & active profile)
        ▼
[Gemini Analysis] (or Offline Fallback)
        │ (client.interactions.create with gemini-3.8-flash, structured schema)
        ▼
[Recommendation Validation & Stale Rejection]
        │ (Verify JSON schema, verify expiresAt, verify phase, drop stale)
        ▼
[Priority Manager & HUD Presentation]
        │ (Arbitrate screen priority: CRITICAL > CONTEXTUAL > INFORMATIONAL)
        ▼
[Permitted Presentation Surface]
```

#### Pipeline Controls & Resilience:
1. **Context Compression Engine**:
   - Compresses raw GSI (typically 15-20 KB of JSON) down to a concise YAML/Markdown payload of ~250-350 tokens.
   - Example compressed context:
     ```yaml
     match: { map: de_mirage, round: 14, phase: live, clock: "01:12" }
     bomb: { state: unplanted, carrier: self }
     teams: { t_alive: 3, ct_alive: 2, economy_advantage: t }
     local_player: { callout: "T Roof", hp: 100, armor: 100, gear: [ak47, smoke, flash, molotov] }
     recent_events_10s:
       - { id: "evt_101", type: "KILL", victim: "CT_1", victim_loc: "Mid Window", killer: "T_2" }
     active_profile: { name: "Default A Execute", target_strat: "strat-mirage-t-a-execute" }
     ```
2. **Dynamic Request Cancellation (AbortController)**:
   - Each interaction is bound to an `AbortController`.
   - The controller triggers `abort()` immediately upon:
     * Round phase transition (`ROUND_OVER`, `FREEZETIME`).
     * Local player death.
     * Bomb plant event.
3. **Rate Limiting & Token Budgeting**:
   - Sliding window limiter: Max 1 AI request per 15 seconds during buy phase; max 1 request per 10 seconds during active round.
   - Monthly and match token budget:
     * Daily limit: 100,000 tokens.
     * Match limit: 25,000 tokens.
     * Estimated cost calculator: tracks `(input_tokens / 1M) * $0.15 + (output_tokens / 1M) * $0.60`.
     * Upon reaching 95% budget, automatically switches to Offline Fallback Engine.
4. **Context Hashing & Tactical Caching**:
   - Cache key is generated via hash of: `hash(map + roundNumber + tAlive + ctAlive + bombState + playerCallout + nearbyLineupId)`.
   - If tactical context hash matches a previous response within a 5-second TTL, return the cached recommendation immediately with zero API cost.
5. **Stale-Response Rejection Guard**:
   - If an API response arrives with latency > 6000ms:
     * If `round.clock` has advanced significantly (> 8 seconds) or round phase has shifted, the recommendation is discarded.
     * Discarded responses are logged to the analytics engine as `DROPPED_STALE_AI_OUTPUT`.
6. **Graceful Offline Fallback Engine**:
   - When Gemini API is offline, unconfigured, or rate-limited, the system executes deterministic heuristics:
     * **Man Advantage Lockup**: If `friendlyAlive >= 4 && enemyAlive <= 2` -> `shortDisplayText: "NUMBERS ADVANTAGE - DO NOT PEEK"`, `priority: "CONTEXTUAL"`, `confidence: 0.85`.
     * **Clutch Isolation**: If `friendlyAlive === 1 && enemyAlive >= 3` with high equipment value -> `shortDisplayText: "CONSIDER SAVING WEAPON"`, `priority: "CONTEXTUAL"`, `confidence: 0.80`.
     * **Bomb Plant Defense**: If bomb is planted and friendly team holds site -> `shortDisplayText: "HOLD CROSSFIRE - DELAY CONTACT"`, `priority: "CRITICAL"`, `confidence: 0.90`.
     * **Retake Setup**: If bomb planted on A and player is CT -> retrieves active A Retake strategy lineups.

---

### 2.5 History Destination & Closed Practice Loop

The **HISTORY** destination provides post-match analytics and closes the operational loop with the Utility Room.

```typescript
export interface HistoricalMatch {
  matchId: string; // e.g. "match-20261019-2104-mirage"
  timestamp: string; // ISO 8601
  map: CompetitiveMapId;
  gameMode: 'COMPETITIVE' | 'PREMIER' | 'PRACTICE' | 'SIMULATION';
  result: 'VICTORY' | 'DEFEAT' | 'TIE';
  finalScore: {
    teamScore: number;
    opponentScore: number;
  };
  durationSeconds: number;
  
  rounds: HistoricalRound[];
  analytics: MatchPerformanceAnalytics;
}

export interface HistoricalRound {
  roundNumber: number;
  winningSide: 'T' | 'CT';
  winReason: 'ELIMINATION' | 'DEFUSED' | 'EXPLODED' | 'TIME_OUT';
  localPlayerStats: {
    kills: number;
    damage: number;
    deaths: number;
    headshots: number;
    utilityDamage: number;
    enemiesFlashedDuration: number;
  };
  utilityLineupsAttempted: {
    lineupId: string;
    completionType: 'Attempted' | 'Confirmed thrown' | 'Confirmed landed' | 'Manually completed';
    success: boolean;
  }[];
  postRoundPracticeRecommendation?: {
    strategyId: string;
    lineupCollectionId: string;
    label: string; // e.g. "PRACTICE — MIRAGE A RETAKE"
  };
}

export interface MatchPerformanceAnalytics {
  measuredStats: {
    adr: number; // Average Damage per Round
    utilityDamagePerRound: number;
    flashAssists: number;
    effectiveFlashSeconds: number;
    retakeSuccessRate: number; // e.g. 0.33 (1 out of 3)
    openingDuelWinRate: number;
    tradeKillEfficiency: number;
  };
  aiInterpretation?: {
    tacticalDiagnosis: string;
    keyLossReason: string;
    suggestedFocusAreas: string[];
  };
}
```

#### The Closed Ecosystem Loop (`UTILITY ROOM → LIVE MATCH → HISTORY → UTILITY ROOM`):
1. User studies and builds a preparation profile in **UTILITY ROOM**.
2. Profile binds to **LIVE MATCH**; HUD guides utility deployment; GSI records attempts.
3. Match ends; state is committed to **HISTORY**.
4. In History review, rounds where site retakes failed display an actionable button:
   `[PRACTICE — MIRAGE A RETAKE]`.
5. Clicking the button immediately:
   - Navigates the application shell to **UTILITY ROOM**.
   - Filters the lineup library to the exact Mirage A Retake strategy and its linked lineups.
   - Sets the active Practice Preparation Profile.

---

## Section 3: Core Engine Automated Test Suite (All 11 Domains)

This section provides the exhaustive specification for each of the 11 test domains required under Acceptance Criteria Section 16.

---

### Domain 1: Event Normalization (including malformed data handling)

- **Objective**: Verify that the GSI ingestion pipeline validates, sanitizes, and normalizes all incoming payloads without crashing, dropping valid data, or propagating corrupt states.
- **Specification**:
  1. *Valid Payload Normalization*: Verify that valid GSI JSON packets containing player health, armor, position, weapons, round phase, bomb state, and map are correctly mapped to typed `GsiState` objects.
  2. *Missing Mandatory Fields*: Inject payloads missing `map.name`, `player.state`, or `round.phase`. The normalizer must retain the previous valid state, log a warning, and flag the packet as partial.
  3. *Malformed / Corrupt JSON Strings*: Inject syntactically invalid JSON (e.g. truncated packets, unbalanced braces). Parser must catch `SyntaxError`, increment `gsi_corrupt_packet_count`, and maintain engine stability.
  4. *Type Mismatches & Numeric Boundary Violations*: Inject string values where numbers are expected (`"health": "one hundred"`), negative health (`"health": -50`), or excessive money (`"money": 999999`). Normalizer must coerce types, clamp health to `[0, 100]`, and clamp money to `[0, 16000]`.
  5. *Out-of-Order Packets*: Send packet with timestamp `T=100` followed by a delayed packet with `T=95`. Normalizer must reject stale sequence packets to prevent clock rollback.

---

### Domain 2: Observation Provenance

- **Objective**: Verify that all game observations are strictly categorized and tracked with immutable provenance tags (`CONFIRMED`, `REPORTED`, `INFERRED`), source attribution, and timestamps.
- **Specification**:
  1. *Provenance Levels*:
     - `CONFIRMED`: Direct local player telemetry, killfeed events received from official GSI, bomb planted/defused events.
     - `REPORTED`: Audio cue detections, teammate chat/radio inputs, manual user hotkey reports.
     - `INFERRED`: Tactical AI hypotheses, rotation predictions, enemy economy estimates.
  2. *Immutable Metadata*: Every observation must contain `eventId` (UUID), `timestamp`, `roundId`, `mapId`, `source`, `confidence` (0.00 to 1.00), and `provenanceLevel`.
  3. *Tamper Resistance*: Once an observation is registered in Tactical Memory, its `provenanceLevel` and `source` cannot be mutated or upgraded by downstream engines.

---

### Domain 3: Last-Seen Expiration & Visual Decay

- **Objective**: Validate the mathematical visual decay and time-to-live eviction of enemy last-seen markers on the tactical overlay.
- **Specification**:
  1. *Decay Curves & Classification*:
     - **Fresh** (`0.0s <= elapsed < 5.0s`): Opacity = `1.0`, State = `FRESH`, Color = `#22c55e` (Alert Green).
     - **Aging** (`5.0s <= elapsed < 15.0s`): Opacity scales linearly from `1.0` down to `0.5`, State = `AGING`, Color = `#eab308` (Warning Amber).
     - **Stale** (`15.0s <= elapsed < 30.0s`): Opacity scales linearly from `0.5` down to `0.15`, State = `STALE`, Color = `#6b7280` (Muted Gray).
     - **Expired** (`elapsed >= 30.0s`): State = `EXPIRED`, Opacity = `0.0`. Marker is evicted from the active HUD overlay memory.
  2. *Synthetic Clock Tests*: Advance clock incrementally (+0s, +4.9s, +5.0s, +14.9s, +15.0s, +29.9s, +30.1s) and assert exact computed opacity and status flags.

---

### Domain 4: Tactical Confidence Classification (Palace Killer Invariance)

- **Objective**: Strictly verify that killer locations are never falsely inferred from victim death positions.
- **Specification**:
  1. *The Invariant*: If Player X dies at location $L$ (e.g. Palace) and Player Y killed them:
     - `Victim X`: Location = $L$ (Palace), Confidence = `1.0`, Provenance = `CONFIRMED`.
     - `Killer Y Identity`: Identity = Player Y, Confidence = `1.0`, Provenance = `CONFIRMED`.
     - `Killer Y Location`: Location = `UNKNOWN` (or null), Confidence = `0.0`, Provenance = `UNASSIGNED`.
  2. *Test Assertions*:
     - Verify that Tactical Memory does NOT place a marker for Player Y at Palace.
     - Verify that downstream Tactical Context Engine does not advise "Player Y is at Palace".
     - Verify that if Player Y was previously confirmed at another location (e.g. A Ramp) within 5 seconds, that prior position is preserved rather than overwritten with Palace.

---

### Domain 5: Lineup State Machine Transitions, Hysteresis, and Completion Types

- **Objective**: Validate the 7-stage lineup execution state machine, spatial/angular tolerances, anti-jitter hysteresis, and completion classifications.
- **Specification**:
  1. *State Transitions*:
     - `INACTIVE`: Player distance to start position > 150 Hammer units.
     - `NEARBY`: Distance <= 150 units. HUD displays lineup cue icon.
     - `POSITIONING`: Distance <= 30 units. HUD highlights exact feet alignment spot.
     - `ALIGNING`: Distance <= 10 units, player view angles within ±15° of target aim.
     - `READY`: Distance <= 5 units, view angles within pitch tolerance (±1.5°) and yaw tolerance (±1.5°), correct utility item selected.
     - `EXECUTED`: Grenade thrown while in `READY` state.
     - `NEXT`: State machine advances to the subsequent lineup in the active strategy sequence.
  2. *Hysteresis Tolerances*:
     - To de-escalate from `POSITIONING` back to `NEARBY`, player distance must exceed `30 * 1.15 = 34.5` units continuously for at least 300 milliseconds. Rapid coordinate fluctuations must not cause state oscillation.
  3. *Completion Types*:
     - `Attempted`: Player entered `READY` and threw grenade, but trajectory bloom is not confirmed.
     - `Confirmed thrown`: GSI entity or weapon inventory decrement confirms grenade release in `READY` state.
     - `Confirmed landed`: Destination coordinates register smoke bloom / molotov fire within 5 seconds.
     - `Manually completed`: User triggers keyboard shortcut overriding lineup status.

---

### Domain 6: Strategy Sequencing & Match Preparation Profile Binding

- **Objective**: Validate multi-phase strategy progression, alternative execution paths, and live match profile binding.
- **Specification**:
  1. *Profile Binding*: When map is loaded via GSI, active Match Preparation Profile binds to the live engine. Lineups in the profile receive priority memory caching.
  2. *Phase Advancements*: Verify transition from Phase 1 (Initial Smokes) to Phase 2 (Site Flashes & Entry) when assigned lineups are completed or phase time window elapses.
  3. *Contingency Branch Activation*: Simulate entry frag loss during Phase 1. Verify engine transitions to `contingency.actionDirective` (e.g. abort site push, execute fallback rotation).

---

### Domain 7: Match Detection & Capability Gating

- **Objective**: Ensure the application correctly identifies live match state, separates simulation mode, and recovers from unexpected disconnects.
- **Specification**:
  1. *Match States*: `NO_MATCH_PRESENT`, `WARMUP`, `MATCH_ACTIVE`, `MATCH_PAUSED`, `MATCH_ENDED`, `DISCONNECTED`.
  2. *Inactive Gating*: In `NO_MATCH_PRESENT`, GSI listener is active but all overlays, timers, and coaching queries remain disabled/hidden.
  3. *Simulation / Demonstration Mode Isolation*:
     - Simulation mode uses an isolated virtual state provider.
     - Live match GSI packets are blocked from simulation state.
     - Clear visual indicator: `"SIMULATION MODE ACTIVE"`.
  4. *Disconnect Recovery*: If GSI packets stop for > 10.0 seconds during an active match, engine transitions to `DISCONNECTED` without crashing, preserving cached match statistics.

---

### Domain 8: AI Output Validation & Lifecycle Guards

- **Objective**: Ensure that all LLM outputs are strictly validated against JSON schemas, and stale or malformed responses are safely discarded.
- **Specification**:
  1. *Schema Conformance*: Validate inbound JSON against `TacticalRecommendation` schema. Reject outputs missing `recommendationId`, `type`, `priority`, or `confidence`.
  2. *Lineup Cross-Reference Validation*: If `suggestedLineupId` is provided, verify it exists in the local lineup database. If invalid, nullify the ID and log a warning.
  3. *Stale-Response Rejection*:
     - Reject recommendation if `Date.now() > expiresAt`.
     - Reject recommendation if round phase changed from `live` to `over` or `freezetime` while request was in-flight.
     - Reject tactical movement advice if local player died while request was in-flight.
  4. *Gemini Error Resilience*: Simulate API 429 (rate limit), 403 (invalid key), and network timeout. Verify graceful delegation to Offline Fallback Engine.

---

### Domain 9: Permission & Capability Gating across Environments

- **Objective**: Enforce the Valve Compliance Layer across all three runtime environments.
- **Specification**:
  1. *Runtime Environments*:
     - `COMPETITIVE_PROTECTED`: Matchmaking, Premier, Faceit.
     - `PRACTICE_SERVER`: Local offline server with sv_cheats or practice config.
     - `SIMULATION_PREVIEW`: In-app sandbox.
  2. *Compliance Matrix Enforcement*:
     - In `COMPETITIVE_PROTECTED`: Zero trajectory drawing in game world, zero memory reading, zero simulated keystrokes. Overlays strictly restricted to passive, non-occluding safe zones.
     - In `PRACTICE_SERVER`: Practice aids (throw trajectories, interactive alignment guides) are permitted.
  3. *Dynamic Environment Switching*: Transitioning from `PRACTICE_SERVER` to `COMPETITIVE_PROTECTED` must instantly disable all practice-exclusive capabilities.

---

### Domain 10: Persistence & Data Integrity

- **Objective**: Ensure corruption-proof atomic persistence of user settings, favorites, custom lineups, collections, preparation profiles, and match history.
- **Specification**:
  1. *Atomic File Writes*: Writes must occur to a temporary file (`.tmp`) followed by an atomic filesystem rename/replace to prevent partial-write corruption during unexpected power loss or crashes.
  2. *Schema Versioning & Migration*: Verify schema migration pipeline. An older version `v1` payload must migrate seamlessly to `v2` on startup.
  3. *Corrupted File Recovery*: If a storage file is completely corrupted, the engine must quarantine the corrupt file to `.corrupt`, initialize a clean default state, and notify the user.

---

### Domain 11: Recovery from Connection Failures, Format Changes, and Overlay Restrictions

- **Objective**: Verify that the application recovers cleanly from operational failures, third-party changes, and Windows platform restrictions.
- **Specification**:
  1. *GSI Port Conflicts*: If default port 3000 is occupied by another application, engine attempts configured fallback ports (e.g. 3001, 3002) and displays a clear setup guide to the user.
  2. *Third-Party Format Changes*: Ingesting an external JSON import with unexpected or missing optional fields must not crash; normalization layer adapts fields with default fallbacks.
  3. *Windows Transparent Overlay Restrictions*:
     - Transparent overlay window uses `setIgnoreMouseEvents(true, { forward: true })` during gameplay to ensure click-through.
     - Handles multi-monitor DPI changes and window resizing without coordinate drift or rendering artifacts.
