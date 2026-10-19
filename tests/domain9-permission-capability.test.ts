/**
 * Test Suite: Domain 9 - Permission & Capability Gating
 *
 * Verifies that the Capability Gating Engine strictly controls access to features
 * across COMPETITIVE_PROTECTED, PRACTICE_SERVER, and SIMULATION_PREVIEW environments.
 *
 * Verifies the Six Zero Invariants, fail-safe closed behavior, and the Anti-Claim Invariant.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  createCapabilityGate,
  ComplianceViolationError,
} from '../src/core/compliance/capability-gate';
import {
  COMPLIANCE_MATRIX,
  getAllComplianceRules,
  getRulesByStatus,
  validateMatrixIntegrity,
  scanTextForAntiClaimViolations,
  BANNED_MARKETING_PHRASES,
} from '../src/core/compliance/compliance-matrix';
import { EnvironmentMode } from '../src/core/compliance/types';

describe('Domain 9: Compliance Matrix & Invariants Integrity', () => {
  it('should validate that the compliance matrix satisfies all integrity invariants', () => {
    const integrity = validateMatrixIntegrity();
    expect(integrity.valid).toBe(true);
    expect(integrity.errors).toEqual([]);
  });

  it('should guarantee that all PROHIBITED features have an empty permittedEnvironments array', () => {
    const prohibitedRules = getRulesByStatus('PROHIBITED');
    expect(prohibitedRules.length).toBeGreaterThan(0);

    for (const rule of prohibitedRules) {
      expect(rule.permittedEnvironments).toEqual([]);
      expect(rule.status).toBe('PROHIBITED');
    }
  });

  it('should guarantee that all VERIFIED_PERMITTED features are permitted in COMPETITIVE_PROTECTED', () => {
    const permittedRules = getRulesByStatus('VERIFIED_PERMITTED');
    expect(permittedRules.length).toBeGreaterThan(0);

    for (const rule of permittedRules) {
      expect(rule.permittedEnvironments).toContain('COMPETITIVE_PROTECTED');
    }
  });

  it('should detect banned marketing claims with scanTextForAntiClaimViolations', () => {
    const safeText = 'CS2 Assistant is a non-invasive tactical companion consuming official GSI telemetry.';
    const unsafeText1 = 'Our overlay is 100% VAC safe and undetectable.';
    const unsafeText2 = 'This tool is officially Valve approved for Premier.';
    const unsafeText3 = 'Download the ultimate VAC-proof companion.';

    expect(scanTextForAntiClaimViolations(safeText).clean).toBe(true);

    const check1 = scanTextForAntiClaimViolations(unsafeText1);
    expect(check1.clean).toBe(false);
    expect(check1.violations[0].matchedPhrase).toBe('100% vac safe');

    const check2 = scanTextForAntiClaimViolations(unsafeText2);
    expect(check2.clean).toBe(false);
    expect(check2.violations[0].matchedPhrase).toBe('officially valve approved');

    const check3 = scanTextForAntiClaimViolations(unsafeText3);
    expect(check3.clean).toBe(false);
    expect(check3.violations[0].matchedPhrase).toBe('vac-proof');
  });
});

describe('Domain 9: Capability Gate Runtime Behavior', () => {
  it('should default to COMPETITIVE_PROTECTED environment (fail-safe closed)', () => {
    const gate = createCapabilityGate();
    expect(gate.currentEnvironment).toBe('COMPETITIVE_PROTECTED');
  });

  it('should permit core telemetry and reference features in COMPETITIVE_PROTECTED mode', () => {
    const gate = createCapabilityGate('COMPETITIVE_PROTECTED');

    expect(gate.isFeaturePermitted('gsi_http_listener')).toBe(true);
    expect(gate.isFeaturePermitted('gsi_delta_engine')).toBe(true);
    expect(gate.isFeaturePermitted('static_lineup_db')).toBe(true);
    expect(gate.isFeaturePermitted('svg_landmark_reference')).toBe(true);
    expect(gate.isFeaturePermitted('gsi_bomb_timer')).toBe(true);
    expect(gate.isFeaturePermitted('tactical_memory_provenance')).toBe(true);
    expect(gate.isFeaturePermitted('palace_observation_filter')).toBe(true);
    expect(gate.isFeaturePermitted('gemini_ai_tactical_coach')).toBe(true);
    expect(gate.isFeaturePermitted('history_match_analytics')).toBe(true);
    expect(gate.isFeaturePermitted('transparent_desktop_hud')).toBe(true);
  });

  it('should suppress sensitive alignment guidance in COMPETITIVE_PROTECTED mode', () => {
    const gate = createCapabilityGate('COMPETITIVE_PROTECTED');

    // Visual crosshair alignment aids must be disabled in ranked competitive play
    expect(gate.isFeaturePermitted('practice_lineup_alignment')).toBe(false);
    expect(gate.isFeaturePermitted('practice_trajectory_preview')).toBe(false);
    expect(gate.isFeaturePermitted('interactive_hud_preview')).toBe(false);

    const evalResult = gate.evaluateCapability('practice_lineup_alignment');
    expect(evalResult.permitted).toBe(false);
    expect(evalResult.reason).toContain("suppressed in 'COMPETITIVE_PROTECTED' mode");
  });

  it('should permit lineup alignment guidance in PRACTICE_SERVER mode', () => {
    const gate = createCapabilityGate('PRACTICE_SERVER');

    expect(gate.currentEnvironment).toBe('PRACTICE_SERVER');
    expect(gate.isFeaturePermitted('practice_lineup_alignment')).toBe(true);
    expect(gate.isFeaturePermitted('practice_trajectory_preview')).toBe(true);
    expect(gate.isFeaturePermitted('gsi_bomb_timer')).toBe(true);
    expect(gate.isFeaturePermitted('static_lineup_db')).toBe(true);
  });

  it('should permit interactive preview and demo walkthrough in SIMULATION_PREVIEW mode', () => {
    const gate = createCapabilityGate('SIMULATION_PREVIEW');

    expect(gate.currentEnvironment).toBe('SIMULATION_PREVIEW');
    expect(gate.isFeaturePermitted('interactive_hud_preview')).toBe(true);
    expect(gate.isFeaturePermitted('practice_lineup_alignment')).toBe(true);
    expect(gate.isFeaturePermitted('practice_trajectory_preview')).toBe(true);
  });

  it('should permanently deny all PROHIBITED features across ALL operational environments', () => {
    const environments: EnvironmentMode[] = ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'];
    const prohibitedIds = [
      'memory_reading',
      'dll_injection',
      'graphics_pipeline_hooking',
      'input_automation',
      'jumpthrow_recoil_macros',
      'esp_wallhack_overlay',
      'aim_assistance_triggerbot',
      'spectator_data_mining',
      'unauthorized_web_scraping',
    ];

    for (const env of environments) {
      const gate = createCapabilityGate(env);
      for (const id of prohibitedIds) {
        expect(gate.isFeaturePermitted(id)).toBe(false);

        const evaluation = gate.evaluateCapability(id);
        expect(evaluation.permitted).toBe(false);
        expect(evaluation.status).toBe('PROHIBITED');
        expect(evaluation.reason).toContain('PROHIBITED');
      }
    }
  });

  it('should deny unrecognized / unknown feature IDs (fail-safe closed)', () => {
    const gate = createCapabilityGate('SIMULATION_PREVIEW');

    expect(gate.isFeaturePermitted('arbitrary_malicious_hook')).toBe(false);
    expect(gate.isFeaturePermitted('')).toBe(false);

    const evaluation = gate.evaluateCapability('unknown_feature_xyz');
    expect(evaluation.permitted).toBe(false);
    expect(evaluation.status).toBe('UNKNOWN');
    expect(evaluation.reason).toContain('fail-safe closed');
  });

  it('should throw ComplianceViolationError when assertFeaturePermitted is called on a denied capability', () => {
    const gate = createCapabilityGate('COMPETITIVE_PROTECTED');

    expect(() => gate.assertFeaturePermitted('memory_reading')).toThrow(ComplianceViolationError);
    expect(() => gate.assertFeaturePermitted('practice_lineup_alignment')).toThrow(ComplianceViolationError);
    expect(() => gate.assertFeaturePermitted('unknown_capability')).toThrow(ComplianceViolationError);

    // Permitted capability must not throw
    expect(() => gate.assertFeaturePermitted('gsi_bomb_timer')).not.toThrow();
  });

  it('should notify registered listeners when the operational environment transitions', () => {
    const gate = createCapabilityGate('COMPETITIVE_PROTECTED');
    const listener = vi.fn();

    const unsubscribe = gate.onEnvironmentChange(listener);

    gate.setEnvironment('PRACTICE_SERVER');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('PRACTICE_SERVER', 'COMPETITIVE_PROTECTED');

    gate.setEnvironment('SIMULATION_PREVIEW');
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenCalledWith('SIMULATION_PREVIEW', 'PRACTICE_SERVER');

    // Setting same environment should not fire listener
    gate.setEnvironment('SIMULATION_PREVIEW');
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    gate.setEnvironment('COMPETITIVE_PROTECTED');
    expect(listener).toHaveBeenCalledTimes(2); // Listener unsubscribed
  });

  it('should return the correct list of permitted features when queried via getPermittedFeatures()', () => {
    const compGate = createCapabilityGate('COMPETITIVE_PROTECTED');
    const compPermitted = compGate.getPermittedFeatures();

    expect(compPermitted).toContain('gsi_bomb_timer');
    expect(compPermitted).not.toContain('practice_lineup_alignment');
    expect(compPermitted).not.toContain('memory_reading');

    const practiceGate = createCapabilityGate('PRACTICE_SERVER');
    const practicePermitted = practiceGate.getPermittedFeatures();

    expect(practicePermitted).toContain('practice_lineup_alignment');
    expect(practicePermitted).not.toContain('memory_reading');
    expect(practicePermitted.length).toBeGreaterThan(compPermitted.length);
  });
});
