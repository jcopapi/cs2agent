/**
 * CS2 Assistant - HUD Safe Zone Evaluator
 * File: src/core/hud-manager/safe-zone-evaluator.ts
 *
 * Mathematically evaluates screen coordinates and bounding boxes against
 * CS2 unobstructed safe zones (Crosshair 450x450, Radar 320x320, Killfeed 400x200).
 */

import type {
  Point,
  Rect,
  ViewportDimensions,
  SafeZoneId,
  ISafeZone,
  SafeZoneEvaluation,
} from './types';

export class SafeZoneEvaluator {
  private _viewport: ViewportDimensions;

  constructor(viewport: ViewportDimensions = { width: 1920, height: 1080 }) {
    this._viewport = viewport;
  }

  setViewport(viewport: ViewportDimensions): void {
    this._viewport = viewport;
  }

  getViewport(): ViewportDimensions {
    return { ...this._viewport };
  }

  getSafeZones(): ISafeZone[] {
    const { width, height } = this._viewport;
    const centerX = width / 2;
    const centerY = height / 2;

    return [
      {
        id: 'CROSSHAIR',
        name: 'Crosshair Center Safe Zone',
        bounds: {
          x: centerX - 225, // 450 width centered
          y: centerY - 225, // 450 height centered
          width: 450,
          height: 450,
        },
      },
      {
        id: 'RADAR',
        name: 'Radar Top-Left Safe Zone',
        bounds: {
          x: 0,
          y: 0,
          width: 320,
          height: 320,
        },
      },
      {
        id: 'KILLFEED',
        name: 'Killfeed Top-Right Safe Zone',
        bounds: {
          x: width - 400,
          y: 0,
          width: 400,
          height: 200,
        },
      },
    ];
  }

  evaluateCoordinate(point: Point): SafeZoneEvaluation {
    const zones = this.getSafeZones();
    const collidingZones: SafeZoneId[] = [];

    for (const zone of zones) {
      const b = zone.bounds;
      if (
        point.x >= b.x &&
        point.x <= b.x + b.width &&
        point.y >= b.y &&
        point.y <= b.y + b.height
      ) {
        collidingZones.push(zone.id);
      }
    }

    return {
      obstructed: collidingZones.length > 0,
      collidingZones,
    };
  }

  evaluateRect(rect: Rect): SafeZoneEvaluation {
    const zones = this.getSafeZones();
    const collidingZones: SafeZoneId[] = [];

    for (const zone of zones) {
      const b = zone.bounds;
      const intersects =
        rect.x < b.x + b.width &&
        rect.x + rect.width > b.x &&
        rect.y < b.y + b.height &&
        rect.y + rect.height > b.y;

      if (intersects) {
        collidingZones.push(zone.id);
      }
    }

    return {
      obstructed: collidingZones.length > 0,
      collidingZones,
    };
  }
}
