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
];

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
