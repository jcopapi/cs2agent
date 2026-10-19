/**
 * CS2 Assistant - Tactical Memory Engine
 * File: src/core/match/tactical-memory.ts
 *
 * Event-driven tactical memory engine recording legitimately observed information
 * with provenance, confidence classification, configurable expiration, visual decay,
 * and the mandatory Palace Killer Invariance Rule (Section 3.3).
 */

import type {
  CS2Map,
  TeamSide,
  ProvenanceLevel,
  TacticalMemoryRecord,
  EliminationRecordInput,
  LastKnownEnemyAnnotation,
  StalenessTier,
} from './types';

export interface TacticalMemoryOptions {
  defaultTtlMs?: number;
  lastKnownOverlayEnabled?: boolean;
}

export class TacticalMemoryEngine {
  private records: TacticalMemoryRecord[] = [];
  private defaultTtlMs: number;
  private lastKnownOverlayEnabled: boolean;
  private currentMap: CS2Map | string = 'de_mirage';
  private currentRoundId: number = 1;

  constructor(options?: TacticalMemoryOptions) {
    this.defaultTtlMs = options?.defaultTtlMs ?? 30000;
    this.lastKnownOverlayEnabled = options?.lastKnownOverlayEnabled ?? true;
  }

  public setDefaultTtlMs(ttlMs: number): void {
    if (Number.isFinite(ttlMs) && ttlMs > 0) {
      this.defaultTtlMs = ttlMs;
    }
  }

  public setLastKnownOverlayEnabled(enabled: boolean): void {
    this.lastKnownOverlayEnabled = Boolean(enabled);
  }

  public isLastKnownOverlayEnabled(): boolean {
    return this.lastKnownOverlayEnabled;
  }

  /**
   * Records a general tactical observation with explicit provenance and TTL.
   */
  public recordObservation(input: {
    eventId?: string;
    type: TacticalMemoryRecord['type'];
    timestamp?: number;
    roundId?: number;
    map?: CS2Map | string;
    source: TacticalMemoryRecord['source'];
    playerIdentity?: { team: TeamSide; name: string; slot: number };
    location?: { callout: string; x?: number; y?: number; z?: number };
    confidence: ProvenanceLevel;
    confidenceScore?: number;
    inferredHypothesis?: string;
    ttlMs?: number;
  }): TacticalMemoryRecord {
    const now = input.timestamp ?? Date.now();
    const roundId = input.roundId ?? this.currentRoundId;
    const map = input.map ?? this.currentMap;

    if (map !== this.currentMap) {
      this.onMapChange(map);
    } else if (roundId !== this.currentRoundId) {
      this.onRoundChange(roundId);
    }

    const defaultScore =
      input.confidence === 'CONFIRMED' ? 1.0 : input.confidence === 'REPORTED' ? 0.75 : 0.4;

    const record: TacticalMemoryRecord = {
      eventId: input.eventId || `obs-${now}-${Math.random().toString(36).slice(2, 7)}`,
      type: input.type,
      timestamp: now,
      roundId,
      map,
      source: input.source,
      playerIdentity: input.playerIdentity ? { ...input.playerIdentity } : undefined,
      location: input.location ? { ...input.location } : undefined,
      confidence: input.confidence,
      confidenceScore: input.confidenceScore ?? defaultScore,
      expiresAt: now + (input.ttlMs ?? this.defaultTtlMs),
      inferredHypothesis: input.inferredHypothesis,
      actorLocationConfirmed: input.confidence === 'CONFIRMED' && Boolean(input.location?.callout),
    };

    this.records.push(record);
    return record;
  }

  /**
   * Section 3.3 Critical Accuracy Rule (Palace Killer Invariance):
   * If Player X dies at Palace and Player Y killed them, this does NOT automatically
   * mean Player Y was physically located at Palace.
   *
   * Distinguishes:
   * 1. Confirmed victim location (Player X at Palace).
   * 2. Confirmed killer identity (Player Y is alive/active).
   * 3. Killer location ONLY if independently observed.
   * 4. Possible position inferred from sightline evidence (kept strictly INFERRED, never CONFIRMED).
   */
  public recordElimination(input: EliminationRecordInput): {
    victimRecord: TacticalMemoryRecord;
    killerIdentityRecord: TacticalMemoryRecord;
    killerInferenceRecord?: TacticalMemoryRecord;
  } {
    const now = input.timestamp;
    const roundId = input.roundId;
    const map = input.map;

    if (map !== this.currentMap) {
      this.onMapChange(map);
    } else if (roundId !== this.currentRoundId) {
      this.onRoundChange(roundId);
    }

    const baseId = input.eventId || `elim-${now}`;

    // 1. Confirmed victim elimination location
    const victimRecord: TacticalMemoryRecord = {
      eventId: `${baseId}-victim`,
      type: 'KILL',
      timestamp: now,
      roundId,
      map,
      source: 'KILLFEED',
      playerIdentity: {
        name: input.victimName,
        team: input.victimTeam,
        slot: 0,
      },
      location: {
        callout: input.victimCallout,
        x: input.victimCoords?.x,
        y: input.victimCoords?.y,
        z: input.victimCoords?.z,
      },
      confidence: 'CONFIRMED',
      confidenceScore: 1.0,
      expiresAt: now + this.defaultTtlMs,
      actorName: input.killerName,
      actorLocationConfirmed: false,
    };
    this.records.push(victimRecord);

    // 2. Killer identity & location (ONLY confirmed if independently observed!)
    const hasIndependentObservation = Boolean(
      input.killerIndependentlyObservedCallout &&
        input.killerIndependentlyObservedCallout.trim().length > 0
    );

    const killerIdentityRecord: TacticalMemoryRecord = {
      eventId: `${baseId}-killer`,
      type: 'POSITION_REPORT',
      timestamp: now,
      roundId,
      map,
      source: hasIndependentObservation ? 'GSI_TELEMETRY' : 'KILLFEED',
      playerIdentity: {
        name: input.killerName,
        team: input.killerTeam,
        slot: 0,
      },
      // CRITICAL INVARIANT: If killer was not independently observed, location MUST be undefined.
      location: hasIndependentObservation
        ? { callout: input.killerIndependentlyObservedCallout!.trim() }
        : undefined,
      confidence: 'CONFIRMED',
      confidenceScore: 1.0,
      expiresAt: now + this.defaultTtlMs,
      actorName: input.killerName,
      actorLocationConfirmed: hasIndependentObservation,
    };
    this.records.push(killerIdentityRecord);

    // 3. Optional low-confidence sightline hypothesis (strictly INFERRED, never CONFIRMED at victim location)
    let killerInferenceRecord: TacticalMemoryRecord | undefined;
    if (!hasIndependentObservation) {
      killerInferenceRecord = {
        eventId: `${baseId}-hypothesis`,
        type: 'POSITION_REPORT',
        timestamp: now,
        roundId,
        map,
        source: 'KILLFEED',
        playerIdentity: {
          name: input.killerName,
          team: input.killerTeam,
          slot: 0,
        },
        location: undefined, // Never assign victimCallout as killer's location
        confidence: 'INFERRED',
        confidenceScore: 0.35,
        expiresAt: now + Math.min(15000, this.defaultTtlMs),
        inferredHypothesis: `Sightline toward ${input.victimCallout} (unconfirmed killer position)`,
        actorName: input.killerName,
        actorLocationConfirmed: false,
      };
      this.records.push(killerInferenceRecord);
    }

    return {
      victimRecord,
      killerIdentityRecord,
      killerInferenceRecord,
    };
  }

  /**
   * Returns confirmed location for a given player, if and only if a non-expired
   * CONFIRMED or REPORTED observation with a verified location exists.
   * Never returns a victim's location as the killer's location.
   */
  public getConfirmedPlayerLocation(playerName: string, nowMs: number = Date.now()): string | undefined {
    const active = this.getActiveObservations(nowMs);
    for (let i = active.length - 1; i >= 0; i--) {
      const rec = active[i];
      if (
        rec.playerIdentity?.name === playerName &&
        rec.type !== 'KILL' && // KILL records represent the victim's death location, not a living player's position
        rec.confidence === 'CONFIRMED' &&
        rec.actorLocationConfirmed &&
        rec.location?.callout
      ) {
        return rec.location.callout;
      }
    }
    return undefined;
  }

  /**
   * Returns active (non-expired) observations for the current round and map.
   */
  public getActiveObservations(nowMs: number = Date.now()): TacticalMemoryRecord[] {
    return this.records.filter((r) => r.expiresAt > nowMs);
  }

  /**
   * Prunes expired observations and returns the number of removed entries.
   */
  public pruneExpired(nowMs: number = Date.now()): number {
    const before = this.records.length;
    this.records = this.records.filter((r) => r.expiresAt > nowMs);
    return before - this.records.length;
  }

  /**
   * Computes visual decay and staleness tier for a given observation at `nowMs`.
   */
  public computeDecay(
    record: TacticalMemoryRecord,
    nowMs: number = Date.now()
  ): { elapsedSeconds: number; opacity: number; stalenessTier: StalenessTier } {
    const elapsedMs = Math.max(0, nowMs - record.timestamp);
    const elapsedSeconds = Number((elapsedMs / 1000).toFixed(1));
    const totalDurationMs = Math.max(1, record.expiresAt - record.timestamp);

    if (nowMs >= record.expiresAt) {
      return { elapsedSeconds, opacity: 0, stalenessTier: 'EXPIRED' };
    }

    const progress = Math.min(1, elapsedMs / totalDurationMs);
    // Visual prominence decays smoothly from 1.0 down to 0.25 at expiration boundary
    const opacity = Number(Math.max(0.25, 1.0 - progress * 0.75).toFixed(2));

    let stalenessTier: StalenessTier;
    if (elapsedSeconds <= 5) {
      stalenessTier = 'FRESH';
    } else if (elapsedSeconds <= 15) {
      stalenessTier = 'AGING';
    } else {
      stalenessTier = 'STALE';
    }

    return { elapsedSeconds, opacity, stalenessTier };
  }

  /**
   * Section 3.4 Last Known Information Overlay:
   * Produces contextual annotations for opponents with legitimately known positions,
   * becoming visually less prominent as observations age.
   */
  public getLastKnownOverlayAnnotations(
    enemyTeam: TeamSide = 'T',
    nowMs: number = Date.now()
  ): LastKnownEnemyAnnotation[] {
    if (!this.lastKnownOverlayEnabled) {
      return [];
    }

    const active = this.getActiveObservations(nowMs);
    const latestByPlayer = new Map<string, TacticalMemoryRecord>();

    for (const rec of active) {
      if (
        rec.type === 'POSITION_REPORT' &&
        (rec.confidence === 'CONFIRMED' || rec.confidence === 'REPORTED') &&
        rec.location?.callout &&
        rec.playerIdentity &&
        (rec.playerIdentity.team === enemyTeam || enemyTeam === 'BOTH')
      ) {
        const existing = latestByPlayer.get(rec.playerIdentity.name);
        if (!existing || rec.timestamp >= existing.timestamp) {
          latestByPlayer.set(rec.playerIdentity.name, rec);
        }
      }
    }

    const annotations: LastKnownEnemyAnnotation[] = [];
    for (const rec of latestByPlayer.values()) {
      const decay = this.computeDecay(rec, nowMs);
      if (decay.stalenessTier !== 'EXPIRED' && rec.location?.callout && rec.playerIdentity) {
        annotations.push({
          observationId: rec.eventId,
          playerName: rec.playerIdentity.name,
          team: rec.playerIdentity.team,
          lastSeenCallout: rec.location.callout,
          elapsedSeconds: decay.elapsedSeconds,
          source: rec.source === 'MANUAL_REPORT' ? 'Teammate callout' : rec.source,
          provenance: rec.confidence,
          confidenceScore: rec.confidenceScore,
          opacity: decay.opacity,
          stalenessTier: decay.stalenessTier,
          expiresAt: rec.expiresAt,
        });
      }
    }

    return annotations.sort((a, b) => a.elapsedSeconds - b.elapsedSeconds);
  }

  /**
   * Clears round-scoped observations when a new round begins.
   */
  public onRoundChange(newRoundId: number): void {
    this.currentRoundId = newRoundId;
    this.records = [];
  }

  /**
   * Clears all observations when the map changes.
   */
  public onMapChange(newMap: CS2Map | string): void {
    this.currentMap = newMap;
    this.currentRoundId = 1;
    this.records = [];
  }

  public clearAll(): void {
    this.records = [];
  }
}
