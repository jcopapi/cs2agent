# Milestone 1 Compliance & Core Engine Specification

**Document Version**: 1.0.0  
**Verification Date**: 2026-10-19  
**Status**: Authoritative Technical Specification & Source Blueprint  
**Target Codebase**: `CS2 Assistant` (`cs2-assistant`)  
**Target Modules**: Root `COMPLIANCE.md`, `src/core/compliance/types.ts`, `src/core/compliance/compliance-matrix.ts`, `src/core/compliance/capability-gate.ts`, `tests/domain9-permission-capability.test.ts`

---

## 1. Executive Summary & Regulatory Authority

CS2 Assistant is engineered as a passive, non-invasive tactical companion for Counter-Strike 2. The core security and legal philosophy of the application is **Zero Tampering, Non-Invasive Passive Telemetry, and Verifiable Fair Play**.

In competitive Counter-Strike 2, any utility that interacts with the game client must operate strictly within the boundaries defined by Valve Corporation and esports governing bodies. CS2 Assistant operates exclusively as a non-invasive, out-of-process user application that consumes Valve's officially documented Game State Integration (GSI) HTTP push protocol. It executes with zero DLL injection, zero memory reading, zero process concealment, zero input automation, zero unauthorized hooks, and zero unauthorized web scraping.

This document provides:
1. The complete, **verbatim authoritative text for root `COMPLIANCE.md`**, ready for immediate placement in the repository.
2. The complete, production-grade **pure TypeScript source code** for the Core Compliance Engine in `src/core/compliance/` (`types.ts`, `compliance-matrix.ts`, `capability-gate.ts`).
3. The comprehensive **Vitest test suite specification** for Domain 9 (Permission and Capability Gating across environments).
4. Mined **Features Discovered** and **Edge Cases** tables per Specification Miner instructions.

---

## 2. Verbatim Authoritative Text for `COMPLIANCE.md`

Below is the verbatim content to be saved to `c:\Users\conta\Desktop\CS2Agent\COMPLIANCE.md`:

````markdown
# Valve Corporation & Steam Regulatory Compliance Charter

**Document Version**: 1.0.0-PROD  
**Verification Date**: 2026-10-19  
**Status**: Authoritative Policy & Architectural Mandate  
**Applicability**: All Builds, Modules, and Operational Modes of CS2 Assistant

---

## 1. Regulatory Mission & Fair Play Commitment

CS2 Assistant is a passive tactical companion and post-match analysis suite for Counter-Strike 2. Its foundational design principle is **absolute technical and ethical compliance with Valve Corporation's security ecosystem and esports tournament integrity rules**.

The application is structured to ensure that competitive fairness is preserved under all conditions. CS2 Assistant does not provide micro-aim advantages, does not automate player actions, does not extract unearned real-time intelligence through memory scanning or DLL injection, and strictly respects Valve's data sanitization boundaries.

---

## 2. Authoritative Primary Sources & Verification Log

Every operational boundary, technical restriction, and capability gate in CS2 Assistant is derived directly from authoritative primary-source publications by Valve Corporation and international esports governing bodies.

| # | Regulatory Authority / Primary Source | Authoritative Canonical URL | Verification Date | Governing Scope | Mandatory Architectural Invariant |
|---|---------------------------------------|-----------------------------|-------------------|-----------------|-----------------------------------|
| 1 | **Steam Subscriber Agreement (SSA)** | `https://store.steampowered.com/subscriber_agreement/` | 2026-10-19 | Section 4: Online Conduct, Cheats, and Process Tampering | Prohibits the creation, distribution, or execution of cheats, process memory tampering, reverse engineering, or tools designed to bypass anti-cheat mechanisms. |
| 2 | **CS2 Trusted Mode FAQ** | `https://help.steampowered.com/en/faqs/view/09C5-DNSY-W1CB-F0BB` | 2026-10-19 | Binary integrity, dynamic code injection, and Trust Factor | Mandates zero dynamic code injection into `cs2.exe`. Confirms Valve maintains **no whitelist** for third-party injection programs; any injected binary severely degrades Trust Factor or prevents match queueing. |
| 3 | **Valve Anti-Cheat (VAC) System Guide** | `https://help.steampowered.com/en/faqs/view/647C-5CC1-7DA0-4C0A` | 2026-10-19 | Anti-cheat detection, memory inspection, automated penalties | Automated bans permanently apply to any account running external tools that modify or inspect CS2 memory or attach debuggers/hooks. VAC bans are permanent, automated, and non-negotiable. |
| 4 | **CS:GO / CS2 Game State Integration Wiki** | `https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Game_State_Integration` | 2026-10-19 | Official developer telemetry interface via HTTP POST | Telemetry must be consumed passively via Valve's built-in HTTP push architecture. Payload schemas in live competitive matches are deliberately sanitized by Valve's game server. |
| 5 | **Valve Major Championship Rulebook** | `https://store.steampowered.com/news/group/4145017/view/3032590299636592200` | 2026-10-19 | Coaching communications, digital assistance, tournament client integrity | Forbids outside electronic coaching assistance during live rounds; forbids non-whitelisted electronic overlays or automated real-time tactical advisors on tournament player systems. |
| 6 | **ESL Pro Tour CS Rules & Regulations** | `https://pro.eslgaming.com/tour/cs/rules/` | 2026-10-19 | External software, overlays, scripts, coach interactions | Strictly prohibits scripts, macros, or unauthorized external overlays conferring unfair tactical advantages. Coach voice communication is restricted to tactical timeouts. |

---

## 3. The Strict Anti-Claim Invariant

To ensure absolute truthfulness, consumer transparency, and adherence to Valve's published technical policies, CS2 Assistant enforces a permanent, mandatory prohibition against misleading marketing and safety claims.

### 3.1 Prohibited Phrasings (Forbidden in All Contexts)
Under **NO circumstances** shall CS2 Assistant, its documentation, user interface, marketing materials, code comments, or distribution channels state or imply:
1. **"VAC-Proof"**
2. **"100% VAC Safe"**
3. **"Officially Valve Approved"**
4. **"Valve Certified"**
5. **"Whitelisted by Valve"**

### 3.2 Regulatory & Technical Rationale
1. **Valve Does Not Whitelist Software**: As explicitly stated in Valve's Trusted Mode FAQ:
   > *"Valve does not maintain a whitelist of safe software to inject because even benign applications can be exploited as vectors for cheats. Valve does not endorse or whitelist third-party programs."*
   Any tool claiming to be "whitelisted" or "officially approved" by Valve is misrepresenting Valve's security architecture.
2. **Anti-Cheat is Heuristic and Evolving**: Valve Anti-Cheat (VAC) and VACNet employ machine learning, server-side telemetry analysis, and dynamic heuristics that evolve continuously. No third-party software can guarantee immunity against future anti-cheat updates.
3. **Strict Truthful Compliance Posture**: CS2 Assistant describes its security posture strictly and factually:
   > *"CS2 Assistant operates exclusively as an out-of-process, non-invasive desktop companion that consumes Valve's officially documented Game State Integration HTTP protocol. It performs zero DLL injection, zero memory reading, zero process concealment, zero input automation, zero unauthorized hooks, and zero unauthorized web scraping."*

### 3.3 Automated CI Enforcement
All automated test pipelines execute a static compliance check scanning repository text files for prohibited phrases. Any commit containing prohibited marketing terms fails the build immediately.

---

## 4. The Six Zero Anti-Cheat Invariants

CS2 Assistant is engineered around six non-negotiable architectural invariants:

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

### Invariant 1: Zero DLL Injection
- The application binary executes strictly as an independent Windows user-mode desktop process (`cs2-assistant.exe`).
- The application contains zero invocations of Win32 process injection APIs, including `OpenProcess`, `VirtualAllocEx`, `WriteProcessMemory`, `CreateRemoteThread`, `QueueUserAPC`, or manual Portable Executable (PE) memory mapping into `cs2.exe`.
- Zero native modules or dynamically linked libraries are loaded into Counter-Strike 2 memory space.

### Invariant 2: Zero Memory Reading
- The application does not scan, inspect, or query the virtual memory pages of `cs2.exe` or its loaded modules (`client.dll`, `engine2.dll`).
- Zero memory offsets, pointer dereferences, or virtual table (VTable) inspections exist anywhere in the application source code.
- All live match data is acquired solely from the standard HTTP payload pushed outward by Counter-Strike 2 via the official Game State Integration interface.

### Invariant 3: Zero Process Concealment
- The application does not alter its process token, hide its window handles, disguise its image name, or employ rootkit-like driver techniques.
- The application runs visibly in Windows Task Manager as an Electron/Node process and can be fully inspected by any anti-cheat software (VAC, FACEIT AC, Easy Anti-Cheat).
- Zero anti-debugging, anti-analysis, or code obfuscation techniques designed to evade anti-cheat scanners are utilized.

### Invariant 4: Zero Input Automation
- The application contains zero mechanisms to synthesize keyboard keystrokes, mouse clicks, or mouse movements sent to the game window.
- The application contains zero invocations of `SendInput`, `mouse_event`, `keybd_event`, or virtual HID drivers.
- No automated jumpthrow scripts, snap-to-target crosshair positioning, recoil compensation, or rapid-fire macros exist.
- All user interaction inside CS2 Assistant is triggered strictly via manual user interaction inside its own UI window or benign global hotkeys that do not forward input into `cs2.exe`.

### Invariant 5: Zero Unauthorized Hooks
- The application does not install Virtual Method Table (VMT) hooks, MinHook, Microsoft Detours, or trampoline hooks into system graphics drivers, DirectX 11, DirectX 12, or Vulkan swap chains.
- Overlays are rendered using standard OS transparent windows (Electron transparent frameless window with `setIgnoreMouseEvents(true, { forward: true })`) or displayed on a secondary monitor.

### Invariant 6: Zero Unauthorized Scraping
- The application does not perform automated scraping, DOM parsing, or unauthorized API calls against third-party tactical websites (such as CSNADES, Scope.gg, or HLTV).
- Utility and strategy libraries are populated via verified static local datasets, user-created collections, or official user-provided JSON imports with proper attribution links.

---

## 5. Comprehensive Feature Compliance Matrix

The Feature Compliance Matrix classifies every functional capability into one of three regulatory tiers and governs how features are enabled or suppressed at runtime.

| Classification | Definition | Runtime Behavior |
|----------------|------------|------------------|
| **`VERIFIED PERMITTED`** | Explicitly supported by official Valve APIs or passive out-of-game data structures. | Enabled in all environments (`COMPETITIVE_PROTECTED`, `PRACTICE_SERVER`, `SIMULATION_PREVIEW`). |
| **`REQUIRES APPROVAL`** | Safe when restricted, but could present fairness concerns if rendered inappropriately in ranked play. | Gated: Suppressed or converted to passive mode in `COMPETITIVE_PROTECTED`; fully enabled in `PRACTICE_SERVER` and `SIMULATION_PREVIEW`. |
| **`PROHIBITED`** | Violates Valve Terms of Service, anti-cheat rules, or tournament regulations. | Hard-blocked across ALL environments; zero code paths exist in the application. |

### Complete Matrix of System Features

| Feature ID | Feature Name | Classification | Permitted Environments | Enforcement Mechanism | Governing Authority & Justification |
|------------|--------------|----------------|------------------------|-----------------------|--------------------------------------|
| `gsi_http_listener` | GSI HTTP Telemetry Listener | `VERIFIED PERMITTED` | ALL | Passive HTTP server on localhost | Official Valve GSI Specification. Valve-provided external push mechanism. |
| `gsi_delta_engine` | GSI Delta & State Parser | `VERIFIED PERMITTED` | ALL | Memory-safe JSON delta parsing | Official Valve GSI Specification. Computes deltas purely from Valve payloads. |
| `static_lineup_db` | Static Lineup & Strategy Database | `VERIFIED PERMITTED` | ALL | Local SQLite / JSON storage | Valve SSA Section 4. Passive reference guide; zero game interaction. |
| `svg_landmark_reference` | SVG Visual Landmark Diagrams | `VERIFIED PERMITTED` | ALL | Vector rendering in UI | Valve SSA Section 4. Out-of-game educational material. |
| `custom_lineup_storage` | Custom Lineup & Collection Creator | `VERIFIED PERMITTED` | ALL | Local disk persistence | Valve SSA Section 4. User data management; zero game interaction. |
| `match_prep_profiles` | Match Preparation Profiles (Planning) | `VERIFIED PERMITTED` | ALL | Pre-match strategic planning state | Valve SSA Section 4. Tactical preparation; zero real-time cheating. |
| `gsi_bomb_timer` | GSI-Synchronized Bomb Timer | `VERIFIED PERMITTED` | ALL | Clock sync to `bomb.state == "planted"` | Valve GSI Wiki. Broadcast event publicly available to all spectators and players. |
| `tactical_memory_provenance`| Tactical Memory Provenance Engine | `VERIFIED PERMITTED` | ALL | Provenance tracking (`CONFIRMED`, etc.) | Valve SSA Section 4. Mathematical analysis of legally acquired telemetry. |
| `palace_observation_filter`| Palace Observation vs Killer Filter | `VERIFIED PERMITTED` | ALL | Strict isolation logic in memory | Fair Play Rule. Prevents false positive position inference. |
| `memory_decay_round_purge` | Memory Decay & Round Boundary Wipe | `VERIFIED PERMITTED` | ALL | Deterministic TTL timer and flush | Fair Play Rule. Prevents stale information leakage across rounds. |
| `history_match_analytics` | Post-Match Analytics & History | `VERIFIED PERMITTED` | ALL | Post-match data aggregation | Valve SSA Section 4. Historical performance review. |
| `practice_retake_trigger` | History to Utility Room Practice Trigger | `VERIFIED PERMITTED` | ALL | Deep-link state transition in UI | Valve SSA Section 4. Training loop navigation within companion app. |
| `gemini_ai_tactical_coach` | Gemini AI Tactical Coach | `VERIFIED PERMITTED` | ALL | Asynchronous cloud LLM inference | Valve Major & ESL Rules. High-level advice between rounds; no micro-aim guidance. |
| `stale_ai_response_validation`| Stale AI Response Validation | `VERIFIED PERMITTED` | ALL | Dropped if round has already resumed | Valve Major & ESL Rules. Enforces that advice is not delivered during live gunfights. |
| `transparent_desktop_hud` | Transparent Desktop HUD Window | `REQUIRES APPROVAL` | ALL (with Safe Zones) | Electron click-through overlay | CS2 Trusted Mode FAQ. Uses standard OS windowing; zero code injection. |
| `hud_priority_arbitrage` | HUD Module Priority Arbitrage | `REQUIRES APPROVAL` | ALL | Layout arbitration engine | Fair Play. Prevents visual clutter or screen occlusion during combat. |
| `cs2_safe_zone_enforcement` | CS2 Screen Safe Zone Enforcement | `REQUIRES APPROVAL` | ALL | Geometry clipping (crosshair/radar clear) | Fair Play. Guarantees 450x450px crosshair center is 100% unobstructed. |
| `practice_lineup_alignment`| Lineup Real-Time Crosshair Alignment | `REQUIRES APPROVAL` | `PRACTICE_SERVER`, `SIMULATION_PREVIEW` | Gated off in `COMPETITIVE_PROTECTED` | Tournament / Fair Play Rules. Visual crosshair cues prohibited in ranked competitive play. |
| `practice_trajectory_preview`| Practice Grenade Trajectory Preview | `REQUIRES APPROVAL` | `PRACTICE_SERVER`, `SIMULATION_PREVIEW` | Gated off in `COMPETITIVE_PROTECTED` | Tournament / Fair Play Rules. Permitted only in offline practice with sv_cheats. |
| `interactive_hud_preview` | Interactive HUD Simulation & Calibration | `REQUIRES APPROVAL` | `SIMULATION_PREVIEW` | Isolated sandbox mock generator | Fair Play. Allows visual customization without active game connection. |
| `memory_reading` | Process Memory Reading / Inspection | `PROHIBITED` | NONE (Hard blocked) | Not implemented; zero Win32 calls | Valve Anti-Cheat (VAC) Guide. Direct ban trigger. |
| `dll_injection` | DLL Injection / Foreign Code Execution| `PROHIBITED` | NONE (Hard blocked) | Not implemented; zero Win32 calls | CS2 Trusted Mode FAQ & VAC Guide. Direct ban trigger. |
| `graphics_pipeline_hooking`| Direct3D / Vulkan Pipeline Hooking | `PROHIBITED` | NONE (Hard blocked) | Not implemented; zero hooks | CS2 Trusted Mode FAQ. Triggers immediate untrusted status. |
| `input_automation` | Keystroke / Mouse Input Automation | `PROHIBITED` | NONE (Hard blocked) | Not implemented; zero input APIs | Valve SSA Section 4. Cheating / Macro automation ban. |
| `jumpthrow_recoil_macros` | Jumpthrow & Recoil Compensation Macros | `PROHIBITED` | NONE (Hard blocked) | Not implemented; zero macro logic | Valve Major Rulebook & ESL Rules. Direct tournament disqualification. |
| `esp_wallhack_overlay` | Real-Time Wallhack / ESP Overlay | `PROHIBITED` | NONE (Hard blocked) | Not implemented; zero spatial drawing | Valve Anti-Cheat (VAC) Guide. Severe cheating violation. |
| `aim_assistance_triggerbot`| Aim Assistance / Auto-Shoot Triggerbot | `PROHIBITED` | NONE (Hard blocked) | Not implemented; zero aim code | Valve Anti-Cheat (VAC) Guide. Severe cheating violation. |
| `spectator_data_mining` | Spectator Telemetry in Competitive Mode| `PROHIBITED` | NONE (Hard blocked) | Sanitizer discards allplayers in ranked | Fair Play Rules. Prevents ghosting enemy coordinates. |
| `unauthorized_web_scraping`| Unauthorized Web Scraping | `PROHIBITED` | NONE (Hard blocked) | Zero scrapers; static/user JSON only | Legal / Terms of Service compliance. |

---

## 6. Runtime Capability Gating Across Environments

The application dynamically checks the match context and actively gates features across three distinct operating modes:

```
+---------------------------------------------------------------------------------------------------+
|                                RUNTIME CAPABILITY GATING ENGINE                                   |
+---------------------------------------------------------------------------------------------------+
| Environment               | GSI Telemetry Level | Permitted Presentation    | Lineup Alignment    |
+---------------------------+---------------------+---------------------------+---------------------+
| 1. COMPETITIVE_PROTECTED  | Sanitized Player GSI| Secondary Monitor /       | PASSIVE REFERENCE   |
|   (Premier, Ranked, FACEIT| (No enemy coords)   | Passive Non-Obtrusive HUD | (No in-game cues)   |
+---------------------------+---------------------+---------------------------+---------------------+
| 2. PRACTICE_SERVER        | Full Local Telemetry| Full Overlay Active       | ACTIVE GUIDANCE     |
|   (Offline, sv_cheats 1)  | (Positions enabled) | (Landmarks & Paths)       | (Step-by-step cues) |
+---------------------------+---------------------+---------------------------+---------------------+
| 3. SIMULATION_PREVIEW     | Mock Synthetic GSI  | Interactive HUD Preview   | DEMO WALKTHROUGH    |
|   (App UI / Offline Mode) | (Zero game required)| (Draggable, Testable)     | (Full exploration)  |
+---------------------------+---------------------+---------------------------+---------------------+
```

### 6.1 `COMPETITIVE_PROTECTED` Mode
- **Detection**: Default state. Active when `map.mode` is `"competitive"`, `"premier"`, or connected to public servers, and `sv_cheats` is not `1`.
- **Runtime Enforcements**:
  1. `practice_lineup_alignment` is strictly disabled. No crosshair guidance is rendered over the game viewport.
  2. Safe zones (crosshair 450x450px, radar, killfeed) are actively enforced.
  3. Enemy player coordinates from GSI (if any exist due to misconfigured server) are filtered out and discarded immediately.
  4. HUD overlay operates strictly in click-through mode (`setIgnoreMouseEvents(true, { forward: true })`).

### 6.2 `PRACTICE_SERVER` Mode
- **Detection**: Active when connected to local host (`127.0.0.1`), offline server with bots, or server where `sv_cheats` is confirmed `1`.
- **Runtime Permissions**:
  1. Full interactive lineup execution state machine is unlocked.
  2. Alignment landmark guidance and throw timing indicators are visible.
  3. Practice grenade trajectories and landing zone verification are permitted.

### 6.3 `SIMULATION_PREVIEW` Mode
- **Detection**: Activated when CS2 is not running, or when the user launches Simulation Mode from the Live Match destination.
- **Runtime Permissions**:
  1. Safe sandbox environment generating synthetic GSI events.
  2. Full interactive calibration of HUD module coordinates, scale, and opacity.
  3. Safe demonstration of bomb timers, tactical memory graphs, and lineup walkthroughs without connecting to any game process.

### 6.4 Fail-Safe Closed Invariant
If the match environment cannot be definitively determined with 100% confidence, the Capability Gating Engine **fails safe closed** and locks the environment to `COMPETITIVE_PROTECTED`.

---

## 7. Tournament & Competitive Rule Harmonization

When CS2 Assistant is installed on machines used for sanctioned esports competitions (ESL Pro Tour, BLAST Premier, Valve Major Championships):
1. **Coaching Constraints**: The Gemini AI Tactical Coach and real-time advice modules must be disabled during live matches in accordance with Valve Major Rulebook coaching regulations.
2. **Overlay Disabling**: If tournament officials require zero desktop overlays, CS2 Assistant's HUD Overlay window can be completely suppressed via one-click toggle or command-line flag (`--no-overlay`), redirecting all match information to a companion secondary monitor or tablet browser.
3. **Audit Readiness**: The application provides an open, human-readable compliance configuration and audit log verifying that zero unauthorized hooks or memory tools were active.
````

---

## 3. Pure TypeScript Implementation for `src/core/compliance/`

The Core Compliance Layer is designed as pure TypeScript with **zero external dependencies**, deterministic evaluation, and 100% testability.

### 3.1 `src/core/compliance/types.ts`

```typescript
/**
 * CS2 Assistant - Core Compliance Types
 *
 * Authoritative type definitions governing capability gating, regulatory classifications,
 * anti-cheat invariants, and environment runtime boundaries.
 *
 * Pure TypeScript - Zero external dependencies.
 */

/**
 * Operational environment modes recognized by the compliance layer.
 */
export type EnvironmentMode = 'COMPETITIVE_PROTECTED' | 'PRACTICE_SERVER' | 'SIMULATION_PREVIEW';

/**
 * Regulatory classification tiers for application capabilities.
 */
export type ComplianceStatus = 'VERIFIED_PERMITTED' | 'REQUIRES_APPROVAL' | 'PROHIBITED';

/**
 * Functional category classification for features.
 */
export type ComplianceCategory =
  | 'TELEMETRY'
  | 'TACTICAL_MEMORY'
  | 'STRATEGY_LINEUP'
  | 'BOMB_INTELLIGENCE'
  | 'OVERLAY_HUD'
  | 'AI_COACH'
  | 'PROHIBITED_CHEATING';

/**
 * Unique identifiers for all evaluated features in CS2 Assistant.
 */
export type ComplianceFeatureId =
  // Telemetry & GSI
  | 'gsi_http_listener'
  | 'gsi_delta_engine'
  // Lineup & Strategy
  | 'static_lineup_db'
  | 'svg_landmark_reference'
  | 'custom_lineup_storage'
  | 'match_prep_profiles'
  // Bomb & Memory
  | 'gsi_bomb_timer'
  | 'tactical_memory_provenance'
  | 'palace_observation_filter'
  | 'memory_decay_round_purge'
  // Analytics & History
  | 'history_match_analytics'
  | 'practice_retake_trigger'
  // AI Coach
  | 'gemini_ai_tactical_coach'
  | 'stale_ai_response_validation'
  // Overlay & HUD
  | 'transparent_desktop_hud'
  | 'hud_priority_arbitrage'
  | 'cs2_safe_zone_enforcement'
  | 'practice_lineup_alignment'
  | 'practice_trajectory_preview'
  | 'interactive_hud_preview'
  // Prohibited Vectors (Must NEVER be permitted)
  | 'memory_reading'
  | 'dll_injection'
  | 'graphics_pipeline_hooking'
  | 'input_automation'
  | 'jumpthrow_recoil_macros'
  | 'esp_wallhack_overlay'
  | 'aim_assistance_triggerbot'
  | 'spectator_data_mining'
  | 'unauthorized_web_scraping';

/**
 * Rule definition for a specific feature in the compliance matrix.
 */
export interface IFeatureComplianceRule {
  readonly id: ComplianceFeatureId;
  readonly name: string;
  readonly status: ComplianceStatus;
  readonly category: ComplianceCategory;
  readonly description: string;
  readonly permittedEnvironments: readonly EnvironmentMode[];
  readonly enforcement: string;
  readonly authorityJustification: string;
}

/**
 * Result returned when evaluating a capability's permission state.
 */
export interface CapabilityEvaluationResult {
  readonly permitted: boolean;
  readonly featureId: string;
  readonly environment: EnvironmentMode;
  readonly status: ComplianceStatus | 'UNKNOWN';
  readonly reason: string;
  readonly rule?: IFeatureComplianceRule;
}

/**
 * Listener callback signature for environment mode changes.
 */
export type EnvironmentChangeListener = (newEnv: EnvironmentMode, oldEnv: EnvironmentMode) => void;

/**
 * Interface for the runtime Capability Gating Engine.
 */
export interface ICapabilityGate {
  /**
   * The active operational environment.
   */
  readonly currentEnvironment: EnvironmentMode;

  /**
   * Updates the active operational environment.
   * Dispatches change events to all registered listeners.
   */
  setEnvironment(env: EnvironmentMode): void;

  /**
   * Quick boolean check determining if a feature is permitted in the current environment.
   */
  isFeaturePermitted(featureId: string): boolean;

  /**
   * Returns a list of all feature IDs currently permitted in the active environment.
   */
  getPermittedFeatures(): string[];

  /**
   * Retrieves the compliance rule for a specific feature, if known.
   */
  getFeatureRule(featureId: string): IFeatureComplianceRule | undefined;

  /**
   * Performs an in-depth capability evaluation returning a detailed explanation.
   */
  evaluateCapability(featureId: string): CapabilityEvaluationResult;

  /**
   * Asserts that a feature is permitted, throwing ComplianceViolationError if not.
   */
  assertFeaturePermitted(featureId: string): void;

  /**
   * Registers a listener callback invoked whenever the operational environment changes.
   * Returns an unregister function.
   */
  onEnvironmentChange(listener: EnvironmentChangeListener): () => void;
}

/**
 * Result of an Anti-Claim static scan.
 */
export interface AntiClaimCheckResult {
  readonly clean: boolean;
  readonly violations: readonly {
    readonly matchedPhrase: string;
    readonly snippet: string;
  }[];
}
```

---

### 3.2 `src/core/compliance/compliance-matrix.ts`

```typescript
/**
 * CS2 Assistant - Authoritative Compliance Matrix
 *
 * Defines the complete feature-by-feature compliance matrix, governing permissions across
 * COMPETITIVE_PROTECTED, PRACTICE_SERVER, and SIMULATION_PREVIEW environments.
 *
 * Pure TypeScript - Zero external dependencies.
 */

import {
  ComplianceCategory,
  ComplianceFeatureId,
  ComplianceStatus,
  EnvironmentMode,
  IFeatureComplianceRule,
  AntiClaimCheckResult,
} from './types';

/**
 * Authoritative registry of compliance rules for every capability in CS2 Assistant.
 */
export const COMPLIANCE_MATRIX: Record<ComplianceFeatureId, IFeatureComplianceRule> = Object.freeze({
  // --- TELEMETRY & GSI ---
  gsi_http_listener: {
    id: 'gsi_http_listener',
    name: 'GSI HTTP Telemetry Listener',
    status: 'VERIFIED_PERMITTED',
    category: 'TELEMETRY',
    description: 'Local HTTP server consuming Valve Game State Integration JSON push payloads.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Listens passively on localhost; does not touch CS2 process.',
    authorityJustification: 'Official Valve GSI API standard. Built-in game telemetry.',
  },
  gsi_delta_engine: {
    id: 'gsi_delta_engine',
    name: 'GSI Delta & State Parser',
    status: 'VERIFIED_PERMITTED',
    category: 'TELEMETRY',
    description: 'Parses incoming JSON deltas to track game lifecycle events.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'In-memory JSON processing with strict schema validation.',
    authorityJustification: 'Standard data parsing of official telemetry.',
  },

  // --- LINEUP & STRATEGY ---
  static_lineup_db: {
    id: 'static_lineup_db',
    name: 'Static Lineup & Strategy Database',
    status: 'VERIFIED_PERMITTED',
    category: 'STRATEGY_LINEUP',
    description: 'Pre-populated, verified offline database of lineups and multi-phase strategies.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Read-only local data access; zero process interaction.',
    authorityJustification: 'Steam Subscriber Agreement Sec. 4. Passive guide material.',
  },
  svg_landmark_reference: {
    id: 'svg_landmark_reference',
    name: 'SVG Visual Landmark Diagrams',
    status: 'VERIFIED_PERMITTED',
    category: 'STRATEGY_LINEUP',
    description: 'Compact vector graphics illustrating lineup pin positions and aim landmarks.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Rendered in companion UI window.',
    authorityJustification: 'Static visual reference; zero interaction with game client.',
  },
  custom_lineup_storage: {
    id: 'custom_lineup_storage',
    name: 'Custom Lineup & Collection Storage',
    status: 'VERIFIED_PERMITTED',
    category: 'STRATEGY_LINEUP',
    description: 'User creation, editing, and local JSON persistence of custom lineups.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Local file persistence with schema sanitization.',
    authorityJustification: 'Standard desktop user data management.',
  },
  match_prep_profiles: {
    id: 'match_prep_profiles',
    name: 'Match Preparation Profiles (Planning Mode)',
    status: 'VERIFIED_PERMITTED',
    category: 'STRATEGY_LINEUP',
    description: 'Pre-match strategy bindings loaded into Live Match and AI context.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Internal companion app state binding.',
    authorityJustification: 'Out-of-game tactical preparation.',
  },

  // --- BOMB & MEMORY ---
  gsi_bomb_timer: {
    id: 'gsi_bomb_timer',
    name: 'GSI-Synchronized Bomb Timer',
    status: 'VERIFIED_PERMITTED',
    category: 'BOMB_INTELLIGENCE',
    description: 'Digital countdown synchronized to official GSI bomb.state == "planted" event.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Synchronized purely via public GSI event timestamp and countdowns.',
    authorityJustification: 'Valve GSI Wiki. Relies only on public event broadcast.',
  },
  tactical_memory_provenance: {
    id: 'tactical_memory_provenance',
    name: 'Tactical Memory Provenance Engine',
    status: 'VERIFIED_PERMITTED',
    category: 'TACTICAL_MEMORY',
    description: 'Maintains round history with CONFIRMED, REPORTED, and INFERRED labels.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Internal analytical memory model; zero game intrusion.',
    authorityJustification: 'Mathematical analysis of legally received telemetry.',
  },
  palace_observation_filter: {
    id: 'palace_observation_filter',
    name: 'Palace Observation vs Killer Filter',
    status: 'VERIFIED_PERMITTED',
    category: 'TACTICAL_MEMORY',
    description: 'Guarantees victim death location never misclassifies killer location.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Strict provenance separation logic in Tactical Memory.',
    authorityJustification: 'Fair Play Invariant. Eliminates speculative false intelligence.',
  },
  memory_decay_round_purge: {
    id: 'memory_decay_round_purge',
    name: 'Memory Decay & Round Boundary Wipe',
    status: 'VERIFIED_PERMITTED',
    category: 'TACTICAL_MEMORY',
    description: 'Applies time-decay curves to observations and wipes 100% of spatial data on round end.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Deterministic TTL and event listener on round.phase == "over".',
    authorityJustification: 'Fair Play Invariant. Prevents cross-round ghosting.',
  },

  // --- ANALYTICS & HISTORY ---
  history_match_analytics: {
    id: 'history_match_analytics',
    name: 'Post-Match Analytics & Match History',
    status: 'VERIFIED_PERMITTED',
    category: 'TACTICAL_MEMORY',
    description: 'Chronological match records separating measured statistics from AI interpretation.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Offline SQLite / disk database aggregation.',
    authorityJustification: 'Standard post-game statistical review.',
  },
  practice_retake_trigger: {
    id: 'practice_retake_trigger',
    name: 'History to Utility Room Practice Trigger',
    status: 'VERIFIED_PERMITTED',
    category: 'STRATEGY_LINEUP',
    description: 'One-click deep-link opening specific lineups/strategies in Utility Room.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Internal UI navigation transition.',
    authorityJustification: 'Application workflow completion; zero game interaction.',
  },

  // --- AI COACH ---
  gemini_ai_tactical_coach: {
    id: 'gemini_ai_tactical_coach',
    name: 'Gemini AI Tactical Coach',
    status: 'VERIFIED_PERMITTED',
    category: 'AI_COACH',
    description: 'Asynchronous tactical coaching recommendations between rounds via Google Gemini API.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Out-of-band HTTPS client; rate-limited and token-budgeted.',
    authorityJustification: 'Valve Major & ESL Rules. High-level advice between rounds.',
  },
  stale_ai_response_validation: {
    id: 'stale_ai_response_validation',
    name: 'Stale AI Response Validation',
    status: 'VERIFIED_PERMITTED',
    category: 'AI_COACH',
    description: 'Rejects recommendations that arrive after freeze time ends or round has transitioned.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Timestamp and round ID validation on incoming responses.',
    authorityJustification: 'Fair Play Invariant. No live advice delivery during active gunfights.',
  },

  // --- OVERLAY & HUD (REQUIRES APPROVAL / GATED) ---
  transparent_desktop_hud: {
    id: 'transparent_desktop_hud',
    name: 'Transparent Desktop HUD Window',
    status: 'REQUIRES_APPROVAL',
    category: 'OVERLAY_HUD',
    description: 'Electron borderless transparent window with click-through input pass-through.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Uses OS desktop transparency and setIgnoreMouseEvents(true).',
    authorityJustification: 'CS2 Trusted Mode FAQ. Standard OS window; zero process injection.',
  },
  hud_priority_arbitrage: {
    id: 'hud_priority_arbitrage',
    name: 'HUD Module Priority Arbitrage',
    status: 'REQUIRES_APPROVAL',
    category: 'OVERLAY_HUD',
    description: 'Priority-based collision resolution for HUD modules (Critical -> Passive).',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Central UI layout manager.',
    authorityJustification: 'Fair Play Invariant. Eliminates visual obstruction during critical moments.',
  },
  cs2_safe_zone_enforcement: {
    id: 'cs2_safe_zone_enforcement',
    name: 'CS2 Screen Safe Zone Enforcement',
    status: 'REQUIRES_APPROVAL',
    category: 'OVERLAY_HUD',
    description: 'Guarantees zero overlays in crosshair (450x450px), radar, and status HUD zones.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Hardcoded exclusion geometry in overlay renderer.',
    authorityJustification: 'Fair Play Invariant. Prevents center-screen assistance in ranked play.',
  },
  practice_lineup_alignment: {
    id: 'practice_lineup_alignment',
    name: 'Lineup Real-Time Crosshair Alignment',
    status: 'REQUIRES_APPROVAL',
    category: 'OVERLAY_HUD',
    description: 'Real-time visual crosshair landmarks and angle alignment guides.',
    permittedEnvironments: ['PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Strictly gated off in COMPETITIVE_PROTECTED; UI falls back to passive cards.',
    authorityJustification: 'Tournament & Fair Play Rules. Real-time alignment prohibited in ranked play.',
  },
  practice_trajectory_preview: {
    id: 'practice_trajectory_preview',
    name: 'Practice Grenade Trajectory Preview',
    status: 'REQUIRES_APPROVAL',
    category: 'OVERLAY_HUD',
    description: 'Visual grenade trajectory flight path simulation.',
    permittedEnvironments: ['PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Gated off in COMPETITIVE_PROTECTED.',
    authorityJustification: 'Tournament & Fair Play Rules. Permitted only in offline training environments.',
  },
  interactive_hud_preview: {
    id: 'interactive_hud_preview',
    name: 'Interactive HUD Simulation & Calibration',
    status: 'REQUIRES_APPROVAL',
    category: 'OVERLAY_HUD',
    description: 'Interactive preview allowing dragging, scaling, and opacity testing of HUD elements.',
    permittedEnvironments: ['SIMULATION_PREVIEW'],
    enforcement: 'Active solely in offline simulation canvas.',
    authorityJustification: 'Sandbox calibration; completely disconnected from game client.',
  },

  // --- PROHIBITED CAPABILITIES (ZERO CODE PATHS EXIST) ---
  memory_reading: {
    id: 'memory_reading',
    name: 'Process Memory Reading / Inspection',
    status: 'PROHIBITED',
    category: 'PROHIBITED_CHEATING',
    description: 'Scanning or querying cs2.exe virtual memory pages or offsets.',
    permittedEnvironments: [],
    enforcement: 'Zero Win32 API calls; zero implementation.',
    authorityJustification: 'Valve Anti-Cheat (VAC) Guide. Direct ban trigger.',
  },
  dll_injection: {
    id: 'dll_injection',
    name: 'DLL Injection / Foreign Code Execution',
    status: 'PROHIBITED',
    category: 'PROHIBITED_CHEATING',
    description: 'Injecting dynamic link libraries or executing code within cs2.exe process space.',
    permittedEnvironments: [],
    enforcement: 'Zero Win32 API calls; zero implementation.',
    authorityJustification: 'CS2 Trusted Mode FAQ & VAC Guide. Direct ban trigger.',
  },
  graphics_pipeline_hooking: {
    id: 'graphics_pipeline_hooking',
    name: 'Direct3D / Vulkan Pipeline Hooking',
    status: 'PROHIBITED',
    category: 'PROHIBITED_CHEATING',
    description: 'Hooking DirectX or Vulkan swap chains to draw directly into game frames.',
    permittedEnvironments: [],
    enforcement: 'Zero graphics hooking libraries; desktop transparency only.',
    authorityJustification: 'CS2 Trusted Mode FAQ. Triggers immediate untrusted block.',
  },
  input_automation: {
    id: 'input_automation',
    name: 'Keystroke & Mouse Input Automation',
    status: 'PROHIBITED',
    category: 'PROHIBITED_CHEATING',
    description: 'Synthesizing input events sent to the Counter-Strike 2 window.',
    permittedEnvironments: [],
    enforcement: 'Zero SendInput, mouse_event, or keybd_event invocations.',
    authorityJustification: 'Steam Subscriber Agreement Sec. 4. Macro automation ban.',
  },
  jumpthrow_recoil_macros: {
    id: 'jumpthrow_recoil_macros',
    name: 'Jumpthrow & Recoil Compensation Macros',
    status: 'PROHIBITED',
    category: 'PROHIBITED_CHEATING',
    description: 'Hardware or software automation of throw timing or spray patterns.',
    permittedEnvironments: [],
    enforcement: 'Zero implementation; strictly rejected in code design.',
    authorityJustification: 'Valve Major Rulebook & ESL Rules. Prohibited assist script.',
  },
  esp_wallhack_overlay: {
    id: 'esp_wallhack_overlay',
    name: 'Real-Time Wallhack / ESP Overlay',
    status: 'PROHIBITED',
    category: 'PROHIBITED_CHEATING',
    description: 'Projecting opponent bounding boxes or locations through walls.',
    permittedEnvironments: [],
    enforcement: 'Zero spatial projection; coordinates not available in competitive GSI.',
    authorityJustification: 'Valve Anti-Cheat (VAC) Guide. Blatant cheating violation.',
  },
  aim_assistance_triggerbot: {
    id: 'aim_assistance_triggerbot',
    name: 'Aim Assistance / Auto-Shoot Triggerbot',
    status: 'PROHIBITED',
    category: 'PROHIBITED_CHEATING',
    description: 'Modifying crosshair trajectory or automatically triggering weapon fire.',
    permittedEnvironments: [],
    enforcement: 'Zero implementation; zero mouse control code.',
    authorityJustification: 'Valve Anti-Cheat (VAC) Guide. Blatant cheating violation.',
  },
  spectator_data_mining: {
    id: 'spectator_data_mining',
    name: 'Spectator Telemetry Mining in Competitive Mode',
    status: 'PROHIBITED',
    category: 'PROHIBITED_CHEATING',
    description: 'Attempting to extract allplayers or enemy coordinates in competitive matches.',
    permittedEnvironments: [],
    enforcement: 'GSI payload sanitizer unconditionally strips allplayers in competitive.',
    authorityJustification: 'Fair Play Invariant. Eliminates ghosting telemetry.',
  },
  unauthorized_web_scraping: {
    id: 'unauthorized_web_scraping',
    name: 'Unauthorized Web Scraping',
    status: 'PROHIBITED',
    category: 'PROHIBITED_CHEATING',
    description: 'Automated scraping bots targeting third-party tactical websites.',
    permittedEnvironments: [],
    enforcement: 'Zero scraping engines; static verified datasets and user imports only.',
    authorityJustification: 'Terms of Service & Copyright compliance.',
  },
});

/**
 * Array of prohibited marketing and safety claims.
 */
export const BANNED_MARKETING_PHRASES: readonly string[] = Object.freeze([
  'vac-proof',
  'vac proof',
  '100% vac safe',
  '100% vac-safe',
  'officially valve approved',
  'valve approved',
  'valve certified',
  'whitelisted by valve',
  'valve whitelisted',
  'anti-vac',
]);

/**
 * Retrieves the compliance rule for a specific feature ID.
 */
export function getComplianceRule(featureId: string): IFeatureComplianceRule | undefined {
  return COMPLIANCE_MATRIX[featureId as ComplianceFeatureId];
}

/**
 * Returns an array of all registered compliance rules.
 */
export function getAllComplianceRules(): readonly IFeatureComplianceRule[] {
  return Object.values(COMPLIANCE_MATRIX);
}

/**
 * Returns all compliance rules filtered by their regulatory classification.
 */
export function getRulesByStatus(status: ComplianceStatus): readonly IFeatureComplianceRule[] {
  return getAllComplianceRules().filter((rule) => rule.status === status);
}

/**
 * Returns all compliance rules permitted in a specific environment mode.
 */
export function getRulesByEnvironment(env: EnvironmentMode): readonly IFeatureComplianceRule[] {
  return getAllComplianceRules().filter((rule) => rule.permittedEnvironments.includes(env));
}

/**
 * Validates the internal consistency and invariants of the compliance matrix.
 */
export function validateMatrixIntegrity(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const rules = getAllComplianceRules();

  for (const rule of rules) {
    // Invariant 1: Prohibited features must NEVER have permitted environments
    if (rule.status === 'PROHIBITED' && rule.permittedEnvironments.length > 0) {
      errors.push(`Prohibited feature ${rule.id} has non-empty permittedEnvironments: ${rule.permittedEnvironments.join(', ')}`);
    }

    // Invariant 2: Permitted and Requires Approval must have at least one environment
    if (rule.status !== 'PROHIBITED' && rule.permittedEnvironments.length === 0) {
      errors.push(`Active feature ${rule.id} has no permittedEnvironments specified.`);
    }

    // Invariant 3: Unique feature ID match
    if (rule.id !== COMPLIANCE_MATRIX[rule.id]?.id) {
      errors.push(`Feature ID mismatch for ${rule.id}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Scans a given text string for prohibited marketing claims.
 */
export function scanTextForAntiClaimViolations(text: string): AntiClaimCheckResult {
  const normalized = text.toLowerCase();
  const violations: { matchedPhrase: string; snippet: string }[] = [];

  for (const phrase of BANNED_MARKETING_PHRASES) {
    const index = normalized.indexOf(phrase);
    if (index !== -1) {
      const start = Math.max(0, index - 25);
      const end = Math.min(text.length, index + phrase.length + 25);
      violations.push({
        matchedPhrase: phrase,
        snippet: text.substring(start, end).trim(),
      });
    }
  }

  return {
    clean: violations.length === 0,
    violations,
  };
}
```

---

### 3.3 `src/core/compliance/capability-gate.ts`

```typescript
/**
 * CS2 Assistant - Runtime Capability Gating Engine
 *
 * Implements ICapabilityGate, enforcing strict capability gating across
 * COMPETITIVE_PROTECTED, PRACTICE_SERVER, and SIMULATION_PREVIEW environments.
 *
 * Fails safe closed: any unknown feature or unverified environment is denied.
 *
 * Pure TypeScript - Zero external dependencies.
 */

import {
  CapabilityEvaluationResult,
  ComplianceFeatureId,
  EnvironmentChangeListener,
  EnvironmentMode,
  ICapabilityGate,
  IFeatureComplianceRule,
} from './types';
import { COMPLIANCE_MATRIX, getComplianceRule } from './compliance-matrix';

/**
 * Custom error thrown when a prohibited or gated capability is invoked.
 */
export class ComplianceViolationError extends Error {
  public readonly featureId: string;
  public readonly environment: EnvironmentMode;
  public readonly reason: string;

  constructor(featureId: string, environment: EnvironmentMode, reason: string) {
    super(`Compliance Violation: Feature '${featureId}' is denied in environment '${environment}'. Reason: ${reason}`);
    this.name = 'ComplianceViolationError';
    this.featureId = featureId;
    this.environment = environment;
    this.reason = reason;
    Object.setPrototypeOf(this, ComplianceViolationError.prototype);
  }
}

/**
 * Concrete implementation of the ICapabilityGate interface.
 */
export class CapabilityGate implements ICapabilityGate {
  private _currentEnvironment: EnvironmentMode;
  private readonly _listeners: Set<EnvironmentChangeListener> = new Set();

  /**
   * Initializes the CapabilityGate. Defaults to 'COMPETITIVE_PROTECTED' (fail-safe closed).
   */
  constructor(initialEnvironment: EnvironmentMode = 'COMPETITIVE_PROTECTED') {
    this._currentEnvironment = initialEnvironment;
  }

  /**
   * The current operational environment mode.
   */
  public get currentEnvironment(): EnvironmentMode {
    return this._currentEnvironment;
  }

  /**
   * Updates the operational environment mode and notifies listeners.
   */
  public setEnvironment(newEnvironment: EnvironmentMode): void {
    if (newEnvironment === this._currentEnvironment) {
      return;
    }

    const previousEnvironment = this._currentEnvironment;
    this._currentEnvironment = newEnvironment;

    for (const listener of this._listeners) {
      try {
        listener(newEnvironment, previousEnvironment);
      } catch (err) {
        // Defensive: prevent faulty listener from breaking the gating engine
        console.error('Error in environment change listener:', err);
      }
    }
  }

  /**
   * Returns true if the specified feature is permitted in the active environment.
   * Unknown features fail safe and return false.
   */
  public isFeaturePermitted(featureId: string): boolean {
    const evaluation = this.evaluateCapability(featureId);
    return evaluation.permitted;
  }

  /**
   * Returns an array of all feature IDs permitted in the active environment.
   */
  public getPermittedFeatures(): string[] {
    const allRules = Object.values(COMPLIANCE_MATRIX);
    return allRules
      .filter((rule) => rule.permittedEnvironments.includes(this._currentEnvironment))
      .map((rule) => rule.id);
  }

  /**
   * Retrieves the compliance rule for a specific feature, if known.
   */
  public getFeatureRule(featureId: string): IFeatureComplianceRule | undefined {
    return getComplianceRule(featureId);
  }

  /**
   * Evaluates a capability and returns a structured result with explanation.
   */
  public evaluateCapability(featureId: string): CapabilityEvaluationResult {
    const rule = getComplianceRule(featureId);

    // Fail-safe closed 1: Unknown features are unconditionally denied
    if (!rule) {
      return {
        permitted: false,
        featureId,
        environment: this._currentEnvironment,
        status: 'UNKNOWN',
        reason: `Feature '${featureId}' is unrecognized in the compliance matrix. Access denied (fail-safe closed).`,
      };
    }

    // Fail-safe closed 2: Prohibited features are unconditionally denied in ALL modes
    if (rule.status === 'PROHIBITED') {
      return {
        permitted: false,
        featureId,
        environment: this._currentEnvironment,
        status: rule.status,
        reason: `Feature '${rule.name}' is strictly PROHIBITED under Valve Anti-Cheat, SSA, or Tournament regulations.`,
        rule,
      };
    }

    // Check environment whitelist
    const isPermittedInMode = rule.permittedEnvironments.includes(this._currentEnvironment);

    if (!isPermittedInMode) {
      return {
        permitted: false,
        featureId,
        environment: this._currentEnvironment,
        status: rule.status,
        reason: `Feature '${rule.name}' requires elevated privileges and is suppressed in '${this._currentEnvironment}' mode.`,
        rule,
      };
    }

    return {
      permitted: true,
      featureId,
      environment: this._currentEnvironment,
      status: rule.status,
      reason: `Feature '${rule.name}' is permitted in '${this._currentEnvironment}' mode.`,
      rule,
    };
  }

  /**
   * Asserts that a capability is permitted, throwing ComplianceViolationError if denied.
   */
  public assertFeaturePermitted(featureId: string): void {
    const evaluation = this.evaluateCapability(featureId);
    if (!evaluation.permitted) {
      throw new ComplianceViolationError(featureId, this._currentEnvironment, evaluation.reason);
    }
  }

  /**
   * Registers a callback for environment changes. Returns an unregister function.
   */
  public onEnvironmentChange(listener: EnvironmentChangeListener): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }
}

/**
 * Factory function creating a new ICapabilityGate instance.
 */
export function createCapabilityGate(initialEnv?: EnvironmentMode): ICapabilityGate {
  return new CapabilityGate(initialEnv);
}
```

---

## 4. Test Suite Specification: Domain 9 & Compliance

Below is the complete Vitest test specification to be implemented in `tests/domain9-permission-capability.test.ts`:

```typescript
/**
 * Test Suite: Domain 9 - Permission & Capability Gating
 *
 * Verifies that the Capability Gating Engine strictly controls access to features
 * across COMPETITIVE_PROTECTED, PRACTICE_SERVER, and SIMULATION_PREVIEW environments.
 *
 * Verifies the Six Zero Invariants, fail-safe closed behavior, and the Anti-Claim Invariant.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  createCapabilityGate,
  ComplianceViolationError,
} from '../src/core/compliance/capability-gate';
import {
  COMPLIANCE_MATRIX,
  getAllComplianceRules,
  getRulesByStatus,
  validateMatrixIntegrity,
  scanTextForAntiClaimViolations,
  BANNED_MARKETING_PHRASES,
} from '../src/core/compliance/compliance-matrix';
import { EnvironmentMode } from '../src/core/compliance/types';

describe('Domain 9: Compliance Matrix & Invariants Integrity', () => {
  it('should validate that the compliance matrix satisfies all integrity invariants', () => {
    const integrity = validateMatrixIntegrity();
    expect(integrity.valid).toBe(true);
    expect(integrity.errors).toEqual([]);
  });

  it('should guarantee that all PROHIBITED features have an empty permittedEnvironments array', () => {
    const prohibitedRules = getRulesByStatus('PROHIBITED');
    expect(prohibitedRules.length).toBeGreaterThan(0);

    for (const rule of prohibitedRules) {
      expect(rule.permittedEnvironments).toEqual([]);
      expect(rule.status).toBe('PROHIBITED');
    }
  });

  it('should guarantee that all VERIFIED_PERMITTED features are permitted in COMPETITIVE_PROTECTED', () => {
    const permittedRules = getRulesByStatus('VERIFIED_PERMITTED');
    expect(permittedRules.length).toBeGreaterThan(0);

    for (const rule of permittedRules) {
      expect(rule.permittedEnvironments).toContain('COMPETITIVE_PROTECTED');
    }
  });

  it('should detect banned marketing claims with scanTextForAntiClaimViolations', () => {
    const safeText = 'CS2 Assistant is a non-invasive tactical companion consuming official GSI telemetry.';
    const unsafeText1 = 'Our overlay is 100% VAC safe and undetectable.';
    const unsafeText2 = 'This tool is officially Valve approved for Premier.';
    const unsafeText3 = 'Download the ultimate VAC-proof companion.';

    expect(scanTextForAntiClaimViolations(safeText).clean).toBe(true);

    const check1 = scanTextForAntiClaimViolations(unsafeText1);
    expect(check1.clean).toBe(false);
    expect(check1.violations[0].matchedPhrase).toBe('100% vac safe');

    const check2 = scanTextForAntiClaimViolations(unsafeText2);
    expect(check2.clean).toBe(false);
    expect(check2.violations[0].matchedPhrase).toBe('officially valve approved');

    const check3 = scanTextForAntiClaimViolations(unsafeText3);
    expect(check3.clean).toBe(false);
    expect(check3.violations[0].matchedPhrase).toBe('vac-proof');
  });
});

describe('Domain 9: Capability Gate Runtime Behavior', () => {
  it('should default to COMPETITIVE_PROTECTED environment (fail-safe closed)', () => {
    const gate = createCapabilityGate();
    expect(gate.currentEnvironment).toBe('COMPETITIVE_PROTECTED');
  });

  it('should permit core telemetry and reference features in COMPETITIVE_PROTECTED mode', () => {
    const gate = createCapabilityGate('COMPETITIVE_PROTECTED');

    expect(gate.isFeaturePermitted('gsi_http_listener')).toBe(true);
    expect(gate.isFeaturePermitted('gsi_delta_engine')).toBe(true);
    expect(gate.isFeaturePermitted('static_lineup_db')).toBe(true);
    expect(gate.isFeaturePermitted('svg_landmark_reference')).toBe(true);
    expect(gate.isFeaturePermitted('gsi_bomb_timer')).toBe(true);
    expect(gate.isFeaturePermitted('tactical_memory_provenance')).toBe(true);
    expect(gate.isFeaturePermitted('palace_observation_filter')).toBe(true);
    expect(gate.isFeaturePermitted('gemini_ai_tactical_coach')).toBe(true);
    expect(gate.isFeaturePermitted('history_match_analytics')).toBe(true);
    expect(gate.isFeaturePermitted('transparent_desktop_hud')).toBe(true);
  });

  it('should suppress sensitive alignment guidance in COMPETITIVE_PROTECTED mode', () => {
    const gate = createCapabilityGate('COMPETITIVE_PROTECTED');

    // Visual crosshair alignment aids must be disabled in ranked competitive play
    expect(gate.isFeaturePermitted('practice_lineup_alignment')).toBe(false);
    expect(gate.isFeaturePermitted('practice_trajectory_preview')).toBe(false);
    expect(gate.isFeaturePermitted('interactive_hud_preview')).toBe(false);

    const evalResult = gate.evaluateCapability('practice_lineup_alignment');
    expect(evalResult.permitted).toBe(false);
    expect(evalResult.reason).toContain('suppressed in \'COMPETITIVE_PROTECTED\' mode');
  });

  it('should permit lineup alignment guidance in PRACTICE_SERVER mode', () => {
    const gate = createCapabilityGate('PRACTICE_SERVER');

    expect(gate.currentEnvironment).toBe('PRACTICE_SERVER');
    expect(gate.isFeaturePermitted('practice_lineup_alignment')).toBe(true);
    expect(gate.isFeaturePermitted('practice_trajectory_preview')).toBe(true);
    expect(gate.isFeaturePermitted('gsi_bomb_timer')).toBe(true);
    expect(gate.isFeaturePermitted('static_lineup_db')).toBe(true);
  });

  it('should permit interactive preview and demo walkthrough in SIMULATION_PREVIEW mode', () => {
    const gate = createCapabilityGate('SIMULATION_PREVIEW');

    expect(gate.currentEnvironment).toBe('SIMULATION_PREVIEW');
    expect(gate.isFeaturePermitted('interactive_hud_preview')).toBe(true);
    expect(gate.isFeaturePermitted('practice_lineup_alignment')).toBe(true);
    expect(gate.isFeaturePermitted('practice_trajectory_preview')).toBe(true);
  });

  it('should permanently deny all PROHIBITED features across ALL operational environments', () => {
    const environments: EnvironmentMode[] = ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'];
    const prohibitedIds = [
      'memory_reading',
      'dll_injection',
      'graphics_pipeline_hooking',
      'input_automation',
      'jumpthrow_recoil_macros',
      'esp_wallhack_overlay',
      'aim_assistance_triggerbot',
      'spectator_data_mining',
      'unauthorized_web_scraping',
    ];

    for (const env of environments) {
      const gate = createCapabilityGate(env);
      for (const id of prohibitedIds) {
        expect(gate.isFeaturePermitted(id)).toBe(false);

        const evaluation = gate.evaluateCapability(id);
        expect(evaluation.permitted).toBe(false);
        expect(evaluation.status).toBe('PROHIBITED');
        expect(evaluation.reason).toContain('PROHIBITED');
      }
    }
  });

  it('should deny unrecognized / unknown feature IDs (fail-safe closed)', () => {
    const gate = createCapabilityGate('SIMULATION_PREVIEW');

    expect(gate.isFeaturePermitted('arbitrary_malicious_hook')).toBe(false);
    expect(gate.isFeaturePermitted('')).toBe(false);

    const evaluation = gate.evaluateCapability('unknown_feature_xyz');
    expect(evaluation.permitted).toBe(false);
    expect(evaluation.status).toBe('UNKNOWN');
    expect(evaluation.reason).toContain('fail-safe closed');
  });

  it('should throw ComplianceViolationError when assertFeaturePermitted is called on a denied capability', () => {
    const gate = createCapabilityGate('COMPETITIVE_PROTECTED');

    expect(() => gate.assertFeaturePermitted('memory_reading')).toThrow(ComplianceViolationError);
    expect(() => gate.assertFeaturePermitted('practice_lineup_alignment')).toThrow(ComplianceViolationError);
    expect(() => gate.assertFeaturePermitted('unknown_capability')).toThrow(ComplianceViolationError);

    // Permitted capability must not throw
    expect(() => gate.assertFeaturePermitted('gsi_bomb_timer')).not.toThrow();
  });

  it('should notify registered listeners when the operational environment transitions', () => {
    const gate = createCapabilityGate('COMPETITIVE_PROTECTED');
    const listener = vi.fn();

    const unsubscribe = gate.onEnvironmentChange(listener);

    gate.setEnvironment('PRACTICE_SERVER');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('PRACTICE_SERVER', 'COMPETITIVE_PROTECTED');

    gate.setEnvironment('SIMULATION_PREVIEW');
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenCalledWith('SIMULATION_PREVIEW', 'PRACTICE_SERVER');

    // Setting same environment should not fire listener
    gate.setEnvironment('SIMULATION_PREVIEW');
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    gate.setEnvironment('COMPETITIVE_PROTECTED');
    expect(listener).toHaveBeenCalledTimes(2); // Listener unsubscribed
  });

  it('should return the correct list of permitted features when queried via getPermittedFeatures()', () => {
    const compGate = createCapabilityGate('COMPETITIVE_PROTECTED');
    const compPermitted = compGate.getPermittedFeatures();

    expect(compPermitted).toContain('gsi_bomb_timer');
    expect(compPermitted).not.toContain('practice_lineup_alignment');
    expect(compPermitted).not.toContain('memory_reading');

    const practiceGate = createCapabilityGate('PRACTICE_SERVER');
    const practicePermitted = practiceGate.getPermittedFeatures();

    expect(practicePermitted).toContain('practice_lineup_alignment');
    expect(practicePermitted).not.toContain('memory_reading');
    expect(practicePermitted.length).toBeGreaterThan(compPermitted.length);
  });
});
```

---

## 5. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Compliance | **Authoritative Documentation Charter** | Cites exact SSA, Trusted Mode FAQ, VAC Guide, GSI Wiki, Major Rulebook, and ESL Rules. | Official URLs, verification date 2026-10-19 | Verbatim `COMPLIANCE.md` | Static build failure if primary sources omitted | SSA Sec. 4, Trusted Mode FAQ |
| 2 | Compliance | **Strict Anti-Claim Enforcement** | Architectural prohibition on claiming "VAC-proof", "100% VAC safe", or "Valve approved". | Marketing strings, UI copy, code comments | Compliance scan verdict (`clean: boolean`) | CI build rejection on prohibited phrase detection | Valve Trusted Mode FAQ (No Whitelist rule) |
| 3 | Compliance | **Six Zero Anti-Cheat Invariants** | Absolute prohibitions against DLL injection, memory reading, concealment, input macros, hooks, and scraping. | Windows Win32 API calls, process architecture | User-mode isolation; zero injected threads | Static analysis violation; execution blocked | Steam Subscriber Agreement & VAC policies |
| 4 | Compliance | **Feature Compliance Matrix** | Tri-tier classification (`VERIFIED PERMITTED`, `REQUIRES APPROVAL`, `PROHIBITED`). | Feature ID, category, metadata | Capability permission status | Prohibited features denied across all environments | ORIGINAL_REQUEST.md R1 & Tournament rules |
| 5 | Compliance | **Runtime Capability Gating Engine** | Actively restricts features across `COMPETITIVE_PROTECTED`, `PRACTICE_SERVER`, and `SIMULATION_PREVIEW`. | `EnvironmentMode`, `featureId` | Boolean permission & detailed evaluation result | Unknown feature returns `permitted: false` (fail-safe closed) | CS2 Match Types & Tournament Regulations |
| 6 | Compliance | **Capability Assert Guard** | Throws typed `ComplianceViolationError` when prohibited capability is invoked. | `featureId` | Void (if permitted) or throws exception | Prevents execution of restricted code paths | Defensive Architecture Standard |
| 7 | Compliance | **Environment Change Notification** | Event-driven pub/sub alerting modules to environment mode transitions. | Target `EnvironmentMode` | Callback invocation `(newEnv, oldEnv)` | Errors in listeners are caught defensively | Reactive Core Design Pattern |
| 8 | Compliance | **Anti-Claim Text Scanner** | Static analysis utility scanning text buffers for prohibited marketing claims. | String buffer | `AntiClaimCheckResult` with snippets | Reports exact matched phrase and location | Compliance Assurance Invariant |
| 9 | Compliance | **Matrix Integrity Validator** | Self-testing verification guaranteeing no `PROHIBITED` feature has non-empty environments. | In-memory `COMPLIANCE_MATRIX` | `{ valid: boolean, errors: string[] }` | Invalidation flags configuration defect | Invariant Verification Standard |
| 10 | GSI Protocol | **GSI HTTP Listener Gating** | Unlocks GSI listening capability across all operating modes. | Port, auth token | Permitted status | Refuses external WAN interfaces (localhost only) | Valve GSI Specification |
| 11 | Lineup Engine | **Lineup Alignment Guidance Gating** | Restricts real-time crosshair cues to practice and simulation modes only. | `EnvironmentMode` | `permitted: false` in `COMPETITIVE_PROTECTED` | UI suppresses crosshair overlay automatically | Fair Play & Tournament Rules |
| 12 | Lineup Engine | **Grenade Trajectory Preview Gating** | Restricts flight path trajectory simulation to offline practice. | `EnvironmentMode` | `permitted: false` in `COMPETITIVE_PROTECTED` | Trajectory rendering pipeline stays dormant | Fair Play & Tournament Rules |
| 13 | HUD Overlay | **Transparent Desktop Overlay Gating** | Authorizes transparent frameless OS window with click-through input pass-through. | Window attributes | Borderless window with `setIgnoreMouseEvents` | Fails safe if transparent windowing unsupported | CS2 Trusted Mode FAQ |
| 14 | HUD Overlay | **Screen Safe Zone Enforcement** | Hardcodes exclusion zones for crosshair (450x450px), radar, and status HUD. | Viewport dimensions | Safe bounding boxes | Widgets overlapping safe zones are relocated | Fair Play Invariant |
| 15 | HUD Overlay | **HUD Simulation & Calibration Gating** | Restricts interactive drag/scale sandbox to `SIMULATION_PREVIEW` mode. | `EnvironmentMode` | Interactive drag handles rendered | Disabled during live competitive play | Application Design Contract |
| 16 | AI Coach | **Asynchronous AI Coaching Gating** | Permits out-of-band Gemini API calls while strictly gating live gunfight advice. | Round state, `roundId` | Permitted advice cards | Stale responses arriving after round resumption dropped | Valve Major Rulebook (Coaching) |

---

## 6. Edge Cases

| # | Feature | Input / Trigger Condition | Observed / Mandated Behavior |
|---|---------|---------------------------|------------------------------|
| 1 | Capability Gate | Client queries permission for an empty string `""` or unrecognized `unknown_exploit_id`. | `isFeaturePermitted` returns `false`; `evaluateCapability` returns status `'UNKNOWN'` with reason `"fail-safe closed"`. |
| 2 | Capability Gate | Environment mode parameter passed as `undefined` or invalid string. | Constructor or fallback logic defaults to `'COMPETITIVE_PROTECTED'`. |
| 3 | Capability Gate | User attempts to invoke `memory_reading` while in `SIMULATION_PREVIEW` mode. | Denied (`permitted: false`); PROHIBITED status overrides all environment permissions. |
| 4 | Capability Gate | Registered environment listener throws an unhandled JavaScript exception. | Caught inside defensive `try/catch` block; logged to console; does not interrupt environment transition or other listeners. |
| 5 | Capability Gate | `setEnvironment` called with the current active environment mode (e.g. `COMPETITIVE_PROTECTED` -> `COMPETITIVE_PROTECTED`). | No-op; listeners are not invoked; state remains unchanged. |
| 6 | Capability Gate | Listener unsubscribes during active notification dispatch. | `Set.delete` safely unregisters listener; no further callbacks are received. |
| 7 | Anti-Claim Scanner | Input text contains mixed case variations (e.g. `"VaC-pRoOf"`, `"100% VaC SaFe"`). | Case-insensitive normalization matches prohibited phrases; flags violation with context snippet. |
| 8 | Anti-Claim Scanner | Input text contains legitimate technical description (e.g. `"CS2 Assistant complies with Valve Anti-Cheat standards"`). | Evaluates as clean (`clean: true`); does not false-positive on legitimate mentions of VAC. |
| 9 | Matrix Integrity | Developer erroneously adds a new feature with `status: 'PROHIBITED'` and `permittedEnvironments: ['PRACTICE_SERVER']`. | `validateMatrixIntegrity()` returns `valid: false` and lists error; automated unit test fails CI build. |
| 10 | Lineup Alignment | Match GSI detects `map.mode == "competitive"` and player attempts to toggle on in-game crosshair cues. | CapabilityGate denies `practice_lineup_alignment`; UI presents locked state with notice: `"Disabled in Competitive Protected Mode"`. |
| 11 | GSI Listener | GSI payload arrives with `allplayers` block while in `COMPETITIVE_PROTECTED` mode. | GSI parser strips `allplayers` payload block before emitting events, complying with `spectator_data_mining` prohibition. |
| 12 | Overlay Window | User alt-tabs from CS2 into another application while transparent overlay is active. | Click-through remains active; overlay stays topmost without stealing keyboard or mouse focus from the newly active window. |

---

## 7. Implementation & Verification Checklist for Implementers

1. **Root `COMPLIANCE.md`**:
   - Save verbatim text from Section 2 into `c:\Users\conta\Desktop\CS2Agent\COMPLIANCE.md`.
   - Verify that all 6 primary sources, exact URLs, 2026-10-19 verification dates, Anti-Claim Invariant, Six Zero Invariants, and Feature Matrix are present.
2. **Core Compliance Module (`src/core/compliance/`)**:
   - Create `src/core/compliance/types.ts` using the source code from Section 3.1.
   - Create `src/core/compliance/compliance-matrix.ts` using the source code from Section 3.2.
   - Create `src/core/compliance/capability-gate.ts` using the source code from Section 3.3.
3. **Automated Unit Tests**:
   - Implement `tests/domain9-permission-capability.test.ts` using the source code from Section 4.
   - Run `npx vitest run tests/domain9-permission-capability.test.ts` to confirm 100% test pass.
