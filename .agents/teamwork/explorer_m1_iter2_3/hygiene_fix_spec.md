# Specification: Git Hygiene & Vitest Suite Alignment

**Author**: `explorer_m1_iter2_3` (teamwork_preview_explorer)  
**Milestone**: Milestone 1, Iteration 2 (Git Hygiene & Vitest Suite Alignment)  
**Target Repository**: `c:\Users\conta\Desktop\CS2Agent`  
**Date**: 2026-10-19  

---

## 1. Executive Summary

This specification addresses two critical pipeline and repository defects identified during Milestone 1 verification:

1. **Git Repository Working Tree Dirtying**:
   - Running the standalone E2E test runner (`node --experimental-strip-types tests/e2e/runner.ts`) updates `tests/e2e/reports/e2e-summary.json` with execution timestamps and durations.
   - The report file `tests/e2e/reports/e2e-summary.json` was committed to the Git index in commit `0e1ddcdb9f66b4d7e6549ca00a636894c3ec3047`.
   - `.gitignore` (lines 70–79) omitted `tests/e2e/reports/`.
   - Because Git tracks files already in the index regardless of `.gitignore` updates, both an update to `.gitignore` and an explicit index untrack (`git rm --cached`) are required to achieve a clean working tree.

2. **Vitest Suite Misalignment (`tests/adversarial-compliance-challenge.test.ts`)**:
   - `challenger_m1_1` created `tests/adversarial-compliance-challenge.test.ts` with 4 test blocks written as **exploit demonstrators** ("EMPIRICAL FINDING...") that assert the existence of vulnerabilities:
     - Prototype lookup crashes with `TypeError` (`expect(threwTypeError).toBe(true)`).
     - Prototype pollution leaks permission to arbitrary features (`expect(permitted).toBe(true)`).
     - `COMPLIANCE_MATRIX` is shallowly frozen and mutable in-memory (`expect(isFrozen(memoryReadingRule)).toBe(false)`).
     - Anti-claim scanner fails to catch obfuscated/spaced banned claims (`expect(result.clean).toBe(true)`).
   - When `challenger_m1_2` attempted to run assertions expecting hardened behavior (`assertFeaturePermitted('toString')` throwing `ComplianceViolationError`), the unhardened code threw an unhandled `TypeError: Cannot read properties of undefined (reading 'includes')`, failing Vitest with:
     ```
     AssertionError: expected TypeError: Cannot read properties of undefined (reading 'includes') to be an instance of ComplianceViolationError
     ```
   - Once the Capability Gating Engine and Anti-Claim Scanner are hardened by `worker_m1_1` (following specs from `explorer_m1_iter2_1` and `explorer_m1_iter2_2`), the exploit demonstrator tests will fail because the vulnerabilities are fixed.
   - To achieve a **100% pass rate** under `npm test` while continuously guarding against regressions, `tests/adversarial-compliance-challenge.test.ts` must be converted from vulnerability-prover tests into a hardened invariant contract test suite.

---

## 2. Part 1: Git Hygiene & Untracking Specification

### 2.1 Problem Diagnosis & Evidence

- **Runner Report Generation**: In `tests/e2e/runner.ts` lines 701–710:
  ```typescript
  const reportsDir = path.resolve(process.cwd(), 'tests', 'e2e', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  fs.writeFileSync(path.join(reportsDir, 'e2e-summary.json'), JSON.stringify(report, null, 2), 'utf-8');
  ```
  Every execution writes new `timestamp` (ISO-8601 string) and `durationMs` numbers into `tests/e2e/reports/e2e-summary.json`.

- **Git Index State**:
  ```powershell
  git log -n 1 --oneline tests/e2e/reports/e2e-summary.json
  # Output: 0e1ddcd feat(m1): initialize cs2-assistant repository, compliance engine, and tooling
  ```
  The file is currently tracked in Git history.

- **Ignore Rule Check**:
  ```powershell
  git check-ignore -v tests/e2e/reports/e2e-summary.json
  # Exit code 1 (file is not ignored)
  ```

- **Working Tree State**:
  ```powershell
  git status --porcelain
  # Output includes: M tests/e2e/reports/e2e-summary.json
  ```

### 2.2 Exact `.gitignore` Changes

In `c:\Users\conta\Desktop\CS2Agent\.gitignore`, locate the `# Testing & Code Coverage` section (lines 70–79):

```diff
 # ------------------------------------------------------------------------------
 # Testing & Code Coverage
 # ------------------------------------------------------------------------------
 coverage/
 .nyc_output/
 test-results/
 playwright-report/
 cypress/videos/
 cypress/screenshots/
+tests/e2e/reports/
```

Adding `tests/e2e/reports/` with a trailing slash ensures that:
1. The `tests/e2e/reports/` directory and all files inside it (`e2e-summary.json`, any future `.html` or `.json` artifacts) are ignored.
2. Wildcard test report variations in subdirectories are safely ignored.

### 2.3 Exact Git Untracking Commands

Because `tests/e2e/reports/e2e-summary.json` is already tracked in the Git index, simply editing `.gitignore` will NOT ignore future modifications to this file. The file must be untracked from the index cache:

```powershell
# Step 1: Remove e2e-summary.json from Git tracking index without deleting disk file
git rm --cached tests/e2e/reports/e2e-summary.json

# Step 2: Stage the updated .gitignore
git add .gitignore

# Step 3: Verify with git check-ignore that the file is now actively ignored
git check-ignore -v tests/e2e/reports/e2e-summary.json
# Expected output: .gitignore:80:tests/e2e/reports/ tests/e2e/reports/e2e-summary.json

# Step 4: Re-run runner.ts and confirm zero working tree modifications
node --experimental-strip-types tests/e2e/runner.ts
git status --porcelain
# Expected output:
# D  tests/e2e/reports/e2e-summary.json  (staged deletion from git index)
# M  .gitignore                          (staged or unstaged modification)
# No unstacked/dirty tests/e2e/reports/ modifications!
```

---

## 3. Part 2: Vitest Test Suite Alignment Specification

### 3.1 Root Cause of Assertion Failures

There are four specific test areas in `tests/adversarial-compliance-challenge.test.ts` where the test assertions conflict with the hardened implementation:

| Test Area | Challenger 1_1 Version (Vulnerability Prover) | Hardened Behavior (Post-Fix) | Aligned Test Assertion |
|-----------|-----------------------------------------------|------------------------------|------------------------|
| **1. Prototype Property Lookup** (`toString`, `valueOf`, etc.) | Expected unhandled `TypeError: Cannot read properties of undefined (reading 'includes')` (`expect(threwTypeError).toBe(true)`) | Returns `false` on `isFeaturePermitted(prop)`; returns `{ permitted: false, status: 'UNKNOWN' }` on `evaluateCapability(prop)`; throws `ComplianceViolationError` on `assertFeaturePermitted(prop)` | Assert NO `TypeError` crash; assert `isFeaturePermitted(prop) === false`; assert `assertFeaturePermitted(prop)` throws `ComplianceViolationError` |
| **2. Prototype Pollution** (`Object.prototype[exploit] = ...`) | Expected permission leakage (`expect(permitted).toBe(true)`) | `Object.prototype.hasOwnProperty.call` rejects polluted properties; returns `false` | Assert `isFeaturePermitted(exploit) === false`; assert `assertFeaturePermitted(exploit)` throws `ComplianceViolationError` |
| **3. Immutability & Deep Freeze** (`COMPLIANCE_MATRIX`) | Expected shallow freeze (`expect(isFrozen(memoryReadingRule)).toBe(false)`) and allowed in-memory mutation of `memory_reading` | `deepFreeze()` freezes all rules and environment arrays; mutation throws `TypeError` in strict mode | Assert `Object.isFrozen(rule) === true` and `Object.isFrozen(rule.permittedEnvironments) === true`; assert mutation is blocked; assert `gate.isFeaturePermitted('memory_reading') === false` |
| **4. Anti-Claim Scanner Evasion** (`v a c - p r o o f`, etc.) | Expected evasion to succeed (`expect(result.clean).toBe(true)`) | Hardened multi-pass normalization catches evasions (`result.clean === false`) | Assert `result.clean === false` and `result.violations.length > 0` |

### 3.2 Detailed Transformation for Each Test Block

#### Block 1: Prototype Property Lookup (lines 29–63)

**Current Code (Vulnerability Prover)**:
```typescript
it('EMPIRICAL FINDING: Prototype property lookup crashes with unhandled TypeError instead of fail-safe closing', () => {
  const gate = createCapabilityGate('COMPETITIVE_PROTECTED');

  for (const prop of prototypeProps) {
    let threwTypeError = false;
    let errorMessage = '';

    try {
      gate.isFeaturePermitted(prop);
    } catch (err: any) {
      if (err instanceof TypeError && err.message.includes('includes')) {
        threwTypeError = true;
        errorMessage = err.message;
      }
    }

    expect(threwTypeError).toBe(true);
    expect(errorMessage).toContain("reading 'includes'");
  }
});
```

**Aligned Hardened Test Specification**:
```typescript
it('should safely deny prototype properties without TypeError crash and throw ComplianceViolationError on assertFeaturePermitted', () => {
  const gate = createCapabilityGate('COMPETITIVE_PROTECTED');

  for (const prop of prototypeProps) {
    // 1. isFeaturePermitted must return false cleanly without throwing any TypeError
    let permitted: boolean;
    expect(() => {
      permitted = gate.isFeaturePermitted(prop);
    }).not.toThrow();
    expect(gate.isFeaturePermitted(prop)).toBe(false);

    // 2. evaluateCapability must return fail-safe closed UNKNOWN evaluation
    const evalResult = gate.evaluateCapability(prop);
    expect(evalResult.permitted).toBe(false);
    expect(evalResult.status).toBe('UNKNOWN');
    expect(evalResult.reason).toContain('fail-safe closed');

    // 3. assertFeaturePermitted must throw ComplianceViolationError (never TypeError)
    expect(() => gate.assertFeaturePermitted(prop)).toThrow(ComplianceViolationError);
    try {
      gate.assertFeaturePermitted(prop);
    } catch (err: any) {
      expect(err).toBeInstanceOf(ComplianceViolationError);
      expect(err.name).toBe('ComplianceViolationError');
      expect(err.featureId).toBe(prop);
    }
  }
});
```

#### Block 2: Prototype Pollution (lines 65–93)

**Current Code (Vulnerability Prover)**:
```typescript
it('EMPIRICAL FINDING: Prototype pollution leaks permissions to arbitrary injected capabilities', () => {
  const gate = createCapabilityGate('COMPETITIVE_PROTECTED');
  const exploitFeature = 'unauthorized_kernel_driver_exploit_' + Date.now();

  try {
    (Object.prototype as any)[exploitFeature] = {
      id: exploitFeature,
      name: 'Kernel Driver Exploit',
      status: 'VERIFIED_PERMITTED',
      category: 'PROHIBITED_CHEATING',
      description: 'Exploit injected via Object.prototype pollution',
      permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
      enforcement: 'None',
      authorityJustification: 'None',
    };

    const permitted = gate.isFeaturePermitted(exploitFeature);
    const evalResult = gate.evaluateCapability(exploitFeature);

    expect(permitted).toBe(true);
    expect(evalResult.permitted).toBe(true);
    expect(evalResult.status).toBe('VERIFIED_PERMITTED');
  } finally {
    delete (Object.prototype as any)[exploitFeature];
  }
});
```

**Aligned Hardened Test Specification**:
```typescript
it('should resist prototype pollution and deny arbitrary capabilities injected via Object.prototype', () => {
  const gate = createCapabilityGate('COMPETITIVE_PROTECTED');
  const exploitFeature = 'unauthorized_kernel_driver_exploit_' + Date.now();

  try {
    // Attacker pollutes Object.prototype
    (Object.prototype as any)[exploitFeature] = {
      id: exploitFeature,
      name: 'Kernel Driver Exploit',
      status: 'VERIFIED_PERMITTED',
      category: 'PROHIBITED_CHEATING',
      description: 'Exploit injected via Object.prototype pollution',
      permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
      enforcement: 'None',
      authorityJustification: 'None',
    };

    // Hardened gate uses Object.prototype.hasOwnProperty.call, rejecting polluted prototype properties
    const permitted = gate.isFeaturePermitted(exploitFeature);
    const evalResult = gate.evaluateCapability(exploitFeature);

    expect(permitted).toBe(false);
    expect(evalResult.permitted).toBe(false);
    expect(evalResult.status).toBe('UNKNOWN');
    expect(evalResult.reason).toContain('fail-safe closed');

    // assertFeaturePermitted must throw ComplianceViolationError
    expect(() => gate.assertFeaturePermitted(exploitFeature)).toThrow(ComplianceViolationError);
  } finally {
    delete (Object.prototype as any)[exploitFeature];
  }
});
```

#### Block 3: Deep Freeze Immutability (lines 95–131)

**Current Code (Vulnerability Prover)**:
```typescript
it('EMPIRICAL FINDING: COMPLIANCE_MATRIX is only shallowly frozen, allowing in-memory mutation of prohibited capabilities', () => {
  const gate = createCapabilityGate('COMPETITIVE_PROTECTED');

  expect(Object.isFrozen(COMPLIANCE_MATRIX)).toBe(true);
  const memoryReadingRule = COMPLIANCE_MATRIX.memory_reading;
  expect(Object.isFrozen(memoryReadingRule)).toBe(false);
  expect(Object.isFrozen(memoryReadingRule.permittedEnvironments)).toBe(false);
  // ... mutated memory_reading and asserted permitted === true ...
});
```

**Aligned Hardened Test Specification**:
```typescript
it('should enforce deep immutability across COMPLIANCE_MATRIX, nested rule objects, and environment arrays', () => {
  const gate = createCapabilityGate('COMPETITIVE_PROTECTED');

  // 1. Root dictionary is frozen
  expect(Object.isFrozen(COMPLIANCE_MATRIX)).toBe(true);

  // 2. All nested rule objects and permittedEnvironments arrays are deeply frozen
  const rules = getAllComplianceRules();
  expect(rules.length).toBeGreaterThan(0);

  for (const rule of rules) {
    expect(Object.isFrozen(rule)).toBe(true);
    expect(Object.isFrozen(rule.permittedEnvironments)).toBe(true);
  }

  // 3. Attempting mutation of prohibited capability throws in strict mode or fails silently
  const memoryReadingRule = COMPLIANCE_MATRIX.memory_reading;
  expect(() => {
    (memoryReadingRule as any).status = 'VERIFIED_PERMITTED';
  }).toThrow(TypeError);

  expect(() => {
    (memoryReadingRule.permittedEnvironments as any).push('COMPETITIVE_PROTECTED');
  }).toThrow(TypeError);

  // 4. Prohibited capability remains strictly denied
  expect(gate.isFeaturePermitted('memory_reading')).toBe(false);
  expect(gate.getPermittedFeatures()).not.toContain('memory_reading');

  const evaluation = gate.evaluateCapability('memory_reading');
  expect(evaluation.permitted).toBe(false);
  expect(evaluation.status).toBe('PROHIBITED');
});
```

#### Block 4: Additional Prohibited Concepts (lines 304–350)

In `Adversarial Challenge 4`, `additionalProhibitedConcepts` contains:
```typescript
const additionalProhibitedConcepts = [
  'process_concealment',
  'unauthorized_hooks',
  'unauthorized_scraping',
];
```
Once `explorer_m1_iter2_1` and `worker_m1_1` add these entries directly to `COMPLIANCE_MATRIX` with `status: 'PROHIBITED'`:
- The test `expect(['PROHIBITED', 'UNKNOWN']).toContain(evaluation.status)` continues to pass.
- In addition, they can be included in `prohibitedMatrixFeatures`:
```typescript
const prohibitedMatrixFeatures = [
  'memory_reading',
  'dll_injection',
  'graphics_pipeline_hooking',
  'input_automation',
  'jumpthrow_recoil_macros',
  'esp_wallhack_overlay',
  'aim_assistance_triggerbot',
  'spectator_data_mining',
  'unauthorized_web_scraping',
  'process_concealment',
  'unauthorized_hooks',
  'unauthorized_scraping',
];
```
This guarantees that all 12 prohibited features have `status === 'PROHIBITED'`, an empty `permittedEnvironments` array, and throw `ComplianceViolationError` across all three environments (`COMPETITIVE_PROTECTED`, `PRACTICE_SERVER`, `SIMULATION_PREVIEW`).

#### Block 5: Anti-Claim Scanner Evasion (lines 527–542)

**Current Code (Vulnerability Prover)**:
```typescript
it('EMPIRICAL FINDING: Anti-claim scanner fails to catch obfuscated/spaced banned claims', () => {
  const evasions = [
    'Our companion is v a c - p r o o f and safe.',
    'Guaranteed vac_proof architecture.',
    'Completely 100%_vac_safe for competitive.',
    'We are officially\nvalve\napproved by organizers.',
    'Zero risk vac\u200Bproof design.',
  ];

  for (const evasion of evasions) {
    const result = scanTextForAntiClaimViolations(evasion);
    expect(result.clean).toBe(true);
  }
});
```

**Aligned Hardened Test Specification**:
```typescript
it('should detect obfuscated, spaced, and delimited banned marketing claims (hardened anti-claim scanner)', () => {
  const evasions = [
    'Our companion is v a c - p r o o f and safe.',
    'Guaranteed vac_proof architecture.',
    'Completely 100%_vac_safe for competitive.',
    'We are officially\nvalve\napproved by organizers.',
    'Zero risk vac\u200Bproof design.',
    'We are officially-valve-approved by partners.',
    '100% vac-safe guarantees.',
    'v@c-pr00f companion.',
    'anti-vac bypass',
    'a n t i - v a c engine',
  ];

  for (const evasion of evasions) {
    const result = scanTextForAntiClaimViolations(evasion);
    expect(result.clean).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  }
});
```

---

## 4. Full File Replacement Spec for `tests/adversarial-compliance-challenge.test.ts`

The complete updated test file is provided below for direct application by the worker/implementer:

```typescript
/**
 * Adversarial Compliance Challenge & Stress Test Suite
 *
 * Authored by: challenger_m1_1 (Empirical Challenger)
 * Hardened & Aligned by: explorer_m1_iter2_3 & worker_m1_1
 * Target: src/core/compliance/ (CapabilityGate, COMPLIANCE_MATRIX, Anti-Claim Scanner)
 *
 * Evaluates the hardened compliance gating engine under hostile inputs, prototype pollution,
 * deep freeze immutability, casing/malformed inputs, and listener stress.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  createCapabilityGate,
  CapabilityGate,
  ComplianceViolationError,
} from '../src/core/compliance/capability-gate';
import {
  COMPLIANCE_MATRIX,
  getComplianceRule,
  getAllComplianceRules,
  getRulesByStatus,
  getRulesByEnvironment,
  validateMatrixIntegrity,
  scanTextForAntiClaimViolations,
  BANNED_MARKETING_PHRASES,
} from '../src/core/compliance/compliance-matrix';
import { EnvironmentMode, ComplianceFeatureId } from '../src/core/compliance/types';

describe('Adversarial Challenge 1: Prototype Property Exposure & Prototype Pollution', () => {
  const prototypeProps = [
    'toString',
    'valueOf',
    'constructor',
    '__proto__',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'toLocaleString',
  ];

  it('should safely deny prototype properties without TypeError crash and throw ComplianceViolationError on assertFeaturePermitted', () => {
    const gate = createCapabilityGate('COMPETITIVE_PROTECTED');

    for (const prop of prototypeProps) {
      // 1. isFeaturePermitted must return false cleanly without throwing any TypeError
      let permitted: boolean = true;
      expect(() => {
        permitted = gate.isFeaturePermitted(prop);
      }).not.toThrow();
      expect(permitted).toBe(false);

      // 2. evaluateCapability must return fail-safe closed UNKNOWN evaluation
      const evalResult = gate.evaluateCapability(prop);
      expect(evalResult.permitted).toBe(false);
      expect(evalResult.status).toBe('UNKNOWN');
      expect(evalResult.reason).toContain('fail-safe closed');

      // 3. assertFeaturePermitted must throw ComplianceViolationError (never TypeError)
      expect(() => gate.assertFeaturePermitted(prop)).toThrow(ComplianceViolationError);
      try {
        gate.assertFeaturePermitted(prop);
      } catch (err: any) {
        expect(err).toBeInstanceOf(ComplianceViolationError);
        expect(err.name).toBe('ComplianceViolationError');
        expect(err.featureId).toBe(prop);
      }
    }
  });

  it('should resist prototype pollution and deny arbitrary capabilities injected via Object.prototype', () => {
    const gate = createCapabilityGate('COMPETITIVE_PROTECTED');
    const exploitFeature = 'unauthorized_kernel_driver_exploit_' + Date.now();

    try {
      // Attacker pollutes Object.prototype
      (Object.prototype as any)[exploitFeature] = {
        id: exploitFeature,
        name: 'Kernel Driver Exploit',
        status: 'VERIFIED_PERMITTED',
        category: 'PROHIBITED_CHEATING',
        description: 'Exploit injected via Object.prototype pollution',
        permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
        enforcement: 'None',
        authorityJustification: 'None',
      };

      // Hardened gate uses Object.prototype.hasOwnProperty.call, rejecting polluted prototype properties
      const permitted = gate.isFeaturePermitted(exploitFeature);
      const evalResult = gate.evaluateCapability(exploitFeature);

      expect(permitted).toBe(false);
      expect(evalResult.permitted).toBe(false);
      expect(evalResult.status).toBe('UNKNOWN');
      expect(evalResult.reason).toContain('fail-safe closed');

      // assertFeaturePermitted must throw ComplianceViolationError
      expect(() => gate.assertFeaturePermitted(exploitFeature)).toThrow(ComplianceViolationError);
    } finally {
      delete (Object.prototype as any)[exploitFeature];
    }
  });

  it('should enforce deep immutability across COMPLIANCE_MATRIX, nested rule objects, and environment arrays', () => {
    const gate = createCapabilityGate('COMPETITIVE_PROTECTED');

    // 1. Root dictionary is frozen
    expect(Object.isFrozen(COMPLIANCE_MATRIX)).toBe(true);

    // 2. All nested rule objects and permittedEnvironments arrays are deeply frozen
    const rules = getAllComplianceRules();
    expect(rules.length).toBeGreaterThan(0);

    for (const rule of rules) {
      expect(Object.isFrozen(rule)).toBe(true);
      expect(Object.isFrozen(rule.permittedEnvironments)).toBe(true);
    }

    // 3. Attempting mutation of prohibited capability throws in strict mode
    const memoryReadingRule = COMPLIANCE_MATRIX.memory_reading;
    expect(() => {
      (memoryReadingRule as any).status = 'VERIFIED_PERMITTED';
    }).toThrow(TypeError);

    expect(() => {
      (memoryReadingRule.permittedEnvironments as any).push('COMPETITIVE_PROTECTED');
    }).toThrow(TypeError);

    // 4. Prohibited capability remains strictly denied
    expect(gate.isFeaturePermitted('memory_reading')).toBe(false);
    expect(gate.getPermittedFeatures()).not.toContain('memory_reading');

    const evaluation = gate.evaluateCapability('memory_reading');
    expect(evaluation.permitted).toBe(false);
    expect(evaluation.status).toBe('PROHIBITED');
  });
});

describe('Adversarial Challenge 2: Malformed Feature Strings, Casing, and Boundaries', () => {
  const gate = createCapabilityGate('COMPETITIVE_PROTECTED');

  it('should deny uppercase or mixed-case variants of permitted features (strict casing invariant)', () => {
    expect(gate.isFeaturePermitted('gsi_http_listener')).toBe(true);

    // Case variations fail safe and are denied
    expect(gate.isFeaturePermitted('GSI_HTTP_LISTENER')).toBe(false);
    expect(gate.isFeaturePermitted('Gsi_Http_Listener')).toBe(false);
    expect(gate.isFeaturePermitted('gsi_HTTP_listener')).toBe(false);

    const evalResult = gate.evaluateCapability('GSI_HTTP_LISTENER');
    expect(evalResult.permitted).toBe(false);
    expect(evalResult.status).toBe('UNKNOWN');
  });

  it('should deny uppercase or mixed-case variants of prohibited features (never accidentally permit)', () => {
    expect(gate.isFeaturePermitted('memory_reading')).toBe(false);

    expect(gate.isFeaturePermitted('MEMORY_READING')).toBe(false);
    expect(gate.isFeaturePermitted('Memory_Reading')).toBe(false);
    expect(gate.isFeaturePermitted('DLL_INJECTION')).toBe(false);
    expect(gate.isFeaturePermitted('Input_Automation')).toBe(false);
  });

  it('should deny empty string, whitespace-only, and padded feature IDs', () => {
    expect(gate.isFeaturePermitted('')).toBe(false);
    expect(gate.isFeaturePermitted('   ')).toBe(false);
    expect(gate.isFeaturePermitted('\t\n\r')).toBe(false);

    // Whitespace padding must not match
    expect(gate.isFeaturePermitted(' gsi_http_listener')).toBe(false);
    expect(gate.isFeaturePermitted('gsi_http_listener ')).toBe(false);
    expect(gate.isFeaturePermitted(' gsi_http_listener ')).toBe(false);
  });

  it('should deny null bytes and escape sequences in feature strings', () => {
    expect(gate.isFeaturePermitted('gsi_http_listener\0')).toBe(false);
    expect(gate.isFeaturePermitted('memory_reading\0')).toBe(false);
    expect(gate.isFeaturePermitted('\0')).toBe(false);
    expect(gate.isFeaturePermitted('gsi_http_listener\x00extra')).toBe(false);
  });

  it('should deny injection payload strings safely without crashing', () => {
    const payloads = [
      "' OR 1=1 --",
      "'; DROP TABLE features; --",
      '<script>alert("xss")</script>',
      '${7*7}',
      '{{7*7}}',
      '../../../../etc/passwd',
      '..\\..\\windows\\system32',
      '\u0000\u0001\u0002',
    ];

    for (const payload of payloads) {
      expect(gate.isFeaturePermitted(payload)).toBe(false);
      const result = gate.evaluateCapability(payload);
      expect(result.permitted).toBe(false);
      expect(result.status).toBe('UNKNOWN');
      expect(() => gate.assertFeaturePermitted(payload)).toThrow(ComplianceViolationError);
    }
  });

  it('should handle extreme string lengths without crashing or hanging (ReDoS/DoS defense)', () => {
    const longString = 'a'.repeat(100_000);
    const start = Date.now();
    expect(gate.isFeaturePermitted(longString)).toBe(false);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100);
    expect(gate.evaluateCapability(longString).permitted).toBe(false);
  });

  it('should deny unicode homoglyphs / lookalikes', () => {
    // Cyrillic small 'р' (U+0440) replacing Latin 'p' in 'gsi_http_listener'
    const homoglyph = 'gsi_htt\u0440_listener';
    expect(gate.isFeaturePermitted(homoglyph)).toBe(false);
  });

  it('should safely handle non-string inputs cast to any without crash', () => {
    const nonStrings: any[] = [0, 12345, true, false];

    for (const val of nonStrings) {
      expect(gate.isFeaturePermitted(val)).toBe(false);
    }
  });
});

describe('Adversarial Challenge 3: Fail-Safe Closed Behavior on Unknown/Invalid Environments', () => {
  it('should deny all features if environment is set to an unknown or invalid mode', () => {
    const invalidEnvironments: any[] = [
      'UNTRUSTED_MODE',
      'INVALID_ENV',
      'PRODUCTION',
      'DEBUG_MODE',
      '',
      null,
      123,
      {},
    ];

    for (const invalidEnv of invalidEnvironments) {
      const gate = createCapabilityGate(invalidEnv);

      // In an invalid environment, even normally permitted features must NOT be permitted
      expect(gate.isFeaturePermitted('gsi_http_listener')).toBe(false);
      expect(gate.isFeaturePermitted('gsi_bomb_timer')).toBe(false);
      expect(gate.isFeaturePermitted('static_lineup_db')).toBe(false);

      // Prohibited features must also remain denied
      expect(gate.isFeaturePermitted('memory_reading')).toBe(false);

      // getPermittedFeatures() should return empty array
      const permittedFeatures = gate.getPermittedFeatures();
      expect(permittedFeatures).toEqual([]);

      // assertFeaturePermitted must throw
      expect(() => gate.assertFeaturePermitted('gsi_bomb_timer')).toThrow(ComplianceViolationError);
    }
  });

  it('should correctly default to COMPETITIVE_PROTECTED when initialized without arguments', () => {
    const defaultGate = createCapabilityGate();
    expect(defaultGate.currentEnvironment).toBe('COMPETITIVE_PROTECTED');
    expect(defaultGate.isFeaturePermitted('gsi_http_listener')).toBe(true);
    expect(defaultGate.isFeaturePermitted('practice_lineup_alignment')).toBe(false);
  });

  it('should deny completely unknown feature IDs in any environment', () => {
    const environments: EnvironmentMode[] = ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'];
    const fakeFeatures = [
      'aim_assist_v2',
      'radar_hack',
      'auto_bunnyhop',
      'wallhack_mesh_extractor',
      'packet_injector',
      'random_feature_' + Math.random(),
    ];

    for (const env of environments) {
      const gate = createCapabilityGate(env);
      for (const fake of fakeFeatures) {
        expect(gate.isFeaturePermitted(fake)).toBe(false);
        const evalResult = gate.evaluateCapability(fake);
        expect(evalResult.permitted).toBe(false);
        expect(evalResult.status).toBe('UNKNOWN');
        expect(evalResult.reason).toContain('fail-safe closed');
        expect(() => gate.assertFeaturePermitted(fake)).toThrow(ComplianceViolationError);
      }
    }
  });
});

describe('Adversarial Challenge 4: Prohibited Capabilities Rejection Across ALL Environments', () => {
  const environments: EnvironmentMode[] = ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'];

  const prohibitedMatrixFeatures = [
    'memory_reading',
    'dll_injection',
    'graphics_pipeline_hooking',
    'input_automation',
    'jumpthrow_recoil_macros',
    'esp_wallhack_overlay',
    'aim_assistance_triggerbot',
    'spectator_data_mining',
    'unauthorized_web_scraping',
    'process_concealment',
    'unauthorized_hooks',
    'unauthorized_scraping',
  ];

  for (const env of environments) {
    describe(`Environment: ${env}`, () => {
      const gate = createCapabilityGate(env);

      it('should strictly deny all cataloged prohibited capabilities', () => {
        for (const feat of prohibitedMatrixFeatures) {
          expect(gate.isFeaturePermitted(feat)).toBe(false);

          const evaluation = gate.evaluateCapability(feat);
          expect(evaluation.permitted).toBe(false);
          expect(evaluation.status).toBe('PROHIBITED');
          expect(evaluation.reason).toContain('PROHIBITED');

          expect(() => gate.assertFeaturePermitted(feat)).toThrow(ComplianceViolationError);
        }
      });

      it('should ensure getPermittedFeatures() never contains any prohibited feature', () => {
        const permitted = gate.getPermittedFeatures();
        for (const feat of prohibitedMatrixFeatures) {
          expect(permitted).not.toContain(feat);
        }
      });
    });
  }
});

describe('Adversarial Challenge 5: assertFeaturePermitted() Exception Details & Structure', () => {
  const gate = createCapabilityGate('COMPETITIVE_PROTECTED');

  it('should throw ComplianceViolationError with complete and accurate metadata', () => {
    try {
      gate.assertFeaturePermitted('memory_reading');
      expect.unreachable('Should have thrown ComplianceViolationError');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ComplianceViolationError);
      expect(err).toBeInstanceOf(Error);
      expect(err.name).toBe('ComplianceViolationError');
      expect(err.featureId).toBe('memory_reading');
      expect(err.environment).toBe('COMPETITIVE_PROTECTED');
      expect(err.reason).toContain('strictly PROHIBITED');
      expect(err.message).toBe(
        "Compliance Violation: Feature 'memory_reading' is denied in environment 'COMPETITIVE_PROTECTED'. Reason: Feature 'Process Memory Reading / Inspection' is strictly PROHIBITED under Valve Anti-Cheat, SSA, or Tournament regulations."
      );
    }
  });

  it('should throw ComplianceViolationError with correct details for suppressed features in competitive', () => {
    try {
      gate.assertFeaturePermitted('practice_lineup_alignment');
      expect.unreachable('Should have thrown ComplianceViolationError');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ComplianceViolationError);
      expect(err.featureId).toBe('practice_lineup_alignment');
      expect(err.environment).toBe('COMPETITIVE_PROTECTED');
      expect(err.reason).toContain("suppressed in 'COMPETITIVE_PROTECTED' mode");
    }
  });

  it('should throw ComplianceViolationError with fail-safe reason for unknown feature', () => {
    try {
      gate.assertFeaturePermitted('unknown_exploit_xyz');
      expect.unreachable('Should have thrown ComplianceViolationError');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ComplianceViolationError);
      expect(err.featureId).toBe('unknown_exploit_xyz');
      expect(err.environment).toBe('COMPETITIVE_PROTECTED');
      expect(err.reason).toContain('Access denied (fail-safe closed)');
    }
  });

  it('should NOT throw for permitted features', () => {
    expect(() => gate.assertFeaturePermitted('gsi_http_listener')).not.toThrow();
    expect(() => gate.assertFeaturePermitted('gsi_bomb_timer')).not.toThrow();
    expect(() => gate.assertFeaturePermitted('static_lineup_db')).not.toThrow();
  });
});

describe('Adversarial Challenge 6: Event Notification Listeners Stress & Fault Tolerance', () => {
  it('should not register duplicate listeners when same function is registered multiple times', () => {
    const gate = createCapabilityGate('COMPETITIVE_PROTECTED');
    const listener = vi.fn();

    const unsub1 = gate.onEnvironmentChange(listener);
    const unsub2 = gate.onEnvironmentChange(listener);

    gate.setEnvironment('PRACTICE_SERVER');
    expect(listener).toHaveBeenCalledTimes(1);

    unsub1();
    gate.setEnvironment('SIMULATION_PREVIEW');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should handle unsubscription cleanly and idempotently', () => {
    const gate = createCapabilityGate('COMPETITIVE_PROTECTED');
    const listener = vi.fn();

    const unsub = gate.onEnvironmentChange(listener);
    unsub();
    unsub();

    gate.setEnvironment('PRACTICE_SERVER');
    expect(listener).toHaveBeenCalledTimes(0);
  });

  it('should isolate listener exceptions and prevent them from crashing setEnvironment or blocking other listeners', () => {
    const gate = createCapabilityGate('COMPETITIVE_PROTECTED');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const faultyListener1 = vi.fn(() => {
      throw new Error('Explosive failure in listener 1');
    });
    const goodListener = vi.fn();
    const faultyListener2 = vi.fn(() => {
      throw new TypeError('Explosive TypeError in listener 2');
    });

    gate.onEnvironmentChange(faultyListener1);
    gate.onEnvironmentChange(goodListener);
    gate.onEnvironmentChange(faultyListener2);

    expect(() => {
      gate.setEnvironment('PRACTICE_SERVER');
    }).not.toThrow();

    expect(goodListener).toHaveBeenCalledTimes(1);
    expect(goodListener).toHaveBeenCalledWith('PRACTICE_SERVER', 'COMPETITIVE_PROTECTED');

    expect(faultyListener1).toHaveBeenCalledTimes(1);
    expect(faultyListener2).toHaveBeenCalledTimes(1);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    consoleErrorSpy.mockRestore();
  });

  it('should support self-unsubscribing listeners without Set iteration errors', () => {
    const gate = createCapabilityGate('COMPETITIVE_PROTECTED');
    let unsubSelf: (() => void) | undefined;
    const callCount = vi.fn();

    const selfRemovingListener = vi.fn(() => {
      callCount();
      if (unsubSelf) unsubSelf();
    });

    unsubSelf = gate.onEnvironmentChange(selfRemovingListener);

    gate.setEnvironment('PRACTICE_SERVER');
    expect(callCount).toHaveBeenCalledTimes(1);

    gate.setEnvironment('SIMULATION_PREVIEW');
    expect(callCount).toHaveBeenCalledTimes(1);
  });

  it('should withstand rapid high-frequency environment cycling (stress test)', () => {
    const gate = createCapabilityGate('COMPETITIVE_PROTECTED');
    let callCount = 0;
    gate.onEnvironmentChange(() => {
      callCount++;
    });

    const envs: EnvironmentMode[] = ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'];

    for (let i = 0; i < 900; i++) {
      const targetEnv = envs[i % 3];
      gate.setEnvironment(targetEnv);
    }

    expect(callCount).toBeGreaterThan(500);
    expect(gate.isFeaturePermitted('memory_reading')).toBe(false);
  });
});

describe('Adversarial Challenge 7: Anti-Claim Scanner Evasion & Boundaries', () => {
  it('should detect standard banned marketing claims with mixed casing', () => {
    const inputs = [
      'This overlay is 100% VAC SAFE guaranteed!',
      'Features include VAC-PROOF memory isolation.',
      'Now OFFICIALLY VALVE APPROVED for tournament play.',
      'Our VAC PROOF architecture ensures peace of mind.',
      'Claiming to be VALVE WHITELISTED is prohibited.',
    ];

    for (const input of inputs) {
      const result = scanTextForAntiClaimViolations(input);
      expect(result.clean).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    }
  });

  it('should detect obfuscated, spaced, and delimited banned marketing claims (hardened anti-claim scanner)', () => {
    const evasions = [
      'Our companion is v a c - p r o o f and safe.',
      'Guaranteed vac_proof architecture.',
      'Completely 100%_vac_safe for competitive.',
      'We are officially\nvalve\napproved by organizers.',
      'Zero risk vac\u200Bproof design.',
      'We are officially-valve-approved by partners.',
      '100% vac-safe guarantees.',
      'v@c-pr00f companion.',
      'anti-vac bypass',
      'a n t i - v a c engine',
    ];

    for (const evasion of evasions) {
      const result = scanTextForAntiClaimViolations(evasion);
      expect(result.clean).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    }
  });

  it('should confirm clean compliance documentation passes cleanly', () => {
    const cleanDoc = `
      CS2 Assistant is a Windows companion operating in strict compliance with Valve policies.
      It uses official Game State Integration (GSI) via local HTTP server.
      It performs zero memory reading, zero DLL injection, zero input macros.
      It adheres to the Steam Subscriber Agreement and Trusted Mode requirements.
    `;
    const result = scanTextForAntiClaimViolations(cleanDoc);
    expect(result.clean).toBe(true);
    expect(result.violations).toHaveLength(0);
  });
});
```

---

## 5. Verification Method

Once `worker_m1_1` implements the fixes from `explorer_m1_iter2_1` and `explorer_m1_iter2_2`, and applies the Git untracking and test alignment specified above:

1. **Verify Git Untracking**:
   ```powershell
   git check-ignore -v tests/e2e/reports/e2e-summary.json
   ```
   *Expected*: Output shows rule match in `.gitignore` (exit code 0).

2. **Verify E2E Runner and Clean Git Working Tree**:
   ```powershell
   $env:PATH = ($env:PATH -replace 'dotnet"', 'dotnet')
   node --experimental-strip-types tests/e2e/runner.ts
   git status --porcelain
   ```
   *Expected*: Runner reports 58/58 passed across all 4 tiers; `git status --porcelain` shows ZERO modifications to `tests/e2e/reports/e2e-summary.json`.

3. **Verify Vitest Suite 100% Pass**:
   ```powershell
   $env:PATH = ($env:PATH -replace 'dotnet"', 'dotnet')
   npm test
   ```
   *Expected*: Both test files (`domain9-permission-capability.test.ts` and `adversarial-compliance-challenge.test.ts`) pass 100% with exit code 0.

4. **Verify TypeScript & Production Build**:
   ```powershell
   $env:PATH = ($env:PATH -replace 'dotnet"', 'dotnet')
   npm run lint
   npm run build
   ```
   *Expected*: 0 lint errors, build exits with code 0 emitting all production bundles in `dist/`.
