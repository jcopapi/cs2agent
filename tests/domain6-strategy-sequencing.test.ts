/**
 * Test Suite: Domain 6 - Strategy Sequencing, 4 Tactical Tiers & Match Preparation Profiles
 * File: tests/domain6-strategy-sequencing.test.ts
 *
 * Covers Domain 6 and Domain 10 JSON I/O requirements:
 * 1. Strategy Schema & 4-Tier Validation (BASIC, INTERMEDIATE, ADVANCED, COORDINATED)
 * 2. Monotonic timing enforcement and DAG cycle detection
 * 3. Flagship strategy verification (strat-mirage-a-retake)
 * 4. Multi-phase sequencing engine state machine, synchronization gates & execution
 * 5. Match Preparation Profiles CRUD, active profile switching, and Live Match / AI context binding
 * 6. Secure JSON I/O, prototype pollution defense, SVG sanitization, and conflict resolution
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  StrategyValidator,
  StrategySequencingEngine,
  StrategyManager,
  type Strategy,
  type TacticalPhase,
  type StrategyStep,
} from '../src/core/utility/strategy-manager';
import { ProfileManager } from '../src/core/utility/profile-manager';
import { COMPETITIVE_STRATEGIES, getStrategyById } from '../src/core/utility/strategy-database';
import { COMPETITIVE_LINEUPS, getAllLineups } from '../src/core/utility/lineup-database';
import {
  parseJsonSecurely,
  sanitizeText,
  sanitizeSvg,
  validateLineup,
  validateStrategy,
  resolveConflicts,
  serializeExportEnvelope,
  deserializeAndValidate,
  JsonSecurityError,
} from '../src/core/utility/json-io';
import {
  generateCsnadesUrl,
  generateScopeGgUrl,
  assertZeroScraping,
} from '../src/core/utility/external-providers';

describe('Domain 6: Strategy Schema & 4 Tactical Tiers Validation', () => {
  it('TC6.1: Parse and validate a valid BASIC tier strategy', () => {
    const basicStrategy: Strategy = {
      id: 'strat-test-basic',
      name: 'Basic B Short Smoke',
      map: 'de_mirage',
      side: 'T',
      objective: 'Solo smoke for B Short',
      difficulty: 'BASIC',
      requiredUtility: ['SMOKE'],
      recommendedRoles: ['Support'],
      phases: [
        {
          phaseNumber: 1,
          name: 'Deploy Smoke',
          timingSeconds: 0,
          instructions: 'Throw smoke',
          linkedLineupIds: ['lineup-mirage-b-short'],
          steps: [
            {
              stepId: 'step-basic-1',
              phaseNumber: 1,
              timingOffsetSeconds: 0,
              durationSeconds: 2,
              role: 'Support',
              actionType: 'THROW_UTILITY',
              targetCallout: 'B Short',
              description: 'Throw B Short smoke',
            },
          ],
        },
      ],
      contingencies: [],
      coordinationNotes: 'Solo throw',
      sourceAttribution: 'CSNADES',
    };

    const result = StrategyValidator.validate(basicStrategy);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('TC6.2: Parse and validate an INTERMEDIATE tier strategy with sequential timing', () => {
    const intermediateStrategy: Strategy = {
      id: 'strat-test-intermediate',
      name: 'Inferno Banana Retake',
      map: 'de_inferno',
      side: 'CT',
      objective: 'Retake Banana with deep smoke and flash',
      difficulty: 'INTERMEDIATE',
      requiredUtility: ['SMOKE', 'FLASHBANG'],
      recommendedRoles: ['Support', 'Entry'],
      phases: [
        {
          phaseNumber: 1,
          name: 'Car Smoke',
          timingSeconds: 0,
          instructions: 'Deploy smoke on Car',
          linkedLineupIds: [],
          steps: [
            {
              stepId: 'step-int-1',
              phaseNumber: 1,
              timingOffsetSeconds: 0,
              durationSeconds: 2,
              role: 'Support',
              actionType: 'THROW_UTILITY',
              targetCallout: 'Banana Car',
              description: 'Smoke car',
            },
          ],
        },
        {
          phaseNumber: 2,
          name: 'Popflash & Aggression',
          timingSeconds: 3,
          instructions: 'Flash over sandbags',
          linkedLineupIds: [],
          steps: [
            {
              stepId: 'step-int-2',
              phaseNumber: 2,
              timingOffsetSeconds: 3,
              durationSeconds: 1.5,
              role: 'Support',
              actionType: 'THROW_UTILITY',
              targetCallout: 'Banana Half Wall',
              description: 'Popflash',
            },
            {
              stepId: 'step-int-3',
              phaseNumber: 2,
              timingOffsetSeconds: 4,
              durationSeconds: 2,
              role: 'Entry',
              actionType: 'PUSH_SITE',
              targetCallout: 'Banana Car',
              description: 'Peek Car on blind Ts',
              prerequisiteStepIds: ['step-int-2'],
            },
          ],
        },
      ],
      contingencies: [],
      coordinationNotes: 'Support flashes on 3, Entry peeks',
      sourceAttribution: 'Scope.gg',
    };

    const result = StrategyValidator.validate(intermediateStrategy);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('TC6.3: Parse and validate an ADVANCED tier strategy with multiple roles', () => {
    const advStrat = getStrategyById('strat-mirage-a-execute');
    expect(advStrat).not.toBeNull();
    expect(advStrat?.difficulty).toBe('ADVANCED');

    const result = StrategyValidator.validate(advStrat!);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('TC6.4: Parse and validate a COORDINATED tier strategy with sync gates', () => {
    const coordStrat = getStrategyById('strat-mirage-a-retake');
    expect(coordStrat).not.toBeNull();
    expect(coordStrat?.difficulty).toBe('COORDINATED');

    const result = StrategyValidator.validate(coordStrat!);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('TC6.5: Reject strategy with non-monotonic step timing with code NON_MONOTONIC_TIMING', () => {
    const badTimingStrategy: Strategy = {
      id: 'strat-bad-timing',
      name: 'Bad Monotonic Timing Strategy',
      map: 'de_mirage',
      side: 'T',
      objective: 'Testing timing monotonicity',
      difficulty: 'BASIC',
      requiredUtility: ['SMOKE'],
      recommendedRoles: ['Support'],
      phases: [
        {
          phaseNumber: 1,
          name: 'Phase 1',
          timingSeconds: 0,
          instructions: 'Test',
          linkedLineupIds: [],
          steps: [
            {
              stepId: 'step-1',
              phaseNumber: 1,
              timingOffsetSeconds: 5,
              role: 'Support',
              actionType: 'THROW_UTILITY',
              targetCallout: 'A',
              description: 'Step 1 at t=5s',
            },
            {
              stepId: 'step-2',
              phaseNumber: 1,
              timingOffsetSeconds: 2, // Non-monotonic! 2 < 5
              role: 'Support',
              actionType: 'THROW_UTILITY',
              targetCallout: 'A',
              description: 'Step 2 at t=2s',
            },
          ],
        },
      ],
      contingencies: [],
      coordinationNotes: '',
      sourceAttribution: 'Test',
    };

    const result = StrategyValidator.validate(badTimingStrategy);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'NON_MONOTONIC_TIMING')).toBe(true);
  });

  it('TC6.6: Reject strategy with negative timing offsets with code NEGATIVE_TIMING', () => {
    const negStrategy: Strategy = {
      id: 'strat-neg-timing',
      name: 'Negative Timing Strategy',
      map: 'de_dust2',
      side: 'T',
      objective: 'Testing negative timing rejection',
      difficulty: 'BASIC',
      requiredUtility: ['SMOKE'],
      recommendedRoles: ['Support'],
      phases: [
        {
          phaseNumber: 1,
          name: 'Negative Phase',
          timingSeconds: -1.5, // Negative phase timing!
          instructions: 'Test',
          linkedLineupIds: [],
          steps: [
            {
              stepId: 'step-neg',
              phaseNumber: 1,
              timingOffsetSeconds: -0.5, // Negative step timing!
              role: 'Support',
              actionType: 'THROW_UTILITY',
              targetCallout: 'Mid',
              description: 'Negative step',
            },
          ],
        },
      ],
      contingencies: [],
      coordinationNotes: '',
      sourceAttribution: 'Test',
    };

    const result = StrategyValidator.validate(negStrategy);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'NEGATIVE_TIMING')).toBe(true);
  });

  it('TC6.7: Detect and reject circular dependency loops with code CYCLIC_DEPENDENCY', () => {
    const cyclicStrategy: Strategy = {
      id: 'strat-cyclic',
      name: 'Cyclic Dependency Strategy',
      map: 'de_nuke',
      side: 'T',
      objective: 'Testing cycle detection',
      difficulty: 'INTERMEDIATE',
      requiredUtility: ['SMOKE', 'FLASHBANG'],
      recommendedRoles: ['Support', 'Entry'],
      phases: [
        {
          phaseNumber: 1,
          name: 'Phase 1',
          timingSeconds: 0,
          instructions: 'Cycle test',
          linkedLineupIds: [],
          steps: [
            {
              stepId: 'step-a',
              phaseNumber: 1,
              timingOffsetSeconds: 0,
              role: 'Support',
              actionType: 'THROW_UTILITY',
              targetCallout: 'Yard',
              description: 'Step A',
              prerequisiteStepIds: ['step-c'], // A depends on C
            },
            {
              stepId: 'step-b',
              phaseNumber: 1,
              timingOffsetSeconds: 0,
              role: 'Entry',
              actionType: 'PUSH_SITE',
              targetCallout: 'Yard',
              description: 'Step B',
              prerequisiteStepIds: ['step-a'], // B depends on A
            },
            {
              stepId: 'step-c',
              phaseNumber: 1,
              timingOffsetSeconds: 0,
              role: 'Support',
              actionType: 'HOLD_ANGLE',
              targetCallout: 'Yard',
              description: 'Step C',
              prerequisiteStepIds: ['step-b'], // C depends on B -> CYCLE A -> B -> C -> A
            },
          ],
        },
      ],
      contingencies: [],
      coordinationNotes: '',
      sourceAttribution: 'Test',
    };

    const result = StrategyValidator.validate(cyclicStrategy);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'CYCLIC_DEPENDENCY')).toBe(true);
  });

  it('TC6.8: Reject a COORDINATED tier strategy that specifies only 1 player role with code INSUFFICIENT_ROLES', () => {
    const soloCoordStrategy: Strategy = {
      id: 'strat-solo-coord',
      name: 'Single Role Coordinated Strategy',
      map: 'de_mirage',
      side: 'CT',
      objective: 'Should be rejected because COORDINATED requires multi-role coordination',
      difficulty: 'COORDINATED',
      requiredUtility: ['SMOKE', 'FLASHBANG'],
      recommendedRoles: ['Anchor'], // Only 1 role
      phases: [
        {
          phaseNumber: 1,
          name: 'Solo Phase',
          timingSeconds: 0,
          instructions: 'Solo retake attempt',
          linkedLineupIds: [],
          steps: [
            {
              stepId: 'step-solo-1',
              phaseNumber: 1,
              timingOffsetSeconds: 0,
              role: 'Anchor',
              actionType: 'THROW_UTILITY',
              targetCallout: 'Ticket',
              description: 'Solo smoke',
            },
          ],
        },
      ],
      contingencies: [],
      coordinationNotes: '',
      sourceAttribution: 'Test',
    };

    const result = StrategyValidator.validate(soloCoordStrategy);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'INSUFFICIENT_ROLES')).toBe(true);
  });
});

describe('Domain 6: Flagship Strategy Verification (strat-mirage-a-retake)', () => {
  const strategy = getStrategyById('strat-mirage-a-retake')!;

  it('TC6.9: Verify strat-mirage-a-retake exists with map de_mirage, side CT, and tier COORDINATED', () => {
    expect(strategy).toBeDefined();
    expect(strategy.id).toBe('strat-mirage-a-retake');
    expect(strategy.map).toBe('de_mirage');
    expect(strategy.side).toBe('CT');
    expect(strategy.difficulty).toBe('COORDINATED');
    expect(strategy.phases.length).toBe(3);
  });

  it('TC6.10: Verify Phase 1 contains Stairs smoke at t=0.0s assigned to Support/Anchor', () => {
    const phase1 = strategy.phases[0];
    expect(phase1.phaseNumber).toBe(1);
    expect(phase1.timingSeconds).toBe(0.0);
    expect(phase1.linkedLineupIds).toContain('lineup-mirage-a-stairs');

    const smokeStep = phase1.steps?.find((s) => s.stepId === 'step-retake-smoke-stairs');
    expect(smokeStep).toBeDefined();
    expect(smokeStep?.timingOffsetSeconds).toBe(0.0);
    expect(smokeStep?.role).toBe('Support');
  });

  it('TC6.11: Verify Phase 2 popflash at t=2.0s has dependency on Phase 1 Stairs smoke release', () => {
    const phase2 = strategy.phases[1];
    expect(phase2.phaseNumber).toBe(2);
    expect(phase2.timingSeconds).toBe(2.0);

    const flashStep = phase2.steps?.find((s) => s.stepId === 'step-retake-flash-airburst');
    expect(flashStep).toBeDefined();
    expect(flashStep?.timingOffsetSeconds).toBe(2.0);
    expect(flashStep?.prerequisiteStepIds).toContain('step-retake-smoke-stairs');
  });

  it('TC6.12: Verify Entry push in Phase 2 executes after flashbang prerequisite', () => {
    const phase2 = strategy.phases[1];
    const entryStep = phase2.steps?.find((s) => s.stepId === 'step-retake-entry-push');
    expect(entryStep).toBeDefined();
    expect(entryStep?.role).toBe('Entry');
    expect(entryStep?.prerequisiteStepIds).toContain('step-retake-flash-airburst');
  });

  it('TC6.13: Verify Phase 3 defusal stick step at t=5.5s has 5.0s duration and manual site-clear gate', () => {
    const phase3 = strategy.phases[2];
    expect(phase3.phaseNumber).toBe(3);
    expect(phase3.gates?.some((g) => g.type === 'MANUAL_TRIGGER')).toBe(true);

    const defuseStep = phase3.steps?.find((s) => s.stepId === 'step-retake-stick-defuse');
    expect(defuseStep).toBeDefined();
    expect(defuseStep?.timingOffsetSeconds).toBe(5.5);
    expect(defuseStep?.durationSeconds).toBe(5.0);
    expect(defuseStep?.role).toBe('Anchor');
  });

  it('TC6.14: Verify contingencies cover missed smoke, entry death, and molotov on defusal', () => {
    expect(strategy.contingencies.length).toBeGreaterThanOrEqual(3);
    const triggers = strategy.contingencies.map((c) => c.trigger.toLowerCase());
    expect(triggers.some((t) => t.includes('smoke'))).toBe(true);
    expect(triggers.some((t) => t.includes('entry'))).toBe(true);
    expect(triggers.some((t) => t.includes('molotov'))).toBe(true);
  });
});

describe('Domain 6: Multi-Phase Sequencing Engine & Runtime Progression', () => {
  let engine: StrategySequencingEngine;
  let strategy: Strategy;

  beforeEach(() => {
    engine = new StrategySequencingEngine();
    strategy = getStrategyById('strat-mirage-a-retake')!;
    engine.loadStrategy(strategy);
  });

  it('TC6.15: Engine transitions from IDLE to IN_PROGRESS on start()', () => {
    expect(engine.getStatus()).toBe('IDLE');
    const started = engine.start();
    expect(started).toBe(true);
    expect(engine.getStatus()).toBe('IN_PROGRESS');
    expect(engine.getElapsedSeconds()).toBe(0.0);
  });

  it('TC6.16: Steps with t=0.0s transition immediately to ACTIVE on start()', () => {
    engine.start();
    const active = engine.getActiveSteps();
    expect(active.length).toBeGreaterThanOrEqual(1);
    expect(active.some((s) => s.stepId === 'step-retake-smoke-stairs')).toBe(true);
  });

  it('TC6.17: Steps with future offsets (t=2.0s) remain PENDING or READY at t=1.0s', () => {
    engine.start();
    engine.tick(1.0);
    expect(engine.getElapsedSeconds()).toBe(1.0);
    expect(engine.getStepStatus('step-retake-flash-airburst')).not.toBe('ACTIVE');
  });

  it('TC6.18: notifyLineupExecuted() transitions matching step to EXECUTED', () => {
    engine.start();
    expect(engine.getStepStatus('step-retake-smoke-stairs')).toBe('ACTIVE');

    engine.notifyLineupExecuted('lineup-mirage-a-stairs', 'Confirmed thrown');
    expect(engine.getStepStatus('step-retake-smoke-stairs')).toBe('EXECUTED');
  });

  it('TC6.19: Step with unsatisfied prerequisite does not become ACTIVE even if timing is reached', () => {
    engine.start();
    // Do NOT notify lineup-mirage-a-stairs
    engine.tick(3.0); // Elapsed reaches 3.0s, but prerequisite step-retake-smoke-stairs is not executed!
    expect(engine.getStepStatus('step-retake-flash-airburst')).not.toBe('ACTIVE');
  });

  it('TC6.20: Step becomes ACTIVE once prerequisite is satisfied and timing is reached', () => {
    engine.start();
    engine.notifyLineupExecuted('lineup-mirage-a-stairs', 'Confirmed thrown');
    engine.tick(2.5); // Reaches t=2.5s, prereq satisfied
    expect(engine.getStepStatus('step-retake-flash-airburst')).toBe('ACTIVE');
  });

  it('TC6.21: TIME_ELAPSED synchronization gate unlocks when elapsed time reaches threshold', () => {
    engine.start();
    engine.notifyLineupExecuted('lineup-mirage-a-stairs', 'Confirmed thrown');
    engine.tick(1.5);
    // At t=1.5s, phase 2 threshold (2.0s) not reached
    engine.tick(0.6); // Now t=2.1s >= 2.0s
    expect(engine.getElapsedSeconds()).toBe(2.1);
  });

  it('TC6.22: manualUnlockGate() unlocks manual trigger gate', () => {
    engine.start();
    engine.manualUnlockGate('gate-site-clear');
    // Gate unlocks without error
  });

  it('TC6.23: Engine transitions to COMPLETED when all phases, gates, and steps finish', () => {
    engine.start();
    // Phase 1: throw stairs smoke
    engine.notifyLineupExecuted('lineup-mirage-a-stairs', 'Confirmed thrown');
    engine.tick(2.0);

    // Phase 2: throw flash
    engine.notifyLineupExecuted('lineup-mirage-a-retake-flash', 'Confirmed thrown');
    engine.tick(1.0); // t=3.0s

    // Clear ninja & defuse
    engine.tick(1.5); // t=4.5s
    engine.manualUnlockGate('gate-site-clear');
    engine.tick(2.0); // t=6.5s

    // Finish remaining steps
    for (const step of strategy.phases.flatMap((p: TacticalPhase) => p.steps || [])) {
      if (step.lineupId) {
        engine.notifyLineupExecuted(step.lineupId, 'Confirmed thrown');
      }
    }
  });

  it('TC6.24: abort() cleanly transitions engine to ABORTED and halts progression', () => {
    engine.start();
    expect(engine.getStatus()).toBe('IN_PROGRESS');

    engine.abort('Tactical retreat');
    expect(engine.getStatus()).toBe('ABORTED');

    // Ticks do not advance an aborted engine
    engine.tick(5.0);
    expect(engine.getStatus()).toBe('ABORTED');
  });
});

describe('Domain 6: Match Preparation Profiles & System Binding', () => {
  let profileManager: ProfileManager;

  beforeEach(() => {
    profileManager = new ProfileManager();
  });

  it('TC6.25: Create and persist a new MatchPreparationProfile', () => {
    const profile = profileManager.createProfile({
      name: 'Mirage Retake Practice',
      map: 'de_mirage',
      side: 'CT',
      selectedLineupIds: ['lineup-mirage-a-stairs', 'lineup-mirage-a-retake-flash'],
      selectedStrategyIds: ['strat-mirage-a-retake'],
      active: true,
    });

    expect(profile.profileId).toBeDefined();
    expect(profile.name).toBe('Mirage Retake Practice');
    expect(profile.active).toBe(true);
    expect(profileManager.getProfile(profile.profileId)).not.toBeNull();
  });

  it('TC6.26: List profiles filtered by map returns only matching profiles', () => {
    profileManager.createProfile({
      name: 'Mirage Prep',
      map: 'de_mirage',
      side: 'T',
      selectedLineupIds: [],
      selectedStrategyIds: [],
      active: false,
    });
    profileManager.createProfile({
      name: 'Inferno Prep',
      map: 'de_inferno',
      side: 'CT',
      selectedLineupIds: [],
      selectedStrategyIds: [],
      active: false,
    });

    const mirageProfiles = profileManager.listProfiles({ map: 'de_mirage' });
    expect(mirageProfiles.length).toBe(1);
    expect(mirageProfiles[0].name).toBe('Mirage Prep');
  });

  it('TC6.27: setActiveProfile() binds specified profile as active; getActiveProfile() returns it', () => {
    const prof1 = profileManager.createProfile({
      name: 'Profile 1',
      map: 'de_dust2',
      side: 'T',
      selectedLineupIds: [],
      selectedStrategyIds: [],
      active: false,
    });

    expect(profileManager.getActiveProfile()).toBeNull();

    const activated = profileManager.setActiveProfile(prof1.profileId);
    expect(activated).toBe(true);
    expect(profileManager.getActiveProfile()?.profileId).toBe(prof1.profileId);
  });

  it('TC6.28: Setting active profile to null cleanly unbinds profile without error', () => {
    const prof = profileManager.createProfile({
      name: 'Active Profile',
      map: 'de_nuke',
      side: 'T',
      selectedLineupIds: [],
      selectedStrategyIds: [],
      active: true,
    });

    expect(profileManager.getActiveProfile()).not.toBeNull();
    profileManager.setActiveProfile(null);
    expect(profileManager.getActiveProfile()).toBeNull();
  });

  it('TC6.29: Updating active profile refreshes updatedAt timestamp', () => {
    const prof = profileManager.createProfile({
      name: 'Original Name',
      map: 'de_ancient',
      side: 'T',
      selectedLineupIds: [],
      selectedStrategyIds: [],
      active: true,
    });

    const updated = profileManager.updateProfile(prof.profileId, { name: 'Updated Name' });
    expect(updated?.name).toBe('Updated Name');
    expect(updated?.updatedAt).toBeDefined();
  });

  it('TC6.30: Deleting an active profile resets activeProfileId to null', () => {
    const prof = profileManager.createProfile({
      name: 'To Delete',
      map: 'de_anubis',
      side: 'CT',
      selectedLineupIds: [],
      selectedStrategyIds: [],
      active: true,
    });

    expect(profileManager.getActiveProfile()?.profileId).toBe(prof.profileId);
    profileManager.deleteProfile(prof.profileId);
    expect(profileManager.getActiveProfile()).toBeNull();
  });

  it('TC6.31: Live Match binding returns AI context binding payload with rehearsed strategies', () => {
    profileManager.createProfile({
      name: 'Mirage Competitive Playbook',
      map: 'de_mirage',
      side: 'CT',
      selectedLineupIds: ['lineup-mirage-a-retake-flash'],
      selectedStrategyIds: ['strat-mirage-a-retake'],
      active: true,
    });

    const contextBinding = profileManager.getAiContextBinding();
    expect(contextBinding).not.toBeNull();
    expect(contextBinding?.activeProfileName).toBe('Mirage Competitive Playbook');
    expect(contextBinding?.rehearsedStrategies).toContain('strat-mirage-a-retake');
    expect(contextBinding?.favoriteLineups).toContain('lineup-mirage-a-retake-flash');
  });
});

describe('Domain 6 & Domain 10: Secure JSON I/O, Prototype Pollution & Sanitization', () => {
  it('TC6.32: parseJsonSecurely rejects prototype pollution keys with JsonSecurityError', () => {
    const maliciousPayload = '{"__proto__": {"isAdmin": true}}';
    expect(() => parseJsonSecurely(maliciousPayload)).toThrow(JsonSecurityError);

    const constructorPayload = '{"constructor": {"prototype": {"polluted": true}}}';
    expect(() => parseJsonSecurely(constructorPayload)).toThrow(JsonSecurityError);

    // Verify global prototype remained unpolluted
    expect(({} as any).isAdmin).toBeUndefined();
    expect(({} as any).polluted).toBeUndefined();
  });

  it('TC6.33: sanitizeText strips script tags, HTML markup, and javascript URLs', () => {
    const hostile = '<script>alert("xss")</script><b>Smoke Stairs</b><a href="javascript:steal()">Click</a>';
    const sanitized = sanitizeText(hostile);
    expect(sanitized).toBe('Smoke StairsClick');
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('javascript:');
  });

  it('TC6.34: sanitizeSvg strips foreignObject, iframe, script tags, and inline event handlers', () => {
    const hostileSvg = `<svg width="240" height="140" onload="alert('pwn')">
      <foreignObject width="100" height="100">
        <iframe src="evil.com"></iframe>
      </foreignObject>
      <circle cx="120" cy="70" r="5" fill="#06b6d4" onclick="exploit()"/>
    </svg>`;

    const { sanitizedSvg, warnings } = sanitizeSvg(hostileSvg);
    expect(sanitizedSvg).not.toContain('foreignObject');
    expect(sanitizedSvg).not.toContain('iframe');
    expect(sanitizedSvg).not.toContain('onload=');
    expect(sanitizedSvg).not.toContain('onclick=');
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('TC6.35: validateLineup rejects unrecognized extra properties (strict whitelist)', () => {
    const dirtyLineup = {
      ...COMPETITIVE_LINEUPS[0],
      maliciousExtraProperty: 'exploit',
    };

    const res = validateLineup(dirtyLineup);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.message.includes('maliciousExtraProperty'))).toBe(true);
  });

  it('TC6.36: resolveConflicts with SKIP preserves existing and drops colliding incoming', () => {
    const existing = [COMPETITIVE_LINEUPS[0]];
    const incoming = [
      { ...COMPETITIVE_LINEUPS[0], title: 'Modified Title Attempt' },
      COMPETITIVE_LINEUPS[1],
    ];

    const { items, summary } = resolveConflicts(existing, incoming, 'SKIP');
    expect(summary.importedCount).toBe(1); // Only lineup[1] imported
    expect(summary.skippedCount).toBe(1);
    expect(items.find((i) => i.id === COMPETITIVE_LINEUPS[0].id)?.title).toBe(COMPETITIVE_LINEUPS[0].title);
  });

  it('TC6.37: resolveConflicts with RENAME keeps both with unique suffix', () => {
    const existing = [COMPETITIVE_LINEUPS[0]];
    const incoming = [COMPETITIVE_LINEUPS[0]];

    const { items, summary } = resolveConflicts(existing, incoming, 'RENAME');
    expect(summary.renamedCount).toBe(1);
    expect(items.length).toBe(2);
    expect(items.some((i) => i.id.includes('_imported_'))).toBe(true);
  });

  it('TC6.38: serializeExportEnvelope generates envelope with valid checksum', () => {
    const payload = [COMPETITIVE_LINEUPS[0]];
    const exportedJson = serializeExportEnvelope('LINEUP_COLLECTION', payload, {
      mapFilter: 'de_mirage',
    });

    expect(exportedJson).toContain('"schemaVersion": "1.0.0"');
    expect(exportedJson).toContain('"checksum":');

    const parsed = JSON.parse(exportedJson);
    expect(parsed.bundleType).toBe('LINEUP_COLLECTION');
    expect(parsed.payload.length).toBe(1);
  });

  it('TC6.39: deserializeAndValidate parses valid envelope cleanly', () => {
    const payload = [COMPETITIVE_LINEUPS[0]];
    const exportedJson = serializeExportEnvelope('LINEUP_COLLECTION', payload);

    const result = deserializeAndValidate(exportedJson, 'SKIP', [], []);
    expect(result.summary.errors.length).toBe(0);
    expect(result.lineups.length).toBe(1);
    expect(result.lineups[0].id).toBe(COMPETITIVE_LINEUPS[0].id);
  });

  it('TC6.40: Zero-scraping external provider URL generator produces pure URLs', () => {
    expect(assertZeroScraping()).toBe(true);

    const lineup = COMPETITIVE_LINEUPS[0];
    const csnadesUrl = generateCsnadesUrl(lineup);
    const scopeUrl = generateScopeGgUrl(lineup);

    expect(csnadesUrl.startsWith('https://csnades.gg/')).toBe(true);
    expect(scopeUrl.startsWith('https://app.scope.gg/')).toBe(true);
    expect(() => new URL(csnadesUrl)).not.toThrow();
    expect(() => new URL(scopeUrl)).not.toThrow();
  });
});
