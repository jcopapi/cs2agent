/**
 * CS2 Assistant - Runtime Capability Gating Engine
 *
 * Implements ICapabilityGate, enforcing strict capability gating across
 * COMPETITIVE_PROTECTED, PRACTICE_SERVER, and SIMULATION_PREVIEW environments.
 *
 * Fails safe closed: any unknown feature or unverified environment is denied.
 *
 * Pure TypeScript - Zero external dependencies.
 */

import {
  CapabilityEvaluationResult,
  ComplianceFeatureId,
  EnvironmentChangeListener,
  EnvironmentMode,
  ICapabilityGate,
  IFeatureComplianceRule,
} from './types';
import { COMPLIANCE_MATRIX, getComplianceRule } from './compliance-matrix';

/**
 * Custom error thrown when a prohibited or gated capability is invoked.
 */
export class ComplianceViolationError extends Error {
  public readonly featureId: string;
  public readonly environment: EnvironmentMode;
  public readonly reason: string;

  constructor(featureId: string, environment: EnvironmentMode, reason: string) {
    super(`Compliance Violation: Feature '${featureId}' is denied in environment '${environment}'. Reason: ${reason}`);
    this.name = 'ComplianceViolationError';
    this.featureId = featureId;
    this.environment = environment;
    this.reason = reason;
    Object.setPrototypeOf(this, ComplianceViolationError.prototype);
  }
}

/**
 * Concrete implementation of the ICapabilityGate interface.
 */
export class CapabilityGate implements ICapabilityGate {
  private _currentEnvironment: EnvironmentMode;
  private readonly _listeners: Set<EnvironmentChangeListener> = new Set();

  /**
   * Initializes the CapabilityGate. Defaults to 'COMPETITIVE_PROTECTED' (fail-safe closed).
   */
  constructor(initialEnvironment: EnvironmentMode = 'COMPETITIVE_PROTECTED') {
    this._currentEnvironment = initialEnvironment;
  }

  /**
   * The current operational environment mode.
   */
  public get currentEnvironment(): EnvironmentMode {
    return this._currentEnvironment;
  }

  /**
   * Updates the operational environment mode and notifies listeners.
   */
  public setEnvironment(newEnvironment: EnvironmentMode): void {
    if (newEnvironment === this._currentEnvironment) {
      return;
    }

    const previousEnvironment = this._currentEnvironment;
    this._currentEnvironment = newEnvironment;

    for (const listener of this._listeners) {
      try {
        listener(newEnvironment, previousEnvironment);
      } catch (err) {
        // Defensive: prevent faulty listener from breaking the gating engine
        console.error('Error in environment change listener:', err);
      }
    }
  }

  /**
   * Returns true if the specified feature is permitted in the active environment.
   * Unknown features fail safe and return false.
   */
  public isFeaturePermitted(featureId: string): boolean {
    const evaluation = this.evaluateCapability(featureId);
    return evaluation.permitted;
  }

  /**
   * Returns an array of all feature IDs permitted in the active environment.
   */
  public getPermittedFeatures(): string[] {
    const allRules = Object.values(COMPLIANCE_MATRIX);
    return allRules
      .filter((rule) => rule.permittedEnvironments.includes(this._currentEnvironment))
      .map((rule) => rule.id);
  }

  /**
   * Retrieves the compliance rule for a specific feature, if known.
   */
  public getFeatureRule(featureId: string): IFeatureComplianceRule | undefined {
    return getComplianceRule(featureId);
  }

  /**
   * Evaluates a capability and returns a structured result with explanation.
   */
  public evaluateCapability(featureId: string): CapabilityEvaluationResult {
    const rule = getComplianceRule(featureId);

    // Fail-safe closed 1: Unknown features are unconditionally denied
    if (!rule) {
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

  /**
   * Asserts that a capability is permitted, throwing ComplianceViolationError if denied.
   */
  public assertFeaturePermitted(featureId: string): void {
    const evaluation = this.evaluateCapability(featureId);
    if (!evaluation.permitted) {
      throw new ComplianceViolationError(featureId, this._currentEnvironment, evaluation.reason);
    }
  }

  /**
   * Registers a callback for environment changes. Returns an unregister function.
   */
  public onEnvironmentChange(listener: EnvironmentChangeListener): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }
}

/**
 * Factory function creating a new ICapabilityGate instance.
 */
export function createCapabilityGate(initialEnv?: EnvironmentMode): ICapabilityGate {
  return new CapabilityGate(initialEnv);
}
