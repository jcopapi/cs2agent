# Changelog

All notable changes to the **CS2 Assistant** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned for Milestone 2 (Application Shell & Design System)
- Minimalist Dark Design System implemented in React 18, Vite, and Tailwind CSS.
- Navigation shell featuring **only three primary destinations** (`LIVE MATCH`, `UTILITY ROOM`, `HISTORY`).
- Compact secondary drawer for Settings, Gemini Key Configuration, HUD Overlay Controls, and Compliance Matrix.
- Windows DPAPI credential storage integration via Electron `safeStorage`.
- Transparent click-through HUD overlay window with CS2 screen safe zone enforcement.

### Planned for Milestone 3 (Utility Room & Strategy Library)
- Normalized lineup database covering Mirage, Inferno, Dust2, Nuke, Ancient, and Anubis.
- Multi-phase tactical strategies across 4 tiers (`BASIC`, `INTERMEDIATE`, `ADVANCED`, `COORDINATED`).
- Interactive lineup cards with SVG vector crosshair alignment references.
- Custom lineup creator, personal collections, and schema-validated JSON import/export.
- Match Preparation Profiles that bind directly to live match context.

### Planned for Milestone 4 (Live Match Engine & GSI Subsystem)
- Native GSI HTTP listener on port 3001 with auth token validation and 15-second heartbeat.
- Dedicated offline simulation engine with pre-recorded scenarios.
- Tactical Memory Engine with provenance tracking and Palace Killer Invariance.
- Opponent Last-Known Information overlay with 30-second visual staleness decay.
- 7-stage Lineup Execution State Machine with dual-radius hysteresis.
- Millisecond-accurate 40-second synchronized Bomb Timer with 10s and 5s defuse kit thresholds.
- Safe HUD Priority Arbitrage (`CRITICAL`, `CONTEXTUAL`, `INFORMATIONAL`, `PASSIVE`).

### Planned for Milestone 5 (Gemini Tactical Coach & History Loop)
- Official `@google/genai` (>= 2.29.1) integration with `client.interactions.create` and `gemini-3.8-flash`.
- Strict Tactical AI System Prompt enforcing CS2 callouts (<= 45 chars) and uncertainty silence.
- Asynchronous AI pipeline with context compression (< 400 tokens), rate limiting, and 5s caching.
- Stale-response rejection guard dropping recommendations arriving after round transitions.
- Deterministic local offline rule engine fallback.
- Chronological match history with evidence-based analytics separating measured facts from inferences.
- Closed ecosystem practice loop trigger (`[PRACTICE — MIRAGE A RETAKE]`).

### Planned for Milestone 6 (Final Verification & Adversarial Hardening)
- Multi-tier requirement-driven opaque-box test suite (Tiers 1-4).
- Tier 5 adversarial white-box stress testing and forensic audit verification.

---

## [0.1.0] - 2026-10-19

### Added
- **Repository Foundation & Git Setup**:
  - Initialized clean Git repository (`cs2-assistant`) in `c:\Users\conta\Desktop\CS2Agent`.
  - Configured comprehensive `.gitignore` filtering `node_modules/`, `dist/`, `.env*`, build artifacts, and OS/IDE metadata while strictly preserving `.agents/` and documentation.
  - Established Conventional Commit protocol for milestones.
- **Core Governance & Compliance Documentation**:
  - `README.md`: Comprehensive overview detailing project mission, compliance commitments, the Three Primary Destinations (`LIVE MATCH`, `UTILITY ROOM`, `HISTORY`), architecture, getting started, and verification procedures.
  - `COMPLIANCE.md`: Definitive regulatory document citing 6 official Valve/Steam primary sources (SSA, Trusted Mode FAQ, VAC Guide, GSI Wiki, Major Rulebook, ESL Rules) with exact URLs and verification dates.
  - Anti-Cheat Invariants: Codified the Anti-Claim Invariant (never claim "VAC-proof", "100% VAC safe", or "Officially Valve approved") and the Six Zero Invariants (zero DLL injection, zero memory reading, zero process concealment, zero input automation, zero unauthorized hooks, zero unauthorized scraping).
  - Feature Compliance Matrix: Categorized all application capabilities into `VERIFIED PERMITTED`, `REQUIRES APPROVAL`, and `PROHIBITED`.
- **System Architecture Specification**:
  - `ARCHITECTURE.md`: Complete specification of the 4 decoupled layers (Core Domain, Main Process, Preload Layer, Renderer UI), GSI telemetry data flow, Windows DPAPI `safeStorage` credential encryption, and typed Electron IPC contracts (`ICS2AssistantAPI`).
  - Headless Testing Strategy: Detailed specification for the 11 test domains running in Vitest with zero Electron/DOM dependencies.
  - Palace Killer Invariance: Formal specification requiring strict separation of observation from interpretation.
- **Build & Development Tooling Configuration**:
  - `package.json`: Configured dependencies (`react`, `react-dom`, `@google/genai`, `lucide-react`, `clsx`, `tailwind-merge`) and devDependencies (`electron`, `vite`, `typescript`, `vitest`, `tailwindcss`, `postcss`, `autoprefixer`).
  - TypeScript Configurations: `tsconfig.json`, `tsconfig.node.json`, and `tsconfig.web.json` for composite build separation.
  - Bundler & Test Configurations: `vite.config.ts` and `vitest.config.ts`.
  - Minimal entry point: `index.html`.
- **Core Domain Compliance Engine**:
  - Pure TypeScript compliance types (`src/core/compliance/types.ts`).
  - Feature compliance matrix implementation (`src/core/compliance/compliance-matrix.ts`).
  - Runtime Capability Gating Engine (`src/core/compliance/capability-gate.ts`) actively gating capabilities across `COMPETITIVE_PROTECTED`, `PRACTICE_SERVER`, and `SIMULATION_PREVIEW`.
