/**
 * CS2 Assistant - Secure Credential Store
 * File: src/main/credential-store.ts
 *
 * Implements Windows DPAPI credential encryption via Electron safeStorage.
 * Persists encrypted ciphertext to %APPDATA%/cs2-assistant/credentials.enc.
 * Provides an in-memory mock for headless Vitest testing and zero-leak verification.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * Safe optional import of Electron modules to prevent crashes when running
 * in headless Node/Vitest environments.
 */
let electronApp: typeof import('electron').app | undefined;
let electronSafeStorage: typeof import('electron').safeStorage | undefined;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const electron = require('electron');
  electronApp = electron.app;
  electronSafeStorage = electron.safeStorage;
} catch {
  // Running in headless Node or Vitest environment without Electron binaries
}

/**
 * Interface abstraction for credential operations.
 * Enables zero-dependency mocking in headless Vitest environments.
 */
export interface ICredentialStore {
  isEncryptionAvailable(): boolean;
  storeApiKey(apiKey: string): Promise<boolean>;
  saveApiKey(apiKey: string): Promise<boolean>;
  getApiKey(): Promise<string | null>;
  getMaskedApiKey(): Promise<string | null>;
  removeApiKey(): Promise<boolean>;
  clearApiKey(): Promise<boolean>;
  invalidateApiKey(): Promise<boolean>;
  hasApiKey(): Promise<boolean>;
  getRawCiphertext?(): string | null;
}

/**
 * Production implementation using Electron safeStorage (Windows DPAPI).
 */
export class SafeStorageCredentialStore implements ICredentialStore {
  private readonly storageFilePath: string;

  constructor(customPath?: string) {
    if (customPath) {
      this.storageFilePath = customPath;
    } else {
      let userDataDir = '.';
      try {
        if (electronApp && typeof electronApp.getPath === 'function') {
          userDataDir = electronApp.getPath('userData');
        } else {
          userDataDir = path.join(process.env.APPDATA || '.', 'cs2-assistant');
        }
      } catch {
        userDataDir = path.join(process.env.APPDATA || '.', 'cs2-assistant');
      }
      this.storageFilePath = path.join(userDataDir, 'credentials.enc');
    }
  }

  public isEncryptionAvailable(): boolean {
    try {
      return (
        typeof electronSafeStorage !== 'undefined' &&
        electronSafeStorage !== null &&
        typeof electronSafeStorage.isEncryptionAvailable === 'function' &&
        electronSafeStorage.isEncryptionAvailable()
      );
    } catch {
      return false;
    }
  }

  public async storeApiKey(apiKey: string): Promise<boolean> {
    if (typeof apiKey !== 'string') {
      throw new Error('API key must not be empty');
    }
    const trimmed = apiKey.trim();
    if (!trimmed) {
      throw new Error('API key must not be empty');
    }

    if (!this.isEncryptionAvailable()) {
      throw new Error('OS credential encryption (DPAPI) is not available on this system');
    }

    try {
      const encryptedBuffer = electronSafeStorage!.encryptString(trimmed);
      const targetDir = path.dirname(this.storageFilePath);

      // Ensure directory exists
      await fs.promises.mkdir(targetDir, { recursive: true });

      // Write atomically via temporary file with restricted 0o600 permissions
      const tempPath = `${this.storageFilePath}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`;
      await fs.promises.writeFile(tempPath, encryptedBuffer, { mode: 0o600 });
      await fs.promises.rename(tempPath, this.storageFilePath);

      return true;
    } catch (err) {
      console.error('[CredentialStore] Failed to encrypt or persist credentials:', err instanceof Error ? err.message : err);
      return false;
    }
  }

  public async saveApiKey(apiKey: string): Promise<boolean> {
    try {
      return await this.storeApiKey(apiKey);
    } catch {
      return false;
    }
  }

  public async getApiKey(): Promise<string | null> {
    if (!fs.existsSync(this.storageFilePath)) {
      return null;
    }

    if (!this.isEncryptionAvailable()) {
      throw new Error('OS credential encryption (DPAPI) is not available to decrypt stored credentials');
    }

    try {
      const encryptedBuffer = await fs.promises.readFile(this.storageFilePath);
      if (encryptedBuffer.length === 0) {
        return null;
      }
      return electronSafeStorage!.decryptString(encryptedBuffer);
    } catch (err) {
      console.error('[CredentialStore] Failed to decrypt stored credentials:', err instanceof Error ? err.message : err);
      return null;
    }
  }

  public async getMaskedApiKey(): Promise<string | null> {
    const rawKey = await this.getApiKey();
    if (!rawKey) return null;
    return SafeStorageCredentialStore.maskKey(rawKey);
  }

  public async hasApiKey(): Promise<boolean> {
    const key = await this.getApiKey();
    return key !== null && key.length > 0;
  }

  public async removeApiKey(): Promise<boolean> {
    try {
      if (fs.existsSync(this.storageFilePath)) {
        await fs.promises.unlink(this.storageFilePath);
      }
      return true;
    } catch (err) {
      console.error('[CredentialStore] Failed to remove credentials:', err instanceof Error ? err.message : err);
      return false;
    }
  }

  public async clearApiKey(): Promise<boolean> {
    return this.removeApiKey();
  }

  public async invalidateApiKey(): Promise<boolean> {
    return this.removeApiKey();
  }

  /**
   * Masks sensitive API keys for display purposes.
   * Example: 'AIzaSyAbcd1234567890XyZ' -> 'AIzaSy...0XyZ'
   */
  public static maskKey(key: string): string {
    if (!key || key.length < 10) {
      return '********';
    }
    const prefix = key.substring(0, 6);
    const suffix = key.substring(key.length - 4);
    return `${prefix}...${suffix}`;
  }
}

/**
 * In-memory mock implementation for Vitest suites and non-Electron environments.
 * Stores ciphertext internally in encrypted/obfuscated buffer to enforce zero-plaintext invariants.
 */
export class InMemoryCredentialStore implements ICredentialStore {
  private _cipherBuffer: string | null = null;
  private _encryptionAvailable: boolean = true;
  private readonly _salt: string = 'CS2_DPAPI_SIM_SALT_9982';

  constructor(initialKey: string | null = null, encryptionAvailable: boolean = true) {
    this._encryptionAvailable = encryptionAvailable;
    if (initialKey) {
      this.encryptAndStore(initialKey);
    }
  }

  public isEncryptionAvailable(): boolean {
    return this._encryptionAvailable;
  }

  public setEncryptionAvailable(available: boolean): void {
    this._encryptionAvailable = available;
  }

  public getRawCiphertext(): string | null {
    return this._cipherBuffer;
  }

  public injectCorruptedCiphertext(corrupted: string): void {
    this._cipherBuffer = corrupted;
  }

  private encryptAndStore(plainKey: string): void {
    // Authenticated encryption simulation: Prepend HMAC integrity tag
    const hmac = crypto.createHmac('sha256', this._salt).update(plainKey).digest('hex').substring(0, 16);
    const wrapped = `${hmac}::${plainKey}`;
    const encoded = Buffer.from(wrapped, 'utf-8').toString('base64');
    const obfuscated = encoded
      .split('')
      .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ (this._salt.charCodeAt(i % this._salt.length) & 0x0f)))
      .join('');
    this._cipherBuffer = `DPAPI_ENC::v1::${Buffer.from(obfuscated, 'utf-8').toString('base64')}`;
  }

  public async storeApiKey(apiKey: string): Promise<boolean> {
    if (!this._encryptionAvailable) {
      throw new Error('OS credential encryption (DPAPI) is not available');
    }
    if (typeof apiKey !== 'string') {
      throw new Error('API key must not be empty');
    }
    const trimmed = apiKey.trim();
    if (!trimmed) {
      throw new Error('API key must not be empty');
    }
    this.encryptAndStore(trimmed);
    return true;
  }

  public async saveApiKey(apiKey: string): Promise<boolean> {
    if (!this._encryptionAvailable) {
      return false;
    }
    if (typeof apiKey !== 'string') {
      return false;
    }
    const trimmed = apiKey.trim();
    if (trimmed.length === 0) {
      return false;
    }
    this.encryptAndStore(trimmed);
    return true;
  }

  public async getApiKey(): Promise<string | null> {
    if (!this._cipherBuffer) {
      return null;
    }
    if (!this._encryptionAvailable) {
      throw new Error('OS credential encryption (DPAPI) is not available');
    }
    try {
      if (!this._cipherBuffer.startsWith('DPAPI_ENC::v1::')) {
        throw new Error('CORRUPTED_STORAGE_HEADER: Invalid cipher header format');
      }
      const rawPayload = this._cipherBuffer.replace('DPAPI_ENC::v1::', '');
      const obfuscated = Buffer.from(rawPayload, 'base64').toString('utf-8');
      const deobfuscated = obfuscated
        .split('')
        .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ (this._salt.charCodeAt(i % this._salt.length) & 0x0f)))
        .join('');
      const plain = Buffer.from(deobfuscated, 'base64').toString('utf-8');

      if (!plain || plain.length === 0) {
        throw new Error('CORRUPTED_STORAGE_PAYLOAD: Decrypted to empty payload');
      }

      const separatorIndex = plain.indexOf('::');
      if (separatorIndex === -1) {
        throw new Error('CORRUPTED_STORAGE_PAYLOAD: Missing integrity checksum');
      }
      const checksum = plain.substring(0, separatorIndex);
      const recoveredKey = plain.substring(separatorIndex + 2);
      const expectedChecksum = crypto.createHmac('sha256', this._salt).update(recoveredKey).digest('hex').substring(0, 16);
      if (checksum !== expectedChecksum) {
        throw new Error('CORRUPTED_STORAGE_PAYLOAD: Integrity checksum verification failed');
      }

      return recoveredKey;
    } catch {
      // Fail-safe closed: corrupted storage returns null without unhandled throw
      return null;
    }
  }

  public async getMaskedApiKey(): Promise<string | null> {
    const rawKey = await this.getApiKey();
    if (!rawKey) return null;
    return SafeStorageCredentialStore.maskKey(rawKey);
  }

  public async hasApiKey(): Promise<boolean> {
    const key = await this.getApiKey();
    return key !== null && key.length > 0;
  }

  public async removeApiKey(): Promise<boolean> {
    this._cipherBuffer = null;
    return true;
  }

  public async clearApiKey(): Promise<boolean> {
    return this.removeApiKey();
  }

  public async invalidateApiKey(): Promise<boolean> {
    return this.removeApiKey();
  }
}

export interface IUserSettings {
  theme: 'zinc-950' | 'charcoal';
  hudOpacity: number;
  hudScale: number;
  showSafeZoneOverlay: boolean;
  environmentMode: 'COMPETITIVE_PROTECTED' | 'PRACTICE_SERVER' | 'SIMULATION_PREVIEW';
}

export const DEFAULT_USER_SETTINGS: IUserSettings = {
  theme: 'zinc-950',
  hudOpacity: 0.85,
  hudScale: 1.0,
  showSafeZoneOverlay: false,
  environmentMode: 'COMPETITIVE_PROTECTED',
};

export class InMemorySettingsStore {
  private _storage: string | null = null;

  public saveSettings(settings: IUserSettings): boolean {
    try {
      this._storage = JSON.stringify(settings);
      return true;
    } catch {
      return false;
    }
  }

  public getSettings(): IUserSettings {
    if (!this._storage) {
      return { ...DEFAULT_USER_SETTINGS };
    }
    try {
      const parsed = JSON.parse(this._storage);
      if (typeof parsed !== 'object' || parsed === null) {
        return { ...DEFAULT_USER_SETTINGS };
      }
      return {
        theme: parsed.theme === 'charcoal' ? 'charcoal' : 'zinc-950',
        hudOpacity: typeof parsed.hudOpacity === 'number' ? Math.max(0, Math.min(1, parsed.hudOpacity)) : 0.85,
        hudScale: typeof parsed.hudScale === 'number' ? Math.max(0.5, Math.min(2.0, parsed.hudScale)) : 1.0,
        showSafeZoneOverlay: Boolean(parsed.showSafeZoneOverlay),
        environmentMode: ['COMPETITIVE_PROTECTED', 'PRACTICE_SERVER', 'SIMULATION_PREVIEW'].includes(parsed.environmentMode)
          ? parsed.environmentMode
          : 'COMPETITIVE_PROTECTED',
      };
    } catch {
      return { ...DEFAULT_USER_SETTINGS };
    }
  }

  public injectCorruptedJson(badJson: string): void {
    this._storage = badJson;
  }
}
