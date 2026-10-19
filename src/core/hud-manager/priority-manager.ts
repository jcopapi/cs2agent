/**
 * CS2 Assistant - Global HUD Priority & Collision Arbitrage Manager
 * File: src/core/hud-manager/priority-manager.ts
 *
 * Implements Section 10 Global HUD System:
 * - Priority levels: CRITICAL > CONTEXTUAL > INFORMATIONAL > PASSIVE
 * - Prevents overlapping information in the same HUD region
 * - Enforces crosshair and CS2 native HUD safe zones
 * - Enforces per-module toggles, expiration rules, and Compliance Layer capability gating
 */

import type { ICapabilityGate } from '../compliance/types';
import type { Rect, ViewportDimensions } from './types';
import { SafeZoneEvaluator } from './safe-zone-evaluator';

export type HudPriorityLevel = 'CRITICAL' | 'CONTEXTUAL' | 'INFORMATIONAL' | 'PASSIVE';

export type HudPlacementRegion =
  | 'TOP_CENTER_SUBTLE'
  | 'TOP_LEFT_BELOW_RADAR'
  | 'MID_RIGHT_COMPACT'
  | 'BOTTOM_CENTER_ABOVE_STATUS';

export type PermittedGameState =
  | 'MATCH_PREPARATION'
  | 'ROUND_START'
  | 'ACTIVE_ROUND'
  | 'UTILITY_PREPARATION'
  | 'UTILITY_EXECUTION'
  | 'BOMB_PLANTED'
  | 'ROUND_END'
  | 'SPECTATOR_MODE';

export interface HudModuleRegistration {
  id: string;
  module: string;
  priority: HudPriorityLevel;
  placement: HudPlacementRegion;
  bounds: Rect;
  durationMs?: number;
  expiresAt?: number;
  allowedGameStates?: PermittedGameState[];
  requiredFeatureId?: string;
  enabled?: boolean;
}

export interface ActiveHudPanel extends HudModuleRegistration {
  visible: boolean;
  suppressedBy?: string;
  suppressionReason?: string;
}

const PRIORITY_RANK: Record<HudPriorityLevel, number> = {
  CRITICAL: 4,
  CONTEXTUAL: 3,
  INFORMATIONAL: 2,
  PASSIVE: 1,
};

export class HudPriorityManager {
  private panels: Map<string, HudModuleRegistration> = new Map();
  private moduleEnabledMap: Map<string, boolean> = new Map();
  private safeZoneEvaluator: SafeZoneEvaluator;
  private capabilityGate?: ICapabilityGate;
  private currentGameState: PermittedGameState = 'ACTIVE_ROUND';

  constructor(
    viewport: ViewportDimensions = { width: 1920, height: 1080 },
    capabilityGate?: ICapabilityGate
  ) {
    this.safeZoneEvaluator = new SafeZoneEvaluator(viewport);
    this.capabilityGate = capabilityGate;
  }

  public setGameState(state: PermittedGameState): void {
    this.currentGameState = state;
  }

  public setModuleEnabled(moduleName: string, enabled: boolean): void {
    this.moduleEnabledMap.set(moduleName, Boolean(enabled));
  }

  public isModuleEnabled(moduleName: string): boolean {
    return this.moduleEnabledMap.get(moduleName) ?? true;
  }

  public registerPanel(registration: HudModuleRegistration, nowMs: number = Date.now()): void {
    const expiresAt =
      registration.expiresAt ??
      (registration.durationMs ? nowMs + registration.durationMs : nowMs + 30000);

    this.panels.set(registration.id, {
      ...registration,
      expiresAt,
      enabled: registration.enabled ?? true,
    });
  }

  public removePanel(id: string): void {
    this.panels.delete(id);
  }

  public clearAll(): void {
    this.panels.clear();
  }

  /**
   * Evaluates all registered HUD panels at `nowMs`, enforcing:
   * 1. Expiration pruning
   * 2. Module toggles
   * 3. Compliance Layer feature gating
   * 4. Game state restrictions
   * 5. Safe zone non-obstruction (crosshair, radar, killfeed)
   * 6. Priority arbitration (CRITICAL suppresses PASSIVE globally and preempts same-region lower priority)
   */
  public evaluateVisiblePanels(nowMs: number = Date.now()): ActiveHudPanel[] {
    // 1. Prune expired panels
    for (const [id, panel] of this.panels.entries()) {
      if (panel.expiresAt !== undefined && panel.expiresAt <= nowMs) {
        this.panels.delete(id);
      }
    }

    const candidates: ActiveHudPanel[] = [];
    for (const panel of this.panels.values()) {
      // Check module toggle
      if (panel.enabled === false || !this.isModuleEnabled(panel.module)) {
        candidates.push({
          ...panel,
          visible: false,
          suppressionReason: 'Module disabled by user configuration',
        });
        continue;
      }

      // Check Compliance Layer permission
      if (
        panel.requiredFeatureId &&
        this.capabilityGate &&
        !this.capabilityGate.isFeaturePermitted(panel.requiredFeatureId)
      ) {
        candidates.push({
          ...panel,
          visible: false,
          suppressionReason: `Feature "${panel.requiredFeatureId}" restricted by Compliance Layer in ${this.capabilityGate.currentEnvironment}`,
        });
        continue;
      }

      // Check game state restriction
      if (
        panel.allowedGameStates &&
        panel.allowedGameStates.length > 0 &&
        !panel.allowedGameStates.includes(this.currentGameState)
      ) {
        candidates.push({
          ...panel,
          visible: false,
          suppressionReason: `Inactive in game state ${this.currentGameState}`,
        });
        continue;
      }

      // Check CS2 native HUD & crosshair safe zones
      const safeEval = this.safeZoneEvaluator.evaluateRect(panel.bounds);
      if (safeEval.obstructed) {
        candidates.push({
          ...panel,
          visible: false,
          suppressionReason: `Obstructs protected safe zone: ${safeEval.collidingZones.join(', ')}`,
        });
        continue;
      }

      candidates.push({
        ...panel,
        visible: true,
      });
    }

    // Determine if any CRITICAL panel is currently visible
    const activeCritical = candidates.find((c) => c.visible && c.priority === 'CRITICAL');

    // Group visible panels by placement region to prevent overlapping panels
    const winningByRegion = new Map<HudPlacementRegion, ActiveHudPanel>();

    for (const panel of candidates) {
      if (!panel.visible) continue;

      // Global Rule: When CRITICAL information is active, PASSIVE panels defer/hide
      if (activeCritical && panel.priority === 'PASSIVE') {
        panel.visible = false;
        panel.suppressedBy = activeCritical.id;
        panel.suppressionReason = 'Deferred due to active CRITICAL alert';
        continue;
      }

      const currentWinner = winningByRegion.get(panel.placement);
      if (!currentWinner) {
        winningByRegion.set(panel.placement, panel);
      } else {
        const panelRank = PRIORITY_RANK[panel.priority];
        const winnerRank = PRIORITY_RANK[currentWinner.priority];
        if (panelRank > winnerRank) {
          currentWinner.visible = false;
          currentWinner.suppressedBy = panel.id;
          currentWinner.suppressionReason = `Preempted in region ${panel.placement} by higher-priority panel (${panel.priority})`;
          winningByRegion.set(panel.placement, panel);
        } else {
          panel.visible = false;
          panel.suppressedBy = currentWinner.id;
          panel.suppressionReason = `Deferred in region ${panel.placement} to ${currentWinner.id} (${currentWinner.priority})`;
        }
      }
    }

    return candidates;
  }
}
