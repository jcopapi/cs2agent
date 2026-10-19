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
