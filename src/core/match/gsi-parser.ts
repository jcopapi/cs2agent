/**
 * CS2 Assistant - Official Valve Game State Integration (GSI) Parser & Cfg Generator
 * File: src/core/match/gsi-parser.ts
 *
 * Parses and validates JSON payloads emitted by CS2's authorized GSI subsystem.
 * Implements capability detection and strict separation between connected matches
 * and inactive/menu states.
 */

import type {
  RawGsiPayload,
  DataSourceCapabilities,
  NormalizedGameEvent,
  CS2Map,
} from './types';

export interface GsiParseResult {
  valid: boolean;
  authenticated: boolean;
  eligibleMatchDetected: boolean;
  error?: string;
  map: CS2Map | string | null;
  roundNumber: number;
  roundPhase: 'freezetime' | 'live' | 'over' | 'inactive';
  capabilities: DataSourceCapabilities;
  events: NormalizedGameEvent[];
  playerPosition?: { x: number; y: number; z: number };
  playerAngles?: { pitch: number; yaw: number };
  playerPlace?: string;
  activeWeapon?: string;
  hasDefuseKit: boolean;
  bombState?: {
    state: 'carried' | 'dropped' | 'planting' | 'planted' | 'defusing' | 'defused' | 'exploded';
    countdownSeconds?: number;
    site?: 'A' | 'B' | null;
  };
}

/**
 * Generates an official Valve KeyValues configuration file for CS2 Game State Integration.
 */
export function generateGsiConfigFile(port: number = 3001, authToken: string = 'cs2-assistant-local-token'): string {
  const safePort = Number.isInteger(port) && port > 0 && port <= 65535 ? port : 3001;
  const safeToken = String(authToken).replace(/["\\\r\n]/g, '');

  return `"CS2 Assistant Game State Integration"
{
  "uri" "http://127.0.0.1:${safePort}/gsi"
  "timeout" "5.0"
  "buffer"  "0.1"
  "throttle" "0.1"
  "heartbeat" "10.0"
  "auth"
  {
    "token" "${safeToken}"
  }
  "data"
  {
    "provider"            "1"
    "map"                 "1"
    "round"               "1"
    "player_id"           "1"
    "player_state"        "1"
    "player_weapons"      "1"
    "player_match_stats"  "1"
    "player_position"     "1"
    "bomb"                "1"
    "phase_countdowns"    "1"
  }
}
`;
}

/**
 * Parses a "x, y, z" vector string from CS2 GSI into numeric coordinates.
 */
export function parseVector3(raw?: string): { x: number; y: number; z: number } | undefined {
  if (!raw || typeof raw !== 'string') return undefined;
  const parts = raw.split(',').map((s) => Number(s.trim()));
  if (parts.length < 3 || parts.some((n) => !Number.isFinite(n))) {
    return undefined;
  }
  return { x: parts[0], y: parts[1], z: parts[2] };
}

/**
 * Parses a forward/angle string from CS2 GSI into pitch and yaw degrees.
 */
export function parseViewAngles(raw?: string): { pitch: number; yaw: number } | undefined {
  if (!raw || typeof raw !== 'string') return undefined;
  const parts = raw.split(',').map((s) => Number(s.trim()));
  if (parts.length < 2 || parts.some((n) => !Number.isFinite(n))) {
    return undefined;
  }
  return { pitch: parts[0], yaw: parts[1] };
}

/**
 * Validates and normalizes an incoming CS2 GSI JSON payload.
 * Never throws on malformed input; returns structured validation diagnostics.
 */
export function parseGsiPayload(
  rawInput: unknown,
  expectedAuthToken?: string,
  previousPayload?: RawGsiPayload | null,
  nowMs: number = Date.now()
): GsiParseResult {
  const defaultCapabilities: DataSourceCapabilities = {
    sourceType: 'DISCONNECTED',
    providesPlayerCoordinates: false,
    providesViewAngles: false,
    providesUtilityInventory: false,
    providesThrowConfirmation: false,
    providesExactBombPlantTime: false,
    providesObserverAllPlayers: false,
  };

  let payload: RawGsiPayload;
  if (typeof rawInput === 'string') {
    try {
      payload = JSON.parse(rawInput) as RawGsiPayload;
    } catch {
      return {
        valid: false,
        authenticated: false,
        eligibleMatchDetected: false,
        error: 'Malformed JSON payload',
        map: null,
        roundNumber: 0,
        roundPhase: 'inactive',
        capabilities: defaultCapabilities,
        events: [],
        hasDefuseKit: false,
      };
    }
  } else if (rawInput && typeof rawInput === 'object' && !Array.isArray(rawInput)) {
    payload = rawInput as RawGsiPayload;
  } else {
    return {
      valid: false,
      authenticated: false,
      eligibleMatchDetected: false,
      error: 'Invalid payload type: expected JSON object',
      map: null,
      roundNumber: 0,
      roundPhase: 'inactive',
      capabilities: defaultCapabilities,
      events: [],
      hasDefuseKit: false,
    };
  }

  // Verify auth token when expectedAuthToken is provided
  if (expectedAuthToken) {
    const receivedToken = payload.auth?.token;
    if (!receivedToken || receivedToken !== expectedAuthToken) {
      return {
        valid: false,
        authenticated: false,
        eligibleMatchDetected: false,
        error: 'Unauthorized GSI token',
        map: null,
        roundNumber: 0,
        roundPhase: 'inactive',
        capabilities: defaultCapabilities,
        events: [],
        hasDefuseKit: false,
      };
    }
  }

  const mapName = payload.map?.name?.trim() || null;
  const mapPhase = payload.map?.phase;
  const playerActivity = payload.player?.activity;

  // Match Detection (Section 3.1): Only mark eligible when a real CS2 map & active phase exist
  const eligibleMatchDetected = Boolean(
    mapName &&
      mapPhase &&
      (mapPhase === 'live' || mapPhase === 'warmup' || mapPhase === 'intermission') &&
      playerActivity !== 'menu'
  );

  const playerPosition = parseVector3(payload.player?.position);
  const playerAngles = parseViewAngles(payload.player?.forward);
  const weaponsObj = payload.player?.weapons;
  const hasWeapons = Boolean(weaponsObj && typeof weaponsObj === 'object' && Object.keys(weaponsObj).length > 0);

  let activeWeapon: string | undefined;
  if (weaponsObj && typeof weaponsObj === 'object') {
    for (const w of Object.values(weaponsObj)) {
      if (w && w.state === 'active' && w.name) {
        activeWeapon = w.name;
        break;
      }
    }
  }

  const capabilities: DataSourceCapabilities = {
    sourceType: eligibleMatchDetected ? 'GSI_LIVE' : 'DISCONNECTED',
    providesPlayerCoordinates: Boolean(playerPosition),
    providesViewAngles: Boolean(playerAngles),
    providesUtilityInventory: hasWeapons,
    providesThrowConfirmation: false, // Standard CS2 GSI does not guarantee grenade landing confirmation
    providesExactBombPlantTime: Boolean(payload.round?.bomb === 'planted' || payload.bomb?.state === 'planted'),
    providesObserverAllPlayers: false,
  };

  const roundNumber = typeof payload.map?.round === 'number' ? payload.map.round : 0;
  const roundPhase = payload.round?.phase || 'inactive';
  const events: NormalizedGameEvent[] = [];

  if (eligibleMatchDetected && mapName) {
    // Check map transition
    if (previousPayload?.map?.name && previousPayload.map.name !== mapName) {
      events.push({
        eventId: `gsi-map-${nowMs}`,
        eventType: 'MAP_CHANGED',
        timestamp: nowMs,
        roundId: roundNumber,
        map: mapName,
        source: 'GSI_TELEMETRY',
        provenance: 'CONFIRMED',
        confidenceScore: 1.0,
      });
    }

    // Check round phase transitions
    const prevRoundPhase = previousPayload?.round?.phase;
    if (roundPhase === 'live' && prevRoundPhase && prevRoundPhase !== 'live') {
      events.push({
        eventId: `gsi-round-start-${roundNumber}-${nowMs}`,
        eventType: 'ROUND_START',
        timestamp: nowMs,
        roundId: roundNumber,
        map: mapName,
        source: 'GSI_TELEMETRY',
        provenance: 'CONFIRMED',
        confidenceScore: 1.0,
      });
    } else if (roundPhase === 'over' && prevRoundPhase !== 'over') {
      events.push({
        eventId: `gsi-round-end-${roundNumber}-${nowMs}`,
        eventType: 'ROUND_END',
        timestamp: nowMs,
        roundId: roundNumber,
        map: mapName,
        source: 'GSI_TELEMETRY',
        provenance: 'CONFIRMED',
        confidenceScore: 1.0,
      });
    }

    // Check bomb transitions
    const currentBomb = payload.bomb?.state || payload.round?.bomb;
    const prevBomb = previousPayload?.bomb?.state || previousPayload?.round?.bomb;
    if (currentBomb === 'planted' && prevBomb !== 'planted') {
      events.push({
        eventId: `gsi-bomb-planted-${roundNumber}-${nowMs}`,
        eventType: 'BOMB_PLANTED',
        timestamp: nowMs,
        roundId: roundNumber,
        map: mapName,
        source: 'GSI_TELEMETRY',
        provenance: 'CONFIRMED',
        confidenceScore: 1.0,
      });
    } else if (currentBomb === 'defused' && prevBomb !== 'defused') {
      events.push({
        eventId: `gsi-bomb-defused-${roundNumber}-${nowMs}`,
        eventType: 'BOMB_DEFUSED',
        timestamp: nowMs,
        roundId: roundNumber,
        map: mapName,
        source: 'GSI_TELEMETRY',
        provenance: 'CONFIRMED',
        confidenceScore: 1.0,
      });
    } else if (currentBomb === 'exploded' && prevBomb !== 'exploded') {
      events.push({
        eventId: `gsi-bomb-exploded-${roundNumber}-${nowMs}`,
        eventType: 'BOMB_EXPLODED',
        timestamp: nowMs,
        roundId: roundNumber,
        map: mapName,
        source: 'GSI_TELEMETRY',
        provenance: 'CONFIRMED',
        confidenceScore: 1.0,
      });
    }
  }

  // Parse official CS2 phase_countdowns (authoritative bomb & defuse timing)
  const phaseCountdowns = (payload as Record<string, any>).phase_countdowns;
  let countdownSeconds: number | undefined;
  let isBombCountdown = false;

  if (phaseCountdowns && typeof phaseCountdowns === 'object') {
    const endsIn = Number(phaseCountdowns.phase_ends_in);
    if (Number.isFinite(endsIn) && endsIn >= 0) {
      countdownSeconds = endsIn;
    }
    if (phaseCountdowns.phase === 'bomb' || phaseCountdowns.phase === 'defuse') {
      isBombCountdown = true;
    }
  }

  let bombState: GsiParseResult['bombState'];
  const rawBombState = isBombCountdown ? 'planted' : (payload.bomb?.state || payload.round?.bomb);
  if (rawBombState) {
    const parsedCountdown = countdownSeconds ?? (payload.bomb?.countdown ? Number(payload.bomb.countdown) : undefined);
    bombState = {
      state: rawBombState,
      countdownSeconds: Number.isFinite(parsedCountdown) ? parsedCountdown : undefined,
      site: null,
    };
  }

  const playerPlace = (payload.player as Record<string, any> | undefined)?.place || undefined;

  return {
    valid: true,
    authenticated: true,
    eligibleMatchDetected,
    map: mapName,
    roundNumber,
    roundPhase,
    capabilities,
    events,
    playerPosition,
    playerAngles,
    playerPlace,
    activeWeapon,
    hasDefuseKit: Boolean(payload.player?.state?.defusekit),
    bombState,
  };
}
