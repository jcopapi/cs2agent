# Compliance Gating Security & Prototype Hardening Specification
**Target Files**: 
- `src/core/compliance/types.ts`
- `src/core/compliance/compliance-matrix.ts`
- `src/core/compliance/capability-gate.ts`

**Author**: `explorer_m1_iter2_1` (teamwork_preview_explorer)  
**Milestone**: Milestone 1, Iteration 2 (Security Hardening)  
**Date**: 2026-10-19  

---

## 1. Executive Summary & Forensic Analysis

Milestone 1 certification was rejected following an adversarial audit conducted by `challenger_m1_1` and `challenger_m1_2`. The audit exposed four algorithmic and architectural vulnerabilities in the runtime Capability Gating Engine:

1. **Shallow Immutability (`COMPLIANCE_MATRIX`)**:
   `Object.freeze` was invoked only on the root dictionary. The inner `IFeatureComplianceRule` objects and their `permittedEnvironments` arrays remained mutable references in memory. An in-process attacker or rogue module could mutate `status` to `VERIFIED_PERMITTED` and push `COMPETITIVE_PROTECTED` into `permittedEnvironments`, completely circumventing gating restrictions.
2. **Prototype Property Traversal & DoS Crash (`getComplianceRule`)**:
   `getComplianceRule(featureId)` performed direct unchecked dictionary indexing (`COMPLIANCE_MATRIX[featureId]`). When queried with standard JavaScript `Object.prototype` property names (`toString`, `valueOf`, `constructor`, `__proto__`, `hasOwnProperty`, etc.), it resolved to the prototype function. When `CapabilityGate.evaluateCapability()` attempted `rule.permittedEnvironments.includes(...)`, the engine crashed with an unhandled `TypeError: Cannot read properties of undefined (reading 'includes')`.
3. **Prototype Pollution Permission Escalation**:
   Because `COMPLIANCE_MATRIX` was an object literal inheriting from `Object.prototype`, any property injected onto `Object.prototype` (via prototype pollution) was treated as a valid rule by `COMPLIANCE_MATRIX[featureId]`, allowing arbitrary capabilities to report as permitted in competitive play.
4. **Lack of Defensive Runtime Validation Guards (`evaluateCapability`)**:
   `evaluateCapability` lacked schema type guards checking `!rule || typeof rule !== 'object' || !Array.isArray(rule.permittedEnvironments)` and did not guard against invalid operational environment strings.
5. **Specification Gaps in Prohibited Capabilities Catalog**:
   `process_concealment`, `unauthorized_hooks`, and `unauthorized_scraping` (stipulated in `ORIGINAL_REQUEST.md` and `COMPLIANCE.md` Six Zero Invariants) lacked explicit catalog entries in `ComplianceFeatureId` and `COMPLIANCE_MATRIX`.

This specification provides the comprehensive architecture, mathematical rationale, and exact drop-in TypeScript diffs to eliminate all four vulnerabilities.

---

## 2. Hardening Strategy & Architecture

### 2.1 Recursive Immutability (`deepFreeze`)
We introduce a generic `deepFreeze<T>` utility in `src/core/compliance/compliance-matrix.ts`:
- Traverses all own properties via `Object.getOwnPropertyNames(obj)`.
- Freezes both the parent object and any nested objects/arrays recursively.
- Guards against circular references or re-freezing via `Object.isFrozen(obj)`.
- In JavaScript strict mode (`'use strict'`, default for TypeScript/ES modules), any attempt to modify frozen properties or push into frozen arrays immediately throws `TypeError`. In non-strict contexts, mutations fail silently without modifying the state.

### 2.2 Null-Prototype Dictionary & Own-Property Shielding
We apply a two-tier defense against prototype property inheritance and prototype pollution:
1. **Tier 1 (Matrix Level)**: Construct `COMPLIANCE_MATRIX` using `Object.assign(Object.create(null), { ... })` before passing to `deepFreeze`. This ensures `Object.getPrototypeOf(COMPLIANCE_MATRIX) === null`. The matrix has no prototype chain; `COMPLIANCE_MATRIX['toString']` evaluates to `undefined`, and `Object.prototype` pollution cannot reach the matrix.
2. **Tier 2 (Lookup Level)**: In `getComplianceRule(featureId)`:
   - Validate that `featureId` is a non-empty string.
   - Verify `Object.prototype.hasOwnProperty.call(COMPLIANCE_MATRIX, featureId)` (or `Object.hasOwn(COMPLIANCE_MATRIX, featureId)`).
   - Verify that the resolved item is a non-null object.
   - Any unknown, non-string, or inherited key returns `undefined` (fail-safe closed).

### 2.3 Comprehensive Validation Guards in `CapabilityGate`
In `src/core/compliance/capability-gate.ts`:
- **Feature ID Guard**: Check `typeof featureId !== 'string' || !featureId`. Returns `{ permitted: false, status: 'UNKNOWN', reason: '...' }`.
- **Rule Structure Guard**: Check `!rule || typeof rule !== 'object' || !Array.isArray(rule.permittedEnvironments)`. Returns `{ permitted: false, status: 'UNKNOWN', reason: '...' }`.
- **Prohibited Rule Guard**: Check `rule.status === 'PROHIBITED'`. Returns `{ permitted: false, status: 'PROHIBITED', reason: '...' }`.
- **Environment Mode Guard**: Validate `this._currentEnvironment` against known valid environment strings (`COMPETITIVE_PROTECTED`, `PRACTICE_SERVER`, `SIMULATION_PREVIEW`). Unknown/invalid environments fail safe closed immediately.
- **Permitted List Guard**: In `getPermittedFeatures()`, filter out prohibited rules and ensure `Array.isArray(rule.permittedEnvironments)` before evaluating `.includes()`.

### 2.4 Catalog Expansion for Prohibited Vectors
Expand `ComplianceFeatureId` in `types.ts` and `COMPLIANCE_MATRIX` in `compliance-matrix.ts` with explicit `PROHIBITED` entries:
- `process_concealment`: Hiding processes, threads, or windows from OS task managers or anti-cheat scanners.
- `unauthorized_hooks`: System-wide or game-targeted API hooks, keyboard hooks, or window message hooks.
- `unauthorized_scraping`: Automated scraping or harvesting from game servers, matchmaking APIs, or tactical websites.

---

## 3. Exact TypeScript Implementation Diffs

### 3.1 `src/core/compliance/types.ts`

```diff
--- a/src/core/compliance/types.ts
+++ b/src/core/compliance/types.ts
@@ -69,7 +69,10 @@ export type ComplianceFeatureId =
   | 'aim_assistance_triggerbot'
   | 'spectator_data_mining'
-  | 'unauthorized_web_scraping';
+  | 'unauthorized_web_scraping'
+  | 'process_concealment'
+  | 'unauthorized_hooks'
+  | 'unauthorized_scraping';
 
 /**
  * Rule definition for a specific feature in the compliance matrix.
```

---

### 3.2 `src/core/compliance/compliance-matrix.ts`

```diff
--- a/src/core/compliance/compliance-matrix.ts
+++ b/src/core/compliance/compliance-matrix.ts
@@ -19,8 +19,29 @@ import {
+/**
+ * Recursively freezes an object, its sub-objects, and arrays to guarantee runtime immutability.
+ */
+export function deepFreeze<T>(obj: T): Readonly<T> {
+  if (obj === null || typeof obj !== 'object' || Object.isFrozen(obj)) {
+    return obj;
+  }
+
+  Object.freeze(obj);
+
+  for (const name of Object.getOwnPropertyNames(obj)) {
+    const val = (obj as any)[name];
+    if (val !== null && typeof val === 'object' && !Object.isFrozen(val)) {
+      deepFreeze(val);
+    }
+  }
+
+  return obj;
+}
+
 /**
  * Authoritative registry of compliance rules for every capability in CS2 Assistant.
+ * Initialized with a null prototype (Object.create(null)) to prevent prototype pollution
+ * and property inheritance, and deeply frozen to prevent runtime mutation.
  */
-export const COMPLIANCE_MATRIX: Record<ComplianceFeatureId, IFeatureComplianceRule> = Object.freeze({
+export const COMPLIANCE_MATRIX: Record<ComplianceFeatureId, IFeatureComplianceRule> = deepFreeze(
+  Object.assign(Object.create(null), {
   // --- TELEMETRY & GSI ---
@@ -324,5 +345,35 @@ export const COMPLIANCE_MATRIX: Record<ComplianceFeatureId, IFeatureComplianceRule> = Object.freeze({
     enforcement: 'Zero scraping engines; static verified datasets and user imports only.',
     authorityJustification: 'Terms of Service & Copyright compliance.',
   },
-});
+  process_concealment: {
+    id: 'process_concealment',
+    name: 'Process Concealment & Cloaking',
+    status: 'PROHIBITED',
+    category: 'PROHIBITED_CHEATING',
+    description: 'Hiding processes, threads, or windows from OS task managers or anti-cheat scanners.',
+    permittedEnvironments: [],
+    enforcement: 'Zero rootkit/cloaking techniques; transparent standard desktop application.',
+    authorityJustification: 'Steam Subscriber Agreement Sec. 4 & VAC Guide. Malicious obfuscation ban.',
+  },
+  unauthorized_hooks: {
+    id: 'unauthorized_hooks',
+    name: 'Unauthorized OS & Game Process Hooks',
+    status: 'PROHIBITED',
+    category: 'PROHIBITED_CHEATING',
+    description: 'Installing system-wide or game-targeted API hooks, keyboard hooks, or window message hooks.',
+    permittedEnvironments: [],
+    enforcement: 'Zero SetWindowsHookEx or detour hooks; passive listener architecture.',
+    authorityJustification: 'CS2 Trusted Mode FAQ & VAC Guide. Untrusted injection trigger.',
+  },
+  unauthorized_scraping: {
+    id: 'unauthorized_scraping',
+    name: 'Unauthorized Data Scraping',
+    status: 'PROHIBITED',
+    category: 'PROHIBITED_CHEATING',
+    description: 'Automated scraping or harvesting from game servers, matchmaking APIs, or tactical websites.',
+    permittedEnvironments: [],
+    enforcement: 'Zero scraping engines; static verified datasets and user-supplied JSON only.',
+    authorityJustification: 'Steam Subscriber Agreement Sec. 4 & Platform Terms of Service.',
+  },
+  })
+);
 
@@ -344,6 +395,17 @@ export const BANNED_MARKETING_PHRASES: readonly string[] = Object.freeze([
 /**
  * Retrieves the compliance rule for a specific feature ID.
+ * Employs strict own-property verification and null prototype shielding to prevent
+ * prototype pollution and prototype property traversal (e.g. toString, valueOf, constructor).
+ * Fails safe closed: any non-string, missing, or prototype-inherited key returns undefined.
  */
 export function getComplianceRule(featureId: string): IFeatureComplianceRule | undefined {
-  return COMPLIANCE_MATRIX[featureId as ComplianceFeatureId];
+  if (typeof featureId !== 'string' || !featureId) {
+    return undefined;
+  }
+  if (!Object.prototype.hasOwnProperty.call(COMPLIANCE_MATRIX, featureId)) {
+    return undefined;
+  }
+  const rule = COMPLIANCE_MATRIX[featureId as ComplianceFeatureId];
+  if (!rule || typeof rule !== 'object') {
+    return undefined;
+  }
+  return rule;
 }
```

---

### 3.3 `src/core/compliance/capability-gate.ts`

```diff
--- a/src/core/compliance/capability-gate.ts
+++ b/src/core/compliance/capability-gate.ts
@@ -94,5 +94,18 @@ export class CapabilityGate implements ICapabilityGate {
   public getPermittedFeatures(): string[] {
+    const validEnvironments: readonly EnvironmentMode[] = [
+      'COMPETITIVE_PROTECTED',
+      'PRACTICE_SERVER',
+      'SIMULATION_PREVIEW',
+    ];
+    if (!validEnvironments.includes(this._currentEnvironment)) {
+      return [];
+    }
+
     const allRules = Object.values(COMPLIANCE_MATRIX);
     return allRules
-      .filter((rule) => rule.permittedEnvironments.includes(this._currentEnvironment))
+      .filter(
+        (rule) =>
+          rule &&
+          typeof rule === 'object' &&
+          rule.status !== 'PROHIBITED' &&
+          Array.isArray(rule.permittedEnvironments) &&
+          rule.permittedEnvironments.includes(this._currentEnvironment)
+      )
       .map((rule) => rule.id);
   }
@@ -111,7 +124,17 @@ export class CapabilityGate implements ICapabilityGate {
   public evaluateCapability(featureId: string): CapabilityEvaluationResult {
+    // Fail-safe closed: validate featureId string
+    if (typeof featureId !== 'string' || !featureId) {
+      return {
+        permitted: false,
+        featureId: String(featureId),
+        environment: this._currentEnvironment,
+        status: 'UNKNOWN',
+        reason: `Feature '${String(featureId)}' is unrecognized in the compliance matrix. Access denied (fail-safe closed).`,
+      };
+    }
+
     const rule = getComplianceRule(featureId);
 
-    // Fail-safe closed 1: Unknown features are unconditionally denied
-    if (!rule) {
+    // Fail-safe closed 1: Unknown features or malformed rules are unconditionally denied
+    if (!rule || typeof rule !== 'object' || !Array.isArray(rule.permittedEnvironments)) {
       return {
         permitted: false,
@@ -136,3 +159,16 @@ export class CapabilityGate implements ICapabilityGate {
+    // Defensive check: environment must be a valid known environment mode
+    const validEnvironments: readonly EnvironmentMode[] = [
+      'COMPETITIVE_PROTECTED',
+      'PRACTICE_SERVER',
+      'SIMULATION_PREVIEW',
+    ];
+    if (!validEnvironments.includes(this._currentEnvironment)) {
+      return {
+        permitted: false,
+        featureId,
+        environment: this._currentEnvironment,
+        status: rule.status,
+        reason: `Operational environment '${this._currentEnvironment}' is invalid or unverified. Access denied (fail-safe closed).`,
+        rule,
+      };
+    }
+
     // Check environment whitelist
     const isPermittedInMode = rule.permittedEnvironments.includes(this._currentEnvironment);
```

---

## 4. Full Reference Code for Target Files

### 4.1 Target: `src/core/compliance/types.ts` (Relevant snippet)
```typescript
/**
 * Unique identifiers for all evaluated features in CS2 Assistant.
 */
export type ComplianceFeatureId =
  // Telemetry & GSI
  | 'gsi_http_listener'
  | 'gsi_delta_engine'
  // Lineup & Strategy
  | 'static_lineup_db'
  | 'svg_landmark_reference'
  | 'custom_lineup_storage'
  | 'match_prep_profiles'
  // Bomb & Memory
  | 'gsi_bomb_timer'
  | 'tactical_memory_provenance'
  | 'palace_observation_filter'
  | 'memory_decay_round_purge'
  // Analytics & History
  | 'history_match_analytics'
  | 'practice_retake_trigger'
  // AI Coach
  | 'gemini_ai_tactical_coach'
  | 'stale_ai_response_validation'
  // Overlay & HUD
  | 'transparent_desktop_hud'
  | 'hud_priority_arbitrage'
  | 'cs2_safe_zone_enforcement'
  | 'practice_lineup_alignment'
  | 'practice_trajectory_preview'
  | 'interactive_hud_preview'
  // Prohibited Vectors (Must NEVER be permitted)
  | 'memory_reading'
  | 'dll_injection'
  | 'graphics_pipeline_hooking'
  | 'input_automation'
  | 'jumpthrow_recoil_macros'
  | 'esp_wallhack_overlay'
  | 'aim_assistance_triggerbot'
  | 'spectator_data_mining'
  | 'unauthorized_web_scraping'
  | 'process_concealment'
  | 'unauthorized_hooks'
  | 'unauthorized_scraping';
```

### 4.2 Target: `src/core/compliance/compliance-matrix.ts` (Key methods & structure)
```typescript
/**
 * Recursively freezes an object, its sub-objects, and arrays to guarantee runtime immutability.
 */
export function deepFreeze<T>(obj: T): Readonly<T> {
  if (obj === null || typeof obj !== 'object' || Object.isFrozen(obj)) {
    return obj;
  }

  Object.freeze(obj);

  for (const name of Object.getOwnPropertyNames(obj)) {
    const val = (obj as any)[name];
    if (val !== null && typeof val === 'object' && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  }

  return obj;
}

export const COMPLIANCE_MATRIX: Record<ComplianceFeatureId, IFeatureComplianceRule> = deepFreeze(
  Object.assign(Object.create(null), {
    // ... all 29 previous features ...

    // Added Prohibited Features:
    process_concealment: {
      id: 'process_concealment',
      name: 'Process Concealment & Cloaking',
      status: 'PROHIBITED',
      category: 'PROHIBITED_CHEATING',
      description: 'Hiding processes, threads, or windows from OS task managers or anti-cheat scanners.',
      permittedEnvironments: [],
      enforcement: 'Zero rootkit/cloaking techniques; transparent standard desktop application.',
      authorityJustification: 'Steam Subscriber Agreement Sec. 4 & VAC Guide. Malicious obfuscation ban.',
    },
    unauthorized_hooks: {
      id: 'unauthorized_hooks',
      name: 'Unauthorized OS & Game Process Hooks',
      status: 'PROHIBITED',
      category: 'PROHIBITED_CHEATING',
      description: 'Installing system-wide or game-targeted API hooks, keyboard hooks, or window message hooks.',
      permittedEnvironments: [],
      enforcement: 'Zero SetWindowsHookEx or detour hooks; passive listener architecture.',
      authorityJustification: 'CS2 Trusted Mode FAQ & VAC Guide. Untrusted injection trigger.',
    },
    unauthorized_scraping: {
      id: 'unauthorized_scraping',
      name: 'Unauthorized Data Scraping',
      status: 'PROHIBITED',
      category: 'PROHIBITED_CHEATING',
      description: 'Automated scraping or harvesting from game servers, matchmaking APIs, or tactical websites.',
      permittedEnvironments: [],
      enforcement: 'Zero scraping engines; static verified datasets and user-supplied JSON only.',
      authorityJustification: 'Steam Subscriber Agreement Sec. 4 & Platform Terms of Service.',
    },
  })
);

export function getComplianceRule(featureId: string): IFeatureComplianceRule | undefined {
  if (typeof featureId !== 'string' || !featureId) {
    return undefined;
  }
  if (!Object.prototype.hasOwnProperty.call(COMPLIANCE_MATRIX, featureId)) {
    return undefined;
  }
  const rule = COMPLIANCE_MATRIX[featureId as ComplianceFeatureId];
  if (!rule || typeof rule !== 'object') {
    return undefined;
  }
  return rule;
}
```

### 4.3 Target: `src/core/compliance/capability-gate.ts` (Key methods)
```typescript
  public getPermittedFeatures(): string[] {
    const validEnvironments: readonly EnvironmentMode[] = [
      'COMPETITIVE_PROTECTED',
      'PRACTICE_SERVER',
      'SIMULATION_PREVIEW',
    ];
    if (!validEnvironments.includes(this._currentEnvironment)) {
      return [];
    }

    const allRules = Object.values(COMPLIANCE_MATRIX);
    return allRules
      .filter(
        (rule) =>
          rule &&
          typeof rule === 'object' &&
          rule.status !== 'PROHIBITED' &&
          Array.isArray(rule.permittedEnvironments) &&
          rule.permittedEnvironments.includes(this._currentEnvironment)
      )
      .map((rule) => rule.id);
  }

  public evaluateCapability(featureId: string): CapabilityEvaluationResult {
    // Fail-safe closed: validate featureId string
    if (typeof featureId !== 'string' || !featureId) {
      return {
        permitted: false,
        featureId: String(featureId),
        environment: this._currentEnvironment,
        status: 'UNKNOWN',
        reason: `Feature '${String(featureId)}' is unrecognized in the compliance matrix. Access denied (fail-safe closed).`,
      };
    }

    const rule = getComplianceRule(featureId);

    // Fail-safe closed 1: Unknown features or malformed rules are unconditionally denied
    if (!rule || typeof rule !== 'object' || !Array.isArray(rule.permittedEnvironments)) {
      return {
        permitted: false,
        featureId,
        environment: this._currentEnvironment,
        status: 'UNKNOWN',
        reason: `Feature '${featureId}' is unrecognized in the compliance matrix. Access denied (fail-safe closed).`,
      };
    }

    // Fail-safe closed 2: Prohibited features are unconditionally denied in ALL modes
    if (rule.status === 'PROHIBITED') {
      return {
        permitted: false,
        featureId,
        environment: this._currentEnvironment,
        status: rule.status,
        reason: `Feature '${rule.name}' is strictly PROHIBITED under Valve Anti-Cheat, SSA, or Tournament regulations.`,
        rule,
      };
    }

    // Defensive check: environment must be a valid known environment mode
    const validEnvironments: readonly EnvironmentMode[] = [
      'COMPETITIVE_PROTECTED',
      'PRACTICE_SERVER',
      'SIMULATION_PREVIEW',
    ];
    if (!validEnvironments.includes(this._currentEnvironment)) {
      return {
        permitted: false,
        featureId,
        environment: this._currentEnvironment,
        status: rule.status,
        reason: `Operational environment '${this._currentEnvironment}' is invalid or unverified. Access denied (fail-safe closed).`,
        rule,
      };
    }

    // Check environment whitelist
    const isPermittedInMode = rule.permittedEnvironments.includes(this._currentEnvironment);

    if (!isPermittedInMode) {
      return {
        permitted: false,
        featureId,
        environment: this._currentEnvironment,
        status: rule.status,
        reason: `Feature '${rule.name}' requires elevated privileges and is suppressed in '${this._currentEnvironment}' mode.`,
        rule,
      };
    }

    return {
      permitted: true,
      featureId,
      environment: this._currentEnvironment,
      status: rule.status,
      reason: `Feature '${rule.name}' is permitted in '${this._currentEnvironment}' mode.`,
      rule,
    };
  }
```

---

## 5. Peer Coordination & Test Suite Alignment

### 5.1 Alignment with `explorer_m1_iter2_3` (Test Suite Alignment)
In `tests/adversarial-compliance-challenge.test.ts`, tests currently assert empirical defect states (`expect(threwTypeError).toBe(true)`). Once our proposed fixes are implemented:
1. `gate.isFeaturePermitted(prop)` will return `false` without throwing.
2. `gate.assertFeaturePermitted(prop)` will throw `ComplianceViolationError` instead of crashing with `TypeError`.
3. `COMPLIANCE_MATRIX.memory_reading` and its arrays will be frozen, throwing `TypeError` when mutation is attempted.
4. Prototype pollution will return `permitted: false`, status `'UNKNOWN'`.
5. `process_concealment`, `unauthorized_hooks`, and `unauthorized_scraping` will return status `'PROHIBITED'`.

`explorer_m1_iter2_3` should align the assertions in `tests/adversarial-compliance-challenge.test.ts` to expect these hardened behaviors so that `npm test` achieves a 100% pass rate.

### 5.2 Alignment with `explorer_m1_iter2_2` (Anti-Claim Scanner)
The changes in this spec for `compliance-matrix.ts` are completely orthogonal to `scanTextForAntiClaimViolations`. Both sets of changes can be cleanly merged by `worker_m1_1` without merge conflicts.

---

## 6. Verification Commands

After applying the diffs, verify with:

```powershell
$env:PATH = ($env:PATH -replace 'dotnet"', 'dotnet'); $env:PATH = "C:\Program Files\nodejs;" + $env:PATH

# 1. Typecheck
npm run lint

# 2. Production build
npm run build

# 3. Domain 9 Unit Test Suite
npx vitest run tests/domain9-permission-capability.test.ts

# 4. Standalone Node Prototype Verification
node -e "
const { createCapabilityGate } = require('./dist/core/compliance/capability-gate.js');
const gate = createCapabilityGate('COMPETITIVE_PROTECTED');
console.log('toString:', gate.isFeaturePermitted('toString')); // Must be false
console.log('pollution:', gate.isFeaturePermitted('injected')); // Must be false
"
```
