/**
 * CS2 Assistant - Authorized Local HTTP Game State Integration (GSI) Listener
 * File: src/main/gsi-listener.ts
 *
 * Binds strictly to 127.0.0.1 (localhost) on ports 3001 and 3000 to ingest
 * official CS2 HTTP POST JSON telemetry without any process injection,
 * memory reading, or network sniffing.
 */

import * as http from 'node:http';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseGsiPayload, generateGsiConfigFile, type GsiParseResult } from '../core/match/gsi-parser';
import type { RawGsiPayload } from '../core/match/types';

export interface GsiListenerOptions {
  port?: number;
  secondaryPort?: number;
  authToken?: string;
  onPayloadParsed?: (result: GsiParseResult, raw: RawGsiPayload) => void;
}

export class GsiHttpListener {
  private server: http.Server | null = null;
  private secondaryServer: http.Server | null = null;
  private port: number;
  private secondaryPort: number;
  private authToken?: string;
  private listening: boolean = false;
  private lastHeartbeat: number | null = null;
  private lastPayload: RawGsiPayload | null = null;
  private onPayloadParsed?: (result: GsiParseResult, raw: RawGsiPayload) => void;

  constructor(options?: GsiListenerOptions) {
    this.port = options?.port ?? 3001;
    this.secondaryPort = options?.secondaryPort ?? 3000;
    this.authToken = options?.authToken;
    this.onPayloadParsed = options?.onPayloadParsed;
  }

  public isListening(): boolean {
    return this.listening;
  }

  public getPort(): number {
    return this.port;
  }

  public getLastHeartbeat(): number | null {
    return this.lastHeartbeat;
  }

  public getLastPayload(): RawGsiPayload | null {
    return this.lastPayload;
  }

  public generateConfigFile(): string {
    return generateGsiConfigFile(this.port, this.authToken || 'cs2-assistant-local-token');
  }

  /**
   * Automatically installs gamestate_integration_cs2assistant.cfg into discovered
   * Steam CS2 cfg directories if writable.
   */
  public autoInstallCfg(): { installed: boolean; cfgPath?: string } {
    const candidateDirs = [
      'D:\\SteamLibrary\\steamapps\\common\\Counter-Strike Global Offensive\\game\\csgo\\cfg',
      'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Counter-Strike Global Offensive\\game\\csgo\\cfg',
      'C:\\SteamLibrary\\steamapps\\common\\Counter-Strike Global Offensive\\game\\csgo\\cfg',
      'E:\\SteamLibrary\\steamapps\\common\\Counter-Strike Global Offensive\\game\\csgo\\cfg',
    ];

    const content = `"CS2 Assistant Game State Integration"
{
  "uri" "http://127.0.0.1:${this.port}/gsi"
  "timeout" "5.0"
  "buffer"  "0.1"
  "throttle" "0.1"
  "heartbeat" "5.0"
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

    for (const dir of candidateDirs) {
      try {
        if (fs.existsSync(dir)) {
          const targetPath = path.join(dir, 'gamestate_integration_cs2assistant.cfg');
          fs.writeFileSync(targetPath, content, 'utf8');
          return { installed: true, cfgPath: targetPath };
        }
      } catch {
        // Ignore write errors on read-only directories
      }
    }

    return { installed: false };
  }

  private handleHttpRequest = (req: http.IncomingMessage, res: http.ServerResponse): void => {
    if (req.method !== 'POST') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'CS2 Assistant GSI Listener Active' }));
      return;
    }

    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString('utf8');
      if (body.length > 1024 * 512) {
        req.destroy();
      }
    });

    req.on('end', () => {
      const now = Date.now();
      const parsed = parseGsiPayload(body, this.authToken, this.lastPayload, now);
      if (!parsed.valid) {
        res.writeHead(parsed.authenticated === false && this.authToken ? 401 : 400, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({ ok: false, error: parsed.error }));
        return;
      }

      this.lastHeartbeat = now;
      try {
        this.lastPayload = JSON.parse(body) as RawGsiPayload;
        if (this.onPayloadParsed) {
          this.onPayloadParsed(parsed, this.lastPayload);
        }
      } catch {
        // Ignored; already validated by parseGsiPayload
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
  };

  public async start(port?: number): Promise<{ success: boolean; port: number; error?: string }> {
    if (this.listening && this.server) {
      return { success: true, port: this.port };
    }
    if (port && Number.isInteger(port) && port > 0 && port <= 65535) {
      this.port = port;
    }

    this.autoInstallCfg();

    // Also start secondary listener on port 3000 for existing CS2 GSI configs
    if (!this.secondaryServer && this.secondaryPort !== this.port) {
      try {
        const secSrv = http.createServer(this.handleHttpRequest);
        secSrv.on('error', () => {
          // Ignore if port 3000 is already in use by another tool
        });
        secSrv.listen(this.secondaryPort, '127.0.0.1', () => {
          this.secondaryServer = secSrv;
        });
      } catch {
        // Ignore secondary port errors
      }
    }

    return new Promise((resolve) => {
      const srv = http.createServer(this.handleHttpRequest);

      srv.on('error', (err: Error) => {
        this.listening = false;
        resolve({ success: false, port: this.port, error: err.message });
      });

      srv.listen(this.port, '127.0.0.1', () => {
        this.server = srv;
        this.listening = true;
        resolve({ success: true, port: this.port });
      });
    });
  }

  public async stop(): Promise<void> {
    if (this.secondaryServer) {
      try {
        this.secondaryServer.close();
      } catch {
        // Ignore
      }
      this.secondaryServer = null;
    }
    if (!this.server) {
      this.listening = false;
      return;
    }
    return new Promise((resolve) => {
      this.server!.close(() => {
        this.server = null;
        this.listening = false;
        resolve();
      });
    });
  }
}
