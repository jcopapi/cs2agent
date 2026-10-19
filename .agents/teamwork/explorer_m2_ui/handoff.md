# Milestone 2 UI Specification — Handoff Report

## 1. Observation
1. **Existing Design System Tokens**:
   - `c:\Users\conta\Desktop\CS2Agent\tailwind.config.js` (lines 10–46): Contains the color hierarchy:
     - `background.DEFAULT`: `'#09090b'` (Zinc-950 base background)
     - `background.container`: `'#121215'` (Charcoal surface)
     - `background.panel`: `'#18181c'` (Elevated card/panel)
     - `background.elevated`: `'#202026'` (Hover/interactive surface)
     - `border.subtle`: `'#27272a'` (Zinc-800 1px subtle border)
     - `border.elevated`: `'#3f3f46'` (Zinc-700 active border)
     - `tactical.cyan`: `'#06b6d4'`, `emerald`: `'#10b981'`, `amber`: `'#f59e0b'`, `rose`: `'#f43f5e'`
   - `c:\Users\conta\Desktop\CS2Agent\package.json` (lines 20–27): Confirms `react` 18.3.1, `react-dom` 18.3.1, `lucide-react` 1.59.0, `clsx` 2.1.1, and `tailwind-merge` 3.0.0 are installed.

2. **Feature Requirements & Acceptance Tests**:
   - `c:\Users\conta\Desktop\CS2Agent\tests\e2e\tier1-feature-coverage.test.ts`:
     - Lines 108–122 (F6.1): Asserts `primaryBackground: '#09090b'`, `borderSubtle: '#27272a'`, `textMuted: '#a1a1aa'`, and `allowGamerRgb: false`.
     - Lines 124–130 (F7.1): Asserts primary destinations array has length 3 and contains `['LIVE MATCH', 'UTILITY ROOM', 'HISTORY']`.
     - Lines 132–144 (F8.1): Asserts secondary menu panels contain `['SETTINGS', 'GEMINI_API_KEY', 'HUD_CONFIGURATION', 'COMPLIANCE_MATRIX', 'HELP']`.
     - Lines 176–190 (F10.1): Asserts HUD Overlay window has `transparent: true`, `ignoreMouseEvents: true`, and `crosshairSafeZone: { width: 450, height: 450, clear: true }`.
     - Lines 568–581 (F30.1): Asserts closed loop practice retake trigger navigates from `HISTORY` to `UTILITY ROOM` setting filter `de_mirage:strat-mirage-a-retake`.

3. **Regulatory Classification & Capabilities**:
   - `c:\Users\conta\Desktop\CS2Agent\COMPLIANCE.md` (lines 118–149) and `src/core/compliance/compliance-matrix.ts` (lines 48–381): Document all 29 features grouped into 7 categories (2 Telemetry, 4 Lineup/Strategy, 4 Bomb/Memory, 2 Analytics/History, 2 AI Coach, 6 Overlay/HUD, 9 Prohibited).
   - Invariant: Zero memory reading, zero DLL injection, zero input automation, zero process concealment, zero unauthorized hooks, zero unauthorized scraping.

4. **IPC Contract Specifications**:
   - `c:\Users\conta\Desktop\CS2Agent\PROJECT.md` (lines 182–207) and `c:\Users\conta\Desktop\CS2Agent\ARCHITECTURE.md` (lines 239–308): Specify `ICS2AssistantAPI` methods (`testApiConnection`, `saveApiKey`, `getApiKey`, `removeApiKey`, `getEnvironmentMode`, `setEnvironmentMode`, `onGsiUpdate`, `onTacticalRecommendation`, `onBombTimerUpdate`, `onLineupStateChange`).

---

## 2. Logic Chain
1. **Design System Consistency**:
   - Because `tailwind.config.js` and `F6.1` specify `#09090b`, `#121215`, `#18181c`, `#27272a`, and `#a1a1aa` with `allowGamerRgb: false`, the UI specification mandates these exact tokens and avoids all glowing neon gradients or distracting decorative elements.

2. **Navigation Invariant (Exactly Three Primary Destinations)**:
   - `ORIGINAL_REQUEST.md` (§R2) and `F7.1` strictly constrain the landing screen to **only three primary navigation destinations** (`LIVE MATCH`, `UTILITY ROOM`, `HISTORY`). Therefore, settings, API key management, HUD configuration, compliance matrix, and help cannot be top-level navbar tabs; they must reside inside the slide-out Secondary Menu drawer.

3. **Secondary Menu Architecture**:
   - To fulfill §R2 and `F8.1`, the secondary drawer provides four clean sections:
     - Gemini API Key configuration using Electron safeStorage / DPAPI with a test connection action (`testApiConnection`), remove key action, status indicator, and zero plaintext logging guarantee.
     - Appearance & HUD Configuration with environment mode selector (`COMPETITIVE_PROTECTED`, `PRACTICE_SERVER`, `SIMULATION_PREVIEW`), scale slider (0.75x–1.5x), opacity slider (20%–100%), and safe-zone preview toggle.
     - Compliance & Capability Matrix viewer presenting live read-only status for all 29 features.
     - Help & Documentation with keybindings, GSI configuration setup, and canonical Valve primary sources.

4. **Closed Loop Workflow Integration**:
   - Per §R5 and `F30.1`, clicking `[PRACTICE — MIRAGE A RETAKE]` in the History view must directly transition the UI to `UTILITY ROOM`, pre-selecting `de_mirage` and expanding `strat-mirage-a-retake`. The UI state machine in `App.tsx` and `useNavigation` coordinates this transition via `handleTriggerPracticeRetake`.

5. **Dual-Window Electron Architecture**:
   - The HUD overlay requires a borderless, transparent, click-through window. By designing `App.tsx` to detect `window.location.hash === '#/hud-overlay'`, the same React bundle cleanly renders either the full desktop dashboard (in the main 1440x900 window) or the transparent `HudOverlayView` (in the secondary overlay window).

---

## 3. Caveats
1. **Browser vs Electron Runtime Environment**:
   - In browser development or Vitest DOM tests where `window.cs2Assistant` is undefined, components must utilize defensive fallbacks or mock providers so rendering and unit tests do not crash.
2. **Overlay Mouse Event Pass-Through**:
   - The overlay window uses `setIgnoreMouseEvents(true, { forward: true })` in production. For interactive HUD calibration, the user toggles calibration mode which switches `setIgnoreMouseEvents(false)` via IPC.
3. **No Code Implementation in Investigation Turn**:
   - As an explorer agent, this report provides technical designs, TypeScript interfaces, and layout wireframes in `.agents/teamwork/explorer_m2_ui/ui_spec.md`. Direct code implementation into `src/renderer/` is deferred to the implementer/worker agent.

---

## 4. Conclusion
The UI architecture for Milestone 2 is completely investigated and designed in `ui_spec.md`:
1. **Precision Minimalist Dark Design System**: Full specification using `#09090b` canvas, `#121215` containers, `#18181c` panels, `#27272a` borders, `#a1a1aa` muted typography, tactical functional accents (Cyan, Emerald, Amber, Rose), and keyboard shortcuts.
2. **Three Primary Destinations**: Complete wireframes, state models, and props for `LIVE MATCH` (radar, tactical feed with Palace invariance, bomb timer, lineup FSM), `UTILITY ROOM` (6 Active Duty maps, playbook preview, preparation profiles), and `HISTORY` (measured facts vs AI inferences, `[PRACTICE — MIRAGE A RETAKE]` closed loop).
3. **Compact Secondary Menu**: Slide-out drawer covering DPAPI Gemini key config with `testApiConnection`, HUD controls, 29-feature compliance matrix viewer, and Help/GSI docs.
4. **Transparent HUD Overlay**: Dedicated `HudOverlayView` with CS2 HUD safe zone enforcement (450x450px crosshair exclusion, 320x320px radar, 120px bottom HUD, 400x200px killfeed).
5. **Component Layout**: Detailed specifications for all 7 required files:
   - `src/renderer/App.tsx`
   - `src/renderer/components/navigation/Navbar.tsx`
   - `src/renderer/components/navigation/SecondaryMenu.tsx`
   - `src/renderer/components/destinations/LiveMatchView.tsx`
   - `src/renderer/components/destinations/UtilityRoomView.tsx`
   - `src/renderer/components/destinations/HistoryView.tsx`
   - `src/renderer/components/hud-overlay/HudOverlayView.tsx`

---

## 5. Verification Method
1. **Specification File Inspection**:
   - Inspect `c:\Users\conta\Desktop\CS2Agent\.agents\teamwork\explorer_m2_ui\ui_spec.md` to confirm all 7 components, props interfaces, state hooks, and Tailwind classes are defined.
2. **Automated Test Alignment**:
   - Run Vitest suite:
     ```powershell
     npm test
     ```
   - Verify `tests/e2e/tier1-feature-coverage.test.ts` assertions for F6.1, F7.1, F8.1, F9.1, F10.1, and F30.1.
3. **Build Check**:
   - Run:
     ```powershell
     npm run build:renderer
     ```
   - Ensure Vite bundling succeeds with zero syntax or configuration errors.
