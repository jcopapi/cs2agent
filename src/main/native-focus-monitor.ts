/**
 * CS2 Assistant - Native Window Focus & Hotkey Monitor
 * File: src/main/native-focus-monitor.ts
 *
 * Spawns the lightweight Win32 focus-monitor.exe background process.
 * Ensures overlay hotkeys ONLY trigger when cs2.exe is the active foreground window,
 * and maintains accurate physical key hold state without OS-wide key interception.
 */

import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export interface NativeMonitorCallbacks {
  onAlignDown: () => void;
  onAlignUp: () => void;
  onOverlayToggle: () => void;
  onNextPixel: () => void;
}

export class NativeFocusMonitor {
  private child: ChildProcess | null = null;
  private callbacks: NativeMonitorCallbacks;
  private isEnabled: boolean = true;
  private alignKey: string = 'CapsLock';
  private overlayKey: string = 'F1';
  private nextKey: string = 'F2';

  constructor(callbacks: NativeMonitorCallbacks) {
    this.callbacks = callbacks;
    this.start();
  }

  public start(): void {
    const extraResourcePath = (process as any).resourcesPath
      ? path.join((process as any).resourcesPath, 'native/focus-monitor.exe')
      : '';
    const exePath = path.join(__dirname, 'native/focus-monitor.exe');
    // Also support running from root or dist paths or packaged extraResources
    const resolvedPath = (extraResourcePath && fs.existsSync(extraResourcePath))
      ? extraResourcePath
      : (fs.existsSync(exePath)
        ? exePath
        : path.join(process.cwd(), 'src/main/native/focus-monitor.exe'));

    if (!fs.existsSync(resolvedPath)) {
      console.warn('[NativeFocusMonitor] Executable not found at:', resolvedPath);
      return;
    }

    try {
      this.child = spawn(resolvedPath, [], {
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'ignore'],
      });

      this.child.stdout?.setEncoding('utf8');
      this.child.stdout?.on('data', (chunk: string) => {
        const lines = chunk.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed === 'ALIGN_DOWN') {
            this.callbacks.onAlignDown();
          } else if (trimmed === 'ALIGN_UP') {
            this.callbacks.onAlignUp();
          } else if (trimmed === 'OVERLAY_TOGGLE') {
            this.callbacks.onOverlayToggle();
          } else if (trimmed === 'NEXT_PIXEL') {
            this.callbacks.onNextPixel();
          }
        }
      });

      this.child.on('error', (err) => {
        console.warn('[NativeFocusMonitor] Process error:', err);
      });

      this.child.on('exit', () => {
        this.child = null;
      });

      this.syncConfig();
    } catch (err) {
      console.warn('[NativeFocusMonitor] Failed to spawn focus monitor:', err);
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.syncConfig();
  }

  public setKeys(alignKey: string, overlayKey: string, nextKey: string): void {
    this.alignKey = alignKey;
    this.overlayKey = overlayKey;
    this.nextKey = nextKey;
    this.syncConfig();
  }

  private syncConfig(): void {
    if (!this.child?.stdin?.writable) return;
    try {
      this.child.stdin.write(`ENABLED:${this.isEnabled ? 1 : 0}\n`);
      this.child.stdin.write(`KEYS:${this.alignKey},${this.overlayKey},${this.nextKey}\n`);
    } catch {
      // ignore
    }
  }

  public destroy(): void {
    if (this.child) {
      try {
        this.child.stdin?.write('EXIT\n');
        this.child.kill();
      } catch {
        // ignore
      }
      this.child = null;
    }
  }
}
