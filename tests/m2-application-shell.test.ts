/**
 * Test Suite: Milestone 2 - Application Shell & HUD Safe-Zone Geometry
 * File: tests/m2-application-shell.test.ts
 *
 * Verifies:
 * - Exactly Three Primary Destinations invariant (LIVE MATCH, UTILITY ROOM, HISTORY)
 * - Navigation state switching, tab indicator classes, and view routing
 * - Keyboard shortcuts (1, 2, 3) and input element isolation
 * - Secondary menu modal/drawer lifecycle and required panel inventory
 * - HUD Safe-Zone Geometry: crosshair (450x450 center), radar (320x320 top-left), killfeed (400x200 top-right)
 * - Widget AABB collision detection and viewport resolution scaling
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import React, { useState, useEffect } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SafeZoneEvaluator, type Rect } from '../src/core/hud-manager';

// ----------------------------------------------------------------------------
// 1. Domain Constants
// ----------------------------------------------------------------------------

export const PRIMARY_DESTINATIONS = ['LIVE MATCH', 'UTILITY ROOM', 'HISTORY'] as const;
export type PrimaryDestination = (typeof PRIMARY_DESTINATIONS)[number];

export const SECONDARY_PANELS = [
  'SETTINGS',
  'GEMINI_API_KEY',
  'HUD_CONFIGURATION',
  'COMPLIANCE_MATRIX',
  'HELP',
] as const;
export type SecondaryPanel = (typeof SECONDARY_PANELS)[number];

// ----------------------------------------------------------------------------
// 2. Headless Application Shell Component (Test Implementation)
// ----------------------------------------------------------------------------

interface AppShellProps {
  initialDestination?: PrimaryDestination;
  onNavigate?: (dest: PrimaryDestination) => void;
}

export const MockAppShell: React.FC<AppShellProps> = ({
  initialDestination = 'LIVE MATCH',
  onNavigate,
}) => {
  const [activeDestination, setActiveDestination] = useState<PrimaryDestination>(initialDestination);
  const [secondaryMenuOpen, setSecondaryMenuOpen] = useState<boolean>(false);
  const [activeSecondaryPanel, setActiveSecondaryPanel] = useState<SecondaryPanel>('SETTINGS');

  const handleDestinationChange = (dest: PrimaryDestination) => {
    setActiveDestination(dest);
    onNavigate?.(dest);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Input isolation: Ignore number shortcuts when focused on input/textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') {
        return;
      }

      if (e.key === '1') {
        handleDestinationChange('LIVE MATCH');
      } else if (e.key === '2') {
        handleDestinationChange('UTILITY ROOM');
      } else if (e.key === '3') {
        handleDestinationChange('HISTORY');
      } else if (e.key === 'Escape' && secondaryMenuOpen) {
        setSecondaryMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [secondaryMenuOpen]);

  return React.createElement(
    'div',
    {
      'data-testid': 'app-shell',
      className: 'h-screen w-screen bg-[#09090b] text-[#fafafa] flex flex-col font-sans',
    },
    // Header
    React.createElement(
      'header',
      { className: 'h-12 border-b border-[#27272a] px-4 flex items-center justify-between' },
      React.createElement(
        'div',
        { className: 'flex items-center gap-6' },
        React.createElement('span', { className: 'text-xs font-bold tracking-widest text-[#fafafa]' }, 'CS2 ASSISTANT'),
        React.createElement(
          'nav',
          { 'data-testid': 'primary-navigation', className: 'flex items-center gap-1' },
          PRIMARY_DESTINATIONS.map((dest) => {
            const isActive = activeDestination === dest;
            return React.createElement(
              'button',
              {
                key: dest,
                'data-testid': `nav-tab-${dest.toLowerCase().replace(/\s+/g, '-')}`,
                onClick: () => handleDestinationChange(dest),
                className: `px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  isActive
                    ? 'bg-[#18181b] text-white border-b-2 border-emerald-500'
                    : 'text-[#a1a1aa] hover:text-[#fafafa]'
                }`,
              },
              dest
            );
          })
        )
      ),
      React.createElement(
        'div',
        { className: 'flex items-center gap-3' },
        React.createElement(
          'button',
          {
            'data-testid': 'secondary-menu-trigger',
            onClick: () => setSecondaryMenuOpen(!secondaryMenuOpen),
            className: 'p-1.5 text-[#a1a1aa] hover:text-[#fafafa] border border-[#27272a] rounded',
            'aria-label': 'Settings and Preferences',
          },
          'MENU'
        )
      )
    ),
    // Main
    React.createElement(
      'main',
      { 'data-testid': 'active-view-container', className: 'flex-1 p-6 overflow-auto' },
      activeDestination === 'LIVE MATCH' &&
        React.createElement(
          'div',
          { 'data-testid': 'view-live-match' },
          React.createElement('h2', { className: 'text-sm font-semibold' }, 'LIVE MATCH DASHBOARD'),
          React.createElement('p', { className: 'text-xs text-[#a1a1aa]' }, 'GSI Telemetry & Tactical Memory Active')
        ),
      activeDestination === 'UTILITY ROOM' &&
        React.createElement(
          'div',
          { 'data-testid': 'view-utility-room' },
          React.createElement('h2', { className: 'text-sm font-semibold' }, 'UTILITY ROOM & STRATEGY PLAYBOOK'),
          React.createElement('p', { className: 'text-xs text-[#a1a1aa]' }, 'Lineup Database & Preparation Profiles')
        ),
      activeDestination === 'HISTORY' &&
        React.createElement(
          'div',
          { 'data-testid': 'view-history' },
          React.createElement('h2', { className: 'text-sm font-semibold' }, 'MATCH HISTORY & PERFORMANCE LOOP'),
          React.createElement('p', { className: 'text-xs text-[#a1a1aa]' }, 'Chronological Records & Retake Practice Triggers')
        )
    ),
    // Secondary Drawer
    secondaryMenuOpen &&
      React.createElement(
        'div',
        {
          'data-testid': 'secondary-menu-drawer',
          className: 'fixed inset-y-0 right-0 w-80 bg-[#121215] border-l border-[#27272a] shadow-xl p-4 flex flex-col z-50',
        },
        React.createElement(
          'div',
          { className: 'flex items-center justify-between pb-3 border-b border-[#27272a]' },
          React.createElement('h3', { className: 'text-xs font-semibold text-[#fafafa]' }, 'CONFIGURATION & UTILITIES'),
          React.createElement(
            'button',
            {
              'data-testid': 'secondary-menu-close',
              onClick: () => setSecondaryMenuOpen(false),
              className: 'text-xs text-[#a1a1aa] hover:text-white',
            },
            'CLOSE'
          )
        ),
        React.createElement(
          'div',
          { className: 'py-2 flex gap-1 border-b border-[#27272a] overflow-x-auto' },
          SECONDARY_PANELS.map((panel) =>
            React.createElement(
              'button',
              {
                key: panel,
                'data-testid': `panel-tab-${panel.toLowerCase()}`,
                onClick: () => setActiveSecondaryPanel(panel),
                className: `px-2 py-1 text-[10px] rounded ${
                  activeSecondaryPanel === panel ? 'bg-[#27272a] text-white' : 'text-[#a1a1aa]'
                }`,
              },
              panel
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'flex-1 py-4' },
          activeSecondaryPanel === 'GEMINI_API_KEY' &&
            React.createElement(
              'div',
              { 'data-testid': 'panel-content-gemini-key' },
              React.createElement(
                'label',
                { className: 'text-xs text-[#a1a1aa] block mb-1' },
                'Gemini API Key (DPAPI Encrypted)'
              ),
              React.createElement('input', {
                'data-testid': 'input-gemini-key',
                type: 'password',
                placeholder: 'AIzaSy...',
                className: 'w-full bg-[#18181c] border border-[#27272a] p-1.5 text-xs rounded text-white',
              })
            ),
          activeSecondaryPanel === 'HUD_CONFIGURATION' &&
            React.createElement(
              'div',
              { 'data-testid': 'panel-content-hud-config' },
              React.createElement('span', { className: 'text-xs text-[#a1a1aa]' }, 'HUD Safe-Zone Overlay Active')
            ),
          activeSecondaryPanel === 'COMPLIANCE_MATRIX' &&
            React.createElement(
              'div',
              { 'data-testid': 'panel-content-compliance' },
              React.createElement('span', { className: 'text-xs text-[#a1a1aa]' }, 'Valve Anti-Cheat Compliance Matrix')
            )
        )
      )
  );
};

// ----------------------------------------------------------------------------
// 3. Test Suites
// ----------------------------------------------------------------------------

describe('Milestone 2 Shell: Three Primary Destinations Canonical Invariant', () => {
  it('A1.1: should enforce that exactly three primary navigation destinations exist', () => {
    expect(PRIMARY_DESTINATIONS.length).toBe(3);
    expect(PRIMARY_DESTINATIONS).toContain('LIVE MATCH');
    expect(PRIMARY_DESTINATIONS).toContain('UTILITY ROOM');
    expect(PRIMARY_DESTINATIONS).toContain('HISTORY');
  });

  it('A1.2: should guarantee that no 4th primary destination exists', () => {
    const invalidPrimary = ['SETTINGS', 'GEMINI_API_KEY', 'PREVIEW', 'STORE', 'PROFILE', 'ADMIN'];
    for (const inv of invalidPrimary) {
      expect((PRIMARY_DESTINATIONS as readonly string[]).includes(inv)).toBe(false);
    }
  });

  it('A1.3: should strictly partition secondary utility panels into the secondary menu', () => {
    expect(SECONDARY_PANELS.length).toBe(5);
    expect(SECONDARY_PANELS).toContain('SETTINGS');
    expect(SECONDARY_PANELS).toContain('GEMINI_API_KEY');
    expect(SECONDARY_PANELS).toContain('HUD_CONFIGURATION');
    expect(SECONDARY_PANELS).toContain('COMPLIANCE_MATRIX');
    expect(SECONDARY_PANELS).toContain('HELP');

    // Disjoint set verification
    for (const sec of SECONDARY_PANELS) {
      expect((PRIMARY_DESTINATIONS as readonly string[]).includes(sec)).toBe(false);
    }
  });
});

describe('Milestone 2 Shell: Navigation State & Component View Switching', () => {
  afterEach(cleanup);

  it('A2.1: should render with LIVE MATCH as the default active destination', () => {
    render(React.createElement(MockAppShell));

    expect(screen.getByTestId('view-live-match')).toBeInTheDocument();
    expect(screen.queryByTestId('view-utility-room')).not.toBeInTheDocument();
    expect(screen.queryByTestId('view-history')).not.toBeInTheDocument();

    const liveTab = screen.getByTestId('nav-tab-live-match');
    expect(liveTab.className).toContain('border-emerald-500');
  });

  it('A2.2: should switch active view and tab styling when clicking UTILITY ROOM', () => {
    render(React.createElement(MockAppShell));

    const utilityTab = screen.getByTestId('nav-tab-utility-room');
    fireEvent.click(utilityTab);

    expect(screen.getByTestId('view-utility-room')).toBeInTheDocument();
    expect(screen.queryByTestId('view-live-match')).not.toBeInTheDocument();
    expect(screen.queryByTestId('view-history')).not.toBeInTheDocument();

    expect(utilityTab.className).toContain('border-emerald-500');
  });

  it('A2.3: should complete the full navigation cycle across all three destinations', () => {
    const navSpy = vi.fn();
    render(React.createElement(MockAppShell, { onNavigate: navSpy }));

    // 1. Navigate to UTILITY ROOM
    fireEvent.click(screen.getByTestId('nav-tab-utility-room'));
    expect(navSpy).toHaveBeenCalledWith('UTILITY ROOM');
    expect(screen.getByTestId('view-utility-room')).toBeInTheDocument();

    // 2. Navigate to HISTORY
    fireEvent.click(screen.getByTestId('nav-tab-history'));
    expect(navSpy).toHaveBeenCalledWith('HISTORY');
    expect(screen.getByTestId('view-history')).toBeInTheDocument();

    // 3. Return to LIVE MATCH
    fireEvent.click(screen.getByTestId('nav-tab-live-match'));
    expect(navSpy).toHaveBeenCalledWith('LIVE MATCH');
    expect(screen.getByTestId('view-live-match')).toBeInTheDocument();

    expect(navSpy).toHaveBeenCalledTimes(3);
  });

  it('A2.4: should handle idempotent clicks on currently active tab without state corruption', () => {
    const navSpy = vi.fn();
    render(React.createElement(MockAppShell, { onNavigate: navSpy }));

    fireEvent.click(screen.getByTestId('nav-tab-live-match'));
    expect(screen.getByTestId('view-live-match')).toBeInTheDocument();
  });
});

describe('Milestone 2 Shell: Keyboard Navigation Shortcuts (1, 2, 3) & Input Isolation', () => {
  afterEach(cleanup);

  it('A3.1: should switch to LIVE MATCH when key "1" is pressed', () => {
    render(React.createElement(MockAppShell, { initialDestination: 'UTILITY ROOM' }));
    expect(screen.getByTestId('view-utility-room')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: '1' });
    expect(screen.getByTestId('view-live-match')).toBeInTheDocument();
  });

  it('A3.2: should switch to UTILITY ROOM when key "2" is pressed', () => {
    render(React.createElement(MockAppShell, { initialDestination: 'LIVE MATCH' }));
    fireEvent.keyDown(window, { key: '2' });
    expect(screen.getByTestId('view-utility-room')).toBeInTheDocument();
  });

  it('A3.3: should switch to HISTORY when key "3" is pressed', () => {
    render(React.createElement(MockAppShell, { initialDestination: 'LIVE MATCH' }));
    fireEvent.keyDown(window, { key: '3' });
    expect(screen.getByTestId('view-history')).toBeInTheDocument();
  });

  it('A3.4: should NOT trigger navigation when number keys are typed into an input element', () => {
    render(React.createElement(MockAppShell, { initialDestination: 'LIVE MATCH' }));

    // Open secondary menu and switch to Gemini Key panel
    fireEvent.click(screen.getByTestId('secondary-menu-trigger'));
    fireEvent.click(screen.getByTestId('panel-tab-gemini_api_key'));

    const input = screen.getByTestId('input-gemini-key');
    input.focus();

    // Type '2' inside the input element
    fireEvent.keyDown(input, { key: '2' });

    // Invariant: Destination must NOT switch to UTILITY ROOM while user types
    expect(screen.getByTestId('view-live-match')).toBeInTheDocument();
    expect(screen.queryByTestId('view-utility-room')).not.toBeInTheDocument();
  });
});

describe('Milestone 2 Shell: Secondary Menu Modal/Drawer Lifecycle', () => {
  afterEach(cleanup);

  it('A4.1: should toggle secondary menu open when header button is clicked', () => {
    render(React.createElement(MockAppShell));
    expect(screen.queryByTestId('secondary-menu-drawer')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('secondary-menu-trigger'));
    expect(screen.getByTestId('secondary-menu-drawer')).toBeInTheDocument();
  });

  it('A4.2: should close secondary menu when close button is clicked', () => {
    render(React.createElement(MockAppShell));
    fireEvent.click(screen.getByTestId('secondary-menu-trigger'));
    expect(screen.getByTestId('secondary-menu-drawer')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('secondary-menu-close'));
    expect(screen.queryByTestId('secondary-menu-drawer')).not.toBeInTheDocument();
  });

  it('A4.3: should close secondary menu when Escape key is pressed', () => {
    render(React.createElement(MockAppShell));
    fireEvent.click(screen.getByTestId('secondary-menu-trigger'));
    expect(screen.getByTestId('secondary-menu-drawer')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('secondary-menu-drawer')).not.toBeInTheDocument();
  });
});

describe('Milestone 2 Shell: HUD Safe-Zone Geometry (Point Coordinate Verification)', () => {
  const evaluator = new SafeZoneEvaluator({ width: 1920, height: 1080 });

  it('A5.1: should flag coordinates inside 450x450 center crosshair zone as obstructed', () => {
    // Screen center: (960, 540)
    const centerRes = evaluator.evaluateCoordinate({ x: 960, y: 540 });
    expect(centerRes.obstructed).toBe(true);
    expect(centerRes.collidingZones).toContain('CROSSHAIR');

    // Off-center points within [735..1185, 315..765]
    expect(evaluator.evaluateCoordinate({ x: 800, y: 400 }).obstructed).toBe(true);
    expect(evaluator.evaluateCoordinate({ x: 1100, y: 700 }).obstructed).toBe(true);
  });

  it('A5.2: should flag crosshair zone boundary edges as obstructed (inclusive boundary)', () => {
    expect(evaluator.evaluateCoordinate({ x: 735, y: 540 }).obstructed).toBe(true); // Left edge
    expect(evaluator.evaluateCoordinate({ x: 1185, y: 540 }).obstructed).toBe(true); // Right edge
    expect(evaluator.evaluateCoordinate({ x: 960, y: 315 }).obstructed).toBe(true); // Top edge
    expect(evaluator.evaluateCoordinate({ x: 960, y: 765 }).obstructed).toBe(true); // Bottom edge
  });

  it('A5.3: should permit coordinates immediately outside the crosshair zone', () => {
    expect(evaluator.evaluateCoordinate({ x: 734, y: 540 }).obstructed).toBe(false); // Just left
    expect(evaluator.evaluateCoordinate({ x: 1186, y: 540 }).obstructed).toBe(false); // Just right
    expect(evaluator.evaluateCoordinate({ x: 960, y: 314 }).obstructed).toBe(false); // Just above
    expect(evaluator.evaluateCoordinate({ x: 960, y: 766 }).obstructed).toBe(false); // Just below
  });

  it('A5.4: should flag coordinates inside 320x320 top-left radar zone as obstructed', () => {
    // Radar bounds: [0..320, 0..320]
    expect(evaluator.evaluateCoordinate({ x: 0, y: 0 }).obstructed).toBe(true);
    expect(evaluator.evaluateCoordinate({ x: 160, y: 160 }).obstructed).toBe(true);
    expect(evaluator.evaluateCoordinate({ x: 320, y: 320 }).obstructed).toBe(true);

    const radarRes = evaluator.evaluateCoordinate({ x: 50, y: 50 });
    expect(radarRes.collidingZones).toContain('RADAR');
  });

  it('A5.5: should permit coordinates immediately outside the radar zone', () => {
    expect(evaluator.evaluateCoordinate({ x: 321, y: 100 }).obstructed).toBe(false);
    expect(evaluator.evaluateCoordinate({ x: 100, y: 321 }).obstructed).toBe(false);
  });

  it('A5.6: should flag coordinates inside 400x200 top-right killfeed zone as obstructed', () => {
    // Killfeed bounds: [1520..1920, 0..200]
    expect(evaluator.evaluateCoordinate({ x: 1920, y: 0 }).obstructed).toBe(true);
    expect(evaluator.evaluateCoordinate({ x: 1700, y: 100 }).obstructed).toBe(true);
    expect(evaluator.evaluateCoordinate({ x: 1520, y: 200 }).obstructed).toBe(true);

    const feedRes = evaluator.evaluateCoordinate({ x: 1800, y: 50 });
    expect(feedRes.collidingZones).toContain('KILLFEED');
  });

  it('A5.7: should permit coordinates immediately outside the killfeed zone', () => {
    expect(evaluator.evaluateCoordinate({ x: 1519, y: 100 }).obstructed).toBe(false);
    expect(evaluator.evaluateCoordinate({ x: 1700, y: 201 }).obstructed).toBe(false);
  });
});

describe('Milestone 2 Shell: HUD Safe-Zone Widget Bounding Box (AABB Collision) & Scaling', () => {
  const evaluator = new SafeZoneEvaluator({ width: 1920, height: 1080 });

  it('A6.1: should detect collision when a rectangular widget overlaps the crosshair safe zone', () => {
    const overlappingWidget: Rect = { x: 900, y: 500, width: 120, height: 80 };
    const result = evaluator.evaluateRect(overlappingWidget);
    expect(result.obstructed).toBe(true);
    expect(result.collidingZones).toContain('CROSSHAIR');
  });

  it('A6.2: should confirm that a tactical widget positioned in lateral shelf is unobstructed', () => {
    // Widget positioned on left tactical shelf between radar and bottom
    const shelfWidget: Rect = { x: 50, y: 400, width: 250, height: 150 };
    const result = evaluator.evaluateRect(shelfWidget);
    expect(result.obstructed).toBe(false);
    expect(result.collidingZones).toEqual([]);
  });

  it('A6.3: should confirm that a bottom status shelf widget is unobstructed', () => {
    // Bottom status bar centered at y=900
    const bottomWidget: Rect = { x: 760, y: 920, width: 400, height: 60 };
    const result = evaluator.evaluateRect(bottomWidget);
    expect(result.obstructed).toBe(false);
  });

  it('A6.4: should adapt safe zones dynamically when viewport resolution changes (e.g. 1440p)', () => {
    const evaluator1440p = new SafeZoneEvaluator({ width: 2560, height: 1440 });
    const zones = evaluator1440p.getSafeZones();

    const crosshair = zones.find((z) => z.id === 'CROSSHAIR')!;
    // 2560 / 2 = 1280; 1440 / 2 = 720
    expect(crosshair.bounds.x).toBe(1280 - 225);
    expect(crosshair.bounds.y).toBe(720 - 225);

    const killfeed = zones.find((z) => z.id === 'KILLFEED')!;
    // 2560 - 400 = 2160
    expect(killfeed.bounds.x).toBe(2160);
  });
});
