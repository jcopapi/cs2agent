# Empirical Pipeline Challenge & Stress Test Report

**Target Milestone**: Milestone 1 (Repository Foundation, Valve Compliance & Architecture Setup)  
**Agent**: `challenger_m1_2` (teamwork_preview_challenger / critic & specialist)  
**Date**: 2026-10-19  
**Execution Environment**: Windows PowerShell, Node.js v24.21.0, Vitest v2.1.4, Vite v5.4.11  

---

## 1. Executive Summary & Verdict

### Explicit Verdict: **REJECT** (Pending Critical Fixes)

While the standalone E2E test runner (`runner.ts`), production build (`npm run build`), and TypeScript lint (`npm run lint`) execute cleanly, two critical pipeline/repository defects prevent approval of the Milestone 1 gate:
1. **Broken Test Pipeline (`npm test` Exits With Code 1)**: The core Vitest suite discovers tests under `tests/**/*.test.ts`. An adversarial compliance suite added to `tests/` exposes unhandled `TypeError: Cannot read properties of undefined (reading 'includes')` in `src/core/compliance/capability-gate.ts` when handling prototype properties (e.g., `'toString'`, `'valueOf'`), causing 27 test failures.
2. **Git Working Tree Dirtying via Untracked Test Output (`.gitignore` Violation)**: Running `node --experimental-strip-types tests/e2e/runner.ts` mutates `tests/e2e/reports/e2e-summary.json`. This report file was committed to Git in commit `0e1ddcdb9f66b4d7e6549ca00a636894c3ec3047`, but `tests/e2e/reports/` is omitted from `.gitignore`. Consequently, running tests permanently dirties the repository working tree.

---

## 2. Empirical Verification Results

| # | Pipeline Component | Target Command | Exit Code | Observable Output | Status |
|---|-------------------|----------------|-----------|-------------------|--------|
| 1 | Standalone E2E Runner | `node --experimental-strip-types tests/e2e/runner.ts` | 0 | 58/58 passed across Tiers 1-4 (10ms) | **PASS** |
| 2 | Headless Vitest Suite | `npm test` (`vitest run`) | 1 | 1 file passed (`domain9`), 1 file failed (`adversarial`), 27 failed / 43 passed | **FAIL** |
| 3 | Production Build | `npm run build` | 0 | `dist/renderer/index.html` (0.80 kB), CSS (6.59 kB), JS (143 kB) generated | **PASS** |
| 4 | Linter / Typechecker | `npm run lint` (`tsc --noEmit`) | 0 | 0 errors | **PASS** |
| 5 | Clean Build From Scratch | `Remove-Item -Recurse dist; npm run build` | 0 | Cleanly rebuilds in 1.33s | **PASS** |
| 6 | `.gitignore` Compliance | `git check-ignore tests/e2e/reports/e2e-summary.json` | 1 | Not ignored; committed file mutated on test run | **FAIL** |
| 7 | Git Working Tree Status | `git status --porcelain` | N/A | Modified tracked file: `tests/e2e/reports/e2e-summary.json` | **FAIL** |
| 8 | `dist/` Directory Integrity | Filesystem inspect `dist/` | 0 | Contains only expected `renderer/` and `core/`; completely ignored | **PASS** |

---

## 3. Detailed Component Findings

### 3.1 Standalone E2E Test Runner (`tests/e2e/runner.ts`)
- **Execution Command**:
  ```powershell
  $env:PATH = ($env:PATH -replace 'dotnet"', 'dotnet')
  node --experimental-strip-types tests/e2e/runner.ts
  ```
- **Observed Metrics**:
  - Total Tests: 58
  - Passed: 58 (100%)
  - Failed: 0
  - Duration: 9-10ms
  - Tier 1 (Feature Coverage): 32/32 passed
  - Tier 2 (Boundary & Corner): 16/16 passed
  - Tier 3 (Pairwise Interactions): 6/6 passed
  - Tier 4 (Real-World Scenarios): 4/4 passed
- **Stress & Harness Verification**:
  - Executed 3 consecutive runs under rapid looping: 100% deterministic, zero state leaks.
  - Empirically verified failure handling: injected artificial assertion failure `expect(1).toBe(2)` into runner registry. Verified that runner displays red `FAIL [T1]`, prints exact diff, outputs execution summary, and exits with code 1.
- **Architectural Observation**:
  - The E2E runner in Milestone 1 uses internal mock fixtures (`MockCapabilityGate`, `MockTacticalMemory`, `MockLineupFsm`, `MockBombTimer`, `MockHudManager`). It does not yet import `src/core/compliance/capability-gate.ts`. As subsequent milestones implement the core domain, these mocks must transition to the concrete implementations.

### 3.2 Vitest Suite (`npm test`)
- **Execution Command**:
  ```powershell
  $env:PATH = ($env:PATH -replace 'dotnet"', 'dotnet')
  npm test
  ```
- **Observed Metrics**:
  - Test Files: 1 failed | 1 passed (2 total)
  - Tests: 27 failed | 43 passed (70 total)
  - Duration: 1.41s
  - Exit Code: 1
- **Root Cause Analysis**:
  - In `src/core/compliance/capability-gate.ts` (lines 112-140):
    ```typescript
    public evaluateCapability(featureId: string): CapabilityEvaluationResult {
      const rule = getComplianceRule(featureId);
      if (!rule) { ... }
      if (rule.status === 'PROHIBITED') { ... }
      const isPermittedInMode = rule.permittedEnvironments.includes(this._currentEnvironment);
    ```
  - When `featureId` is `'toString'` or any `Object.prototype` property, `getComplianceRule('toString')` evaluates `COMPLIANCE_MATRIX['toString']`, which resolves to `Object.prototype.toString`.
  - Because `Object.prototype.toString` is a Function, `rule` is truthy, but `rule.permittedEnvironments` is `undefined`.
  - Invoking `undefined.includes(...)` throws an unhandled `TypeError: Cannot read properties of undefined (reading 'includes')`.
  - In addition, unknown environment modes passed to `CapabilityGate` default to evaluating against invalid strings without fail-safe closed fallback.

### 3.3 Production Build (`npm run build`)
- **Execution Command**:
  ```powershell
  $env:PATH = ($env:PATH -replace 'dotnet"', 'dotnet')
  npm run build
  ```
- **Observed Metrics**:
  - Dual-compilation pipeline: `tsc -p tsconfig.node.json && vite build`
  - Output files:
    - `dist/renderer/index.html` (0.80 kB)
    - `dist/renderer/assets/main-BA6aAYjc.css` (6.59 kB)
    - `dist/renderer/assets/main-Ce5PiUhm.js` (143.42 kB)
    - `dist/renderer/assets/main-Ce5PiUhm.js.map` (349.07 kB)
    - `dist/core/compliance/*.js` and `*.js.map`
  - Verified clean build from scratch after deleting `dist/`.
  - Validated that `index.html` contains strict Content Security Policy (`default-src 'self'`).

### 3.4 Linter / Typechecker (`npm run lint`)
- **Execution Command**:
  ```powershell
  $env:PATH = ($env:PATH -replace 'dotnet"', 'dotnet')
  npm run lint
  ```
- **Observed Metrics**:
  - Runs `tsc --noEmit`
  - Exit code: 0, 0 diagnostic errors.

### 3.5 Edge Cases: `.gitignore` and Working Tree Cleanliness
- **Finding**:
  - `tests/e2e/reports/e2e-summary.json` was committed to the repository in commit `0e1ddcdb9f66b4d7e6549ca00a636894c3ec3047`.
  - In `.gitignore`, lines 73-79 ignore:
    ```gitignore
    coverage/
    .nyc_output/
    test-results/
    playwright-report/
    cypress/videos/
    cypress/screenshots/
    ```
  - `tests/e2e/reports/` is NOT ignored.
  - `git check-ignore -v tests/e2e/reports/e2e-summary.json` returns exit code 1 (not ignored).
  - Whenever `node --experimental-strip-types tests/e2e/runner.ts` executes, it overwrites `tests/e2e/reports/e2e-summary.json` with new timestamps and execution durations.
  - Result: The repository working tree becomes permanently dirty upon running test commands.

---

## 4. Remediation Requirements for Approval

To achieve `APPROVE` verdict, the worker must complete the following remediations:

1. **Fix Prototype Pollution & Inheritance in `getComplianceRule` / `CapabilityGate`**:
   - In `src/core/compliance/compliance-matrix.ts`:
     ```typescript
     export function getComplianceRule(featureId: string): IFeatureComplianceRule | undefined {
       if (typeof featureId !== 'string' || !Object.prototype.hasOwnProperty.call(COMPLIANCE_MATRIX, featureId)) {
         return undefined;
       }
       return COMPLIANCE_MATRIX[featureId as ComplianceFeatureId];
     }
     ```
   - In `src/core/compliance/capability-gate.ts`:
     Validate that `this._currentEnvironment` is one of `['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW']`. If unknown, deny all capabilities.

2. **Fix `.gitignore` and Remove `e2e-summary.json` From Git Tracking**:
   - Add `tests/e2e/reports/` to `.gitignore`.
   - Untrack the generated file: `git rm --cached tests/e2e/reports/e2e-summary.json`.

3. **Verify Clean Pipeline**:
   - `npm test` must exit with code 0 across all suites.
   - `node --experimental-strip-types tests/e2e/runner.ts` must pass and leave `git status` clean.
