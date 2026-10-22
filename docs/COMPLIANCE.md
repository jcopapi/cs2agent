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
