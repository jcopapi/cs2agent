/**
 * CS2 Assistant - Live Match & Tactical Memory Domain Types
 * File: src/core/match/types.ts
 */

import type {
  CS2Map,
  TeamSide,
  ProvenanceLevel,
  TacticalObservation,
} from '../../shared/ipc-types';

export type { CS2Map, TeamSide, ProvenanceLevel, TacticalObservation };

export type StalenessTier = 'FRESH' | 'AGING' | 'STALE' | 'EXPIRED';

export interface DataSourceCapabilities {
  sourceType: 'GSI_LIVE' | 'SIMULATION' | 'MANUAL_ONLY' | 'DISCONNECTED';
  providesPlayerCoordinates: boolean;
  providesViewAngles: boolean;
  providesUtilityInventory: boolean;
  providesThrowConfirmation: boolean;
  providesExactBombPlantTime: boolean;
  providesObserverAllPlayers: boolean;
}

export interface RawGsiPayload {
  provider?: {
    name?: string;
    appid?: number;
    version?: number;
    steamid?: string;
    timestamp?: number;
  };
  map?: {
    mode?: string;
    name?: string;
    phase?: 'warmup' | 'live' | 'intermission' | 'gameover';
    round?: number;
    team_ct?: { score?: number; timeouts_remaining?: number };
    team_t?: { score?: number; timeouts_remaining?: number };
  };
  round?: {
    phase?: 'freezetime' | 'live' | 'over';
    win_team?: 'CT' | 'T';
    bomb?: 'planted' | 'defused' | 'exploded';
  };
  player?: {
    steamid?: string;
    name?: string;
    team?: 'CT' | 'T';
    activity?: 'playing' | 'menu' | 'textinput';
    position?: string; // "x, y, z"
    forward?: string;  // "pitch, yaw, roll" or vector
    state?: {
      health?: number;
      armor?: number;
      helmet?: boolean;
      flashed?: number;
      burning?: number;
      money?: number;
      round_kills?: number;
      defusekit?: boolean;
    };
    match_stats?: {
      kills?: number;
      assists?: number;
      deaths?: number;
      mvps?: number;
      score?: number;
    };
    weapons?: Record<
      string,
      {
        name?: string;
        type?: string;
        state?: 'active' | 'holstered';
        ammo_clip?: number;
      }
    >;
  };
  bomb?: {
    state?: 'carried' | 'dropped' | 'planting' | 'planted' | 'defusing' | 'defused' | 'exploded';
    position?: string;
    countdown?: string;
    player?: string;
  };
  auth?: {
    token?: string;
  };
}

export interface NormalizedGameEvent {
  eventId: string;
  eventType:
    | 'ROUND_START'
    | 'ROUND_END'
    | 'BOMB_PLANTED'
    | 'BOMB_DEFUSED'
    | 'BOMB_EXPLODED'
    | 'PLAYER_ELIMINATED'
    | 'ENEMY_OBSERVED'
    | 'TEAMMATE_CALLOUT'
    | 'UTILITY_DETONATED'
    | 'ROTATION_REPORTED'
    | 'LINEUP_EXECUTED'
    | 'MAP_CHANGED'
    | 'MATCH_DISCONNECTED';
  timestamp: number;
  roundId: number;
  map: CS2Map | string;
  source: 'GSI_TELEMETRY' | 'KILLFEED' | 'AUDIO_RADAR' | 'MANUAL_REPORT' | 'SIMULATION';
  provenance: ProvenanceLevel;
  confidenceScore: number; // 0.0 to 1.0
  subjectPlayer?: {
    name: string;
    team: TeamSide;
    slot?: number;
  };
  actorPlayer?: {
    name: string;
    team: TeamSide;
    slot?: number;
    confirmedLocation?: string;
  };
  confirmedLocation?: {
    callout: string;
    x?: number;
    y?: number;
    z?: number;
  };
  inferredHypothesis?: string;
  ttlMs?: number;
}

export interface LastKnownEnemyAnnotation {
  observationId: string;
  playerName: string;
  team: TeamSide;
  lastSeenCallout: string;
  elapsedSeconds: number;
  source: string;
  provenance: ProvenanceLevel;
  confidenceScore: number;
  opacity: number;
  stalenessTier: StalenessTier;
  expiresAt: number;
}

export interface EliminationRecordInput {
  eventId?: string;
  victimName: string;
  victimTeam: TeamSide;
  victimCallout: string;
  victimCoords?: { x: number; y: number; z: number };
  killerName: string;
  killerTeam: TeamSide;
  killerIndependentlyObservedCallout?: string;
  weapon?: string;
  roundId: number;
  map: CS2Map | string;
  timestamp: number;
}

export interface TacticalMemoryRecord extends TacticalObservation {
  confidenceScore: number;
  inferredHypothesis?: string;
  actorName?: string;
  actorLocationConfirmed: boolean;
}
