# CS2 Assistant — Git Repository & Core Documentation Specification

**Author**: `explorer_m1_docs_git_1` (Teamwork Explorer)  
**Date**: 2026-10-19  
**Milestone**: Milestone 1 (Git Repository & Core Documentation)  
**Target Repository**: `cs2-assistant` (`c:\Users\conta\Desktop\CS2Agent`)  
**Status**: Authoritative Technical Specification & Ready-to-Commit File Templates  

---

## 1. Executive Summary & Purpose

This document provides the authoritative, verbatim specifications and implementation instructions for the Git repository initialization and core governance documentation of **CS2 Assistant**, as mandated by Milestone 1 of `PROJECT.md` and Requirement R1 of `ORIGINAL_REQUEST.md`.

CS2 Assistant is a production-grade, Valve-compliant Windows desktop tactical companion for Counter-Strike 2. Because competitive integrity, legal compliance, and software reliability are strict prerequisites, the repository foundation and core documentation must establish an uncompromising standard from the initial commit.

This specification provides:
1. **The Exact `.gitignore`**: Exhaustive rules covering Node.js dependencies, build outputs (`dist/`, `out/`), local environment secrets (`.env*`, `credentials.enc`), cache files, OS/IDE artifacts, while strictly preserving `.agents/` metadata and project documentation.
2. **The Authoritative `README.md`**: Professional, comprehensive documentation detailing the project overview, Valve compliance commitments, Anti-Claim Invariants, Six Zero Invariants, the Three Primary Destinations, architectural principles, quick start, build & test procedures, and zero-compromise security posture.
3. **The Authoritative `ARCHITECTURE.md`**: Detailed technical architecture documenting the 4 decoupled layers (Core Domain, Main Process, Preload Layer, Renderer Process), GSI telemetry ingress, DPAPI `safeStorage` credential encryption, typed IPC contracts, Safe HUD Priority Arbitrage, and the 11-Domain Headless Testing Strategy.
4. **The Initial `CHANGELOG.md`**: Standardized changelog following Keep a Changelog v1.1.0 and Semantic Versioning 2.0.0, commencing with `[0.1.0] - 2026-10-19` for Milestone 1.
5. **The Exact Git Initialization Protocol**: Exact command-line instructions, branch initialization, staging order, conventional commit message format, and post-initialization verification checks.

---

## 2. Specification: `.gitignore`

### 2.1 Design Principles
The `.gitignore` file must prevent committing:
- Installed dependencies and package manager caches (`node_modules/`, `.pnpm-store/`).
- Bundler and compiler output artifacts (`dist/`, `dist-electron/`, `out/`, `release/`, `build/`).
- Temporary development caches (`.vite/`, `*.tsbuildinfo`, `.turbo/`).
- Sensitive local files and credential stores (`.env`, `.env.*`, `credentials.enc`).
- Test coverage outputs (`coverage/`, `.nyc_output/`).
- Operating system files (Windows `Thumbs.db`, `Desktop.ini`; macOS `.DS_Store`).
- IDE and editor workspace configurations (`.vscode/*`, `.idea/`, `*.suo`).
- CS2 generated runtime configuration files (`gamestate_integration_cs2agent.cfg`).

**Crucial Preservation Invariant**:
The `.agents/` directory holds essential multi-agent teamwork metadata, project planning artifacts, and audit trails. The `.gitignore` must explicitly un-ignore and preserve `.agents/` and all project documentation (`*.md`).

### 2.2 Verbatim Content for `.gitignore`

```gitignore
# ==============================================================================
# CS2 Assistant - .gitignore
# Production-grade Git ignore rules for Electron + React + TypeScript + Vite
# ==============================================================================

# ------------------------------------------------------------------------------
# Dependencies & Package Managers
# ------------------------------------------------------------------------------
node_modules/
.pnp
.pnp.js
.pnpm-store/
.yarn/cache/
.yarn/unplugged/
.yarn/build-state.yml
.yarn/install-state.gz
yarn-error.log

# ------------------------------------------------------------------------------
# Build Outputs & Bundler Artifacts
# ------------------------------------------------------------------------------
dist/
dist-electron/
out/
release/
build/
bin/
obj/
*.tsbuildinfo
.vite/
.turbo/
.parcel-cache/

# ------------------------------------------------------------------------------
# Environment Variables, Secrets & DPAPI Stores
# ------------------------------------------------------------------------------
# Never commit actual secret keys or local credentials
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
*.local

# Allow example environment file
!.env.example

# Windows DPAPI / Electron safeStorage local encrypted data files
credentials.enc
*.credentials.enc
secrets.json
private_keys/
*.pem
*.key

# ------------------------------------------------------------------------------
# Logs & Process Dumps
# ------------------------------------------------------------------------------
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*
*.pid
*.seed
*.pid.lock

# ------------------------------------------------------------------------------
# Testing & Code Coverage
# ------------------------------------------------------------------------------
coverage/
.nyc_output/
test-results/
playwright-report/
cypress/videos/
cypress/screenshots/

# ------------------------------------------------------------------------------
# CS2 Runtime Generated Configurations (Local Machine)
# ------------------------------------------------------------------------------
# Prevent committing user-customized game integration config files generated locally
gamestate_integration_cs2agent.cfg
gamestate_integration_*.cfg

# ------------------------------------------------------------------------------
# Operating System Files
# ------------------------------------------------------------------------------
# Windows
Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
ehthumbs_vista.db
Desktop.ini
$RECYCLE.BIN/
*.cab
*.msi
*.msm
*.msp
*.lnk

# macOS
.DS_Store
.AppleDouble
.LSOverride
Icon
._*
.DocumentRevisions-V100
.fseventsd
.Spotlight-V100
.TemporaryItems
.Trashes
.VolumeIcon.icns

# Linux
*~
.fuse_hidden*
.directory
.Trash-*

# ------------------------------------------------------------------------------
# IDE & Code Editor Configurations
# ------------------------------------------------------------------------------
# JetBrains (WebStorm, IntelliJ IDEA)
.idea/
*.iws
*.iml
*.ipr

# Visual Studio / Visual Studio Code
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
!.vscode/launch.json
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Sublime Text
*.sublime-workspace
*.sublime-project

# ------------------------------------------------------------------------------
# Teamwork & Agent Metadata Preservation (DO NOT IGNORE)
# ------------------------------------------------------------------------------
# Explicitly preserve agent audit trails, briefing logs, and project documentation
!.agents/
!.agents/**
!PROJECT.md
!README.md
!ARCHITECTURE.md
!COMPLIANCE.md
!CHANGELOG.md
```

---

## 3. Specification: `README.md`

### 3.1 Design Principles
The `README.md` is the primary public interface and onboarding document for developers, competitive players, tournament reviewers, and community auditors. It must strictly comply with:
1. **The Anti-Claim Invariant**: Never claim "VAC-proof", "100% VAC safe", or "Officially Valve approved".
2. **The Six Zero Invariants**: Plainly document zero DLL injection, zero memory reading, zero process concealment, zero input automation, zero unauthorized hooks, and zero unauthorized scraping.
3. **The 3 Primary Destinations**: Showcase `LIVE MATCH`, `UTILITY ROOM`, and `HISTORY` prominently as the exclusive primary navigation structure.
4. **Architectural Principles**: Document the 4-tier decoupled architecture and headless testing methodology.
5. **Quick Start & Security**: Clear steps for installation, running the development build, testing, and CS2 GSI configuration.

### 3.2 Verbatim Content for `README.md`

```markdown
# CS2 Assistant

> **A production-grade, Valve-compliant Windows desktop tactical companion for Counter-Strike 2.**

[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![Electron](https://img.shields.io/badge/electron-33.x-blue.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/react-18.x-cyan.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/vite-5.4-purple.svg)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/vitest-2.1-yellow.svg)](https://vitest.dev/)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)]()

---

## Table of Contents
- [1. Overview](#1-overview)
- [2. Regulatory Compliance & Fair Play](#2-regulatory-compliance--fair-play)
  - [2.1 Compliance Posture (Anti-Claim Invariant)](#21-compliance-posture-anti-claim-invariant)
  - [2.2 The Six Zero Invariants](#22-the-six-zero-invariants)
  - [2.3 Official Primary Sources](#23-official-primary-sources)
- [3. The Three Primary Destinations](#3-the-three-primary-destinations)
  - [3.1 LIVE MATCH](#31-live-match)
  - [3.2 UTILITY ROOM](#32-utility-room)
  - [3.3 HISTORY](#33-history)
- [4. Compact Secondary System](#4-compact-secondary-system)
- [5. System Architecture](#5-system-architecture)
  - [5.1 The Four Decoupled Layers](#51-the-four-decoupled-layers)
  - [5.2 Palace Killer Invariance](#52-palace-killer-invariance)
  - [5.3 Windows DPAPI Safe Credential Storage](#53-windows-dpapi-safe-credential-storage)
- [6. Getting Started](#6-getting-started)
  - [6.1 Prerequisites](#61-prerequisites)
  - [6.2 Installation](#62-installation)
  - [6.3 CS2 Game State Integration (GSI) Setup](#63-cs2-game-state-integration-gsi-setup)
  - [6.4 Running the Application](#64-running-the-application)
- [7. Verification & Testing](#7-verification--testing)
  - [7.1 Headless Core Test Suite (11 Domains)](#71-headless-core-test-suite-11-domains)
  - [7.2 Production Build](#72-production-build)
- [8. Security & Privacy Disclosure](#8-security--privacy-disclosure)

---

## 1. Overview

**CS2 Assistant** is an advanced tactical intelligence and preparation desktop companion built for competitive Counter-Strike 2 players and coaches. 

Featuring an uncompromising minimalist dark user interface (charcoal/zinc-950, 1px subtle borders, restrained typography, zero gamer-RGB clutter), CS2 Assistant pairs a deterministic local tactical engine with an optional **Google Gemini AI Tactical Coach** (`gemini-3.8-flash` via `@google/genai`).

The application enables competitive players to execute a seamless training and match loop:
$$\text{UTILITY ROOM} \longrightarrow \text{LIVE MATCH} \longrightarrow \text{HISTORY} \longrightarrow \text{UTILITY ROOM}$$

---

## 2. Regulatory Compliance & Fair Play

### 2.1 Compliance Posture (Anti-Claim Invariant)

> **MANDATORY DISCLOSURE & ANTI-CLAIM INVARIANT**  
> CS2 Assistant makes **NO** claims of being *"VAC-proof"*, *"100% VAC safe"*, or *"Officially Valve approved"*. Valve Corporation does not endorse, certify, or whitelist third-party companion software.

CS2 Assistant defines its security posture strictly through transparent, verifiable technical mechanisms:
- Operates strictly **out-of-process** as an independent Windows user-mode application.
- Receives game telemetry **exclusively** via Valve's officially documented, outward-pushing **Game State Integration (GSI)** HTTP API.
- Incorporates an active runtime **Capability Gating Engine** restricting features across `COMPETITIVE_PROTECTED`, `PRACTICE_SERVER`, and `SIMULATION_PREVIEW` modes.

For comprehensive legal citations, rules matrix, and tournament regulations, consult [COMPLIANCE.md](./COMPLIANCE.md).

### 2.2 The Six Zero Invariants

To guarantee that the application can never be weaponized as a cheat vector, CS2 Assistant enforces the **Six Zero Invariants** across all code paths:

```
+-----------------------------------------------------------------------------------------+
|                                THE SIX ZERO INVARIANTS                                  |
+-----------------------------------------------------------------------------------------+
| 1. ZERO DLL Injection       | No CreateRemoteThread, LoadLibrary, or manual mapping     |
| 2. ZERO Memory Reading      | No OpenProcess(PROCESS_VM_READ), ReadProcessMemory        |
| 3. ZERO Process Concealment | No process hiding, stealth drivers, or anti-analysis code |
| 4. ZERO Input Automation    | No SendInput, mouse_event, keybd_event, or auto-macros    |
| 5. ZERO Unauthorized Hooks  | No DirectX/Vulkan/OpenGL Present hooks, no SetWindowsHook |
| 6. ZERO Unauthorized Scrape | No scraping bots against CSNADES, Scope.gg, HLTV          |
+-----------------------------------------------------------------------------------------+
```

### 2.3 Official Primary Sources

CS2 Assistant's architectural constraints are directly grounded in published policies:
- **Steam Subscriber Agreement (Section 4)**: `https://store.steampowered.com/subscriber_agreement/`
- **CS2 Trusted Mode FAQ**: `https://help.steampowered.com/en/faqs/view/09C5-DNSY-W1CB-F0BB`
- **Valve Anti-Cheat (VAC) Guide**: `https://help.steampowered.com/en/faqs/view/647C-5CC1-7DA0-4C0A`
- **Valve Developer GSI Wiki**: `https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Game_State_Integration`
- **Valve Major Championship Rulebook**: `https://store.steampowered.com/news/group/4145017/view/3032590299636592200`
- **ESL Pro Tour CS Rules & Regulations**: `https://pro.eslgaming.com/tour/cs/rules/`

---

## 3. The Three Primary Destinations

The application landing interface features **only three primary navigation destinations**, accessible via keyboard shortcuts (`1`, `2`, `3`) or the top navigation bar:

```
+-----------------------------------------------------------------------------+
|  [ 1. LIVE MATCH ]            [ 2. UTILITY ROOM ]            [ 3. HISTORY ] |
+-----------------------------------------------------------------------------+
```

### 3.1 LIVE MATCH
Designed for live game situational awareness and safe training simulation:
- **Opponent Last-Known Information**: Real-time tracking of opponent last-seen positions with progressive visual staleness decay (1.0 opacity fading to 0.15 over 30s) and confidence provenance badges (`CONFIRMED`, `REPORTED`, `INFERRED`).
- **Synchronized Bomb Timer**: Millisecond-accurate 40-second plant countdown synchronized to official GSI plant events (`BOMB PLANTED 00:24`), with color-coded 10s and 5s defuse kit feasibility thresholds.
- **Lineup Execution State Machine**: 7-stage finite state machine (`INACTIVE` -> `NEARBY` -> `POSITIONING` -> `ALIGNING` -> `READY` -> `EXECUTED` -> `NEXT`) with dual-radius hysteresis and 4 completion classifications (`Attempted`, `Confirmed thrown`, `Confirmed landed`, `Manually completed`).
- **Gemini Tactical Coach Live Feed**: Non-intrusive situational recommendations (max 45-character callouts) generated via Google Gemini 3.8 Flash, with automatic offline fallback when unconfigured.

### 3.2 UTILITY ROOM
The master tactical playbook and lineup repository:
- **Active Duty Maps**: Deep tactical support for Mirage (`de_mirage`), Inferno (`de_inferno`), Dust2 (`de_dust2`), Nuke (`de_nuke`), Ancient (`de_ancient`), and Anubis (`de_anubis`).
- **Multi-Phase Strategy Library**: Team playbooks tiered across `BASIC`, `INTERMEDIATE`, `ADVANCED`, and `COORDINATED` execution tiers.
- **Interactive Lineup Explorer**: Filterable by side (CT/T), grenade type (Smoke, Flashbang, HE Grenade, Molotov/Incendiary), with vector SVG crosshair aim references and step-by-step instructions.
- **Match Preparation Profiles**: Build custom execution packs that bind directly into the Live Match state machine and Gemini context.
- **Safe External Integration**: Direct deep-links to CSNADES and Scope.gg references without web scraping, plus schema-validated JSON import/export.

### 3.3 HISTORY
Post-match performance intelligence and tactical feedback:
- **Chronological Match Logs**: Complete records of rounds, scores, economy, and site execution stats.
- **Evidence-Based Analytics**: Rigorous separation of **Measured GSI Statistics** (ADR, utility damage, flash duration) from **AI Inferred Interpretations** (decision timing, positioning risk).
- **Closed Ecosystem Loop (`[PRACTICE — MIRAGE A RETAKE]`)**: One-click action on identified weaknesses that immediately opens the Utility Room pre-filtered to the exact strategy and lineups required to master the situation.

---

## 4. Compact Secondary System

Accessible via header buttons or `Ctrl+,`:
- **Gemini API Key Configuration**: Windows DPAPI-encrypted credential storage with live connection testing and secure removal.
- **HUD & Safe Overlay Configuration**: Transparency, scaling, crosshair/radar safe zone enforcement, and interactive calibration.
- **GSI Configuration**: Port selection (default 3001), auth token generation, and one-click `.cfg` generator for CS2.
- **Compliance Status Inspector**: Real-time Capability Gating status and active environment switch (`COMPETITIVE_PROTECTED`, `PRACTICE_SERVER`, `SIMULATION_PREVIEW`).

---

## 5. System Architecture

### 5.1 The Four Decoupled Layers

CS2 Assistant enforces clean architectural decoupling into four layers:
1. **Core Domain (`src/core/`)**: Pure TypeScript business logic containing GSI normalizers, tactical memory, lineup FSM, bomb timer, Gemini coach, and capability gating. Has **zero** Electron or DOM dependencies and is 100% headlessly testable under Vitest.
2. **Main Process (`src/main/`)**: Electron host managing application lifecycle, local GSI HTTP listener (port 3001), Windows DPAPI `safeStorage`, window management, and transparent click-through HUD overlay.
3. **Preload Layer (`src/preload/`)**: Context isolation barrier exposing a strictly typed, immutable IPC bridge (`window.cs2Assistant`).
4. **Renderer Layer (`src/renderer/`)**: React 18+ application built with Vite and Tailwind CSS implementing the precision minimalist dark design system.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full architectural documentation.

### 5.2 Palace Killer Invariance

A foundational invariant of CS2 Assistant's Tactical Memory is the strict distinction between **Observation** and **Interpretation**:
- When **Player X** dies at **Palace** and **Player Y** killed them, the system records:
  - Victim Player X location: **`CONFIRMED`** at Palace.
  - Killer Player Y location: **`UNCONFIRMED`** (unknown coordinate, zero map marker).
- The system **never** fabricates or assumes an unconfirmed killer position at the victim's death coordinates.

### 5.3 Windows DPAPI Safe Credential Storage

User Gemini API keys are encrypted at rest using Windows Data Protection API (DPAPI) via Electron's native `safeStorage` API:
- Keys are tied to the local Windows user profile.
- API keys are **never** logged to disk, console, or telemetry.
- API keys are **never** transmitted across IPC to the renderer process; the UI only receives a masked indicator (`AIzaSy...****`) and boolean status.
- Key removal securely unlinks the file and zeroes memory buffers.

---

## 6. Getting Started

### 6.1 Prerequisites
- **Operating System**: Windows 10 / Windows 11 (64-bit).
- **Node.js**: Version `>= 20.0.0` (LTS recommended, verified on Node 24).
- **Package Manager**: `npm` (>= 9.x).
- **Counter-Strike 2**: Installed via Steam.

### 6.2 Installation

```powershell
# Clone the repository
git clone https://github.com/your-org/cs2-assistant.git
cd cs2-assistant

# Install dependencies
npm install
```

### 6.3 CS2 Game State Integration (GSI) Setup

To push telemetry from CS2 into CS2 Assistant, create a GSI configuration file:

1. Locate your CS2 configuration directory:
   `C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive\game\csgo\cfg\`
2. Create a file named `gamestate_integration_cs2agent.cfg` with the following content:
   ```cfg
   "CS2Assistant Integration"
   {
       "uri" "http://127.0.0.1:3001"
       "timeout" "5.0"
       "buffer"  "0.1"
       "throttle" "0.1"
       "heartbeat" "15.0"
       "data"
       {
           "provider"            "1"
           "map"                 "1"
           "round"               "1"
           "player_id"           "1"
           "player_state"        "1"
           "player_weapons"      "1"
           "player_match_stats"  "1"
           "bomb"                "1"
       }
       "auth"
       {
           "token" "cs2assistant_local_token"
       }
   }
   ```
*(Alternatively, use the **Generate Config** button in the application Settings menu to auto-install this file).*

### 6.4 Running the Application

```powershell
# Start the Vite development server & Electron host
npm run dev
```

---

## 7. Verification & Testing

### 7.1 Headless Core Test Suite (11 Domains)

CS2 Assistant includes a comprehensive automated test suite in Vitest validating all 11 required domains and edge cases:

```powershell
# Run all unit and integration test domains headlessly
npm test
```

The test suite covers:
1. **Event Normalization**: Malformed JSON, corrupted structures, clamping abnormal bounds.
2. **Observation Provenance**: Immutable `CONFIRMED`, `REPORTED`, and `INFERRED` tracking.
3. **Last-Seen Expiration & Decay**: 30-second opacity curve and round boundary flushing.
4. **Tactical Confidence**: Palace Killer Invariance verification.
5. **Lineup State Machine**: Hysteresis, distance buffers, angle tolerances, and 4 completion types.
6. **Strategy Sequencing**: Phase transitions, profile binding, and contingency triggers.
7. **Match Detection & Gating**: Standby mode on silence, simulation mode isolation.
8. **AI Output Validation**: Schema verification, stale response rejection, offline fallback.
9. **Capability Gating**: Runtime restriction across competitive, practice, and preview environments.
10. **Persistence**: Disk storage integrity, atomic writing, and corrupted file recovery.
11. **Fault Resilience**: Network drops, provider format shifts, and overlay recovery.

### 7.2 Production Build

```powershell
# Typecheck and compile production bundle
npm run build

# Package desktop installer for Windows (NSIS / portable)
npm run package
```

---

## 8. Security & Privacy Disclosure

- **Telemetry & Logs**: CS2 Assistant collects **zero** remote analytics, tracking pixels, or diagnostic telemetry. All match histories and tactical notes remain strictly on your local machine.
- **Gemini AI Requests**: When configured with a user-provided Gemini API key, tactical prompts containing sanitized round state are transmitted directly to Google's Gemini API endpoints over HTTPS. No intermediate proxy servers are utilized.
- **Reporting Vulnerabilities**: If you discover any potential security or compliance concern, please submit an issue or contact the development team immediately.
```

---

## 4. Specification: `ARCHITECTURE.md`

### 4.1 Design Principles
`ARCHITECTURE.md` serves as the engineering reference manual for developers, testers, and security auditors. It must detail:
1. High-level system topology with ASCII diagrams.
2. The 4 Decoupled Layers (`src/core/`, `src/main/`, `src/preload/`, `src/renderer/`).
3. GSI Ingress and Inactive State Detection.
4. Windows DPAPI `safeStorage` Credential Pipeline.
5. The 8-Stage Gemini Tactical Coach Pipeline.
6. Safe HUD Overlay Priority Arbitrage and Screen Safe Zones.
7. Strongly Typed IPC Interface Contracts.
8. The 11-Domain Headless Testing Strategy.

### 4.2 Verbatim Content for `ARCHITECTURE.md`

```markdown
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
```

---

## 5. Specification: `CHANGELOG.md`

### 5.1 Design Principles
The changelog must adhere to:
- **Format**: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
- **Versioning**: [Semantic Versioning (SemVer 2.0.0)](https://semver.org/)
- **Structure**: Grouped into `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.
- Commences at `v0.1.0` representing Milestone 1 initialization, with clear forward roadmap markers.

### 5.2 Verbatim Content for `CHANGELOG.md`

```markdown
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
```

---

## 6. Exact Git Initialization Protocol

### 6.1 Prerequisites
Before executing the initialization protocol, ensure that:
1. `c:\Users\conta\Desktop\CS2Agent` is the active working directory.
2. The implementation files for Milestone 1 are written to disk:
   - Root configuration: `.gitignore`, `package.json`, `tsconfig.json`, `tsconfig.node.json`, `tsconfig.web.json`, `vite.config.ts`, `vitest.config.ts`, `tailwind.config.js`, `postcss.config.js`, `index.html`.
   - Root documentation: `README.md`, `ARCHITECTURE.md`, `COMPLIANCE.md`, `CHANGELOG.md`, `PROJECT.md`.
   - Core compliance code: `src/core/compliance/types.ts`, `src/core/compliance/compliance-matrix.ts`, `src/core/compliance/capability-gate.ts`.
   - Agent metadata directory: `.agents/`.

### 6.2 Step-by-Step PowerShell Command Sequence

The implementer must execute the following exact command sequence in Windows PowerShell:

```powershell
# Step 1: Navigate to project root (must be c:\Users\conta\Desktop\CS2Agent)
# (Working directory is already c:\Users\conta\Desktop\CS2Agent)

# Step 2: Initialize clean Git repository
git init

# Step 3: Configure default branch to main
git branch -M main

# Step 4: Configure local Git user identity (scoped to this repository)
git config user.name "CS2 Assistant Engineer"
git config user.email "engineer@cs2assistant.local"

# Step 5: Verify git status before staging
git status

# Step 6: Stage root documentation and configuration files
# Stage .gitignore first to ensure ignore patterns are active
git add .gitignore

# Step 7: Stage all initial project documentation
git add README.md ARCHITECTURE.md COMPLIANCE.md CHANGELOG.md PROJECT.md

# Step 8: Stage build tooling, configs, and package files
git add package.json tsconfig.json tsconfig.node.json tsconfig.web.json vite.config.ts vitest.config.ts tailwind.config.js postcss.config.js index.html

# Step 9: Stage core compliance source files
git add src/core/compliance/

# Step 10: Stage agents teamwork metadata
git add .agents/

# Step 11: Execute initial Milestone 1 commit following Conventional Commits
git commit -m "feat(m1): initialize cs2-assistant repository, compliance engine, and core documentation

- Initialize clean Git repository on main branch
- Add comprehensive .gitignore covering node_modules, build artifacts, secrets, and OS files
- Add authoritative README.md detailing project overview, 3 destinations, and compliance
- Add ARCHITECTURE.md specifying 4 decoupled layers, DPAPI safeStorage, IPC, and 11 test domains
- Add COMPLIANCE.md with 6 Valve primary sources, Anti-Claim Invariant, and Six Zero Invariants
- Add CHANGELOG.md initialized at v0.1.0 following Keep a Changelog and SemVer
- Implement pure TypeScript Core Compliance Engine and Capability Gate across environments
- Add complete build tooling (Electron, React, TypeScript, Vite, Vitest, Tailwind CSS)"

# Step 12: Verify commit status and tree integrity
git log -1 --stat
git status
```

### 6.3 Commit Verification Invariants
Upon running `git log -1 --stat` and `git status`:
1. Working tree must be clean (`nothing to commit, working tree clean`).
2. No ignored files (e.g., `node_modules/`, `dist/`, `.env`, `credentials.enc`) should be tracked.
3. Commit author is set to `CS2 Assistant Engineer <engineer@cs2assistant.local>`.
4. Branch name is `main`.

---

## 7. Coordination & Handoff Summary

### 7.1 Cross-Agent File Responsibility Matrix

| Component | Responsible Subagent | Deliverable Location | Target Commit Path |
|:---|:---|:---|:---|
| **Build & Tooling** | `explorer_m1_1` | `.agents/teamwork/explorer_m1_1/build_config_spec.md` | `package.json`, `tsconfig*.json`, `vite.config.ts`, `vitest.config.ts`, `tailwind.config.js`, `postcss.config.js`, `index.html` |
| **Compliance Engine** | `spec_miner_m1_compliance_1` | `.agents/teamwork/spec_miner_m1_compliance_1/compliance_spec.md` | `COMPLIANCE.md`, `src/core/compliance/*` |
| **Docs & Git Repo** | `explorer_m1_docs_git_1` (This Agent) | `.agents/teamwork/explorer_m1_docs_git_1/docs_git_spec.md` | `.gitignore`, `README.md`, `ARCHITECTURE.md`, `CHANGELOG.md`, Git Init Protocol |
| **Milestone 1 Implementation** | Implementer Agent | Target Files in Project Root | Complete Milestone 1 Commit |

### 7.2 Independent Verification Instructions
Any subsequent agent can verify this specification by inspecting:
1. `c:\Users\conta\Desktop\CS2Agent\.agents\teamwork\explorer_m1_docs_git_1\docs_git_spec.md`
2. `c:\Users\conta\Desktop\CS2Agent\.agents\teamwork\explorer_m1_docs_git_1\handoff.md`
3. Running the specified PowerShell commands to initialize the Git repository and verify working tree cleanliness.
