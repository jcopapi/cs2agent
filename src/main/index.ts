/**
 * CS2 Assistant - Electron Main Process Entry Point
 * File: src/main/index.ts
 *
 * Manages application lifecycle, window initialization, security boundaries,
 * Windows DPAPI credential storage, and IPC registration.
 */

import { app, BrowserWindow, shell, session, globalShortcut } from 'electron';
import * as path from 'path';
import { SafeStorageCredentialStore } from './credential-store';
import { OverlayManager } from './overlay-manager';
import { IpcHandlerManager } from './ipc-handlers';
import { CapabilityGate } from '../core/compliance/capability-gate';
import { NativeFocusMonitor } from './native-focus-monitor';
import type { HotkeyConfig } from '../shared/ipc-types';
import { getAllLineups } from '../core/utility/lineup-database';

// ---------------------------------------------------------------------------
// 1. Single Instance Lock
// ---------------------------------------------------------------------------
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.warn('[Main] Another instance is already running. Quitting.');
  app.quit();
  process.exit(0);
}

// ---------------------------------------------------------------------------
// 2. Global Process State
// ---------------------------------------------------------------------------
let mainWindow: BrowserWindow | null = null;
let overlayManager: OverlayManager | null = null;
let ipcManager: IpcHandlerManager | null = null;
let credentialStore: SafeStorageCredentialStore | null = null;
let capabilityGate: CapabilityGate | null = null;
let focusMonitor: NativeFocusMonitor | null = null;

const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

function resolvePreloadPath(): string {
  return path.join(__dirname, '../preload/index.js');
}

function resolveRendererPath(): string {
  return path.join(__dirname, '../renderer/index.html');
}

// ---------------------------------------------------------------------------
// 3. Main Application Window Factory
// ---------------------------------------------------------------------------
async function createMainWindow(): Promise<BrowserWindow> {
  const preloadPath = resolvePreloadPath();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: '#09090b',
    title: 'CS Overlay Assistant',
    show: false, // Prevent white flash before content paints
    autoHideMenuBar: true,
    titleBarStyle: 'default',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      devTools: isDev,
      backgroundThrottling: false,
    },
  });

  // Security: Prevent window opening and route external links to OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Security: Block unauthorized in-window navigation
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    if (
      !navigationUrl.startsWith('file://') &&
      !navigationUrl.startsWith('http://localhost:5173')
    ) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });

  // Reveal window smoothly once DOM and styling are ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Guarantee window is displayed even if ready-to-show event timing diverges
  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  }, 800);

  mainWindow.on('closed', () => {
    mainWindow = null;
    // Closing the primary launcher terminates the background overlays and shuts down cleanly
    app.quit();
  });

  // Load URL or dist bundle
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(devServerUrl);
  } else {
    await mainWindow.loadFile(resolveRendererPath());
  }

  return mainWindow;
}

// ---------------------------------------------------------------------------
// 4. Electron Application Lifecycle
// ---------------------------------------------------------------------------
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
});

app.whenReady().then(async () => {
  console.log('[Main] CS2 Assistant initializing...');

  // Configure Content Security Policy header in production
  if (!isDev) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
          ],
        },
      });
    });
  }

  // Initialize Core Services
  credentialStore = new SafeStorageCredentialStore();
  if (!(await credentialStore.hasApiKey())) {
    await credentialStore.saveApiKey('AIzaSyCS2AssistantTacticalCoachKey98421X');
  }
  capabilityGate = new CapabilityGate('COMPETITIVE_PROTECTED');

  const preloadPath = resolvePreloadPath();
  const rendererUrl = isDev && process.env.VITE_DEV_SERVER_URL ? devServerUrl : resolveRendererPath();

  overlayManager = new OverlayManager(preloadPath, rendererUrl);

  let hotkeyConfig: HotkeyConfig = {
    key: 'F1',
    mode: 'TOGGLE',
    alignKey: 'CapsLock',
    alignMode: 'HOLD',
    alignOpacity: 0.5,
    overlayKey: 'F1',
    overlayMode: 'TOGGLE',
    nextPixelKey: 'F2',
    cornerCardPosition: 'TOP_RIGHT',
    indicatorPosition: 'TOP_RIGHT',
    bombLatencyOffsetSec: 2.0,
  };

  // Dedicated Native Focus Monitor:
  // Only listens and triggers overlay commands when CS2 is the active foreground window!
  // Ensures CapsLock and other keys are NEVER intercepted while typing in other apps.
  focusMonitor = new NativeFocusMonitor({
    onAlignDown: () => {
      overlayManager?.setAlignActive(true);
      ipcManager?.broadcast('hud:align-state-changed', true);
    },
    onAlignUp: () => {
      overlayManager?.setAlignActive(false);
      ipcManager?.broadcast('hud:align-state-changed', false);
    },
    onOverlayToggle: () => {
      overlayManager?.toggleActiveLineupPhoto();
      const current = overlayManager?.getActiveLineupPhoto() || null;
      ipcManager?.broadcast('hud:active-lineup-photo-changed', current);
    },
    onNextPixel: () => {
      const stepResult = overlayManager?.advanceNextPixel();
      if (stepResult && stepResult.lineupId) {
        const lineup = getAllLineups().find((l) => l.id === stepResult.lineupId) || null;
        if (lineup) {
          overlayManager?.setActiveLineupPhoto(lineup);
        }
      }
      ipcManager?.broadcast('play:next-pixel', stepResult || null);
    },
  });

  const registerGlobalHotkeys = (cfg?: Partial<HotkeyConfig>) => {
    if (cfg) {
      hotkeyConfig = { ...hotkeyConfig, ...cfg };
    }

    const isEnabled = overlayManager?.getConfig().enabled !== false;
    focusMonitor?.setEnabled(isEnabled);
    focusMonitor?.setKeys(
      hotkeyConfig.alignKey || 'CapsLock',
      hotkeyConfig.overlayKey || 'F1',
      hotkeyConfig.nextPixelKey || 'F2'
    );
  };

  // Initialize and register Typed IPC Handlers
  ipcManager = new IpcHandlerManager({
    credentialStore,
    overlayManager,
    capabilityGate,
    getMainWindow: () => mainWindow,
    getOverlayWindow: () => overlayManager?.getWindow() || null,
    getHotkeyConfig: () => hotkeyConfig,
    setHotkeyConfig: (cfg) => registerGlobalHotkeys(cfg),
    setFocusMonitorEnabled: (enabled) => focusMonitor?.setEnabled(enabled),
  });
  ipcManager.register();

  // Create primary windows
  await createMainWindow();
  overlayManager.createOverlayWindow();

  // Register Global Hotkeys (works even when CS2 has full exclusive OS focus)
  registerGlobalHotkeys();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });

  console.log('[Main] CS2 Assistant initialized successfully.');
});

// ---------------------------------------------------------------------------
// 5. Graceful Shutdown
// ---------------------------------------------------------------------------
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  console.log('[Main] Shutting down CS2 Assistant...');
  try {
    globalShortcut.unregisterAll();
  } catch {
    // ignore
  }
  if (focusMonitor) {
    focusMonitor.destroy();
    focusMonitor = null;
  }
  if (ipcManager) {
    ipcManager.unregister();
    ipcManager = null;
  }
  if (overlayManager) {
    overlayManager.destroy();
    overlayManager = null;
  }
});
