/**
 * CS2 Assistant - Structured AI Output & Evidence Validator
 * File: src/core/ai/validator.ts
 *
 * Implements Section 8.2 Structured AI Output validation:
 * Rejects malformed JSON, hallucinated lineup IDs, expired timestamps,
 * overly long HUD strings (> 45 chars), and ungrounded claims.
 */

import type {
  TacticalRecommendation,
  RecommendationValidationResult,
} from './types';

const VALID_TYPES = new Set([
  'EXECUTE_LINEUP',
  'FALLBACK_POSITION',
  'SAVE_EQUIPMENT',
  'CALL_TIMEOUT',
  'SILENCE',
]);

const VALID_PRIORITIES = new Set([
  'CRITICAL',
  'CONTEXTUAL',
  'INFORMATIONAL',
  'PASSIVE',
]);

export function validateTacticalRecommendation(
  rawInput: unknown,
  options?: {
    nowMs?: number;
    knownLineupIds?: Set<string>;
    knownEventIds?: Set<string>;
    dismissedRecommendationIds?: Set<string>;
  }
): RecommendationValidationResult {
  const now = options?.nowMs ?? Date.now();
  const errors: string[] = [];

  let parsed: any;
  if (typeof rawInput === 'string') {
    try {
      parsed = JSON.parse(rawInput);
    } catch {
      return { valid: false, errors: ['Malformed JSON string in AI response'] };
    }
  } else if (rawInput && typeof rawInput === 'object' && !Array.isArray(rawInput)) {
    parsed = rawInput;
  } else {
    return { valid: false, errors: ['AI output must be a JSON object'] };
  }

  if (typeof parsed.recommendationId !== 'string' || parsed.recommendationId.trim().length === 0) {
    errors.push('Missing or invalid recommendationId');
  } else if (options?.dismissedRecommendationIds?.has(parsed.recommendationId)) {
    errors.push('Recommendation was already dismissed by player');
  }

  if (!VALID_TYPES.has(parsed.type)) {
    errors.push(`Invalid recommendation type: ${String(parsed.type)}`);
  }

  if (!VALID_PRIORITIES.has(parsed.priority)) {
    errors.push(`Invalid priority level: ${String(parsed.priority)}`);
  }

  if (
    typeof parsed.confidence !== 'number' ||
    !Number.isFinite(parsed.confidence) ||
    parsed.confidence < 0 ||
    parsed.confidence > 1
  ) {
    errors.push('Confidence must be a finite number between 0.0 and 1.0');
  }

  if (!Array.isArray(parsed.supportingEventIds)) {
    errors.push('supportingEventIds must be an array of event ID strings');
  } else {
    for (const id of parsed.supportingEventIds) {
      if (typeof id !== 'string' || id.trim().length === 0) {
        errors.push('supportingEventIds contains non-string or empty event ID');
      } else if (options?.knownEventIds && !options.knownEventIds.has(id)) {
        errors.push(`Unverified supportingEventId "${id}" not found in Tactical Memory`);
      }
    }
  }

  if (typeof parsed.shortDisplayText !== 'string' || parsed.shortDisplayText.trim().length === 0) {
    errors.push('shortDisplayText must be a non-empty string');
  } else if (parsed.shortDisplayText.length > 45) {
    errors.push(`shortDisplayText exceeds 45 character HUD limit (${parsed.shortDisplayText.length} chars)`);
  }

  if (typeof parsed.detailedExplanation !== 'string') {
    errors.push('detailedExplanation must be a string');
  }

  if (parsed.suggestedLineupId !== undefined && parsed.suggestedLineupId !== null) {
    if (typeof parsed.suggestedLineupId !== 'string' || parsed.suggestedLineupId.trim().length === 0) {
      errors.push('suggestedLineupId must be a non-empty string when provided');
    } else if (
      options?.knownLineupIds &&
      options.knownLineupIds.size > 0 &&
      !options.knownLineupIds.has(parsed.suggestedLineupId)
    ) {
      errors.push(
        `Hallucinated suggestedLineupId "${parsed.suggestedLineupId}" does not exist in Utility Room`
      );
    }
  }

  if (
    typeof parsed.expiresAt !== 'number' ||
    !Number.isFinite(parsed.expiresAt) ||
    parsed.expiresAt <= now
  ) {
    errors.push('Recommendation has already expired or has an invalid expiresAt timestamp');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const validated: TacticalRecommendation = {
    recommendationId: parsed.recommendationId.trim(),
    type: parsed.type,
    priority: parsed.priority,
    confidence: parsed.confidence,
    supportingEventIds: [...parsed.supportingEventIds],
    shortDisplayText: parsed.shortDisplayText.trim(),
    detailedExplanation: parsed.detailedExplanation.trim(),
    suggestedLineupId: parsed.suggestedLineupId ? parsed.suggestedLineupId.trim() : undefined,
    expiresAt: parsed.expiresAt,
  };

  return { valid: true, recommendation: validated, errors: [] };
}
