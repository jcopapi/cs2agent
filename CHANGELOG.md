# Changelog

All notable changes to the **CS2 Assistant** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-19

### Added — Milestone 6 (Final Verification & Adversarial Hardening)
- Complete 11-Domain automated unit and integration test suite (`tests/domain1` through `tests/domain11`) verifying event normalization, provenance, last-seen decay, Palace Killer Invariance, 7-state lineup FSM with dual-radius hysteresis, strategy sequencing, match detection, AI output validation, capability gating, persistence, and failure recovery.
- Complete 4-Tier opaque-box End-to-End (E2E) test suite (`tests/e2e/runner.ts`, `tier1` through `tier4`) and Tier 5 adversarial compliance/security stress suites (`tests/adversarial-compliance-challenge.test.ts`, `tests/adversarial-milestone2-challenge.test.ts`).

### Added — Milestone 5 (Gemini Tactical Coach & History Intelligence)
- Official `@google/genai` (`>= 2.29.1`) integration using `client.interactions.create` with `gemini-3.8-flash` and structured JSON schema enforcement (`src/core/ai/gemini-coach.ts`).
- Dedicated Tactical AI System Prompt (`src/core/ai/system-prompt.ts`) enforcing CS2 callout brevity (`<= 45` chars), strict evidence provenance, Palace Killer Invariance, and uncertainty silence.
- Structured recommendation validator (`src/core/ai/validator.ts`) rejecting hallucinated lineup IDs, expired timestamps, and oversized HUD strings.
- Asynchronous AI pipeline with context compression, sliding-window rate limiting, token budgeting, 5s caching, round-end stale-response rejection, and deterministic offline fallback.
- History Performance Intelligence engine (`src/core/history/history-analytics.ts`) and `HistoryView.tsx` strictly separating Measured Telemetry Facts from AI Tactical Interpretations, with the mandatory one-click `[PRACTICE — MIRAGE A RETAKE]` closed-loop trigger into Utility Room.

### Added — Milestone 4 (Live Match Engine & GSI Subsystem)
- Official Valve Game State Integration (GSI) parser, `.cfg` generator (`src/core/match/gsi-parser.ts`), and localhost HTTP listener (`src/main/gsi-listener.ts` on `127.0.0.1:3001`).
- Tactical Memory Engine (`src/core/match/tactical-memory.ts`) with `CONFIRMED`, `REPORTED`, and `INFERRED` provenance tiers, 30s visual staleness decay (`FRESH`, `AGING`, `STALE`, `EXPIRED`), Last-Known Information Overlay annotations, and strict **Palace Killer Invariance**.
- Deterministic Tactical Context Engine (`src/core/match/context-engine.ts`) with silence discipline when evidence is insufficient.
- 7-State Lineup Execution State Machine (`src/core/lineup-fsm/lineup-engine.ts`: `INACTIVE` -> `NEARBY` -> `POSITIONING` -> `ALIGNING` -> `READY` -> `EXECUTED` -> `NEXT`) with dual-radius spatial/angular hysteresis and 4 distinct completion classifications (`Attempted`, `Confirmed thrown`, `Confirmed landed`, `Manually completed`).
- Verified Bomb Timer Engine (`src/core/bomb-timer/bomb-timer-engine.ts`) with latency compensation, 10s (no-kit) and 5s (kit) defuse thresholds, urgency stages, and estimate labeling.
- Global HUD Priority & Collision Arbitrage Manager (`src/core/hud-manager/priority-manager.ts`) enforcing `CRITICAL > CONTEXTUAL > INFORMATIONAL > PASSIVE` priority rules and CS2 HUD safe zones.

### Added — Milestone 3 (Utility Room & Strategy Library)
- Normalized lineup database (`src/core/utility/lineup-database.ts`) covering all 6 Active Duty maps (Mirage, Inferno, Dust2, Nuke, Ancient, Anubis) with SVG crosshair landmark diagrams.
- Multi-phase tactical strategy library (`src/core/utility/strategy-database.ts`) across `BASIC`, `INTERMEDIATE`, `ADVANCED`, and `COORDINATED` tiers.
- Custom lineup creator modal (`LineupCreatorModal.tsx`), schema-validated JSON import/export with script sanitization (`json-io.ts`, `ImportExportModal.tsx`), zero-scraping external reference links (`external-providers.ts` for CSNADES & Scope.gg), and Match Preparation Profiles (`profile-manager.ts`).

### Added — Milestone 2 (Application Shell & Design System)
- Precision minimalist dark design system in React 18, TypeScript, Vite, and Tailwind CSS.
- Application shell featuring **only three primary navigation destinations** (`LIVE MATCH`, `UTILITY ROOM`, `HISTORY`) plus a compact secondary drawer (`SecondaryMenu.tsx`) for Settings, Gemini API Key Configuration, HUD Safe-Zone Calibration, Compliance Matrix, and Help.
- Windows DPAPI credential storage via Electron `safeStorage` (`src/main/credential-store.ts`) with HMAC tamper detection.
- Transparent click-through HUD overlay window (`src/main/overlay-manager.ts`) and SafeZoneEvaluator (`src/core/hud-manager/safe-zone-evaluator.ts`).

### Added — Milestone 1 (Repository Foundation & Compliance Engine)
- Initialized Git repository (`cs2-assistant`) with `.gitignore`, `README.md`, `ARCHITECTURE.md`, `COMPLIANCE.md`, and `CHANGELOG.md`.
- Runtime Capability Gating Engine (`src/core/compliance/capability-gate.ts`) and Feature Compliance Matrix (`src/core/compliance/compliance-matrix.ts`) with deep-freeze immutability, prototype-pollution protection, and multi-pass Unicode/leetspeak anti-claim scanner.
