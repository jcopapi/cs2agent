/**
 * CS2 Assistant - HUD Overlay Manager
 * File: src/main/overlay-manager.ts
 *
 * Controls the transparent, frameless, topmost click-through HUD overlay window.
 * Enforces native mouse event forwarding and screen safe zone exclusions.
 */

import { BrowserWindow, screen } from 'electron';
import * as url from 'url';
import type { Rect, SafeZones, HudConfig, Lineup, Play } from '../shared/ipc-types';

export class OverlayManager {
  private overlayWindow: BrowserWindow | null = null;
  private preloadPath: string;
  private rendererUrl: string;
  private isCalibrationMode: boolean = false;
  private activeLineupPhoto: Lineup | null = null;
  private lastLineupPhoto: Lineup | null = null;
  private isBombActive: boolean = false;
  private isMatchActive: boolean = false;
  private isAlignActive: boolean = false;
  private activePlan: Play | null = null;
  private activeStepIndex: number = 0;

  private currentConfig: HudConfig = {
    enabled: true,
    scale: 1.0,
    opacity: 0.65,
    crosshairSafeZonePx: 450,
    showRadarOverlay: false,
    showBombTimer: true,
    showPixelPhoto: true,
    showLastSeen: false,
    showTacticalFeed: false,
    calibrationMode: false,
  };

  constructor(preloadPath: string, rendererUrl: string) {
    this.preloadPath = preloadPath;
    this.rendererUrl = rendererUrl;
  }

  public getWindow(): BrowserWindow | null {
    return this.overlayWindow;
  }

  public getConfig(): HudConfig {
    return { ...this.currentConfig };
  }

  public setActivePlan(plan: Play | null, stepIndex: number = 0): void {
    this.activePlan = plan;
    this.activeStepIndex = stepIndex;
    if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
      this.overlayWindow.webContents.send('hud:plan-step-changed', {
        stepIndex: this.activeStepIndex,
        totalSteps: this.activePlan?.lineupIds?.length ?? 0,
        planName: this.activePlan?.name ?? '',
      });
    }
  }

  public getPlanStep(): { stepIndex: number; totalSteps: number; planName: string } {
    return {
      stepIndex: this.activeStepIndex,
      totalSteps: this.activePlan?.lineupIds?.length ?? 0,
      planName: this.activePlan?.name ?? '',
    };
  }

  public advanceNextPixel(): { stepIndex: number; totalSteps: number; lineupId: string | null } {
    if (!this.activePlan || !this.activePlan.lineupIds || this.activePlan.lineupIds.length === 0) {
      return { stepIndex: 0, totalSteps: 0, lineupId: null };
    }
    this.activeStepIndex = (this.activeStepIndex + 1) % this.activePlan.lineupIds.length;
    const lineupId = this.activePlan.lineupIds[this.activeStepIndex];
    if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
      this.overlayWindow.webContents.send('hud:plan-step-changed', {
        stepIndex: this.activeStepIndex,
        totalSteps: this.activePlan.lineupIds.length,
        planName: this.activePlan.name,
      });
    }
    return {
      stepIndex: this.activeStepIndex,
      totalSteps: this.activePlan.lineupIds.length,
      lineupId,
    };
  }

  public getActiveLineupPhoto(): Lineup | null {
    return this.activeLineupPhoto;
  }

  public setActiveLineupPhoto(lineup: Lineup | null): void {
    if (lineup) {
      this.lastLineupPhoto = lineup;
    }
    this.activeLineupPhoto = lineup;
    this.syncVisibility();
    if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
      this.overlayWindow.webContents.send('hud:active-lineup-photo-changed', lineup);
    }
  }

  public toggleActiveLineupPhoto(): void {
    if (this.activeLineupPhoto) {
      this.lastLineupPhoto = this.activeLineupPhoto;
      this.setActiveLineupPhoto(null);
    } else if (this.lastLineupPhoto) {
      this.setActiveLineupPhoto(this.lastLineupPhoto);
    }
  }

  public setBombActive(active: boolean): void {
    if (this.isBombActive !== active) {
      this.isBombActive = active;
      this.syncVisibility();
      if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
        this.overlayWindow.webContents.send('hud:bomb-active-changed', active);
      }
    }
  }

  public setMatchActive(active: boolean): void {
    if (this.isMatchActive !== active) {
      this.isMatchActive = active;
      this.syncVisibility();
      if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
        this.overlayWindow.webContents.send('hud:match-active-changed', active);
      }
    }
  }

  public getAlignActive(): boolean {
    return this.isAlignActive;
  }

  public setAlignActive(active: boolean): void {
    if (this.isAlignActive !== active) {
      this.isAlignActive = active;
      this.syncVisibility();
      if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
        this.overlayWindow.webContents.send('hud:align-state-changed', active);
      }
    }
  }

  /**
   * Dynamically controls window visibility.
   * Overlay window is displayed whenever a match is active (showing key hints or C4),
   * during align mode, when a lineup photo is pinned, or during calibration.
   */
  public syncVisibility(): void {
    if (!this.overlayWindow || this.overlayWindow.isDestroyed()) return;

    if (!this.currentConfig.enabled) {
      if (this.overlayWindow.isVisible()) {
        this.overlayWindow.hide();
      }
      return;
    }

    const shouldBeVisible =
      Boolean(this.isMatchActive) ||
      Boolean(this.isAlignActive) ||
      Boolean(this.currentConfig.calibrationMode) ||
      Boolean(this.currentConfig.showBombTimer && this.isBombActive) ||
      Boolean(this.currentConfig.showPixelPhoto !== false && this.activeLineupPhoto);

    if (shouldBeVisible) {
      if (!this.overlayWindow.isVisible()) {
        this.overlayWindow.showInactive();
        this.overlayWindow.setIgnoreMouseEvents(true);
      }
    } else {
      if (this.overlayWindow.isVisible()) {
        this.overlayWindow.hide();
      }
    }
  }

  public updateConfig(patch: Partial<HudConfig>): HudConfig {
    this.currentConfig = { ...this.currentConfig, ...patch };
    this.syncVisibility();
    if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
      this.overlayWindow.webContents.send('hud:config-updated', this.currentConfig);
    }
    return { ...this.currentConfig };
  }

  /**
   * Initializes the transparent HUD overlay window matched to the primary display.
   */
  public createOverlayWindow(): BrowserWindow {
    if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
      return this.overlayWindow;
    }

    const primaryDisplay = screen.getPrimaryDisplay();
    const { x, y, width, height } = primaryDisplay.bounds;

    this.overlayWindow = new BrowserWindow({
      x,
      y,
      width,
      height,
      type: 'toolbar',
      transparent: true,
      backgroundColor: '#00000000',
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      movable: false,
      hasShadow: false,
      focusable: false,
      show: false, // Starts hidden until bomb or lineup is active
      webPreferences: {
        preload: this.preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        backgroundThrottling: false,
        additionalArguments: ['--window-type=overlay'],
      },
    });

    // Set highest window level on Windows (screen-saver ensures above fullscreen games)
    this.overlayWindow.setAlwaysOnTop(true, 'screen-saver');
    this.overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    // Strict OS-level click-through (WS_EX_TRANSPARENT) so mouse is NEVER intercepted
    // Note: Never use { forward: true } on game overlays; it forwards 1000Hz gaming mouse events into Electron!
    this.overlayWindow.setIgnoreMouseEvents(true);

    // Overlay URL routes to the overlay destination in the renderer
    let targetUrl: string;
    if (this.rendererUrl.startsWith('http')) {
      targetUrl = `${this.rendererUrl}?mode=overlay#overlay`;
    } else {
      const fileUrl = url.pathToFileURL(this.rendererUrl).href;
      targetUrl = `${fileUrl}?mode=overlay#overlay`;
    }

    this.overlayWindow.loadURL(targetUrl);

    this.overlayWindow.once('ready-to-show', () => {
      if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
        this.overlayWindow.setIgnoreMouseEvents(true);
        this.syncVisibility();
      }
    });

    this.overlayWindow.on('closed', () => {
      this.overlayWindow = null;
    });

    return this.overlayWindow;
  }

  /**
   * Toggles calibration mode (Safe-Zone visual guides).
   * Always preserves strict OS click-through so the overlay never blocks mouse input.
   */
  public setCalibrationMode(interactive: boolean): void {
    this.isCalibrationMode = interactive;
    this.currentConfig.calibrationMode = interactive;
    if (interactive) {
      this.currentConfig.enabled = true;
    }

    this.syncVisibility();

    if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
      this.overlayWindow.webContents.send('hud:config-updated', this.currentConfig);
      this.overlayWindow.webContents.send('hud:calibration-changed', { interactive });
    }
  }

  /**
   * Calculates the authoritative safe zone exclusion rectangles for a given screen dimension.
   */
  public static calculateSafeZones(
    screenWidth: number = 1920,
    screenHeight: number = 1080,
    crosshairDimension: number = 450
  ): SafeZones {
    const chDim = Math.max(200, Math.min(600, crosshairDimension));
    const chX = Math.round((screenWidth - chDim) / 2);
    const chY = Math.round((screenHeight - chDim) / 2);

    return {
      crosshair: {
        x: chX,
        y: chY,
        width: chDim,
        height: chDim,
      },
      radar: {
        x: 0,
        y: 0,
        width: 360,
        height: 360,
      },
      statusHud: {
        x: 0,
        y: screenHeight - 140,
        width: screenWidth,
        height: 140,
      },
      killfeed: {
        x: screenWidth - 420,
        y: 0,
        width: 420,
        height: 220,
      },
    };
  }

  /**
   * Evaluates whether a proposed rectangular HUD element collides with any safe zone.
   */
  public static checkCollision(element: Rect, zone: Rect): boolean {
    return (
      element.x < zone.x + zone.width &&
      element.x + element.width > zone.x &&
      element.y < zone.y + zone.height &&
      element.y + element.height > zone.y
    );
  }

  /**
   * Validates element positioning against all exclusion safe zones.
   */
  public static validatePosition(
    element: Rect,
    screenWidth: number = 1920,
    screenHeight: number = 1080,
    crosshairDim: number = 450
  ): { valid: boolean; collidingZone?: keyof SafeZones } {
    const zones = OverlayManager.calculateSafeZones(screenWidth, screenHeight, crosshairDim);

    for (const [zoneKey, zoneRect] of Object.entries(zones)) {
      if (OverlayManager.checkCollision(element, zoneRect)) {
        return { valid: false, collidingZone: zoneKey as keyof SafeZones };
      }
    }

    return { valid: true };
  }

  public getSafeZones(): SafeZones {
    const bounds = this.overlayWindow
      ? this.overlayWindow.getBounds()
      : screen && typeof screen.getPrimaryDisplay === 'function'
        ? screen.getPrimaryDisplay().bounds
        : { width: 1920, height: 1080 };
    return OverlayManager.calculateSafeZones(
      bounds.width,
      bounds.height,
      this.currentConfig.crosshairSafeZonePx
    );
  }

  public destroy(): void {
    if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
      this.overlayWindow.destroy();
      this.overlayWindow = null;
    }
  }
}
