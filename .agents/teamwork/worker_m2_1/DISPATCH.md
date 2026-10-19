## 2026-10-19T22:28:30Z
You are worker_m2_1 (archetype: teamwork_preview_worker).
Your working directory is: c:\Users\conta\Desktop\CS2Agent\.agents\teamwork\worker_m2_1
Project root directory is: c:\Users\conta\Desktop\CS2Agent

The authoritative user request is located at: c:\Users\conta\Desktop\CS2Agent\.agents\teamwork\ORIGINAL_REQUEST.md. You MUST read this file in full before starting work.
Refer also to:
- c:\Users\conta\Desktop\CS2Agent\PROJECT.md
- c:\Users\conta\Desktop\CS2Agent\ARCHITECTURE.md
- c:\Users\conta\Desktop\CS2Agent\.agents\teamwork\explorer_m2_electron\electron_spec.md
- c:\Users\conta\Desktop\CS2Agent\.agents\teamwork\explorer_m2_ui\ui_spec.md
- c:\Users\conta\Desktop\CS2Agent\.agents\teamwork\explorer_m2_test\m2_test_spec.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your write ownership:
You have EXCLUSIVE write ownership of:
1. Shared & Core HUD Manager: `src/shared/ipc-types.ts`, `src/core/hud-manager/types.ts`, `src/core/hud-manager/safe-zone-evaluator.ts`, `src/core/hud-manager/index.ts`
2. Electron Main: `src/main/index.ts`, `src/main/credential-store.ts`, `src/main/overlay-manager.ts`, `src/main/ipc-handlers.ts`
3. Preload: `src/preload/index.ts`
4. Renderer UI & Design System:
   - `src/renderer/App.tsx`
   - `src/renderer/components/navigation/Navbar.tsx`
   - `src/renderer/components/navigation/SecondaryMenu.tsx`
   - `src/renderer/components/destinations/LiveMatchView.tsx`
   - `src/renderer/components/destinations/UtilityRoomView.tsx`
   - `src/renderer/components/destinations/HistoryView.tsx`
   - `src/renderer/components/hud-overlay/HudOverlayView.tsx`
5. Test suites: `tests/domain10-persistence.test.ts`, `tests/m2-application-shell.test.ts`

Your task:
Implement Milestone 2 (Application Shell, Precision Minimalist Dark Design System, Three Primary Destinations, and DPAPI Credential Store):
1. Implement `src/shared/ipc-types.ts` and `src/core/hud-manager/` per `electron_spec.md` and `m2_test_spec.md`.
2. Implement Electron main process files (`index.ts`, `credential-store.ts`, `overlay-manager.ts`, `ipc-handlers.ts`) per `electron_spec.md`. Ensure `ICredentialStore` supports DPAPI via Electron `safeStorage` in production and `InMemoryCredentialStore` for headless test runs.
3. Implement `src/preload/index.ts` per `electron_spec.md` (`contextBridge.exposeInMainWorld('cs2Assistant', api)`).
4. Implement the React 18+ Vite minimalist dark design system UI per `ui_spec.md`:
   - Charcoal/zinc-950 `#09090b` aesthetic with 1px subtle borders `#27272a`.
   - Exactly three primary navigation destinations: `LIVE MATCH`, `UTILITY ROOM`, and `HISTORY`.
   - Compact secondary menu for Gemini API Key (DPAPI secured, test connection, key removal), Appearance/HUD config, Compliance matrix, and Help.
   - History to Utility Room closed loop (`[PRACTICE — MIRAGE A RETAKE]`).
   - Standalone transparent click-through HUD overlay component with safe zones.
5. Implement `tests/domain10-persistence.test.ts` and `tests/m2-application-shell.test.ts` per `m2_test_spec.md`.
6. Run verification commands:
   - `$env:PATH = ($env:PATH -replace 'dotnet"', 'dotnet'); npm test` (verify all unit and integration test suites pass).
   - `$env:PATH = ($env:PATH -replace 'dotnet"', 'dotnet'); npm run build` (verify clean production compilation).
   - `$env:PATH = ($env:PATH -replace 'dotnet"', 'dotnet'); npm run lint` (verify 0 TypeScript errors).
   - `$env:PATH = ($env:PATH -replace 'dotnet"', 'dotnet'); node --experimental-strip-types tests/e2e/runner.ts` (verify 58/58 E2E tests pass and git status is clean).
7. Commit changes with conventional commit: `git commit -m "feat(m2): implement application shell, minimalist dark design system, 3 destinations, and DPAPI credential store"`.
8. Push commit to remote: `git push origin main`.
9. Write handoff report to `c:\Users\conta\Desktop\CS2Agent\.agents\teamwork\worker_m2_1\handoff.md`.
10. Send a message to the orchestrator when finished.
