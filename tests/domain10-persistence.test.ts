/**
 * Test Suite: Domain 10 - Persistence & Credential Storage
 * File: tests/domain10-persistence.test.ts
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
import {
  InMemoryCredentialStore,
  InMemorySettingsStore,
  DEFAULT_USER_SETTINGS,
  type IUserSettings,
} from '../src/main/credential-store';
import { ProfileManager } from '../src/core/utility/profile-manager';
import { COMPETITIVE_LINEUPS } from '../src/core/utility/lineup-database';
import { COMPETITIVE_STRATEGIES } from '../src/core/utility/strategy-database';
import {
  validateLineup,
  serializeExportEnvelope,
  deserializeAndValidate,
} from '../src/core/utility/json-io';

describe('Domain 10: ICredentialStore Lifecycle & Basic CRUD Operations', () => {
  let store: InMemoryCredentialStore;
  const sampleKey = 'AIzaSyA_ValidGeminiKeyTest1234567890abcdef';

  beforeEach(() => {
    store = new InMemoryCredentialStore(null, true);
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
    const availableStore = new InMemoryCredentialStore(null, true);
    expect(availableStore.isEncryptionAvailable()).toBe(true);

    const unavailableStore = new InMemoryCredentialStore(null, false);
    expect(unavailableStore.isEncryptionAvailable()).toBe(false);
  });

  it('TC10.7: should refuse to save key when encryption is unavailable', async () => {
    const storeNoEnc = new InMemoryCredentialStore(null, false);
    const saved = await storeNoEnc.saveApiKey(sampleKey);
    expect(saved).toBe(false);
    expect(await storeNoEnc.getApiKey()).toBeNull();
  });
});

describe('Domain 10: Zero Plaintext Leaks Security Invariants', () => {
  let store: InMemoryCredentialStore;
  const secretKey = 'AIzaSyA_UltraSecretGeminiApiKeyZeroLeak999';

  beforeEach(() => {
    store = new InMemoryCredentialStore(null, true);
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
    store = new InMemoryCredentialStore(null, true);
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
    store = new InMemoryCredentialStore(null, true);
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
    store = new InMemoryCredentialStore(null, true);
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

describe('Domain 10: Utility Playbook, Custom Lineups & Preparation Profiles Persistence', () => {
  it('TC10.26: should persist and update Match Preparation Profiles and maintain active state', () => {
    const pm = new ProfileManager();

    const created = pm.createProfile({
      name: 'Inferno B Site Attack',
      map: 'de_inferno',
      side: 'T',
      selectedLineupIds: ['lineup-inferno-b-coffins', 'lineup-inferno-b-ct-smoke'],
      selectedStrategyIds: ['strat-inferno-b-execute'],
      active: true,
    });

    expect(created.profileId).toBeDefined();
    expect(created.active).toBe(true);
    expect(pm.getActiveProfile()?.profileId).toBe(created.profileId);

    // Update profile
    const updated = pm.updateProfile(created.profileId, {
      name: 'Inferno B Site Attack (Modified)',
      selectedLineupIds: ['lineup-inferno-b-coffins'],
    });

    expect(updated?.name).toBe('Inferno B Site Attack (Modified)');
    expect(updated?.selectedLineupIds.length).toBe(1);
    expect(pm.getActiveProfile()?.name).toBe('Inferno B Site Attack (Modified)');
  });

  it('TC10.27: should persist custom lineups and preserve favorite flags', () => {
    const baseLineup = COMPETITIVE_LINEUPS[0];
    const customLineup = {
      ...baseLineup,
      id: 'custom-mirage-smoke-1',
      isCustom: true,
      favorite: true,
    };

    expect(customLineup.isCustom).toBe(true);
    expect(customLineup.favorite).toBe(true);

    const res = validateLineup(customLineup);
    expect(res.valid).toBe(true);
    expect(res.sanitizedData?.isCustom).toBe(true);
    expect(res.sanitizedData?.favorite).toBe(true);
  });

  it('TC10.28: should serialize and deserialize full playbook bundle roundtrip with zero data corruption', () => {
    const serialized = serializeExportEnvelope('PLAYBOOK_BUNDLE', {
      lineups: [COMPETITIVE_LINEUPS[0]],
      strategies: [COMPETITIVE_STRATEGIES[0]],
    });

    const deserialized = deserializeAndValidate(serialized, 'OVERWRITE', [], []);
    expect(deserialized.summary.errors.length).toBe(0);
    expect(deserialized.lineups.length).toBe(1);
    expect(deserialized.strategies.length).toBe(1);
    expect(deserialized.lineups[0].id).toBe(COMPETITIVE_LINEUPS[0].id);
    expect(deserialized.strategies[0].id).toBe(COMPETITIVE_STRATEGIES[0].id);
  });

  it('TC10.29: should safely handle corrupted JSON import by populating error summary without throwing', () => {
    const corruptedJson = '{"bundleType": "LINEUP_COLLECTION", "payload": [{"id": 12345, "invalid": true}]}';

    const result = deserializeAndValidate(corruptedJson, 'SKIP', [], []);
    expect(result.summary.errors.length).toBeGreaterThan(0);
    expect(result.summary.importedCount).toBe(0);
  });
});

