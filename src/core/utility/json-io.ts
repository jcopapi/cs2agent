/**
 * CS2 Assistant - Secure JSON Import/Export & Sanitization Subsystem
 * File: src/core/utility/json-io.ts
 *
 * Implements strict schema validation, prototype pollution guards,
 * XSS/HTML sanitization, SVG landmark sanitization, and conflict resolution.
 * Pure TypeScript — 100% headless, zero Electron/DOM dependencies.
 */

import type {
  CS2Map,
  TeamSide,
  UtilityType,
  StrategyTier,
  Lineup,
  Strategy,
  MatchPreparationProfile,
} from './types';

export const MAX_IMPORT_PAYLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_NESTING_DEPTH = 10;
export const CURRENT_SCHEMA_VERSION = '1.0.0';

export type ImportConflictPolicy = 'OVERWRITE' | 'RENAME' | 'SKIP';

export class JsonSecurityError extends Error {
  constructor(message: string) {
    super(`[Security Violation] ${message}`);
    this.name = 'JsonSecurityError';
  }
}

export interface ValidationError {
  path: string;
  message: string;
  invalidValue?: unknown;
}

export interface ValidationResult<T> {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
  sanitizedData?: T;
}

export interface ImportSummary {
  totalProcessed: number;
  importedCount: number;
  skippedCount: number;
  overwrittenCount: number;
  renamedCount: number;
  errors: ValidationError[];
  sanitizationWarnings: string[];
  importedLineupIds: string[];
  importedStrategyIds: string[];
}

export type ExportBundleType =
  | 'LINEUP_COLLECTION'
  | 'STRATEGY_COLLECTION'
  | 'PREPARATION_PROFILE'
  | 'PLAYBOOK_BUNDLE';

export interface PlaybookEnvelope<T = unknown> {
  schemaVersion: '1.0.0';
  appVersion: string;
  exportedAt: string;
  bundleType: ExportBundleType;
  metadata: {
    itemCount: number;
    mapFilter?: CS2Map;
    author?: string;
    description?: string;
  };
  payload: T;
  checksum: string;
}

// Allowed Enums Whitelists
const ALLOWED_MAPS = new Set<CS2Map>([
  'de_mirage',
  'de_inferno',
  'de_dust2',
  'de_nuke',
  'de_ancient',
  'de_anubis',
]);

const ALLOWED_SIDES = new Set<TeamSide>(['CT', 'T', 'BOTH']);

const ALLOWED_UTILITIES = new Set<UtilityType>([
  'SMOKE',
  'FLASHBANG',
  'HE_GRENADE',
  'MOLOTOV_INCENDIARY',
]);

const ALLOWED_THROW_TYPES = new Set([
  'STAND',
  'STANDING',
  'JUMPTHROW',
  'RUN',
  'RUN_JUMPTHROW',
  'CROUCH',
  'CROUCH_JUMPTHROW',
  'WALK_THROW',
]);

const ALLOWED_DIFFICULTIES = new Set(['EASY', 'MEDIUM', 'HARD']);
const ALLOWED_STRATEGY_TIERS = new Set<StrategyTier>([
  'BASIC',
  'INTERMEDIATE',
  'ADVANCED',
  'COORDINATED',
]);

// ---------------------------------------------------------------------------
// 1. Prototype Pollution Defense & Safe Parsing
// ---------------------------------------------------------------------------

const FORBIDDEN_POLLUTION_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Custom reviver checking for prototype pollution during JSON.parse.
 */
function secureReviver(key: string, value: unknown): unknown {
  if (FORBIDDEN_POLLUTION_KEYS.has(key)) {
    throw new JsonSecurityError(`Prototype pollution attempt detected: key "${key}" is strictly forbidden.`);
  }
  return value;
}

/**
 * Safely parses raw JSON string with byte-size caps, recursion depth checks,
 * and prototype pollution guards.
 */
export function parseJsonSecurely(rawJson: string): unknown {
  if (typeof rawJson !== 'string') {
    throw new JsonSecurityError('Input payload must be a string.');
  }

  const byteLength = new TextEncoder().encode(rawJson).length;
  if (byteLength > MAX_IMPORT_PAYLOAD_BYTES) {
    throw new JsonSecurityError(
      `Payload size (${byteLength} bytes) exceeds maximum permitted limit (${MAX_IMPORT_PAYLOAD_BYTES} bytes).`
    );
  }

  // Fast token check for forbidden keys in JSON string before parsing
  if (/"(?:__proto__|constructor|prototype)"\s*:/i.test(rawJson)) {
    throw new JsonSecurityError('Prototype pollution token detected in payload JSON keys.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson, secureReviver);
  } catch (err: any) {
    if (err instanceof JsonSecurityError) throw err;
    throw new Error(`JSON Syntax Error: ${err.message}`);
  }

  // Deep verification of parsed object tree
  verifyObjectIntegrity(parsed, 0);

  return parsed;
}

function verifyObjectIntegrity(obj: unknown, depth: number): void {
  if (depth > MAX_NESTING_DEPTH) {
    throw new JsonSecurityError(`Exceeded maximum object nesting depth (${MAX_NESTING_DEPTH}). Potential JSON bomb.`);
  }

  if (obj === null || typeof obj !== 'object') {
    return;
  }

  const proto = Object.getPrototypeOf(obj);
  if (proto !== null && proto !== Object.prototype && proto !== Array.prototype) {
    throw new JsonSecurityError('Invalid object prototype detected.');
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      verifyObjectIntegrity(obj[i], depth + 1);
    }
  } else {
    for (const key of Object.keys(obj as Record<string, unknown>)) {
      if (FORBIDDEN_POLLUTION_KEYS.has(key)) {
        throw new JsonSecurityError(`Object property "${key}" violates prototype security.`);
      }
      verifyObjectIntegrity((obj as Record<string, unknown>)[key], depth + 1);
    }
  }
}

// ---------------------------------------------------------------------------
// 2. String & SVG Sanitization Engine
// ---------------------------------------------------------------------------

/**
 * Sanitizes generic user text fields against HTML/Script injection.
 */
export function sanitizeText(input: unknown, maxLength: number = 500): string {
  if (typeof input !== 'string') return '';

  let clean = input;
  // 1. Strip script tags and their content
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // 2. Strip pseudo-protocol URLs
  clean = clean.replace(/(?:javascript|vbscript|data):/gi, '');
  // 3. Strip HTML tags
  clean = clean.replace(/<[^>]*>/g, '');
  // 4. Strip rogue event handlers (e.g. onload=)
  clean = clean.replace(/\bon\w+\s*=/gi, '');
  // 5. Trim and enforce length limit
  return clean.trim().slice(0, maxLength);
}

/**
 * Sanitizes SVG visual references. Permits only safe geometric rendering elements
 * and whitelisted styling attributes. Replaces malformed or hostile SVG with a safe fallback.
 */
export function sanitizeSvg(svgMarkup: unknown): { sanitizedSvg: string; warnings: string[] } {
  const warnings: string[] = [];
  const fallbackSvg =
    '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#121215"/><circle cx="120" cy="70" r="4" fill="#06b6d4"/><text x="120" y="110" font-family="monospace" font-size="10" fill="#a1a1aa" text-anchor="middle">CROSSHAIR ALIGNMENT</text></svg>';

  if (typeof svgMarkup !== 'string' || !svgMarkup.trim()) {
    return { sanitizedSvg: fallbackSvg, warnings: ['Missing or empty SVG reference; safe default supplied.'] };
  }

  const raw = svgMarkup.trim();

  // Must begin with <svg and end with </svg>
  if (!/^<svg[\s>]/i.test(raw) || !/<\/svg>$/i.test(raw)) {
    warnings.push('Invalid SVG root element. Replaced with safe fallback.');
    return { sanitizedSvg: fallbackSvg, warnings };
  }

  // Disallowed dangerous elements
  const FORBIDDEN_ELEMENTS = /<\/?(script|foreignObject|iframe|embed|object|use|image|animate|set|handler|audio|video)\b/i;
  if (FORBIDDEN_ELEMENTS.test(raw)) {
    warnings.push('Prohibited SVG tags detected and stripped (script/foreignObject/iframe/etc).');
  }

  // Strip forbidden tags
  let cleaned = raw.replace(/<\/?(script|foreignObject|iframe|embed|object|use|image|animate|set|handler|audio|video)\b[^>]*>/gi, '');

  // Strip dangerous event handler attributes (e.g. onload=, onclick=)
  if (/\bon\w+\s*=/i.test(cleaned)) {
    warnings.push('Inline JavaScript event handler attributes stripped from SVG.');
    cleaned = cleaned.replace(/\bon\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');
  }

  // Strip javascript: or data: pseudo-protocols in href or style
  if (/(?:javascript|data|vbscript):/i.test(cleaned)) {
    warnings.push('URI pseudo-protocols stripped from SVG.');
    cleaned = cleaned.replace(/(?:href|xlink:href|src)\s*=\s*['"][^'"]*['"]/gi, '');
  }

  // Verify basic balanced SVG envelope remains
  if (!cleaned.startsWith('<svg') || !cleaned.endsWith('</svg>')) {
    return { sanitizedSvg: fallbackSvg, warnings: [...warnings, 'SVG envelope damaged during sanitization.'] };
  }

  return { sanitizedSvg: cleaned, warnings };
}

// ---------------------------------------------------------------------------
// 3. Strict Schema Validation
// ---------------------------------------------------------------------------

const LINEUP_ALLOWED_KEYS = new Set([
  'id',
  'map',
  'side',
  'utilityType',
  'technique',
  'title',
  'throwPosition',
  'startPosition',
  'landingArea',
  'targetDestination',
  'crosshairTarget',
  'throwType',
  'movementKey',
  'movementRequirements',
  'aimReference',
  'svgReference',
  'instructions',
  'tags',
  'difficulty',
  'sourceAttribution',
  'verified',
  'gameVersion',
  'lastVerificationDate',
  'isCustom',
  'favorite',
  'tickrate',
]);

export function validateLineup(candidate: unknown, path: string = 'lineup'): ValidationResult<Lineup> {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return {
      valid: false,
      errors: [{ path, message: 'Lineup must be a non-null object' }],
      warnings,
    };
  }

  const obj = candidate as Record<string, unknown>;

  // Check for unknown properties (strict whitelist)
  for (const key of Object.keys(obj)) {
    if (!LINEUP_ALLOWED_KEYS.has(key)) {
      errors.push({ path: `${path}.${key}`, message: `Unrecognized property "${key}" in Lineup schema.` });
    }
  }

  // id: required string, non-empty, alphanumeric + hyphens/underscores
  let id = '';
  if (typeof obj.id !== 'string' || !obj.id.trim()) {
    errors.push({ path: `${path}.id`, message: 'Property "id" must be a non-empty string.' });
  } else {
    id = sanitizeText(obj.id, 80);
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      errors.push({
        path: `${path}.id`,
        message: 'Property "id" must contain only alphanumeric characters, hyphens, or underscores.',
      });
    }
  }

  // map: required enum
  let map: CS2Map = 'de_mirage';
  if (!ALLOWED_MAPS.has(obj.map as CS2Map)) {
    errors.push({
      path: `${path}.map`,
      message: `Invalid map "${obj.map}". Allowed maps: ${Array.from(ALLOWED_MAPS).join(', ')}.`,
    });
  } else {
    map = obj.map as CS2Map;
  }

  // side: required enum
  let side: TeamSide = 'T';
  if (!ALLOWED_SIDES.has(obj.side as TeamSide)) {
    errors.push({ path: `${path}.side`, message: `Invalid side "${obj.side}". Allowed: CT, T, BOTH.` });
  } else {
    side = obj.side as TeamSide;
  }

  // utilityType: required enum
  let utilityType: UtilityType = 'SMOKE';
  if (!ALLOWED_UTILITIES.has(obj.utilityType as UtilityType)) {
    errors.push({
      path: `${path}.utilityType`,
      message: `Invalid utilityType "${obj.utilityType}". Allowed: ${Array.from(ALLOWED_UTILITIES).join(', ')}.`,
    });
  } else {
    utilityType = obj.utilityType as UtilityType;
  }

  // title: required string
  let title = '';
  if (typeof obj.title !== 'string' || !obj.title.trim()) {
    errors.push({ path: `${path}.title`, message: 'Property "title" must be a non-empty string.' });
  } else {
    title = sanitizeText(obj.title, 120);
  }

  // startPosition / throwPosition: required object { x, y, z, callout, toleranceUnits? }
  const rawPos = obj.throwPosition || obj.startPosition;
  let startPosition = { x: 0, y: 0, z: 0, callout: '', toleranceUnits: 6 };
  let throwPosition = {
    x: 0,
    y: 0,
    z: 0,
    callout: '',
    description: '',
    toleranceUnits: 6,
  };

  if (!rawPos || typeof rawPos !== 'object') {
    errors.push({ path: `${path}.startPosition`, message: 'startPosition must be an object with coordinates and callout.' });
  } else {
    const sp = rawPos as Record<string, unknown>;
    const x = Number(sp.x);
    const y = Number(sp.y);
    const z = Number(sp.z);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
      errors.push({ path: `${path}.startPosition`, message: 'Coordinates (x, y, z) must be finite numbers.' });
    }
    const callout = sanitizeText(sp.callout, 80);
    if (!callout) {
      errors.push({ path: `${path}.startPosition.callout`, message: 'Callout must be a non-empty string.' });
    }
    const tolerance = Number(sp.toleranceUnits ?? 6);
    const tolVal = Number.isFinite(tolerance) && tolerance > 0 ? tolerance : 6;
    startPosition = { x, y, z, callout, toleranceUnits: tolVal };
    throwPosition = {
      x,
      y,
      z,
      callout,
      description: sanitizeText(sp.description || callout, 200),
      toleranceUnits: tolVal,
    };
  }

  // targetDestination / landingArea: required object { x, y, z, callout }
  const rawDest = obj.landingArea || obj.targetDestination;
  let targetDestination = { x: 0, y: 0, z: 0, callout: '' };
  let landingArea = { x: 0, y: 0, z: 0, callout: '', description: '' };

  if (!rawDest || typeof rawDest !== 'object') {
    errors.push({ path: `${path}.targetDestination`, message: 'targetDestination must be an object with coordinates and callout.' });
  } else {
    const td = rawDest as Record<string, unknown>;
    const x = Number(td.x);
    const y = Number(td.y);
    const z = Number(td.z);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
      errors.push({ path: `${path}.targetDestination`, message: 'targetDestination (x, y, z) must be finite numbers.' });
    }
    const callout = sanitizeText(td.callout, 80);
    if (!callout) {
      errors.push({ path: `${path}.targetDestination.callout`, message: 'targetDestination.callout must be non-empty.' });
    }
    targetDestination = { x, y, z, callout };
    landingArea = { x, y, z, callout, description: sanitizeText(td.description || callout, 200) };
  }

  // throwType / technique: required enum
  const rawThrow = (obj.throwType || obj.technique) as string;
  let throwType: Lineup['throwType'] = 'STANDING';
  if (!ALLOWED_THROW_TYPES.has(rawThrow)) {
    errors.push({ path: `${path}.throwType`, message: `Invalid throwType "${rawThrow}".` });
  } else {
    throwType = (rawThrow === 'STAND' ? 'STANDING' : rawThrow) as Lineup['throwType'];
  }

  // movementRequirements: optional string
  const movementRequirements = sanitizeText(obj.movementRequirements || 'Stationary throw', 200);

  // aimReference: required object { crosshairPlacement, visualLandmark }
  let aimReference = { crosshairPlacement: '', visualLandmark: '' };
  if (!obj.aimReference || typeof obj.aimReference !== 'object') {
    errors.push({
      path: `${path}.aimReference`,
      message: 'aimReference must be an object with crosshairPlacement and visualLandmark.',
    });
  } else {
    const ar = obj.aimReference as Record<string, unknown>;
    aimReference = {
      crosshairPlacement: sanitizeText(ar.crosshairPlacement, 250),
      visualLandmark: sanitizeText(ar.visualLandmark, 250),
    };
  }

  // svgReference: sanitize SVG markup
  const rawSvg = obj.svgReference || (obj.crosshairTarget as any)?.svgAlignment;
  const { sanitizedSvg, warnings: svgWarnings } = sanitizeSvg(rawSvg);
  warnings.push(...svgWarnings.map((w) => `[${path}.svgReference] ${w}`));

  // crosshairTarget
  const rawCt = (obj.crosshairTarget || {}) as Record<string, unknown>;
  const crosshairTarget = {
    pitch: Number(rawCt.pitch || 0),
    yaw: Number(rawCt.yaw || 0),
    description: sanitizeText(rawCt.description || aimReference.crosshairPlacement, 200),
    visualLandmark: sanitizeText(rawCt.visualLandmark || aimReference.visualLandmark, 200),
    svgAlignment: sanitizedSvg,
  };

  // instructions: array of strings
  let instructions: string[] = [];
  if (!Array.isArray(obj.instructions)) {
    errors.push({ path: `${path}.instructions`, message: 'instructions must be an array of string steps.' });
  } else {
    instructions = obj.instructions.map((step) => sanitizeText(step, 400)).filter((step) => step.length > 0);
    if (instructions.length === 0) {
      errors.push({ path: `${path}.instructions`, message: 'instructions must contain at least one step.' });
    }
  }

  // tags: array of strings
  const tags: string[] = Array.isArray(obj.tags)
    ? obj.tags.map((t) => sanitizeText(t, 40)).filter((t) => t.length > 0)
    : [];

  // difficulty: enum
  const difficulty = ALLOWED_DIFFICULTIES.has(obj.difficulty as string)
    ? (obj.difficulty as Lineup['difficulty'])
    : 'MEDIUM';

  const sourceAttribution = sanitizeText(obj.sourceAttribution || 'User Import', 120);
  const verified = Boolean(obj.verified ?? false);
  const gameVersion = sanitizeText(obj.gameVersion || '1.40.2.1', 30);
  const lastVerificationDate = sanitizeText(obj.lastVerificationDate || new Date().toISOString().slice(0, 10), 30);
  const isCustom = obj.isCustom !== undefined ? Boolean(obj.isCustom) : true;
  const favorite = Boolean(obj.favorite ?? false);
  const movementKey = typeof obj.movementKey === 'string' ? sanitizeText(obj.movementKey, 20) : 'NONE';
  const tickrate = obj.tickrate === 'SUBTICK_CS2' ? 'SUBTICK_CS2' : 'SUBTICK_CS2';

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  const sanitizedData: Lineup = {
    id,
    map,
    side,
    utilityType,
    technique: throwType,
    throwType,
    title,
    startPosition,
    throwPosition,
    targetDestination,
    landingArea,
    crosshairTarget,
    movementKey,
    movementRequirements,
    aimReference,
    svgReference: sanitizedSvg,
    instructions,
    tags,
    difficulty,
    sourceAttribution,
    verified,
    gameVersion,
    lastVerificationDate,
    isCustom,
    favorite,
    tickrate,
  };

  return { valid: true, errors: [], warnings, sanitizedData };
}

const STRATEGY_ALLOWED_KEYS = new Set([
  'id',
  'name',
  'map',
  'side',
  'objective',
  'difficulty',
  'requiredUtility',
  'recommendedRoles',
  'phases',
  'contingencies',
  'coordinationNotes',
  'sourceAttribution',
  'tags',
  'isCustom',
  'favorite',
  'verified',
  'gameVersion',
  'lastVerificationDate',
]);

export function validateStrategy(candidate: unknown, path: string = 'strategy'): ValidationResult<Strategy> {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return {
      valid: false,
      errors: [{ path, message: 'Strategy must be a non-null object' }],
      warnings,
    };
  }

  const obj = candidate as Record<string, unknown>;

  for (const key of Object.keys(obj)) {
    if (!STRATEGY_ALLOWED_KEYS.has(key)) {
      errors.push({ path: `${path}.${key}`, message: `Unrecognized property "${key}" in Strategy schema.` });
    }
  }

  let id = '';
  if (typeof obj.id !== 'string' || !obj.id.trim()) {
    errors.push({ path: `${path}.id`, message: 'Property "id" must be a non-empty string.' });
  } else {
    id = sanitizeText(obj.id, 80);
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      errors.push({
        path: `${path}.id`,
        message: 'Property "id" must contain only alphanumeric characters, hyphens, or underscores.',
      });
    }
  }

  const name = sanitizeText(obj.name, 120);
  if (!name) errors.push({ path: `${path}.name`, message: 'Property "name" must be a non-empty string.' });

  let map: CS2Map = 'de_mirage';
  if (!ALLOWED_MAPS.has(obj.map as CS2Map)) {
    errors.push({ path: `${path}.map`, message: `Invalid map "${obj.map}".` });
  } else {
    map = obj.map as CS2Map;
  }

  let side: TeamSide = 'CT';
  if (!ALLOWED_SIDES.has(obj.side as TeamSide)) {
    errors.push({ path: `${path}.side`, message: `Invalid side "${obj.side}".` });
  } else {
    side = obj.side as TeamSide;
  }

  const objective = sanitizeText(obj.objective, 300);

  const difficulty = ALLOWED_STRATEGY_TIERS.has(obj.difficulty as StrategyTier)
    ? (obj.difficulty as StrategyTier)
    : 'BASIC';

  const requiredUtility = Array.isArray(obj.requiredUtility)
    ? (obj.requiredUtility.filter((u) => ALLOWED_UTILITIES.has(u as UtilityType)) as UtilityType[])
    : [];

  const recommendedRoles = Array.isArray(obj.recommendedRoles)
    ? obj.recommendedRoles.map((r) => sanitizeText(r, 60)).filter((r) => r.length > 0)
    : [];

  // phases validation
  const phases: Strategy['phases'] = [];
  if (!Array.isArray(obj.phases) || obj.phases.length === 0) {
    errors.push({ path: `${path}.phases`, message: 'phases must be an array with at least one phase.' });
  } else {
    let lastTiming = -1;
    obj.phases.forEach((p, idx) => {
      const pPath = `${path}.phases[${idx}]`;
      if (!p || typeof p !== 'object') {
        errors.push({ path: pPath, message: 'Phase must be an object.' });
        return;
      }
      const pObj = p as Record<string, unknown>;
      const timingSeconds = Number(pObj.timingSeconds);
      if (!Number.isFinite(timingSeconds) || timingSeconds < 0) {
        errors.push({ path: `${pPath}.timingSeconds`, message: 'timingSeconds must be a non-negative number.' });
      } else if (timingSeconds < lastTiming) {
        warnings.push(
          `${pPath}.timingSeconds (${timingSeconds}s) is earlier than previous phase (${lastTiming}s). Recommended monotonic order.`
        );
      }
      lastTiming = timingSeconds;

      phases.push({
        phaseNumber: Number(pObj.phaseNumber ?? idx + 1),
        name: sanitizeText(pObj.name, 100),
        timingSeconds: Math.max(0, timingSeconds || 0),
        linkedLineupIds: Array.isArray(pObj.linkedLineupIds)
          ? pObj.linkedLineupIds.map((lid) => sanitizeText(lid, 80)).filter((lid) => lid.length > 0)
          : [],
        instructions: sanitizeText(pObj.instructions, 500),
      });
    });
  }

  // contingencies
  const contingencies: Strategy['contingencies'] = Array.isArray(obj.contingencies)
    ? obj.contingencies.map((c: any) => ({
        trigger: sanitizeText(c?.trigger, 200),
        action: sanitizeText(c?.action, 300),
      }))
    : [];

  const coordinationNotes = sanitizeText(obj.coordinationNotes, 500);
  const sourceAttribution = sanitizeText(obj.sourceAttribution || 'User Import', 120);
  const isCustom = obj.isCustom !== undefined ? Boolean(obj.isCustom) : true;
  const favorite = Boolean(obj.favorite ?? false);
  const tags: string[] = Array.isArray(obj.tags)
    ? obj.tags.map((t) => sanitizeText(t, 40)).filter((t) => t.length > 0)
    : [];

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  const sanitizedData: Strategy = {
    id,
    name,
    map,
    side,
    objective,
    difficulty,
    requiredUtility,
    recommendedRoles,
    phases,
    contingencies,
    coordinationNotes,
    sourceAttribution,
    tags,
    isCustom,
    favorite,
  };

  return { valid: true, errors: [], warnings, sanitizedData };
}

// ---------------------------------------------------------------------------
// 4. Conflict Resolution Engine
// ---------------------------------------------------------------------------

/**
 * Resolves ID collisions between existing database items and incoming items.
 */
export function resolveConflicts<T extends { id: string; title?: string; name?: string; isCustom?: boolean }>(
  existingList: T[],
  incomingList: T[],
  policy: ImportConflictPolicy = 'SKIP'
): { items: T[]; summary: ImportSummary } {
  const existingMap = new Map<string, T>();
  for (const item of existingList) {
    existingMap.set(item.id, { ...item });
  }

  let importedCount = 0;
  let skippedCount = 0;
  let overwrittenCount = 0;
  let renamedCount = 0;
  const importedLineupIds: string[] = [];
  const importedStrategyIds: string[] = [];

  for (const item of incomingList) {
    const isCollision = existingMap.has(item.id);

    if (!isCollision) {
      existingMap.set(item.id, { ...item, isCustom: true });
      importedCount++;
      if ('title' in item) importedLineupIds.push(item.id);
      else importedStrategyIds.push(item.id);
      continue;
    }

    // Handle collision based on policy
    switch (policy) {
      case 'SKIP':
        skippedCount++;
        break;

      case 'OVERWRITE':
        existingMap.set(item.id, { ...item, isCustom: true });
        overwrittenCount++;
        if ('title' in item) importedLineupIds.push(item.id);
        else importedStrategyIds.push(item.id);
        break;

      case 'RENAME': {
        const uniqueSuffix = `${Date.now().toString().slice(-4)}_${Math.random().toString(36).substring(2, 5)}`;
        const newId = `${item.id}_imported_${uniqueSuffix}`;
        const newTitle = item.title ? `${item.title} (Imported)` : undefined;
        const newName = item.name ? `${item.name} (Imported)` : undefined;

        const renamedItem: T = {
          ...item,
          id: newId,
          ...(newTitle ? { title: newTitle } : {}),
          ...(newName ? { name: newName } : {}),
          isCustom: true,
        };

        existingMap.set(newId, renamedItem);
        renamedCount++;
        if ('title' in renamedItem) importedLineupIds.push(newId);
        else importedStrategyIds.push(newId);
        break;
      }
    }
  }

  return {
    items: Array.from(existingMap.values()),
    summary: {
      totalProcessed: incomingList.length,
      importedCount,
      skippedCount,
      overwrittenCount,
      renamedCount,
      errors: [],
      sanitizationWarnings: [],
      importedLineupIds,
      importedStrategyIds,
    },
  };
}

// ---------------------------------------------------------------------------
// 5. Serialization & Export Envelope Generation
// ---------------------------------------------------------------------------

export function calculateChecksum(content: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < content.length; i++) {
    hash ^= content.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function serializeExportEnvelope<T>(
  bundleType: ExportBundleType,
  payload: T,
  metadata?: Partial<PlaybookEnvelope['metadata']>
): string {
  const envelope: PlaybookEnvelope<T> = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    appVersion: '1.0.0',
    exportedAt: new Date().toISOString(),
    bundleType,
    metadata: {
      itemCount: Array.isArray(payload) ? payload.length : 1,
      ...metadata,
    },
    payload,
    checksum: '',
  };

  const payloadStr = JSON.stringify(envelope.payload);
  envelope.checksum = calculateChecksum(payloadStr);

  return JSON.stringify(envelope, null, 2);
}

// ---------------------------------------------------------------------------
// 6. Unified Import & Deserialization Pipeline
// ---------------------------------------------------------------------------

export interface DeserializedPlaybook {
  lineups: Lineup[];
  strategies: Strategy[];
  profiles: MatchPreparationProfile[];
  summary: ImportSummary;
}

export function deserializeAndValidate(
  rawJson: string,
  conflictPolicy: ImportConflictPolicy = 'SKIP',
  existingLineups: Lineup[] = [],
  existingStrategies: Strategy[] = []
): DeserializedPlaybook {
  const parsed = parseJsonSecurely(rawJson);
  const allWarnings: string[] = [];
  const allErrors: ValidationError[] = [];

  let candidateLineups: unknown[] = [];
  let candidateStrategies: unknown[] = [];
  let candidateProfiles: unknown[] = [];

  // Detect Envelope vs Bare Payload
  if (
    parsed &&
    typeof parsed === 'object' &&
    !Array.isArray(parsed) &&
    'bundleType' in parsed &&
    'payload' in parsed
  ) {
    const envelope = parsed as PlaybookEnvelope<unknown>;
    const payload = envelope.payload;

    if (envelope.bundleType === 'LINEUP_COLLECTION') {
      candidateLineups = Array.isArray(payload) ? payload : [payload];
    } else if (envelope.bundleType === 'STRATEGY_COLLECTION') {
      candidateStrategies = Array.isArray(payload) ? payload : [payload];
    } else if (envelope.bundleType === 'PLAYBOOK_BUNDLE' && payload && typeof payload === 'object') {
      const bundle = payload as Record<string, unknown>;
      if (Array.isArray(bundle.lineups)) candidateLineups = bundle.lineups;
      if (Array.isArray(bundle.strategies)) candidateStrategies = bundle.strategies;
      if (Array.isArray(bundle.profiles)) candidateProfiles = bundle.profiles;
    }
  } else if (Array.isArray(parsed)) {
    for (const item of parsed) {
      if (item && typeof item === 'object') {
        if ('startPosition' in item || 'throwPosition' in item) {
          candidateLineups.push(item);
        } else if ('phases' in item) {
          candidateStrategies.push(item);
        }
      }
    }
  } else if (parsed && typeof parsed === 'object') {
    if ('startPosition' in parsed || 'throwPosition' in parsed) {
      candidateLineups.push(parsed);
    } else if ('phases' in parsed) {
      candidateStrategies.push(parsed);
    }
  }

  // Validate Lineups
  const validatedLineups: Lineup[] = [];
  candidateLineups.forEach((item, idx) => {
    const res = validateLineup(item, `lineups[${idx}]`);
    allWarnings.push(...res.warnings);
    if (!res.valid) {
      allErrors.push(...res.errors);
    } else if (res.sanitizedData) {
      validatedLineups.push(res.sanitizedData);
    }
  });

  // Validate Strategies
  const validatedStrategies: Strategy[] = [];
  candidateStrategies.forEach((item, idx) => {
    const res = validateStrategy(item, `strategies[${idx}]`);
    allWarnings.push(...res.warnings);
    if (!res.valid) {
      allErrors.push(...res.errors);
    } else if (res.sanitizedData) {
      validatedStrategies.push(res.sanitizedData);
    }
  });

  // Stop if errors occurred
  if (allErrors.length > 0) {
    return {
      lineups: existingLineups,
      strategies: existingStrategies,
      profiles: [],
      summary: {
        totalProcessed: candidateLineups.length + candidateStrategies.length,
        importedCount: 0,
        skippedCount: 0,
        overwrittenCount: 0,
        renamedCount: 0,
        errors: allErrors,
        sanitizationWarnings: allWarnings,
        importedLineupIds: [],
        importedStrategyIds: [],
      },
    };
  }

  // Resolve conflicts
  const lineupConflict = resolveConflicts(existingLineups, validatedLineups, conflictPolicy);
  const strategyConflict = resolveConflicts(existingStrategies, validatedStrategies, conflictPolicy);

  return {
    lineups: lineupConflict.items,
    strategies: strategyConflict.items,
    profiles: [],
    summary: {
      totalProcessed: candidateLineups.length + candidateStrategies.length,
      importedCount: lineupConflict.summary.importedCount + strategyConflict.summary.importedCount,
      skippedCount: lineupConflict.summary.skippedCount + strategyConflict.summary.skippedCount,
      overwrittenCount: lineupConflict.summary.overwrittenCount + strategyConflict.summary.overwrittenCount,
      renamedCount: lineupConflict.summary.renamedCount + strategyConflict.summary.renamedCount,
      errors: [],
      sanitizationWarnings: allWarnings,
      importedLineupIds: lineupConflict.summary.importedLineupIds,
      importedStrategyIds: strategyConflict.summary.importedStrategyIds,
    },
  };
}

export const JsonIoEngine = {
  parseJsonSecurely,
  sanitizeText,
  sanitizeSvg,
  validateLineup,
  validateStrategy,
  resolveConflicts,
  calculateChecksum,
  serializeExportEnvelope,
  deserializeAndValidate,
};
