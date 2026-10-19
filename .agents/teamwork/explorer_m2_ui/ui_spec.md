# CS2 Assistant — Milestone 2 UI Specification
## Minimalist Dark Design System, 3 Destinations Navigation & HUD Overlay

**Document Version**: 2.0.0-M2  
**Target Architecture**: Electron 33+, React 18+, TypeScript 5.6+, Vite 5.4+, Tailwind CSS 3.4+  
**Target Audience**: Implementers, Frontend Engineers, System Auditors  
**Governing Documents**: `ORIGINAL_REQUEST.md` (§R2, §Acceptance), `PROJECT.md` (Features 6, 7, 8, 9, 10), `COMPLIANCE.md` (29 Features)

---

## 1. Executive Summary & Design Philosophy

### 1.1 The High-Precision Minimalist Invariant
Counter-Strike 2 is a competitive esport governed by millisecond-precision reaction times and strict visual focus. Typical gaming utility software suffers from "gamer-RGB" clutter: animated rainbow gradients, glowing neon borders, noisy notification cards, and bloated chrome. 

**CS2 Assistant completely rejects this aesthetic.**

CS2 Assistant implements a **Precision Minimalist Dark Design System** inspired by mission-critical aerospace telemetry, military fire-control instruments, and professional trading stations:
- **Base Background**: Deep Charcoal / Near-Black Zinc-950 (`#09090b`) providing maximum contrast with zero eye fatigue.
- **Container Surfaces**: Subtle Dark Charcoal (`#121215`) for structural cards and panels.
- **Elevated Surfaces**: Raised Panel Charcoal (`#18181c`) with interactive hover states at `#202026`.
- **Subtle 1px Borders**: Muted zinc-800 (`#27272a`) borders defining crisp structural boundaries without visual bulk.
- **Restrained Typography**: Inter / system-ui for legible, neutral body copy; JetBrains Mono / Consolas for telemetry, timers, coordinates, IDs, and financial/health data.
- **Strict Tactical Color Semantics**: Color is used solely for functional information delivery:
  - **Tactical Cyan (`#06b6d4` / `#22d3ee`)**: Lineups, utility flight paths, inferred observations, planning mode.
  - **Tactical Emerald (`#10b981` / `#34d399`)**: Confirmed observations, active GSI telemetry, successful validation, permitted capabilities.
  - **Tactical Amber (`#f59e0b` / `#fbbf24`)**: Caution, reported observations, standby status, simulation mode, gated capabilities.
  - **Tactical Rose (`#f43f5e` / `#fb7185`)**: Critical warnings, active bomb countdown (< 10s), prohibited capabilities.
- **Zero Gamer-RGB Clutter**: No radial rainbow glows, no pulsing drop shadows, no distracting sound effects, no unnecessary animations during active gameplay.

### 1.2 Landing Screen: Exactly Three Primary Destinations
To maintain absolute cognitive clarity, the landing screen features **only three primary navigation destinations**:
1. **LIVE MATCH (`'LIVE_MATCH'`)**: Real-time match telemetry, GSI status badge, 2D radar overview, provenance-tracked tactical observation feed (with Palace killer invariance), bomb timer widget, lineup execution FSM, and Gemini coach advice.
2. **UTILITY ROOM (`'UTILITY_ROOM'`)**: Strategic playbook preview, 6 Active Duty map selector (Mirage, Inferno, Dust2, Nuke, Ancient, Anubis), lineup library with SVG landmark previews, and Match Preparation Profiles.
3. **HISTORY (`'HISTORY'`)**: Chronological match ledger, evidence-based performance summary separating measured telemetry from AI interpretation, and the mandatory one-click practice loop trigger (`[PRACTICE — MIRAGE A RETAKE]`).

A **Compact Secondary Menu** is housed in a clean slide-out drawer accessible via header icon or keyboard shortcut (`S` or `Ctrl+,`), hosting:
- Gemini API Key Configuration (DPAPI encrypted, connection testing, key removal, zero plaintext logging)
- Appearance & HUD Configuration (environment mode, overlay scale, opacity, safe-zone preview)
- Compliance & Capability Matrix Viewer (read-only inspector for all 29 features)
- Help & Documentation (keybindings, GSI config setup, primary Valve sources)

---

## 2. Design System Tokens & Styling Standards

### 2.1 Tailwind Palette & Color Hierarchy
All Tailwind classes correspond to tokens defined in `tailwind.config.js`:

| Role | Hex Code | Tailwind Custom Token | Standard Tailwind Equivalent | Usage |
|:---|:---|:---|:---|:---|
| **Canvas / Base BG** | `#09090b` | `bg-background` | `bg-zinc-950` | Root application background |
| **Container Surface** | `#121215` | `bg-background-container` | `bg-[#121215]` | Sidebar, cards, sheet containers |
| **Elevated Panel** | `#18181c` | `bg-background-panel` | `bg-[#18181c]` | Card headers, table rows, inputs |
| **Hover / Active Surface** | `#202026` | `bg-background-elevated` | `bg-[#202026]` | Hover state for buttons/cards |
| **Subtle Border (1px)** | `#27272a` | `border-border-subtle` | `border-zinc-800` | Grid dividers, card borders |
| **Elevated Border** | `#3f3f46` | `border-border-elevated` | `border-zinc-700` | Focused inputs, active tabs |
| **Active / Focus Border** | `#52525b` | `border-border-active` | `border-zinc-600` | Keyboard focus ring |
| **Primary Text** | `#f4f4f5` | `text-zinc-100` | `text-zinc-100` | Headlines, primary values |
| **Muted Secondary Text**| `#a1a1aa` | `text-zinc-400` | `text-zinc-400` | Descriptions, labels, hints |
| **Subdued Tertiary Text**| `#71717a` | `text-zinc-500` | `text-zinc-500` | Disabled text, subtle metadata |
| **Tactical Cyan** | `#06b6d4` | `text-tactical-cyan` | `text-cyan-500` | Lineup cues, inferred data |
| **Tactical Emerald** | `#10b981` | `text-tactical-emerald` | `text-emerald-500`| Confirmed facts, active status |
| **Tactical Amber** | `#f59e0b` | `text-tactical-amber` | `text-amber-500` | Reported facts, warnings |
| **Tactical Rose** | `#f43f5e` | `text-tactical-rose` | `text-rose-500` | Critical danger, bomb timer |

### 2.2 Typography Scale & Restraint
- **Display / Brand**: `text-xs font-semibold tracking-widest uppercase` (e.g., `CS2 ASSISTANT // v1.0.0`)
- **Destination Tab Header**: `text-xs font-medium tracking-wider uppercase`
- **Section Headline**: `text-sm font-semibold tracking-wide text-zinc-100`
- **Body Text**: `text-xs leading-relaxed text-zinc-300 font-normal`
- **Telemetry / Timers / Coordinates**: `font-mono text-xs tabular-nums text-zinc-200`
- **Critical Bomb Timer**: `font-mono text-2xl font-bold tracking-tight tabular-nums`

### 2.3 Keyboard Navigation & Ergonomics
The UI is fully operable without mouse interaction:
- `1` or `Alt+1`: Select **LIVE MATCH** destination
- `2` or `Alt+2`: Select **UTILITY ROOM** destination
- `3` or `Alt+3`: Select **HISTORY** destination
- `S` or `Alt+S` or `Ctrl+,`: Toggle **Secondary Menu** (Settings & Config)
- `Escape`: Close Secondary Menu / dismiss open modals / cancel active lineup
- `?`: Open Help & Documentation drawer tab
- `Tab` / `Shift+Tab`: Clean accessible navigation with `focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:outline-none`

---

## 3. Component Hierarchy & File Structure

```
src/renderer/
├── index.html                           # App shell entry point
├── main.tsx                             # React 18 createRoot & StrictMode
├── index.css                            # Tailwind base layer & reset
├── App.tsx                              # Core router & layout coordinator
├── components/
│   ├── common/                          # Reusable UI primitives
│   │   ├── Badge.tsx                    # Minimalist status & provenance badge
│   │   ├── Button.tsx                   # Accessible, restrained dark button
│   │   ├── Input.tsx                    # 1px border input with focus state
│   │   ├── Slider.tsx                   # Restrained custom range slider
│   │   ├── Toggle.tsx                   # Compact boolean switch
│   │   └── Modal.tsx                    # Backdrop-shielded accessible modal
│   ├── navigation/
│   │   ├── Navbar.tsx                   # 3 Primary Destinations & live status header
│   │   └── SecondaryMenu.tsx            # Slide-out drawer for Settings & Compliance
│   ├── destinations/
│   │   ├── LiveMatchView.tsx            # LIVE MATCH destination view
│   │   ├── UtilityRoomView.tsx          # UTILITY ROOM destination view
│   │   └── HistoryView.tsx              # HISTORY destination view
│   └── hud-overlay/
│       ├── HudOverlayView.tsx           # Standalone transparent click-through HUD
│       ├── SafeZoneGuide.tsx            # Visual safe-zone calibration preview
│       └── BombTimerWidget.tsx          # Standalone synchronized bomb timer
├── hooks/
│   ├── useNavigation.ts                 # 3 destinations router & shortcut listener
│   ├── useGsiState.ts                   # Typed GSI telemetry & connection state
│   ├── useLineupFsm.ts                  # Lineup state machine transitions & actions
│   ├── useGeminiConfig.ts               # DPAPI secure credential & test connection
│   ├── useHudConfig.ts                  # Overlay scaling, opacity, safe-zone toggles
│   └── useComplianceState.ts            # Read-only 29-feature compliance matrix
└── types/
    └── ui.ts                            # Renderer-specific UI types & contracts
```

---

## 4. Detailed Component Technical Specifications

### 4.1 Root Application Shell (`src/renderer/App.tsx`)

#### File Path
`src/renderer/App.tsx`

#### Responsibilities
1. Serves as the central state coordinator for the application.
2. Manages the active primary destination state (`'LIVE_MATCH'`, `'UTILITY_ROOM'`, `'HISTORY'`).
3. Manages the open/closed state and active sub-tab of `SecondaryMenu`.
4. Houses the overlay routing branch: checks `window.location.hash === '#/hud-overlay'` or `?overlay=true` to render standalone `HudOverlayView` when running inside Electron's transparent click-through HUD window.
5. Registers global keyboard shortcuts (`1`, `2`, `3`, `S`, `Escape`, `?`).
6. Supplies shared contexts or state to destination views.

#### Component Props & State Interface
```typescript
export type PrimaryDestination = 'LIVE_MATCH' | 'UTILITY_ROOM' | 'HISTORY';
export type SecondaryMenuTab = 'GEMINI_API_KEY' | 'HUD_CONFIGURATION' | 'COMPLIANCE_MATRIX' | 'HELP';

export interface AppState {
  activeDestination: PrimaryDestination;
  isSecondaryMenuOpen: boolean;
  secondaryMenuTab: SecondaryMenuTab;
  utilityPreselectedMap?: string;
  utilityPreselectedStrategyId?: string;
}
```

#### Tailwind Styling & Layout Structure
- Outer container: `flex h-screen w-screen flex-col bg-background text-zinc-100 select-none overflow-hidden font-sans`
- Header zone: `<Navbar />` (fixed 48px height)
- Content zone: `flex-1 overflow-auto bg-background p-4`
- Drawer / Modal overlay: `<SecondaryMenu />` rendered conditionally or with CSS slide transition.

#### Code Architecture Skeleton
```tsx
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/navigation/Navbar';
import SecondaryMenu from './components/navigation/SecondaryMenu';
import LiveMatchView from './components/destinations/LiveMatchView';
import UtilityRoomView from './components/destinations/UtilityRoomView';
import HistoryView from './components/destinations/HistoryView';
import HudOverlayView from './components/hud-overlay/HudOverlayView';

export default function App(): JSX.Element {
  // 1. Overlay Window Detection (for Electron transparent window)
  const isOverlayMode = window.location.hash === '#/hud-overlay' || 
                        window.location.search.includes('overlay=true');

  if (isOverlayMode) {
    return <HudOverlayView />;
  }

  // 2. Primary Navigation State
  const [activeDestination, setActiveDestination] = useState<PrimaryDestination>('LIVE_MATCH');
  const [isSecondaryMenuOpen, setIsSecondaryMenuOpen] = useState<boolean>(false);
  const [secondaryMenuTab, setSecondaryMenuTab] = useState<SecondaryMenuTab>('GEMINI_API_KEY');
  
  // 3. Closed Loop Deep-Link State (History -> Utility Room)
  const [utilitySelection, setUtilitySelection] = useState<{ map?: string; strategyId?: string }>({});

  // 4. Closed Loop Practice Retake Trigger Handler
  const handleTriggerPracticeRetake = useCallback((map: string, strategyId: string) => {
    setUtilitySelection({ map, strategyId });
    setActiveDestination('UTILITY_ROOM');
  }, []);

  // 5. Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if (e.key === '1' || (e.altKey && e.key === '1')) {
        e.preventDefault();
        setActiveDestination('LIVE_MATCH');
      } else if (e.key === '2' || (e.altKey && e.key === '2')) {
        e.preventDefault();
        setActiveDestination('UTILITY_ROOM');
      } else if (e.key === '3' || (e.altKey && e.key === '3')) {
        e.preventDefault();
        setActiveDestination('HISTORY');
      } else if (e.key.toLowerCase() === 's' || (e.ctrlKey && e.key === ',')) {
        e.preventDefault();
        setIsSecondaryMenuOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (isSecondaryMenuOpen) {
          e.preventDefault();
          setIsSecondaryMenuOpen(false);
        }
      } else if (e.key === '?') {
        e.preventDefault();
        setSecondaryMenuTab('HELP');
        setIsSecondaryMenuOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSecondaryMenuOpen]);

  return (
    <div className="flex h-screen w-screen flex-col bg-background text-zinc-100 select-none overflow-hidden">
      <Navbar
        activeDestination={activeDestination}
        onSelectDestination={setActiveDestination}
        onOpenSecondaryMenu={(tab) => {
          if (tab) setSecondaryMenuTab(tab);
          setIsSecondaryMenuOpen(true);
        }}
      />

      <main className="flex-1 overflow-hidden relative">
        {activeDestination === 'LIVE_MATCH' && <LiveMatchView />}
        {activeDestination === 'UTILITY_ROOM' && (
          <UtilityRoomView
            initialMap={utilitySelection.map}
            initialStrategyId={utilitySelection.strategyId}
          />
        )}
        {activeDestination === 'HISTORY' && (
          <HistoryView onTriggerPracticeRetake={handleTriggerPracticeRetake} />
        )}
      </main>

      {/* Slide-out Secondary Menu Drawer */}
      <SecondaryMenu
        isOpen={isSecondaryMenuOpen}
        activeTab={secondaryMenuTab}
        onSelectTab={setSecondaryMenuTab}
        onClose={() => setIsSecondaryMenuOpen(false)}
      />
    </div>
  );
}
```

---

### 4.2 Navigation Header (`src/renderer/components/navigation/Navbar.tsx`)

#### File Path
`src/renderer/components/navigation/Navbar.tsx`

#### Responsibilities
1. Renders the top 48px minimalist header bar.
2. Displays the brand identifier: `CS2 ASSISTANT` with current environment badge (`COMPETITIVE`, `PRACTICE`, or `SIMULATION`).
3. Houses the **Three Primary Navigation Destinations** segmented button bar:
   - `[1] LIVE MATCH`
   - `[2] UTILITY ROOM`
   - `[3] HISTORY`
4. Displays the live GSI Connection Status badge:
   - `ACTIVE MATCH` (pulsing emerald dot `#10b981`)
   - `STANDBY — AWAITING CS2` (amber dot `#f59e0b`)
   - `SIMULATION MODE` (cyan dot `#06b6d4`)
5. Houses the quick-toggle for Simulation Mode and the Secondary Menu trigger icon button (`[S]`).

#### Props Interface
```typescript
export interface NavbarProps {
  activeDestination: 'LIVE_MATCH' | 'UTILITY_ROOM' | 'HISTORY';
  onSelectDestination: (dest: 'LIVE_MATCH' | 'UTILITY_ROOM' | 'HISTORY') => void;
  onOpenSecondaryMenu: (tab?: 'GEMINI_API_KEY' | 'HUD_CONFIGURATION' | 'COMPLIANCE_MATRIX' | 'HELP') => void;
}
```

#### Tailwind Styling & Layout Structure
- Container: `flex h-12 w-full items-center justify-between border-b border-border-subtle bg-background-container px-4 z-20`
- Left section:
  - App Logo / Title: `flex items-center gap-2`
  - Title: `text-xs font-semibold tracking-widest text-zinc-100 uppercase`
  - Mode Pill: `text-[10px] font-mono px-1.5 py-0.5 rounded border border-border-subtle bg-background-panel text-zinc-400`
- Center section (The 3 Primary Destinations):
  - Segmented container: `flex items-center gap-1 rounded-lg border border-border-subtle bg-background p-1`
  - Active destination button: `bg-background-elevated text-zinc-100 border border-border-elevated shadow-subtle`
  - Inactive destination button: `text-zinc-400 hover:text-zinc-200 hover:bg-background-panel border border-transparent`
  - Base button style: `flex items-center gap-2 px-3 py-1 rounded text-xs font-medium tracking-wide transition-colors cursor-pointer`
  - Keyboard hint badge: `font-mono text-[10px] text-zinc-500`
- Right section:
  - GSI Status Indicator: `flex items-center gap-2 px-2.5 py-1 rounded-full border border-border-subtle bg-background-panel text-xs font-mono`
  - Settings Button: `flex items-center justify-center h-8 w-8 rounded border border-border-subtle bg-background-panel text-zinc-400 hover:text-zinc-100 hover:bg-background-elevated transition-colors cursor-pointer`

#### Visual Wireframe
```
+---------------------------------------------------------------------------------------------------------+
| CS2 ASSISTANT [COMPETITIVE]  |  [ [1] LIVE MATCH ] [ [2] UTILITY ROOM ] [ [3] HISTORY ]  | [● ACTIVE] [S]|
+---------------------------------------------------------------------------------------------------------+
```

---

### 4.3 Secondary Menu Drawer (`src/renderer/components/navigation/SecondaryMenu.tsx`)

#### File Path
`src/renderer/components/navigation/SecondaryMenu.tsx`

#### Responsibilities
1. Operates as a slide-out drawer from the right edge of the screen (`w-[520px]`).
2. Provides a semi-transparent backdrop (`bg-black/60 backdrop-blur-sm`) to close on click outside or on `Escape`.
3. Hosts 4 dedicated sub-tabs:
   - **`GEMINI_API_KEY`**: Windows DPAPI secured credential storage, test connection with latency readout, remove key action, zero plaintext guarantee.
   - **`HUD_CONFIGURATION`**: Environment Mode selector (`COMPETITIVE_PROTECTED`, `PRACTICE_SERVER`, `SIMULATION_PREVIEW`), overlay scale slider, opacity slider, safe-zone preview toggle.
   - **`COMPLIANCE_MATRIX`**: Real-time read-only viewer for all 29 features categorized from `COMPLIANCE.md`.
   - **`HELP`**: Keyboard shortcut reference, CS2 GSI configuration copy-paste guide, authoritative primary source links.

#### Props Interface
```typescript
export interface SecondaryMenuProps {
  isOpen: boolean;
  activeTab: 'GEMINI_API_KEY' | 'HUD_CONFIGURATION' | 'COMPLIANCE_MATRIX' | 'HELP';
  onSelectTab: (tab: 'GEMINI_API_KEY' | 'HUD_CONFIGURATION' | 'COMPLIANCE_MATRIX' | 'HELP') => void;
  onClose: () => void;
}
```

#### Detailed Panel Sub-Specifications:

##### Panel A: Gemini API Key Configuration
- **Security Notice**: 
  - Shaded panel: `border border-border-subtle bg-background-panel p-3 rounded text-xs text-zinc-400 leading-relaxed`
  - Text: *"Stored securely using Windows Data Protection API (DPAPI via Electron safeStorage). Zero plaintext logging. Key is encrypted on-disk and in-memory."*
- **Key Status Indicator**:
  - If configured: Emerald status dot + `Configured (••••••••••••••••38f9)`
  - If not configured: Amber status dot + `Not Configured — Deterministic Offline Rule Fallback Active`
- **Key Input Field**:
  - Input: `type="password"`, placeholder: `AIzaSy...`, styling: `w-full rounded border border-border-subtle bg-background px-3 py-2 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:border-border-active focus:outline-none`
  - Show/Hide plaintext toggle button (default: masked).
- **Action Buttons**:
  - `[Test Connection]`: Invokes `testApiConnection(key)` / `window.cs2Assistant.gemini.testKey(key)`. Displays loading spinner. On return:
    - Success: `Connection verified — Latency: 198ms` (tactical emerald text)
    - Failure: `Connection failed: ${error}` (tactical rose text)
  - `[Save Key]`: Calls `window.cs2Assistant.saveApiKey(key)` or `window.cs2Assistant.gemini.storeKey(key)`.
  - `[Remove Key]`: Calls `window.cs2Assistant.removeApiKey()`. Safely wipes local DPAPI store and updates state to `Not Configured`.
- **Zero Plaintext Logging Invariant**:
  - Explicit assertion in UI: *"Invariant F9.1: Zero plaintext logging. Credentials are never written to disk unencrypted, never serialized to console, and never sent across unverified IPC channels."*

##### Panel B: Appearance & HUD Configuration
- **Environment Mode Selector**:
  - 3-option segmented radio group:
    1. `COMPETITIVE_PROTECTED` (Ranked / Premier / FACEIT): "Active safe zones (450x450px crosshair, radar, status HUD clear). Passive tactical cards only. Zero in-game crosshair overlays."
    2. `PRACTICE_SERVER` (Offline / sv_cheats 1): "Active crosshair alignment landmarks, jumpthrow guides, and practice grenade trajectory previews enabled."
    3. `SIMULATION_PREVIEW` (Offline Sandbox): "Synthetic telemetry generator and interactive HUD position calibration."
- **Overlay Scale Slider**:
  - Range: `0.75x` to `1.50x` (step `0.05x`, default `1.00x`).
  - Readout: `font-mono text-xs text-zinc-300 tabular-nums`.
- **Overlay Opacity Slider**:
  - Range: `20%` to `100%` (step `5%`, default `90%`).
  - Readout: `font-mono text-xs text-zinc-300 tabular-nums`.
- **Safe-Zone Preview Toggle**:
  - Boolean switch: `[Toggle Safe-Zone Guides]`.
  - When enabled, renders shaded bounding boxes over the HUD overlay window marking Center Crosshair Safe Zone (`450x450px`), Top-Left Radar (`320x320px`), Bottom Status HUD (`120px`), and Killfeed (`400x200px`).
- **Reset to Defaults Button**:
  - Resets scale to `1.0x`, opacity to `90%`, and environment to `COMPETITIVE_PROTECTED`.

##### Panel C: Compliance & Capability Matrix Viewer
- **Title**: `Valve Regulatory Compliance Matrix (29 Active Features)`
- **Category Filter Tabs / Accordions**:
  1. Telemetry & GSI (`gsi_http_listener`, `gsi_delta_engine`) — 2 features
  2. Lineup & Strategy (`static_lineup_db`, `svg_landmark_reference`, `custom_lineup_storage`, `match_prep_profiles`) — 4 features
  3. Bomb & Memory (`gsi_bomb_timer`, `tactical_memory_provenance`, `palace_observation_filter`, `memory_decay_round_purge`) — 4 features
  4. Analytics & History (`history_match_analytics`, `practice_retake_trigger`) — 2 features
  5. AI Coach (`gemini_ai_tactical_coach`, `stale_ai_response_validation`) — 2 features
  6. Overlay & HUD (`transparent_desktop_hud`, `hud_priority_arbitrage`, `cs2_safe_zone_enforcement`, `practice_lineup_alignment`, `practice_trajectory_preview`, `interactive_hud_preview`) — 6 features
  7. Prohibited Cheating Vectors (`memory_reading`, `dll_injection`, `graphics_pipeline_hooking`, `input_automation`, `jumpthrow_recoil_macros`, `esp_wallhack_overlay`, `aim_assistance_triggerbot`, `spectator_data_mining`, `unauthorized_web_scraping`) — 9 features
- **Card Layout per Feature**:
  - Header: Feature Name + Status Badge (`VERIFIED_PERMITTED` in emerald, `REQUIRES_APPROVAL` in amber, `PROHIBITED` in rose with lock icon).
  - Permitted Environments list.
  - Enforcement Mechanism snippet.
  - Valve Primary Source Justification snippet.
  - Active status in currently selected environment (`ENABLED` or `GATED / SUPPRESSED`).

##### Panel D: Help & Documentation
- **Keyboard Shortcuts Reference Table**:
  - `1` / `Alt+1` -> LIVE MATCH
  - `2` / `Alt+2` -> UTILITY ROOM
  - `3` / `Alt+3` -> HISTORY
  - `S` / `Ctrl+,` -> Toggle Secondary Menu
  - `Esc` -> Close Drawer / Cancel Lineup
  - `?` -> Open Help & Documentation
- **GSI Setup Instructions**:
  - 3-step numbered guide to configure `gamestate_integration_cs2assistant.cfg`.
  - `[Copy Configuration to Clipboard]` button.
- **Authoritative Primary Source Links**:
  - 6 verified Valve and tournament links with canonical URLs and verification date `2026-10-19`.

---

### 4.4 Live Match Destination View (`src/renderer/components/destinations/LiveMatchView.tsx`)

#### File Path
`src/renderer/components/destinations/LiveMatchView.tsx`

#### Responsibilities
1. Primary operational screen during live gameplay and simulations.
2. Displays active match state header: Map, Score, Phase (`FREEZETIME`, `LIVE`, `BOMB_PLANTED`), Round Number, Economy.
3. Left Column (60%):
   - **Radar Map Overview**: 2D tactical map view representing active map callouts (Mirage: Palace, A Site, Connector, Mid, B Site, Apartments) with live player positions and last-seen markers.
   - **Tactical Observation Feed**: Provenance-tracked chronological event feed with strict provenance badges (`[CONFIRMED]`, `[REPORTED]`, `[INFERRED]`).
   - **Palace Killer Invariance Demonstration**: When a kill occurs at Palace, displays confirmed victim location at Palace, confirmed killer identity, and explicitly marks killer location as unconfirmed/unknown.
4. Right Column (40%):
   - **Bomb Timer Widget Placeholder**: Active plant countdown (`BOMB PLANTED 00:24`), urgency color shifts (Green >20s, Amber 10-20s, Red 5-10s, Flashing <5s), defusal kit feasibility.
   - **Lineup Execution FSM Widget Placeholder**: Visualizes the 7 states (`INACTIVE -> NEARBY -> POSITIONING -> ALIGNING -> READY -> EXECUTED -> NEXT`), distance to target, angular difference, and manual override buttons (`[NEXT]`, `[COMPLETE]`, `[CANCEL]`).
   - **Gemini Tactical Coach Advice Card**: Displays structured advice card (`shortDisplayText`, `priority`, `confidence`, `expiresAt`), with offline rule engine fallback indicator.
5. Inactive / Standby State View:
   - When no match is active, displays clean standby banner with `[START SIMULATION SCENARIO]` button.

#### Visual Wireframe
```
+---------------------------------------------------------------------------------------------------------+
| LIVE MATCH // DE_MIRAGE // PREMIER // SCORE: CT 7 - 5 T // ROUND 13 (LIVE 01:24) // STANDBY/ACTIVE     |
+-------------------------------------------------------------+-------------------------------------------+
| 2D RADAR TACTICAL MAP OVERVIEW                              | BOMB TIMER WIDGET                         |
|                                                             | [ BOMB PLANTED 00:24.2 ]                  |
|   [A Site]           [Connector]        [Mid]               | [██████████████████░░░░░░░░░░░░]          |
|   ● Player CT 1      ● Opponent ?       ● Player T 1        | DEFUSAL STATUS: KIT FEASIBLE (10s)        |
|                                                             +-------------------------------------------+
|   [Palace]                                                  | LINEUP EXECUTION STATE MACHINE            |
|   ▲ Victim Death Location (CONFIRMED)                       | ACTIVE: Mirage A Stairs Smoke             |
|                                                             | [INACTIVE > NEARBY > [POSITIONING] > ...] |
|-------------------------------------------------------------| DISTANCE TO ANCHOR: 14 units              |
| TACTICAL OBSERVATION FEED (PROVENANCE TRACKED)              | CONTROLS: [NEXT] [COMPLETE] [CANCEL]      |
| [CONFIRMED] Player X eliminated at Palace (Killfeed)        +-------------------------------------------+
|   └─ Killer: Player Y (Location: UNKNOWN - Fair Play Rule)  | GEMINI TACTICAL COACH                     |
| [REPORTED] Footsteps audio near B Apartments (Radar/Audio)  | [CRITICAL // 92% CONFIDENCE]              |
| [INFERRED] Opponent rotation toward A Site (Timing decay)   | "FALLBACK SITE - 2V4 POST-PLANT SETUP"    |
|                                                             | Expires in 11s | Model: gemini-3.8-flash  |
+-------------------------------------------------------------+-------------------------------------------+
```

---

### 4.5 Utility Room Destination View (`src/renderer/components/destinations/UtilityRoomView.tsx`)

#### File Path
`src/renderer/components/destinations/UtilityRoomView.tsx`

#### Responsibilities
1. Tactical library and preparation center for the 6 Active Duty competitive maps:
   - `Mirage (de_mirage)`
   - `Inferno (de_inferno)`
   - `Dust II (de_dust2)`
   - `Nuke (de_nuke)`
   - `Ancient (de_ancient)`
   - `Anubis (de_anubis)`
2. Header Bar:
   - 6-map tab selector with map thumbnails/badges.
   - Match Preparation Profile selector dropdown: e.g. `[Default Mirage A Execution]` with `[Bind to Match Context]` button.
3. Filter & Search Toolbar:
   - Utility Type filter buttons: `All`, `Smoke`, `Flash`, `Molotov`, `HE`.
   - Side filter buttons: `All`, `T Side`, `CT Side`.
   - Difficulty/Tier filter: `Basic`, `Intermediate`, `Advanced`, `Coordinated`.
   - Search input.
4. Two-Panel Layout:
   - **Left Panel (50%)**: Lineup Library & Strategy Playbook Browser.
     - Multi-phase Coordinated Strategy Cards (e.g., `MIRAGE A DEFAULT EXECUTE: 3 SMOKES, 2 FLASHES`).
     - Lineup Cards: Title, utility icon, throw type (`JUMPTHROW`, `STANDING`), target destination, verified badge (`CSNADES / Scope.gg / Verified`).
   - **Right Panel (50%)**: Lineup & Landmark Detail Inspector.
     - SVG Landmark Visual Reference Placeholder: Visual crosshair placement diagram and pin alignment landmarks.
     - Step-by-step instructions: Stand on beam, aim at apex, execute jumpthrow.
     - Coordinates and tolerance specifications.
     - `[Launch Practice Drill]` button.

---

### 4.6 History Destination View (`src/renderer/components/destinations/HistoryView.tsx`)

#### File Path
`src/renderer/components/destinations/HistoryView.tsx`

#### Responsibilities
1. Chronological ledger of completed matches.
2. Top Ribbon: Performance overview (Win rate, ADR, Utility damage, First death rate, Retake success rate).
3. Left Column (50%): Chronological Match Ledger.
   - List of match cards (Date/Time, Map, Result `VICTORY`/`DEFEAT`, Final Score, Game Mode).
4. Right Column (50%): Evidence-Based Performance Summary & Practice Loop:
   - **Measured Telemetry (Facts)**:
     - Strict table displaying measured statistics from GSI (Damage, Flash assists, Retake success rate, First deaths).
   - **AI Tactical Interpretation (Separated Inferences)**:
     - Clearly segregated section labeled *"Gemini Tactical Interpretation — Inferred Patterns"*.
     - Highlights recurring tactical mistakes (e.g. "Frequent late rotations from B Short; low utility usage on A site retakes").
   - **The Mandatory One-Click Closed Loop Practice Trigger**:
     - Prominently styled action card: `[PRACTICE — MIRAGE A RETAKE]`.
     - Clicking this trigger immediately invokes `onTriggerPracticeRetake('de_mirage', 'strat-mirage-a-retake')`.
     - App navigates to `UTILITY ROOM`, pre-selects `Mirage`, and opens the `Mirage A Retake` strategy and lineups!
     - Completes the required `UTILITY ROOM → LIVE MATCH → HISTORY → UTILITY ROOM` closed loop!

---

### 4.7 HUD Overlay View (`src/renderer/components/hud-overlay/HudOverlayView.tsx`)

#### File Path
`src/renderer/components/hud-overlay/HudOverlayView.tsx`

#### Responsibilities
1. Standalone transparent window component loaded in Electron's secondary HUD window (`#/hud-overlay`).
2. Operates strictly with `bg-transparent`, zero borders, and pass-through mouse clicks (`setIgnoreMouseEvents(true, { forward: true })`).
3. Enforces CS2 HUD Safe-Zone Exclusions:
   - **Center Crosshair Safe Zone**: `450x450px` centered box is 100% unobstructed.
   - **Top-Left Radar Safe Zone**: `320x320px` clear.
   - **Bottom CS2 Status HUD**: `120px` bottom clear.
   - **Top-Right Killfeed Safe Zone**: `400x200px` clear.
4. Priority Arbitrage Presentation:
   - `CRITICAL`: Synchronized Bomb Timer (`BOMB PLANTED 00:24`) rendered in Top Center (below status bar).
   - `CONTEXTUAL`: Active Lineup alignment cues (only permitted in `PRACTICE_SERVER` or `SIMULATION_PREVIEW`; strictly suppressed in `COMPETITIVE_PROTECTED`).
   - `INFORMATIONAL`: Opponent last-known markers with 30s visual decay fading curve.
   - `PASSIVE`: Match score and economy counters (suppressed during active combat).
5. Safe-Zone Calibration Preview:
   - When enabled via settings, renders semi-transparent amber borders marking exclusion zones to allow user calibration.

---

## 5. React Hooks & State Management Contracts

### 5.1 `useNavigation` Hook
```typescript
export interface UseNavigationReturn {
  activeDestination: PrimaryDestination;
  setActiveDestination: (dest: PrimaryDestination) => void;
  isSecondaryMenuOpen: boolean;
  setIsSecondaryMenuOpen: (open: boolean) => void;
  secondaryMenuTab: SecondaryMenuTab;
  setSecondaryMenuTab: (tab: SecondaryMenuTab) => void;
  utilitySelection: { map?: string; strategyId?: string };
  triggerPracticeRetake: (map: string, strategyId: string) => void;
}
```

### 5.2 `useGeminiConfig` Hook (DPAPI Credential Storage)
```typescript
export interface UseGeminiConfigReturn {
  hasKey: boolean;
  maskedKey: string | null;
  status: 'UNCONFIGURED' | 'CONFIGURED' | 'TESTING' | 'VERIFIED' | 'ERROR';
  testResult: { success: boolean; latencyMs?: number; error?: string } | null;
  saveKey: (key: string) => Promise<boolean>;
  testConnection: (key: string) => Promise<{ success: boolean; latencyMs?: number; error?: string }>;
  removeKey: () => Promise<boolean>;
}
```

### 5.3 `useHudConfig` Hook (Appearance & Environment)
```typescript
export interface HudConfigState {
  environmentMode: 'COMPETITIVE_PROTECTED' | 'PRACTICE_SERVER' | 'SIMULATION_PREVIEW';
  overlayScale: number; // 0.75 - 1.50
  overlayOpacity: number; // 0.20 - 1.00
  safeZonePreview: boolean;
  updateConfig: (patch: Partial<HudConfigState>) => Promise<void>;
  resetDefaults: () => Promise<void>;
}
```

### 5.4 `useComplianceState` Hook (29 Features Inspector)
```typescript
export interface UseComplianceStateReturn {
  rules: readonly IFeatureComplianceRule[];
  currentEnvironment: EnvironmentMode;
  setEnvironment: (env: EnvironmentMode) => void;
  isPermitted: (featureId: string) => boolean;
  getRulesByCategory: (category: ComplianceCategory) => readonly IFeatureComplianceRule[];
}
```

---

## 6. Accessibility, Edge Cases & Error States

| Scenario | Handled Behavior | Visual Presentation |
|:---|:---|:---|
| **No GSI Match Detected** | GSI listener in standby (15s timeout). | Amber badge `STANDBY — AWAITING CS2`. Center banner with `[START SIMULATION]` action. |
| **Simulation Mode Active** | Replaces live GSI with synthetic telemetry scenarios. | Cyan badge `SIMULATION MODE`. Clear exit toggle in navbar. |
| **No Gemini Key Configured** | Asynchronous AI pipeline falls back to deterministic local rule engine. | Tactical advice card displays `[OFFLINE RULE ENGINE]`, fully functional. |
| **Invalid Gemini Key / Offline** | Test connection returns failure; zero plaintext logged. | Rose error message: `API Key verification failed: 403 Forbidden`. |
| **Active Firefight in Competitive** | Capability gating suppresses intrusive cards; safe zone guarantees crosshair is clear. | Center screen clear; only passive peripheral cards remain visible. |
| **One-Click Retake Practice Click** | State transitions from History to Utility Room, filters to `Mirage`, opens Retake strategy. | Instant navigation, auto-expands Mirage A Retake strategy card and linked lineups. |

---

## 7. Verification & Implementation Checklist

- [x] Precision minimalist dark palette strictly adheres to `#09090b`, `#121215`, `#18181c`, `#27272a`, `#a1a1aa`. Zero gamer-RGB clutter.
- [x] Landing screen features **only three primary destinations** (`LIVE MATCH`, `UTILITY ROOM`, `HISTORY`).
- [x] Compact secondary menu includes DPAPI-secured Gemini Key setup, Appearance/HUD config, 29-feature Compliance matrix viewer, and Help/Docs.
- [x] Component tree specifies all 7 target files with complete TypeScript interfaces, props, and layout wireframes.
- [x] Standalone transparent HUD overlay component architecture specified with CS2 safe zone exclusions (`450x450px` crosshair, radar, status HUD).
- [x] Mandatory closed loop practice trigger `[PRACTICE — MIRAGE A RETAKE]` connects History directly into Utility Room.
