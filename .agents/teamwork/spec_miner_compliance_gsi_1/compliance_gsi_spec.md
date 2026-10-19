# CS2 Assistant: Compliance & Game State Integration (GSI) Specification
**Document Version**: 1.0.0-PROD  
**Verification Date**: 2026-10-19  
**Status**: Authoritative Technical Specification  
**Integrity Mode**: Production / Development  

---

## 1. Executive Summary & Regulatory Context

CS2 Assistant is a production-grade, Valve-compliant tactical companion and analysis suite for Counter-Strike 2. The core architectural philosophy of the application is **Zero Tampering, Non-Invasive Passive Telemetry, and Verifiable Fair Play**.

In competitive gaming, maintaining absolute integrity is paramount. Third-party companion software frequently faces bans or blacklisting due to intrusive runtime behaviors (such as reading internal process memory, hooking graphic rendering pipelines, or injecting dynamic link libraries). CS2 Assistant is strictly architected to adhere to Valve Corporation's Terms of Service, the Steam Subscriber Agreement, Valve Anti-Cheat (VAC) standards, Counter-Strike 2 Trusted Mode policies, and major esports regulatory frameworks (Valve Major Rulebook, ESL Pro Tour, BLAST, PGL).

This document serves as the authoritative specification for two critical subsystems:
1. **Valve & Steam Compliance Layer**: The legal, technical, and runtime enforcement mechanisms guaranteeing zero cheating vectors and automatic capability gating across match environments.
2. **Game State Integration (GSI) & Live Match Engine**: The complete network protocol, JSON schema parsing, tactical memory model, state machines, and HUD management systems.

---

## 2. Valve & Steam Compliance Specification

### 2.1 Authoritative Primary Sources & Verification Log

Every compliance constraint implemented in CS2 Assistant is derived directly from primary-source documentation published by Valve Corporation and esports sanctioning bodies.

| # | Regulatory Authority / Primary Source | Exact Authoritative URL | Verification Date | Governing Scope | Mandatory Architectural Invariant |
|---|---------------------------------------|-------------------------|-------------------|-----------------|-----------------------------------|
| 1 | **Steam Subscriber Agreement (SSA)** | `https://store.steampowered.com/subscriber_agreement/` | 2026-10-19 | Section 4: Online Conduct, Cheats and Process Tampering | Strictly forbids creating, using, or assisting with Cheats, process tampering, reverse engineering, or circumventing anti-cheat software. |
| 2 | **CS2 Trusted Mode FAQ** | `https://help.steampowered.com/en/faqs/view/09C5-DNSY-W1CB-F0BB` | 2026-10-19 | Process injection, external code execution, and Trust Factor | Mandates zero foreign code injection. Notes that Valve operates **no whitelist** for third-party injection; any injection lowers Trust Factor or blocks game launch. |
| 3 | **Valve Anti-Cheat (VAC) System Guide** | `https://help.steampowered.com/en/faqs/view/647C-5CC1-7DA0-4C0A` | 2026-10-19 | Binary integrity, process scanning, automated bans | VAC permanently bans accounts detected modifying or inspecting game memory or injecting code into game binaries. Bans are automated, permanent, and non-negotiable. |
| 4 | **CS:GO / CS2 Game State Integration Wiki** | `https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Game_State_Integration` | 2026-10-19 | Official developer telemetry API via HTTP POST | Telemetry must be consumed passively via Valve's official HTTP push architecture. Client-side payloads in live play are intentionally sanitized by Valve. |
| 5 | **Valve Major Championship Rulebook** | `https://store.steampowered.com/news/group/4145017/view/3032590299636592200` | 2026-10-19 | Coaching rules, external digital assistance, match fairness | Forbids outside coaching communication during live rounds; forbids non-whitelisted electronic overlays or automated game assistance on tournament client machines. |
| 6 | **ESL Pro Tour CS Rules & Regulations** | `https://pro.eslgaming.com/tour/cs/rules/` | 2026-10-19 | External software, overlays, coach interaction | Prohibits custom scripts, macros, or external overlays providing unearned tactical advantage; coaches may only speak during official tactical timeouts. |

---

### 2.2 The Absolute Prohibition Against Marketing Claims

The application documentation, UI strings, landing pages, code comments, and distribution channels are legally and architecturally bound by the **Anti-Claim Invariant**:

```
[MANDATORY COMPLIANCE RULE: ZERO FALSE CLAIMS]
Under NO circumstances shall CS2 Assistant, its developers, or its documentation claim:
1. "VAC-Proof"
2. "100% VAC Safe"
3. "Officially Valve Approved"
4. "Valve Certified"
5. "Whitelisted by Valve"
```

#### Rationale:
1. **Valve Does Not Whitelist**: As explicitly documented in Valve's Trusted Mode FAQ: *"Valve does not maintain a whitelist of safe software to inject because even benign applications can be exploited as vectors for cheats. Valve does not endorse or whitelist third-party programs."*
2. **VAC is Heuristic and Dynamic**: VAC and server-side machine learning systems (VACNet) evolve continuously. Any application claiming absolute immunity is making a fraudulent claim that violates consumer trust and misrepresents Valve's security architecture.
3. **Truthful Legal Stance**: CS2 Assistant describes its security posture strictly factually: *"CS2 Assistant operates exclusively as a non-invasive, out-of-process application consuming Valve's officially documented Game State Integration HTTP protocol. It performs zero DLL injection, zero memory reading, zero process hooking, and zero input automation."*

---

### 2.3 Anti-Cheat Compliance Rules: The Six "Zero" Invariants

The application's runtime architecture enforces six strict technical prohibitions across all source files, services, and Electron renderer processes:

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

1. **Zero DLL Injection**:
   - The application binary executes as an independent Windows user-mode desktop process (`cs2-assistant.exe`).
   - It shall never invoke Windows Win32 APIs such as `OpenProcess`, `VirtualAllocEx`, `WriteProcessMemory`, `CreateRemoteThread`, `QueueUserAPC`, or `SetWindowsHookEx` targeting `cs2.exe`.
   - It loads no native modules into `cs2.exe` memory space.
2. **Zero Memory Reading**:
   - The application does not scan, inspect, or query the virtual memory pages of `cs2.exe` or its loaded modules (`client.dll`, `engine2.dll`).
   - No offset-based data mining, pointer chasing, or virtual table scanning is performed.
   - All game state is acquired solely from the standard HTTP payload pushed outward by CS2 via GSI.
3. **Zero Process Concealment**:
   - The application does not alter its process token, hide its window handle, disguise its image name, or employ rootkit-like driver techniques.
   - It runs visibly in Task Manager as an Electron/Node process and can be fully inspected by any anti-cheat software (VAC, FACEIT AC, Easy Anti-Cheat).
4. **Zero Input Automation**:
   - The application contains zero mechanisms to synthesize keyboard keystrokes, mouse clicks, or mouse movements sent to the game window.
   - No jumpthrow scripts, snap-to-target crosshair positioning, recoil compensation, or rapid-fire macros.
   - Any user action inside CS2 Assistant (e.g. flipping a strategy card or advancing a lineup) is triggered strictly via manual user interaction inside CS2 Assistant's own window or benign global hotkeys that do not forward input into `cs2.exe`.
5. **Zero Unauthorized Hooks**:
   - The application does not install VMT (Virtual Method Table) hooks, MinHook, detours, or trampoline hooks into system graphics drivers, DirectX 11, DirectX 12, or Vulkan swap chains.
   - Overlays are rendered using standard OS transparent windows (Electron transparent frameless window with `setIgnoreMouseEvents`) or displayed on a secondary monitor.
6. **Zero Unauthorized Scraping**:
   - The application does not perform automated scraping, DOM parsing, or unauthorized API calls against third-party tactical websites (such as CSNADES, Scope.gg, or HLTV).
   - Utility and strategy libraries are populated via verified static local datasets, user-created collections, or official user-provided JSON imports with proper attribution links.

---

### 2.4 Feature Compliance Matrix

The Feature Compliance Matrix classifies every functional capability into one of three regulatory tiers and governs how features are enabled or suppressed at runtime.

| # | Capability / Feature | Classification | Description | Permitted Environments | Enforcement Rationale |
|---|----------------------|----------------|-------------|------------------------|-----------------------|
| 1 | **GSI HTTP Listener** | `VERIFIED PERMITTED` | Listens on `http://127.0.0.1:<port>` for official Valve GSI JSON POST requests. | ALL | Officially built-in CS2 functionality designed for external telemetry. |
| 2 | **Local Strategy/Lineup DB** | `VERIFIED PERMITTED` | Searchable offline database of lineups, grenade throw instructions, and tactical plans. | ALL | Passive reference library; no game interaction. |
| 3 | **Bomb Timer (GSI Synchronized)** | `VERIFIED PERMITTED` | Digital countdown clock synchronized strictly to the official `bomb.state == "planted"` GSI event. | ALL | Uses public event broadcast; does not inspect internal defuse wires or memory. |
| 4 | **Tactical Memory Engine** | `VERIFIED PERMITTED` | Stores structured round history, killfeed provenance, and team economy tracking. | ALL | Deterministic log analysis derived from legal telemetry. |
| 5 | **History & Match Analytics** | `VERIFIED PERMITTED` | Post-match analysis, economy graphs, performance metrics, and replay notes. | ALL | Out-of-game performance review. |
| 6 | **Gemini AI Tactical Coach** | `VERIFIED PERMITTED` | Asynchronous tactical advice generated via Google Gemini 3.8 Flash API between rounds. | ALL | High-level strategy recommendations; does not provide micro-aim assistance. |
| 7 | **Transparent Desktop HUD** | `REQUIRES APPROVAL` | Borderless transparent window overlaid on game screen displaying non-intrusive HUD elements. | PRACTICE_SERVER, SIMULATION_PREVIEW, COMPETITIVE (with strict safe zones) | Must not obstruct crosshair or native HUD; tournament organizers may ban overlays entirely. |
| 8 | **Lineup Alignment Helper** | `REQUIRES APPROVAL` | Step-by-step visual crosshair landmark cards displayed on overlay during lineup setup. | PRACTICE_SERVER, SIMULATION_PREVIEW (Gated off in COMPETITIVE_PROTECTED) | In competitive ranked play, real-time alignment aids may violate tournament fair play rules. |
| 9 | **Automated Mouse / Key Input** | `PROHIBITED` | Simulating mouse movement, jumpthrow macros, or automatic key presses. | NONE (Hard blocked in codebase) | Blatant cheat under Steam Subscriber Agreement Section 4 and VAC policies. |
| 10 | **Memory Reading / Inspection** | `PROHIBITED` | Reading `cs2.exe` RAM to extract enemy coordinates, health, or player vectors. | NONE (Hard blocked in codebase) | Direct anti-cheat violation resulting in permanent VAC ban. |
| 11 | **DLL Injection / Process Hooking** | `PROHIBITED` | Injecting `.dll` files or hooking Direct3D / Vulkan render pipelines in `cs2.exe`. | NONE (Hard blocked in codebase) | Flagged immediately by CS2 Trusted Mode and VAC. |
| 12 | **Real-Time Wallhack / ESP Overlay** | `PROHIBITED` | Projecting bounding boxes or enemy locations through walls via memory or network scraping. | NONE (Hard blocked in codebase) | Blatant cheat vector. |
| 13 | **Unauthorized Web Scraping** | `PROHIBITED` | Crawling or scraping third-party websites without license. | NONE (Hard blocked in codebase) | Legal and intellectual property violation. |

---

### 2.5 Runtime Capability Gating Engine Across Environments

To ensure strict compliance with competitive integrity rules, CS2 Assistant includes an active **Compliance Layer Gating Engine**. The application automatically detects the current match environment and restricts active capabilities.

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

#### Detailed Environment Definitions:

1. **`COMPETITIVE_PROTECTED`**:
   - **Trigger**: Detected when `map.mode` is `"competitive"`, `"premier"`, or connected to VAC-secured public/third-party servers, and `sv_cheats` is `0`.
   - **Enforced Restrictions**:
     - Lineup state machine suppresses real-time visual crosshair overlays; only passive cards (e.g. on secondary display or discrete side widget) are visible.
     - HUD overlay locks to non-obstructive safe zones (outside native radar, crosshair, and killfeed).
     - Enemy location data is restricted strictly to confirmed kill events and local player direct visual contact.
     - Zero attempt to query or display spectator-only data (`allplayers`).
2. **`PRACTICE_SERVER`**:
   - **Trigger**: Detected when running on local host (`127.0.0.1`), offline with bots, on workshop maps, or when `sv_cheats` is `1`.
   - **Enforced Permissions**:
     - Full lineup execution state machine active: displays proximity cues, alignment crosshairs, stance guides, and throw timing.
     - Practice grenade trajectory visualization permitted.
     - Spectator telemetry (`allplayers`, `grenades` coordinate tracking) can be processed if configured.
3. **`SIMULATION_PREVIEW`**:
   - **Trigger**: Activated manually by user in the application UI (e.g. testing HUD layout, reviewing historic rounds) or when CS2 is not running.
   - **Enforced Permissions**:
     - Complete sandbox environment: generates synthetic GSI packets.
     - Allows repositioning, scaling, and opacity testing of all HUD elements.
     - Simulates plant events, defuse races, and lineup executions without any connection to `cs2.exe`.

---

## 3. Game State Integration (GSI) Protocol Specification

### 3.1 GSI Architecture & Configuration

CS2 Game State Integration operates as an HTTP push architecture. The CS2 game engine acts as an HTTP client that serializes game states into JSON payloads and transmits them via HTTP POST to an authorized local HTTP listener.

#### Configuration File Specification
- **File Name**: `gamestate_integration_cs2assistant.cfg`
- **Installation Directory**:
  - Windows: `<SteamLibrary>\steamapps\common\Counter-Strike Global Offensive\game\csgo\cfg\gamestate_integration_cs2assistant.cfg`
- **Format**: Valve KeyValues 1 (KV1) text format.

```keyvalues
"CS2Assistant v1.0"
{
    "uri"           "http://127.0.0.1:31337/api/gsi"
    "timeout"       "5.0"
    "buffer"        "0.1"
    "throttle"      "0.1"
    "heartbeat"     "15.0"
    "auth"
    {
        "token"     "CS2A_SECURE_TOKEN_LOCAL_7x9q2"
    }
    "data"
    {
        "provider"              "1"
        "map"                   "1"
        "round"                 "1"
        "player_id"             "1"
        "player_state"          "1"
        "player_weapons"        "1"
        "player_match_stats"    "1"
        "phase_countdowns"      "1"
        "bomb"                  "1"
        "allplayers_id"         "1"
        "allplayers_state"      "1"
        "allplayers_match_stats" "1"
        "allplayers_weapons"    "1"
        "allplayers_position"   "1"
        "allgrenades"           "1"
    }
}
```

#### Configuration Key Definitions:
* **`uri`**: Destination URL where CS2 sends HTTP POST requests. Restricted to localhost (`127.0.0.1`) for local security.
* **`timeout`** (`5.0` s): Maximum time CS2 will wait for an HTTP `2XX` acknowledgment from CS2 Assistant before abandoning the request.
* **`buffer`** (`0.1` s): Aggregation window. Rapid micro-events occurring within 100 milliseconds are bundled into a single HTTP POST request, preventing event flooding.
* **`throttle`** (`0.1` s): Minimum duration between outgoing HTTP POST requests. Limits updates to a maximum of 10 requests per second.
* **`heartbeat`** (`15.0` s): Maximum interval before CS2 transmits an idle baseline packet, even if no state changes have occurred. Used by CS2 Assistant as an active connection health check.
* **`auth.token`**: Shared secret key sent in the JSON payload body (`auth.token`), authenticating that incoming HTTP POST packets originate from the local CS2 engine and not an external network adversary.

---

### 3.2 Network Transport & HTTP POST Listener

The GSI listener executes within the Electron Node.js main process / background daemon:

```
+-----------------------------------------------------------------------------------+
|                              GSI LISTENER PIPELINE                                |
+-----------------------------------------------------------------------------------+
|  CS2 Game Engine  -->  HTTP POST http://127.0.0.1:31337/api/gsi                   |
|                                |                                                  |
|                                v                                                  |
|                     1. Connection & Port Listener                                 |
|                                |                                                  |
|                                v                                                  |
|                     2. Auth Token Verification (auth.token == SECRET)             |
|                                |                                                  |
|                                v                                                  |
|                     3. JSON Parsing & Schema Validation                           |
|                                |                                                  |
|                                v                                                  |
|                     4. Payload Normalization & Delta Resolution                   |
|                                |                                                  |
|                                v                                                  |
|                     5. Tactical Memory & Event Dispatcher                         |
|                                |                                                  |
|                                v                                                  |
|                     HTTP 200 OK Response (Immediate)                              |
+-----------------------------------------------------------------------------------+
```

#### Protocol Specifications:
1. **HTTP Method**: `POST`
2. **Path**: `/api/gsi`
3. **Content-Type**: `application/json`
4. **Listener Port**: Default `31337` (with automatic port conflict detection and fallback configurable in settings).
5. **Response Requirement**: The listener must acknowledge valid packets immediately with HTTP `200 OK` (empty body or `{ "status": "ok" }`). Long-running computations must execute asynchronously on worker threads to avoid exceeding CS2's 5.0s timeout.
6. **Authentication Validation**: Every payload must contain an `auth` object matching the token stored in the user's secure configuration. Packets with missing or invalid tokens are rejected with HTTP `401 Unauthorized`.
7. **Malformed Payload Resilience**: Malformed JSON or incomplete payloads are caught by error boundaries, logged, and acknowledged with HTTP `400 Bad Request` without crashing the listener process.

---

### 3.3 Data Dictionary & JSON Payload Schemas

The incoming JSON payload contains discrete data blocks enabled by the `.cfg` file. When an attribute changes, CS2 includes both the new state and an optional `previously` or `added` block detailing deltas.

#### Top-Level Payload Schema:
```typescript
interface CS2GsiPayload {
  provider: GsiProvider;
  map?: GsiMap;
  round?: GsiRound;
  player?: GsiPlayer;
  allplayers?: Record<string, GsiAllPlayer>; // Spectator / Practice only
  bomb?: GsiBomb;
  phase_countdowns?: GsiPhaseCountdowns;
  grenades?: Record<string, GsiGrenade>;     // Spectator / Practice only
  previously?: Partial<CS2GsiPayload>;       // Changed keys
  added?: Partial<CS2GsiPayload>;            // Newly attached keys
  auth?: {
    token: string;
  };
}
```

#### Comprehensive Field Dictionary:

| Block | Field | Type | Description | Values / Examples |
|-------|-------|------|-------------|-------------------|
| **`provider`** | `name` | string | Name of the telemetry provider | `"counter-strike 2"` |
| | `appid` | number | Steam Application ID for CS2 | `730` |
| | `version` | number | Internal CS2 engine build version | e.g. `14008` |
| | `steamid` | string | 64-bit Steam ID of the local client user | `"76561198012345678"` |
| | `timestamp` | number | Epoch timestamp (seconds) generated by CS2 | `1771362700` |
| **`map`** | `name` | string | Official map identifier | `"de_mirage"`, `"de_inferno"`, `"de_dust2"`, `"de_nuke"`, `"de_ancient"`, `"de_anubis"` |
| | `mode` | string | Active game mode | `"competitive"`, `"premier"`, `"casual"`, `"deathmatch"`, `"custom"` |
| | `phase` | string | Match lifecycle phase | `"warmup"`, `"live"`, `"intermission"`, `"gameover"` |
| | `round` | number | Current round counter (0-indexed or 1-indexed) | e.g. `12` |
| | `score_ct` | number | Total rounds won by Counter-Terrorists | e.g. `7` |
| | `score_t` | number | Total rounds won by Terrorists | e.g. `5` |
| | `team_ct` | object | CT team metadata (consecutive losses, timeouts) | `{ "score": 7, "consecutive_round_losses": 1, "timeouts_remaining": 1 }` |
| | `team_t` | object | T team metadata (consecutive losses, timeouts) | `{ "score": 5, "consecutive_round_losses": 2, "timeouts_remaining": 2 }` |
| | `current_spectators` | number | Number of GOTV / spectator clients | e.g. `0` |
| **`round`** | `phase` | string | State of the current round | `"freezetime"`, `"live"`, `"over"` |
| | `bomb` | string | State of C4 bomb during round | `"planted"`, `"exploded"`, `"defused"` |
| | `win_team` | string | Victorious team for current round | `"CT"`, `"T"` (populated when `round.phase == "over"`) |
| **`player`** | `steamid` | string | SteamID64 of the observed player | `"76561198012345678"` |
| | `clan` | string | Player clan tag (if configured) | `"[NAVI]"` |
| | `name` | string | In-game persona name | `"s1mple"` |
| | `observer_slot` | number | Spectator numeric slot (0-9) | `1` |
| | `team` | string | Team allegiance | `"CT"`, `"T"`, `"SPECTATOR"` |
| | `activity` | string | Player client activity state | `"playing"`, `"free"`, `"textinput"`, `"menu"` |
| | `state.health` | number | Player health points | `0` to `100` |
| | `state.armor` | number | Player body armor points | `0` to `100` |
| | `state.helmet` | boolean | True if Kevlar helmet is equipped | `true`, `false` |
| | `state.flashed` | number | Flashbang blind intensity level | `0` (clear) to `255` (fully blinded) |
| | `state.smoked` | number | Smoke density obstructing vision | `0` to `255` |
| | `state.burning` | number | Incendiary fire damage intensity | `0` to `255` |
| | `state.money` | number | Current spendable funds | `0` to `16000` |
| | `state.round_kills` | number | Kills scored in the active round | e.g. `2` |
| | `state.round_killhs`| number | Headshot kills in the active round | e.g. `1` |
| | `state.equip_value` | number | Total economic value of current equipment | e.g. `4750` |
| | `state.defusekit` | boolean | True if CT carries a defusal kit | `true`, `false` |
| | `weapons` | dict | Map of equipped weapon slots | Keyed by `"weapon_0"`, `"weapon_1"`, etc. |
| | `weapons.*.name` | string | Weapon classname | `"weapon_ak47"`, `"weapon_m4a1_silencer"`, `"weapon_knife"`, `"weapon_flashbang"`, `"weapon_smokegrenade"`, `"weapon_c4"` |
| | `weapons.*.paintkit` | string | Skin identifier name | `"cu_ak47_asiimov"` |
| | `weapons.*.type` | string | Weapon category | `"Rifle"`, `"SniperRifle"`, `"Submachine Gun"`, `"Pistol"`, `"Knife"`, `"Grenade"`, `"C4"` |
| | `weapons.*.state` | string | Weapon status | `"active"`, `"holstered"`, `"reloading"` |
| | `weapons.*.ammo_clip`| number | Rounds remaining in active magazine | e.g. `30` |
| | `weapons.*.ammo_reserve`| number | Rounds remaining in reserve | e.g. `90` |
| | `match_stats.kills`| number | Cumulative match kills | e.g. `18` |
| | `match_stats.assists`| number| Cumulative match assists | e.g. `4` |
| | `match_stats.deaths`| number| Cumulative match deaths | e.g. `9` |
| | `match_stats.mvps` | number | Most Valuable Player star count | e.g. `3` |
| | `match_stats.score`| number | Total leaderboard score | e.g. `42` |
| | `position` | string | Space-separated coordinates (Practice/Spec only)| `"-1240.50, 310.22, -64.00"` |
| | `forward` | string | Normalized view angle vector (Practice/Spec only)| `"0.707, -0.707, 0.000"` |
| **`bomb`** | `state` | string | Global C4 bomb lifecycle status | `"carried"`, `"dropped"`, `"planting"`, `"planted"`, `"defusing"`, `"defused"`, `"exploded"` |
| | `position` | string | Coordinates of bomb (Practice/Spec only) | `"-140.2, 580.4, 12.0"` |
| | `player` | string | SteamID of player actively planting/defusing | `"76561198012345678"` |
| | `countdown` | string/num | Exact seconds remaining on plant/defuse/timer | `"34.2"` |
| **`phase_countdowns`** | `phase` | string | Current countdown phase | `"freezetime"`, `"bomb"`, `"round_end"`, `"game_over"`, `"warmup"`, `"live"`, `"timeout_ct"`, `"timeout_t"` |
| | `phase_ends_in` | string/num | Floating-point seconds remaining in phase | `"24.3"` |
| **`allplayers`** | `[steamid]` | object | Full state for all 10 players (Spectator only) | Contains `clan`, `name`, `team`, `state`, `weapons`, `position` |
| **`grenades`** | `[entity_id]`| object | Active grenades in flight/ground (Spectator only)| Contains `owner`, `type`, `position`, `velocity`, `lifetime`, `flames` |

---

### 3.4 Player Client vs. Spectator Client Data Isolation

A foundational technical constraint of CS2 GSI is the **Data Isolation Barrier** enforced by the CS2 engine itself:

```
+---------------------------------------------------------------------------------------+
|                         VALVE GSI CLIENT-SIDE DATA ISOLATION                          |
+---------------------------------------------------------------------------------------+
|  Telemetry Field                 |  Live Player in Match   |  Spectator / GOTV / Cast |
+----------------------------------+-------------------------+--------------------------+
|  Local Player State & Weapons    |  YES (Complete)         |  YES                     |
|  Local Player Coordinates        |  NO (Sanitized by CS2)  |  YES                     |
|  Teammate State / Money          |  PARTIAL (Match stats)  |  YES (Full allplayers)   |
|  Enemy Positions / Coordinates   |  NEVER (Strictly Omitted)|  YES (Full allplayers)   |
|  Enemy Health / Weapons / Ammo   |  NEVER (Strictly Omitted)|  YES (Full allplayers)   |
|  Active In-Flight Grenade Coords |  NEVER (Strictly Omitted)|  YES (allgrenades)       |
|  Bomb Plant / Defuse Events     |  YES (phase_countdowns) |  YES (with coords)       |
+---------------------------------------------------------------------------------------+
```

#### Architectural Implication:
In live competitive matches (`COMPETITIVE_PROTECTED`), CS2 Assistant **cannot and must not attempt to retrieve enemy player coordinates or health from GSI**, because Valve's server does not send them. Any tool displaying enemy positions in competitive play is reading game memory or hooking the client, which violates VAC. CS2 Assistant's Tactical Memory relies solely on confirmed observations (e.g. killfeed events, bomb plant broadcasts) and user/team reports.

---

### 3.5 Connection Lifecycle, Heartbeat & Fault Tolerance

The GSI integration tracks an explicit **Connection State Machine**:

```
 [DISCONNECTED] 
       | (Receives HTTP POST with valid auth token)
       v
 [CONNECTED_IDLE] (No map loaded / Menu activity)
       | (map.phase == "live" || "warmup")
       v
 [MATCH_ACTIVE]
       |
       +---> [ROUND_FREEZETIME] (round.phase == "freezetime")
       |
       +---> [ROUND_LIVE]       (round.phase == "live")
       |
       +---> [ROUND_OVER]       (round.phase == "over")
       |
       v (Heartbeat timeout > 30s || CS2 process exit)
 [DISCONNECTED]
```

#### Fault Recovery Policies:
1. **Heartbeat Timeout**: If no HTTP POST (payload or heartbeat) is received for `30.0` seconds (2x the configured 15s heartbeat), the engine transitions to `DISCONNECTED` and sets `activeMatch = null`.
2. **Unexpected Disconnect / Map Change**: When `map.name` changes or game crashes mid-round, the current match session is cleanly finalized in the local database (`HISTORY`), saving partial stats without corrupting state.
3. **Port Conflict**: If port `31337` is occupied on application launch, the listener probes sequential ports (`31338`, `31339`), alerts the user, and updates the local `.cfg` file automatically.

---

## 4. Live Match Engine Specification

### 4.1 Separation of Live GSI from Demonstration / Simulation Mode

To guarantee safety during development, testing, and UI customization, the Live Match Engine implements an immutable boundary between live match feeds and synthetic simulations:

```typescript
interface IMatchEventStream {
  readonly mode: 'LIVE_GSI' | 'SIMULATION_PREVIEW';
  readonly isSimulation: boolean;
  subscribe(listener: (event: NormalizedGameEvent) => void): UnsubscribeFn;
  getState(): CurrentMatchState;
}
```

1. **`LiveGSIProvider`**:
   - Consumes live HTTP packets from port `31337`.
   - Subject to strict Compliance Layer capability gating (`COMPETITIVE_PROTECTED`).
   - Rejects synthetic event injections.
2. **`SimulationProvider`**:
   - Replays synthetic JSON sequences or recorded historical demo files.
   - Distinct visual banner displayed on all UI screens: `[SIMULATION MODE — NOT CONNECTED TO CS2]`.
   - Bypasses competitive capability gating to permit testing of all HUD elements, alignment crosshairs, and bomb timers safely without running `cs2.exe`.

---

### 4.2 Tactical Memory Architecture & Event Provenance

Tactical Memory is the deterministic intelligence repository that ingests normalized events and builds a coherent model of the round without violating fair play.

```
+------------------------------------------------------------------------------------+
|                         TACTICAL MEMORY PROVENANCE MODEL                           |
+------------------------------------------------------------------------------------+
| Level 1: CONFIRMED  | Directly verified by authoritative telemetry (GSI local      |
|                     | player event, killfeed notification, official bomb plant)    |
+---------------------+--------------------------------------------------------------+
| Level 2: REPORTED   | Secondary input from human teammate voice callout,           |
|                     | hotkey spot tag, or manual HUD input                         |
+---------------------+--------------------------------------------------------------+
| Level 3: INFERRED   | Deterministic tactical deduction or timing extrapolation     |
|                     | (e.g. 4 Ts spotted B + bomb planted B => 5th is lurk/rotate) |
+---------------------+--------------------------------------------------------------+
```

#### Data Schema for Tactical Memory Events:
```typescript
interface TacticalMemoryEvent {
  eventId: string;
  type: 'PLAYER_DEATH' | 'BOMB_PLANTED' | 'BOMB_DEFUSED' | 'GRENADE_DETONATED' | 'PLAYER_SPOTTED' | 'DAMAGE_DEALT';
  provenance: 'CONFIRMED' | 'REPORTED' | 'INFERRED';
  timestampMs: number;
  roundNumber: number;
  map: string;
  source: 'GSI_TELEMETRY' | 'USER_INPUT' | 'TACTICAL_INFERENCE';
  
  // Actor data
  subjectPlayer?: {
    steamId?: string;
    name: string;
    team: 'CT' | 'T';
  };
  
  // Victim / Target data (if applicable)
  targetPlayer?: {
    steamId?: string;
    name: string;
    team: 'CT' | 'T';
  };
  
  // Location discipline
  observedLocation?: {
    callout: string;            // e.g. "Palace", "Mirage A Site"
    coordinates?: [number, number, number]; // Only in Practice / Local
    confidence: number;         // 0.0 to 1.0
    isVictimLocation: boolean;  // Crucial distinction
  };
  
  ttlSeconds: number;           // Time to live before memory expiration
  expiresAtMs: number;
}
```

---

### 4.3 Observation vs. Interpretation Discipline: Palace Scenario Formal Verification

A primary requirement of the Tactical Memory Engine is **strict separation between observation and interpretation**. Promoting an assumption into a verified fact produces false intelligence and risks cheating-like behavior.

#### The Authoritative Case Study:
> **Scenario**: Player X (CT) is holding A Site. Player X dies at Palace. The killfeed indicates Player Y (T) killed Player X with an AWP.

```
+-----------------------------------------------------------------------------------+
|                        PALACE KILL OBSERVATION DISCIPLINE                         |
+-----------------------------------------------------------------------------------+
| RAW OBSERVATION (Authoritative Truth):                                            |
| - Victim: Player X                                                                |
| - Killer: Player Y                                                                |
| - Weapon: AWP                                                                     |
| - Victim Location: "Palace" (Confirmed by Player X's known death coordinates)    |
+-----------------------------------------------------------------------------------+
| PERMITTED RECORD IN TACTICAL MEMORY:                                              |
| [CONFIRMED] Victim Player X died at "Palace"                                      |
| [CONFIRMED] Killer is Player Y using AWP                                          |
+-----------------------------------------------------------------------------------+
| PROHIBITED SPECULATION (MUST NEVER BE STORED AS FACT):                            |
| [FORBIDDEN] "Player Y is at Palace"  <-- CRITICAL COMPLIANCE VIOLATION            |
+-----------------------------------------------------------------------------------+
| TACTICAL REASONING:                                                               |
| An AWP bullet has long-range line of sight into Palace from:                      |
| 1. Mirage Jungle                                                                  |
| 2. Mirage Stairs                                                                  |
| 3. Mirage Ticket Booth / CT Spawn                                                 |
| 4. Mirage A Site Default                                                          |
| 5. Mirage Palace Interior                                                         |
| Storing Player Y as "CONFIRMED at Palace" is factually false and dangerously       |
| misleading. Killer position must remain UNKNOWN / UNCONFIRMED until verified      |
| by independent direct observation.                                                |
+-----------------------------------------------------------------------------------+
```

#### Automated Unit Test Verification Contract:
Every engine build must execute test suite domain 4, verifying:
`expect(tacticalMemory.getLastKnownLocation('Player Y')).not.toBe('Palace')`
`expect(tacticalMemory.getConfirmedVictimLocation('Player X')).toBe('Palace')`.

---

### 4.4 Memory Decay, Time-to-Live (TTL), and Round Boundary Purging

Tactical information decays rapidly in Counter-Strike due to high player movement speeds (up to 250 units/second with knife, covering an entire bombsite in 4–6 seconds).

```
+-----------------------------------------------------------------------------------+
|                                MEMORY DECAY CURVE                                 |
+-----------------------------------------------------------------------------------+
| Fresh (0-3s)        | Aging (4-8s)            | Stale (9-15s)    | Expired (>15s) |
| Opacity: 100%       | Opacity: 60%            | Opacity: 25%     | Purged from UI |
| Vibrant Amber/Red   | Fading Amber            | Ghost Gray       | Hidden         |
+-----------------------------------------------------------------------------------+
```

#### Expiration Rules by Event Type:
1. **Last Known Enemy Visual Spotting**:
   - `ttlSeconds`: 15.0 seconds.
   - Status transitions: `FRESH` (0–3s) → `AGING` (4–8s) → `STALE` (9–15s) → `EXPIRED` (purged).
2. **Smoke Grenade Dispersion**:
   - `ttlSeconds`: 18.0 seconds (nominal CS2 smoke duration).
   - If dissipating HE grenade explosion is detected in vicinity, TTL is updated dynamically to 0.0s.
3. **Incendiary / Molotov Fire**:
   - `ttlSeconds`: 7.0 seconds.
4. **Bomb Planted Event**:
   - `ttlSeconds`: Exactly synchronized to 40.0s countdown or round termination.
5. **Round Boundary Purge**:
   - The instant `round.phase` transitions to `"freezetime"` or `"over"`, **100% of spatial tactical memory events are immediately flushed**.
   - No last-seen opponent locations or smoke timers persist across rounds. Cumulative match stats (economy, equipment value history) transition to long-term match records.

---

### 4.5 Last Known Information Overlay Specification

The Last Known Information module renders unobtrusive tactical annotations on a secondary screen or compliant overlay window.

* **Display Format**: `[PLAYER NAME / ROLE] — [LAST KNOWN CALLOUT] ([ELAPSED SECONDS]s ago)`
  - Example: `s1mple (AWP) — Palace (4s ago)`
* **Visual Representation**:
  - Badge with team color border (T: `#e74c3c`, CT: `#3498db`).
  - Progress ring or fading bar indicating remaining TTL.
  - Source tag: `[GSI KILLFEED]` or `[CALLOUT]`.
* **Compliance Safeguard**:
  - In `COMPETITIVE_PROTECTED`, coordinates are never projected onto 3D world space (no bounding boxes over player models or 3D world markers).
  - Information is strictly rendered as an anchor widget in a designated screen corner or companion window.
  - A master user toggle allows immediate disabling (`hotkey: F11` or UI switch).

---

### 4.6 Lineup Execution State Machine

The Lineup Execution Engine guides players through utility lineups via a deterministic finite state machine (FSM).

```
+-------------------------------------------------------------------------------------------------------+
|                                  LINEUP EXECUTION STATE MACHINE                                       |
+-------------------------------------------------------------------------------------------------------+
|                                                                                                       |
|    +------------+    Proximity < 300u    +------------+    Proximity < 15u    +---------------+       |
|    |  INACTIVE  | ---------------------> |   NEARBY   | --------------------> |  POSITIONING  |       |
|    +------------+                        +------------+                       +---------------+       |
|          ^                                      |                                     |               |
|          | Player leaves (>400u)                | Player leaves (>40u)                | Player leaves |
|          +--------------------------------------+-------------------------------------+               |
|                                                                                       |               |
|                                                                                       v In-Position   |
|    +------------+   Throw Detected       +------------+    Aim Confirmed      +---------------+       |
|    |  EXECUTED  | <--------------------- |   READY    | <-------------------- |   ALIGNING    |       |
|    +------------+                        +------------+   (Angles match)      +---------------+       |
|          |                                      |                                                     |
|          | Next Lineup in Profile               | Cancel / Timeout                                    |
|          v                                      v                                                     |
|    +------------+                        +------------+                                               |
|    |    NEXT    | ---------------------> |  INACTIVE  |                                               |
|    +------------+                        +------------+                                               |
|                                                                                                       |
+-------------------------------------------------------------------------------------------------------+
```

#### State Definitions & Transition Criteria:
1. **`INACTIVE`**:
   - Player is elsewhere on the map or no active strategy is selected.
   - Zero HUD cues displayed.
2. **`NEARBY`**:
   - **Entry Trigger**: Distance to lineup starting spot < `300` game units.
   - **Exit Trigger (Hysteresis)**: Distance > `400` game units.
   - **Behavior**: Subtle directional hint or mini-card displays lineup objective (e.g. `"Mirage A Smoke: Stairs"`).
3. **`POSITIONING`**:
   - **Entry Trigger**: Distance to lineup pin coordinates < `15` game units.
   - **Exit Trigger (Hysteresis)**: Distance > `40` game units.
   - **Behavior**: Displays stance requirement (`Standing`, `Crouching`, `Shift-walking`).
4. **`ALIGNING`**:
   - **Entry Trigger**: Player stationary in pin spot (`speed == 0` for >= 300ms).
   - **Behavior**: Displays visual reference landmark card (SVG / high-contrast graphic indicating where to place the crosshair). In `PRACTICE_SERVER` mode, pitch/yaw angle guidance is visible.
5. **`READY`**:
   - **Entry Trigger**: Aim crosshair aligned with reference target (pitch/yaw tolerance < 0.5 degrees in practice mode) or user confirms alignment.
   - **Behavior**: Displays prominent, high-contrast throw cue: `"LEFT CLICK + JUMPTHROW"`, `"RUN-THROW"`, or `"NORMAL THROW"`.
6. **`EXECUTED`**:
   - **Entry Trigger**: Player throws grenade (GSI `weapons` active slot transitions or ammo decrements).
   - **Cooldown**: 2000ms debounce timer prevents re-triggering.
7. **`NEXT`**:
   - Automatically queues the next utility in a coordinated multi-grenade execution profile (e.g. Smoke 1 → Smoke 2 → Flashbang), or resets to `INACTIVE`.

#### Rigorous Completion Types:
To avoid ambiguity in statistics, every lineup execution records one of four strict completion types:
* **`Attempted`**: The state machine reached `READY` and a throw event occurred, but landing trajectory was not confirmed.
* **`Confirmed thrown`**: Authoritative GSI confirmation that the required grenade type was released while player was in `READY` state.
* **`Confirmed landed`**: (Practice server or GOTV only) Grenade entity reached destination radius (< 150 units of target) and detonated.
* **`Manually completed`**: User triggered manual skip/complete hotkey or button in UI.

---

### 4.7 High-Precision Bomb Timer

The Bomb Timer provides synchronized match intelligence during bomb plant phases.

```
+------------------------------------------------------------------------------------+
|                                BOMB TIMER LIFECYCLE                                |
+------------------------------------------------------------------------------------+
| Plant Event Received (GSI bomb.state == "planted" || phase_countdowns.phase == "bomb")
|                                 |
|                                 v
|              Latency Calculation & Clock Sync (40.00s)
|                                 |
|  [STAGE 1: GREEN]      40.0s - 20.0s (Normal / Retake Setup)
|                                 |
|  [STAGE 2: AMBER]      20.0s - 10.0s (10s: Defuse WITHOUT Kit Point-of-No-Return)
|                                 |
|  [STAGE 3: RED]        10.0s - 5.0s  (5s: Defuse WITH Kit Point-of-No-Return)
|                                 |
|  [STAGE 4: FLASHING]   < 5.0s        (IMPOSSIBLE TO DEFUSE — EVACUATE / SAVE)
|                                 |
|                                 v
| Termination: Cleared immediately on "defused", "exploded", or round transition
+------------------------------------------------------------------------------------+
```

#### Specifications:
1. **Synchronization Source**: Triggered upon GSI `bomb.state == "planted"` or `phase_countdowns.phase == "bomb"`.
2. **Latency Awareness**:
   - Computes network transmission lag: `delta = Date.now() - (payload.provider.timestamp * 1000)`.
   - Offsets timer by `payload.phase_countdowns.phase_ends_in` minus local buffer (`0.1s`), ensuring millisecond synchronization with CS2's internal server clock.
3. **Display Format**: `BOMB PLANTED 00:24` (or `24.3s`).
4. **Defusal Deadlines**:
   - **10.0s Threshold**: Highlighted warning — impossible to defuse without defusal kit.
   - **5.0s Threshold**: Critical warning — impossible to defuse even with defusal kit. Audio cue or visual alert triggers: `"SAVE WEAPONS"`.
5. **Automatic Removal**:
   - Disappears instantly if `bomb.state` changes to `"defused"` or `"exploded"`.
   - Cleared automatically on `round.phase == "over"` or `round.phase == "freezetime"`.
   - Never lingers on screen after round conclusion.

---

### 4.8 Global HUD Manager & Priority Arbitrage

The Global HUD Manager coordinates all on-screen widgets, managing window hierarchy, collision avoidance, screen safe zones, and capability gating.

#### Priority Arbitrage Tiers:

| Priority Tier | Level | Capabilities / Modules | Presentation Behavior | Collision Resolution |
|---------------|-------|------------------------|-----------------------|----------------------|
| **`CRITICAL`** | 1 (Highest) | Bomb Timer, Defuse Deadlines, Round End Alert | High contrast, bright colors, always topmost | Preempts and pushes aside lower-tier widgets |
| **`CONTEXTUAL`** | 2 | Lineup `READY` Throw Prompt, Stance Alignment Cue | High visibility, central or near-center anchor | Displaces Informational widgets; yields to Critical |
| **`INFORMATIONAL`** | 3 | Gemini Tactical Coach Card, Last Known Opponent, Economy Delta | Restrained opacity, peripheral anchor | Collapses or moves to secondary column during Critical events |
| **`PASSIVE`** | 4 (Lowest) | Strategy Title, GSI Connection Status, Ping indicator | Muted gray, 30-50% opacity | Hides automatically during active combat or Critical events |

#### Collision Avoidance & CS2 Safe Zones:
To comply with fair play rules and prevent gameplay obstruction, the HUD Manager strictly enforces **Zero-Interference Safe Zones** mapped to CS2's default 16:9 / 4:3 viewports:

```
+------------------------------------------------------------------------------------+
|                             CS2 HUD SAFE ZONE MAPPING                              |
+------------------------------------------------------------------------------------+
| [RADAR SAFE ZONE]                                            [KILLFEED SAFE ZONE]  |
| 350x350px Top-Left                                           400x300px Top-Right   |
| (NO WIDGETS ALLOWED)                                         (NO WIDGETS ALLOWED)  |
|                                                                                    |
|                                                                                    |
|                              [CROSSHAIR SAFE ZONE]                                 |
|                               Center 450x450px Area                                |
|                               (STRICTLY UNRESTRICTED                               |
|                                NO OVERLAYS PERMITTED)                              |
|                                                                                    |
|                                                                                    |
| [HEALTH / ARMOR ZONE]                                        [AMMO / WEAPON ZONE]  |
| Bottom-Left 400x150px                                        Bottom-Right 400x150px|
| (NO WIDGETS ALLOWED)                                         (NO WIDGETS ALLOWED)  |
+------------------------------------------------------------------------------------+
```

1. **Crosshair Safe Zone**: A mandatory clear zone of at least 450x450 pixels centered on the player's crosshair. Zero overlays, text cards, or background tints may render in this zone during `COMPETITIVE_PROTECTED`.
2. **Native HUD Clearance**: Widgets are anchored strictly in designated gutters (e.g. top-center under the team score bar, or mid-left / mid-right margins).
3. **Transparent Click-Through Window Architecture**:
   - Built using Electron's `BrowserWindow` with:
     ```typescript
     {
       transparent: true,
       frame: false,
       alwaysOnTop: true,
       focusable: false,
       hasShadow: false,
       webPreferences: { nodeIntegration: false, contextIsolation: true }
     }
     ```
   - Invokes `window.setIgnoreMouseEvents(true, { forward: true })` so that 100% of mouse clicks and cursor movements pass directly through to Counter-Strike 2 without latency or input capture.
4. **Visual Customization**:
   - Master and per-module opacity controls (slider from 20% to 100%).
   - Global scale controls (80%, 100%, 120%).
   - Full interactive editing via the `SIMULATION_PREVIEW` screen.

---

## 5. Features Discovered Table

The table below enumerates all features discovered and specified across Valve Compliance, GSI protocol, Tactical Memory, and the Live Match Engine.

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Valve Compliance | **Official Primary-Source Documentation** | Cites exact SSA, Trusted Mode, VAC, GSI, and tournament rules with URLs and dates. | Legal and technical documentation URLs | Verified `COMPLIANCE.md` records | N/A (Static authoritative reference) | SSA Sec. 4, Trusted Mode FAQ |
| 2 | Valve Compliance | **Strict Anti-Claim Enforcement** | Explicit architectural ban on claiming "VAC-proof", "100% VAC safe", or "Valve approved". | Marketing strings, UI copy, code comments | Compliance lint pass; zero prohibited claims | Build/CI failure if prohibited keywords detected | Valve Trusted Mode FAQ (No Whitelist rule) |
| 3 | Valve Compliance | **Six Zero Anti-Cheat Invariants** | Hard prohibitions against DLL injection, memory reading, process hiding, input macros, hooks, and scraping. | System calls, codebase architecture | Zero unsafe Win32 calls (`OpenProcess`, `CreateRemoteThread`) | Static code analysis violation | Steam Subscriber Agreement & VAC policies |
| 4 | Valve Compliance | **Feature Compliance Matrix** | Tri-tier classification (`VERIFIED PERMITTED`, `REQUIRES APPROVAL`, `PROHIBITED`) gating capabilities. | Feature definitions and metadata | Permitted execution matrix | Execution aborted if feature is `PROHIBITED` | ORIGINAL_REQUEST.md R1 & Tournament rules |
| 5 | Valve Compliance | **Environment Capability Gating** | Actively restricts features across `COMPETITIVE_PROTECTED`, `PRACTICE_SERVER`, and `SIMULATION_PREVIEW`. | `map.mode`, `sv_cheats`, host IP | Active capability profile flags | Falls back to strictest (`COMPETITIVE_PROTECTED`) if mode unknown | CS2 Match Types & Tournament Regulations |
| 6 | GSI Protocol | **KeyValues1 Config Generator** | Generates valid `gamestate_integration_*.cfg` with buffer, throttle, heartbeat, and auth tokens. | Local port, auth token, telemetry flags | Valid `.cfg` file in CS2 `cfg/` directory | Alerts user if CS2 path not found | Valve GSI Specification |
| 7 | GSI Protocol | **Local HTTP POST Listener** | Asynchronous HTTP server listening on localhost for incoming GSI payloads. | HTTP POST requests on `/api/gsi` | Parsed game state, HTTP 200 OK | HTTP 401 on bad token; HTTP 400 on malformed body | Valve GSI Specification |
| 8 | GSI Protocol | **Auth Token Validator** | Validates incoming `auth.token` against local secret to prevent spoofed network injections. | `auth.token` string in JSON payload | Boolean authentication result | Rejects unauthorized packets with HTTP 401 | Valve GSI Security Specification |
| 9 | GSI Protocol | **Heartbeat & Liveness Monitor** | Tracks incoming packet frequency and detects game exit, crash, or map unload. | GSI payload timestamps, system clock | Connection status (`CONNECTED`, `IDLE`, `DISCONNECTED`) | Transitions to `DISCONNECTED` after 30s silence | Valve GSI Heartbeat Specification |
| 10 | GSI Protocol | **Delta & Previously Processor** | Parses Valve GSI `previously` and `added` blocks to compute exact state deltas. | Payload `previously` and `added` objects | Emitted delta events (e.g. `HEALTH_LOST`) | Falls back to full state comparison if deltas missing | Valve GSI Delta Specification |
| 11 | GSI Protocol | **Data Isolation Barrier** | Sanitizes incoming payload to ensure no prohibited spectator fields are read during live play. | Full GSI JSON payload | Sanitized player-only state object | Discards enemy position arrays in competitive play | Valve GSI Player vs Spectator Rules |
| 12 | Live Match Engine | **Simulation / Live Stream Separation** | Strict separation of `LiveGSIProvider` from `SimulationProvider` with visible watermark. | User mode selection or mock events | Isolated match event stream | Simulation events cannot enter live competitive stream | ORIGINAL_REQUEST.md R4 |
| 13 | Live Match Engine | **Provenance-Tracked Tactical Memory** | Classifies all game events as `CONFIRMED`, `REPORTED`, or `INFERRED`. | Normalized game events | Structured tactical memory graph | Discards unprovenanced or corrupted events | ORIGINAL_REQUEST.md R4 |
| 14 | Live Match Engine | **Observation vs Interpretation Filter** | Enforces that victim death location does not misclassify killer location (Palace rule). | `PLAYER_DEATH` event (Victim X, Killer Y) | Confirmed Victim X at Palace; Killer Y location UNKNOWN | Rejects inference promotion to confirmed status | ORIGINAL_REQUEST.md R4 & Test Domain 4 |
| 15 | Live Match Engine | **Memory Decay & Round Purging** | Time-decay curves for last-seen opponents and instant wipe on round boundary. | System timestamp, round phase transitions | Active visual staleness levels (Fresh -> Expired) | Force-clears all spatial events on `round_end`/`freezetime` | Tactical Memory Specification |
| 16 | Live Match Engine | **Last Known Information Overlay** | Annotates last-known enemy callouts with elapsed seconds counter and visual fade. | Active Tactical Memory events | Non-intrusive HUD badges | Hides badges exceeding 15s TTL | ORIGINAL_REQUEST.md R4 |
| 17 | Live Match Engine | **Lineup Execution State Machine** | 7-state FSM (`INACTIVE` -> `NEARBY` -> `POSITIONING` -> `ALIGNING` -> `READY` -> `EXECUTED` -> `NEXT`). | Player position, view angles, weapon state | State transitions, HUD cards, throw prompts | Resets to `INACTIVE` if player departs zone | ORIGINAL_REQUEST.md R4 |
| 18 | Live Match Engine | **Lineup Hysteresis & Debounce** | Dual-radius thresholds (entry 15u, exit 40u) and 300ms stationary filter to prevent rapid oscillation. | Continuous player coordinates | Stabilized state transitions | Ignores boundary micro-movements | FSM Stability Specification |
| 19 | Live Match Engine | **Strict Completion Classification** | Labels utility throws as `Attempted`, `Confirmed thrown`, `Confirmed landed`, or `Manually completed`. | GSI throw events, GOTV entity tracking | Permanent throw record classification | Defaults to `Attempted` if landing unverified | ORIGINAL_REQUEST.md R4 & Test Domain 5 |
| 20 | Live Match Engine | **High-Precision Bomb Timer** | Millisecond-accurate 40s countdown synced to `bomb.state == "planted"` with latency offset. | `bomb.state`, `phase_countdowns.phase_ends_in` | Visual countdown (`00:24`) and urgency stages | Automatically clears on defuse, explosion, or round end | ORIGINAL_REQUEST.md R4 & CS2 Bomb Rules |
| 21 | Live Match Engine | **Bomb Defuse Deadline Indicators** | Visual/auditory stage alerts at 10s (no-kit limit) and 5s (kit limit) point-of-no-return. | Remaining bomb seconds, kit inventory | Color transition (Green -> Amber -> Red -> Flash) | Prompts "SAVE WEAPONS" if defuse mathematically impossible | CS2 Competitive Mechanics |
| 22 | Live Match Engine | **Global HUD Priority Arbitrage** | Central manager arbitrating `CRITICAL`, `CONTEXTUAL`, `INFORMATIONAL`, and `PASSIVE` layers. | Active UI widget requests | Rendered layout without visual collisions | Demotes or hides lower priority widgets | ORIGINAL_REQUEST.md R4 |
| 23 | Live Match Engine | **CS2 HUD Safe Zone Enforcement** | Protects crosshair (450x450px), radar, killfeed, and ammo HUD areas from overlay intrusion. | Screen dimensions, aspect ratio | Bounded overlay layout geometry | Off-limits zones hardcoded; overlays reposition | CS2 Viewport & Safe Zone Rules |
| 24 | Live Match Engine | **Transparent Click-Through Overlay** | Borderless Electron transparent window with `setIgnoreMouseEvents` forwarding all clicks to CS2. | OS window manager events | Click-through transparent surface | Bypasses mouse capture so CS2 retains 100% focus | Electron Desktop Overlay Standards |
| 25 | Live Match Engine | **Interactive Preview & Calibration** | Dedicated simulation environment allowing users to drag, scale, and adjust opacity of HUD modules. | User slider inputs, synthetic events | Visual preview on simulated CS2 backdrop | Changes saved to persistent user settings | ORIGINAL_REQUEST.md R4 |

---

## 6. Edge Cases Table

The table below enumerates all identified technical and operational edge cases along with observed/mandated behaviors.

| # | Feature | Input / Trigger Condition | Observed / Mandated Behavior |
|---|---------|---------------------------|------------------------------|
| 1 | GSI Listener | Client sends invalid or missing `auth.token`. | Returns HTTP `401 Unauthorized`; payload is immediately discarded; zero state changes occur. |
| 2 | GSI Listener | Client sends malformed or truncated JSON (e.g. abrupt game crash mid-transmission). | JSON parser error caught by boundary; returns HTTP `400 Bad Request`; listener remains healthy; zero crash. |
| 3 | GSI Listener | Port `31337` is already bound by another application on system startup. | Detects `EADDRINUSE`; automatically tests `31338`, `31339`; notifies user via settings UI; updates `.cfg`. |
| 4 | GSI Listener | CS2 crashes or user terminates game process without clean disconnect. | Heartbeat monitor detects 30s silence; transitions match state to `DISCONNECTED`; flushes active HUD. |
| 5 | GSI Listener | Game client transitions to spectator mode after local player death. | Payload `player` changes to spectated teammate; engine detects `player.steamid != localSteamId` and locks local player telemetry. |
| 6 | Capability Gating | Player joins a custom community server with unknown `map.mode`. | Fails safe: defaults immediately to `COMPETITIVE_PROTECTED`; disables real-time crosshair aids until verified. |
| 7 | Capability Gating | Player loads a local practice map (`map de_mirage`) but executes `sv_cheats 0`. | Gating switches to `COMPETITIVE_PROTECTED` mode because `sv_cheats` is disabled, enforcing fair play rules. |
| 8 | Capability Gating | User attempts to enable "Lineup Crosshair Overlay" while in Premier ranked match. | Action rejected by Compliance Layer; UI presents disabled state with tooltip: `"Disabled in Competitive Protected Mode"`. |
| 9 | Tactical Memory | Player X dies at Palace; killer Player Y was using an AWP from an unknown spot. | Records confirmed victim X at Palace; records killer Y identity; leaves killer Y location as `UNKNOWN`. Never places Y at Palace. |
| 10 | Tactical Memory | Teammate calls out "Two pushing B Apartments" via voice; user taps hotkey tag. | Event recorded with provenance `REPORTED`; confidence set to 0.7; visual badge clearly labeled `[REPORTED]`. |
| 11 | Tactical Memory | 4 Terrorists spotted on A site with bomb planted on A; 5th T has not been seen. | Engine infers 5th T is lurking or rotating; event logged with provenance `INFERRED`; confidence set to 0.5. |
| 12 | Tactical Memory | Round ends abruptly due to time running out (`round.phase == "over"`). | All spatial memory events (last-seen locations, smoke timers) are instantly purged; economy stats archived to History. |
| 13 | Tactical Memory | Smoke grenade is detonated at 01:45; at 01:50 an HE grenade explodes inside the smoke. | CS2 smoke dispersion mechanics: smoke clears immediately; Tactical Memory drops smoke timer to 0.0s. |
| 14 | Bomb Timer | Bomb is planted, but GSI HTTP request suffers 350ms local OS scheduling delay. | Engine reads `provider.timestamp` and `phase_countdowns.phase_ends_in`; subtracts measured delay; timer displays exact true remaining time. |
| 15 | Bomb Timer | Bomb is defused with 0.2 seconds remaining before explosion. | GSI emits `bomb.state == "defused"`; Bomb Timer immediately halts, turns blue/celebratory, and fades within 1.5s. |
| 16 | Bomb Timer | Round restarts or transitions to warmup while bomb was planted. | `map.phase` changes to `"warmup"`; Bomb Timer immediately unmounts and removes itself from screen. |
| 17 | Lineup FSM | Player enters lineup radius (10 units), then rapidly steps back and forth across 15-unit boundary. | Hysteresis prevents flickering: entry requires < 15 units; exit requires > 40 units. FSM remains stable in `POSITIONING`. |
| 18 | Lineup FSM | Player stands in position but shakes mouse erratically. | Stationary speed is 0, but view angle deviation exceeds 0.5 degrees; state remains in `ALIGNING`; does NOT transition to `READY`. |
| 19 | Lineup FSM | Player in `READY` state switches to primary weapon instead of throwing grenade. | Active weapon changes to `"weapon_ak47"`; state machine cancels `READY` and returns to `ALIGNING`. |
| 20 | Lineup FSM | Player throws grenade, but it bounces off a teammate's head and misses landing zone. | In practice mode, landing coordinates exceed 150-unit target radius; classified as `Attempted` (NOT `Confirmed landed`). |
| 21 | HUD Manager | `CRITICAL` Bomb Timer triggers while a `CONTEXTUAL` Lineup Card is active on screen. | HUD Arbitrage lowers opacity of Lineup Card to 20% and moves it to secondary gutter; Bomb Timer takes prominent focus. |
| 22 | HUD Manager | CS2 runs in exclusive fullscreen mode on Windows, preventing desktop window overlay. | Overlay detects fullscreen occlusion; displays notification recommending "Borderless Windowed" or switches to secondary monitor. |
| 23 | HUD Manager | User changes desktop display scaling from 100% to 150% in Windows display settings. | Electron renderer catches `window.devicePixelRatio` change; recalculates safe zone boundaries and re-scales widgets. |
| 24 | HUD Manager | User clicks anywhere on the transparent overlay during active gameplay. | `setIgnoreMouseEvents(true, { forward: true })` ensures click passes seamlessly to CS2; player weapon fires normally without window lag. |
| 25 | Gemini Coach | GSI round ends, but Gemini API experiences high latency (> 15s) and response arrives during live combat. | Stale-response validator checks `roundId` and `expiresAt`; detects round has already begun; discards stale advice card. |

---

## 7. Verification Method & Traceability

To ensure independent verification of all mined requirements:

1. **Compliance Verification**:
   - Inspect `COMPLIANCE.md` to ensure all 6 authoritative primary sources, exact URLs, verification dates, the Anti-Claim rule, and the Feature Compliance Matrix are present.
   - Run static analysis / grep across codebase to ensure zero instances of `OpenProcess`, `ReadProcessMemory`, `CreateRemoteThread`, `SendInput`, or forbidden marketing claims (`"VAC-proof"`, `"100% VAC safe"`).
2. **Automated Unit & Integration Test Suite (`npm test`)**:
   - Test Domain 1: GSI payload parsing and malformed JSON resilience.
   - Test Domain 2: Event normalization & provenance tracking (`CONFIRMED`, `REPORTED`, `INFERRED`).
   - Test Domain 3: Last-seen expiration & visual decay curves.
   - Test Domain 4: Observation vs. interpretation discipline (Palace victim vs killer isolation).
   - Test Domain 5: Lineup state machine transitions, hysteresis, and completion types (`Attempted`, `Confirmed thrown`, `Confirmed landed`, `Manually completed`).
   - Test Domain 7: Match detection, capability gating, and simulation mode separation.
   - Test Domain 9: Environment capability gating (`COMPETITIVE_PROTECTED`, `PRACTICE_SERVER`, `SIMULATION_PREVIEW`).
3. **End-to-End Build (`npm run build`)**:
   - Verify clean TypeScript compilation with zero type errors.
