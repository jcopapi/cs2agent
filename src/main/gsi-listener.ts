/**
 * CS2 Assistant - Authorized Local HTTP Game State Integration (GSI) Listener
 * File: src/main/gsi-listener.ts
 *
 * Binds strictly to 127.0.0.1 (localhost) to ingest official CS2 HTTP POST JSON
 * telemetry without any process injection, memory reading, or network sniffing.
 */

import * as http from 'node:http';
import { parseGsiPayload, generateGsiConfigFile, type GsiParseResult } from '../core/match/gsi-parser';
import type { RawGsiPayload } from '../core/match/types';

export interface GsiListenerOptions {
  port?: number;
  authToken?: string;
  onPayloadParsed?: (result: GsiParseResult, raw: RawGsiPayload) => void;
}

export class GsiHttpListener {
  private server: http.Server | null = null;
  private port: number;
  private authToken?: string;
  private listening: boolean = false;
  private lastHeartbeat: number | null = null;
  private lastPayload: RawGsiPayload | null = null;
  private onPayloadParsed?: (result: GsiParseResult, raw: RawGsiPayload) => void;

  constructor(options?: GsiListenerOptions) {
    this.port = options?.port ?? 3001;
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

  public generateConfigFile(): string {
    return generateGsiConfigFile(this.port, this.authToken || 'cs2-assistant-local-token');
  }

  public async start(port?: number): Promise<{ success: boolean; port: number; error?: string }> {
    if (this.listening && this.server) {
      return { success: true, port: this.port };
    }
    if (port && Number.isInteger(port) && port > 0 && port <= 65535) {
      this.port = port;
    }

    return new Promise((resolve) => {
      const srv = http.createServer((req, res) => {
        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
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
      });

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
