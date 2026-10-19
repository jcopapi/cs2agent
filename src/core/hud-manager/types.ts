/**
 * CS2 Assistant - HUD Safe Zone Types
 * File: src/core/hud-manager/types.ts
 */

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ViewportDimensions {
  width: number;
  height: number;
}

export type SafeZoneId = 'CROSSHAIR' | 'RADAR' | 'KILLFEED';

export interface ISafeZone {
  id: SafeZoneId;
  name: string;
  description?: string;
  bounds: Rect;
}

export interface SafeZoneEvaluation {
  obstructed: boolean;
  collidingZones: SafeZoneId[];
}
