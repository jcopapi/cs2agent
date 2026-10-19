/**
 * CS2 Assistant - Authoritative Compliance Matrix
 *
 * Defines the complete feature-by-feature compliance matrix, governing permissions across
 * COMPETITIVE_PROTECTED, PRACTICE_SERVER, and SIMULATION_PREVIEW environments.
 *
 * Pure TypeScript - Zero external dependencies.
 */

import {
  ComplianceCategory,
  ComplianceFeatureId,
  ComplianceStatus,
  EnvironmentMode,
  IFeatureComplianceRule,
  AntiClaimCheckResult,
} from './types';

/**
 * Authoritative registry of compliance rules for every capability in CS2 Assistant.
 */
export const COMPLIANCE_MATRIX: Record<ComplianceFeatureId, IFeatureComplianceRule> = Object.freeze({
  // --- TELEMETRY & GSI ---
  gsi_http_listener: {
    id: 'gsi_http_listener',
    name: 'GSI HTTP Telemetry Listener',
    status: 'VERIFIED_PERMITTED',
    category: 'TELEMETRY',
    description: 'Local HTTP server consuming Valve Game State Integration JSON push payloads.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Listens passively on localhost; does not touch CS2 process.',
    authorityJustification: 'Official Valve GSI API standard. Built-in game telemetry.',
  },
  gsi_delta_engine: {
    id: 'gsi_delta_engine',
    name: 'GSI Delta & State Parser',
    status: 'VERIFIED_PERMITTED',
    category: 'TELEMETRY',
    description: 'Parses incoming JSON deltas to track game lifecycle events.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'In-memory JSON processing with strict schema validation.',
    authorityJustification: 'Standard data parsing of official telemetry.',
  },

  // --- LINEUP & STRATEGY ---
  static_lineup_db: {
    id: 'static_lineup_db',
    name: 'Static Lineup & Strategy Database',
    status: 'VERIFIED_PERMITTED',
    category: 'STRATEGY_LINEUP',
    description: 'Pre-populated, verified offline database of lineups and multi-phase strategies.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Read-only local data access; zero process interaction.',
    authorityJustification: 'Steam Subscriber Agreement Sec. 4. Passive guide material.',
  },
  svg_landmark_reference: {
    id: 'svg_landmark_reference',
    name: 'SVG Visual Landmark Diagrams',
    status: 'VERIFIED_PERMITTED',
    category: 'STRATEGY_LINEUP',
    description: 'Compact vector graphics illustrating lineup pin positions and aim landmarks.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Rendered in companion UI window.',
    authorityJustification: 'Static visual reference; zero interaction with game client.',
  },
  custom_lineup_storage: {
    id: 'custom_lineup_storage',
    name: 'Custom Lineup & Collection Storage',
    status: 'VERIFIED_PERMITTED',
    category: 'STRATEGY_LINEUP',
    description: 'User creation, editing, and local JSON persistence of custom lineups.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Local file persistence with schema sanitization.',
    authorityJustification: 'Standard desktop user data management.',
  },
  match_prep_profiles: {
    id: 'match_prep_profiles',
    name: 'Match Preparation Profiles (Planning Mode)',
    status: 'VERIFIED_PERMITTED',
    category: 'STRATEGY_LINEUP',
    description: 'Pre-match strategy bindings loaded into Live Match and AI context.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Internal companion app state binding.',
    authorityJustification: 'Out-of-game tactical preparation.',
  },

  // --- BOMB & MEMORY ---
  gsi_bomb_timer: {
    id: 'gsi_bomb_timer',
    name: 'GSI-Synchronized Bomb Timer',
    status: 'VERIFIED_PERMITTED',
    category: 'BOMB_INTELLIGENCE',
    description: 'Digital countdown synchronized to official GSI bomb.state == "planted" event.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Synchronized purely via public GSI event timestamp and countdowns.',
    authorityJustification: 'Valve GSI Wiki. Relies only on public event broadcast.',
  },
  tactical_memory_provenance: {
    id: 'tactical_memory_provenance',
    name: 'Tactical Memory Provenance Engine',
    status: 'VERIFIED_PERMITTED',
    category: 'TACTICAL_MEMORY',
    description: 'Maintains round history with CONFIRMED, REPORTED, and INFERRED labels.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Internal analytical memory model; zero game intrusion.',
    authorityJustification: 'Mathematical analysis of legally acquired telemetry.',
  },
  palace_observation_filter: {
    id: 'palace_observation_filter',
    name: 'Palace Observation vs Killer Filter',
    status: 'VERIFIED_PERMITTED',
    category: 'TACTICAL_MEMORY',
    description: 'Guarantees victim death location never misclassifies killer location.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Strict provenance separation logic in Tactical Memory.',
    authorityJustification: 'Fair Play Invariant. Eliminates speculative false intelligence.',
  },
  memory_decay_round_purge: {
    id: 'memory_decay_round_purge',
    name: 'Memory Decay & Round Boundary Wipe',
    status: 'VERIFIED_PERMITTED',
    category: 'TACTICAL_MEMORY',
    description: 'Applies time-decay curves to observations and wipes 100% of spatial data on round end.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Deterministic TTL and event listener on round.phase == "over".',
    authorityJustification: 'Fair Play Invariant. Prevents cross-round ghosting.',
  },

  // --- ANALYTICS & HISTORY ---
  history_match_analytics: {
    id: 'history_match_analytics',
    name: 'Post-Match Analytics & Match History',
    status: 'VERIFIED_PERMITTED',
    category: 'TACTICAL_MEMORY',
    description: 'Chronological match records separating measured statistics from AI interpretation.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Offline SQLite / disk database aggregation.',
    authorityJustification: 'Standard post-game statistical review.',
  },
  practice_retake_trigger: {
    id: 'practice_retake_trigger',
    name: 'History to Utility Room Practice Trigger',
    status: 'VERIFIED_PERMITTED',
    category: 'STRATEGY_LINEUP',
    description: 'One-click deep-link opening specific lineups/strategies in Utility Room.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Internal UI navigation transition.',
    authorityJustification: 'Application workflow completion; zero game interaction.',
  },

  // --- AI COACH ---
  gemini_ai_tactical_coach: {
    id: 'gemini_ai_tactical_coach',
    name: 'Gemini AI Tactical Coach',
    status: 'VERIFIED_PERMITTED',
    category: 'AI_COACH',
    description: 'Asynchronous tactical coaching recommendations between rounds via Google Gemini API.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Out-of-band HTTPS client; rate-limited and token-budgeted.',
    authorityJustification: 'Valve Major & ESL Rules. High-level advice between rounds.',
  },
  stale_ai_response_validation: {
    id: 'stale_ai_response_validation',
    name: 'Stale AI Response Validation',
    status: 'VERIFIED_PERMITTED',
    category: 'AI_COACH',
    description: 'Rejects recommendations that arrive after freeze time ends or round has transitioned.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Timestamp and round ID validation on incoming responses.',
    authorityJustification: 'Fair Play Invariant. No live advice delivery during active gunfights.',
  },

  // --- OVERLAY & HUD (REQUIRES APPROVAL / GATED) ---
  transparent_desktop_hud: {
    id: 'transparent_desktop_hud',
    name: 'Transparent Desktop HUD Window',
    status: 'REQUIRES_APPROVAL',
    category: 'OVERLAY_HUD',
    description: 'Electron borderless transparent window with click-through input pass-through.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Uses OS desktop transparency and setIgnoreMouseEvents(true).',
    authorityJustification: 'CS2 Trusted Mode FAQ. Standard OS window; zero process injection.',
  },
  hud_priority_arbitrage: {
    id: 'hud_priority_arbitrage',
    name: 'HUD Module Priority Arbitrage',
    status: 'REQUIRES_APPROVAL',
    category: 'OVERLAY_HUD',
    description: 'Priority-based collision resolution for HUD modules (Critical -> Passive).',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Central UI layout manager.',
    authorityJustification: 'Fair Play Invariant. Eliminates visual obstruction during critical moments.',
  },
  cs2_safe_zone_enforcement: {
    id: 'cs2_safe_zone_enforcement',
    name: 'CS2 Screen Safe Zone Enforcement',
    status: 'REQUIRES_APPROVAL',
    category: 'OVERLAY_HUD',
    description: 'Guarantees zero overlays in crosshair (450x450px), radar, and status HUD zones.',
    permittedEnvironments: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Hardcoded exclusion geometry in overlay renderer.',
    authorityJustification: 'Fair Play Invariant. Prevents center-screen assistance in ranked play.',
  },
  practice_lineup_alignment: {
    id: 'practice_lineup_alignment',
    name: 'Lineup Real-Time Crosshair Alignment',
    status: 'REQUIRES_APPROVAL',
    category: 'OVERLAY_HUD',
    description: 'Real-time visual crosshair landmarks and angle alignment guides.',
    permittedEnvironments: ['PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Strictly gated off in COMPETITIVE_PROTECTED; UI falls back to passive cards.',
    authorityJustification: 'Tournament & Fair Play Rules. Real-time alignment prohibited in ranked play.',
  },
  practice_trajectory_preview: {
    id: 'practice_trajectory_preview',
    name: 'Practice Grenade Trajectory Preview',
    status: 'REQUIRES_APPROVAL',
    category: 'OVERLAY_HUD',
    description: 'Visual grenade trajectory flight path simulation.',
    permittedEnvironments: ['PRACTICE_SERVER', 'SIMULATION_PREVIEW'],
    enforcement: 'Gated off in COMPETITIVE_PROTECTED.',
    authorityJustification: 'Tournament & Fair Play Rules. Permitted only in offline training environments.',
  },
  interactive_hud_preview: {
    id: 'interactive_hud_preview',
    name: 'Interactive HUD Simulation & Calibration',
    status: 'REQUIRES_APPROVAL',
    category: 'OVERLAY_HUD',
    description: 'Interactive preview allowing dragging, scaling, and opacity testing of HUD elements.',
    permittedEnvironments: ['SIMULATION_PREVIEW'],
    enforcement: 'Active solely in offline simulation canvas.',
    authorityJustification: 'Sandbox calibration; completely disconnected from game client.',
  },

  // --- PROHIBITED CAPABILITIES (ZERO CODE PATHS EXIST) ---
  memory_reading: {
    id: 'memory_reading',
    name: 'Process Memory Reading / Inspection',
    status: 'PROHIBITED',
    category: 'PROHIBITED_CHEATING',
    description: 'Scanning or querying cs2.exe virtual memory pages or offsets.',
    permittedEnvironments: [],
    enforcement: 'Zero Win32 API calls; zero implementation.',
    authorityJustification: 'Valve Anti-Cheat (VAC) Guide. Direct ban trigger.',
  },
  dll_injection: {
    id: 'dll_injection',
    name: 'DLL Injection / Foreign Code Execution',
    status: 'PROHIBITED',
    category: 'PROHIBITED_CHEATING',
    description: 'Injecting dynamic link libraries or executing code within cs2.exe process space.',
    permittedEnvironments: [],
    enforcement: 'Zero Win32 API calls; zero implementation.',
    authorityJustification: 'CS2 Trusted Mode FAQ & VAC Guide. Direct ban trigger.',
  },
  graphics_pipeline_hooking: {
    id: 'graphics_pipeline_hooking',
    name: 'Direct3D / Vulkan Pipeline Hooking',
    status: 'PROHIBITED',
    category: 'PROHIBITED_CHEATING',
    description: 'Hooking DirectX or Vulkan swap chains to draw directly into game frames.',
    permittedEnvironments: [],
    enforcement: 'Zero graphics hooking libraries; desktop transparency only.',
    authorityJustification: 'CS2 Trusted Mode FAQ. Triggers immediate untrusted block.',
  },
  input_automation: {
    id: 'input_automation',
    name: 'Keystroke & Mouse Input Automation',
    status: 'PROHIBITED',
    category: 'PROHIBITED_CHEATING',
    description: 'Synthesizing input events sent to the Counter-Strike 2 window.',
    permittedEnvironments: [],
    enforcement: 'Zero SendInput, mouse_event, or keybd_event invocations.',
    authorityJustification: 'Steam Subscriber Agreement Sec. 4. Macro automation ban.',
  },
  jumpthrow_recoil_macros: {
    id: 'jumpthrow_recoil_macros',
    name: 'Jumpthrow & Recoil Compensation Macros',
    status: 'PROHIBITED',
    category: 'PROHIBITED_CHEATING',
    description: 'Hardware or software automation of throw timing or spray patterns.',
    permittedEnvironments: [],
    enforcement: 'Zero implementation; strictly rejected in code design.',
    authorityJustification: 'Valve Major Rulebook & ESL Rules. Prohibited assist script.',
  },
  esp_wallhack_overlay: {
    id: 'esp_wallhack_overlay',
    name: 'Real-Time Wallhack / ESP Overlay',
    status: 'PROHIBITED',
    category: 'PROHIBITED_CHEATING',
    description: 'Projecting opponent bounding boxes or locations through walls.',
    permittedEnvironments: [],
    enforcement: 'Zero spatial projection; coordinates not available in competitive GSI.',
    authorityJustification: 'Valve Anti-Cheat (VAC) Guide. Blatant cheating violation.',
  },
  aim_assistance_triggerbot: {
    id: 'aim_assistance_triggerbot',
    name: 'Aim Assistance / Auto-Shoot Triggerbot',
    status: 'PROHIBITED',
    category: 'PROHIBITED_CHEATING',
    description: 'Modifying crosshair trajectory or automatically triggering weapon fire.',
    permittedEnvironments: [],
    enforcement: 'Zero implementation; zero mouse control code.',
    authorityJustification: 'Valve Anti-Cheat (VAC) Guide. Blatant cheating violation.',
  },
  spectator_data_mining: {
    id: 'spectator_data_mining',
    name: 'Spectator Telemetry Mining in Competitive Mode',
    status: 'PROHIBITED',
    category: 'PROHIBITED_CHEATING',
    description: 'Attempting to extract allplayers or enemy coordinates in competitive matches.',
    permittedEnvironments: [],
    enforcement: 'GSI payload sanitizer unconditionally strips allplayers in competitive.',
    authorityJustification: 'Fair Play Invariant. Eliminates ghosting telemetry.',
  },
  unauthorized_web_scraping: {
    id: 'unauthorized_web_scraping',
    name: 'Unauthorized Web Scraping',
    status: 'PROHIBITED',
    category: 'PROHIBITED_CHEATING',
    description: 'Automated scraping bots targeting third-party tactical websites.',
    permittedEnvironments: [],
    enforcement: 'Zero scraping engines; static verified datasets and user imports only.',
    authorityJustification: 'Terms of Service & Copyright compliance.',
  },
});

/**
 * Array of prohibited marketing and safety claims.
 */
export const BANNED_MARKETING_PHRASES: readonly string[] = Object.freeze([
  'vac-proof',
  'vac proof',
  '100% vac safe',
  '100% vac-safe',
  'officially valve approved',
  'valve approved',
  'valve certified',
  'whitelisted by valve',
  'valve whitelisted',
  'anti-vac',
]);

/**
 * Retrieves the compliance rule for a specific feature ID.
 */
export function getComplianceRule(featureId: string): IFeatureComplianceRule | undefined {
  return COMPLIANCE_MATRIX[featureId as ComplianceFeatureId];
}

/**
 * Returns an array of all registered compliance rules.
 */
export function getAllComplianceRules(): readonly IFeatureComplianceRule[] {
  return Object.values(COMPLIANCE_MATRIX);
}

/**
 * Returns all compliance rules filtered by their regulatory classification.
 */
export function getRulesByStatus(status: ComplianceStatus): readonly IFeatureComplianceRule[] {
  return getAllComplianceRules().filter((rule) => rule.status === status);
}

/**
 * Returns all compliance rules permitted in a specific environment mode.
 */
export function getRulesByEnvironment(env: EnvironmentMode): readonly IFeatureComplianceRule[] {
  return getAllComplianceRules().filter((rule) => rule.permittedEnvironments.includes(env));
}

/**
 * Validates the internal consistency and invariants of the compliance matrix.
 */
export function validateMatrixIntegrity(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const rules = getAllComplianceRules();

  for (const rule of rules) {
    // Invariant 1: Prohibited features must NEVER have permitted environments
    if (rule.status === 'PROHIBITED' && rule.permittedEnvironments.length > 0) {
      errors.push(`Prohibited feature ${rule.id} has non-empty permittedEnvironments: ${rule.permittedEnvironments.join(', ')}`);
    }

    // Invariant 2: Permitted and Requires Approval must have at least one environment
    if (rule.status !== 'PROHIBITED' && rule.permittedEnvironments.length === 0) {
      errors.push(`Active feature ${rule.id} has no permittedEnvironments specified.`);
    }

    // Invariant 3: Unique feature ID match
    if (rule.id !== COMPLIANCE_MATRIX[rule.id]?.id) {
      errors.push(`Feature ID mismatch for ${rule.id}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Scans a given text string for prohibited marketing claims.
 */
export function scanTextForAntiClaimViolations(text: string): AntiClaimCheckResult {
  const normalized = text.toLowerCase();
  const violations: { matchedPhrase: string; snippet: string }[] = [];

  for (const phrase of BANNED_MARKETING_PHRASES) {
    const index = normalized.indexOf(phrase);
    if (index !== -1) {
      const start = Math.max(0, index - 25);
      const end = Math.min(text.length, index + phrase.length + 25);
      violations.push({
        matchedPhrase: phrase,
        snippet: text.substring(start, end).trim(),
      });
    }
  }

  return {
    clean: violations.length === 0,
    violations,
  };
}
