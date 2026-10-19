/**
 * CS2 Assistant - Domain 5 Test Suite: Lineup Execution Engine (7-State FSM)
 * File: tests/domain5-lineup-fsm.test.ts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LineupExecutionEngine } from '../src/core/lineup-fsm/lineup-engine';

describe('Domain 5: Lineup Execution State Machine, Hysteresis & Completion Types', () => {
  let fsm: LineupExecutionEngine;

  beforeEach(() => {
    fsm = new LineupExecutionEngine(['mirage-window-smoke', 'mirage-jungle-smoke', 'mirage-ct-smoke']);
  });

  it('5.1: progresses deterministically through INACTIVE -> NEARBY -> POSITIONING -> ALIGNING -> READY -> EXECUTED -> NEXT', () => {
    expect(fsm.getState()).toBe('INACTIVE');
    expect(fsm.getActiveLineupId()).toBe('mirage-window-smoke');

    // Approach within 150 units -> NEARBY
    expect(
      fsm.evaluateTelemetry({ distanceToStartUnits: 120, angleOffsetDegrees: 45, utilityEquipped: false })
    ).toBe('NEARBY');

    // Approach within 30 units -> POSITIONING
    expect(
      fsm.evaluateTelemetry({ distanceToStartUnits: 25, angleOffsetDegrees: 30, utilityEquipped: true })
    ).toBe('POSITIONING');

    // Within 10 units and <= 15 deg offset -> ALIGNING
    expect(
      fsm.evaluateTelemetry({ distanceToStartUnits: 8, angleOffsetDegrees: 10, utilityEquipped: true })
    ).toBe('ALIGNING');

    // Within 5 units, <= 1.5 deg offset, and utility equipped -> READY
    expect(
      fsm.evaluateTelemetry({ distanceToStartUnits: 3, angleOffsetDegrees: 0.8, utilityEquipped: true })
    ).toBe('READY');

    // Execute throw -> EXECUTED
    const completion = fsm.recordExecution({ throwConfirmed: true });
    expect(completion).toBe('Confirmed thrown');
    expect(fsm.getState()).toBe('EXECUTED');

    // Advance sequence -> NEXT
    const next = fsm.advanceToNext();
    expect(next.state).toBe('NEXT');
    expect(next.nextLineupId).toBe('mirage-jungle-smoke');
  });

  it('5.2: prevents rapid overlay flickering via dual-radius spatial and angular hysteresis', () => {
    // Enter READY at d=4, angle=1.0
    fsm.evaluateTelemetry({ distanceToStartUnits: 100, angleOffsetDegrees: 20, utilityEquipped: true });
    fsm.evaluateTelemetry({ distanceToStartUnits: 20, angleOffsetDegrees: 20, utilityEquipped: true });
    fsm.evaluateTelemetry({ distanceToStartUnits: 8, angleOffsetDegrees: 10, utilityEquipped: true });
    expect(
      fsm.evaluateTelemetry({ distanceToStartUnits: 4, angleOffsetDegrees: 1.0, utilityEquipped: true })
    ).toBe('READY');

    // Minor jitter to d=7.5, angle=2.0 (outside entry 5/1.5, but inside exit 10/2.5) must STAY READY
    expect(
      fsm.evaluateTelemetry({ distanceToStartUnits: 7.5, angleOffsetDegrees: 2.0, utilityEquipped: true })
    ).toBe('READY');

    // Crossing exit threshold d=12 demotes to ALIGNING
    expect(
      fsm.evaluateTelemetry({ distanceToStartUnits: 12, angleOffsetDegrees: 2.0, utilityEquipped: true })
    ).toBe('ALIGNING');
  });

  it('5.3: strictly distinguishes Attempted, Confirmed thrown, Confirmed landed, and Manually completed', () => {
    expect(fsm.recordExecution({ attackTriggered: true })).toBe('Attempted');
    expect(fsm.recordExecution({ throwConfirmed: true })).toBe('Confirmed thrown');
    expect(fsm.recordExecution({ landedConfirmed: true })).toBe('Confirmed landed');
    expect(fsm.recordExecution({ manualOverride: true })).toBe('Manually completed');
  });

  it('5.4: supports manual cancellation returning to INACTIVE', () => {
    fsm.evaluateTelemetry({ distanceToStartUnits: 100, angleOffsetDegrees: 20, utilityEquipped: true });
    expect(fsm.getState()).toBe('NEARBY');
    fsm.cancel();
    expect(fsm.getState()).toBe('INACTIVE');
    expect(fsm.getLastCompletionType()).toBeNull();
  });
});
