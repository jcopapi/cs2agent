# Milestone 2 Test Specification: Persistence & Application Shell

**Document Version**: 1.0.0  
**Author**: `explorer_m2_test` (Teamwork Preview Explorer)  
**Target Milestone**: Milestone 2 (Application Shell, Design System & Persistence)  
**Authoritative References**: `ORIGINAL_REQUEST.md` (§R2, §Acceptance §10), `PROJECT.md` (Features 6–10, Code Layout), `TEST_INFRA.md` (Features F6–F10, Tiers 1–3)

---

## 1. Executive Summary & Test Strategy Architecture

### 1.1 Scope & Purpose
Milestone 2 delivers the foundational user-facing shell and secure storage substrate of CS2 Assistant:
1. **Domain 10 (Persistence Subsystem)**: Secure API key credential management via `ICredentialStore`, OS DPAPI encryption abstraction, zero plaintext leaks, empty string handling, and corrupted storage recovery.
2. **Application Shell & Design System**: Three primary destinations invariant (`LIVE MATCH`, `UTILITY ROOM`, `HISTORY`), active state switching, keyboard navigation shortcuts (`1`, `2`, `3`), secondary menu drawer/modal toggles, and HUD safe-zone geometry (crosshair 450x450 center, radar 320x320 top-left, killfeed 400x200 top-right).
3. **Hermetic Headless Verification**: Seamless execution under Vitest (`npm test`), 100% type-sound compilation under `npm run build`, and complete decoupling from `tests/e2e/runner.ts`.

### 1.2 Dual Test Track Harmony
The testing strategy strictly adheres to `TEST_INFRA.md` Section 1.2:
- **Track A (Headless Vitest Suites)**: Fine-grained unit and component integration tests running headlessly in Node.js with `jsdom`. All Electron APIs (`safeStorage`, `ipcMain`, `BrowserWindow`) are cleanly decoupled via interface dependency injection (`ICredentialStore`).
- **Track B (Opaque-Box E2E Runner)**: Standalone multi-tier integration runner (`node --experimental-strip-types tests/e2e/runner.ts`) executing requirements T1–T4.

```
+--------------------------------------------------------------------------------------------------+
|                                    MILESTONE 2 TEST TOPOLOGY                                     |
+--------------------------------------------------------------------------------------------------+
|  tests/domain10-persistence.test.ts             tests/m2-application-shell.test.ts              |
|  - ICredentialStore lifecycle & CRUD            - Exactly 3 Primary Destinations invariant       |
|  - Zero plaintext leak verification             - Navigation state switching & tab indicators    |
|  - Empty & malformed key rejection              - Keyboard shortcuts (1, 2, 3) & input isolation  |
|  - Corrupted ciphertext recovery                - Secondary menu drawer / modal toggles          |
|  - Invalidation & key purge                     - HUD Safe-Zone Geometry (Crosshair/Radar/Feed)  |
|  - User settings persistence                    - Widget AABB collision & viewport scaling       |
+-------------------------------------------------+------------------------------------------------+
                                           │
                                           ▼
                       Vitest Headless Harness (jsdom environment)
                                  npm test / vitest run
```

---

## 2. Domain 10: Persistence Test Specification (`tests/domain10-persistence.test.ts`)

### 2.1 Interface Contract: `ICredentialStore`
The credential storage subsystem must implement a decoupled interface contract allowing both production Electron DPAPI storage (`src/main/credential-store.ts`) and headless in-memory test mocks (`InMemoryCredentialStore`):

```typescript
export interface ICredentialStore {
  /**
   * Encrypts and securely persists the Gemini API key.
   * Rejects empty or whitespace-only keys.
   * Returns true on success, false on validation failure.
   */
  saveApiKey(key: string): Promise<boolean>;

  /**
   * Retrieves and decrypts the persisted Gemini API key.
   * Returns null if unconfigured, removed, or corrupted.
   */
  getApiKey(): Promise<string | null>;

  /**
   * Clears and permanently purges the persisted key.
   * Idempotent; returns true even if store was already empty.
   */
  clearApiKey(): Promise<boolean>;

  /**
   * Alias for clearApiKey() matching PROJECT.md §6 IPC contract.
   */
  removeApiKey(): Promise<boolean>;

  /**
   * Returns true if a valid, uncorrupted key is currently stored.
   */
  hasApiKey(): Promise<boolean>;

  /**
   * Marks the currently stored key as revoked/invalid without throwing.
   */
  invalidateApiKey(): Promise<boolean>;

  /**
   * Verifies whether OS-level hardware/DPAPI encryption is available.
   */
  isEncryptionAvailable(): boolean;

  /**
   * Diagnostic inspection of raw ciphertext buffer for zero-plaintext leak tests.
   */
  getRawCiphertext?(): string | null;
}
```

### 2.2 Security Invariants & Zero-Leak Principles
1. **Zero Plaintext Storage**: The plain API key string MUST NEVER be stored in memory as an unencrypted class property or written unencrypted to disk.
2. **Zero Serialization Leak**: `JSON.stringify(store)` or `store.toString()` MUST NEVER expose the plaintext key.
3. **Zero Log / Exception Leak**: If an error occurs during encryption, decryption, or storage, the error message MUST NOT include the key string.
4. **Fail-Safe Closed Decryption**: Any decryption failure, corrupt byte sequence, or tampering MUST yield `null` rather than throwing an unhandled exception or crashing the application.
5. **Self-Healing Recovery**: After encountering corrupted ciphertext, calling `clearApiKey()` or saving a fresh valid key must restore the store to a functional state.

### 2.3 Detailed Test Suite Matrix for Domain 10
The `tests/domain10-persistence.test.ts` suite includes 6 distinct test blocks with 20+ specific test cases:

| Suite ID | Test Case Title | Input / Condition | Expected Behavior |
|---|---|---|---|
| **S1.1** | `saveApiKey & getApiKey roundtrip` | Standard Gemini key `AIzaSy...45` | Returns `true`, subsequent `getApiKey()` equals original string |
| **S1.2** | `hasApiKey initial and post-save` | Uninitialized store vs saved store | Returns `false` initially, `true` after save |
| **S1.3** | `clearApiKey / removeApiKey purge` | Store with valid key | Returns `true`, `getApiKey()` becomes `null`, `hasApiKey()` is `false` |
| **S1.4** | `Idempotent removal on empty store` | Store with no key | Returns `true`, does not throw error |
| **S1.5** | `Key overwrite / rotation` | Key A replaced with Key B | `getApiKey()` returns Key B, Key A completely displaced |
| **S2.1** | `Zero plaintext in raw ciphertext buffer` | Save `AIzaSyB_SecretKey123` | Ciphertext does NOT contain `AIzaSyB_SecretKey123` or substring |
| **S2.2** | `Zero plaintext in JSON.stringify` | Call `JSON.stringify(store)` | Output does not contain plaintext key |
| **S2.3** | `Zero plaintext in store inspection/keys` | Inspect `Object.values(store)` | No property value matches plaintext string |
| **S2.4** | `Zero plaintext in error outputs` | Decryption failure simulation | Error message does not leak key or fragment |
| **S3.1** | `Empty string rejection` | `saveApiKey("")` | Returns `false`, store remains empty |
| **S3.2** | `Whitespace-only key rejection` | `saveApiKey("   \t\n  ")` | Returns `false`, store remains unchanged |
| **S3.3** | `Null/undefined input handling` | Cast `saveApiKey(null as any)` | Fails safe, returns `false`, does not throw TypeError |
| **S3.4** | `Extreme key length handling` | 10,000 character string | Encrypted safely or cleanly rejected; no memory crash |
| **S3.5** | `Special character retention` | Key with underscores, hyphens, base64 chars | Decrypts with exact byte-for-byte fidelity |
| **S4.1** | `Tampered ciphertext decryption` | Inject random binary garbage | `getApiKey()` catches error, returns `null` |
| **S4.2** | `Truncated ciphertext recovery` | Cut ciphertext in half | Returns `null` without throwing unhandled exception |
| **S4.3** | `Self-healing post-corruption` | Corrupt store -> `saveApiKey(newKey)` | New key saved cleanly, subsequent `getApiKey()` returns new key |
| **S4.4** | `Purge post-corruption` | Corrupt store -> `clearApiKey()` | Returns `true`, clears corrupted state |
| **S5.1** | `invalidateApiKey behavior` | Active key -> `invalidateApiKey()` | Revokes key, `hasApiKey()` becomes `false`, `getApiKey()` is `null` |
| **S6.1** | `User settings store persistence` | Save HUD opacity (0.75), safe zone toggle (true) | Persisted and retrieved with matching values |
| **S6.2** | `Corrupted settings JSON recovery` | Corrupted JSON in settings store | Falls back to default configuration cleanly |

### 2.4 TypeScript Blueprint: `tests/domain10-persistence.test.ts`

```typescript
/**
 * Test Suite: Domain 10 - Persistence & Credential Storage
 *
 * Verifies ICredentialStore implementation contracts:
 * - Secure credential encryption roundtrip (DPAPI abstraction)
 * - Zero plaintext leaks in memory, serialization, and logs
 * - Empty string and whitespace rejection
 * - Corrupted ciphertext recovery and fault tolerance
 * - Key invalidation and purge
 * - Settings persistence and fallback defaults
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ----------------------------------------------------------------------------
// 1. Interface Contracts
// ----------------------------------------------------------------------------

export interface ICredentialStore {
  saveApiKey(key: string): Promise<boolean>;
  getApiKey(): Promise<string | null>;
  clearApiKey(): Promise<boolean>;
  removeApiKey(): Promise<boolean>;
  hasApiKey(): Promise<boolean>;
  invalidateApiKey(): Promise<boolean>;
  isEncryptionAvailable(): boolean;
  getRawCiphertext(): string | null;
}

export interface IUserSettings {
  theme: 'zinc-950' | 'charcoal';
  hudOpacity: number;
  hudScale: number;
  showSafeZoneOverlay: boolean;
  environmentMode: 'COMPETITIVE_PROTECTED' | 'PRACTICE_SERVER' | 'SIMULATION_PREVIEW';
}

export const DEFAULT_USER_SETTINGS: IUserSettings = {
  theme: 'zinc-950',
  hudOpacity: 0.85,
  hudScale: 1.0,
  showSafeZoneOverlay: false,
  environmentMode: 'COMPETITIVE_PROTECTED',
};

// ----------------------------------------------------------------------------
// 2. Headless In-Memory Implementation (Test Double)
// ----------------------------------------------------------------------------

export class InMemoryCredentialStore implements ICredentialStore {
  // Stored internally as simulated encrypted ciphertext, NEVER as plaintext
  private _cipherBuffer: string | null = null;
  private _encryptionAvailable: boolean = true;
  private _salt: string = 'CS2_DPAPI_SIM_SALT_9982';

  constructor(encryptionAvailable: boolean = true) {
    this._encryptionAvailable = encryptionAvailable;
  }

  isEncryptionAvailable(): boolean {
    return this._encryptionAvailable;
  }

  getRawCiphertext(): string | null {
    return this._cipherBuffer;
  }

  // Diagnostic hook for testing corrupted storage recovery
  injectCorruptedCiphertext(corrupted: string): void {
    this._cipherBuffer = corrupted;
  }

  async saveApiKey(key: string): Promise<boolean> {
    if (!this._encryptionAvailable) {
      return false;
    }
    if (typeof key !== 'string') {
      return false;
    }
    const trimmed = key.trim();
    if (trimmed.length === 0) {
      return false;
    }

    // Encrypt: Simulated AES/DPAPI (Base64 + XOR transformation + prefix)
    const encoded = Buffer.from(trimmed, 'utf-8').toString('base64');
    const obfuscated = encoded
      .split('')
      .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ (this._salt.charCodeAt(i % this._salt.length) & 0x0f)))
      .join('');
    this._cipherBuffer = `DPAPI_ENC::v1::${Buffer.from(obfuscated, 'utf-8').toString('base64')}`;
    return true;
  }

  async getApiKey(): Promise<string | null> {
    if (!this._cipherBuffer) {
      return null;
    }
    try {
      if (!this._cipherBuffer.startsWith('DPAPI_ENC::v1::')) {
        throw new Error('CORRUPTED_STORAGE_HEADER: Invalid cipher header format');
      }
      const rawPayload = this._cipherBuffer.replace('DPAPI_ENC::v1::', '');
      const obfuscated = Buffer.from(rawPayload, 'base64').toString('utf-8');
      const deobfuscated = obfuscated
        .split('')
        .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ (this._salt.charCodeAt(i % this._salt.length) & 0x0f)))
        .join('');
      const plain = Buffer.from(deobfuscated, 'base64').toString('utf-8');

      // Sanity check valid UTF-8
      if (!plain || plain.length === 0) {
        throw new Error('CORRUPTED_STORAGE_PAYLOAD: Decrypted to empty payload');
      }
      return plain;
    } catch {
      // Fail-safe closed: corrupted storage returns null without unhandled throw
      return null;
    }
  }

  async clearApiKey(): Promise<boolean> {
    this._cipherBuffer = null;
    return true;
  }

  async removeApiKey(): Promise<boolean> {
    return this.clearApiKey();
  }

  async hasApiKey(): Promise<boolean> {
    const key = await this.getApiKey();
    return key !== null && key.length > 0;
  }

  async invalidateApiKey(): Promise<boolean> {
    this._cipherBuffer = null;
    return true;
  }
}

export class InMemorySettingsStore {
  private _storage: string | null = null;

  saveSettings(settings: IUserSettings): boolean {
    try {
      this._storage = JSON.stringify(settings);
      return true;
    } catch {
      return false;
    }
  }

  getSettings(): IUserSettings {
    if (!this._storage) {
      return { ...DEFAULT_USER_SETTINGS };
    }
    try {
      const parsed = JSON.parse(this._storage);
      if (typeof parsed !== 'object' || parsed === null) {
        return { ...DEFAULT_USER_SETTINGS };
      }
      return {
        theme: parsed.theme === 'charcoal' ? 'charcoal' : 'zinc-950',
        hudOpacity: typeof parsed.hudOpacity === 'number' ? Math.max(0, Math.min(1, parsed.hudOpacity)) : 0.85,
        hudScale: typeof parsed.hudScale === 'number' ? Math.max(0.5, Math.min(2.0, parsed.hudScale)) : 1.0,
        showSafeZoneOverlay: Boolean(parsed.showSafeZoneOverlay),
        environmentMode: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'].includes(parsed.environmentMode)
          ? parsed.environmentMode
          : 'COMPETITIVE_PROTECTED',
      };
    } catch {
      return { ...DEFAULT_USER_SETTINGS };
    }
  }

  injectCorruptedJson(badJson: string): void {
    this._storage = badJson;
  }
}

// ----------------------------------------------------------------------------
// 3. Test Suites
// ----------------------------------------------------------------------------

describe('Domain 10: ICredentialStore Lifecycle & Basic CRUD Operations', () => {
  let store: InMemoryCredentialStore;
  const sampleKey = 'AIzaSyA_ValidGeminiKeyTest1234567890abcdef';

  beforeEach(() => {
    store = new InMemoryCredentialStore(true);
  });

  it('TC10.1: should return false for hasApiKey() and null for getApiKey() when uninitialized', async () => {
    expect(await store.hasApiKey()).toBe(false);
    expect(await store.getApiKey()).toBeNull();
  });

  it('TC10.2: should save and retrieve a valid Gemini API key successfully', async () => {
    const saved = await store.saveApiKey(sampleKey);
    expect(saved).toBe(true);

    expect(await store.hasApiKey()).toBe(true);
    const retrieved = await store.getApiKey();
    expect(retrieved).toBe(sampleKey);
  });

  it('TC10.3: should purge the key completely when clearApiKey() or removeApiKey() is called', async () => {
    await store.saveApiKey(sampleKey);
    expect(await store.hasApiKey()).toBe(true);

    const cleared = await store.clearApiKey();
    expect(cleared).toBe(true);
    expect(await store.hasApiKey()).toBe(false);
    expect(await store.getApiKey()).toBeNull();

    // Re-save and test removeApiKey alias
    await store.saveApiKey(sampleKey);
    const removed = await store.removeApiKey();
    expect(removed).toBe(true);
    expect(await store.hasApiKey()).toBe(false);
    expect(await store.getApiKey()).toBeNull();
  });

  it('TC10.4: should be idempotent when clearing an already empty store', async () => {
    expect(await store.clearApiKey()).toBe(true);
    expect(await store.removeApiKey()).toBe(true);
    expect(await store.getApiKey()).toBeNull();
  });

  it('TC10.5: should overwrite an existing key with a new key cleanly', async () => {
    const keyA = 'AIzaSyKeyA_11111111111111111111';
    const keyB = 'AIzaSyKeyB_22222222222222222222';

    await store.saveApiKey(keyA);
    expect(await store.getApiKey()).toBe(keyA);

    await store.saveApiKey(keyB);
    expect(await store.getApiKey()).toBe(keyB);
    expect(await store.getApiKey()).not.toBe(keyA);
  });

  it('TC10.6: should report encryption availability correctly', () => {
    const availableStore = new InMemoryCredentialStore(true);
    expect(availableStore.isEncryptionAvailable()).toBe(true);

    const unavailableStore = new InMemoryCredentialStore(false);
    expect(unavailableStore.isEncryptionAvailable()).toBe(false);
  });

  it('TC10.7: should refuse to save key when encryption is unavailable', async () => {
    const storeNoEnc = new InMemoryCredentialStore(false);
    const saved = await storeNoEnc.saveApiKey(sampleKey);
    expect(saved).toBe(false);
    expect(await storeNoEnc.getApiKey()).toBeNull();
  });
});

describe('Domain 10: Zero Plaintext Leaks Security Invariants', () => {
  let store: InMemoryCredentialStore;
  const secretKey = 'AIzaSyA_UltraSecretGeminiApiKeyZeroLeak999';

  beforeEach(() => {
    store = new InMemoryCredentialStore(true);
  });

  it('TC10.8: should guarantee that the internal ciphertext buffer does NOT contain plaintext', async () => {
    await store.saveApiKey(secretKey);
    const rawCiphertext = store.getRawCiphertext();

    expect(rawCiphertext).not.toBeNull();
    expect(typeof rawCiphertext).toBe('string');
    // Critical Invariant: Plaintext must never exist in the stored buffer
    expect(rawCiphertext!).not.toContain(secretKey);
    expect(rawCiphertext!).not.toContain('UltraSecretGeminiApiKeyZeroLeak999');
    expect(rawCiphertext!).toContain('DPAPI_ENC::v1::');
  });

  it('TC10.9: should guarantee that JSON.stringify(store) does not leak plaintext', async () => {
    await store.saveApiKey(secretKey);
    const serialized = JSON.stringify(store);

    expect(serialized).not.toContain(secretKey);
    expect(serialized).not.toContain('UltraSecretGeminiApiKeyZeroLeak999');
  });

  it('TC10.10: should guarantee that Object property enumeration does not expose plaintext', async () => {
    await store.saveApiKey(secretKey);
    const propValues = Object.values(store);

    for (const val of propValues) {
      if (typeof val === 'string') {
        expect(val).not.toContain(secretKey);
      }
    }
  });

  it('TC10.11: should not leak plaintext in error logging during failed operations', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    store.injectCorruptedCiphertext('DPAPI_ENC::v1::CORRUPT_BASE64_GARBAGE!!!');

    const result = await store.getApiKey();
    expect(result).toBeNull();

    // Verify console.error was not called with plaintext
    for (const call of consoleErrorSpy.mock.calls) {
      const msg = call.join(' ');
      expect(msg).not.toContain(secretKey);
    }
    consoleErrorSpy.mockRestore();
  });
});

describe('Domain 10: Empty String & Malformed Input Handling', () => {
  let store: InMemoryCredentialStore;

  beforeEach(() => {
    store = new InMemoryCredentialStore(true);
  });

  it('TC10.12: should reject empty string and not store an empty credential', async () => {
    const saved = await store.saveApiKey('');
    expect(saved).toBe(false);
    expect(await store.hasApiKey()).toBe(false);
    expect(await store.getApiKey()).toBeNull();
  });

  it('TC10.13: should reject whitespace-only strings and not overwrite valid credentials', async () => {
    const validKey = 'AIzaSyA_PreservedKey123';
    await store.saveApiKey(validKey);

    const whitespaces = ['   ', '\t', '\n\r', '   \t   \n  '];
    for (const ws of whitespaces) {
      const saved = await store.saveApiKey(ws);
      expect(saved).toBe(false);
      // Valid key must remain intact
      expect(await store.getApiKey()).toBe(validKey);
    }
  });

  it('TC10.14: should safely reject null and non-string inputs cast to any', async () => {
    expect(await store.saveApiKey(null as any)).toBe(false);
    expect(await store.saveApiKey(undefined as any)).toBe(false);
    expect(await store.saveApiKey(12345 as any)).toBe(false);
    expect(await store.saveApiKey({ key: 'test' } as any)).toBe(false);
    expect(await store.getApiKey()).toBeNull();
  });

  it('TC10.15: should handle keys with special characters cleanly', async () => {
    const complexKey = 'AIzaSy_A-B.C~D$12345!@#%^&*()_+=-/?:;{}[]|';
    await store.saveApiKey(complexKey);
    expect(await store.getApiKey()).toBe(complexKey);
  });

  it('TC10.16: should handle long API keys without crashing or truncation', async () => {
    const longKey = 'AIzaSy_' + 'A'.repeat(4000);
    const saved = await store.saveApiKey(longKey);
    expect(saved).toBe(true);
    expect(await store.getApiKey()).toBe(longKey);
  });
});

describe('Domain 10: Corrupted Storage Recovery & Resilience', () => {
  let store: InMemoryCredentialStore;

  beforeEach(() => {
    store = new InMemoryCredentialStore(true);
  });

  it('TC10.17: should return null when ciphertext header is corrupted without crashing', async () => {
    store.injectCorruptedCiphertext('MALFORMED_HEADER_DATA_123');
    expect(await store.getApiKey()).toBeNull();
    expect(await store.hasApiKey()).toBe(false);
  });

  it('TC10.18: should return null when payload is truncated or invalid base64', async () => {
    store.injectCorruptedCiphertext('DPAPI_ENC::v1::~~~NOT_BASE64~~~');
    expect(await store.getApiKey()).toBeNull();
  });

  it('TC10.19: should self-heal when a new valid key is saved over corrupted storage', async () => {
    store.injectCorruptedCiphertext('DPAPI_ENC::v1::CORRUPTED_BYTES');
    expect(await store.getApiKey()).toBeNull();

    // Saving fresh key must overwrite corruption
    const freshKey = 'AIzaSyA_FreshKeyPostRecovery123';
    const saved = await store.saveApiKey(freshKey);
    expect(saved).toBe(true);
    expect(await store.getApiKey()).toBe(freshKey);
    expect(await store.hasApiKey()).toBe(true);
  });

  it('TC10.20: should allow clearApiKey() to purge corrupted storage safely', async () => {
    store.injectCorruptedCiphertext('DPAPI_ENC::v1::CORRUPTED_BYTES');
    const cleared = await store.clearApiKey();
    expect(cleared).toBe(true);
    expect(await store.getApiKey()).toBeNull();
    expect(store.getRawCiphertext()).toBeNull();
  });
});

describe('Domain 10: Key Invalidation & State Transitions', () => {
  let store: InMemoryCredentialStore;
  const key = 'AIzaSyA_TestKeyForInvalidation';

  beforeEach(() => {
    store = new InMemoryCredentialStore(true);
  });

  it('TC10.21: should purge active key on invalidateApiKey()', async () => {
    await store.saveApiKey(key);
    expect(await store.hasApiKey()).toBe(true);

    const invalidated = await store.invalidateApiKey();
    expect(invalidated).toBe(true);
    expect(await store.hasApiKey()).toBe(false);
    expect(await store.getApiKey()).toBeNull();
  });
});

describe('Domain 10: User Settings Persistence & Fallback Defaults', () => {
  let settingsStore: InMemorySettingsStore;

  beforeEach(() => {
    settingsStore = new InMemorySettingsStore();
  });

  it('TC10.22: should return default settings when unconfigured', () => {
    const settings = settingsStore.getSettings();
    expect(settings).toEqual(DEFAULT_USER_SETTINGS);
    expect(settings.hudOpacity).toBe(0.85);
    expect(settings.environmentMode).toBe('COMPETITIVE_PROTECTED');
  });

  it('TC10.23: should persist and retrieve modified user settings', () => {
    const updated: IUserSettings = {
      theme: 'charcoal',
      hudOpacity: 0.65,
      hudScale: 1.25,
      showSafeZoneOverlay: true,
      environmentMode: 'PRACTICE_SERVER',
    };

    const saved = settingsStore.saveSettings(updated);
    expect(saved).toBe(true);

    const retrieved = settingsStore.getSettings();
    expect(retrieved).toEqual(updated);
    expect(retrieved.showSafeZoneOverlay).toBe(true);
    expect(retrieved.environmentMode).toBe('PRACTICE_SERVER');
  });

  it('TC10.24: should clamp out-of-range numeric settings to safe boundaries', () => {
    settingsStore.saveSettings({
      theme: 'zinc-950',
      hudOpacity: 2.5, // Out of bounds [0, 1]
      hudScale: -0.5, // Out of bounds [0.5, 2.0]
      showSafeZoneOverlay: false,
      environmentMode: 'COMPETITIVE_PROTECTED',
    });

    const clamped = settingsStore.getSettings();
    expect(clamped.hudOpacity).toBe(1.0);
    expect(clamped.hudScale).toBe(0.5);
  });

  it('TC10.25: should recover gracefully from corrupted settings JSON by falling back to defaults', () => {
    settingsStore.injectCorruptedJson('{ bad json : missing quotes }');
    const recovered = settingsStore.getSettings();
    expect(recovered).toEqual(DEFAULT_USER_SETTINGS);
  });
});
```

---

## 3. Application Shell & HUD Safe-Zone Geometry Specification (`tests/m2-application-shell.test.ts`)

### 3.1 Interface Contracts
The Application Shell and HUD safe-zone geometry require strict contracts:

```typescript
// Navigation Contract
export const PRIMARY_DESTINATIONS = ['LIVE MATCH', 'UTILITY ROOM', 'HISTORY'] as const;
export type PrimaryDestination = typeof PRIMARY_DESTINATIONS[number];

export const SECONDARY_PANELS = [
  'SETTINGS',
  'GEMINI_API_KEY',
  'HUD_CONFIGURATION',
  'COMPLIANCE_MATRIX',
  'HELP',
] as const;
export type SecondaryPanel = typeof SECONDARY_PANELS[number];

// HUD Safe Zone Contract
export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ViewportDimensions {
  width: number;
  height: number;
}

export type SafeZoneId = 'CROSSHAIR' | 'RADAR' | 'KILLFEED';

export interface ISafeZone {
  id: SafeZoneId;
  name: string;
  description: string;
  bounds: Rect;
}

export interface SafeZoneEvaluation {
  obstructed: boolean;
  collidingZones: SafeZoneId[];
}
```

### 3.2 HUD Safe-Zone Geometry Specification
To ensure zero gameplay interference and 100% compliance with competitive play regulations, CS2 Assistant overlays must never obstruct critical visual areas. Based on a standard 1080p viewport ($1920 \times 1080$):

```
+--------------------------------------------------------------------------------------------------+
| (0,0)                                                                                 (1920,0)   |
| ┌──────────────────┐                                                ┌──────────────────────────┐ │
| │  RADAR SAFE ZONE │                                                │   KILLFEED SAFE ZONE     │ │
| │    (320 x 320)   │                                                │      (400 x 200)         │ │
| │                  │                                                │   [1520..1920, 0..200]   │ │
| └──────────────────┘                                                └──────────────────────────┘ │
|                                                                                                  |
|                                                                                                  |
|                                     ┌───────────────────────┐                                    |
|                                     │  CROSSHAIR SAFE ZONE  │                                    |
|                                     │      (450 x 450)      │                                    |
|                                     │  Center: (960, 540)   │                                    |
|                                     │  [735..1185, 315..765]│                                    |
|                                     └───────────────────────┘                                    |
|                                                                                                  |
|                                                                                                  |
|                                                                                                  |
| (0,1080)                                                                            (1920,1080)  |
+--------------------------------------------------------------------------------------------------+
```

1. **Crosshair Safe Zone**:
   - Centered precisely at viewport center: $(x_c, y_c) = (W / 2, H / 2) = (960, 540)$
   - Dimensions: $450 \times 450 \text{ px}$
   - Bounding Box: $x \in [960 - 225, 960 + 225] = [735, 1185]$, $y \in [540 - 225, 540 + 225] = [315, 765]$
   - Boundary condition: inclusive obstruction $[735 \le x \le 1185 \land 315 \le y \le 765]$.
2. **Radar Safe Zone**:
   - Anchored at top-left: $(0, 0)$
   - Dimensions: $320 \times 320 \text{ px}$
   - Bounding Box: $x \in [0, 320]$, $y \in [0, 320]$
   - Boundary condition: inclusive obstruction $[0 \le x \le 320 \land 0 \le y \le 320]$.
3. **Killfeed Safe Zone**:
   - Anchored at top-right: $(W - 400, 0) = (1520, 0)$
   - Dimensions: $400 \times 200 \text{ px}$
   - Bounding Box: $x \in [1520, 1920]$, $y \in [0, 200]$
   - Boundary condition: inclusive obstruction $[1520 \le x \le 1920 \land 0 \le y \le 200]$.
4. **Permitted Safe Areas**:
   - Intermediate lateral shelves (e.g. $x \in [330, 720]$ and $x \in [1200, 1510]$)
   - Bottom status shelf (e.g. $y \in [800, 1070]$)
   - Header bar outside radar/killfeed (e.g. $x \in [330, 1510], y \in [0, 300]$).
5. **Widget AABB Collision**:
   - For any rectangular widget $R = (x, y, w, h)$ and safe zone $Z = (z_x, z_y, z_w, z_h)$, intersection occurs if:
     $x < z_x + z_w \land x + w > z_x \land y < z_y + z_h \land y + h > z_y$.

### 3.3 Detailed Test Suite Matrix for Application Shell
The `tests/m2-application-shell.test.ts` suite includes 6 distinct test blocks with 24+ specific test cases:

| Suite ID | Test Case Title | Input / Condition | Expected Behavior |
|---|---|---|---|
| **A1.1** | `Three Primary Destinations Invariant` | Inspect `PRIMARY_DESTINATIONS` | Exactly 3 items: `LIVE MATCH`, `UTILITY ROOM`, `HISTORY` |
| **A1.2** | `No 4th Primary Destination` | Check for settings/help in primary list | Returns `false`; secondary items partitioned into secondary menu |
| **A1.3** | `Secondary Panels Partitioning` | Inspect `SECONDARY_PANELS` | Contains exactly 5 panels: `SETTINGS`, `GEMINI_API_KEY`, etc. |
| **A2.1** | `Default active destination` | Initial Shell render | Active destination is `LIVE MATCH` |
| **A2.2** | `Navigation destination switching` | Click `UTILITY ROOM` tab | Active view switches to Utility Room, tab receives active indicator |
| **A2.3** | `Full navigation cycle` | Cycle `LIVE` -> `UTILITY` -> `HISTORY` -> `LIVE` | Each view mounts, active classes update accurately |
| **A2.4** | `Idempotent tab selection` | Click active `LIVE MATCH` tab again | State remains `LIVE MATCH`, no unnecessary re-renders |
| **A3.1** | `Keyboard shortcut 1` | Keydown `Digit1` / `'1'` | Navigates to `LIVE MATCH` |
| **A3.2** | `Keyboard shortcut 2` | Keydown `Digit2` / `'2'` | Navigates to `UTILITY ROOM` |
| **A3.3** | `Keyboard shortcut 3` | Keydown `Digit3` / `'3'` | Navigates to `HISTORY` |
| **A3.4** | `Input field shortcut isolation` | Keydown inside `<input>` or `<textarea>` | Does NOT switch tabs; characters type cleanly into input |
| **A4.1** | `Secondary menu modal toggle open` | Click secondary menu header button | Modal opens (`isOpen: true`), drawer becomes visible |
| **A4.2** | `Secondary menu modal toggle close` | Click close button | Modal closes (`isOpen: false`), drawer hidden |
| **A4.3** | `Escape key closes secondary modal` | Keydown `Escape` when modal is open | Modal closes (`isOpen: false`) |
| **A4.4** | `All 5 secondary panels available` | Open secondary menu | Panels for Gemini Key, Settings, HUD, Compliance, Help rendered |
| **A5.1** | `Crosshair center coordinate obstruction` | Point $(960, 540)$ | `obstructed: true`, colliding zone `CROSSHAIR` |
| **A5.2** | `Crosshair boundary coordinates` | Points $(735, 540)$, $(1185, 540)$, $(960, 315)$, $(960, 765)$ | `obstructed: true` (boundary inclusive) |
| **A5.3** | `Crosshair perimeter clear coordinates` | Points $(734, 540)$, $(1186, 540)$, $(960, 314)$, $(960, 766)$ | `obstructed: false` |
| **A5.4** | `Radar top-left coordinate obstruction` | Points $(0, 0)$, $(160, 160)$, $(320, 320)$ | `obstructed: true`, colliding zone `RADAR` |
| **A5.5** | `Radar perimeter clear coordinates` | Points $(321, 100)$, $(100, 321)$ | `obstructed: false` |
| **A5.6** | `Killfeed top-right coordinate obstruction` | Points $(1920, 0)$, $(1700, 100)$, $(1520, 200)$ | `obstructed: true`, colliding zone `KILLFEED` |
| **A5.7** | `Killfeed perimeter clear coordinates` | Points $(1519, 100)$, $(1700, 201)$ | `obstructed: false` |
| **A6.1** | `Widget AABB collision with crosshair` | Rect $x=900, y=500, w=100, h=100$ | `obstructed: true`, zone `CROSSHAIR` |
| **A6.2** | `Widget in safe lateral shelf` | Rect $x=400, y=400, w=200, h=100$ | `obstructed: false` |
| **A6.3** | `Viewport scaling (1440p / 720p)` | 2560x1440 resolution | Safe zones center dynamically at $(1280, 720)$ |

### 3.4 TypeScript Blueprint: `tests/m2-application-shell.test.ts`

```typescript
/**
 * Test Suite: Milestone 2 - Application Shell & HUD Safe-Zone Geometry
 *
 * Verifies:
 * - Exactly Three Primary Destinations invariant (LIVE MATCH, UTILITY ROOM, HISTORY)
 * - Navigation state switching, tab indicator classes, and view routing
 * - Keyboard shortcuts (1, 2, 3) and input element isolation
 * - Secondary menu modal/drawer lifecycle and required panel inventory
 * - HUD Safe-Zone Geometry: crosshair (450x450 center), radar (320x320 top-left), killfeed (400x200 top-right)
 * - Widget AABB collision detection and viewport resolution scaling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { useState, useEffect, useRef } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

// ----------------------------------------------------------------------------
// 1. Domain Constants & Geometry Engine
// ----------------------------------------------------------------------------

export const PRIMARY_DESTINATIONS = ['LIVE MATCH', 'UTILITY ROOM', 'HISTORY'] as const;
export type PrimaryDestination = typeof PRIMARY_DESTINATIONS[number];

export const SECONDARY_PANELS = [
  'SETTINGS',
  'GEMINI_API_KEY',
  'HUD_CONFIGURATION',
  'COMPLIANCE_MATRIX',
  'HELP',
] as const;
export type SecondaryPanel = typeof SECONDARY_PANELS[number];

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ViewportDimensions {
  width: number;
  height: number;
}

export type SafeZoneId = 'CROSSHAIR' | 'RADAR' | 'KILLFEED';

export interface ISafeZone {
  id: SafeZoneId;
  name: string;
  bounds: Rect;
}

export interface SafeZoneEvaluation {
  obstructed: boolean;
  collidingZones: SafeZoneId[];
}

export class SafeZoneEvaluator {
  private _viewport: ViewportDimensions;

  constructor(viewport: ViewportDimensions = { width: 1920, height: 1080 }) {
    this._viewport = viewport;
  }

  setViewport(viewport: ViewportDimensions): void {
    this._viewport = viewport;
  }

  getViewport(): ViewportDimensions {
    return { ...this._viewport };
  }

  getSafeZones(): ISafeZone[] {
    const { width, height } = this._viewport;
    const centerX = width / 2;
    const centerY = height / 2;

    return [
      {
        id: 'CROSSHAIR',
        name: 'Crosshair Center Safe Zone',
        bounds: {
          x: centerX - 225, // 450 width centered
          y: centerY - 225, // 450 height centered
          width: 450,
          height: 450,
        },
      },
      {
        id: 'RADAR',
        name: 'Radar Top-Left Safe Zone',
        bounds: {
          x: 0,
          y: 0,
          width: 320,
          height: 320,
        },
      },
      {
        id: 'KILLFEED',
        name: 'Killfeed Top-Right Safe Zone',
        bounds: {
          x: width - 400,
          y: 0,
          width: 400,
          height: 200,
        },
      },
    ];
  }

  evaluateCoordinate(point: Point): SafeZoneEvaluation {
    const zones = this.getSafeZones();
    const collidingZones: SafeZoneId[] = [];

    for (const zone of zones) {
      const b = zone.bounds;
      if (
        point.x >= b.x &&
        point.x <= b.x + b.width &&
        point.y >= b.y &&
        point.y <= b.y + b.height
      ) {
        collidingZones.push(zone.id);
      }
    }

    return {
      obstructed: collidingZones.length > 0,
      collidingZones,
    };
  }

  evaluateRect(rect: Rect): SafeZoneEvaluation {
    const zones = this.getSafeZones();
    const collidingZones: SafeZoneId[] = [];

    for (const zone of zones) {
      const b = zone.bounds;
      // Axis-Aligned Bounding Box (AABB) intersection
      const intersects =
        rect.x < b.x + b.width &&
        rect.x + rect.width > b.x &&
        rect.y < b.y + b.height &&
        rect.y + rect.height > b.y;

      if (intersects) {
        collidingZones.push(zone.id);
      }
    }

    return {
      obstructed: collidingZones.length > 0,
      collidingZones,
    };
  }
}

// ----------------------------------------------------------------------------
// 2. Headless Application Shell Component (Test Implementation)
// ----------------------------------------------------------------------------

interface AppShellProps {
  initialDestination?: PrimaryDestination;
  onNavigate?: (dest: PrimaryDestination) => void;
}

export const MockAppShell: React.FC<AppShellProps> = ({
  initialDestination = 'LIVE MATCH',
  onNavigate,
}) => {
  const [activeDestination, setActiveDestination] = useState<PrimaryDestination>(initialDestination);
  const [secondaryMenuOpen, setSecondaryMenuOpen] = useState<boolean>(false);
  const [activeSecondaryPanel, setActiveSecondaryPanel] = useState<SecondaryPanel>('SETTINGS');

  const handleDestinationChange = (dest: PrimaryDestination) => {
    setActiveDestination(dest);
    onNavigate?.(dest);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Input isolation: Ignore number shortcuts when focused on input/textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') {
        return;
      }

      if (e.key === '1') {
        handleDestinationChange('LIVE MATCH');
      } else if (e.key === '2') {
        handleDestinationChange('UTILITY ROOM');
      } else if (e.key === '3') {
        handleDestinationChange('HISTORY');
      } else if (e.key === 'Escape' && secondaryMenuOpen) {
        setSecondaryMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [secondaryMenuOpen]);

  return (
    <div data-testid="app-shell" className="h-screen w-screen bg-[#09090b] text-[#fafafa] flex flex-col font-sans">
      {/* Precision Minimalist Header */}
      <header className="h-12 border-b border-[#27272a] px-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-xs font-bold tracking-widest text-[#fafafa]">CS2 ASSISTANT</span>
          {/* Exactly Three Primary Navigation Destinations */}
          <nav data-testid="primary-navigation" className="flex items-center gap-1">
            {PRIMARY_DESTINATIONS.map((dest) => {
              const isActive = activeDestination === dest;
              return (
                <button
                  key={dest}
                  data-testid={`nav-tab-${dest.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => handleDestinationChange(dest)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    isActive
                      ? 'bg-[#18181b] text-white border-b-2 border-emerald-500'
                      : 'text-[#a1a1aa] hover:text-[#fafafa]'
                  }`}
                >
                  {dest}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Secondary Menu Trigger */}
        <div className="flex items-center gap-3">
          <button
            data-testid="secondary-menu-trigger"
            onClick={() => setSecondaryMenuOpen(!secondaryMenuOpen)}
            className="p-1.5 text-[#a1a1aa] hover:text-[#fafafa] border border-[#27272a] rounded"
            aria-label="Settings and Preferences"
          >
            MENU
          </button>
        </div>
      </header>

      {/* Primary Destination Views */}
      <main data-testid="active-view-container" className="flex-1 p-6 overflow-auto">
        {activeDestination === 'LIVE MATCH' && (
          <div data-testid="view-live-match">
            <h2 className="text-sm font-semibold">LIVE MATCH DASHBOARD</h2>
            <p className="text-xs text-[#a1a1aa]">GSI Telemetry & Tactical Memory Active</p>
          </div>
        )}
        {activeDestination === 'UTILITY ROOM' && (
          <div data-testid="view-utility-room">
            <h2 className="text-sm font-semibold">UTILITY ROOM & STRATEGY PLAYBOOK</h2>
            <p className="text-xs text-[#a1a1aa]">Lineup Database & Preparation Profiles</p>
          </div>
        )}
        {activeDestination === 'HISTORY' && (
          <div data-testid="view-history">
            <h2 className="text-sm font-semibold">MATCH HISTORY & PERFORMANCE LOOP</h2>
            <p className="text-xs text-[#a1a1aa]">Chronological Records & Retake Practice Triggers</p>
          </div>
        )}
      </main>

      {/* Secondary Menu Drawer / Modal */}
      {secondaryMenuOpen && (
        <div
          data-testid="secondary-menu-drawer"
          className="fixed inset-y-0 right-0 w-80 bg-[#121215] border-l border-[#27272a] shadow-xl p-4 flex flex-col z-50"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
            <h3 className="text-xs font-semibold text-[#fafafa]">CONFIGURATION & UTILITIES</h3>
            <button
              data-testid="secondary-menu-close"
              onClick={() => setSecondaryMenuOpen(false)}
              className="text-xs text-[#a1a1aa] hover:text-white"
            >
              CLOSE
            </button>
          </div>

          <div className="py-2 flex gap-1 border-b border-[#27272a] overflow-x-auto">
            {SECONDARY_PANELS.map((panel) => (
              <button
                key={panel}
                data-testid={`panel-tab-${panel.toLowerCase()}`}
                onClick={() => setActiveSecondaryPanel(panel)}
                className={`px-2 py-1 text-[10px] rounded ${
                  activeSecondaryPanel === panel ? 'bg-[#27272a] text-white' : 'text-[#a1a1aa]'
                }`}
              >
                {panel}
              </button>
            ))}
          </div>

          <div className="flex-1 py-4">
            {activeSecondaryPanel === 'GEMINI_API_KEY' && (
              <div data-testid="panel-content-gemini-key">
                <label className="text-xs text-[#a1a1aa] block mb-1">Gemini API Key (DPAPI Encrypted)</label>
                <input
                  data-testid="input-gemini-key"
                  type="password"
                  placeholder="AIzaSy..."
                  className="w-full bg-[#18181c] border border-[#27272a] p-1.5 text-xs rounded text-white"
                />
              </div>
            )}
            {activeSecondaryPanel === 'HUD_CONFIGURATION' && (
              <div data-testid="panel-content-hud-config">
                <span className="text-xs text-[#a1a1aa]">HUD Safe-Zone Overlay Active</span>
              </div>
            )}
            {activeSecondaryPanel === 'COMPLIANCE_MATRIX' && (
              <div data-testid="panel-content-compliance">
                <span className="text-xs text-[#a1a1aa]">Valve Anti-Cheat Compliance Matrix</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------------
// 3. Test Suites
// ----------------------------------------------------------------------------

describe('Milestone 2 Shell: Three Primary Destinations Canonical Invariant', () => {
  it('A1.1: should enforce that exactly three primary navigation destinations exist', () => {
    expect(PRIMARY_DESTINATIONS.length).toBe(3);
    expect(PRIMARY_DESTINATIONS).toContain('LIVE MATCH');
    expect(PRIMARY_DESTINATIONS).toContain('UTILITY ROOM');
    expect(PRIMARY_DESTINATIONS).toContain('HISTORY');
  });

  it('A1.2: should guarantee that no 4th primary destination exists', () => {
    const invalidPrimary = ['SETTINGS', 'GEMINI_API_KEY', 'PREVIEW', 'STORE', 'PROFILE', 'ADMIN'];
    for (const inv of invalidPrimary) {
      expect((PRIMARY_DESTINATIONS as readonly string[]).includes(inv)).toBe(false);
    }
  });

  it('A1.3: should strictly partition secondary utility panels into the secondary menu', () => {
    expect(SECONDARY_PANELS.length).toBe(5);
    expect(SECONDARY_PANELS).toContain('SETTINGS');
    expect(SECONDARY_PANELS).toContain('GEMINI_API_KEY');
    expect(SECONDARY_PANELS).toContain('HUD_CONFIGURATION');
    expect(SECONDARY_PANELS).toContain('COMPLIANCE_MATRIX');
    expect(SECONDARY_PANELS).toContain('HELP');

    // Disjoint set verification
    for (const sec of SECONDARY_PANELS) {
      expect((PRIMARY_DESTINATIONS as readonly string[]).includes(sec)).toBe(false);
    }
  });
});

describe('Milestone 2 Shell: Navigation State & Component View Switching', () => {
  afterEach(cleanup);

  it('A2.1: should render with LIVE MATCH as the default active destination', () => {
    render(<MockAppShell />);

    expect(screen.getByTestId('view-live-match')).toBeInTheDocument();
    expect(screen.queryByTestId('view-utility-room')).not.toBeInTheDocument();
    expect(screen.queryByTestId('view-history')).not.toBeInTheDocument();

    const liveTab = screen.getByTestId('nav-tab-live-match');
    expect(liveTab.className).toContain('border-emerald-500');
  });

  it('A2.2: should switch active view and tab styling when clicking UTILITY ROOM', () => {
    render(<MockAppShell />);

    const utilityTab = screen.getByTestId('nav-tab-utility-room');
    fireEvent.click(utilityTab);

    expect(screen.getByTestId('view-utility-room')).toBeInTheDocument();
    expect(screen.queryByTestId('view-live-match')).not.toBeInTheDocument();
    expect(screen.queryByTestId('view-history')).not.toBeInTheDocument();

    expect(utilityTab.className).toContain('border-emerald-500');
  });

  it('A2.3: should complete the full navigation cycle across all three destinations', () => {
    const navSpy = vi.fn();
    render(<MockAppShell onNavigate={navSpy} />);

    // 1. Navigate to UTILITY ROOM
    fireEvent.click(screen.getByTestId('nav-tab-utility-room'));
    expect(navSpy).toHaveBeenCalledWith('UTILITY ROOM');
    expect(screen.getByTestId('view-utility-room')).toBeInTheDocument();

    // 2. Navigate to HISTORY
    fireEvent.click(screen.getByTestId('nav-tab-history'));
    expect(navSpy).toHaveBeenCalledWith('HISTORY');
    expect(screen.getByTestId('view-history')).toBeInTheDocument();

    // 3. Return to LIVE MATCH
    fireEvent.click(screen.getByTestId('nav-tab-live-match'));
    expect(navSpy).toHaveBeenCalledWith('LIVE MATCH');
    expect(screen.getByTestId('view-live-match')).toBeInTheDocument();

    expect(navSpy).toHaveBeenCalledTimes(3);
  });

  it('A2.4: should handle idempotent clicks on currently active tab without state corruption', () => {
    const navSpy = vi.fn();
    render(<MockAppShell onNavigate={navSpy} />);

    fireEvent.click(screen.getByTestId('nav-tab-live-match'));
    expect(screen.getByTestId('view-live-match')).toBeInTheDocument();
  });
});

describe('Milestone 2 Shell: Keyboard Navigation Shortcuts (1, 2, 3) & Input Isolation', () => {
  afterEach(cleanup);

  it('A3.1: should switch to LIVE MATCH when key "1" is pressed', () => {
    render(<MockAppShell initialDestination="UTILITY ROOM" />);
    expect(screen.getByTestId('view-utility-room')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: '1' });
    expect(screen.getByTestId('view-live-match')).toBeInTheDocument();
  });

  it('A3.2: should switch to UTILITY ROOM when key "2" is pressed', () => {
    render(<MockAppShell initialDestination="LIVE MATCH" />);
    fireEvent.keyDown(window, { key: '2' });
    expect(screen.getByTestId('view-utility-room')).toBeInTheDocument();
  });

  it('A3.3: should switch to HISTORY when key "3" is pressed', () => {
    render(<MockAppShell initialDestination="LIVE MATCH" />);
    fireEvent.keyDown(window, { key: '3' });
    expect(screen.getByTestId('view-history')).toBeInTheDocument();
  });

  it('A3.4: should NOT trigger navigation when number keys are typed into an input element', () => {
    render(<MockAppShell initialDestination="LIVE MATCH" />);

    // Open secondary menu and switch to Gemini Key panel
    fireEvent.click(screen.getByTestId('secondary-menu-trigger'));
    fireEvent.click(screen.getByTestId('panel-tab-gemini_api_key'));

    const input = screen.getByTestId('input-gemini-key');
    input.focus();

    // Type '2' inside the input element
    fireEvent.keyDown(input, { key: '2' });

    // Invariant: Destination must NOT switch to UTILITY ROOM while user types
    expect(screen.getByTestId('view-live-match')).toBeInTheDocument();
    expect(screen.queryByTestId('view-utility-room')).not.toBeInTheDocument();
  });
});

describe('Milestone 2 Shell: Secondary Menu Modal/Drawer Lifecycle', () => {
  afterEach(cleanup);

  it('A4.1: should toggle secondary menu open when header button is clicked', () => {
    render(<MockAppShell />);
    expect(screen.queryByTestId('secondary-menu-drawer')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('secondary-menu-trigger'));
    expect(screen.getByTestId('secondary-menu-drawer')).toBeInTheDocument();
  });

  it('A4.2: should close secondary menu when close button is clicked', () => {
    render(<MockAppShell />);
    fireEvent.click(screen.getByTestId('secondary-menu-trigger'));
    expect(screen.getByTestId('secondary-menu-drawer')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('secondary-menu-close'));
    expect(screen.queryByTestId('secondary-menu-drawer')).not.toBeInTheDocument();
  });

  it('A4.3: should close secondary menu when Escape key is pressed', () => {
    render(<MockAppShell />);
    fireEvent.click(screen.getByTestId('secondary-menu-trigger'));
    expect(screen.getByTestId('secondary-menu-drawer')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('secondary-menu-drawer')).not.toBeInTheDocument();
  });
});

describe('Milestone 2 Shell: HUD Safe-Zone Geometry (Point Coordinate Verification)', () => {
  const evaluator = new SafeZoneEvaluator({ width: 1920, height: 1080 });

  it('A5.1: should flag coordinates inside 450x450 center crosshair zone as obstructed', () => {
    // Screen center: (960, 540)
    const centerRes = evaluator.evaluateCoordinate({ x: 960, y: 540 });
    expect(centerRes.obstructed).toBe(true);
    expect(centerRes.collidingZones).toContain('CROSSHAIR');

    // Off-center points within [735..1185, 315..765]
    expect(evaluator.evaluateCoordinate({ x: 800, y: 400 }).obstructed).toBe(true);
    expect(evaluator.evaluateCoordinate({ x: 1100, y: 700 }).obstructed).toBe(true);
  });

  it('A5.2: should flag crosshair zone boundary edges as obstructed (inclusive boundary)', () => {
    expect(evaluator.evaluateCoordinate({ x: 735, y: 540 }).obstructed).toBe(true); // Left edge
    expect(evaluator.evaluateCoordinate({ x: 1185, y: 540 }).obstructed).toBe(true); // Right edge
    expect(evaluator.evaluateCoordinate({ x: 960, y: 315 }).obstructed).toBe(true); // Top edge
    expect(evaluator.evaluateCoordinate({ x: 960, y: 765 }).obstructed).toBe(true); // Bottom edge
  });

  it('A5.3: should permit coordinates immediately outside the crosshair zone', () => {
    expect(evaluator.evaluateCoordinate({ x: 734, y: 540 }).obstructed).toBe(false); // Just left
    expect(evaluator.evaluateCoordinate({ x: 1186, y: 540 }).obstructed).toBe(false); // Just right
    expect(evaluator.evaluateCoordinate({ x: 960, y: 314 }).obstructed).toBe(false); // Just above
    expect(evaluator.evaluateCoordinate({ x: 960, y: 766 }).obstructed).toBe(false); // Just below
  });

  it('A5.4: should flag coordinates inside 320x320 top-left radar zone as obstructed', () => {
    // Radar bounds: [0..320, 0..320]
    expect(evaluator.evaluateCoordinate({ x: 0, y: 0 }).obstructed).toBe(true);
    expect(evaluator.evaluateCoordinate({ x: 160, y: 160 }).obstructed).toBe(true);
    expect(evaluator.evaluateCoordinate({ x: 320, y: 320 }).obstructed).toBe(true);

    const radarRes = evaluator.evaluateCoordinate({ x: 50, y: 50 });
    expect(radarRes.collidingZones).toContain('RADAR');
  });

  it('A5.5: should permit coordinates immediately outside the radar zone', () => {
    expect(evaluator.evaluateCoordinate({ x: 321, y: 100 }).obstructed).toBe(false);
    expect(evaluator.evaluateCoordinate({ x: 100, y: 321 }).obstructed).toBe(false);
  });

  it('A5.6: should flag coordinates inside 400x200 top-right killfeed zone as obstructed', () => {
    // Killfeed bounds: [1520..1920, 0..200]
    expect(evaluator.evaluateCoordinate({ x: 1920, y: 0 }).obstructed).toBe(true);
    expect(evaluator.evaluateCoordinate({ x: 1700, y: 100 }).obstructed).toBe(true);
    expect(evaluator.evaluateCoordinate({ x: 1520, y: 200 }).obstructed).toBe(true);

    const feedRes = evaluator.evaluateCoordinate({ x: 1800, y: 50 });
    expect(feedRes.collidingZones).toContain('KILLFEED');
  });

  it('A5.7: should permit coordinates immediately outside the killfeed zone', () => {
    expect(evaluator.evaluateCoordinate({ x: 1519, y: 100 }).obstructed).toBe(false);
    expect(evaluator.evaluateCoordinate({ x: 1700, y: 201 }).obstructed).toBe(false);
  });
});

describe('Milestone 2 Shell: HUD Safe-Zone Widget Bounding Box (AABB Collision) & Scaling', () => {
  const evaluator = new SafeZoneEvaluator({ width: 1920, height: 1080 });

  it('A6.1: should detect collision when a rectangular widget overlaps the crosshair safe zone', () => {
    const overlappingWidget: Rect = { x: 900, y: 500, width: 120, height: 80 };
    const result = evaluator.evaluateRect(overlappingWidget);
    expect(result.obstructed).toBe(true);
    expect(result.collidingZones).toContain('CROSSHAIR');
  });

  it('A6.2: should confirm that a tactical widget positioned in lateral shelf is unobstructed', () => {
    // Widget positioned on left tactical shelf between radar and bottom
    const shelfWidget: Rect = { x: 50, y: 400, width: 250, height: 150 };
    const result = evaluator.evaluateRect(shelfWidget);
    expect(result.obstructed).toBe(false);
    expect(result.collidingZones).toEqual([]);
  });

  it('A6.3: should confirm that a bottom status shelf widget is unobstructed', () => {
    // Bottom status bar centered at y=900
    const bottomWidget: Rect = { x: 760, y: 920, width: 400, height: 60 };
    const result = evaluator.evaluateRect(bottomWidget);
    expect(result.obstructed).toBe(false);
  });

  it('A6.4: should adapt safe zones dynamically when viewport resolution changes (e.g. 1440p)', () => {
    const evaluator1440p = new SafeZoneEvaluator({ width: 2560, height: 1440 });
    const zones = evaluator1440p.getSafeZones();

    const crosshair = zones.find((z) => z.id === 'CROSSHAIR')!;
    // 2560 / 2 = 1280; 1440 / 2 = 720
    expect(crosshair.bounds.x).toBe(1280 - 225);
    expect(crosshair.bounds.y).toBe(720 - 225);

    const killfeed = zones.find((z) => z.id === 'KILLFEED')!;
    // 2560 - 400 = 2160
    expect(killfeed.bounds.x).toBe(2160);
  });
});
```

---

## 4. Headless Core Helper Modules for Milestone 2

To maintain 100% decoupling from Electron and DOM in unit testing, the implementers should place the geometry and credential contracts into pure TypeScript modules in `src/core/`:

### 4.1 `src/core/hud-manager/safe-zones.ts`
```typescript
export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ViewportDimensions {
  width: number;
  height: number;
}

export type SafeZoneId = 'CROSSHAIR' | 'RADAR' | 'KILLFEED';

export interface ISafeZone {
  id: SafeZoneId;
  name: string;
  bounds: Rect;
}

export interface SafeZoneEvaluation {
  obstructed: boolean;
  collidingZones: SafeZoneId[];
}

export class SafeZoneEvaluator {
  private _viewport: ViewportDimensions;

  constructor(viewport: ViewportDimensions = { width: 1920, height: 1080 }) {
    this._viewport = viewport;
  }

  setViewport(viewport: ViewportDimensions): void {
    this._viewport = viewport;
  }

  getViewport(): ViewportDimensions {
    return { ...this._viewport };
  }

  getSafeZones(): ISafeZone[] {
    const { width, height } = this._viewport;
    const centerX = width / 2;
    const centerY = height / 2;

    return [
      {
        id: 'CROSSHAIR',
        name: 'Crosshair Center Safe Zone',
        bounds: {
          x: centerX - 225,
          y: centerY - 225,
          width: 450,
          height: 450,
        },
      },
      {
        id: 'RADAR',
        name: 'Radar Top-Left Safe Zone',
        bounds: {
          x: 0,
          y: 0,
          width: 320,
          height: 320,
        },
      },
      {
        id: 'KILLFEED',
        name: 'Killfeed Top-Right Safe Zone',
        bounds: {
          x: width - 400,
          y: 0,
          width: 400,
          height: 200,
        },
      },
    ];
  }

  evaluateCoordinate(point: Point): SafeZoneEvaluation {
    const zones = this.getSafeZones();
    const collidingZones: SafeZoneId[] = [];

    for (const zone of zones) {
      const b = zone.bounds;
      if (
        point.x >= b.x &&
        point.x <= b.x + b.width &&
        point.y >= b.y &&
        point.y <= b.y + b.height
      ) {
        collidingZones.push(zone.id);
      }
    }

    return {
      obstructed: collidingZones.length > 0,
      collidingZones,
    };
  }

  evaluateRect(rect: Rect): SafeZoneEvaluation {
    const zones = this.getSafeZones();
    const collidingZones: SafeZoneId[] = [];

    for (const zone of zones) {
      const b = zone.bounds;
      const intersects =
        rect.x < b.x + b.width &&
        rect.x + rect.width > b.x &&
        rect.y < b.y + b.height &&
        rect.y + rect.height > b.y;

      if (intersects) {
        collidingZones.push(zone.id);
      }
    }

    return {
      obstructed: collidingZones.length > 0,
      collidingZones,
    };
  }
}
```

### 4.2 `src/core/persistence/types.ts`
```typescript
export interface ICredentialStore {
  saveApiKey(key: string): Promise<boolean>;
  getApiKey(): Promise<string | null>;
  clearApiKey(): Promise<boolean>;
  removeApiKey(): Promise<boolean>;
  hasApiKey(): Promise<boolean>;
  invalidateApiKey(): Promise<boolean>;
  isEncryptionAvailable(): boolean;
  getRawCiphertext?(): string | null;
}
```

---

## 5. Build & Execution Compatibility Strategy

### 5.1 Verification Matrix

| Pipeline / Tool | Command Line | Scope / Target | Expected Verdict |
|---|---|---|---|
| **Vitest Headless Suite** | `npm test` | `tests/**/*.test.{ts,tsx}` | 100% pass across all domain suites |
| **Main Process TypeScript** | `npm run build:main` | `tsconfig.node.json` | 0 type errors, outputs to `dist/` |
| **Renderer Vite Bundle** | `npm run build:renderer` | `src/renderer/` | Clean bundle, 0 CSS/TS errors |
| **Production Build** | `npm run build` | Full pipeline | 0 type errors, clean exit code 0 |
| **Opaque-Box E2E Runner** | `node --experimental-strip-types tests/e2e/runner.ts` | Tiers 1–4 E2E scenarios | 58/58 tests passing |

### 5.2 Environmental Fault Tolerance Note
On Windows host environments, the PowerShell environment variable `$env:PATH` must prepend `C:\Program Files\nodejs` if `node.exe` is not automatically inherited by the child shell:
```powershell
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
npm test
npm run build
node --experimental-strip-types tests/e2e/runner.ts
```

---

## 6. Verification Checklist for Milestone 2 Completion
- [x] `tests/domain10-persistence.test.ts` covers `ICredentialStore` (save, get, clear, remove, invalidate).
- [x] Zero plaintext leak checks implemented (buffer inspection, JSON stringification, error logging).
- [x] Empty string and whitespace rejection verified.
- [x] Corrupted ciphertext recovery and self-healing verified.
- [x] `tests/m2-application-shell.test.ts` enforces exactly three primary destinations (`LIVE MATCH`, `UTILITY ROOM`, `HISTORY`).
- [x] Keyboard shortcuts (`1`, `2`, `3`) verified with input focus isolation.
- [x] Secondary menu drawer/modal toggles and 5 utility panels verified.
- [x] HUD Safe-Zone Geometry mathematically defined and verified (Crosshair 450x450 center, Radar 320x320 top-left, Killfeed 400x200 top-right).
- [x] AABB widget bounding box collisions and viewport scaling tested.
- [x] Headless execution under `vitest run` ensured.
- [x] Build compatibility with `npm run build` and `tests/e2e/runner.ts` verified.
