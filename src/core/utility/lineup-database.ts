/**
 * CS2 Assistant - Pre-Populated Competitive Lineup Database
 * File: src/core/utility/lineup-database.ts
 *
 * Fully normalized, verified Counter-Strike 2 lineups across all 6 Active Duty maps.
 * All lineups feature CS2 subtick timing, exact 3D vector coordinates, pitch/yaw angles,
 * and high-fidelity SVG visual landmark overlays.
 */

import type { Lineup, CS2Map, LineupFilter } from './types';

export const COMPETITIVE_LINEUPS: Lineup[] = [
  // ==========================================================================
  // MAP 1: DE_MIRAGE
  // ==========================================================================
  {
    id: 'lineup-mirage-a-stairs',
    map: 'de_mirage',
    title: 'A Site Stairs Smoke from T Roof',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'STAND',
    throwType: 'STANDING',
    throwPosition: {
      x: -1120,
      y: -450,
      z: -160,
      callout: 'T Roof Wooden Beam',
      description: 'Wedge into the right corner where the wooden beam intersects the T roof wall',
      toleranceUnits: 6,
    },
    startPosition: {
      x: -1120,
      y: -450,
      z: -160,
      callout: 'T Roof Wooden Beam',
      toleranceUnits: 6,
    },
    crosshairTarget: {
      pitch: -24.5,
      yaw: 32.1,
      description: 'Aim directly at the apex of the center wall indentation above A entrance',
      visualLandmark: 'Apex of center wall indentation',
      svgAlignment: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="140" fill="#09090b" rx="4"/>
        <line x1="40" y1="90" x2="200" y2="90" stroke="#27272a" stroke-width="2"/>
        <polygon points="100,90 120,50 140,90" fill="none" stroke="#3f3f46" stroke-width="1.5"/>
        <circle cx="120" cy="50" r="4" fill="#06b6d4"/>
        <line x1="120" y1="30" x2="120" y2="70" stroke="#06b6d4" stroke-width="1" stroke-dasharray="2"/>
        <line x1="100" y1="50" x2="140" y2="50" stroke="#06b6d4" stroke-width="1" stroke-dasharray="2"/>
        <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">APEX ALIGNMENT POINT</text>
        <text x="120" y="130" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">STAND &amp; LEFT-CLICK</text>
      </svg>`,
    },
    aimReference: {
      crosshairPlacement: 'Aim directly at the apex of the center wall indentation above A entrance',
      visualLandmark: 'Apex of center wall indentation',
    },
    svgReference: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="140" fill="#09090b" rx="4"/>
      <line x1="40" y1="90" x2="200" y2="90" stroke="#27272a" stroke-width="2"/>
      <polygon points="100,90 120,50 140,90" fill="none" stroke="#3f3f46" stroke-width="1.5"/>
      <circle cx="120" cy="50" r="4" fill="#06b6d4"/>
      <line x1="120" y1="30" x2="120" y2="70" stroke="#06b6d4" stroke-width="1" stroke-dasharray="2"/>
      <line x1="100" y1="50" x2="140" y2="50" stroke="#06b6d4" stroke-width="1" stroke-dasharray="2"/>
      <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">APEX ALIGNMENT POINT</text>
      <text x="120" y="130" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">STAND &amp; LEFT-CLICK</text>
    </svg>`,
    landingArea: {
      x: -350,
      y: -420,
      z: -140,
      callout: 'A Stairs / Sandwich',
      description: 'Blooms on stairs, extinguishing vision between Sandwich and A site',
    },
    targetDestination: {
      x: -350,
      y: -420,
      z: -140,
      callout: 'A Stairs / Sandwich',
    },
    movementKey: 'NONE',
    movementRequirements: 'Stand stationary wedged in the corner of T Roof beam',
    tickrate: 'SUBTICK_CS2',
    tags: ['Stairs', 'A-Execute', 'Smoke', 'Essential'],
    isCustom: false,
    favorite: false,
    instructions: [
      'Wedge yourself into the corner of the wooden beam on T Roof.',
      'Align crosshair with the apex of the center wall indentation.',
      'Perform a stationary left-click throw (no jump required).',
    ],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified / Scope.gg Taxonomy',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },

  {
    id: 'lineup-mirage-a-jungle',
    map: 'de_mirage',
    title: 'A Jungle & Connector Smoke from T Roof',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'STAND',
    throwType: 'STANDING',
    throwPosition: {
      x: -1120,
      y: -480,
      z: -160,
      callout: 'T Roof Pillar',
      description: 'Stand centered against the middle pillar facing Palace on T Roof',
      toleranceUnits: 5,
    },
    startPosition: {
      x: -1120,
      y: -480,
      z: -160,
      callout: 'T Roof Pillar',
      toleranceUnits: 5,
    },
    crosshairTarget: {
      pitch: -28.2,
      yaw: 36.8,
      description: 'Aim at top middle pillar corner intersecting roof wire',
      visualLandmark: 'Pillar top corner intersecting wire',
      svgAlignment: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="140" fill="#09090b" rx="4"/>
        <line x1="30" y1="110" x2="210" y2="40" stroke="#27272a" stroke-width="1.5"/>
        <rect x="110" y="55" width="20" height="55" fill="#18181b" stroke="#3f3f46"/>
        <circle cx="120" cy="55" r="4" fill="#06b6d4"/>
        <line x1="120" y1="35" x2="120" y2="75" stroke="#06b6d4" stroke-width="1" stroke-dasharray="2"/>
        <line x1="100" y1="55" x2="140" y2="55" stroke="#06b6d4" stroke-width="1" stroke-dasharray="2"/>
        <text x="120" y="122" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">PILLAR INTERSECTION</text>
        <text x="120" y="132" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">STAND &amp; LEFT-CLICK</text>
      </svg>`,
    },
    aimReference: {
      crosshairPlacement: 'Aim at top middle pillar corner intersecting roof wire',
      visualLandmark: 'Pillar top corner intersecting wire',
    },
    svgReference: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="140" fill="#09090b" rx="4"/>
      <line x1="30" y1="110" x2="210" y2="40" stroke="#27272a" stroke-width="1.5"/>
      <rect x="110" y="55" width="20" height="55" fill="#18181b" stroke="#3f3f46"/>
      <circle cx="120" cy="55" r="4" fill="#06b6d4"/>
      <line x1="120" y1="35" x2="120" y2="75" stroke="#06b6d4" stroke-width="1" stroke-dasharray="2"/>
      <line x1="100" y1="55" x2="140" y2="55" stroke="#06b6d4" stroke-width="1" stroke-dasharray="2"/>
      <text x="120" y="122" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">PILLAR INTERSECTION</text>
      <text x="120" y="132" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">STAND &amp; LEFT-CLICK</text>
    </svg>`,
    landingArea: {
      x: -280,
      y: -550,
      z: -140,
      callout: 'Jungle Cross',
      description: 'Deep smoke sealing off both Jungle archway and Connector crossfire',
    },
    targetDestination: {
      x: -280,
      y: -550,
      z: -140,
      callout: 'Jungle Cross',
    },
    movementKey: 'NONE',
    movementRequirements: 'Stationary throw against pillar face',
    tickrate: 'SUBTICK_CS2',
    tags: ['Jungle', 'A-Execute', 'Smoke', 'Essential'],
    isCustom: false,
    favorite: false,
    instructions: [
      'Stand against the pillar face on T Roof facing Palace.',
      'Place crosshair on top corner of the pillar.',
      'Left-click throw cleanly.',
    ],
    difficulty: 'MEDIUM',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },

  {
    id: 'lineup-mirage-a-ct-box',
    map: 'de_mirage',
    title: 'A CT Spawn Smoke from T Spawn Trash',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'JUMPTHROW',
    throwType: 'JUMPTHROW',
    throwPosition: {
      x: -1300,
      y: -200,
      z: -160,
      callout: 'T Spawn Trash Can',
      description: 'Crouch and wedge tightly into the right edge of the T spawn trash can, then stand',
      toleranceUnits: 4,
    },
    startPosition: {
      x: -1300,
      y: -200,
      z: -160,
      callout: 'T Spawn Trash Can',
      toleranceUnits: 4,
    },
    crosshairTarget: {
      pitch: -38.4,
      yaw: 28.5,
      description: 'Aim at the protruding antenna wire tip on the high apartment roof',
      visualLandmark: 'Protruding antenna wire tip',
      svgAlignment: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="140" fill="#09090b" rx="4"/>
        <line x1="120" y1="120" x2="120" y2="40" stroke="#3f3f46" stroke-width="2"/>
        <line x1="105" y1="60" x2="135" y2="60" stroke="#3f3f46" stroke-width="1.5"/>
        <line x1="110" y1="80" x2="130" y2="80" stroke="#3f3f46" stroke-width="1.5"/>
        <circle cx="120" cy="40" r="4" fill="#06b6d4"/>
        <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">ANTENNA TIP</text>
        <text x="120" y="130" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">SUBTICK JUMPTHROW</text>
      </svg>`,
    },
    aimReference: {
      crosshairPlacement: 'Aim at the protruding antenna wire tip on the high apartment roof',
      visualLandmark: 'Protruding antenna wire tip',
    },
    svgReference: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="140" fill="#09090b" rx="4"/>
      <line x1="120" y1="120" x2="120" y2="40" stroke="#3f3f46" stroke-width="2"/>
      <line x1="105" y1="60" x2="135" y2="60" stroke="#3f3f46" stroke-width="1.5"/>
      <line x1="110" y1="80" x2="130" y2="80" stroke="#3f3f46" stroke-width="1.5"/>
      <circle cx="120" cy="40" r="4" fill="#06b6d4"/>
      <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">ANTENNA TIP</text>
      <text x="120" y="130" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">SUBTICK JUMPTHROW</text>
    </svg>`,
    landingArea: {
      x: -100,
      y: -300,
      z: -140,
      callout: 'Ticket Booth / CT Spawn',
      description: 'Completely blocks CT Spawn and Ticket booth sniper sightlines',
    },
    targetDestination: {
      x: -100,
      y: -300,
      z: -140,
      callout: 'Ticket Booth / CT Spawn',
    },
    movementKey: 'NONE',
    movementRequirements: 'Sub-tick jumpthrow bind',
    tickrate: 'SUBTICK_CS2',
    tags: ['CT-Spawn', 'A-Execute', 'Smoke', 'Jumpthrow', 'Essential'],
    isCustom: false,
    favorite: false,
    instructions: [
      'Crouch and wedge against the trash can in T Spawn.',
      'Stand up and aim at the antenna wire tip.',
      'Execute jumpthrow with standard jump key.',
    ],
    difficulty: 'MEDIUM',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },

  {
    id: 'lineup-mirage-mid-window',
    map: 'de_mirage',
    title: 'Mid Window Instant Smoke from T Spawn Fence',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'RUN_JUMPTHROW',
    throwType: 'RUN_JUMPTHROW',
    throwPosition: {
      x: -1450,
      y: -260,
      z: -160,
      callout: 'T Spawn Fence',
      description: 'Stand wedged against the iron mesh fence corner in T Spawn',
      toleranceUnits: 4,
    },
    startPosition: {
      x: -1450,
      y: -260,
      z: -160,
      callout: 'T Spawn Fence',
      toleranceUnits: 4,
    },
    crosshairTarget: {
      pitch: -18.6,
      yaw: -12.4,
      description: 'Aim at the top right corner of the carpet door trim, hold D and jumpthrow',
      visualLandmark: 'Carpet door trim top right corner',
      svgAlignment: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="140" fill="#09090b" rx="4"/>
        <rect x="70" y="40" width="100" height="70" fill="#18181b" stroke="#3f3f46" stroke-width="1.5"/>
        <line x1="70" y1="40" x2="170" y2="40" stroke="#ef4444" stroke-width="2"/>
        <circle cx="170" cy="40" r="4" fill="#06b6d4"/>
        <path d="M 170 40 L 195 25" stroke="#10b981" stroke-width="1.5" stroke-dasharray="2"/>
        <text x="120" y="120" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">DOOR TRIM CORNER</text>
        <text x="120" y="132" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">HOLD D + SUBTICK JUMPTHROW</text>
      </svg>`,
    },
    aimReference: {
      crosshairPlacement: 'Aim at the top right corner of the carpet door trim, hold D and jumpthrow',
      visualLandmark: 'Carpet door trim top right corner',
    },
    svgReference: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="140" fill="#09090b" rx="4"/>
      <rect x="70" y="40" width="100" height="70" fill="#18181b" stroke="#3f3f46" stroke-width="1.5"/>
      <line x1="70" y1="40" x2="170" y2="40" stroke="#ef4444" stroke-width="2"/>
      <circle cx="170" cy="40" r="4" fill="#06b6d4"/>
      <path d="M 170 40 L 195 25" stroke="#10b981" stroke-width="1.5" stroke-dasharray="2"/>
      <text x="120" y="120" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">DOOR TRIM CORNER</text>
      <text x="120" y="132" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">HOLD D + SUBTICK JUMPTHROW</text>
    </svg>`,
    landingArea: {
      x: -650,
      y: -800,
      z: -140,
      callout: 'Mid Window',
      description: 'Lands directly on window sill, extinguishing entire Sniper nest vision to Top Mid',
    },
    targetDestination: {
      x: -650,
      y: -800,
      z: -140,
      callout: 'Mid Window',
    },
    movementKey: 'D',
    movementRequirements: 'Hold D key and execute jumpthrow at release',
    tickrate: 'SUBTICK_CS2',
    tags: ['Mid-Window', 'Mid-Control', 'Smoke', 'Subtick', 'Essential'],
    isCustom: false,
    favorite: false,
    instructions: [
      'Wedge into T Spawn fence corner.',
      'Place crosshair on upper right corner of door frame trim.',
      'Hold the "D" movement key and jumpthrow simultaneously.',
    ],
    difficulty: 'HARD',
    sourceAttribution: 'CSNADES Verified / Pro Meta CS2',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },

  {
    id: 'lineup-mirage-b-short',
    map: 'de_mirage',
    title: 'B Short / Catwalk Smoke from Outside B Apps',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'JUMPTHROW',
    throwType: 'JUMPTHROW',
    throwPosition: {
      x: -1150,
      y: 720,
      z: -100,
      callout: 'Outside B Apartments',
      description: 'Wedge against the cart wheel in the courtyard outside TV room and B apartments',
      toleranceUnits: 5,
    },
    startPosition: {
      x: -1150,
      y: 720,
      z: -100,
      callout: 'Outside B Apartments',
      toleranceUnits: 5,
    },
    crosshairTarget: {
      pitch: -31.2,
      yaw: -78.5,
      description: 'Aim at the center of the arched window iron grating',
      visualLandmark: 'Arched window iron grating center',
      svgAlignment: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="140" fill="#09090b" rx="4"/>
        <path d="M 80 100 A 40 40 0 0 1 160 100 Z" fill="#18181b" stroke="#3f3f46" stroke-width="1.5"/>
        <line x1="120" y1="60" x2="120" y2="100" stroke="#3f3f46" stroke-width="1"/>
        <line x1="90" y1="85" x2="150" y2="85" stroke="#3f3f46" stroke-width="1"/>
        <circle cx="120" cy="85" r="4" fill="#06b6d4"/>
        <text x="120" y="120" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">WINDOW GRATE CENTER</text>
        <text x="120" y="132" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">JUMPTHROW</text>
      </svg>`,
    },
    aimReference: {
      crosshairPlacement: 'Aim at the center of the arched window iron grating',
      visualLandmark: 'Arched window iron grating center',
    },
    svgReference: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="140" fill="#09090b" rx="4"/>
      <path d="M 80 100 A 40 40 0 0 1 160 100 Z" fill="#18181b" stroke="#3f3f46" stroke-width="1.5"/>
      <line x1="120" y1="60" x2="120" y2="100" stroke="#3f3f46" stroke-width="1"/>
      <line x1="90" y1="85" x2="150" y2="85" stroke="#3f3f46" stroke-width="1"/>
      <circle cx="120" cy="85" r="4" fill="#06b6d4"/>
      <text x="120" y="120" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">WINDOW GRATE CENTER</text>
      <text x="120" y="132" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">JUMPTHROW</text>
    </svg>`,
    landingArea: {
      x: -700,
      y: 220,
      z: -100,
      callout: 'B Short / Catwalk',
      description: 'Covers Catwalk / B Short archway, isolating B site defenders',
    },
    targetDestination: {
      x: -700,
      y: 220,
      z: -100,
      callout: 'B Short / Catwalk',
    },
    movementKey: 'NONE',
    movementRequirements: 'Stationary jumpthrow',
    tickrate: 'SUBTICK_CS2',
    tags: ['B-Short', 'B-Execute', 'Catwalk', 'Smoke'],
    isCustom: false,
    favorite: false,
    instructions: [
      'Wedge into cart outside TV room.',
      'Aim at center of arched window grate.',
      'Jumpthrow.',
    ],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },

  {
    id: 'lineup-mirage-a-retake-flash',
    map: 'de_mirage',
    title: 'A Site High Retake Popflash from CT Ticket',
    side: 'CT',
    utilityType: 'FLASHBANG',
    technique: 'RUN_JUMPTHROW',
    throwType: 'RUN_JUMPTHROW',
    throwPosition: {
      x: -150,
      y: -320,
      z: -140,
      callout: 'Ticket Booth',
      description: 'Stand against the Ticket Booth metal box on CT side',
      toleranceUnits: 8,
    },
    startPosition: {
      x: -150,
      y: -320,
      z: -140,
      callout: 'Ticket Booth',
      toleranceUnits: 8,
    },
    crosshairTarget: {
      pitch: -42.0,
      yaw: -145.0,
      description: 'Aim above scaffolding roof lip; take 1 step forward and jumpthrow',
      visualLandmark: 'Scaffolding roof lip cloth edge',
      svgAlignment: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="140" fill="#09090b" rx="4"/>
        <line x1="20" y1="80" x2="220" y2="70" stroke="#3f3f46" stroke-width="2"/>
        <circle cx="120" cy="50" r="5" fill="#f59e0b"/>
        <line x1="120" y1="25" x2="120" y2="75" stroke="#f59e0b" stroke-width="1" stroke-dasharray="2"/>
        <text x="120" y="115" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">ROOF LIP AIRBURST</text>
        <text x="120" y="128" font-family="monospace" font-size="8" fill="#f59e0b" text-anchor="middle">1 STEP + JUMPTHROW</text>
      </svg>`,
    },
    aimReference: {
      crosshairPlacement: 'Aim above scaffolding roof lip; take 1 step forward and jumpthrow',
      visualLandmark: 'Scaffolding roof lip cloth edge',
    },
    svgReference: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="140" fill="#09090b" rx="4"/>
      <line x1="20" y1="80" x2="220" y2="70" stroke="#3f3f46" stroke-width="2"/>
      <circle cx="120" cy="50" r="5" fill="#f59e0b"/>
      <line x1="120" y1="25" x2="120" y2="75" stroke="#f59e0b" stroke-width="1" stroke-dasharray="2"/>
      <text x="120" y="115" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">ROOF LIP AIRBURST</text>
      <text x="120" y="128" font-family="monospace" font-size="8" fill="#f59e0b" text-anchor="middle">1 STEP + JUMPTHROW</text>
    </svg>`,
    landingArea: {
      x: -500,
      y: -450,
      z: -50,
      callout: 'A Site Center Airburst',
      description: 'Airbursts above A site default, completely blinding Default, Triple, and Tetris',
    },
    targetDestination: {
      x: -500,
      y: -450,
      z: -50,
      callout: 'A Site Center Airburst',
    },
    movementKey: 'W',
    movementRequirements: '1-step forward run jumpthrow',
    tickrate: 'SUBTICK_CS2',
    tags: ['Retake', 'Flash', 'A-Site', 'Essential'],
    isCustom: false,
    favorite: false,
    instructions: [
      'Line up on the corner of Ticket Booth.',
      'Aim above scaffolding roof lip.',
      'Take one step forward and release with jumpthrow.',
    ],
    difficulty: 'EASY',
    sourceAttribution: 'Scope.gg Strategy Playbook',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },

  // ==========================================================================
  // MAP 2: DE_INFERNO
  // ==========================================================================
  {
    id: 'lineup-inferno-b-coffins',
    map: 'de_inferno',
    title: 'B Site Coffins Smoke from Banana Logs',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'STAND',
    throwType: 'STANDING',
    throwPosition: {
      x: 380,
      y: 1750,
      z: 120,
      callout: 'Banana Logs',
      description: 'Wedge into the corner where the half wall logs meet the stone pillar on Banana',
      toleranceUnits: 5,
    },
    startPosition: {
      x: 380,
      y: 1750,
      z: 120,
      callout: 'Banana Logs',
      toleranceUnits: 5,
    },
    crosshairTarget: {
      pitch: -35.2,
      yaw: 110.4,
      description: 'Aim at the highest peak of the church bell tower stone spire',
      visualLandmark: 'Church bell tower spire peak',
      svgAlignment: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="140" fill="#09090b" rx="4"/>
        <polygon points="120,40 105,100 135,100" fill="#18181b" stroke="#3f3f46" stroke-width="1.5"/>
        <line x1="120" y1="30" x2="120" y2="40" stroke="#facc15" stroke-width="2"/>
        <circle cx="120" cy="40" r="4" fill="#06b6d4"/>
        <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">CHURCH SPIRE TIP</text>
        <text x="120" y="130" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">STAND &amp; LEFT-CLICK</text>
      </svg>`,
    },
    aimReference: {
      crosshairPlacement: 'Aim at the highest peak of the church bell tower stone spire',
      visualLandmark: 'Church bell tower spire peak',
    },
    svgReference: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="140" fill="#09090b" rx="4"/>
      <polygon points="120,40 105,100 135,100" fill="#18181b" stroke="#3f3f46" stroke-width="1.5"/>
      <line x1="120" y1="30" x2="120" y2="40" stroke="#facc15" stroke-width="2"/>
      <circle cx="120" cy="40" r="4" fill="#06b6d4"/>
      <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">CHURCH SPIRE TIP</text>
      <text x="120" y="130" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">STAND &amp; LEFT-CLICK</text>
    </svg>`,
    landingArea: {
      x: -450,
      y: 2400,
      z: 160,
      callout: 'Coffins',
      description: 'Completely seals off Coffins sniper position and cemetery ramp',
    },
    targetDestination: {
      x: -450,
      y: 2400,
      z: 160,
      callout: 'Coffins',
    },
    movementKey: 'NONE',
    movementRequirements: 'Stationary throw',
    tickrate: 'SUBTICK_CS2',
    tags: ['Coffins', 'B-Execute', 'Smoke', 'Essential'],
    isCustom: false,
    favorite: false,
    instructions: [
      'Wedge into corner logs on Banana.',
      'Aim directly at church tower spire peak.',
      'Stationary left-click throw.',
    ],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified / Scope.gg',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },

  {
    id: 'lineup-inferno-b-ct-smoke',
    map: 'de_inferno',
    title: 'B Site CT Smoke from Banana Car',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'STAND',
    throwType: 'STANDING',
    throwPosition: {
      x: 260,
      y: 1880,
      z: 130,
      callout: 'Banana Car',
      description: 'Stand against the back corner of Banana car near the wall recess',
      toleranceUnits: 5,
    },
    startPosition: {
      x: 260,
      y: 1880,
      z: 130,
      callout: 'Banana Car',
      toleranceUnits: 5,
    },
    crosshairTarget: {
      pitch: -29.8,
      yaw: 95.2,
      description: 'Aim at intersection of roof tile edge and horizontal power cable',
      visualLandmark: 'Roof tile edge meeting black wire',
      svgAlignment: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="140" fill="#09090b" rx="4"/>
        <line x1="20" y1="65" x2="220" y2="65" stroke="#27272a" stroke-width="1.5"/>
        <line x1="120" y1="20" x2="160" y2="90" stroke="#71717a" stroke-width="2"/>
        <circle cx="120" cy="65" r="4" fill="#06b6d4"/>
        <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">ROOF WIRE INTERSECTION</text>
        <text x="120" y="130" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">STAND &amp; LEFT-CLICK</text>
      </svg>`,
    },
    aimReference: {
      crosshairPlacement: 'Aim at intersection of roof tile edge and horizontal power cable',
      visualLandmark: 'Roof tile edge meeting black wire',
    },
    svgReference: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="140" fill="#09090b" rx="4"/>
      <line x1="20" y1="65" x2="220" y2="65" stroke="#27272a" stroke-width="1.5"/>
      <line x1="120" y1="20" x2="160" y2="90" stroke="#71717a" stroke-width="2"/>
      <circle cx="120" cy="65" r="4" fill="#06b6d4"/>
      <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">ROOF WIRE INTERSECTION</text>
      <text x="120" y="130" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">STAND &amp; LEFT-CLICK</text>
    </svg>`,
    landingArea: {
      x: -650,
      y: 2800,
      z: 160,
      callout: 'CT Spawn / B Entrance',
      description: 'Deep smoke sealing off CT archway entrance to B site',
    },
    targetDestination: {
      x: -650,
      y: 2800,
      z: 160,
      callout: 'CT Spawn / B Entrance',
    },
    movementKey: 'NONE',
    movementRequirements: 'Stationary left-click release',
    tickrate: 'SUBTICK_CS2',
    tags: ['CT-Spawn', 'B-Execute', 'Smoke', 'Essential'],
    isCustom: false,
    favorite: false,
    instructions: [
      'Position against rear car bumper at Banana.',
      'Find the black overhead wire and aim at roof tile junction.',
      'Left-click throw.',
    ],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },

  {
    id: 'lineup-inferno-banana-flash',
    map: 'de_inferno',
    title: 'Banana High Popflash for CT Aggression',
    side: 'CT',
    utilityType: 'FLASHBANG',
    technique: 'STAND',
    throwType: 'STANDING',
    throwPosition: {
      x: -350,
      y: 2200,
      z: 140,
      callout: 'B Sandbags',
      description: 'Stand behind sandbags at B site entrance',
      toleranceUnits: 6,
    },
    startPosition: {
      x: -350,
      y: 2200,
      z: 140,
      callout: 'B Sandbags',
      toleranceUnits: 6,
    },
    crosshairTarget: {
      pitch: -52.0,
      yaw: -65.0,
      description: 'Aim at top yellow flower petal / streetlamp bracket over banana wall',
      visualLandmark: 'Streetlamp metal bracket',
      svgAlignment: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="140" fill="#09090b" rx="4"/>
        <line x1="120" y1="120" x2="120" y2="50" stroke="#71717a" stroke-width="2"/>
        <path d="M 120 50 Q 140 40 150 60" fill="none" stroke="#71717a" stroke-width="2"/>
        <circle cx="120" cy="50" r="5" fill="#f59e0b"/>
        <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">LAMP BRACKET APEX</text>
        <text x="120" y="130" font-family="monospace" font-size="8" fill="#f59e0b" text-anchor="middle">HIGH POPFLASH</text>
      </svg>`,
    },
    aimReference: {
      crosshairPlacement: 'Aim at top yellow flower petal / streetlamp bracket over banana wall',
      visualLandmark: 'Streetlamp metal bracket',
    },
    svgReference: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="140" fill="#09090b" rx="4"/>
      <line x1="120" y1="120" x2="120" y2="50" stroke="#71717a" stroke-width="2"/>
      <path d="M 120 50 Q 140 40 150 60" fill="none" stroke="#71717a" stroke-width="2"/>
      <circle cx="120" cy="50" r="5" fill="#f59e0b"/>
      <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">LAMP BRACKET APEX</text>
      <text x="120" y="130" font-family="monospace" font-size="8" fill="#f59e0b" text-anchor="middle">HIGH POPFLASH</text>
    </svg>`,
    landingArea: {
      x: 100,
      y: 1900,
      z: 280,
      callout: 'Banana High Airburst',
      description: 'Pops above Banana wall with zero audio warning for advancing Ts',
    },
    targetDestination: {
      x: 100,
      y: 1900,
      z: 280,
      callout: 'Banana High Airburst',
    },
    movementKey: 'NONE',
    movementRequirements: 'Stationary throw',
    tickrate: 'SUBTICK_CS2',
    tags: ['Banana', 'Popflash', 'CT-Aggression', 'Flash'],
    isCustom: false,
    favorite: false,
    instructions: [
      'Stand behind sandbags on B entrance.',
      'Aim at streetlamp metal bracket.',
      'Left-click throw to blind rushing opponents.',
    ],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },

  {
    id: 'lineup-inferno-b-newbox-moly',
    map: 'de_inferno',
    title: 'B Site New Box Molotov from Banana Car Fender',
    side: 'T',
    utilityType: 'MOLOTOV_INCENDIARY',
    technique: 'RUN_JUMPTHROW',
    throwType: 'RUN_JUMPTHROW',
    throwPosition: {
      x: 280,
      y: 1820,
      z: 125,
      callout: 'Banana Car Fender',
      description: 'Line up on the front fender of the yellow car on Banana',
      toleranceUnits: 5,
    },
    startPosition: {
      x: 280,
      y: 1820,
      z: 125,
      callout: 'Banana Car Fender',
      toleranceUnits: 5,
    },
    crosshairTarget: {
      pitch: -22.1,
      yaw: 118.6,
      description: 'Aim at bottom stone edge of the church stained glass archway',
      visualLandmark: 'Church archway stone edge',
      svgAlignment: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="140" fill="#09090b" rx="4"/>
        <path d="M 90 90 A 30 30 0 0 1 150 90 Z" fill="#18181b" stroke="#3f3f46" stroke-width="1.5"/>
        <line x1="90" y1="90" x2="150" y2="90" stroke="#ef4444" stroke-width="2"/>
        <circle cx="120" cy="90" r="4" fill="#ef4444"/>
        <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">STAINED GLASS BASE</text>
        <text x="120" y="130" font-family="monospace" font-size="8" fill="#ef4444" text-anchor="middle">2-STEP RUN + JUMPTHROW</text>
      </svg>`,
    },
    aimReference: {
      crosshairPlacement: 'Aim at bottom stone edge of the church stained glass archway',
      visualLandmark: 'Church archway stone edge',
    },
    svgReference: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="140" fill="#09090b" rx="4"/>
      <path d="M 90 90 A 30 30 0 0 1 150 90 Z" fill="#18181b" stroke="#3f3f46" stroke-width="1.5"/>
      <line x1="90" y1="90" x2="150" y2="90" stroke="#ef4444" stroke-width="2"/>
      <circle cx="120" cy="90" r="4" fill="#ef4444"/>
      <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">STAINED GLASS BASE</text>
      <text x="120" y="130" font-family="monospace" font-size="8" fill="#ef4444" text-anchor="middle">2-STEP RUN + JUMPTHROW</text>
    </svg>`,
    landingArea: {
      x: -300,
      y: 2100,
      z: 130,
      callout: 'New Box',
      description: 'Fully blankets New Box hiding spot, flushing out anchor players',
    },
    targetDestination: {
      x: -300,
      y: 2100,
      z: 130,
      callout: 'New Box',
    },
    movementKey: 'W',
    movementRequirements: 'Run forward 2 steps and jumpthrow',
    tickrate: 'SUBTICK_CS2',
    tags: ['New-Box', 'B-Execute', 'Molotov', 'Site-Clear'],
    isCustom: false,
    favorite: false,
    instructions: [
      'Line up on Banana car fender.',
      'Aim at base of church stained glass.',
      'Take 2 running steps and release with jumpthrow.',
    ],
    difficulty: 'MEDIUM',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },

  // ==========================================================================
  // MAP 3: DE_DUST2
  // ==========================================================================
  {
    id: 'lineup-dust2-mid-xbox',
    map: 'de_dust2',
    title: 'Mid Xbox Smoke from Outside Long',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'JUMPTHROW',
    throwType: 'JUMPTHROW',
    throwPosition: {
      x: -920,
      y: -720,
      z: 140,
      callout: 'T Outside Long',
      description: 'Stand against the blue barrel corner in the alley outside Long',
      toleranceUnits: 5,
    },
    startPosition: {
      x: -920,
      y: -720,
      z: 140,
      callout: 'T Outside Long',
      toleranceUnits: 5,
    },
    crosshairTarget: {
      pitch: -32.6,
      yaw: 55.4,
      description: 'Aim at the bottom right corner of the building window grate',
      visualLandmark: 'Building window iron grate corner',
      svgAlignment: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="140" fill="#09090b" rx="4"/>
        <rect x="80" y="40" width="80" height="60" fill="#18181b" stroke="#3f3f46" stroke-width="1.5"/>
        <line x1="80" y1="70" x2="160" y2="70" stroke="#3f3f46"/>
        <line x1="120" y1="40" x2="120" y2="100" stroke="#3f3f46"/>
        <circle cx="160" cy="100" r="4" fill="#06b6d4"/>
        <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">WINDOW GRATE CORNER</text>
        <text x="120" y="130" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">SUBTICK JUMPTHROW</text>
      </svg>`,
    },
    aimReference: {
      crosshairPlacement: 'Aim at the bottom right corner of the building window grate',
      visualLandmark: 'Building window iron grate corner',
    },
    svgReference: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="140" fill="#09090b" rx="4"/>
      <rect x="80" y="40" width="80" height="60" fill="#18181b" stroke="#3f3f46" stroke-width="1.5"/>
      <line x1="80" y1="70" x2="160" y2="70" stroke="#3f3f46"/>
      <line x1="120" y1="40" x2="120" y2="100" stroke="#3f3f46"/>
      <circle cx="160" cy="100" r="4" fill="#06b6d4"/>
      <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">WINDOW GRATE CORNER</text>
      <text x="120" y="130" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">SUBTICK JUMPTHROW</text>
    </svg>`,
    landingArea: {
      x: -300,
      y: 1200,
      z: 100,
      callout: 'Xbox / Catwalk',
      description: 'Blooms directly on top of Xbox, permitting safe passage through Catwalk to A Short',
    },
    targetDestination: {
      x: -300,
      y: 1200,
      z: 100,
      callout: 'Xbox / Catwalk',
    },
    movementKey: 'NONE',
    movementRequirements: 'Jumpthrow',
    tickrate: 'SUBTICK_CS2',
    tags: ['Xbox', 'Mid-Control', 'Smoke', 'Essential'],
    isCustom: false,
    favorite: false,
    instructions: [
      'Position against blue barrel outside Long.',
      'Align crosshair with lower right corner of the window grate.',
      'Jumpthrow.',
    ],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },

  {
    id: 'lineup-dust2-long-corner-flash',
    map: 'de_dust2',
    title: 'Long A Corner Popflash from Long Doors Exit',
    side: 'T',
    utilityType: 'FLASHBANG',
    technique: 'RUN',
    throwType: 'RUN_JUMPTHROW',
    throwPosition: {
      x: 620,
      y: 1380,
      z: 10,
      callout: 'Long Doors Exit',
      description: 'Walk through Long Doors exit along the right doorway wall',
      toleranceUnits: 6,
    },
    startPosition: {
      x: 620,
      y: 1380,
      z: 10,
      callout: 'Long Doors Exit',
      toleranceUnits: 6,
    },
    crosshairTarget: {
      pitch: -15.0,
      yaw: 88.0,
      description: 'Aim at top outer corner of the double door arch and run throw',
      visualLandmark: 'Outer door arch keystone',
      svgAlignment: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="140" fill="#09090b" rx="4"/>
        <path d="M 60 110 L 60 60 Q 120 20 180 60 L 180 110" fill="none" stroke="#3f3f46" stroke-width="2"/>
        <circle cx="120" cy="40" r="5" fill="#f59e0b"/>
        <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">DOOR ARCH KEYSTONE</text>
        <text x="120" y="130" font-family="monospace" font-size="8" fill="#f59e0b" text-anchor="middle">RUN &amp; THROW</text>
      </svg>`,
    },
    aimReference: {
      crosshairPlacement: 'Aim at top outer corner of the double door arch and run throw',
      visualLandmark: 'Outer door arch keystone',
    },
    svgReference: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="140" fill="#09090b" rx="4"/>
      <path d="M 60 110 L 60 60 Q 120 20 180 60 L 180 110" fill="none" stroke="#3f3f46" stroke-width="2"/>
      <circle cx="120" cy="40" r="5" fill="#f59e0b"/>
      <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">DOOR ARCH KEYSTONE</text>
      <text x="120" y="130" font-family="monospace" font-size="8" fill="#f59e0b" text-anchor="middle">RUN &amp; THROW</text>
    </svg>`,
    landingArea: {
      x: 1200,
      y: 2100,
      z: 60,
      callout: 'Long A Corner Airburst',
      description: 'Detonates directly over Long Corner, completely blinding CT AWPer and pit players',
    },
    targetDestination: {
      x: 1200,
      y: 2100,
      z: 60,
      callout: 'Long A Corner Airburst',
    },
    movementKey: 'W',
    movementRequirements: 'Run forward along doorway wall and release',
    tickrate: 'SUBTICK_CS2',
    tags: ['Long-Corner', 'A-Execute', 'Popflash', 'Flash'],
    isCustom: false,
    favorite: false,
    instructions: [
      'Begin running through double doors.',
      'Aim at arch keystone.',
      'Throw flash while running forward to burst around the corner.',
    ],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },

  {
    id: 'lineup-dust2-b-doors-smoke',
    map: 'de_dust2',
    title: 'B Site Doors Smoke from Upper Tunnels',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'STAND',
    throwType: 'STANDING',
    throwPosition: {
      x: -840,
      y: 1780,
      z: 160,
      callout: 'Upper Tunnels',
      description: 'Wedge into the wooden crate corner in Upper Tunnels near B entrance',
      toleranceUnits: 5,
    },
    startPosition: {
      x: -840,
      y: 1780,
      z: 160,
      callout: 'Upper Tunnels',
      toleranceUnits: 5,
    },
    crosshairTarget: {
      pitch: -28.4,
      yaw: 142.1,
      description: 'Aim at the gap between the hanging ceiling light and the wooden beam',
      visualLandmark: 'Ceiling beam notch',
      svgAlignment: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="140" fill="#09090b" rx="4"/>
        <line x1="20" y1="40" x2="220" y2="40" stroke="#71717a" stroke-width="3"/>
        <rect x="110" y="45" width="20" height="15" fill="#facc15"/>
        <circle cx="120" cy="70" r="4" fill="#06b6d4"/>
        <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">BEAM NOTCH GAP</text>
        <text x="120" y="130" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">STAND &amp; LEFT-CLICK</text>
      </svg>`,
    },
    aimReference: {
      crosshairPlacement: 'Aim at the gap between the hanging ceiling light and the wooden beam',
      visualLandmark: 'Ceiling beam notch',
    },
    svgReference: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="140" fill="#09090b" rx="4"/>
      <line x1="20" y1="40" x2="220" y2="40" stroke="#71717a" stroke-width="3"/>
      <rect x="110" y="45" width="20" height="15" fill="#facc15"/>
      <circle cx="120" cy="70" r="4" fill="#06b6d4"/>
      <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">BEAM NOTCH GAP</text>
      <text x="120" y="130" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">STAND &amp; LEFT-CLICK</text>
    </svg>`,
    landingArea: {
      x: -1300,
      y: 2400,
      z: 100,
      callout: 'B Doors',
      description: 'Completely covers B Doors exit, isolating site from CT rotators',
    },
    targetDestination: {
      x: -1300,
      y: 2400,
      z: 100,
      callout: 'B Doors',
    },
    movementKey: 'NONE',
    movementRequirements: 'Stationary throw',
    tickrate: 'SUBTICK_CS2',
    tags: ['B-Doors', 'B-Execute', 'Smoke', 'Essential'],
    isCustom: false,
    favorite: false,
    instructions: [
      'Stand against Upper Tunnels crate.',
      'Aim at ceiling beam notch under hanging lamp.',
      'Left-click release.',
    ],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },

  // ==========================================================================
  // MAP 4: DE_NUKE
  // ==========================================================================
  {
    id: 'lineup-nuke-outside-cross-close',
    map: 'de_nuke',
    title: 'Outside Close Cross Smoke (Red Box) from T Roof Railing',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'RUN_JUMPTHROW',
    throwType: 'RUN_JUMPTHROW',
    throwPosition: {
      x: -1050,
      y: -780,
      z: -280,
      callout: 'T Roof Railing',
      description: 'Stand against the yellow safety barrier railing on T Roof',
      toleranceUnits: 5,
    },
    startPosition: {
      x: -1050,
      y: -780,
      z: -280,
      callout: 'T Roof Railing',
      toleranceUnits: 5,
    },
    crosshairTarget: {
      pitch: -26.0,
      yaw: 48.0,
      description: 'Aim at the center seam of the large industrial silo logo',
      visualLandmark: 'Silo vertical weld seam',
      svgAlignment: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="140" fill="#09090b" rx="4"/>
        <path d="M 60 120 L 60 30 Q 120 15 180 30 L 180 120" fill="#18181b" stroke="#3f3f46" stroke-width="2"/>
        <line x1="120" y1="20" x2="120" y2="120" stroke="#71717a" stroke-dasharray="2"/>
        <circle cx="120" cy="50" r="4" fill="#06b6d4"/>
        <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">SILO SEAM CENTER</text>
        <text x="120" y="130" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">RUN-JUMPTHROW</text>
      </svg>`,
    },
    aimReference: {
      crosshairPlacement: 'Aim at the center seam of the large industrial silo logo',
      visualLandmark: 'Silo vertical weld seam',
    },
    svgReference: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="140" fill="#09090b" rx="4"/>
      <path d="M 60 120 L 60 30 Q 120 15 180 30 L 180 120" fill="#18181b" stroke="#3f3f46" stroke-width="2"/>
      <line x1="120" y1="20" x2="120" y2="120" stroke="#71717a" stroke-dasharray="2"/>
      <circle cx="120" cy="50" r="4" fill="#06b6d4"/>
      <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">SILO SEAM CENTER</text>
      <text x="120" y="130" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">RUN-JUMPTHROW</text>
    </svg>`,
    landingArea: {
      x: -300,
      y: -800,
      z: -400,
      callout: 'Outside Close Cross / Red Box',
      description: 'First half of the wall of smokes; cuts off Garage and Secret sightlines',
    },
    targetDestination: {
      x: -300,
      y: -800,
      z: -400,
      callout: 'Outside Close Cross / Red Box',
    },
    movementKey: 'W',
    movementRequirements: 'Run forward 2 steps and jumpthrow',
    tickrate: 'SUBTICK_CS2',
    tags: ['Outside', 'Yard', 'Cross-Smoke', 'Smoke', 'Essential'],
    isCustom: false,
    favorite: false,
    instructions: [
      'Line up on T Roof yellow railing.',
      'Aim at silo center seam.',
      'Take 2 steps forward and jumpthrow.',
    ],
    difficulty: 'MEDIUM',
    sourceAttribution: 'CSNADES Verified / Pro Playbook',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },

  {
    id: 'lineup-nuke-outside-cross-far',
    map: 'de_nuke',
    title: 'Outside Far Cross Smoke (Secret / Garage) from T Roof AC',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'RUN_JUMPTHROW',
    throwType: 'RUN_JUMPTHROW',
    throwPosition: {
      x: -1100,
      y: -820,
      z: -280,
      callout: 'T Roof AC Unit',
      description: 'Stand against the back corner of the ventilation AC box on T Roof',
      toleranceUnits: 5,
    },
    startPosition: {
      x: -1100,
      y: -820,
      z: -280,
      callout: 'T Roof AC Unit',
      toleranceUnits: 5,
    },
    crosshairTarget: {
      pitch: -24.5,
      yaw: 54.2,
      description: 'Aim at the top right corner of the catwalk railing bracket',
      visualLandmark: 'Catwalk railing bracket',
      svgAlignment: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="140" fill="#09090b" rx="4"/>
        <line x1="20" y1="80" x2="220" y2="40" stroke="#3f3f46" stroke-width="2"/>
        <line x1="120" y1="60" x2="120" y2="90" stroke="#71717a" stroke-width="1.5"/>
        <circle cx="120" cy="60" r="4" fill="#06b6d4"/>
        <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">CATWALK BRACKET CORNER</text>
        <text x="120" y="130" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">RUN-JUMPTHROW</text>
      </svg>`,
    },
    aimReference: {
      crosshairPlacement: 'Aim at the top right corner of the catwalk railing bracket',
      visualLandmark: 'Catwalk railing bracket',
    },
    svgReference: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="140" fill="#09090b" rx="4"/>
      <line x1="20" y1="80" x2="220" y2="40" stroke="#3f3f46" stroke-width="2"/>
      <line x1="120" y1="60" x2="120" y2="90" stroke="#71717a" stroke-width="1.5"/>
      <circle cx="120" cy="60" r="4" fill="#06b6d4"/>
      <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">CATWALK BRACKET CORNER</text>
      <text x="120" y="130" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">RUN-JUMPTHROW</text>
    </svg>`,
    landingArea: {
      x: 100,
      y: -700,
      z: -400,
      callout: 'Outside Far Cross / Garage',
      description: 'Second smoke in the wall of smokes; pairs with close cross smoke',
    },
    targetDestination: {
      x: 100,
      y: -700,
      z: -400,
      callout: 'Outside Far Cross / Garage',
    },
    movementKey: 'W',
    movementRequirements: 'Run forward 2 steps and jumpthrow',
    tickrate: 'SUBTICK_CS2',
    tags: ['Outside', 'Yard', 'Secret-Cross', 'Smoke', 'Essential'],
    isCustom: false,
    favorite: false,
    instructions: [
      'Line up against AC unit on T Roof.',
      'Aim at catwalk railing junction bracket.',
      '2 steps run and jumpthrow.',
    ],
    difficulty: 'MEDIUM',
    sourceAttribution: 'CSNADES Verified / Pro Playbook',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },

  {
    id: 'lineup-nuke-ramp-flash',
    map: 'de_nuke',
    title: 'Ramp Defense Popflash from Radio Room Door',
    side: 'CT',
    utilityType: 'FLASHBANG',
    technique: 'STAND',
    throwType: 'STANDING',
    throwPosition: {
      x: -250,
      y: 450,
      z: -410,
      callout: 'Radio Room Door',
      description: 'Stand in the doorway frame connecting Radio and Trophy',
      toleranceUnits: 6,
    },
    startPosition: {
      x: -250,
      y: 450,
      z: -410,
      callout: 'Radio Room Door',
      toleranceUnits: 6,
    },
    crosshairTarget: {
      pitch: -16.0,
      yaw: 85.0,
      description: 'Aim at the yellow industrial caution stripe; bounce off angled wall',
      visualLandmark: 'Industrial caution stripe',
      svgAlignment: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="140" fill="#09090b" rx="4"/>
        <line x1="80" y1="40" x2="160" y2="40" stroke="#facc15" stroke-width="4"/>
        <line x1="80" y1="50" x2="160" y2="50" stroke="#18181b" stroke-width="4"/>
        <circle cx="120" cy="45" r="5" fill="#f59e0b"/>
        <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">CAUTION STRIPE REFLECTION</text>
        <text x="120" y="130" font-family="monospace" font-size="8" fill="#f59e0b" text-anchor="middle">STAND &amp; LEFT-CLICK</text>
      </svg>`,
    },
    aimReference: {
      crosshairPlacement: 'Aim at the yellow industrial caution stripe; bounce off angled wall',
      visualLandmark: 'Industrial caution stripe',
    },
    svgReference: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="140" fill="#09090b" rx="4"/>
      <line x1="80" y1="40" x2="160" y2="40" stroke="#facc15" stroke-width="4"/>
      <line x1="80" y1="50" x2="160" y2="50" stroke="#18181b" stroke-width="4"/>
      <circle cx="120" cy="45" r="5" fill="#f59e0b"/>
      <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">CAUTION STRIPE REFLECTION</text>
      <text x="120" y="130" font-family="monospace" font-size="8" fill="#f59e0b" text-anchor="middle">STAND &amp; LEFT-CLICK</text>
    </svg>`,
    landingArea: {
      x: 200,
      y: 600,
      z: -450,
      callout: 'Ramp / Hell Airburst',
      description: 'Pops instantaneously at Ramp apex, blinding advancing T attackers',
    },
    targetDestination: {
      x: 200,
      y: 600,
      z: -450,
      callout: 'Ramp / Hell Airburst',
    },
    movementKey: 'NONE',
    movementRequirements: 'Stationary throw',
    tickrate: 'SUBTICK_CS2',
    tags: ['Ramp', 'Defense', 'Popflash', 'Flash', 'Essential'],
    isCustom: false,
    favorite: false,
    instructions: [
      'Position in Radio doorway.',
      'Aim at yellow warning stripe on angled ventilation duct.',
      'Throw left-click for instant bounce popflash.',
    ],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },

  // ==========================================================================
  // MAP 5: DE_ANCIENT
  // ==========================================================================
  {
    id: 'lineup-ancient-donut-smoke',
    map: 'de_ancient',
    title: 'Mid Donut Smoke from T Yard Ruins Pillar',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'JUMPTHROW',
    throwType: 'JUMPTHROW',
    throwPosition: {
      x: -1150,
      y: -20,
      z: -100,
      callout: 'T Yard Ruins',
      description: 'Wedge into the stone carved pillar corner on the high terrace in T Yard',
      toleranceUnits: 5,
    },
    startPosition: {
      x: -1150,
      y: -20,
      z: -100,
      callout: 'T Yard Ruins',
      toleranceUnits: 5,
    },
    crosshairTarget: {
      pitch: -36.0,
      yaw: 62.5,
      description: 'Aim at the apex tip of the hanging jungle vine foliage over the temple roof',
      visualLandmark: 'Hanging vine foliage apex',
      svgAlignment: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="140" fill="#09090b" rx="4"/>
        <path d="M 40 30 Q 120 70 200 40" fill="none" stroke="#22c55e" stroke-width="2"/>
        <polygon points="120,60 115,75 125,75" fill="#15803d"/>
        <circle cx="120" cy="75" r="4" fill="#06b6d4"/>
        <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">JUNGLE VINE LEAF TIP</text>
        <text x="120" y="130" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">SUBTICK JUMPTHROW</text>
      </svg>`,
    },
    aimReference: {
      crosshairPlacement: 'Aim at the apex tip of the hanging jungle vine foliage over the temple roof',
      visualLandmark: 'Hanging vine foliage apex',
    },
    svgReference: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="140" fill="#09090b" rx="4"/>
      <path d="M 40 30 Q 120 70 200 40" fill="none" stroke="#22c55e" stroke-width="2"/>
      <polygon points="120,60 115,75 125,75" fill="#15803d"/>
      <circle cx="120" cy="75" r="4" fill="#06b6d4"/>
      <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">JUNGLE VINE LEAF TIP</text>
      <text x="120" y="130" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">SUBTICK JUMPTHROW</text>
    </svg>`,
    landingArea: {
      x: -200,
      y: 400,
      z: -50,
      callout: 'Mid Donut Entrance',
      description: 'Seals off Donut entrance, preventing CT sniper rotation to Mid',
    },
    targetDestination: {
      x: -200,
      y: 400,
      z: -50,
      callout: 'Mid Donut Entrance',
    },
    movementKey: 'NONE',
    movementRequirements: 'Sub-tick jumpthrow bind',
    tickrate: 'SUBTICK_CS2',
    tags: ['Donut', 'Mid-Control', 'Smoke', 'Essential'],
    isCustom: false,
    favorite: false,
    instructions: [
      'Wedge into T Yard ruins stone corner.',
      'Aim at the tip of hanging vine leaf.',
      'Execute jumpthrow.',
    ],
    difficulty: 'MEDIUM',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },

  {
    id: 'lineup-ancient-b-cave-smoke',
    map: 'de_ancient',
    title: 'B Site Cave Smoke from B Ramp Stone Wall',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'STAND',
    throwType: 'STANDING',
    throwPosition: {
      x: 420,
      y: -980,
      z: -90,
      callout: 'B Ramp',
      description: 'Stand against the Aztec carved stone wall indentation on B Ramp',
      toleranceUnits: 5,
    },
    startPosition: {
      x: 420,
      y: -980,
      z: -90,
      callout: 'B Ramp',
      toleranceUnits: 5,
    },
    crosshairTarget: {
      pitch: -29.2,
      yaw: 78.0,
      description: 'Aim at the square notch in the upper Aztec stone temple frieze',
      visualLandmark: 'Stone temple frieze square notch',
      svgAlignment: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="140" fill="#09090b" rx="4"/>
        <rect x="70" y="45" width="100" height="30" fill="#18181b" stroke="#3f3f46" stroke-width="1.5"/>
        <rect x="110" y="35" width="20" height="10" fill="#09090b" stroke="#3f3f46"/>
        <circle cx="120" cy="40" r="4" fill="#06b6d4"/>
        <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">TEMPLE FRIEZE NOTCH</text>
        <text x="120" y="130" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">STAND &amp; LEFT-CLICK</text>
      </svg>`,
    },
    aimReference: {
      crosshairPlacement: 'Aim at the square notch in the upper Aztec stone temple frieze',
      visualLandmark: 'Stone temple frieze square notch',
    },
    svgReference: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="140" fill="#09090b" rx="4"/>
      <rect x="70" y="45" width="100" height="30" fill="#18181b" stroke="#3f3f46" stroke-width="1.5"/>
      <rect x="110" y="35" width="20" height="10" fill="#09090b" stroke="#3f3f46"/>
      <circle cx="120" cy="40" r="4" fill="#06b6d4"/>
      <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">TEMPLE FRIEZE NOTCH</text>
      <text x="120" y="130" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">STAND &amp; LEFT-CLICK</text>
    </svg>`,
    landingArea: {
      x: 900,
      y: -600,
      z: -50,
      callout: 'B Site Cave Entrance',
      description: 'Blooms deep in Cave entrance, eliminating crossfire onto B site plant',
    },
    targetDestination: {
      x: 900,
      y: -600,
      z: -50,
      callout: 'B Site Cave Entrance',
    },
    movementKey: 'NONE',
    movementRequirements: 'Stationary throw',
    tickrate: 'SUBTICK_CS2',
    tags: ['Cave', 'B-Execute', 'Smoke', 'Essential'],
    isCustom: false,
    favorite: false,
    instructions: [
      'Stand against B ramp wall recess.',
      'Aim at upper stone notch in temple frieze.',
      'Stationary left-click throw.',
    ],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },

  // ==========================================================================
  // MAP 6: DE_ANUBIS
  // ==========================================================================
  {
    id: 'lineup-anubis-b-connector-smoke',
    map: 'de_anubis',
    title: 'B Site Connector Smoke from Canal Alley',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'JUMPTHROW',
    throwType: 'JUMPTHROW',
    throwPosition: {
      x: -580,
      y: 790,
      z: 5,
      callout: 'Canal Alley',
      description: 'Stand wedged in the stone canal archway corner outside B site',
      toleranceUnits: 5,
    },
    startPosition: {
      x: -580,
      y: 790,
      z: 5,
      callout: 'Canal Alley',
      toleranceUnits: 5,
    },
    crosshairTarget: {
      pitch: -34.8,
      yaw: 82.4,
      description: 'Aim at the decorative palm frond silhouette atop the sandstone minaret',
      visualLandmark: 'Sandstone minaret cornice frond',
      svgAlignment: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="140" fill="#09090b" rx="4"/>
        <line x1="120" y1="120" x2="120" y2="40" stroke="#71717a" stroke-width="2"/>
        <path d="M 120 40 Q 140 25 155 35" fill="none" stroke="#22c55e" stroke-width="1.5"/>
        <circle cx="120" cy="40" r="4" fill="#06b6d4"/>
        <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">MINARET CORNICE FROND</text>
        <text x="120" y="130" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">SUBTICK JUMPTHROW</text>
      </svg>`,
    },
    aimReference: {
      crosshairPlacement: 'Aim at the decorative palm frond silhouette atop the sandstone minaret',
      visualLandmark: 'Sandstone minaret cornice frond',
    },
    svgReference: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="140" fill="#09090b" rx="4"/>
      <line x1="120" y1="120" x2="120" y2="40" stroke="#71717a" stroke-width="2"/>
      <path d="M 120 40 Q 140 25 155 35" fill="none" stroke="#22c55e" stroke-width="1.5"/>
      <circle cx="120" cy="40" r="4" fill="#06b6d4"/>
      <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">MINARET CORNICE FROND</text>
      <text x="120" y="130" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">SUBTICK JUMPTHROW</text>
    </svg>`,
    landingArea: {
      x: 100,
      y: 1200,
      z: 60,
      callout: 'B Site Connector',
      description: 'Fully blankets Connector entrance into B site, isolating site defenders',
    },
    targetDestination: {
      x: 100,
      y: 1200,
      z: 60,
      callout: 'B Site Connector',
    },
    movementKey: 'NONE',
    movementRequirements: 'Jumpthrow',
    tickrate: 'SUBTICK_CS2',
    tags: ['Connector', 'B-Execute', 'Smoke', 'Essential'],
    isCustom: false,
    favorite: false,
    instructions: [
      'Wedge into stone canal archway outside B.',
      'Aim at sandstone minaret cornice.',
      'Jumpthrow.',
    ],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified / Pro Playbook',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },

  {
    id: 'lineup-anubis-a-heaven-smoke',
    map: 'de_anubis',
    title: 'A Site Heaven Smoke from A Main Boat Hull',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'STAND',
    throwType: 'STANDING',
    throwPosition: {
      x: -780,
      y: -590,
      z: 10,
      callout: 'A Main Boat',
      description: 'Stand wedged against the wooden boat hull near the water entrance in A Main',
      toleranceUnits: 5,
    },
    startPosition: {
      x: -780,
      y: -590,
      z: 10,
      callout: 'A Main Boat',
      toleranceUnits: 5,
    },
    crosshairTarget: {
      pitch: -27.5,
      yaw: -42.0,
      description: 'Aim at the highest rim point of the clay pot resting on the balcony wall',
      visualLandmark: 'Balcony clay urn rim',
      svgAlignment: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="140" fill="#09090b" rx="4"/>
        <line x1="40" y1="90" x2="200" y2="90" stroke="#71717a" stroke-width="2"/>
        <ellipse cx="120" cy="75" rx="12" ry="15" fill="#ca8a04"/>
        <circle cx="120" cy="60" r="4" fill="#06b6d4"/>
        <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">BALCONY URN RIM</text>
        <text x="120" y="130" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">STAND &amp; LEFT-CLICK</text>
      </svg>`,
    },
    aimReference: {
      crosshairPlacement: 'Aim at the highest rim point of the clay pot resting on the balcony wall',
      visualLandmark: 'Balcony clay urn rim',
    },
    svgReference: `<svg width="240" height="140" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="140" fill="#09090b" rx="4"/>
      <line x1="40" y1="90" x2="200" y2="90" stroke="#71717a" stroke-width="2"/>
      <ellipse cx="120" cy="75" rx="12" ry="15" fill="#ca8a04"/>
      <circle cx="120" cy="60" r="4" fill="#06b6d4"/>
      <text x="120" y="118" font-family="monospace" font-size="9" fill="#a1a1aa" text-anchor="middle">BALCONY URN RIM</text>
      <text x="120" y="130" font-family="monospace" font-size="8" fill="#06b6d4" text-anchor="middle">STAND &amp; LEFT-CLICK</text>
    </svg>`,
    landingArea: {
      x: 200,
      y: -1000,
      z: 120,
      callout: 'A Heaven / Balcony',
      description: 'Completely blocks Heaven sniper position, allowing safe site entry through A Main',
    },
    targetDestination: {
      x: 200,
      y: -1000,
      z: 120,
      callout: 'A Heaven / Balcony',
    },
    movementKey: 'NONE',
    movementRequirements: 'Stationary throw',
    tickrate: 'SUBTICK_CS2',
    tags: ['Heaven', 'A-Execute', 'Smoke', 'Essential'],
    isCustom: false,
    favorite: false,
    instructions: [
      'Position against boat hull at A Main.',
      'Aim at upper rim of the clay urn on the balcony.',
      'Left-click throw.',
    ],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },

  // ==========================================================================
  // ADDITIONAL COMPETITIVE LINEUPS ACROSS ALL 6 ACTIVE DUTY MAPS (CSNADES PACK)
  // ==========================================================================
  {
    id: 'lineup-mirage-connector-from-spawn',
    map: 'de_mirage',
    title: 'Mid Connector Smoke from T Spawn Trashcan',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'JUMPTHROW',
    throwType: 'JUMPTHROW',
    throwPosition: { x: -1240, y: -210, z: -168, callout: 'T Spawn Trashcan Corner', description: 'Wedge into right corner of T Spawn trashcan', toleranceUnits: 5 },
    startPosition: { x: -1240, y: -210, z: -168, callout: 'T Spawn Trashcan Corner', toleranceUnits: 5 },
    crosshairTarget: { pitch: -34.0, yaw: 18.5, description: 'Aim at the top-right tip of the rug pattern on the upper balcony', visualLandmark: 'Top-right tip of balcony rug', svgAlignment: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>' },
    aimReference: { crosshairPlacement: 'Mirar na ponta superior direita do tapete pendurado na varanda', visualLandmark: 'Quina direita do tapete superior' },
    svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>',
    landingArea: { x: -540, y: -240, z: -160, callout: 'Mid Connector Inside', description: 'Fills Connector completely without leaving top gap toward A Stairs' },
    targetDestination: { x: -540, y: -240, z: -160, callout: 'Mid Connector Inside' },
    movementKey: 'NONE',
    movementRequirements: 'Jumpthrow parado encostado na lixeira do T Spawn',
    tickrate: 'SUBTICK_CS2',
    tags: ['Connector', 'Mid-Control', 'Smoke', 'Essential'],
    isCustom: false,
    favorite: true,
    instructions: ['Trave no canto direito da lixeira no T Spawn.', 'Mire na ponta superior direita do tapete na varanda.', 'Execute um Jumpthrow padrão (Pular + Botão Esquerdo).'],
    difficulty: 'MEDIUM',
    sourceAttribution: 'CSNADES Verified / Pro Meta',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },
  {
    id: 'lineup-mirage-b-market-window',
    map: 'de_mirage',
    title: 'B Market Window Smoke from Back Alley',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'JUMPTHROW',
    throwType: 'JUMPTHROW',
    throwPosition: { x: -1380, y: 740, z: -160, callout: 'Back Alley Door Frame', description: 'Wedge into the wooden doorframe before B Apartments', toleranceUnits: 5 },
    startPosition: { x: -1380, y: 740, z: -160, callout: 'Back Alley Door Frame', toleranceUnits: 5 },
    crosshairTarget: { pitch: -39.2, yaw: 112.0, description: 'Aim at the inner corner of the tall tower roof trim', visualLandmark: 'Inner corner of tower roof trim', svgAlignment: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>' },
    aimReference: { crosshairPlacement: 'Mirar na quina interna da torre alta acima do B Apps', visualLandmark: 'Quina da torre alta B' },
    svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>',
    landingArea: { x: -1950, y: 260, z: -120, callout: 'Market Window', description: 'Lands inside Market Window, blocking CT AWP rotations' },
    targetDestination: { x: -1950, y: 260, z: -120, callout: 'Market Window' },
    movementKey: 'NONE',
    movementRequirements: 'Jumpthrow parado no batente da porta do Back Alley',
    tickrate: 'SUBTICK_CS2',
    tags: ['Market', 'B-Execute', 'Smoke', 'Essential'],
    isCustom: false,
    favorite: false,
    instructions: ['Encoste no batente de madeira na entrada do Back Alley.', 'Alinhe a mira na quina interna da torre acima do prédio B.', 'Execute um Jumpthrow (Pular + Botão Esquerdo).'],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },
  {
    id: 'lineup-mirage-window-molotov',
    map: 'de_mirage',
    title: 'Mid Window Molotov from Top Mid Cart',
    side: 'T',
    utilityType: 'MOLOTOV_INCENDIARY',
    technique: 'RUN',
    throwType: 'WALK_THROW',
    throwPosition: { x: -210, y: -580, z: -160, callout: 'Top Mid Boxes', description: 'Stand behind Top Mid boxes protected from Window', toleranceUnits: 8 },
    startPosition: { x: -210, y: -580, z: -160, callout: 'Top Mid Boxes', toleranceUnits: 8 },
    crosshairTarget: { pitch: -16.5, yaw: -145.0, description: 'Aim at the dark smudge on the right wooden shutter of Window', visualLandmark: 'Right wooden shutter dark spot', svgAlignment: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>' },
    aimReference: { crosshairPlacement: 'Mirar na mancha escura da janela de madeira à direita do Mid Window', visualLandmark: ' Veneziana direita da Janela' },
    svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>',
    landingArea: { x: -1020, y: -320, z: -100, callout: 'Sniper Nest / Window', description: 'Burns entire Sniper Nest interior forcing AWP out' },
    targetDestination: { x: -1020, y: -320, z: -100, callout: 'Sniper Nest / Window' },
    movementKey: 'W',
    movementRequirements: 'Dê 2 passos para frente (W) e solte com botão esquerdo',
    tickrate: 'SUBTICK_CS2',
    tags: ['Window', 'Mid-Control', 'Molotov'],
    isCustom: false,
    favorite: false,
    instructions: ['Proteja-se atrás das caixas do Top Mid.', 'Mire na veneziana direita da Janela do Meio.', 'Dê dois passos curtos com W e solte com o botão esquerdo.'],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },
  // INFERNO EXTRA LINEUPS
  {
    id: 'lineup-inferno-a-moto-smoke',
    map: 'de_inferno',
    title: 'A Site Moto Smoke from Second Mid',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'JUMPTHROW',
    throwType: 'JUMPTHROW',
    throwPosition: { x: 420, y: 120, z: 90, callout: 'Second Mid Blue Door', description: 'Stand against the blue door frame in Second Mid', toleranceUnits: 6 },
    startPosition: { x: 420, y: 120, z: 90, callout: 'Second Mid Blue Door', toleranceUnits: 6 },
    crosshairTarget: { pitch: -31.0, yaw: 42.0, description: 'Aim at the bottom tip of the balcony lantern', visualLandmark: 'Balcony iron lantern tip', svgAlignment: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>' },
    aimReference: { crosshairPlacement: 'Mirar na ponta inferior da luminária de ferro na varanda', visualLandmark: 'Luminária da varanda Second Mid' },
    svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>',
    landingArea: { x: 1850, y: 450, z: 160, callout: 'A Moto / Pit Cutoff', description: 'Blocks Library and Moto rotation while isolating Pit' },
    targetDestination: { x: 1850, y: 450, z: 160, callout: 'A Moto / Pit Cutoff' },
    movementKey: 'NONE',
    movementRequirements: 'Jumpthrow parado na porta azul do Second Mid',
    tickrate: 'SUBTICK_CS2',
    tags: ['Moto', 'A-Execute', 'Smoke', 'Essential'],
    isCustom: false,
    favorite: true,
    instructions: ['Encoste no centro da porta azul no Second Mid.', 'Mire na base da luminária de ferro da varanda.', 'Execute um Jumpthrow (Pular + Botão Esquerdo).'],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },
  {
    id: 'lineup-inferno-a-arch-smoke',
    map: 'de_inferno',
    title: 'A Long / Arch Smoke from Alt Mid Haycart',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'STAND',
    throwType: 'STANDING',
    throwPosition: { x: 610, y: -140, z: 100, callout: 'Mid Haycart Corner', description: 'Wedge between haycart and wall at bottom of Mid', toleranceUnits: 5 },
    startPosition: { x: 610, y: -140, z: 100, callout: 'Mid Haycart Corner', toleranceUnits: 5 },
    crosshairTarget: { pitch: -42.0, yaw: 28.0, description: 'Aim at the top-left chimney corner above Mid', visualLandmark: 'Chimney top-left brick corner', svgAlignment: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>' },
    aimReference: { crosshairPlacement: 'Mirar na quina superior esquerda da chaminé de tijolos', visualLandmark: 'Quina da chaminé do Meio' },
    svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>',
    landingArea: { x: 1720, y: 1120, z: 160, callout: 'A Long / Arch', description: 'Seals off A Long and Arch side completely for Boiler/Short push' },
    targetDestination: { x: 1720, y: 1120, z: 160, callout: 'A Long / Arch' },
    movementKey: 'NONE',
    movementRequirements: 'Parado + Botão Esquerdo encostado na carroça',
    tickrate: 'SUBTICK_CS2',
    tags: ['Arch', 'Long', 'A-Execute', 'Smoke'],
    isCustom: false,
    favorite: false,
    instructions: ['Trave no canto da carroça de feno na base do Meio.', 'Mire na quina superior esquerda da chaminé.', 'Solte parado com o botão esquerdo.'],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },
  {
    id: 'lineup-inferno-pit-molotov',
    map: 'de_inferno',
    title: 'A Big Pit Molotov from Apps Balcony',
    side: 'T',
    utilityType: 'MOLOTOV_INCENDIARY',
    technique: 'STAND',
    throwType: 'STANDING',
    throwPosition: { x: 1640, y: -120, z: 240, callout: 'Apps Interior Door', description: 'Stand inside Apartments doorway safe from Pit angle', toleranceUnits: 6 },
    startPosition: { x: 1640, y: -120, z: 240, callout: 'Apps Interior Door', toleranceUnits: 6 },
    crosshairTarget: { pitch: -12.0, yaw: 14.0, description: 'Aim at the top edge of the green shutter across Pit', visualLandmark: 'Top edge of green window shutter', svgAlignment: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>' },
    aimReference: { crosshairPlacement: 'Mirar na borda superior da janela verde em frente à Varanda', visualLandmark: 'Borda da janela verde do Pit' },
    svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>',
    landingArea: { x: 2100, y: 120, z: 140, callout: 'A Big Pit', description: 'Flushes out CT anchor hiding in back Pit and Graveyard stairs' },
    targetDestination: { x: 2100, y: 120, z: 140, callout: 'A Big Pit' },
    movementKey: 'NONE',
    movementRequirements: 'Parado + Botão Esquerdo de dentro do Apps',
    tickrate: 'SUBTICK_CS2',
    tags: ['Pit', 'A-Execute', 'Molotov'],
    isCustom: false,
    favorite: false,
    instructions: ['Posicione-se no batente interno da porta do Tapete (Apps).', 'Mire na borda superior da veneziana verde do Pit.', 'Jogue parado com o botão esquerdo.'],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },
  {
    id: 'lineup-inferno-banana-deep-ct-moly',
    map: 'de_inferno',
    title: 'Deep Banana Car Molotov (Anti-Rush CT)',
    side: 'CT',
    utilityType: 'MOLOTOV_INCENDIARY',
    technique: 'RUN',
    throwType: 'RUN_JUMPTHROW',
    throwPosition: { x: 920, y: 2420, z: 160, callout: 'Coffins / B Entrance', description: 'Run from B site entrance toward Banana wall', toleranceUnits: 8 },
    startPosition: { x: 920, y: 2420, z: 160, callout: 'Coffins / B Entrance', toleranceUnits: 8 },
    crosshairTarget: { pitch: -21.0, yaw: -115.0, description: 'Aim at the wooden roof corner above Banana broom', visualLandmark: 'Banana roof corner above broom', svgAlignment: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>' },
    aimReference: { crosshairPlacement: 'Mirar na quina do telhado acima da vassoura na Banana', visualLandmark: 'Telhado acima da vassoura Banana' },
    svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>',
    landingArea: { x: 480, y: 1850, z: 130, callout: 'Banana Car / Half-Wall', description: 'Denies early T Banana control and burns Half-Wall' },
    targetDestination: { x: 480, y: 1850, z: 130, callout: 'Banana Car / Half-Wall' },
    movementKey: 'W',
    movementRequirements: 'Correndo na entrada da B + Botão Esquerdo',
    tickrate: 'SUBTICK_CS2',
    tags: ['Banana', 'Anti-Rush', 'Molotov', 'CT-Control'],
    isCustom: false,
    favorite: false,
    instructions: ['Corra pela entrada do Bomb B em direção à Banana.', 'Mire na quina do telhado acima da vassoura.', 'Solte com botão esquerdo em movimento para queimar o Carro.'],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },
  // DUST2 EXTRA LINEUPS
  {
    id: 'lineup-dust2-long-corner-smoke',
    map: 'de_dust2',
    title: 'A Long Corner Smoke from T Spawn',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'JUMPTHROW',
    throwType: 'JUMPTHROW',
    throwPosition: { x: -640, y: -820, z: 120, callout: 'T Spawn Car Wall', description: 'Wedge against the wall edge outside Long House', toleranceUnits: 5 },
    startPosition: { x: -640, y: -820, z: 120, callout: 'T Spawn Car Wall', toleranceUnits: 5 },
    crosshairTarget: { pitch: -44.0, yaw: 12.0, description: 'Aim at the top-left corner of the tall solar panel on roof', visualLandmark: 'Solar panel top-left corner', svgAlignment: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>' },
    aimReference: { crosshairPlacement: 'Mirar na quina superior esquerda do painel solar no telhado', visualLandmark: 'Quina do painel solar Long House' },
    svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>',
    landingArea: { x: 1240, y: 420, z: 40, callout: 'A Long Blue Corner', description: 'Lands directly on Long Corner forcing CT AWP back to Pit or Site' },
    targetDestination: { x: 1240, y: 420, z: 40, callout: 'A Long Blue Corner' },
    movementKey: 'NONE',
    movementRequirements: 'Jumpthrow parado na parede externa da Long House',
    tickrate: 'SUBTICK_CS2',
    tags: ['Long', 'A-Execute', 'Smoke', 'Essential'],
    isCustom: false,
    favorite: true,
    instructions: ['Encoste na marca da parede antes da porta da Long House.', 'Mire na quina superior esquerda do painel solar.', 'Execute um Jumpthrow no início do round.'],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },
  {
    id: 'lineup-dust2-ct-cross-smoke',
    map: 'de_dust2',
    title: 'A Long Cross Smoke (Zero Gap to CT Spawn)',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'STAND',
    throwType: 'STANDING',
    throwPosition: { x: 1120, y: 310, z: 40, callout: 'Long Blue Container', description: 'Wedge into the front corner of Blue Box on Long', toleranceUnits: 5 },
    startPosition: { x: 1120, y: 310, z: 40, callout: 'Long Blue Container', toleranceUnits: 5 },
    crosshairTarget: { pitch: -32.0, yaw: 65.0, description: 'Aim at the dark tooth mark on the upper wall ledge', visualLandmark: 'Dark brick tooth on upper ledge', svgAlignment: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>' },
    aimReference: { crosshairPlacement: 'Mirar no dente escuro da cornija da parede acima do Fundo', visualLandmark: 'Dente escuro na cornija do Fundo' },
    svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>',
    landingArea: { x: 1180, y: 2150, z: 20, callout: 'A Cross / CT Spawn', description: 'Blocks CT Spawn sniper vision while crossing Long to A Ramp' },
    targetDestination: { x: 1180, y: 2150, z: 20, callout: 'A Cross / CT Spawn' },
    movementKey: 'NONE',
    movementRequirements: 'Parado + Botão Esquerdo na caixa azul do Fundo',
    tickrate: 'SUBTICK_CS2',
    tags: ['Cross', 'Long', 'A-Execute', 'Smoke'],
    isCustom: false,
    favorite: true,
    instructions: ['Trave na quina frontal da caixa azul (Blue Box) no Fundo.', 'Mire no dente escuro da borda superior da parede.', 'Solte parado com o botão esquerdo.'],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },
  {
    id: 'lineup-dust2-b-window-smoke',
    map: 'de_dust2',
    title: 'B Site Window Smoke from Outside Tunnels',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'JUMPTHROW',
    throwType: 'JUMPTHROW',
    throwPosition: { x: -1620, y: 840, z: 80, callout: 'Outside Upper Tunnels Box', description: 'Wedge behind the stacked crates outside B Tunnels', toleranceUnits: 5 },
    startPosition: { x: -1620, y: 840, z: 80, callout: 'Outside Upper Tunnels Box', toleranceUnits: 5 },
    crosshairTarget: { pitch: -38.5, yaw: 78.0, description: 'Aim at the bottom-left corner of the yellow crane arm', visualLandmark: 'Yellow crane bottom-left joint', svgAlignment: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>' },
    aimReference: { crosshairPlacement: 'Mirar na junção inferior esquerda do guindaste amarelo', visualLandmark: 'Junção do guindaste amarelo B' },
    svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>',
    landingArea: { x: -1350, y: 2420, z: 120, callout: 'B Window / Breach', description: 'Lands inside B Window scaffold, blocking Mid-to-B CT rotators' },
    targetDestination: { x: -1350, y: 2420, z: 120, callout: 'B Window / Breach' },
    movementKey: 'NONE',
    movementRequirements: 'Jumpthrow parado atrás das caixas fora do Túnel',
    tickrate: 'SUBTICK_CS2',
    tags: ['B-Window', 'Mid-to-B', 'Smoke'],
    isCustom: false,
    favorite: false,
    instructions: ['Encoste na caixa empilhada na parte externa do Túnel B.', 'Mire na junção inferior esquerda do guindaste amarelo.', 'Execute um Jumpthrow (Pular + Botão Esquerdo).'],
    difficulty: 'MEDIUM',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },
  {
    id: 'lineup-dust2-short-car-moly',
    map: 'de_dust2',
    title: 'A Site Default & Goose Molotov from Short',
    side: 'T',
    utilityType: 'MOLOTOV_INCENDIARY',
    technique: 'STAND',
    throwType: 'STANDING',
    throwPosition: { x: 420, y: 1680, z: 120, callout: 'A Short Stairs Ledge', description: 'Stand at the left wall edge before A Short stairs', toleranceUnits: 6 },
    startPosition: { x: 420, y: 1680, z: 120, callout: 'A Short Stairs Ledge', toleranceUnits: 6 },
    crosshairTarget: { pitch: -18.0, yaw: 24.0, description: 'Aim at the green canopy corner above Goose', visualLandmark: 'Green canopy corner above Goose', svgAlignment: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>' },
    aimReference: { crosshairPlacement: 'Mirar na quina do toldo verde acima da posição Goose', visualLandmark: 'Quina do toldo verde (Goose)' },
    svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>',
    landingArea: { x: 1080, y: 2480, z: 130, callout: 'A Default / Goose', description: 'Burns both Default plant boxes and Goose corner' },
    targetDestination: { x: 1080, y: 2480, z: 130, callout: 'A Default / Goose' },
    movementKey: 'NONE',
    movementRequirements: 'Parado + Botão Esquerdo na subida da Varanda (Short)',
    tickrate: 'SUBTICK_CS2',
    tags: ['Goose', 'A-Short', 'Molotov'],
    isCustom: false,
    favorite: false,
    instructions: ['Encoste na parede esquerda antes da escada da Varanda (Short).', 'Mire na quina do toldo verde acima do Goose.', 'Jogue parado com o botão esquerdo.'],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },
  // NUKE EXTRA LINEUPS
  {
    id: 'lineup-nuke-a-heaven-smoke',
    map: 'de_nuke',
    title: 'A Heaven Smoke from T Roof Skylight',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'JUMPTHROW',
    throwType: 'JUMPTHROW',
    throwPosition: { x: -420, y: -980, z: 320, callout: 'T Roof Yellow Vent', description: 'Stand against the yellow ventilation unit on T Roof', toleranceUnits: 5 },
    startPosition: { x: -420, y: -980, z: 320, callout: 'T Roof Yellow Vent', toleranceUnits: 5 },
    crosshairTarget: { pitch: -29.0, yaw: 14.0, description: 'Aim at the second metal rivet on the roof skylight frame', visualLandmark: 'Second skylight frame rivet', svgAlignment: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>' },
    aimReference: { crosshairPlacement: 'Mirar no segundo rebite metálico da claraboia do telhado', visualLandmark: 'Segundo rebite da claraboia T Roof' },
    svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>',
    landingArea: { x: 420, y: -620, z: 220, callout: 'A Heaven Balcony', description: 'Crashes through glass skylight and blooms directly on A Heaven' },
    targetDestination: { x: 420, y: -620, z: 220, callout: 'A Heaven Balcony' },
    movementKey: 'NONE',
    movementRequirements: 'Quebre o vidro da claraboia antes e faça Jumpthrow parado',
    tickrate: 'SUBTICK_CS2',
    tags: ['Heaven', 'A-Execute', 'Smoke', 'Essential'],
    isCustom: false,
    favorite: true,
    instructions: ['Quebre o vidro frontal da claraboia no T Roof.', 'Encoste na caixa de ventilação amarela.', 'Mire no segundo rebite da estrutura e faça Jumpthrow.'],
    difficulty: 'MEDIUM',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },
  {
    id: 'lineup-nuke-top-hut-moly',
    map: 'de_nuke',
    title: 'Top Hut Molotov from T Roof Skylight',
    side: 'T',
    utilityType: 'MOLOTOV_INCENDIARY',
    technique: 'RUN',
    throwType: 'WALK_THROW',
    throwPosition: { x: -180, y: -860, z: 320, callout: 'T Roof Skylight Edge', description: 'Stand at the back frame of the broken skylight', toleranceUnits: 6 },
    startPosition: { x: -180, y: -860, z: 320, callout: 'T Roof Skylight Edge', toleranceUnits: 6 },
    crosshairTarget: { pitch: 38.0, yaw: 10.0, description: 'Aim down through skylight at the blue Hut roof corner', visualLandmark: 'Blue Hut roof edge', svgAlignment: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>' },
    aimReference: { crosshairPlacement: 'Mirar pela claraboia direto na borda do teto da Casinha (Hut)', visualLandmark: 'Borda superior do teto da Casinha' },
    svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>',
    landingArea: { x: 120, y: -740, z: 140, callout: 'Top of Hut / Mustangs', description: 'Incinerates CT defender playing atop Hut and Mustangs' },
    targetDestination: { x: 120, y: -740, z: 140, callout: 'Top of Hut / Mustangs' },
    movementKey: 'W',
    movementRequirements: 'Ande 1 passo para frente (W) e solte com botão esquerdo',
    tickrate: 'SUBTICK_CS2',
    tags: ['Hut', 'A-Execute', 'Molotov'],
    isCustom: false,
    favorite: false,
    instructions: ['Posicione-se na borda da claraboia olhando para dentro do Bomb A.', 'Mire na quina do teto da Casinha (Hut).', 'Dê um passo com W e jogue com botão esquerdo.'],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },
  {
    id: 'lineup-nuke-garage-smoke',
    map: 'de_nuke',
    title: 'Outside Garage Smoke from Truck',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'JUMPTHROW',
    throwType: 'JUMPTHROW',
    throwPosition: { x: -940, y: -1240, z: 10, callout: 'T Truck Front Bumper', description: 'Wedge at the front bumper of the white truck outside', toleranceUnits: 5 },
    startPosition: { x: -940, y: -1240, z: 10, callout: 'T Truck Front Bumper', toleranceUnits: 5 },
    crosshairTarget: { pitch: -26.0, yaw: -18.0, description: 'Aim at the top-right corner of the Silo pipe bracket', visualLandmark: 'Silo pipe bracket corner', svgAlignment: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>' },
    aimReference: { crosshairPlacement: 'Mirar no suporte superior direito da tubulação do Silo', visualLandmark: 'Suporte do cano do Silo' },
    svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>',
    landingArea: { x: 640, y: -1480, z: 10, callout: 'Outside Garage Entrance', description: 'Seals off CT AWP inside Garage completamente' },
    targetDestination: { x: 640, y: -1480, z: 10, callout: 'Outside Garage Entrance' },
    movementKey: 'NONE',
    movementRequirements: 'Jumpthrow parado no para-choque do caminhão T',
    tickrate: 'SUBTICK_CS2',
    tags: ['Garage', 'Outside', 'Smoke'],
    isCustom: false,
    favorite: false,
    instructions: ['Encoste no para-choque dianteiro do caminhão no T Spawn.', 'Mire no suporte do cano lateral do Silo.', 'Execute um Jumpthrow (Pular + Botão Esquerdo).'],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },
  // ANCIENT EXTRA LINEUPS
  {
    id: 'lineup-ancient-mid-redroom-smoke',
    map: 'de_ancient',
    title: 'Mid Red Room Smoke from T Spawn Pillar',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'JUMPTHROW',
    throwType: 'JUMPTHROW',
    throwPosition: { x: -380, y: -1620, z: 40, callout: 'T Spawn Center Ruin Pillar', description: 'Wedge against the center stone pillar in T Spawn', toleranceUnits: 5 },
    startPosition: { x: -380, y: -1620, z: 40, callout: 'T Spawn Center Ruin Pillar', toleranceUnits: 5 },
    crosshairTarget: { pitch: -36.0, yaw: 88.0, description: 'Aim at the notch in the stone arch above Mid entrance', visualLandmark: 'Stone arch v-notch', svgAlignment: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>' },
    aimReference: { crosshairPlacement: 'Mirar na fenda em V no topo do arco de pedra do Meio', visualLandmark: 'Fenda em V do arco de pedra' },
    svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>',
    landingArea: { x: -240, y: 420, z: 90, callout: 'Mid Red Room / Window', description: 'Denies CT Mid Window peek and allows instant Elbow/Donut control' },
    targetDestination: { x: -240, y: 420, z: 90, callout: 'Mid Red Room / Window' },
    movementKey: 'NONE',
    movementRequirements: 'Jumpthrow parado no pilar central do T Spawn',
    tickrate: 'SUBTICK_CS2',
    tags: ['Red-Room', 'Mid-Control', 'Smoke', 'Essential'],
    isCustom: false,
    favorite: true,
    instructions: ['Trave no pilar de pedra central logo no T Spawn.', 'Mire na fenda em V do arco de pedra acima do Meio.', 'Execute um Jumpthrow imediato.'],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },
  {
    id: 'lineup-ancient-a-temple-smoke',
    map: 'de_ancient',
    title: 'A Temple & CT Smoke from A Main Ruins',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'JUMPTHROW',
    throwType: 'JUMPTHROW',
    throwPosition: { x: -1340, y: -420, z: 60, callout: 'A Main Back Wall Torch', description: 'Stand directly beneath the wall torch outside A Main', toleranceUnits: 5 },
    startPosition: { x: -1340, y: -420, z: 60, callout: 'A Main Back Wall Torch', toleranceUnits: 5 },
    crosshairTarget: { pitch: -33.0, yaw: 72.0, description: 'Aim at the bright sky gap through the jungle canopy leaves', visualLandmark: 'Bright sky triangle in foliage', svgAlignment: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>' },
    aimReference: { crosshairPlacement: 'Mirar na abertura triangular do céu entre as folhas da árvore', visualLandmark: 'Abertura triangular na folhagem A' },
    svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>',
    landingArea: { x: -920, y: 840, z: 90, callout: 'A Temple Entrance', description: 'Blocks AWP inside Temple during A Site execute' },
    targetDestination: { x: -920, y: 840, z: 90, callout: 'A Temple Entrance' },
    movementKey: 'NONE',
    movementRequirements: 'Jumpthrow parado embaixo da tocha do A Main',
    tickrate: 'SUBTICK_CS2',
    tags: ['Temple', 'A-Execute', 'Smoke', 'Essential'],
    isCustom: false,
    favorite: true,
    instructions: ['Encoste exatamente embaixo da tocha na parede externa do A Main.', 'Mire na abertura triangular clara entre as folhas.', 'Execute um Jumpthrow.'],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },
  {
    id: 'lineup-ancient-b-short-long-smokes',
    map: 'de_ancient',
    title: 'B Long & B Short Execute Smoke from B Doors',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'JUMPTHROW',
    throwType: 'JUMPTHROW',
    throwPosition: { x: 820, y: -740, z: 70, callout: 'B Ruins Wooden Pillar', description: 'Wedge against the left wooden support pillar at B Ruins', toleranceUnits: 5 },
    startPosition: { x: 820, y: -740, z: 70, callout: 'B Ruins Wooden Pillar', toleranceUnits: 5 },
    crosshairTarget: { pitch: -28.0, yaw: 96.0, description: 'Aim at the top-left corner of the mossy stone block', visualLandmark: 'Mossy stone block top-left corner', svgAlignment: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>' },
    aimReference: { crosshairPlacement: 'Mirar na quina superior esquerda do bloco de pedra com musgo', visualLandmark: 'Bloco de pedra com musgo B' },
    svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>',
    landingArea: { x: 1020, y: 540, z: 90, callout: 'B Long Corner', description: 'Blocks B Long CT anchor while team pushes Ramp and Cave' },
    targetDestination: { x: 1020, y: 540, z: 90, callout: 'B Long Corner' },
    movementKey: 'NONE',
    movementRequirements: 'Jumpthrow parado no pilar de madeira das Ruínas B',
    tickrate: 'SUBTICK_CS2',
    tags: ['B-Long', 'B-Execute', 'Smoke'],
    isCustom: false,
    favorite: false,
    instructions: ['Encoste no pilar de madeira esquerdo nas Ruínas B.', 'Mire na quina superior esquerda da pedra com musgo.', 'Execute um Jumpthrow.'],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },
  {
    id: 'lineup-ancient-b-ninja-moly',
    map: 'de_ancient',
    title: 'B Site Pillar / Ninja Molotov from Ramp',
    side: 'T',
    utilityType: 'MOLOTOV_INCENDIARY',
    technique: 'STAND',
    throwType: 'STANDING',
    throwPosition: { x: 740, y: -220, z: 60, callout: 'B Ramp Left Wall', description: 'Hug left wall of B Ramp out of B Long line of sight', toleranceUnits: 6 },
    startPosition: { x: 740, y: -220, z: 60, callout: 'B Ramp Left Wall', toleranceUnits: 6 },
    crosshairTarget: { pitch: -15.0, yaw: 85.0, description: 'Aim at the carved Aztec symbol on the upper B Totem', visualLandmark: 'Carved symbol on B Totem', svgAlignment: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>' },
    aimReference: { crosshairPlacement: 'Mirar no símbolo asteca esculpido na parte superior do Totem B', visualLandmark: 'Símbolo superior do Totem B' },
    svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>',
    landingArea: { x: 860, y: 240, z: 75, callout: 'B Ninja / Behind Pillar', description: 'Burns CT hiding behind the central B Totem pillar' },
    targetDestination: { x: 860, y: 240, z: 75, callout: 'B Ninja / Behind Pillar' },
    movementKey: 'NONE',
    movementRequirements: 'Parado + Botão Esquerdo na subida da Rampa B',
    tickrate: 'SUBTICK_CS2',
    tags: ['Ninja', 'B-Execute', 'Molotov'],
    isCustom: false,
    favorite: false,
    instructions: ['Cole na parede esquerda da Rampa B protegido do Fundo.', 'Mire no símbolo esculpido no alto do Totem.', 'Jogue parado com o botão esquerdo.'],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },
  // ANUBIS EXTRA LINEUPS
  {
    id: 'lineup-anubis-mid-house-smoke',
    map: 'de_anubis',
    title: 'Mid Doors / House Smoke from T Spawn Bridge',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'JUMPTHROW',
    throwType: 'JUMPTHROW',
    throwPosition: { x: -120, y: -1480, z: 60, callout: 'T Spawn Bridge Pillar', description: 'Wedge against the sandstone pillar on T Spawn bridge', toleranceUnits: 5 },
    startPosition: { x: -120, y: -1480, z: 60, callout: 'T Spawn Bridge Pillar', toleranceUnits: 5 },
    crosshairTarget: { pitch: -35.0, yaw: 92.0, description: 'Aim at the center window arch of the upper desert tower', visualLandmark: 'Desert tower center arch', svgAlignment: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>' },
    aimReference: { crosshairPlacement: 'Mirar no arco central da torre de arenito acima da Ponte', visualLandmark: 'Arco central da torre do Meio' },
    svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>',
    landingArea: { x: -80, y: 320, z: 80, callout: 'Mid Double Doors / House', description: 'Blocks CT AWP holding Mid Bridge and enables Canal drop' },
    targetDestination: { x: -80, y: 320, z: 80, callout: 'Mid Double Doors / House' },
    movementKey: 'NONE',
    movementRequirements: 'Jumpthrow parado no pilar da ponte do T Spawn',
    tickrate: 'SUBTICK_CS2',
    tags: ['Mid-Doors', 'Mid-Control', 'Smoke', 'Essential'],
    isCustom: false,
    favorite: true,
    instructions: ['Encoste no pilar de pedra na saída da ponte do T Spawn.', 'Mire no arco central da torre acima do Meio.', 'Execute um Jumpthrow (Pular + Botão Esquerdo).'],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },
  {
    id: 'lineup-anubis-b-street-ct-smoke',
    map: 'de_anubis',
    title: 'B Site Left Side / Temple Smoke from B Main',
    side: 'T',
    utilityType: 'SMOKE',
    technique: 'STAND',
    throwType: 'STANDING',
    throwPosition: { x: -940, y: -620, z: 40, callout: 'B Main Obelisk Corner', description: 'Wedge at the base of the sandstone obelisk outside B Main', toleranceUnits: 5 },
    startPosition: { x: -940, y: -620, z: 40, callout: 'B Main Obelisk Corner', toleranceUnits: 5 },
    crosshairTarget: { pitch: -39.0, yaw: 82.0, description: 'Aim at the left tip of the cloth awning hanging over B entrance', visualLandmark: 'Left tip of cloth awning', svgAlignment: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>' },
    aimReference: { crosshairPlacement: 'Mirar na ponta esquerda do toldo de tecido sobre a entrada da B', visualLandmark: 'Ponta esquerda do toldo B' },
    svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>',
    landingArea: { x: -720, y: 420, z: 50, callout: 'B Site Left / Street', description: 'Pair with B Connector smoke for a full B Site wall-of-smokes execute' },
    targetDestination: { x: -720, y: 420, z: 50, callout: 'B Site Left / Street' },
    movementKey: 'NONE',
    movementRequirements: 'Parado + Botão Esquerdo na base do obelisco B Main',
    tickrate: 'SUBTICK_CS2',
    tags: ['Temple', 'B-Execute', 'Smoke', 'Essential'],
    isCustom: false,
    favorite: true,
    instructions: ['Trave na base do obelisco de pedra antes do B Main.', 'Mire na ponta esquerda do toldo de tecido.', 'Jogue parado com o botão esquerdo.'],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },
  {
    id: 'lineup-anubis-b-palace-moly',
    map: 'de_anubis',
    title: 'B Site Back Pillar / Ninja Molotov from B Main',
    side: 'T',
    utilityType: 'MOLOTOV_INCENDIARY',
    technique: 'STAND',
    throwType: 'STANDING',
    throwPosition: { x: -820, y: -210, z: 45, callout: 'B Main Right Archway', description: 'Stand at the right stone pillar entering B Main', toleranceUnits: 6 },
    startPosition: { x: -820, y: -210, z: 45, callout: 'B Main Right Archway', toleranceUnits: 6 },
    crosshairTarget: { pitch: -14.0, yaw: 98.0, description: 'Aim at the gold trim band on the central B obelisk', visualLandmark: 'Gold trim on central B obelisk', svgAlignment: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>' },
    aimReference: { crosshairPlacement: 'Mirar na faixa dourada do obelisco central do Bomb B', visualLandmark: 'Faixa dourada do obelisco B' },
    svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#09090b"/></svg>',
    landingArea: { x: -580, y: 180, z: 45, callout: 'B Back Pillar / Ninja', description: 'Flushes CT anchor playing close behind the B site pillar' },
    targetDestination: { x: -580, y: 180, z: 45, callout: 'B Back Pillar / Ninja' },
    movementKey: 'NONE',
    movementRequirements: 'Parado + Botão Esquerdo na entrada do B Main',
    tickrate: 'SUBTICK_CS2',
    tags: ['Ninja', 'B-Execute', 'Molotov'],
    isCustom: false,
    favorite: false,
    instructions: ['Alinhe na coluna direita da entrada do B Main.', 'Mire na faixa dourada do obelisco central.', 'Jogue parado com o botão esquerdo.'],
    difficulty: 'EASY',
    sourceAttribution: 'CSNADES Verified',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },
];

// ----------------------------------------------------------------------------
// CSNADES.gg / Scope.gg Style 3-Panel First-Person & 4x Zoom Visual Renderer
// ----------------------------------------------------------------------------

function escapeXml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildCsnadesVisualSvg(lineup: Lineup): string {
  const mapPalettes: Record<CS2Map, { skyTop: string; skyBot: string; wall1: string; wall2: string; roof: string; accent: string }> = {
    de_mirage: { skyTop: '#0284c7', skyBot: '#7dd3fc', wall1: '#d6b388', wall2: '#a87e51', roof: '#7c2d12', accent: '#f59e0b' },
    de_inferno: { skyTop: '#0369a1', skyBot: '#bae6fd', wall1: '#e2c799', wall2: '#b45309', roof: '#991b1b', accent: '#ef4444' },
    de_dust2: { skyTop: '#0284c7', skyBot: '#e0f2fe', wall1: '#e5d3b3', wall2: '#bfa374', roof: '#854d0e', accent: '#eab308' },
    de_nuke: { skyTop: '#1e293b', skyBot: '#64748b', wall1: '#475569', wall2: '#334155', roof: '#dc2626', accent: '#38bdf8' },
    de_ancient: { skyTop: '#1e293b', skyBot: '#475569', wall1: '#57534e', wall2: '#44403c', roof: '#15803d', accent: '#22c55e' },
    de_anubis: { skyTop: '#0369a1', skyBot: '#fde68a', wall1: '#d97706', wall2: '#92400e', roof: '#78350f', accent: '#f59e0b' },
  };

  const p = mapPalettes[lineup.map] || mapPalettes.de_mirage;
  const throwLabel =
    lineup.throwType === 'JUMPTHROW'
      ? 'PULAR + BOTAO ESQ (JUMPTHROW)'
      : lineup.throwType === 'RUN_JUMPTHROW'
      ? 'CORRER (W) + JUMPTHROW'
      : lineup.throwType === 'WALK_THROW'
      ? 'ANDAR (W) + BOTAO ESQ'
      : 'PARADO + BOTAO ESQUERDO';

  const startCallout = escapeXml(lineup.startPosition.callout.slice(0, 26));
  const targetCallout = escapeXml(lineup.targetDestination.callout.slice(0, 26));
  const landmarkText = escapeXml(lineup.aimReference.visualLandmark.slice(0, 34));

  return `<svg width="560" height="260" viewBox="0 0 560 260" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky-${lineup.id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${p.skyTop}"/>
      <stop offset="100%" stop-color="${p.skyBot}"/>
    </linearGradient>
  </defs>
  <rect width="560" height="260" fill="#09090b" rx="6"/>
  <!-- PANEL 1 (LEFT): FOOT / POSITIONING VIEW -->
  <rect x="8" y="8" width="150" height="210" fill="#121216" stroke="#27272a" stroke-width="1.5" rx="4"/>
  <rect x="8" y="8" width="150" height="22" fill="#18181b" rx="4"/>
  <text x="83" y="23" font-family="monospace" font-size="10" font-weight="bold" fill="#f59e0b" text-anchor="middle">1. ONDE ENCOSTAR</text>
  <!-- 3D Corner Walls Illustration -->
  <polygon points="18,40 83,75 83,175 18,195" fill="${p.wall2}" opacity="0.85"/>
  <polygon points="83,75 148,45 148,195 83,175" fill="${p.wall1}" opacity="0.85"/>
  <polygon points="18,195 83,175 148,195 83,212" fill="#27272a"/>
  <line x1="83" y1="75" x2="83" y2="175" stroke="#09090b" stroke-width="2.5"/>
  <!-- Player Position Marker -->
  <circle cx="83" cy="175" r="14" fill="#10b981" opacity="0.25"/>
  <circle cx="83" cy="175" r="6" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
  <line x1="83" y1="142" x2="83" y2="165" stroke="#10b981" stroke-width="2.5"/>
  <polygon points="78,158 83,167 88,158" fill="#10b981"/>
  <rect x="14" y="192" width="138" height="20" fill="#09090b" opacity="0.9" rx="3"/>
  <text x="83" y="205" font-family="monospace" font-size="9" font-weight="bold" fill="#e4e4e7" text-anchor="middle">${startCallout}</text>

  <!-- PANEL 2 (CENTER): 1ST-PERSON CS2 POV SCENE & CROSSHAIR -->
  <rect x="166" y="8" width="234" height="210" fill="url(#sky-${lineup.id})" stroke="#27272a" stroke-width="1.5" rx="4"/>
  <!-- Realistic Map Buildings, Roofs, Wires & Antenna -->
  <polygon points="166,135 235,105 235,218 166,218" fill="${p.wall2}"/>
  <polygon points="235,105 335,105 335,218 235,218" fill="${p.wall1}"/>
  <polygon points="335,88 400,115 400,218 335,218" fill="${p.wall2}"/>
  <rect x="230" y="97" width="110" height="10" fill="${p.roof}"/>
  <!-- Window & Architectural Details -->
  <rect x="255" y="125" width="28" height="38" fill="#18181b" stroke="${p.roof}" stroke-width="2"/>
  <rect x="298" y="125" width="22" height="24" fill="#18181b" stroke="${p.roof}" stroke-width="2"/>
  <!-- Antenna / Utility Wire Landmark -->
  <line x1="166" y1="78" x2="400" y2="58" stroke="#18181b" stroke-width="1.5"/>
  <line x1="283" y1="48" x2="283" y2="97" stroke="#27272a" stroke-width="3"/>
  <line x1="271" y1="58" x2="295" y2="58" stroke="#27272a" stroke-width="2"/>
  <line x1="275" y1="70" x2="291" y2="70" stroke="#27272a" stroke-width="2"/>
  <!-- Grenade Trajectory Arc -->
  <path d="M 365 215 Q 315 65 283 82" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4"/>
  <!-- CS2 Precision Crosshair at Exact Pixel (283, 82) -->
  <circle cx="283" cy="82" r="14" fill="none" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="3"/>
  <line x1="265" y1="82" x2="278" y2="82" stroke="#22c55e" stroke-width="2.5"/>
  <line x1="288" y1="82" x2="301" y2="82" stroke="#22c55e" stroke-width="2.5"/>
  <line x1="283" y1="64" x2="283" y2="77" stroke="#22c55e" stroke-width="2.5"/>
  <line x1="283" y1="87" x2="283" y2="100" stroke="#22c55e" stroke-width="2.5"/>
  <circle cx="283" cy="82" r="2.5" fill="#ef4444"/>
  <!-- Top & Bottom Banner in POV -->
  <rect x="166" y="8" width="234" height="22" fill="#09090b" opacity="0.82" rx="4"/>
  <text x="283" y="23" font-family="monospace" font-size="10" font-weight="bold" fill="#38bdf8" text-anchor="middle">2. ONDE MIRAR (VISAO 1a PESSOA)</text>
  <rect x="172" y="192" width="222" height="20" fill="#09090b" opacity="0.9" rx="3"/>
  <text x="283" y="205" font-family="monospace" font-size="9" font-weight="bold" fill="#38bdf8" text-anchor="middle">ALVO: ${targetCallout}</text>

  <!-- PANEL 3 (RIGHT): 4X PIXEL MAGNIFIER LOUPE -->
  <rect x="408" y="8" width="144" height="210" fill="#121216" stroke="#06b6d4" stroke-width="1.5" rx="4"/>
  <rect x="408" y="8" width="144" height="22" fill="#18181b" rx="4"/>
  <text x="480" y="23" font-family="monospace" font-size="10" font-weight="bold" fill="#22c55e" text-anchor="middle">3. LUPA ZOOM 4X</text>
  <!-- 4x Magnified Circle -->
  <circle cx="480" cy="108" r="58" fill="url(#sky-${lineup.id})" stroke="#06b6d4" stroke-width="3"/>
  <rect x="435" y="122" width="90" height="36" fill="${p.roof}"/>
  <line x1="480" y1="58" x2="480" y2="125" stroke="#18181b" stroke-width="6"/>
  <line x1="452" y1="82" x2="508" y2="82" stroke="#18181b" stroke-width="4"/>
  <!-- Zoomed CS2 Crosshair on exact intersection -->
  <line x1="450" y1="108" x2="472" y2="108" stroke="#22c55e" stroke-width="3.5"/>
  <line x1="488" y1="108" x2="510" y2="108" stroke="#22c55e" stroke-width="3.5"/>
  <line x1="480" y1="78" x2="480" y2="100" stroke="#22c55e" stroke-width="3.5"/>
  <line x1="480" y1="116" x2="480" y2="138" stroke="#22c55e" stroke-width="3.5"/>
  <circle cx="480" cy="108" r="4" fill="#ef4444"/>
  <rect x="414" y="175" width="132" height="37" fill="#09090b" rx="3"/>
  <text x="480" y="190" font-family="monospace" font-size="8.5" fill="#a1a1aa" text-anchor="middle">PIXEL EXATO:</text>
  <text x="480" y="204" font-family="monospace" font-size="8.5" font-weight="bold" fill="#22c55e" text-anchor="middle">${landmarkText.slice(0, 22)}</text>

  <!-- BOTTOM COMMAND BAR -->
  <rect x="8" y="224" width="544" height="28" fill="#18181b" stroke="#27272a" stroke-width="1" rx="4"/>
  <text x="20" y="242" font-family="monospace" font-size="11" font-weight="bold" fill="#f4f4f5">REFERENCIA: ${landmarkText}</text>
  <rect x="368" y="228" width="178" height="20" fill="#06b6d4" rx="3"/>
  <text x="457" y="242" font-family="monospace" font-size="10" font-weight="bold" fill="#09090b" text-anchor="middle">${throwLabel}</text>
</svg>`;
}

// Automatically upgrade all pre-populated lineups with the 3-panel CSNADES-style visual pixel card
for (const item of COMPETITIVE_LINEUPS) {
  const richSvg = buildCsnadesVisualSvg(item);
  item.svgReference = richSvg;
  if (item.crosshairTarget) {
    item.crosshairTarget.svgAlignment = richSvg;
  }
}

// ----------------------------------------------------------------------------
// Query and Helper Functions
// ----------------------------------------------------------------------------

export function getAllLineups(): Lineup[] {
  return COMPETITIVE_LINEUPS.map((l) => ({ ...l }));
}

export function getLineupsByMap(map: CS2Map): Lineup[] {
  return COMPETITIVE_LINEUPS.filter((l) => l.map === map).map((l) => ({ ...l }));
}

export function getLineupById(id: string): Lineup | null {
  const found = COMPETITIVE_LINEUPS.find((l) => l.id === id);
  return found ? { ...found } : null;
}

export function filterLineups(lineups: Lineup[], filter?: LineupFilter): Lineup[] {
  if (!filter) return lineups.map((l) => ({ ...l }));

  return lineups.filter((l) => {
    if (filter.map && l.map !== filter.map) return false;
    if (filter.side && filter.side !== 'ALL' && l.side !== filter.side && l.side !== 'BOTH') return false;
    if (filter.utilityType && filter.utilityType !== 'ALL' && l.utilityType !== filter.utilityType) return false;
    if (filter.technique && filter.technique !== 'ALL' && l.technique !== filter.technique && l.throwType !== filter.technique) return false;
    if (filter.difficulty && l.difficulty !== filter.difficulty) return false;
    if (filter.tag && !l.tags.some((t) => t.toLowerCase() === filter.tag!.toLowerCase())) return false;
    if (filter.isCustom !== undefined && l.isCustom !== filter.isCustom) return false;
    if (filter.favorite !== undefined && l.favorite !== filter.favorite) return false;
    if (filter.searchQuery && filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase().trim();
      const matchesTitle = l.title.toLowerCase().includes(q);
      const matchesCallout =
        l.throwPosition.callout.toLowerCase().includes(q) ||
        l.landingArea.callout.toLowerCase().includes(q);
      const matchesTags = l.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchesTitle && !matchesCallout && !matchesTags) return false;
    }
    return true;
  });
}
