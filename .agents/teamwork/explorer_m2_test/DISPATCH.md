## 2026-10-19T22:19:25Z
You are explorer_m2_test (archetype: teamwork_preview_explorer).
Your working directory is: c:\Users\conta\Desktop\CS2Agent\.agents\teamwork\explorer_m2_test
Project root directory is: c:\Users\conta\Desktop\CS2Agent
The authoritative user request is located at: c:\Users\conta\Desktop\CS2Agent\.agents\teamwork\ORIGINAL_REQUEST.md. You MUST read this file in full before starting work.
Refer also to:
- c:\Users\conta\Desktop\CS2Agent\PROJECT.md
- c:\Users\conta\Desktop\CS2Agent\TEST_INFRA.md

Your task for Milestone 2 (Testing & Verification Strategy):
Design the unit and integration test specifications for Milestone 2:
1. tests/domain10-persistence.test.ts (Domain 10: Persistence):
   - Test ICredentialStore: test saving, retrieving, clearing, and invalidating API keys using an in-memory/mock implementation.
   - Verify zero plaintext leaks, empty string handling, and corrupted storage recovery.
2. tests/m2-application-shell.test.ts:
   - Test the 3 primary navigation destinations: verify that only LIVE MATCH, UTILITY ROOM, and HISTORY exist as primary destinations.
   - Test navigation state switching, keyboard shortcuts (e.g. 1, 2, 3), and secondary menu modal toggles.
   - Test HUD safe-zone geometry: verify that coordinates falling inside the crosshair (450x450 center), radar (top-left 320x320), or killfeed (top-right 400x200) are flagged as obstructed.
3. Build & execution compatibility:
   - Ensure all new tests execute headlessly under vitest run (npm test).
   - Ensure npm run build bundles without type errors.
   - Ensure node --experimental-strip-types tests/e2e/runner.ts continues passing 100%.
Write your report to c:\Users\conta\Desktop\CS2Agent\.agents\teamwork\explorer_m2_test\m2_test_spec.md and handoff to c:\Users\conta\Desktop\CS2Agent\.agents\teamwork\explorer_m2_test\handoff.md.
Send a message when finished.
