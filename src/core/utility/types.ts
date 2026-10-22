/**
 * CS2 Assistant - Core Utility Domain Types & Schemas
 * File: src/core/utility/types.ts
 *
 * Defines the normalized data model for Counter-Strike 2 utility lineups,
 * multi-phase strategies, match preparation profiles, and external provider contracts.
 */

import type {
  CS2Map,
  TeamSide,
  StrategyTier,
  CompletionType,
} from '../../shared/ipc-types';

export type { CS2Map, TeamSide, StrategyTier, CompletionType };

export type UtilityType =
  | 'SMOKE'
  | 'FLASHBANG'
  | 'MOLOTOV'
  | 'MOLOTOV_INCENDIARY'
  | 'HE_GRENADE';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export type LineupTechnique =
  | 'STAND'
  | 'JUMPTHROW'
  | 'RUN'
  | 'RUN_JUMPTHROW'
  | 'CROUCH'
  | 'CROUCH_JUMPTHROW'
  | 'STANDING'
  | 'WALK_THROW';

export type LineupTickrate = 'SUBTICK_CS2' | '64' | '128';

export interface ThrowPosition extends Vector3D {
  description: string;
  callout: string;
  toleranceUnits?: number; // Distance tolerance in CS2 game units (default: 8 units)
}

export interface CrosshairTarget {
  pitch: number; // Vertical angle in degrees (-89° straight up to 89° straight down)
  yaw: number; // Horizontal angle in degrees (-180° to 180°)
  description: string; // Explicit visual instruction
  svgAlignment: string; // SVG diagram showing reticle placement relative to geometry
  visualLandmark?: string; // Descriptive landmark name (e.g. "Antenna wire tip")
}

export interface LandingArea extends Vector3D {
  callout: string; // Standard competitive callout name (e.g. "A Stairs", "Xbox")
  description?: string;
}

export interface Lineup {
  id: string;
  map: CS2Map;
  title: string;
  side: TeamSide;
  utilityType: UtilityType;
  technique: LineupTechnique;
  throwType: 'STANDING' | 'JUMPTHROW' | 'RUN_JUMPTHROW' | 'CROUCH_JUMPTHROW' | 'WALK_THROW';

  // Spatial Positioning
  throwPosition: ThrowPosition;
  startPosition: { x: number; y: number; z: number; callout: string; toleranceUnits?: number };

  // Aiming Reference
  crosshairTarget: CrosshairTarget;
  aimReference: {
    crosshairPlacement: string;
    visualLandmark: string;
  };
  svgReference: string; // Standalone SVG string
  imageUrl?: string; // Real CSNADES first-person screenshot
  thumbnailUrl?: string; // Real CSNADES result/landing screenshot
  standImageUrl?: string; // Real or schematic stand positioning screenshot
  resultImageUrl?: string; // Real CSNADES result/bloom screenshot

  // Landing Target
  landingArea: LandingArea;
  targetDestination: { x: number; y: number; z: number; callout: string };

  // Execution Dynamics
  movementKey?: string; // 'NONE' | 'W' | 'W+JUMP' | 'SHIFT+W' | 'A' | 'D'
  movementRequirements: string;
  tickrate: LineupTickrate; // 'SUBTICK_CS2'

  // Organization & Metadata
  tags: string[];
  isCustom: boolean;
  favorite: boolean;
  instructions: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  sourceAttribution: string;
  verified: boolean;
  gameVersion: string;
  lastVerificationDate: string;
}

export interface LineupFilter {
  map?: CS2Map;
  side?: TeamSide | 'ALL';
  utilityType?: UtilityType | 'ALL';
  technique?: LineupTechnique | 'ALL';
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  tag?: string;
  isCustom?: boolean;
  favorite?: boolean;
  searchQuery?: string;
}

// ----------------------------------------------------------------------------
// Strategy & Tactical Playbook Contracts
// ----------------------------------------------------------------------------

export type PlayerRole = 'Entry' | 'Support' | 'Lurk' | 'Anchor' | 'IGL' | 'Rotator' | string;

export type PhaseType =
  | 'DEFAULT_PREPARATION'
  | 'EXECUTE_INITIAL'
  | 'FLASH_ENTRY'
  | 'SITE_CLEAR'
  | 'PLANT_DEFUSE'
  | 'POST_PLANT'
  | 'RETAKE_INITIATION'
  | 'RETAKE_CLEAR'
  | 'FALLBACK_RESET';

export type StrategyActionType =
  | 'THROW_UTILITY'
  | 'HOLD_ANGLE'
  | 'PUSH_SITE'
  | 'CLEAR_POSITION'
  | 'START_DEFUSE'
  | 'START_PLANT'
  | 'DROP_UTILITY';

export type SyncGateType =
  | 'TIME_ELAPSED'
  | 'ALL_LINEUPS_EXECUTED'
  | 'UTILITY_LANDED'
  | 'POSITION_REACHED'
  | 'MANUAL_TRIGGER';

export interface SyncGate {
  gateId: string;
  type: SyncGateType;
  description: string;
  thresholdSeconds?: number;
  requiredLineupIds?: string[];
  requiredCallout?: string;
  satisfied?: boolean;
}

export interface StrategyStep {
  stepId: string;
  phaseNumber: number;
  timingOffsetSeconds: number;
  durationSeconds?: number;
  role: PlayerRole;
  actionType: StrategyActionType;
  lineupId?: string;
  targetCallout: string;
  description: string;
  prerequisiteStepIds?: string[];
  isParallelWith?: string[];
  contingencyFallback?: string;
}

export interface TacticalPhase {
  phaseNumber: number;
  phaseId?: string;
  phaseType?: PhaseType;
  name: string;
  timingSeconds: number;
  durationSeconds?: number;
  instructions: string;
  gates?: SyncGate[];
  steps?: StrategyStep[];
  linkedLineupIds: string[];
  keyCallout?: string;
}

export type StrategyPhase = TacticalPhase;

export interface StrategyContingency {
  trigger: string;
  action: string;
  fallbackPhaseNumber?: number;
}

export interface Strategy {
  id: string;
  name: string;
  map: CS2Map;
  side: TeamSide;
  objective: string;
  difficulty: StrategyTier; // BASIC | INTERMEDIATE | ADVANCED | COORDINATED
  requiredUtility: UtilityType[];
  recommendedRoles: PlayerRole[];
  phases: TacticalPhase[];
  contingencies: StrategyContingency[];
  coordinationNotes: string;
  sourceAttribution: string;
  tags?: string[];
  isCustom?: boolean;
  favorite?: boolean;
  verified?: boolean;
  gameVersion?: string;
  lastVerificationDate?: string;
}

export interface StrategyFilter {
  map?: CS2Map;
  side?: TeamSide | 'ALL';
  difficulty?: StrategyTier | 'ALL';
  searchQuery?: string;
}

// ----------------------------------------------------------------------------
// Match Preparation & Collections
// ----------------------------------------------------------------------------

export interface MatchPreparationProfile {
  profileId: string;
  name: string;
  map: CS2Map;
  side: TeamSide;
  selectedLineupIds: string[];
  selectedStrategyIds: string[];
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
  author?: string;
  isDefault?: boolean;
  activeStrategies?: string[];
  favoriteLineups?: string[];
}

export interface LineupCollection {
  collectionId: string;
  name: string;
  description: string;
  map: CS2Map;
  lineupIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// External Provider URL Contracts
// ----------------------------------------------------------------------------

export type ExternalProvider = 'CSNADES' | 'SCOPE_GG';

export interface ProviderUrlResult {
  provider: ExternalProvider;
  url: string;
  label: string;
}
