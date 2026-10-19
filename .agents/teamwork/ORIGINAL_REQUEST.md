# Original User Request

## 2026-10-19T21:06:32Z

Build **CS2 Assistant**, a production-grade, Valve-compliant Windows desktop tactical companion for Counter-Strike 2 featuring three integrated destinations (**LIVE MATCH**, **UTILITY ROOM**, and **HISTORY**), a deterministic tactical memory and lineup execution engine, a priority-based HUD manager with safe preview/simulation, and an optional Gemini AI Tactical Coach.

Working directory: c:\Users\conta\Desktop\CS2Agent
Integrity mode: development

## Requirements

### R1. Repository, Compliance Documentation, and Modular Architecture
Initialize a clean Git repository (`cs2-assistant`) in `c:\Users\conta\Desktop\CS2Agent` with `.gitignore`, `README.md`, `ARCHITECTURE.md`, `COMPLIANCE.md`, and `CHANGELOG.md`, making meaningful incremental commits per milestone. `COMPLIANCE.md` must document official Valve/Steam primary sources (Steam Subscriber Agreement, CS2 Trusted Mode `https://help.steampowered.com/en/faqs/view/09C5-DNSY-W1CB-F0BB`, VAC, Game State Integration `https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Game_State_Integration`, and tournament/coaching rules) with exact URLs, verification dates, and a feature-by-feature compliance matrix (`VERIFIED PERMITTED`, `REQUIRES APPROVAL`, `PROHIBITED`) that actively governs runtime capability gating in the Compliance Layer. Never claim "VAC-proof", "100% VAC safe", or "Officially Valve approved".

### R2. Application Shell, Minimalist Design System, and Three Primary Destinations
Build a Windows desktop application (Electron + React + TypeScript + Vite) with a precision minimalist dark design system (charcoal/near-black palette, restrained typography, subtle 1px borders, keyboard navigation, no gamer-RGB clutter) and a landing screen featuring **only three primary navigation destinations** (`LIVE MATCH`, `UTILITY ROOM`, `HISTORY`) with recognizable icons, concise descriptions, and live status indicators, plus a compact secondary menu for Settings, Gemini API Key Configuration (stored securely via OS credential encryption / DPAPI with connection testing and key removal, never logged or hardcoded), Appearance/HUD Configuration, Compliance/Capability Settings, and Help.

### R3. Utility Room, Strategy Library, and Match Preparation Profiles
Implement a normalized, scalable, searchable, filterable local database pre-populated with verified CS2 utility lineups and multi-phase tactical strategies (`BASIC`, `INTERMEDIATE`, `ADVANCED`, `COORDINATED`) across competitive maps (Mirage, Inferno, Dust2, Nuke, Ancient, Anubis), supporting:
- Complete lineup metadata (unique ID, map, side, utility type, starting position, destination, throw type, movement requirements, aim reference, compact visual/SVG reference, step-by-step instructions, tags, difficulty, source attribution, verification status, game version, last verification date).
- Strategy data structure (strategy ID, name, map, side, objective, difficulty, required utility, recommended player roles, ordered tactical phases, linked lineups, timing requirements, alternative execution paths, failure contingencies, required coordination, notes, source attribution).
- Custom lineup creation/editing, personal collections, favorites (both lineups and entire strategies), authorized external provider architecture (e.g., CSNADES, Scope.gg reference links and user-provided JSON imports without unauthorized scraping), and **Planning Mode / Match Preparation Profiles** that bind directly into Live Match and AI context.

### R4. Live Match Engine, Tactical Memory, Lineup State Machine, Bomb Timer, and HUD Manager
Implement an authorized Game State Integration (GSI) HTTP listener and capability detector with an explicit disabled/inactive state when no eligible match is detected, and a clearly separated **Live Match Demonstration / Simulation Mode**. Include:
- **Event Engine & Tactical Memory**: Provenance-tracked observations (`CONFIRMED`, `REPORTED`, `INFERRED`) with event ID, type, timestamp, round ID, map, source, player identity, location, confidence classification, and configurable time-decay/expiration. Must strictly distinguish observation from interpretation: when Player X dies at Palace and Player Y killed them, record confirmed victim location (Palace) and confirmed killer identity (Player Y), but **never** turn an unconfirmed killer location into a confirmed position at Palace.
- **Last Known Information Overlay**: Contextual annotation showing opponent last-seen location, elapsed seconds, source, and visual staleness decay as observations age, with user module toggle.
- **Tactical Context Engine**: Deterministic evaluator that inspects round state, observed events, equipment, selected lineups/strategies, and reliability, remaining silent when evidence or relevance is insufficient.
- **Lineup Execution State Machine**: Controlled transitions (`INACTIVE` → `NEARBY` → `POSITIONING` → `ALIGNING` → `READY` → `EXECUTED` → `NEXT`) with hysteresis, cooldowns, sequence progression, cancellation/manual override, and strict distinction between `Attempted`, `Confirmed thrown`, `Confirmed landed`, and `Manually completed`.
- **Bomb Timer**: Verified plant-event synchronized countdown (`BOMB PLANTED 00:24`) with urgency color progression, latency awareness, and automatic removal on defuse/explosion/round end.
- **Global HUD Manager**: Centralized overlay manager with module registration, priority arbitrage (`CRITICAL`, `CONTEXTUAL`, `INFORMATIONAL`, `PASSIVE`), collision avoidance, unobstructed crosshair and CS2 HUD safe zones, scaling/opacity controls, dedicated preview environment, and Compliance Layer gating (zero DLL injection, memory reading, or unauthorized hooks).

### R5. Gemini Tactical Coach & History Performance Intelligence Loop
Integrate the official `@google/genai` SDK (`>= 2.29.1`, using `client.interactions.create` with `gemini-3.8-flash` and `response_format` JSON schema) with an asynchronous pipeline:
`Observation Sources → Event Normalization → Tactical Memory → Context Builder → Relevant Utility/Strategy Retrieval → Gemini Analysis → Recommendation Validation → Priority Manager → Permitted Presentation Surface`.
- Maintain a dedicated Tactical AI System Prompt enforcing Identity, Evidence discipline, Decision Making, concise CS2 callout Communication, Uncertainty silence, and Strategy Integration.
- Require structured, validated responses (`recommendationId`, `type`, `priority`, `confidence`, `supportingEventIds`, `shortDisplayText`, `detailedExplanation`, `suggestedLineupId`, `expiresAt`) and implement context compression, request cancellation, rate limiting, token budgeting, cost monitoring, response caching, stale-response rejection, and graceful offline fallback when Gemini is unavailable or unconfigured.
- Implement **HISTORY** with chronological match records, evidence-based performance analytics (clearly separating measured statistics from AI interpretation), dynamic improvement recommendations, and mandatory one-click **History → Utility Room** integration (`PRACTICE — MIRAGE A RETAKE` opening the exact strategy/lineup collection in Utility Room) completing the `UTILITY ROOM → LIVE MATCH → HISTORY → UTILITY ROOM` ecosystem.

## Acceptance Criteria

### Compliance & Documentation
- [ ] Git repository is initialized in `c:\Users\conta\Desktop\CS2Agent` with `.gitignore`, `README.md`, `ARCHITECTURE.md`, `COMPLIANCE.md`, and `CHANGELOG.md`, with clean commits and zero hardcoded secrets.
- [ ] `COMPLIANCE.md` contains official primary-source citations, exact URLs, verification dates, and the compliance matrix classifying all features into `VERIFIED PERMITTED`, `REQUIRES APPROVAL`, or `PROHIBITED`.
- [ ] Zero code paths perform memory reading, DLL injection, process concealment, input automation, or unauthorized scraping.

### Core Engine & Automated Test Suite
- [ ] All automated unit and integration tests pass (`npm test`), explicitly covering all 11 required domains and edge cases from Section 16:
  1. Event normalization (including malformed data handling).
  2. Observation provenance.
  3. Last-seen expiration & visual decay.
  4. Tactical confidence classification (explicitly verifying that Player Y killing Player X at Palace does NOT classify Player Y as confirmed at Palace).
  5. Lineup state transitions (`INACTIVE` → `NEARBY` → `POSITIONING` → `ALIGNING` → `READY` → `EXECUTED` → `NEXT`), hysteresis, and completion types (`Attempted`, `Confirmed thrown`, `Confirmed landed`, `Manually completed`).
  6. Strategy sequencing & Match Preparation Profile binding.
  7. Match detection & capability gating (inactive state when no match is present, simulation mode separation, unexpected match end/disconnect recovery).
  8. AI output validation (rejecting invalid/unsupported outputs, rejecting stale responses arriving after round end, handling Gemini unavailability).
  9. Permission and capability gating across environments (`COMPETITIVE_PROTECTED`, `PRACTICE_SERVER`, `SIMULATION_PREVIEW`).
  10. Persistence of settings, favorites, custom lineups, collections, preparation profiles, and match history.
  11. Recovery from connection failures, provider format changes, and overlay initialization restrictions.

### End-to-End Application Build & Workflow
- [ ] The application compiles and builds cleanly (`npm run build`) with zero TypeScript or bundler errors.
- [ ] The UI implements the minimalist dark design system and features **exactly three primary navigation destinations** (`LIVE MATCH`, `UTILITY ROOM`, `HISTORY`) on the Home screen plus a compact secondary menu.
- [ ] The complete loop (`UTILITY ROOM → LIVE MATCH → HISTORY → UTILITY ROOM`) is operational and verified end-to-end.
