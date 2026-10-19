/**
 * CS2 Assistant - Core Compliance Types
 *
 * Authoritative type definitions governing capability gating, regulatory classifications,
 * anti-cheat invariants, and environment runtime boundaries.
 *
 * Pure TypeScript - Zero external dependencies.
 */

/**
 * Operational environment modes recognized by the compliance layer.
 */
export type EnvironmentMode = 'COMPETITIVE_PROTECTED' | 'PRACTICE_SERVER' | 'SIMULATION_PREVIEW';

/**
 * Regulatory classification tiers for application capabilities.
 */
export type ComplianceStatus = 'VERIFIED_PERMITTED' | 'REQUIRES_APPROVAL' | 'PROHIBITED';

/**
 * Functional category classification for features.
 */
export type ComplianceCategory =
  | 'TELEMETRY'
  | 'TACTICAL_MEMORY'
  | 'STRATEGY_LINEUP'
  | 'BOMB_INTELLIGENCE'
  | 'OVERLAY_HUD'
  | 'AI_COACH'
  | 'PROHIBITED_CHEATING';

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
  | 'unauthorized_web_scraping';

/**
 * Rule definition for a specific feature in the compliance matrix.
 */
export interface IFeatureComplianceRule {
  readonly id: ComplianceFeatureId;
  readonly name: string;
  readonly status: ComplianceStatus;
  readonly category: ComplianceCategory;
  readonly description: string;
  readonly permittedEnvironments: readonly EnvironmentMode[];
  readonly enforcement: string;
  readonly authorityJustification: string;
}

/**
 * Result returned when evaluating a capability's permission state.
 */
export interface CapabilityEvaluationResult {
  readonly permitted: boolean;
  readonly featureId: string;
  readonly environment: EnvironmentMode;
  readonly status: ComplianceStatus | 'UNKNOWN';
  readonly reason: string;
  readonly rule?: IFeatureComplianceRule;
}

/**
 * Listener callback signature for environment mode changes.
 */
export type EnvironmentChangeListener = (newEnv: EnvironmentMode, oldEnv: EnvironmentMode) => void;

/**
 * Interface for the runtime Capability Gating Engine.
 */
export interface ICapabilityGate {
  /**
   * The active operational environment.
   */
  readonly currentEnvironment: EnvironmentMode;

  /**
   * Updates the active operational environment.
   * Dispatches change events to all registered listeners.
   */
  setEnvironment(env: EnvironmentMode): void;

  /**
   * Quick boolean check determining if a feature is permitted in the current environment.
   */
  isFeaturePermitted(featureId: string): boolean;

  /**
   * Returns a list of all feature IDs currently permitted in the active environment.
   */
  getPermittedFeatures(): string[];

  /**
   * Retrieves the compliance rule for a specific feature, if known.
   */
  getFeatureRule(featureId: string): IFeatureComplianceRule | undefined;

  /**
   * Performs an in-depth capability evaluation returning a detailed explanation.
   */
  evaluateCapability(featureId: string): CapabilityEvaluationResult;

  /**
   * Asserts that a feature is permitted, throwing ComplianceViolationError if not.
   */
  assertFeaturePermitted(featureId: string): void;

  /**
   * Registers a listener callback invoked whenever the operational environment changes.
   * Returns an unregister function.
   */
  onEnvironmentChange(listener: EnvironmentChangeListener): () => void;
}

/**
 * Result of an Anti-Claim static scan.
 */
export interface AntiClaimCheckResult {
  readonly clean: boolean;
  readonly violations: readonly {
    readonly matchedPhrase: string;
    readonly snippet: string;
  }[];
}
