# CS2 Assistant — End-to-End (E2E) Test Infrastructure Specification

**Document Version**: 1.0.0  
**Target Project**: `cs2-assistant` (`c:\Users\conta\Desktop\CS2Agent`)  
**Author**: `test_writer_e2e_1` (Teamwork Preview Test Writer)  
**Authoritative References**: `ORIGINAL_REQUEST.md`, `PROJECT.md`, `spec_miner_compliance_gsi_1/compliance_gsi_spec.md`, `spec_miner_data_ai_1/data_ai_test_spec.md`  

---

## 1. Test Philosophy & Principles

### 1.1 Opaque-Box, Requirement-Driven Testing
The testing infrastructure for CS2 Assistant adheres strictly to an **opaque-box (black-box), requirement-driven methodology**. 
- Tests do not assume or depend upon the internal private implementation details of classes or modules.
- Every test is derived directly from the authoritative specifications established in `ORIGINAL_REQUEST.md` and formal interface contracts documented in `PROJECT.md`.
- Tests interact with the system strictly through exposed surface APIs, interface contracts, GSI network payloads, and observable state outputs (telemetry streams, recommendation objects, UI events, and persistence stores).
- By decoupling test assertions from internal implementation choices, tests remain stable across refactorings while providing uncompromising verification of contractual behavior.

### 1.2 Separation of Testing Layers
The project distinguishes two complementary testing layers:
1. **Headless Domain Unit & Integration Suites (`tests/domain*.test.ts`)**: Fine-grained verification of individual algorithmic modules in `src/core/` across all 11 required test domains.
2. **Opaque-Box E2E Testing Track (`tests/e2e/`)**: Systemic, multi-tier validation of integrated workflows, cross-subsystem interactions, boundary extremes, and full application lifecycle journeys.

### 1.3 The Five-Tier Test Hierarchy
The E2E Testing Track is organized into five structured tiers:

```
+-----------------------------------------------------------------------------------------+
|                               FIVE-TIER TEST HIERARCHY                                  |
+-----------------------------------------------------------------------------------------+
| Tier 1: Feature Coverage (Core Paths)                                                   |
| - Minimum 5 comprehensive test cases per feature for baseline contract compliance.     |
+-----------------------------------------------------------------------------------------+
| Tier 2: Boundary, Edge & Corner Cases                                                   |
| - Minimum 5 stress / boundary test cases per feature (clamping, invalid, malformed).    |
+-----------------------------------------------------------------------------------------+
| Tier 3: Pairwise Combinations                                                           |
| - Interaction matrix testing orthogonal features acting in concert (e.g. FSM x Gating). |
+-----------------------------------------------------------------------------------------+
| Tier 4: Real-World Scenarios & Ecosystem Loops                                          |
| - Multi-step simulated user journeys; complete UTILITY -> LIVE -> HISTORY -> UTILITY.  |
+-----------------------------------------------------------------------------------------+
| Tier 5: Adversarial Hardening (Milestone 6 Final Verification)                          |
| - Fuzzing, static code invariant auditing (Six Zero Invariants, Anti-Claim check).      |
+-----------------------------------------------------------------------------------------+
```

### 1.4 Test Independence & Determinism
- **Zero Test Interdependence**: Each test sets up its own isolated state, utilizes fresh in-memory fixtures, and cleans up upon completion. Test execution order does not affect results.
- **Clock & Timer Determinism**: All time-dependent behaviors (memory decay, bomb timer countdowns, request timeouts, cache TTLs) utilize synthetic virtual clocks or explicit mock timers, guaranteeing millisecond precision without nondeterministic sleep delays.
- **Hermetic Network Execution**: Tests do not perform live outbound HTTP requests to Google Gemini or external services; network interactions are verified via hermetic mocks and offline fallback simulation.

---

## 2. Complete 33-Feature Inventory with Tier Mappings

All 33 features defined in `PROJECT.md` are enumerated below with their architectural scope, milestone assignment, tier mappings, contract inputs, and observable verification criteria:

| # | Feature Name | Primary Milestone | Tier Mappings | Description | Contract Inputs | Observable Outputs & Verification Criteria | Authoritative Source |
|---|--------------|-------------------|---------------|-------------|-----------------|--------------------------------------------|----------------------|
| 1 | Git Repository & Docs | M1 | T1, T2, T5 | Repository setup with `.gitignore`, `README.md`, `ARCHITECTURE.md`, `CHANGELOG.md` | Filesystem inspect | Repo initialized; mandatory docs present with non-empty content; clean commits | ORIGINAL_REQUEST §R1 |
| 2 | Valve Compliance Documentation | M1 | T1, T2, T5 | `COMPLIANCE.md` with 6 official primary sources, exact URLs, verification dates, Anti-Claim Invariant | File content / AST parse | 6 URLs present; 2026-10-19 dates; zero forbidden marketing phrases ("VAC-proof", etc.) | ORIGINAL_REQUEST §R1 |
| 3 | Feature Compliance Matrix | M1 | T1, T3, T5 | Matrix classifying all features into `VERIFIED PERMITTED`, `REQUIRES APPROVAL`, `PROHIBITED` | Matrix parser / Schema query | All capabilities partitioned; prohibited capabilities strictly blocked | ORIGINAL_REQUEST §R1 |
| 4 | Capability Gating Engine | M1 | T1, T2, T3 | Active runtime gating across `COMPETITIVE_PROTECTED`, `PRACTICE_SERVER`, `SIMULATION_PREVIEW` | `EnvironmentMode` string | `isFeaturePermitted(id)` returns boolean matching active environment | ORIGINAL_REQUEST §R1, §R4 |
| 5 | Build & Test Tooling | M1 | T1, T2, T5 | Package tooling: Electron, React, Vite, TS, Vitest, Tailwind | Build scripts | `npm test` executes cleanly; `npm run build` generates clean output | ORIGINAL_REQUEST §R1 |
| 6 | Precision Dark Design System | M2 | T1, T2 | Charcoal/zinc-950 aesthetic, 1px borders, restrained typography, keyboard navigation | CSS / Component classes | Color tokens match palette; no RGB rainbow styling; tab navigation works | ORIGINAL_REQUEST §R2 |
| 7 | Three Primary Destinations Shell | M2 | T1, T3, T4 | Landing screen featuring **only three primary destinations** (`LIVE MATCH`, `UTILITY ROOM`, `HISTORY`) | Navigation routes | Exactly 3 main navigation tabs; active indicator highlights current tab | ORIGINAL_REQUEST §R2 |
| 8 | Compact Secondary Menu | M2 | T1, T2 | Secondary drawer/menu for Settings, API Key, HUD Config, Compliance Matrix, and Help | Menu toggle event | Drawer opens/closes; contains all 5 secondary config panels | ORIGINAL_REQUEST §R2 |
| 9 | Secure Credential Storage | M2 | T1, T2, T5 | OS credential encryption (Windows DPAPI via `safeStorage`) with test & remove | API key string | Encrypted roundtrip; key never logged or stored in plaintext; removal deletes key | ORIGINAL_REQUEST §R2 |
| 10 | Transparent HUD Overlay Window | M2 | T1, T2, T3 | Click-through overlay with CS2 HUD safe zone enforcement (crosshair, radar, status) | Overlay bounds & click events | `ignoreMouseEvents(true, forward: true)`; 450x450 crosshair zone clear | ORIGINAL_REQUEST §R2, §R4 |
| 11 | Lineup Data Structure & DB | M3 | T1, T2, T3 | Normalized database of verified utility lineups across 6 Active Duty maps | Query parameters | Complete metadata (ID, map, side, util, start, aim, throw, tags, difficulty) | ORIGINAL_REQUEST §R3 |
| 12 | Strategy Library & Tactical Tiers | M3 | T1, T2, T3 | Multi-phase strategies across `BASIC`, `INTERMEDIATE`, `ADVANCED`, `COORDINATED` tiers | Strategy ID / Query | Multi-phase structure, linked lineups, contingencies, role assignments | ORIGINAL_REQUEST §R3 |
| 13 | Custom Lineup & Strategy Creator | M3 | T1, T2 | Custom creation/editing, personal collections, tags, and favorites | Custom entity payload | Persisted with `isCustom: true`; unique slug generated; tags indexed | ORIGINAL_REQUEST §R3 |
| 14 | External Provider Architecture | M3 | T1, T2, T5 | Zero-scraping URL generation for CSNADES and Scope.gg reference links | Map, utility, callout | Valid external deep links constructed mathematically; zero HTTP scraping | ORIGINAL_REQUEST §R3 |
| 15 | Schema-Validated JSON Import | M3 | T1, T2, T5 | Secure import/export of user lineups/strategies with XSS sanitization | JSON string | Schema validated; HTML/script tags stripped; coords clamped | ORIGINAL_REQUEST §R3 |
| 16 | Match Preparation Profiles | M3 | T1, T3, T4 | Planning Mode profiles binding directly into Live Match and AI context | Profile configuration | Profile auto-activates on map detect; binds 6 quick-access lineups | ORIGINAL_REQUEST §R3 |
| 17 | GSI HTTP Listener & Cfg Gen | M4 | T1, T2, T3 | KeyValues `.cfg` generator, HTTP listener on port 3001, auth token validation | HTTP POST `/api/gsi` | Generates valid KV1 `.cfg`; returns 200 on valid token, 401 on invalid | ORIGINAL_REQUEST §R4 |
| 18 | Simulation / Demo Mode | M4 | T1, T3, T4 | Dedicated offline simulation mode cleanly separated from live GSI telemetry | Simulation control events | Injects synthetic packets; visible simulation watermark; zero live interference | ORIGINAL_REQUEST §R4 |
| 19 | Event Engine & Tactical Memory | M4 | T1, T2, T3 | Provenance-tracked events (`CONFIRMED`, `REPORTED`, `INFERRED`), decay curves, round flush | Normalized GSI events | Observations tagged with source, timestamp, confidence; flushed on round end | ORIGINAL_REQUEST §R4 |
| 20 | Palace Killer Invariance | M4 | T1, T2, T3 | Strict observation discipline: victim at Palace is confirmed, killer is unconfirmed | Killfeed event (Victim X, Killer Y) | Victim X at Palace is CONFIRMED; Killer Y location is NOT Palace | ORIGINAL_REQUEST §R4 |
| 21 | Last-Known Information Overlay | M4 | T1, T2, T3 | Opponent last-seen annotations, elapsed seconds, visual decay, user toggle | Memory observations | Callout badges with elapsed seconds; opacity decay (1.0 -> 0.0); toggle works | ORIGINAL_REQUEST §R4 |
| 22 | Lineup Execution State Machine | M4 | T1, T2, T3 | 7 states (`INACTIVE` -> `NEARBY` -> `POSITIONING` -> `ALIGNING` -> `READY` -> `EXECUTED` -> `NEXT`), hysteresis, 4 completion types | Player coords, angles, weapons | Controlled state transitions; anti-jitter hysteresis; 4 completion classifications | ORIGINAL_REQUEST §R4 |
| 23 | High-Precision Bomb Timer | M4 | T1, T2, T3 | Plant-synchronized countdown (`BOMB PLANTED 00:24`), latency compensation, 10s/5s thresholds | Bomb planted GSI packet | Millisecond synchronized countdown; color transitions (green/amber/red/flash); auto-clear | ORIGINAL_REQUEST §R4 |
| 24 | Global HUD Priority Arbitrage | M4 | T1, T2, T3 | Priority manager (`CRITICAL`, `CONTEXTUAL`, `INFORMATIONAL`, `PASSIVE`), collision avoidance | Concurrent widget display requests | Highest priority preempts lower; safe zones respected; zero overlap | ORIGINAL_REQUEST §R4 |
| 25 | Gemini SDK Client Integration | M5 | T1, T2, T5 | Official `@google/genai` (>= 2.29.1) integration with `client.interactions.create`, `gemini-3.8-flash` | Prompt & context payload | Valid interaction call; proper model string; handles network/auth failures | ORIGINAL_REQUEST §R5 |
| 26 | Tactical AI System Prompt | M5 | T1, T2 | System prompt enforcing identity, evidence discipline, CS2 callouts (<= 45 chars), silence | Base template + context | Prompt includes all 5 principles; output text clamped to 45 chars max | ORIGINAL_REQUEST §R5 |
| 27 | Structured Recommendation Schema | M5 | T1, T2 | JSON schema validated outputs (`recommendationId`, `type`, `priority`, `confidence`, etc.) | LLM JSON output text | Validated `TacticalRecommendation` object; malformed JSON safely discarded | ORIGINAL_REQUEST §R5 |
| 28 | Asynchronous AI Pipeline & Resilience | M5 | T1, T2, T3 | 8-stage pipeline, context compression, rate limiting, token budgeting, 5s cache, offline fallback | GSI state triggers | Context compressed < 400 tokens; aborts on round end; caches within 5s; offline fallback | ORIGINAL_REQUEST §R5 |
| 29 | History Match Records & Analytics | M5 | T1, T2, T4 | Chronological match history with evidence-based analytics separating statistics from AI interpretation | Match complete event | Structured match records saved; measured stats distinct from AI notes | ORIGINAL_REQUEST §R5 |
| 30 | Closed Ecosystem Loop | M5 | T1, T3, T4 | One-click `History -> Utility Room` practice trigger (`PRACTICE — MIRAGE A RETAKE`) completing the loop | Button click on historical round | Navigates to Utility Room, filters to exact strategy/lineups, binds profile | ORIGINAL_REQUEST §R5 |
| 31 | 11-Domain Core Engine Test Suite | M6 | T1, T2, T5 | Exhaustive unit & integration test suite covering all 11 domains from Acceptance Criteria §16 | `npm test` command | All 11 domain test suites pass 100% | ORIGINAL_REQUEST §Acceptance |
| 32 | Opaque-Box E2E Test Suite (T1-T4) | M6 | T1, T2, T3, T4 | Multi-tier requirement-driven opaque-box test suite passing 100% | `runner.ts` / Vitest | Tiers 1, 2, 3, 4 pass 100% with full coverage reporting | PROJECT Pattern |
| 33 | Adversarial Coverage Hardening (T5) | M6 | T5 | White-box stress-testing, edge case verification, and forensic audit clean verdict | Forensic scan scripts | Zero anti-cheat violations; zero memory reading; clean forensic verdict | PROJECT Pattern |

---

## 3. Test Architecture & Runner Format

### 3.1 Runner Execution Engine (`tests/e2e/runner.ts`)
The E2E test runner is designed for **dual execution mode**:
1. **Standalone CLI Mode**: Runs via `node --experimental-strip-types tests/e2e/runner.ts` (or `npx tsx tests/e2e/runner.ts`). Executes all test suites headlessly with zero external npm dependencies required.
2. **Vitest Integration Mode**: Suites in `tests/e2e/` can be discovered and executed directly via `vitest run tests/e2e/` as part of standard CI/CD.

### 3.2 Test Runner Architecture

```
+-----------------------------------------------------------------------------------------+
|                                  TEST RUNNER HARNESS                                    |
+-----------------------------------------------------------------------------------------+
| [CLI Entry: runner.ts]                                                                  |
|   ├── Suite Registry (Tiers 1, 2, 3, 4)                                                 |
|   ├── Virtual Environment Harness                                                       |
|   │     ├── In-Memory GSI Packet Generator                                              |
|   │     ├── Virtual DPAPI Credential Store                                              |
|   │     ├── Mock Gemini AI Interaction Provider                                         |
|   │     └── Virtual Clock & Event Bus                                                   |
|   ├── Assertion Engine (strict equal, deep equal, closeTo, throws, matches)             |
|   └── Multi-Format Reporter                                                             |
|         ├── ANSI Terminal Dashboard (Pass/Fail, Durations, Tier Coverage Breakdown)     |
|         └── JSON Artifact (`tests/e2e/reports/e2e-summary.json`)                        |
+-----------------------------------------------------------------------------------------+
```

### 3.3 Test Suite File Layout
```
tests/e2e/
├── runner.ts                            # Standalone test runner & execution harness
├── tier1-feature-coverage.test.ts       # Tier 1: Core feature path verification (>= 5 / feat)
├── tier2-boundary-corner.test.ts        # Tier 2: Boundary, clamping, malformed data (>= 5 / feat)
├── tier3-pairwise-combinations.test.ts  # Tier 3: Pairwise feature combination matrix
├── tier4-real-world-scenarios.test.ts   # Tier 4: Multi-step real-world application journeys
└── reports/                             # Generated execution reports & coverage logs
```

### 3.4 Standalone Test Harness API
The runner provides a zero-dependency testing DSL compatible with standard test runners:
```typescript
export interface TestCase {
  name: string;
  fn: () => void | Promise<void>;
  tier: 1 | 2 | 3 | 4;
  featureId: number;
}

export function describe(suiteName: string, suiteFn: () => void): void;
export function it(testName: string, testFn: () => void | Promise<void>): void;
export function expect<T>(actual: T): AssertionChain<T>;
```

---

## 4. Coverage Thresholds & Quality Gates

### 4.1 Tier 1: Core Feature Coverage Thresholds
- **Requirement**: Each functional feature implemented must possess a minimum of **5 distinct test cases** verifying primary functional contracts (happy path, state validation, output structure, error signals, interface adherence).
- **Target Feature Sets**:
  - Compliance & Gating (Features 2, 3, 4): Minimum 15 test cases.
  - Design & Shell Navigation (Features 6, 7, 8, 9, 10): Minimum 25 test cases.
  - Utility Room & Strategies (Features 11, 12, 13, 14, 15, 16): Minimum 30 test cases.
  - Live Match Engine & GSI (Features 17, 18, 19, 20, 21, 22, 23, 24): Minimum 40 test cases.
  - AI Coach & History (Features 25, 26, 27, 28, 29, 30): Minimum 30 test cases.

### 4.2 Tier 2: Boundary & Corner Case Thresholds
- **Requirement**: Minimum **5 distinct boundary/corner test cases** per feature, focusing on:
  - *Numeric Clamping & Range Boundaries*: Health `[-50, 150]` -> `[0, 100]`, Money `[-100, 999999]` -> `[0, 16000]`, angles beyond `±180°`.
  - *Malformed & Truncated Inputs*: Truncated GSI JSON strings, missing required object blocks, unexpected field types (string instead of number).
  - *Temporal Boundary Conditions*: Bomb timer synchronized at 0.05s before explosion; defuse with exactly 5.01s vs 4.99s remaining.
  - *Spatial Hysteresis Boundaries*: Player oscillation at distance $R \pm \epsilon$; micro-rotations at pitch/yaw tolerance edge ($\pm 1.5^\circ$).
  - *Network Anomalies & High Latency*: In-flight AI response arriving 15s after round has ended; abrupt GSI heartbeat timeout after 30s.

### 4.3 Tier 3: Pairwise Combinations Matrix
Verifies orthogonal subsystems operating in combination to eliminate integration blind spots:
1. **Environment Mode $\times$ GSI Telemetry Level**: `COMPETITIVE_PROTECTED`, `PRACTICE_SERVER`, `SIMULATION_PREVIEW` crossed with live player vs spectator telemetry.
2. **Lineup State Machine $\times$ Bomb Timer Priority**: Lineup `ALIGNING`/`READY` state active simultaneously with `CRITICAL` Bomb Timer countdown.
3. **Tactical Memory $\times$ Gemini AI Coach**: Ingesting high-volume kill events during an active AI coaching request; verifying provenance isolation.
4. **Match Preparation Profile $\times$ Live Match Detection**: Auto-activation of Mirage profile upon map load; fallback behavior on unmapped maps.
5. **DPAPI Credential Store $\times$ AI Client Lifecycle**: API key addition, invalidation, rotation, and removal during active match session.
6. **Last-Known Marker Decay $\times$ Round Boundary Flush**: Opponents decaying through stages (Fresh -> Stale) abruptly interrupted by round freeze time.

### 4.4 Tier 4: Real-World Scenarios & Ecosystem Loops
Multi-step, stateful user journeys simulating realistic competitive play:
1. **Scenario 1 — Complete Ecosystem Loop**:
   - `UTILITY ROOM` (Inspect Mirage A Retake strategy, build Preparation Profile) $\rightarrow$
   - `LIVE MATCH` (Detect `de_mirage`, bind profile, simulate bomb plant, trigger lineup guidance, complete lineup) $\rightarrow$
   - `HISTORY` (Match completes, record saved with measured analytics, click `[PRACTICE — MIRAGE A RETAKE]`) $\rightarrow$
   - `UTILITY ROOM` (Re-opens Utility Room pre-filtered to Mirage A Retake strategy).
2. **Scenario 2 — Palace Killer Invariance Under Combat Stress**:
   - Complex 5v5 combat exchange in Mirage A site; multiple deaths in rapid succession; local player dies at Palace; verify Killer location remains strictly UNCONFIRMED throughout all tactical models and AI prompts.
3. **Scenario 3 — Disconnect, Reconnect, and State Recovery**:
   - Active round interrupted by 35s GSI silence; engine transitions safely to `DISCONNECTED`; reconnect packet received; engine seamlessly resumes round tracking without corrupted statistics.
4. **Scenario 4 — 1v3 Clutch with AI Uncertainty Silence**:
   - High-pressure 1v3 situation; low tactical confidence; AI Coach pipeline returns `SILENCE` with `PASSIVE` priority, preserving audio crosshair concentration.

### 4.5 Tier 5: Adversarial Hardening Quality Gate
Enforced during Milestone 6 prior to publication:
- 100% pass rate across all unit domain tests (`tests/domain*.test.ts`) and E2E suites (Tiers 1-4).
- Forensic audit clean scan: Zero prohibited Win32 API calls (`OpenProcess`, `VirtualAllocEx`, `WriteProcessMemory`, `CreateRemoteThread`, `SendInput`).
- Compliance lint pass: Zero occurrences of forbidden marketing keywords (`VAC-proof`, `100% VAC safe`, `Valve certified`).
- Clean production build (`npm run build`) with zero TypeScript errors.

---

## 5. Verification Method

To verify the E2E Test Infrastructure independently:
1. **Execute Standalone E2E Test Runner**:
   ```bash
   node --experimental-strip-types tests/e2e/runner.ts
   ```
2. **Execute via Vitest**:
   ```bash
   npm test tests/e2e
   ```
3. **Review Generated Execution Report**:
   Inspect `tests/e2e/reports/e2e-summary.json` to verify that all suites execute, test counts meet thresholds, and zero assertion failures occur.
