/**
 * Adversarial Test Suite: Milestone 2 Robustness & Stress Hardening
 * File: tests/adversarial-milestone2-challenge.test.ts
 *
 * Targeted Components:
 * 1. src/main/credential-store.ts (ICredentialStore, InMemoryCredentialStore, SafeStorageCredentialStore)
 * 2. src/core/hud-manager/safe-zone-evaluator.ts (SafeZoneEvaluator)
 *
 * Adversarial Verification Domains:
 * - Malformed, non-string, whitespace, special characters, and massive strings (100KB, 250KB, 1MB)
 * - Corrupted ciphertext payloads: invalid prefixes, truncated HMACs, tampered bitflips, unhandled error immunity
 * - State & file purge guarantees via clearApiKey() and removeApiKey()
 * - Concurrency stress: 100+ rapid simultaneous asynchronous save/get/clear calls
 * - HUD Safe-Zone boundary precision: 1080p exact inclusive boundaries (735, 1185, 315, 765), corners, and offsets
 * - Extreme coordinates: negative, out-of-bounds, NaN/Infinity, and high-precision floating point / sub-pixel coordinates
 * - AABB collision checks: zero-dimension, negative-dimension, and screen-spanning bounding boxes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import {
  InMemoryCredentialStore,
  SafeStorageCredentialStore,
  type ICredentialStore,
} from '../src/main/credential-store';
import {
  SafeZoneEvaluator,
  type Point,
  type Rect,
  type ViewportDimensions,
} from '../src/core/hud-manager';

// ============================================================================
// SUITE 1: CREDENTIAL STORE ADVERSARIAL STRESS-TESTS
// ============================================================================

describe('Adversarial Challenge: Credential Store Robustness', () => {
  let store: InMemoryCredentialStore;

  beforeEach(() => {
    store = new InMemoryCredentialStore(null, true);
  });

  // --------------------------------------------------------------------------
  // 1.1 Malformed, Edge-Case, and Massive Key Payloads
  // --------------------------------------------------------------------------
  describe('1.1 Malformed and Extreme Key Payloads', () => {
    it('ADV-CS-01: should reject empty string in saveApiKey() without throwing or corrupting state', async () => {
      const saved = await store.saveApiKey('');
      expect(saved).toBe(false);
      expect(await store.hasApiKey()).toBe(false);
      expect(await store.getApiKey()).toBeNull();
      expect(store.getRawCiphertext()).toBeNull();
    });

    it('ADV-CS-02: should throw explicit Error in storeApiKey() on empty string', async () => {
      await expect(store.storeApiKey('')).rejects.toThrow('API key must not be empty');
      expect(await store.getApiKey()).toBeNull();
    });

    it('ADV-CS-03: should reject all standard ECMAScript whitespace permutations (spaces, tabs, newlines, non-breaking spaces)', async () => {
      const whitespaceVariants = [
        '   ',
        '\t\t\t',
        '\r\n\r\n',
        ' \t \r \n ',
        '\u00A0\u00A0', // Unicode non-breaking space (category Zs)
        '        \n\t        ',
        '\f\v', // form feed and vertical tab
      ];

      for (const ws of whitespaceVariants) {
        await store.clearApiKey();
        const res = await store.saveApiKey(ws);
        expect(res).toBe(false);
        expect(await store.getApiKey()).toBeNull();
      }
    });

    it('ADV-CS-03b: examines zero-width format characters (e.g. \\u200B) behavior in string trimming', async () => {
      // Empirical verification: ECMAScript trim() does NOT strip Unicode category Cf (zero-width space \u200B).
      // If a user inadvertently pastes zero-width spaces, trim() preserves them as non-empty.
      const zwsp = '\u200B\u200B';
      await store.clearApiKey();
      const res = await store.saveApiKey(zwsp);
      expect(res).toBe(true);
      expect(await store.getApiKey()).toBe(zwsp);
    });

    it('ADV-CS-04: should reject null and undefined with type safety casting', async () => {
      expect(await store.saveApiKey(null as unknown as string)).toBe(false);
      expect(await store.saveApiKey(undefined as unknown as string)).toBe(false);
      expect(await store.getApiKey()).toBeNull();

      await expect(store.storeApiKey(null as unknown as string)).rejects.toThrow('API key must not be empty');
      await expect(store.storeApiKey(undefined as unknown as string)).rejects.toThrow('API key must not be empty');
    });

    it('ADV-CS-05: should safely reject primitive and complex non-string types cast as any', async () => {
      const nonStrings = [
        123456,
        true,
        false,
        { key: 'AIzaSyFake' },
        ['AIzaSyKey1', 'AIzaSyKey2'],
        () => 'secret',
        Symbol('key'),
        BigInt(9999999999),
      ];

      for (const item of nonStrings) {
        const saved = await store.saveApiKey(item as unknown as string);
        expect(saved).toBe(false);
        expect(await store.getApiKey()).toBeNull();
      }
    });

    it('ADV-CS-06: should correctly preserve keys containing HMAC separator sequence "::"', async () => {
      // Adversarial payload: internal string contains multiple separator sequences
      const deceptiveKey = 'AIzaSy::Deceptive::Double::Colon::Partition::Token12345';
      const saved = await store.saveApiKey(deceptiveKey);
      expect(saved).toBe(true);

      const recovered = await store.getApiKey();
      expect(recovered).toBe(deceptiveKey);
    });

    it('ADV-CS-07: should preserve keys containing multi-byte Unicode, emojis, and international scripts', async () => {
      const unicodeKey = 'AIzaSy_🔑_CS2Agent_Тактіка_日本語_한국어_العربية_!@#$%^&*()_+~`|}{[]:;?><,./';
      const saved = await store.saveApiKey(unicodeKey);
      expect(saved).toBe(true);

      const recovered = await store.getApiKey();
      expect(recovered).toBe(unicodeKey);
    });

    it('ADV-CS-08: should preserve keys containing control characters and null bytes safely', async () => {
      const controlCharKey = 'AIzaSy_Prefix\x00NullByte\x01\x1FEndToken';
      const saved = await store.saveApiKey(controlCharKey);
      expect(saved).toBe(true);

      const recovered = await store.getApiKey();
      expect(recovered).toBe(controlCharKey);
    });

    it('ADV-CS-09: should handle massive 100KB+ API key payloads without stack overflow or truncation', async () => {
      // 100 KB payload
      const massive100K = 'AIzaSy_' + 'X'.repeat(100 * 1024);
      const start100k = performance.now();
      const saved100k = await store.saveApiKey(massive100K);
      const end100k = performance.now();

      expect(saved100k).toBe(true);
      expect(end100k - start100k).toBeLessThan(1000); // Must complete within 1 second

      const recovered100k = await store.getApiKey();
      expect(recovered100k).not.toBeNull();
      expect(recovered100k!.length).toBe(massive100K.length);
      expect(recovered100k).toBe(massive100K);
    });

    it('ADV-CS-10: should handle ultra-massive 1MB payload without memory corruption', async () => {
      const massive1MB = 'AIzaSy_Mega_' + 'Z'.repeat(1024 * 1024);
      const saved = await store.saveApiKey(massive1MB);
      expect(saved).toBe(true);

      const recovered = await store.getApiKey();
      expect(recovered).toBe(massive1MB);
    });
  });

  // --------------------------------------------------------------------------
  // 1.2 Corrupted Ciphertext Payloads & Tamper Detection
  // --------------------------------------------------------------------------
  describe('1.2 Corrupted Ciphertext Payloads and Tamper Resilience', () => {
    it('ADV-CS-11: should return null without throwing when header prefix is missing or mutated', async () => {
      const malformedHeaders = [
        'PLAINTEXT_SECRET_KEY_EXPOSED',
        'DPAPI_ENC::v2::validlookingpayload', // Future/unknown version
        'DPAPI_ENC::v0::legacy',
        'DPAPI_ENC::',
        'DPAPI_ENC:v1:',
        'dpapi_enc::v1::lowercase',
        'V1::DPAPI_ENC::reversed',
        '',
      ];

      for (const badCipher of malformedHeaders) {
        store.injectCorruptedCiphertext(badCipher);
        expect(await store.getApiKey()).toBeNull();
        expect(await store.hasApiKey()).toBe(false);
      }
    });

    it('ADV-CS-12: should return null when base64 payload is invalid or truncated', async () => {
      const invalidBase64 = [
        'DPAPI_ENC::v1::!@#$%^&*()',
        'DPAPI_ENC::v1::A',
        'DPAPI_ENC::v1::AB',
        'DPAPI_ENC::v1::===',
        'DPAPI_ENC::v1::12 34 56',
      ];

      for (const badCipher of invalidBase64) {
        store.injectCorruptedCiphertext(badCipher);
        expect(await store.getApiKey()).toBeNull();
        expect(await store.hasApiKey()).toBe(false);
      }
    });

    it('ADV-CS-13: should return null when integrity HMAC tag is truncated or corrupted', async () => {
      // Craft a payload where separator exists but HMAC is too short or invalid
      const salt = 'CS2_DPAPI_SIM_SALT_9982';
      const fakePlain = 'short_hmac::my_secret_key';
      const encoded = Buffer.from(fakePlain, 'utf-8').toString('base64');
      const obfuscated = encoded
        .split('')
        .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ (salt.charCodeAt(i % salt.length) & 0x0f)))
        .join('');
      const craftedCipher = `DPAPI_ENC::v1::${Buffer.from(obfuscated, 'utf-8').toString('base64')}`;

      store.injectCorruptedCiphertext(craftedCipher);
      // Integrity check must fail because HMAC is "short_hmac", not true sha256
      expect(await store.getApiKey()).toBeNull();
      expect(await store.hasApiKey()).toBe(false);
    });

    it('ADV-CS-14: should return null when payload has missing separator ("::") entirely', async () => {
      const salt = 'CS2_DPAPI_SIM_SALT_9982';
      const fakePlain = 'noseparatorherejustarawstring';
      const encoded = Buffer.from(fakePlain, 'utf-8').toString('base64');
      const obfuscated = encoded
        .split('')
        .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ (salt.charCodeAt(i % salt.length) & 0x0f)))
        .join('');
      const craftedCipher = `DPAPI_ENC::v1::${Buffer.from(obfuscated, 'utf-8').toString('base64')}`;

      store.injectCorruptedCiphertext(craftedCipher);
      expect(await store.getApiKey()).toBeNull();
      expect(await store.hasApiKey()).toBe(false);
    });

    it('ADV-CS-15: should detect single-bit tampering in valid ciphertext', async () => {
      const validKey = 'AIzaSyA_LegitimateTamperTestKey12345';
      await store.saveApiKey(validKey);

      const originalCipher = store.getRawCiphertext()!;
      expect(originalCipher).not.toBeNull();

      // Mutate a single character in the base64 ciphertext
      const payloadStart = 'DPAPI_ENC::v1::'.length;
      const charToFlip = originalCipher[payloadStart + 5];
      const replacementChar = charToFlip === 'A' ? 'B' : 'A';
      const tamperedCipher =
        originalCipher.substring(0, payloadStart + 5) +
        replacementChar +
        originalCipher.substring(payloadStart + 6);

      store.injectCorruptedCiphertext(tamperedCipher);

      // Decryption or HMAC check must catch tampering and return null
      expect(await store.getApiKey()).toBeNull();
      expect(await store.hasApiKey()).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // 1.3 Key Clear & File Wipe Verification
  // --------------------------------------------------------------------------
  describe('1.3 Clear & Wipe Guarantees (clearApiKey / removeApiKey)', () => {
    it('ADV-CS-16: should completely wipe in-memory state on clearApiKey()', async () => {
      await store.saveApiKey('AIzaSyA_SecretKeyToPurge');
      expect(await store.hasApiKey()).toBe(true);

      const cleared = await store.clearApiKey();
      expect(cleared).toBe(true);
      expect(await store.hasApiKey()).toBe(false);
      expect(await store.getApiKey()).toBeNull();
      expect(store.getRawCiphertext()).toBeNull();

      // Idempotency: second clear call returns true
      expect(await store.clearApiKey()).toBe(true);
      expect(await store.removeApiKey()).toBe(true);
      expect(await store.invalidateApiKey()).toBe(true);
    });

    it('ADV-CS-17: should completely unlink credentials file on SafeStorageCredentialStore.clearApiKey()', async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cs2-cred-test-'));
      const tempFilePath = path.join(tempDir, 'test-credentials.enc');

      try {
        // Write mock encrypted file
        fs.writeFileSync(tempFilePath, Buffer.from('mock_encrypted_data'));
        expect(fs.existsSync(tempFilePath)).toBe(true);

        const safeStore = new SafeStorageCredentialStore(tempFilePath);
        const removed = await safeStore.clearApiKey();

        expect(removed).toBe(true);
        expect(fs.existsSync(tempFilePath)).toBe(false);

        // Calling clear on already deleted file should return true safely
        expect(await safeStore.clearApiKey()).toBe(true);
        expect(await safeStore.getApiKey()).toBeNull();
      } finally {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        if (fs.existsSync(tempDir)) {
          fs.rmdirSync(tempDir);
        }
      }
    });
  });

  // --------------------------------------------------------------------------
  // 1.4 High-Concurrency Stress Testing
  // --------------------------------------------------------------------------
  describe('1.4 High-Concurrency Stress Testing', () => {
    it('ADV-CS-18: should survive 100 rapid concurrent read/write/clear calls without unhandled rejection or deadlock', async () => {
      const operations: Promise<unknown>[] = [];
      const keys = Array.from({ length: 25 }, (_, i) => `AIzaSy_ConcurrentKey_${i}_Token`);

      for (let i = 0; i < 100; i++) {
        const opType = i % 4;
        if (opType === 0) {
          const key = keys[i % keys.length];
          operations.push(store.saveApiKey(key));
        } else if (opType === 1) {
          operations.push(store.getApiKey());
        } else if (opType === 2) {
          operations.push(store.hasApiKey());
        } else {
          operations.push(store.clearApiKey());
        }
      }

      // Execute all 100 operations concurrently
      const results = await Promise.allSettled(operations);

      // Verify none of the 100 promises rejected
      const rejected = results.filter((r) => r.status === 'rejected');
      expect(rejected.length).toBe(0);

      // Verify store is left in a coherent state (either null or valid string)
      const finalKey = await store.getApiKey();
      if (finalKey !== null) {
        expect(typeof finalKey).toBe('string');
        expect(finalKey.startsWith('AIzaSy_ConcurrentKey_')).toBe(true);
      }
    });

    it('ADV-CS-19: should resolve race condition of 50 simultaneous writers to a coherent single key', async () => {
      const writerPromises: Promise<boolean>[] = [];
      for (let i = 0; i < 50; i++) {
        writerPromises.push(store.saveApiKey(`AIzaSy_Writer_${i}`));
      }

      const results = await Promise.all(writerPromises);
      expect(results.every((r) => r === true)).toBe(true);

      const finalKey = await store.getApiKey();
      expect(finalKey).not.toBeNull();
      expect(finalKey).toMatch(/^AIzaSy_Writer_\d+$/);
    });
  });
});

// ============================================================================
// SUITE 2: HUD SAFE-ZONE EVALUATOR ADVERSARIAL STRESS-TESTS
// ============================================================================

describe('Adversarial Challenge: HUD Safe-Zone Evaluator Robustness', () => {
  let evaluator1080p: SafeZoneEvaluator;

  beforeEach(() => {
    evaluator1080p = new SafeZoneEvaluator({ width: 1920, height: 1080 });
  });

  // --------------------------------------------------------------------------
  // 2.1 Boundary Edge Coordinates (Inclusive Boundaries on 1080p)
  // --------------------------------------------------------------------------
  describe('2.1 Boundary Edge Coordinates (Inclusive Verification)', () => {
    // 1080p Center is (960, 540). Crosshair is 450x450 centered.
    // X span: [960 - 225, 960 + 225] = [735, 1185]
    // Y span: [540 - 225, 540 + 225] = [315, 765]

    it('ADV-HZ-01: should treat all four exact edge coordinates as obstructed (inclusive boundaries)', () => {
      // Left edge at x=735, centered y=540
      const leftEdge = evaluator1080p.evaluateCoordinate({ x: 735, y: 540 });
      expect(leftEdge.obstructed).toBe(true);
      expect(leftEdge.collidingZones).toContain('CROSSHAIR');

      // Right edge at x=1185, centered y=540
      const rightEdge = evaluator1080p.evaluateCoordinate({ x: 1185, y: 540 });
      expect(rightEdge.obstructed).toBe(true);
      expect(rightEdge.collidingZones).toContain('CROSSHAIR');

      // Top edge at y=315, centered x=960
      const topEdge = evaluator1080p.evaluateCoordinate({ x: 960, y: 315 });
      expect(topEdge.obstructed).toBe(true);
      expect(topEdge.collidingZones).toContain('CROSSHAIR');

      // Bottom edge at y=765, centered x=960
      const bottomEdge = evaluator1080p.evaluateCoordinate({ x: 960, y: 765 });
      expect(bottomEdge.obstructed).toBe(true);
      expect(bottomEdge.collidingZones).toContain('CROSSHAIR');
    });

    it('ADV-HZ-02: should treat all four exact vertex corners of Crosshair zone as obstructed', () => {
      const corners: Point[] = [
        { x: 735, y: 315 }, // Top-Left
        { x: 1185, y: 315 }, // Top-Right
        { x: 735, y: 765 }, // Bottom-Left
        { x: 1185, y: 765 }, // Bottom-Right
      ];

      for (const corner of corners) {
        const evalRes = evaluator1080p.evaluateCoordinate(corner);
        expect(evalRes.obstructed).toBe(true);
        expect(evalRes.collidingZones).toContain('CROSSHAIR');
      }
    });

    it('ADV-HZ-03: should treat coordinates 1-pixel outside boundaries as unobstructed', () => {
      expect(evaluator1080p.evaluateCoordinate({ x: 734, y: 540 }).obstructed).toBe(false);
      expect(evaluator1080p.evaluateCoordinate({ x: 1186, y: 540 }).obstructed).toBe(false);
      expect(evaluator1080p.evaluateCoordinate({ x: 960, y: 314 }).obstructed).toBe(false);
      expect(evaluator1080p.evaluateCoordinate({ x: 960, y: 766 }).obstructed).toBe(false);

      // Corner diagonals 1 pixel outside
      expect(evaluator1080p.evaluateCoordinate({ x: 734, y: 314 }).obstructed).toBe(false);
      expect(evaluator1080p.evaluateCoordinate({ x: 1186, y: 314 }).obstructed).toBe(false);
      expect(evaluator1080p.evaluateCoordinate({ x: 734, y: 766 }).obstructed).toBe(false);
      expect(evaluator1080p.evaluateCoordinate({ x: 1186, y: 766 }).obstructed).toBe(false);
    });

    it('ADV-HZ-04: should treat Radar zone [0..320, 0..320] boundaries inclusively', () => {
      // Boundaries
      expect(evaluator1080p.evaluateCoordinate({ x: 0, y: 0 }).obstructed).toBe(true);
      expect(evaluator1080p.evaluateCoordinate({ x: 320, y: 320 }).obstructed).toBe(true);
      expect(evaluator1080p.evaluateCoordinate({ x: 320, y: 0 }).obstructed).toBe(true);
      expect(evaluator1080p.evaluateCoordinate({ x: 0, y: 320 }).obstructed).toBe(true);

      // 1 pixel outside
      expect(evaluator1080p.evaluateCoordinate({ x: 321, y: 160 }).obstructed).toBe(false);
      expect(evaluator1080p.evaluateCoordinate({ x: 160, y: 321 }).obstructed).toBe(false);
    });

    it('ADV-HZ-05: should treat Killfeed zone [1520..1920, 0..200] boundaries inclusively', () => {
      expect(evaluator1080p.evaluateCoordinate({ x: 1520, y: 0 }).obstructed).toBe(true);
      expect(evaluator1080p.evaluateCoordinate({ x: 1920, y: 0 }).obstructed).toBe(true);
      expect(evaluator1080p.evaluateCoordinate({ x: 1520, y: 200 }).obstructed).toBe(true);
      expect(evaluator1080p.evaluateCoordinate({ x: 1920, y: 200 }).obstructed).toBe(true);

      // 1 pixel outside
      expect(evaluator1080p.evaluateCoordinate({ x: 1519, y: 100 }).obstructed).toBe(false);
      expect(evaluator1080p.evaluateCoordinate({ x: 1700, y: 201 }).obstructed).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // 2.2 Negative, Out-of-Bounds & Floating Point Coordinates
  // --------------------------------------------------------------------------
  describe('2.2 Negative, Out-of-Bounds, and Floating-Point Coordinates', () => {
    it('ADV-HZ-06: should evaluate negative coordinates as unobstructed without crashing', () => {
      const negativeCoords: Point[] = [
        { x: -1, y: -1 },
        { x: -100, y: 500 },
        { x: 960, y: -50 },
        { x: -1920, y: -1080 },
        { x: -735, y: -315 },
      ];

      for (const pt of negativeCoords) {
        const res = evaluator1080p.evaluateCoordinate(pt);
        expect(res.obstructed).toBe(false);
        expect(res.collidingZones).toEqual([]);
      }
    });

    it('ADV-HZ-07: should evaluate out-of-bounds coordinates cleanly', () => {
      const outOfBounds: Point[] = [
        { x: 1921, y: 540 },
        { x: 960, y: 1081 },
        { x: 5000, y: 5000 },
        { x: 1000000, y: 1000000 },
      ];

      for (const pt of outOfBounds) {
        const res = evaluator1080p.evaluateCoordinate(pt);
        expect(res.obstructed).toBe(false);
        expect(res.collidingZones).toEqual([]);
      }
    });

    it('ADV-HZ-08: should handle non-finite IEEE 754 numbers (NaN, Infinity, -Infinity) gracefully', () => {
      const nonFinitePoints: Point[] = [
        { x: NaN, y: 540 },
        { x: 960, y: NaN },
        { x: NaN, y: NaN },
        { x: Infinity, y: 540 },
        { x: 960, y: -Infinity },
        { x: Infinity, y: Infinity },
      ];

      for (const pt of nonFinitePoints) {
        const res = evaluator1080p.evaluateCoordinate(pt);
        expect(res.obstructed).toBe(false);
        expect(res.collidingZones).toEqual([]);
      }
    });

    it('ADV-HZ-09: should evaluate high-precision floating point / sub-pixel coordinates around edges', () => {
      const eps = 0.0001;

      // Immediately inside boundaries
      expect(evaluator1080p.evaluateCoordinate({ x: 735 + eps, y: 540 }).obstructed).toBe(true);
      expect(evaluator1080p.evaluateCoordinate({ x: 1185 - eps, y: 540 }).obstructed).toBe(true);
      expect(evaluator1080p.evaluateCoordinate({ x: 960, y: 315 + eps }).obstructed).toBe(true);
      expect(evaluator1080p.evaluateCoordinate({ x: 960, y: 765 - eps }).obstructed).toBe(true);

      // Immediately outside boundaries
      expect(evaluator1080p.evaluateCoordinate({ x: 735 - eps, y: 540 }).obstructed).toBe(false);
      expect(evaluator1080p.evaluateCoordinate({ x: 1185 + eps, y: 540 }).obstructed).toBe(false);
      expect(evaluator1080p.evaluateCoordinate({ x: 960, y: 315 - eps }).obstructed).toBe(false);
      expect(evaluator1080p.evaluateCoordinate({ x: 960, y: 765 + eps }).obstructed).toBe(false);
    });

    it('ADV-HZ-10: should scale accurately with odd/fractional viewport dimensions (1921x1081)', () => {
      const oddEvaluator = new SafeZoneEvaluator({ width: 1921, height: 1081 });
      // Center: (960.5, 540.5)
      // Crosshair: [960.5 - 225, 540.5 - 225] = [735.5, 315.5] to [1185.5, 765.5]
      const exactCenter = oddEvaluator.evaluateCoordinate({ x: 960.5, y: 540.5 });
      expect(exactCenter.obstructed).toBe(true);
      expect(exactCenter.collidingZones).toContain('CROSSHAIR');

      const edgePt = oddEvaluator.evaluateCoordinate({ x: 735.5, y: 540.5 });
      expect(edgePt.obstructed).toBe(true);

      const outsidePt = oddEvaluator.evaluateCoordinate({ x: 735.49, y: 540.5 });
      expect(outsidePt.obstructed).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // 2.3 AABB Collision Checks: Zero-Dimension, Negative-Dimension, Screen-Spanning
  // --------------------------------------------------------------------------
  describe('2.3 AABB Collision Checks with Zero, Negative, and Screen-Spanning Dimensions', () => {
    it('ADV-HZ-11: should evaluate zero-dimension rects inside safe zones correctly', () => {
      // Point strictly inside crosshair represented as 0x0 rect
      const zeroRectInside: Rect = { x: 960, y: 540, width: 0, height: 0 };
      const resInside = evaluator1080p.evaluateRect(zeroRectInside);
      // In AABB: rect.x < b.x + b.width (960 < 1185 = true)
      //          rect.x + rect.width > b.x (960 + 0 > 735 = true)
      //          rect.y < b.y + b.height (540 < 765 = true)
      //          rect.y + rect.height > b.y (540 + 0 > 315 = true)
      expect(resInside.obstructed).toBe(true);
      expect(resInside.collidingZones).toContain('CROSSHAIR');

      // Zero-dimension rect outside crosshair
      const zeroRectOutside: Rect = { x: 500, y: 500, width: 0, height: 0 };
      const resOutside = evaluator1080p.evaluateRect(zeroRectOutside);
      expect(resOutside.obstructed).toBe(false);
      expect(resOutside.collidingZones).toEqual([]);
    });

    it('ADV-HZ-12: should detect full screen-spanning rect collision across all 3 safe zones simultaneously', () => {
      const fullScreenRect: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
      const res = evaluator1080p.evaluateRect(fullScreenRect);

      expect(res.obstructed).toBe(true);
      expect(res.collidingZones).toHaveLength(3);
      expect(res.collidingZones).toContain('CROSSHAIR');
      expect(res.collidingZones).toContain('RADAR');
      expect(res.collidingZones).toContain('KILLFEED');
    });

    it('ADV-HZ-13: should detect giant oversized screen-spanning rect collision across all 3 safe zones', () => {
      const giantRect: Rect = { x: -10000, y: -10000, width: 50000, height: 50000 };
      const res = evaluator1080p.evaluateRect(giantRect);

      expect(res.obstructed).toBe(true);
      expect(res.collidingZones).toContain('CROSSHAIR');
      expect(res.collidingZones).toContain('RADAR');
      expect(res.collidingZones).toContain('KILLFEED');
    });

    it('ADV-HZ-14: should correctly identify horizontal and vertical spanning strips colliding only with target zones', () => {
      // Horizontal strip across center (y: 500..550, full width 0..1920)
      // Hits Crosshair, but avoids Radar (y: 0..320) and Killfeed (y: 0..200)
      const centerHorizontalStrip: Rect = { x: 0, y: 500, width: 1920, height: 50 };
      const horizRes = evaluator1080p.evaluateRect(centerHorizontalStrip);
      expect(horizRes.obstructed).toBe(true);
      expect(horizRes.collidingZones).toEqual(['CROSSHAIR']);

      // Top strip across width (y: 0..50, full width 0..1920)
      // Hits Radar and Killfeed, but avoids Crosshair (y: 315..765)
      const topHorizontalStrip: Rect = { x: 0, y: 0, width: 1920, height: 50 };
      const topRes = evaluator1080p.evaluateRect(topHorizontalStrip);
      expect(topRes.obstructed).toBe(true);
      expect(topRes.collidingZones).toContain('RADAR');
      expect(topRes.collidingZones).toContain('KILLFEED');
      expect(topRes.collidingZones).not.toContain('CROSSHAIR');
    });

    it('ADV-HZ-15: should verify tangent boundary touching rects (0 overlapping area) are unobstructed', () => {
      // A widget whose right edge touches Crosshair left edge (x: 635, width: 100 -> right edge = 735)
      // Standard AABB overlap requires strictly positive area (rect.x + rect.width > b.x)
      const tangentLeftWidget: Rect = { x: 635, y: 400, width: 100, height: 100 };
      const tangentRes = evaluator1080p.evaluateRect(tangentLeftWidget);
      expect(tangentRes.obstructed).toBe(false);

      // Overlap by 1 pixel (x: 636, width: 100 -> right edge = 736 > 735)
      const overlappingWidget: Rect = { x: 636, y: 400, width: 100, height: 100 };
      const overlapRes = evaluator1080p.evaluateRect(overlappingWidget);
      expect(overlapRes.obstructed).toBe(true);
      expect(overlapRes.collidingZones).toContain('CROSSHAIR');
    });

    it('ADV-HZ-16: should evaluate negative-dimension (inverted) bounding boxes and document behavior', () => {
      // Case A: Inverted box strictly contained inside Crosshair zone
      // x=1000, width=-100 (spans [900, 1000]); y=600, height=-100 (spans [500, 600])
      const containedInverted: Rect = { x: 1000, y: 600, width: -100, height: -100 };
      const resA = evaluator1080p.evaluateRect(containedInverted);
      // Mathematical trace:
      // rect.x < b.x + b.width: 1000 < 1185 (T)
      // rect.x + rect.width > b.x: 1000 - 100 = 900 > 735 (T)
      // rect.y < b.y + b.height: 600 < 765 (T)
      // rect.y + rect.height > b.y: 600 - 100 = 500 > 315 (T)
      // Result: Evaluates to obstructed = true
      expect(resA.obstructed).toBe(true);
      expect(resA.collidingZones).toContain('CROSSHAIR');

      // Case B: Straddling inverted box with non-normalized dimensions
      // x=800, width=-100 (spans [700, 800]). Physical overlap with [735, 1185] is [735, 800].
      // In unnormalized AABB: rect.x + rect.width = 700. Condition: 700 > 735 evaluates to FALSE!
      const straddlingInverted: Rect = { x: 800, y: 500, width: -100, height: 50 };
      const resB = evaluator1080p.evaluateRect(straddlingInverted);
      // Empirical verification: Unnormalized AABB requires normalized rects (width > 0)
      // Documenting exact behavior:
      expect(resB.obstructed).toBe(false); // Demonstrates unnormalized rect boundary behavior
    });
  });
});
