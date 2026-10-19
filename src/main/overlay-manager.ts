/**
 * CS2 Assistant - HUD Overlay Manager
 * File: src/main/overlay-manager.ts
 *
 * Controls the transparent, frameless, topmost click-through HUD overlay window.
 * Enforces native mouse event forwarding and screen safe zone exclusions.
 */

import { BrowserWindow, screen } from 'electron';
import type { Rect, SafeZones, HudConfig } from '../shared/ipc-types';

export class OverlayManager {
  private overlayWindow: BrowserWindow | null = null;
  private preloadPath: string;
  private rendererUrl: string;
  private isCalibrationMode: boolean = false;

  private currentConfig: HudConfig = {
    enabled: true,
    scale: 1.0,
    opacity: 0.9,
    crosshairSafeZonePx: 450,
    showRadarOverlay: true,
    showBombTimer: true,
    showLastSeen: true,
    showTacticalFeed: true,
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

  public updateConfig(patch: Partial<HudConfig>): HudConfig {
    this.currentConfig = { ...this.currentConfig, ...patch };
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
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      movable: false,
      hasShadow: false,
      focusable: false,
      show: false,
      webPreferences: {
        preload: this.preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

    // Set highest window level on Windows (screen-saver ensures above fullscreen games)
    this.overlayWindow.setAlwaysOnTop(true, 'screen-saver');
    this.overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    // Enable click-through input forwarding by default
    this.overlayWindow.setIgnoreMouseEvents(true, { forward: true });

    // Overlay URL routes to the overlay destination in the renderer
    const targetUrl = this.rendererUrl.includes('localhost')
      ? `${this.rendererUrl}#overlay`
      : `file://${this.rendererUrl}#overlay`;

    if (this.rendererUrl.startsWith('http')) {
      this.overlayWindow.loadURL(targetUrl);
    } else {
      this.overlayWindow.loadFile(this.rendererUrl, { hash: 'overlay' });
    }

    this.overlayWindow.once('ready-to-show', () => {
      if (this.currentConfig.enabled) {
        this.overlayWindow?.showInactive();
      }
    });

    this.overlayWindow.on('closed', () => {
      this.overlayWindow = null;
    });

    return this.overlayWindow;
  }

  /**
   * Toggles calibration mode.
   * When interactive = true: Overlay window captures mouse events for dragging HUD elements.
   * When interactive = false: Overlay window returns to click-through mode.
   */
  public setCalibrationMode(interactive: boolean): void {
    this.isCalibrationMode = interactive;
    this.currentConfig.calibrationMode = interactive;

    if (!this.overlayWindow || this.overlayWindow.isDestroyed()) return;

    if (interactive) {
      this.overlayWindow.setIgnoreMouseEvents(false);
      this.overlayWindow.setFocusable(true);
      this.overlayWindow.focus();
    } else {
      this.overlayWindow.setIgnoreMouseEvents(true, { forward: true });
      this.overlayWindow.setFocusable(false);
    }

    this.overlayWindow.webContents.send('hud:calibration-changed', { interactive });
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
