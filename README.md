# CS Overlay Assistant

> **A production-grade, Valve-compliant Windows desktop tactical companion for Counter-Strike 2.**

[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![Electron](https://img.shields.io/badge/electron-33.x-blue.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/react-18.x-cyan.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/vite-5.4-purple.svg)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/vitest-2.1-yellow.svg)](https://vitest.dev/)
[![Release](https://img.shields.io/github/v/release/jcopapi/csoverlayassistant?color=orange&label=release)](https://github.com/jcopapi/csoverlayassistant/releases/tag/v1.0.0)

---

## 📦 Downloads (v1.0.0)

| Tipo | Arquivo | Tamanho | Link de Download |
| :--- | :--- | :--- | :--- |
| 🚀 **Instalador Oficial (Windows)** | `CS.Overlay.Assistant.Setup.1.0.0.exe` | ~74 MB | [**Baixar Instalador**](https://github.com/jcopapi/csoverlayassistant/releases/download/v1.0.0/CS.Overlay.Assistant.Setup.1.0.0.exe) |
| ⚡ **Portátil (Executar sem instalar)** | `CS.Overlay.Assistant.1.0.0.exe` | ~73 MB | [**Baixar Portátil**](https://github.com/jcopapi/csoverlayassistant/releases/download/v1.0.0/CS.Overlay.Assistant.1.0.0.exe) |

> 📌 **Página de Release Oficial**: Acesse todas as notas e arquivos em [GitHub Releases v1.0.0](https://github.com/jcopapi/csoverlayassistant/releases/tag/v1.0.0).

---

## Table of Contents
- [1. Overview](#1-overview)
- [Downloads (Instalador & Portátil)](#-downloads-v100)
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
  - [6.1 Prerequisites](#62-prerequisites)
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
+-------------------------------------------------------------------------+
|                                THE SIX ZERO INVARIANTS                  |
+-------------------------------------------------------------------------+
| 1. ZERO DLL Injection       | No CreateRemoteThread, LoadLibrary, or manual mapping     |
| 2. ZERO Memory Reading      | No OpenProcess(PROCESS_VM_READ), ReadProcessMemory        |
| 3. ZERO Process Concealment | No process hiding, stealth drivers, or anti-analysis code |
| 4. ZERO Input Automation    | No SendInput, mouse_event, keybd_event, or auto-macros    |
| 5. ZERO Unauthorized Hooks  | No DirectX/Vulkan/OpenGL Present hooks, no SetWindowsHook |
| 6. ZERO Unauthorized Scrape | No scraping bots against CSNADES, Scope.gg, HLTV          |
+-------------------------------------------------------------------------+
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
