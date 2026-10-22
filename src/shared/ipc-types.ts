/**
 * CS2 Assistant - Shared IPC and Domain Contracts
 * File: src/shared/ipc-types.ts
 *
 * Single source of truth for IPC signatures, data transfer objects,
 * and the window.cs2Assistant global interface contract.
 */

import type { EnvironmentMode } from '../core/compliance/types';

export type { EnvironmentMode };

export type CS2Map = 'de_mirage' | 'de_inferno' | 'de_dust2' | 'de_nuke' | 'de_ancient' | 'de_anubis';
export type TeamSide = 'CT' | 'T' | 'BOTH';
export type UtilityType = 'SMOKE' | 'FLASHBANG' | 'MOLOTOV' | 'HE_GRENADE' | 'MOLOTOV_INCENDIARY';
export type StrategyTier = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'COORDINATED';
export type ProvenanceLevel = 'CONFIRMED' | 'REPORTED' | 'INFERRED';
export type LineupFsmState = 'INACTIVE' | 'NEARBY' | 'POSITIONING' | 'ALIGNING' | 'READY' | 'EXECUTED' | 'NEXT';
export type CompletionType = 'Attempted' | 'Confirmed thrown' | 'Confirmed landed' | 'Manually completed';

export interface GsiStatus {
  listening: boolean;
  port: number;
  clientConnected: boolean;
  authenticated: boolean;
  lastHeartbeat: number | null;
  environment: EnvironmentMode;
  activeMatch: boolean;
  map?: string;
  mode?: string;
  mapPhase?: string;
  round?: number;
  roundPhase?: string;
  ctScore?: number;
  tScore?: number;
  playerName?: string;
  playerTeam?: TeamSide;
  playerHealth?: number;
  playerArmor?: number;
  playerHelmet?: boolean;
  playerMoney?: number;
  playerEquipValue?: number;
  playerKills?: number;
  playerAssists?: number;
  playerDeaths?: number;
  activeWeapon?: string;
  weapons?: string[];
  hasDefuseKit?: boolean;
  playerPosition?: { x: number; y: number; z: number };
  playerAngles?: { pitch: number; yaw: number };
  playerPlace?: string;
  cfgInstalled?: boolean;
  cfgPath?: string;
}

export interface TacticalObservation {
  eventId: string;
  type: 'KILL' | 'BOMB_PLANT' | 'BOMB_DEFUSE' | 'DAMAGE' | 'POSITION_REPORT';
  timestamp: number;
  roundId: number;
  map: CS2Map | string;
  source: 'GSI_TELEMETRY' | 'KILLFEED' | 'AUDIO_RADAR' | 'MANUAL_REPORT';
  playerIdentity?: { team: TeamSide; name: string; slot: number };
  location?: { callout: string; x?: number; y?: number; z?: number };
  confidence: ProvenanceLevel;
  expiresAt: number;
}

export interface BombState {
  planted: boolean;
  plantTime: number;
  defuseTimeRemaining: number | null;
  countdownSeconds: number;
  site: 'A' | 'B' | null;
  defusing: boolean;
  hasKit: boolean;
  canDefuse: boolean;
}

export interface Lineup {
  id: string;
  map: CS2Map;
  side: TeamSide;
  utilityType: UtilityType;
  title: string;
  startPosition: { x: number; y: number; z: number; callout: string; toleranceUnits?: number };
  targetDestination: { x: number; y: number; z: number; callout: string };
  throwType: 'STANDING' | 'JUMPTHROW' | 'RUN_JUMPTHROW' | 'CROUCH_JUMPTHROW' | 'WALK_THROW';
  movementRequirements: string;
  aimReference: { crosshairPlacement: string; visualLandmark: string };
  svgReference?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  standImageUrl?: string;
  resultImageUrl?: string;
  instructions: string[];
  titles?: Record<string, string>;
  instructionsI18n?: Record<string, string[]>;
  tags: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  sourceAttribution: string;
  verified: boolean;
  gameVersion: string;
  lastVerificationDate: string;
}

export interface LineupFilter {
  map?: CS2Map;
  side?: TeamSide;
  utilityType?: UtilityType;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  tag?: string;
}

export interface LineupExecutionState {
  state: LineupFsmState;
  activeLineupId: string | null;
  playerDistance: number;
  angleOffset: number;
  completionType: CompletionType | null;
  timestamp: number;
}

export interface Strategy {
  id: string;
  name: string;
  map: CS2Map;
  side: TeamSide;
  objective: string;
  difficulty: StrategyTier;
  requiredUtility: UtilityType[];
  recommendedRoles: string[];
  phases: Array<{
    phaseNumber: number;
    name: string;
    timingSeconds: number;
    linkedLineupIds: string[];
    instructions: string;
  }>;
  contingencies: Array<{ trigger: string; action: string }>;
  coordinationNotes: string;
  sourceAttribution: string;
}

export interface StrategyFilter {
  map?: CS2Map;
  side?: TeamSide;
  difficulty?: StrategyTier;
}

export interface MatchPreparationProfile {
  profileId: string;
  name: string;
  map: CS2Map;
  side: TeamSide;
  selectedLineupIds: string[];
  selectedStrategyIds: string[];
  active: boolean;
  createdAt: string;
}

export interface Play {
  id: string;
  name: string;
  map: CS2Map;
  side: TeamSide;
  description?: string;
  lineupIds: string[]; // Ordered list of lineup IDs
  createdAt: string;
  updatedAt?: string;
}

export interface MatchRecord {
  id: string;
  map: CS2Map;
  date: string;
  score: { ct: number; t: number };
  result: 'WIN' | 'LOSS' | 'TIE';
  measuredStats: {
    kills: number;
    deaths: number;
    adr: number;
    utilityDamage: number;
    flashAssists: number;
  };
  aiObservations?: string[];
  recommendedPractice?: {
    strategyId: string;
    label: string;
  };
}

export interface TacticalContext {
  map: string;
  round: number;
  score: { ct: number; t: number };
  side: TeamSide;
  alivePlayers: { ct: number; t: number };
  economy: {
    teamMoney: number;
    enemyEstimatedEconomy: 'FULL_ECO' | 'SEMI_ECO' | 'FORCE_BUY' | 'FULL_BUY';
  };
  bombPlanted: boolean;
  recentObservations: TacticalObservation[];
  activeLineup?: Lineup;
}

export interface TacticalRecommendation {
  recommendationId: string;
  type: 'EXECUTE_LINEUP' | 'FALLBACK_POSITION' | 'SAVE_EQUIPMENT' | 'CALL_TIMEOUT' | 'SILENCE';
  priority: 'CRITICAL' | 'CONTEXTUAL' | 'INFORMATIONAL' | 'PASSIVE';
  confidence: number;
  supportingEventIds: string[];
  shortDisplayText: string; // Max 45 characters
  detailedExplanation: string;
  suggestedLineupId?: string;
  expiresAt: number;
}

export interface AiUsageStats {
  totalRequests: number;
  cachedResponses: number;
  failedRequests: number;
  totalTokensEstimated: number;
  lastRequestTimestamp: number | null;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ScreenCorner = 'TOP_RIGHT' | 'TOP_LEFT' | 'BOTTOM_RIGHT' | 'BOTTOM_LEFT';

export interface HotkeyConfig {
  key?: string; // e.g. 'F1', 'CapsLock' (backward compat)
  mode?: 'TOGGLE' | 'HOLD'; // backward compat
  alignKey: string; // default 'CapsLock'
  alignMode: 'HOLD' | 'TOGGLE'; // default 'HOLD'
  alignOpacity: number; // default 0.5
  overlayKey: string; // default 'F1'
  overlayMode: 'HOLD' | 'TOGGLE'; // default 'TOGGLE'
  nextPixelKey: string; // default 'F2'
  cornerCardPosition: ScreenCorner; // default 'TOP_RIGHT'
  indicatorPosition: ScreenCorner; // default 'TOP_RIGHT'
  bombLatencyOffsetSec: number; // default 1.0
}

export interface HudConfig {
  enabled: boolean;
  scale: number;
  opacity: number;
  crosshairSafeZonePx: number; // default 450
  showRadarOverlay: boolean;
  showBombTimer: boolean;
  showPixelPhoto?: boolean;
  activeLineupPhoto?: Lineup | null;
  showLastSeen: boolean;
  showTacticalFeed: boolean;
  calibrationMode: boolean;
  hotkey?: HotkeyConfig;
}

export interface SafeZones {
  crosshair: Rect;
  radar: Rect;
  statusHud: Rect;
  killfeed: Rect;
}

export interface ComplianceState {
  environment: EnvironmentMode;
  permittedFeatures: string[];
  prohibitedFeatures: string[];
  activeRulesCount: number;
}

export interface ComplianceSource {
  id: string;
  name: string;
  url: string;
  verifiedDate: string;
  description: string;
}

/**
 * Authoritative Typed Electron IPC Contract.
 * Unifies ARCHITECTURE.md §6 namespaced methods and PROJECT.md §6 convenience methods.
 */
export interface ICS2AssistantAPI {
  // --- Game State Integration & Simulation ---
  gsi: {
    getStatus(): Promise<GsiStatus>;
    onStatusChange(callback: (status: GsiStatus) => void): () => void;
    setSimulationMode(enabled: boolean): Promise<void>;
    injectScenario(scenarioId: string): Promise<void>;
  };

  // --- Tactical Memory & Observations ---
  tactical: {
    getObservations(): Promise<TacticalObservation[]>;
    onObservationUpdate(callback: (obs: TacticalObservation[]) => void): () => void;
    getBombState(): Promise<BombState | null>;
    onBombUpdate(callback: (bomb: BombState | null) => void): () => void;
  };

  // --- Lineups & State Machine ---
  lineup: {
    getAll(filter?: LineupFilter): Promise<Lineup[]>;
    getById(id: string): Promise<Lineup | null>;
    save(lineup: Lineup): Promise<Lineup>;
    delete(id: string): Promise<boolean>;
    onExecutionStateChange(callback: (state: LineupExecutionState) => void): () => void;
    manualOverride(action: 'NEXT' | 'CANCEL' | 'COMPLETE'): Promise<void>;
  };

  // --- Strategies & Match Preparation Profiles ---
  strategy: {
    getAll(filter?: StrategyFilter): Promise<Strategy[]>;
    getById(id: string): Promise<Strategy | null>;
    save(strategy: Strategy): Promise<Strategy>;
    delete(id: string): Promise<boolean>;
    getActiveProfile(): Promise<MatchPreparationProfile | null>;
    setActiveProfile(profile: MatchPreparationProfile | null): Promise<void>;
  };

  // --- Global Overlay Flag ---
  isOverlay?: boolean;

  // --- Match History & Performance Analytics ---
  history: {
    getAll(): Promise<MatchRecord[]>;
    getById(id: string): Promise<MatchRecord | null>;
    save(record: MatchRecord): Promise<MatchRecord>;
    delete(id: string): Promise<boolean>;
  };

  // --- Gemini AI Tactical Coach ---
  gemini: {
    hasKey(): Promise<boolean>;
    storeKey(key: string): Promise<boolean>;
    removeKey(): Promise<boolean>;
    testKey(key: string): Promise<{ valid: boolean; latencyMs?: number; error?: string }>;
    requestAdvice(context: TacticalContext): Promise<TacticalRecommendation | null>;
    getUsageStats(): Promise<AiUsageStats>;
  };

  // --- HUD & Safe Overlay Management ---
  hud: {
    getConfig(): Promise<HudConfig>;
    updateConfig(config: Partial<HudConfig>): Promise<HudConfig>;
    setCalibrationMode(interactive: boolean): Promise<void>;
    getSafeZones(): Promise<SafeZones>;
    setActiveLineupPhoto(lineup: Lineup | null): Promise<void>;
    getActiveLineupPhoto(): Promise<Lineup | null>;
    toggleActiveLineupPhoto(): Promise<void>;
    setAlignState?(active: boolean): Promise<void>;
    getAlignState?(): Promise<boolean>;
    onAlignStateChange?(callback: (active: boolean) => void): () => void;
    getHotkeyConfig?(): Promise<HotkeyConfig>;
    setHotkeyConfig?(config: HotkeyConfig): Promise<HotkeyConfig>;
    onHotkeyConfigChange?(callback: (config: HotkeyConfig) => void): () => void;
    setMainWindowVisible?(visible: boolean): Promise<void>;
    getPlanStep?(): Promise<{ stepIndex: number; totalSteps: number; planName: string }>;
    onPlanStepChange?(callback: (data: { stepIndex: number; totalSteps: number; planName: string }) => void): () => void;
    onActiveLineupPhotoChange?(callback: (lineup: Lineup | null) => void): () => void;
    onConfigChange?(callback: (config: HudConfig) => void): () => void;
  };

  // --- Tactical Plays Sequencer ---
  play?: {
    nextPixel(): Promise<any>;
    setActivePlan?(plan: any, stepIndex?: number): Promise<void>;
    onNextPixel(callback: (data?: any) => void): () => void;
  };

  // --- Compliance & Capability Gating ---
  compliance: {
    getState(): Promise<ComplianceState>;
    setEnvironment(mode: EnvironmentMode): Promise<ComplianceState>;
    getPrimarySources(): Promise<ComplianceSource[]>;
  };

  // --- Top-Level Convenience Methods (PROJECT.md §6 Parity) ---
  getEnvironmentMode(): Promise<EnvironmentMode>;
  setEnvironmentMode(mode: EnvironmentMode): Promise<void>;
  saveApiKey(key: string): Promise<boolean>;
  getApiKey(): Promise<string | null>; // Returns masked key (AIzaSy...****) or null
  removeApiKey(): Promise<boolean>;
  testApiConnection(key: string): Promise<{ success: boolean; latencyMs?: number; error?: string }>;
  startGsiListener(port?: number): Promise<{ success: boolean; port: number }>;
  stopGsiListener(): Promise<void>;
  startSimulationMode(scenarioId: string): Promise<void>;
  stopSimulationMode(): Promise<void>;

  // Subscriptions
  onGsiUpdate(callback: (data: GsiStatus) => void): () => void;
  onTacticalRecommendation(callback: (rec: TacticalRecommendation) => void): () => void;
  onBombTimerUpdate(callback: (timer: BombState | null) => void): () => void;
  onLineupStateChange(callback: (state: LineupExecutionState) => void): () => void;
}

declare global {
  interface Window {
    cs2Assistant?: ICS2AssistantAPI;
  }
}
