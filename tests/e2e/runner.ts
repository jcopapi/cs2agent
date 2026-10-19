/**
 * CS2 Assistant — Standalone End-to-End (E2E) Test Runner & Harness
 * 
 * Supports both standalone Node execution (node --experimental-strip-types tests/e2e/runner.ts)
 * and integration with Vitest / standard test runners.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type TestTier = 1 | 2 | 3 | 4;

export interface TestCase {
  name: string;
  tier: TestTier;
  featureId?: number;
  fn: () => void | Promise<void>;
  suite: string;
}

export interface TestResult {
  name: string;
  suite: string;
  tier: TestTier;
  featureId?: number;
  passed: boolean;
  durationMs: number;
  error?: string;
}

export interface SuiteSummary {
  name: string;
  passed: number;
  failed: number;
  total: number;
  durationMs: number;
}

export interface E2EReport {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  durationMs: number;
  tierSummary: Record<TestTier, { total: number; passed: number; failed: number }>;
  suites: Record<string, SuiteSummary>;
  results: TestResult[];
}

// ============================================================================
// Global Test Registry
// ============================================================================

class TestRegistry {
  private currentSuite: string = 'Default';
  private currentTier: TestTier = 1;
  private currentFeatureId?: number;
  public tests: TestCase[] = [];
  public beforeHooks: Record<string, Array<() => void | Promise<void>>> = {};
  public afterHooks: Record<string, Array<() => void | Promise<void>>> = {};

  setContext(suite: string, tier: TestTier = 1, featureId?: number) {
    this.currentSuite = suite;
    this.currentTier = tier;
    this.currentFeatureId = featureId;
  }

  addTest(name: string, fn: () => void | Promise<void>, tier?: TestTier, featureId?: number) {
    this.tests.push({
      name,
      fn,
      suite: this.currentSuite,
      tier: tier ?? this.currentTier,
      featureId: featureId ?? this.currentFeatureId,
    });
  }

  addBeforeHook(suite: string, fn: () => void | Promise<void>) {
    if (!this.beforeHooks[suite]) this.beforeHooks[suite] = [];
    this.beforeHooks[suite].push(fn);
  }

  addAfterHook(suite: string, fn: () => void | Promise<void>) {
    if (!this.afterHooks[suite]) this.afterHooks[suite] = [];
    this.afterHooks[suite].push(fn);
  }

  clear() {
    this.tests = [];
    this.beforeHooks = {};
    this.afterHooks = {};
  }
}

export const registry = new TestRegistry();

export function describe(suiteName: string, fn: () => void, explicitTier?: TestTier): void {
  const previousSuite = (registry as any).currentSuite;
  const previousTier = (registry as any).currentTier;
  let tier: TestTier = explicitTier ?? previousTier ?? 1;
  if (!explicitTier) {
    if (suiteName.includes('Tier 2') || suiteName.includes('T2')) tier = 2;
    else if (suiteName.includes('Tier 3') || suiteName.includes('T3')) tier = 3;
    else if (suiteName.includes('Tier 4') || suiteName.includes('T4')) tier = 4;
    else if (suiteName.includes('Tier 1') || suiteName.includes('T1')) tier = 1;
  }
  registry.setContext(suiteName, tier);
  fn();
  registry.setContext(previousSuite, previousTier);
}

export function it(testName: string, fn: () => void | Promise<void>, tier?: TestTier, featureId?: number): void {
  registry.addTest(testName, fn, tier, featureId);
}

export function beforeEach(fn: () => void | Promise<void>): void {
  const currentSuite = (registry as any).currentSuite;
  registry.addBeforeHook(currentSuite, fn);
}

export function afterEach(fn: () => void | Promise<void>): void {
  const currentSuite = (registry as any).currentSuite;
  registry.addAfterHook(currentSuite, fn);
}

// ============================================================================
// Assertion Engine
// ============================================================================

class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssertionError';
  }
}

export class Expectation<T> {
  private isNot: boolean = false;
  private actual: T;

  constructor(actual: T) {
    this.actual = actual;
  }

  get not(): Expectation<T> {
    const inverted = new Expectation(this.actual);
    inverted.isNot = !this.isNot;
    return inverted;
  }

  private fail(message: string) {
    throw new AssertionError(this.isNot ? `Expected NOT ${message}` : message);
  }

  toBe(expected: any): void {
    const pass = Object.is(this.actual, expected);
    if (this.isNot ? pass : !pass) {
      this.fail(`to be ${JSON.stringify(expected)}, received ${JSON.stringify(this.actual)}`);
    }
  }

  toEqual(expected: any): void {
    const actualStr = JSON.stringify(this.actual);
    const expectedStr = JSON.stringify(expected);
    const pass = actualStr === expectedStr;
    if (this.isNot ? pass : !pass) {
      this.fail(`to equal ${expectedStr}, received ${actualStr}`);
    }
  }

  toBeCloseTo(expected: number, precision: number = 2): void {
    if (typeof this.actual !== 'number') {
      throw new AssertionError(`Actual value is not a number: ${this.actual}`);
    }
    const diff = Math.abs(this.actual - expected);
    const tolerance = Math.pow(10, -precision) / 2;
    const pass = diff < tolerance;
    if (this.isNot ? pass : !pass) {
      this.fail(`to be close to ${expected} (tolerance: ${tolerance}), received ${this.actual} (diff: ${diff})`);
    }
  }

  toBeGreaterThan(expected: number): void {
    const pass = (this.actual as unknown as number) > expected;
    if (this.isNot ? pass : !pass) {
      this.fail(`to be greater than ${expected}, received ${this.actual}`);
    }
  }

  toBeGreaterThanOrEqual(expected: number): void {
    const pass = (this.actual as unknown as number) >= expected;
    if (this.isNot ? pass : !pass) {
      this.fail(`to be >= ${expected}, received ${this.actual}`);
    }
  }

  toBeLessThan(expected: number): void {
    const pass = (this.actual as unknown as number) < expected;
    if (this.isNot ? pass : !pass) {
      this.fail(`to be less than ${expected}, received ${this.actual}`);
    }
  }

  toBeLessThanOrEqual(expected: number): void {
    const pass = (this.actual as unknown as number) <= expected;
    if (this.isNot ? pass : !pass) {
      this.fail(`to be <= ${expected}, received ${this.actual}`);
    }
  }

  toBeTruthy(): void {
    const pass = Boolean(this.actual);
    if (this.isNot ? pass : !pass) {
      this.fail(`to be truthy, received ${JSON.stringify(this.actual)}`);
    }
  }

  toBeFalsy(): void {
    const pass = !Boolean(this.actual);
    if (this.isNot ? pass : !pass) {
      this.fail(`to be falsy, received ${JSON.stringify(this.actual)}`);
    }
  }

  toBeNull(): void {
    const pass = this.actual === null;
    if (this.isNot ? pass : !pass) {
      this.fail(`to be null, received ${JSON.stringify(this.actual)}`);
    }
  }

  toBeUndefined(): void {
    const pass = this.actual === undefined;
    if (this.isNot ? pass : !pass) {
      this.fail(`to be undefined, received ${JSON.stringify(this.actual)}`);
    }
  }

  toBeDefined(): void {
    const pass = this.actual !== undefined;
    if (this.isNot ? pass : !pass) {
      this.fail(`to be defined, received undefined`);
    }
  }

  toContain(item: any): void {
    let pass = false;
    if (typeof this.actual === 'string') {
      pass = this.actual.includes(item);
    } else if (Array.isArray(this.actual)) {
      pass = this.actual.includes(item);
    } else if (this.actual instanceof Set) {
      pass = this.actual.has(item);
    } else if (typeof this.actual === 'object' && this.actual !== null) {
      pass = item in (this.actual as any);
    }
    if (this.isNot ? pass : !pass) {
      this.fail(`to contain ${JSON.stringify(item)}, collection was ${JSON.stringify(this.actual)}`);
    }
  }

  toMatch(regex: RegExp | string): void {
    const r = typeof regex === 'string' ? new RegExp(regex) : regex;
    const pass = r.test(String(this.actual));
    if (this.isNot ? pass : !pass) {
      this.fail(`to match ${regex}, received ${this.actual}`);
    }
  }

  toThrow(expectedError?: string | RegExp): void {
    if (typeof this.actual !== 'function') {
      throw new AssertionError('Expected a function to test throw');
    }
    let threw = false;
    let thrownError: any = null;
    try {
      (this.actual as Function)();
    } catch (err: any) {
      threw = true;
      thrownError = err;
    }
    if (this.isNot) {
      if (threw) {
        this.fail(`to NOT throw, but threw ${thrownError?.message || thrownError}`);
      }
    } else {
      if (!threw) {
        this.fail('to throw an error, but it did not throw');
      }
      if (expectedError && thrownError) {
        const msg = thrownError.message || String(thrownError);
        const matches = typeof expectedError === 'string' ? msg.includes(expectedError) : expectedError.test(msg);
        if (!matches) {
          this.fail(`to throw error matching "${expectedError}", but got "${msg}"`);
        }
      }
    }
  }
}

export function expect<T>(actual: T): Expectation<T> {
  return new Expectation(actual);
}

// ============================================================================
// Virtual Clock & Test Harness Utilities
// ============================================================================

export class VirtualClock {
  private now: number;

  constructor(initialEpochMs: number = 1771362700000) {
    this.now = initialEpochMs;
  }

  getEpochMs(): number {
    return this.now;
  }

  advanceSeconds(seconds: number): void {
    this.now += seconds * 1000;
  }

  advanceMs(ms: number): void {
    this.now += ms;
  }
}

// ============================================================================
// Mock Subsystem Fixtures & Domain Enums
// ============================================================================

export type EnvironmentMode = 'COMPETITIVE_PROTECTED' | 'PRACTICE_SERVER' | 'SIMULATION_PREVIEW';
export type ProvenanceLevel = 'CONFIRMED' | 'REPORTED' | 'INFERRED';
export type LineupFsmState = 'INACTIVE' | 'NEARBY' | 'POSITIONING' | 'ALIGNING' | 'READY' | 'EXECUTED' | 'NEXT';
export type CompletionType = 'Attempted' | 'Confirmed thrown' | 'Confirmed landed' | 'Manually completed';
export type PriorityLevel = 'CRITICAL' | 'CONTEXTUAL' | 'INFORMATIONAL' | 'PASSIVE';

export interface MockObservation {
  eventId: string;
  type: string;
  provenance: ProvenanceLevel;
  timestampMs: number;
  roundNumber: number;
  map: string;
  source: string;
  victimCallout?: string;
  killerName?: string;
  killerCallout?: string;
  confidence: number;
  expiresAtMs: number;
}

export interface MockLineup {
  id: string;
  map: string;
  side: 'T' | 'CT' | 'BOTH';
  utilityType: 'SMOKE' | 'FLASH' | 'MOLOTOV' | 'HE';
  name: string;
  startCoords: { x: number; y: number; z: number };
  targetCoords: { x: number; y: number; z: number };
  targetCallout: string;
  aimAngles: { pitch: number; yaw: number };
  pitchTolerance: number;
  yawTolerance: number;
}

// ============================================================================
// Mock Implementations for Headless E2E Verification
// ============================================================================

export class MockCapabilityGate {
  private env: EnvironmentMode = 'COMPETITIVE_PROTECTED';

  get currentEnvironment(): EnvironmentMode {
    return this.env;
  }

  setEnvironment(env: EnvironmentMode): void {
    this.env = env;
  }

  isFeaturePermitted(featureId: string): boolean {
    const prohibitedInCompetitive = [
      'TRAJECTORY_PREVIEW',
      'IN_GAME_CROSSHAIR_OVERLAY',
      'SPECTATOR_ENEMY_TRACKING',
      'INPUT_MACRO',
      'MEMORY_SCANNING',
    ];
    if (featureId === 'INPUT_MACRO' || featureId === 'MEMORY_SCANNING') {
      return false; // Absolute prohibition across all environments
    }
    if (this.env === 'COMPETITIVE_PROTECTED') {
      return !prohibitedInCompetitive.includes(featureId);
    }
    return true; // Practice and simulation permit safe training features
  }
}

export class MockTacticalMemory {
  private observations: MockObservation[] = [];

  recordKill(victim: string, victimCallout: string, killer: string, roundNumber: number, timestampMs: number): void {
    // Palace Invariance Rule:
    // Victim's location is CONFIRMED at victimCallout.
    // Killer's identity is CONFIRMED. Killer's location is UNKNOWN (never inferred to be victim's location).
    this.observations.push({
      eventId: `kill-${victim}-${timestampMs}`,
      type: 'KILL_VICTIM',
      provenance: 'CONFIRMED',
      timestampMs,
      roundNumber,
      map: 'de_mirage',
      source: 'GSI_TELEMETRY',
      victimCallout,
      confidence: 1.0,
      expiresAtMs: timestampMs + 15000,
    });

    this.observations.push({
      eventId: `kill-killer-${killer}-${timestampMs}`,
      type: 'KILL_KILLER',
      provenance: 'CONFIRMED',
      timestampMs,
      roundNumber,
      map: 'de_mirage',
      source: 'GSI_TELEMETRY',
      killerName: killer,
      killerCallout: undefined, // UNKNOWN
      confidence: 1.0,
      expiresAtMs: timestampMs + 15000,
    });
  }

  getObservations(): MockObservation[] {
    return [...this.observations];
  }

  getConfirmedVictimLocation(victim: string): string | undefined {
    const obs = this.observations.find((o) => o.type === 'KILL_VICTIM' && o.eventId.includes(victim));
    return obs?.victimCallout;
  }

  getConfirmedKillerLocation(killer: string): string | undefined {
    const obs = this.observations.find((o) => o.type === 'KILL_KILLER' && o.killerName === killer);
    return obs?.killerCallout; // Must remain undefined
  }

  flushRound(): void {
    this.observations = [];
  }
}

export class MockLineupFsm {
  public state: LineupFsmState = 'INACTIVE';
  public lastCompletionType?: CompletionType;

  updatePosition(distance: number, angleDiff: number, weapon: string): void {
    // 1. De-escalation (Hysteresis exits)
    if (this.state === 'READY') {
      if (weapon !== 'weapon_smokegrenade' || distance > 10 || angleDiff > 1.5) {
        this.state = 'ALIGNING';
      }
    }
    if (this.state === 'ALIGNING') {
      if (distance > 15 || angleDiff > 20) {
        this.state = 'POSITIONING';
      }
    }
    if (this.state === 'POSITIONING') {
      if (distance > 35) {
        this.state = 'NEARBY';
      }
    }
    if (this.state === 'NEARBY') {
      if (distance > 180) {
        this.state = 'INACTIVE';
      }
    }

    // 2. Escalation (Entry transitions)
    if (this.state === 'INACTIVE' && distance <= 150) {
      this.state = 'NEARBY';
    }
    if (this.state === 'NEARBY' && distance <= 30) {
      this.state = 'POSITIONING';
    }
    if (this.state === 'POSITIONING' && distance <= 10 && angleDiff <= 15) {
      this.state = 'ALIGNING';
    }
    if (this.state === 'ALIGNING' && distance <= 5 && angleDiff <= 1.5 && weapon === 'weapon_smokegrenade') {
      this.state = 'READY';
    }
  }

  triggerThrow(grenadeReleased: boolean, bloomConfirmed: boolean): void {
    if (this.state !== 'READY') return;
    this.state = 'EXECUTED';
    if (bloomConfirmed) {
      this.lastCompletionType = 'Confirmed landed';
    } else if (grenadeReleased) {
      this.lastCompletionType = 'Confirmed thrown';
    } else {
      this.lastCompletionType = 'Attempted';
    }
  }

  manualComplete(): void {
    this.state = 'EXECUTED';
    this.lastCompletionType = 'Manually completed';
  }

  advanceNext(): void {
    if (this.state === 'EXECUTED') {
      this.state = 'NEXT';
    }
  }
}

export class MockBombTimer {
  public isPlanted: boolean = false;
  public remainingSeconds: number = 0;
  public stage: 'GREEN' | 'AMBER' | 'RED' | 'FLASHING' | 'CLEARED' = 'CLEARED';

  onPlant(secondsRemaining: number = 40.0): void {
    this.isPlanted = true;
    this.remainingSeconds = secondsRemaining;
    this.updateStage();
  }

  tick(deltaSec: number): void {
    if (!this.isPlanted) return;
    this.remainingSeconds = Math.max(0, this.remainingSeconds - deltaSec);
    this.updateStage();
  }

  private updateStage(): void {
    if (this.remainingSeconds > 20.0) this.stage = 'GREEN';
    else if (this.remainingSeconds > 10.0) this.stage = 'AMBER';
    else if (this.remainingSeconds > 5.0) this.stage = 'RED';
    else if (this.remainingSeconds > 0) this.stage = 'FLASHING';
    else this.stage = 'CLEARED';
  }

  onDefusedOrExploded(): void {
    this.isPlanted = false;
    this.remainingSeconds = 0;
    this.stage = 'CLEARED';
  }
}

export class MockHudManager {
  private activeWidgets: Map<string, { priority: PriorityLevel; visible: boolean }> = new Map();

  requestDisplay(widgetId: string, priority: PriorityLevel): void {
    this.activeWidgets.set(widgetId, { priority, visible: true });
    this.arbitrate();
  }

  hide(widgetId: string): void {
    this.activeWidgets.delete(widgetId);
  }

  private arbitrate(): void {
    const hasCritical = Array.from(this.activeWidgets.values()).some((w) => w.priority === 'CRITICAL');
    if (hasCritical) {
      // Demote or hide PASSIVE widgets during CRITICAL events
      for (const [id, w] of this.activeWidgets.entries()) {
        if (w.priority === 'PASSIVE') {
          w.visible = false;
        }
      }
    }
  }

  isWidgetVisible(widgetId: string): boolean {
    return this.activeWidgets.get(widgetId)?.visible ?? false;
  }
}

// ============================================================================
// Test Execution Engine & Reporter
// ============================================================================

export async function runAllSuites(): Promise<E2EReport> {
  const startTime = Date.now();
  const results: TestResult[] = [];
  const suites: Record<string, SuiteSummary> = {};
  const tierSummary: Record<TestTier, { total: number; passed: number; failed: number }> = {
    1: { total: 0, passed: 0, failed: 0 },
    2: { total: 0, passed: 0, failed: 0 },
    3: { total: 0, passed: 0, failed: 0 },
    4: { total: 0, passed: 0, failed: 0 },
  };

  console.log('\n' + '='.repeat(80));
  console.log('  CS2 ASSISTANT — END-TO-END (E2E) TEST RUNNER');
  console.log('='.repeat(80));

  for (const test of registry.tests) {
    if (!suites[test.suite]) {
      suites[test.suite] = { name: test.suite, passed: 0, failed: 0, total: 0, durationMs: 0 };
    }

    tierSummary[test.tier].total++;
    suites[test.suite].total++;

    // Execute before hooks
    const beforeHooks = registry.beforeHooks[test.suite] || [];
    for (const hook of beforeHooks) {
      try {
        await hook();
      } catch (err: any) {
        console.error(`Before hook failed for suite ${test.suite}:`, err);
      }
    }

    const testStart = Date.now();
    let passed = true;
    let errorMsg: string | undefined;

    try {
      await test.fn();
    } catch (err: any) {
      passed = false;
      errorMsg = err.message || String(err);
    }
    const testDuration = Date.now() - testStart;

    // Execute after hooks
    const afterHooks = registry.afterHooks[test.suite] || [];
    for (const hook of afterHooks) {
      try {
        await hook();
      } catch (err: any) {
        console.error(`After hook failed for suite ${test.suite}:`, err);
      }
    }

    if (passed) {
      tierSummary[test.tier].passed++;
      suites[test.suite].passed++;
    } else {
      tierSummary[test.tier].failed++;
      suites[test.suite].failed++;
    }
    suites[test.suite].durationMs += testDuration;

    results.push({
      name: test.name,
      suite: test.suite,
      tier: test.tier,
      featureId: test.featureId,
      passed,
      durationMs: testDuration,
      error: errorMsg,
    });

    const statusBadge = passed ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
    const tierBadge = `[T${test.tier}]`;
    console.log(`  ${statusBadge} ${tierBadge} ${test.suite} -> ${test.name} (${testDuration}ms)`);
    if (!passed && errorMsg) {
      console.log(`         \x1b[31mError: ${errorMsg}\x1b[0m`);
    }
  }

  const totalDuration = Date.now() - startTime;
  const totalPassed = results.filter((r) => r.passed).length;
  const totalFailed = results.filter((r) => !r.passed).length;

  console.log('\n' + '-'.repeat(80));
  console.log('  TEST EXECUTION SUMMARY');
  console.log('-'.repeat(80));
  console.log(`  Total Tests:    ${results.length}`);
  console.log(`  Passed:         \x1b[32m${totalPassed}\x1b[0m`);
  console.log(`  Failed:         ${totalFailed > 0 ? `\x1b[31m${totalFailed}\x1b[0m` : '0'}`);
  console.log(`  Duration:       ${totalDuration}ms`);
  console.log('\n  TIER BREAKDOWN:');
  console.log(`    Tier 1 (Feature Coverage):     ${tierSummary[1].passed}/${tierSummary[1].total} passed`);
  console.log(`    Tier 2 (Boundary & Corner):    ${tierSummary[2].passed}/${tierSummary[2].total} passed`);
  console.log(`    Tier 3 (Pairwise Interactions):${tierSummary[3].passed}/${tierSummary[3].total} passed`);
  console.log(`    Tier 4 (Real-World Scenarios): ${tierSummary[4].passed}/${tierSummary[4].total} passed`);
  console.log('='.repeat(80) + '\n');

  const report: E2EReport = {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passed: totalPassed,
    failed: totalFailed,
    durationMs: totalDuration,
    tierSummary,
    suites,
    results,
  };

  // Write summary artifact to disk
  try {
    const reportsDir = path.resolve(process.cwd(), 'tests', 'e2e', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(reportsDir, 'e2e-summary.json'), JSON.stringify(report, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write e2e-summary.json artifact:', err);
  }

  return report;
}

// Automatically execute all imported suites if run as main file
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.endsWith('runner.ts')) {
  // Dynamically import test suites and execute
  (async () => {
    try {
      await import('./tier1-feature-coverage.test.js').catch(async () => {
        return import('./tier1-feature-coverage.test.ts');
      });
      await import('./tier2-boundary-corner.test.js').catch(async () => {
        return import('./tier2-boundary-corner.test.ts');
      });
      await import('./tier3-pairwise-combinations.test.js').catch(async () => {
        return import('./tier3-pairwise-combinations.test.ts');
      });
      await import('./tier4-real-world-scenarios.test.js').catch(async () => {
        return import('./tier4-real-world-scenarios.test.ts');
      });

      const report = await runAllSuites();
      if (report.failed > 0) {
        process.exit(1);
      }
    } catch (e) {
      console.error('Failed to run test suites:', e);
      process.exit(1);
    }
  })();
}
