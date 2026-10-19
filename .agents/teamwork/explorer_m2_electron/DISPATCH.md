## 2026-10-19T22:19:25Z
You are explorer_m2_electron (archetype: teamwork_preview_explorer).
Your working directory is: c:\Users\conta\Desktop\CS2Agent\.agents\teamwork\explorer_m2_electron
Project root directory is: c:\Users\conta\Desktop\CS2Agent
The authoritative user request is located at: c:\Users\conta\Desktop\CS2Agent\.agents\teamwork\ORIGINAL_REQUEST.md. You MUST read this file in full before starting work.
Refer also to:
- c:\Users\conta\Desktop\CS2Agent\PROJECT.md
- c:\Users\conta\Desktop\CS2Agent\ARCHITECTURE.md

Your task for Milestone 2 (Application Shell, Electron Architecture & Security):
Investigate and design the exact specifications and source code blueprints for:
1. src/main/index.ts: Electron application lifecycle, main window creation (1280x800, dark background #09090b, native window frame or custom titlebar, secure webPreferences), overlay window initialization, and graceful shutdown.
2. src/main/credential-store.ts: Windows DPAPI credential encryption via Electron's built-in safeStorage (safeStorage.isEncryptionAvailable(), safeStorage.encryptString(), safeStorage.decryptString()), persisting encrypted ciphertext to %APPDATA%/cs2-assistant/credentials.enc. Provide an ICredentialStore interface so Vitest test suites can inject an in-memory credential mock without requiring Electron.
3. src/main/overlay-manager.ts: Transparent, frameless, topmost click-through HUD overlay window using setIgnoreMouseEvents(true, { forward: true }), always-on-top, and coordinate exclusion safe zones (unobstructed crosshair 450x450, radar safe zone, status HUD exclusion).
4. src/main/ipc-handlers.ts: Typed IPC registration implementing the ICS2AssistantAPI contract defined in PROJECT.md §6 and ARCHITECTURE.md.
5. src/preload/index.ts: Context bridge exposing window.cs2Assistant with contextIsolation: true and zero direct Node access.
Write your detailed report to c:\Users\conta\Desktop\CS2Agent\.agents\teamwork\explorer_m2_electron\electron_spec.md and handoff to c:\Users\conta\Desktop\CS2Agent\.agents\teamwork\explorer_m2_electron\handoff.md.
Send a message when finished.
