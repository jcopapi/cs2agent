/**
 * CS2 Assistant - Pre-Populated Strategy Database
 * File: src/core/utility/strategy-database.ts
 *
 * Multi-phase tactical strategies across Active Duty maps, with role assignments,
 * linked lineup IDs, timings, synchronization gates, steps, and failure contingencies.
 * Explicitly covers all 4 tactical tiers: BASIC, INTERMEDIATE, ADVANCED, and COORDINATED.
 */

import type { Strategy, CS2Map, StrategyFilter } from './types';

export const COMPETITIVE_STRATEGIES: Strategy[] = [
  // --------------------------------------------------------------------------
  // TIER: COORDINATED (Flagship Strategy)
  // MIRAGE: A Site 3-Man Synchronized Retake
  // --------------------------------------------------------------------------
  {
    id: 'strat-mirage-a-retake',
    name: 'Mirage A Site 3-Man Synchronized Retake',
    map: 'de_mirage',
    side: 'CT',
    objective: 'Re-take A site control from CT Spawn, Connector, and Jungle with synchronized utility to isolate Palace, flash site defenders, and stick defuse.',
    difficulty: 'COORDINATED',
    requiredUtility: ['SMOKE', 'FLASHBANG', 'MOLOTOV_INCENDIARY'],
    recommendedRoles: ['Anchor', 'Support', 'Rotator', 'Entry'],
    phases: [
      {
        phaseNumber: 1,
        phaseId: 'phase-mirage-retake-init',
        phaseType: 'RETAKE_INITIATION',
        name: 'Palace Isolation & Angle Priming',
        timingSeconds: 0.0,
        durationSeconds: 2.0,
        instructions: 'Anchor throws Stairs/Palace isolation smoke from CT Spawn. Rotator secures Connector and holds Underpass rotation.',
        gates: [
          {
            gateId: 'gate-smoke-thrown',
            type: 'ALL_LINEUPS_EXECUTED',
            description: 'Wait for Support/Anchor Stairs smoke throw release.',
            requiredLineupIds: ['lineup-mirage-a-stairs'],
          },
        ],
        linkedLineupIds: ['lineup-mirage-a-stairs'],
        steps: [
          {
            stepId: 'step-retake-smoke-stairs',
            phaseNumber: 1,
            timingOffsetSeconds: 0.0,
            durationSeconds: 1.5,
            role: 'Support',
            actionType: 'THROW_UTILITY',
            lineupId: 'lineup-mirage-a-stairs',
            targetCallout: 'Stairs / Palace Exit',
            description: 'Deploy deep Stairs smoke from Ticket Booth to blind Palace lurk and isolate bomb site.',
            isParallelWith: ['step-retake-prime-connector'],
          },
          {
            stepId: 'step-retake-prime-connector',
            phaseNumber: 1,
            timingOffsetSeconds: 0.0,
            durationSeconds: 2.0,
            role: 'Rotator',
            actionType: 'HOLD_ANGLE',
            targetCallout: 'Connector / Underpass',
            description: 'Clear Connector, check Underpass push, and line up Jungle popflash.',
            isParallelWith: ['step-retake-smoke-stairs'],
          },
        ],
      },
      {
        phaseNumber: 2,
        phaseId: 'phase-mirage-retake-flash-entry',
        phaseType: 'FLASH_ENTRY',
        name: 'Airburst Popflash & Palace Balcony Clear',
        timingSeconds: 2.0,
        durationSeconds: 2.5,
        instructions: 'Popflash over scaffolding roof lip. Rotator flushes Palace balcony with molotov. Entry pushes out of Ticket simultaneously as flash detonates.',
        gates: [
          {
            gateId: 'gate-smoke-bloomed',
            type: 'TIME_ELAPSED',
            description: 'Wait t=2.0s for Stairs smoke to bloom before flashing.',
            thresholdSeconds: 2.0,
          },
        ],
        linkedLineupIds: ['lineup-mirage-a-retake-flash'],
        steps: [
          {
            stepId: 'step-retake-flash-airburst',
            phaseNumber: 2,
            timingOffsetSeconds: 2.0,
            durationSeconds: 1.0,
            role: 'Support',
            actionType: 'THROW_UTILITY',
            lineupId: 'lineup-mirage-a-retake-flash',
            targetCallout: 'A Site Center Scaffolding',
            description: 'Throw high airburst popflash over scaffolding from Ticket Booth (detonates at t=2.8s).',
            prerequisiteStepIds: ['step-retake-smoke-stairs'],
          },
          {
            stepId: 'step-retake-entry-push',
            phaseNumber: 2,
            timingOffsetSeconds: 3.0,
            durationSeconds: 1.5,
            role: 'Entry',
            actionType: 'PUSH_SITE',
            targetCallout: 'Default & Triple Box',
            description: 'Push out from Ticket on the popflash blind window. Clear Triple Box and Firebox.',
            prerequisiteStepIds: ['step-retake-flash-airburst'],
          },
        ],
      },
      {
        phaseNumber: 3,
        phaseId: 'phase-mirage-retake-clear-defuse',
        phaseType: 'SITE_CLEAR',
        name: 'Crossfire Clear & Defusal Initiation',
        timingSeconds: 4.5,
        durationSeconds: 5.5,
        instructions: 'Clear Ninja and Shadow. Stick 5-second kit defusal under Stairs smoke screen. Support & Rotator establish crossfire toward Ramp and Palace.',
        gates: [
          {
            gateId: 'gate-site-clear',
            type: 'MANUAL_TRIGGER',
            description: 'Callout "Site clear - sticking defuse".',
          },
        ],
        linkedLineupIds: [],
        steps: [
          {
            stepId: 'step-retake-clear-ninja',
            phaseNumber: 3,
            timingOffsetSeconds: 4.5,
            durationSeconds: 1.0,
            role: 'Entry',
            actionType: 'CLEAR_POSITION',
            targetCallout: 'Ninja Box / Firebox',
            description: 'Check behind Ninja Box and Firebox corner for hiding Ts.',
            prerequisiteStepIds: ['step-retake-entry-push'],
          },
          {
            stepId: 'step-retake-stick-defuse',
            phaseNumber: 3,
            timingOffsetSeconds: 5.5,
            durationSeconds: 5.0,
            role: 'Anchor',
            actionType: 'START_DEFUSE',
            targetCallout: 'Default Bomb Site (A)',
            description: 'Stick defuse immediately with kit (5 seconds). Smokescreen covers from Palace.',
            prerequisiteStepIds: ['step-retake-clear-ninja'],
          },
          {
            stepId: 'step-retake-lock-crossfire',
            phaseNumber: 3,
            timingOffsetSeconds: 5.5,
            durationSeconds: 5.0,
            role: 'Support',
            actionType: 'HOLD_ANGLE',
            targetCallout: 'A Ramp & Palace',
            description: 'Hold post-entry crossfire angle on Ramp push and Palace smoke edge.',
            isParallelWith: ['step-retake-stick-defuse'],
          },
        ],
      },
    ],
    contingencies: [
      {
        trigger: 'Stairs smoke misses or blooms late',
        action: 'Hold Ticket shoulder peek; Rotator drops secondary Connector smoke before pushing.',
        fallbackPhaseNumber: 1,
      },
      {
        trigger: 'Entry player killed at Ticket entrance',
        action: 'Rotator instantly trades from Jungle; Support assumes defusal role.',
        fallbackPhaseNumber: 3,
      },
      {
        trigger: 'Opponent molotov lands on bomb during defusal',
        action: 'Support deploys extinguishing smoke onto bomb; re-stick 5-second defuse.',
      },
    ],
    coordinationNotes: 'Comms sequence: 1. "Smoking Stairs now" -> 2. "Flashing site in 3, 2, 1, GO" -> 3. "Site clear, defusing — cover Ramp!"',
    sourceAttribution: 'CS2 Competitive Playbook / Scope.gg / CSNADES',
    tags: ['Retake', 'A-Site', 'Essential', 'Coordinated'],
    isCustom: false,
    favorite: false,
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-19',
  },

  // --------------------------------------------------------------------------
  // TIER: ADVANCED
  // MIRAGE: A Site Classic 3-Smoke Execute
  // --------------------------------------------------------------------------
  {
    id: 'strat-mirage-a-execute',
    name: 'Mirage A Site Classic 3-Smoke Execute',
    map: 'de_mirage',
    side: 'T',
    objective: 'Simultaneous 3-smoke wall covering CT Spawn, Jungle, and Stairs for clean A site plant',
    difficulty: 'ADVANCED',
    requiredUtility: ['SMOKE', 'FLASHBANG'],
    recommendedRoles: ['Support', 'Entry', 'Lurk', 'Anchor'],
    phases: [
      {
        phaseNumber: 1,
        name: 'Simultaneous Utility Throw',
        timingSeconds: 0,
        linkedLineupIds: [
          'lineup-mirage-a-stairs',
          'lineup-mirage-a-jungle',
          'lineup-mirage-a-ct-box',
        ],
        instructions: 'Count down 3-2-1 from T Roof and T Spawn. Release all three smokes simultaneously.',
        keyCallout: 'T Roof / A Ramp',
        steps: [
          {
            stepId: 'step-a-exec-stairs',
            phaseNumber: 1,
            timingOffsetSeconds: 0,
            durationSeconds: 1.5,
            role: 'Support',
            actionType: 'THROW_UTILITY',
            lineupId: 'lineup-mirage-a-stairs',
            targetCallout: 'A Stairs',
            description: 'Throw Stairs smoke from T Roof.',
          },
          {
            stepId: 'step-a-exec-jungle',
            phaseNumber: 1,
            timingOffsetSeconds: 0,
            durationSeconds: 1.5,
            role: 'Anchor',
            actionType: 'THROW_UTILITY',
            lineupId: 'lineup-mirage-a-jungle',
            targetCallout: 'Jungle / Con',
            description: 'Throw Jungle smoke from T Roof pillar.',
          },
          {
            stepId: 'step-a-exec-ct',
            phaseNumber: 1,
            timingOffsetSeconds: 0,
            durationSeconds: 1.5,
            role: 'Lurk',
            actionType: 'THROW_UTILITY',
            lineupId: 'lineup-mirage-a-ct-box',
            targetCallout: 'CT Spawn',
            description: 'Jumpthrow CT smoke from T Spawn trash can.',
          },
        ],
      },
      {
        phaseNumber: 2,
        name: 'High Ramp Flash & Entry',
        timingSeconds: 4,
        linkedLineupIds: [],
        instructions: 'Throw flashbang high over A Ramp scaffolding. Entries clear Sandbags, Sandwich, and Default.',
        keyCallout: 'A Ramp Entrance',
        steps: [
          {
            stepId: 'step-a-exec-flash',
            phaseNumber: 2,
            timingOffsetSeconds: 4,
            durationSeconds: 1.5,
            role: 'Support',
            actionType: 'THROW_UTILITY',
            targetCallout: 'A Ramp Airburst',
            description: 'Flash high over scaffolding.',
            prerequisiteStepIds: ['step-a-exec-stairs'],
          },
          {
            stepId: 'step-a-exec-entry',
            phaseNumber: 2,
            timingOffsetSeconds: 5,
            durationSeconds: 2.5,
            role: 'Entry',
            actionType: 'PUSH_SITE',
            targetCallout: 'A Site Default',
            description: 'Push out of Ramp and clear Sandwich and Tetris.',
            prerequisiteStepIds: ['step-a-exec-flash'],
          },
        ],
      },
      {
        phaseNumber: 3,
        name: 'Default Plant & Post-Plant Crossfire',
        timingSeconds: 8,
        linkedLineupIds: [],
        instructions: 'Plant bomb safely for Palace and Ramp. Set up Tetris and Palace crossfire.',
        keyCallout: 'Default Plant',
        steps: [
          {
            stepId: 'step-a-exec-plant',
            phaseNumber: 3,
            timingOffsetSeconds: 8,
            durationSeconds: 4.0,
            role: 'Anchor',
            actionType: 'START_PLANT',
            targetCallout: 'A Default Plant',
            description: 'Plant bomb for Palace and Ramp.',
            prerequisiteStepIds: ['step-a-exec-entry'],
          },
        ],
      },
    ],
    contingencies: [
      { trigger: 'CT pushes through smoke', action: 'Hold pre-aim on Stairs and CT edge; do not rush blindly.' },
      { trigger: 'Heavy CT HE grenade stack on Ramp', action: 'Wait 3 seconds for utility dissipation before committing.' },
    ],
    coordinationNotes: 'Synchronized smoke countdown is crucial so all 3 smokes blossom within 1 second.',
    sourceAttribution: 'CSNADES Playbook / ESL Pro League',
    tags: ['A-Execute', 'Smokes', 'Default', 'Advanced'],
    isCustom: false,
    favorite: false,
  },

  // --------------------------------------------------------------------------
  // TIER: INTERMEDIATE
  // INFERNO: Banana Control & B Site Entry
  // --------------------------------------------------------------------------
  {
    id: 'strat-inferno-b-execute',
    name: 'Inferno B Site Execute with Coffins & CT Smokes',
    map: 'de_inferno',
    side: 'T',
    objective: 'Secure Banana control, smoke CT & Coffins, molotov New Box, and plant on B',
    difficulty: 'INTERMEDIATE',
    requiredUtility: ['SMOKE', 'MOLOTOV_INCENDIARY', 'FLASHBANG'],
    recommendedRoles: ['Entry', 'Support', 'Anchor'],
    phases: [
      {
        phaseNumber: 1,
        name: 'Banana Deep Utility',
        timingSeconds: 0,
        linkedLineupIds: [
          'lineup-inferno-b-coffins',
          'lineup-inferno-b-ct-smoke',
          'lineup-inferno-b-newbox-moly',
        ],
        instructions: 'Throw Coffins and CT smokes from Logs and Car. Follow up with New Box molotov.',
        keyCallout: 'Banana Car',
        steps: [
          {
            stepId: 'step-inf-coffins',
            phaseNumber: 1,
            timingOffsetSeconds: 0,
            durationSeconds: 2.0,
            role: 'Support',
            actionType: 'THROW_UTILITY',
            lineupId: 'lineup-inferno-b-coffins',
            targetCallout: 'Coffins',
            description: 'Smoke Coffins from Banana Logs.',
          },
          {
            stepId: 'step-inf-ct',
            phaseNumber: 1,
            timingOffsetSeconds: 0.5,
            durationSeconds: 2.0,
            role: 'Anchor',
            actionType: 'THROW_UTILITY',
            lineupId: 'lineup-inferno-b-ct-smoke',
            targetCallout: 'CT Entrance',
            description: 'Smoke CT from Banana Car.',
          },
          {
            stepId: 'step-inf-newbox',
            phaseNumber: 1,
            timingOffsetSeconds: 1.0,
            durationSeconds: 2.0,
            role: 'Entry',
            actionType: 'THROW_UTILITY',
            lineupId: 'lineup-inferno-b-newbox-moly',
            targetCallout: 'New Box',
            description: 'Molotov New Box to flush out anchor.',
          },
        ],
      },
      {
        phaseNumber: 2,
        name: 'Site Entry & Clear',
        timingSeconds: 4,
        linkedLineupIds: [],
        instructions: 'Entries clear Dark and 1st Oranges. Verify New Box is cleared by fire.',
        keyCallout: 'B Site Oranges',
        steps: [
          {
            stepId: 'step-inf-entry',
            phaseNumber: 2,
            timingOffsetSeconds: 4,
            durationSeconds: 3.0,
            role: 'Entry',
            actionType: 'PUSH_SITE',
            targetCallout: 'B Site Oranges',
            description: 'Push onto site and check 1st / 2nd Oranges.',
            prerequisiteStepIds: ['step-inf-coffins'],
          },
        ],
      },
    ],
    contingencies: [
      { trigger: 'CT smoke blossoms on Banana', action: 'Spam car corner and wait for smoke fade before running in.' },
    ],
    coordinationNotes: 'Call out New Box molotov landing before entry peeks.',
    sourceAttribution: 'CSNADES Verified Playbook',
    tags: ['B-Execute', 'Banana', 'Smokes', 'Intermediate'],
    isCustom: false,
    favorite: false,
  },

  // --------------------------------------------------------------------------
  // TIER: ADVANCED
  // DUST II: Mid-to-B Split
  // --------------------------------------------------------------------------
  {
    id: 'strat-dust2-mid-to-b',
    name: 'Dust II Mid-to-B Split with Xbox Smoke',
    map: 'de_dust2',
    side: 'T',
    objective: 'Smoke Xbox to isolate Catwalk, take Mid control, smoke B Doors from Tunnels, and pinch B site',
    difficulty: 'ADVANCED',
    requiredUtility: ['SMOKE', 'FLASHBANG'],
    recommendedRoles: ['Entry', 'Support', 'Lurk'],
    phases: [
      {
        phaseNumber: 1,
        name: 'Xbox Smoke & Mid Control',
        timingSeconds: 0,
        linkedLineupIds: ['lineup-dust2-mid-xbox'],
        instructions: 'Deploy Xbox smoke from outside Long. Take Lower Tunnels and Mid Doors control.',
        keyCallout: 'Xbox / Catwalk',
        steps: [
          {
            stepId: 'step-d2-xbox',
            phaseNumber: 1,
            timingOffsetSeconds: 0,
            durationSeconds: 2.0,
            role: 'Support',
            actionType: 'THROW_UTILITY',
            lineupId: 'lineup-dust2-mid-xbox',
            targetCallout: 'Xbox',
            description: 'Throw Xbox smoke from outside Long.',
          },
        ],
      },
      {
        phaseNumber: 2,
        name: 'Tunnel Doors Smoke & Flash',
        timingSeconds: 5,
        linkedLineupIds: ['lineup-dust2-b-doors-smoke'],
        instructions: 'Smoke B Doors from Upper Tunnels. Flash over tunnel roof onto B site.',
        keyCallout: 'Upper Tunnels',
        steps: [
          {
            stepId: 'step-d2-b-doors',
            phaseNumber: 2,
            timingOffsetSeconds: 5,
            durationSeconds: 2.0,
            role: 'Lurk',
            actionType: 'THROW_UTILITY',
            lineupId: 'lineup-dust2-b-doors-smoke',
            targetCallout: 'B Doors',
            description: 'Smoke B Doors from Upper Tunnels.',
            prerequisiteStepIds: ['step-d2-xbox'],
          },
        ],
      },
      {
        phaseNumber: 3,
        name: 'Pincer Entry & Plant',
        timingSeconds: 10,
        linkedLineupIds: [],
        instructions: 'Simultaneous entry from Mid Doors / Window and Upper Tunnels. Plant on B default.',
        keyCallout: 'B Site Platform',
        steps: [
          {
            stepId: 'step-d2-pincer',
            phaseNumber: 3,
            timingOffsetSeconds: 10,
            durationSeconds: 4.0,
            role: 'Entry',
            actionType: 'PUSH_SITE',
            targetCallout: 'B Site Platform',
            description: 'Simultaneous pinch from Mid and Tunnels.',
            prerequisiteStepIds: ['step-d2-b-doors'],
          },
        ],
      },
    ],
    contingencies: [
      { trigger: 'CT AWPer holds Mid Doors push', action: 'Flash through Mid Doors before crossing.' },
    ],
    coordinationNotes: 'Tunnels players must wait until Mid players call "Crossing Mid Doors".',
    sourceAttribution: 'Scope.gg Pro Tactics',
    tags: ['Mid-to-B', 'Split', 'Xbox', 'Advanced'],
    isCustom: false,
    favorite: false,
  },

  // --------------------------------------------------------------------------
  // TIER: COORDINATED
  // NUKE: Outside Secret Wall of Smokes
  // --------------------------------------------------------------------------
  {
    id: 'strat-nuke-outside-wall-of-smokes',
    name: 'Nuke Outside Secret Wall of Smokes',
    map: 'de_nuke',
    side: 'T',
    objective: 'Deploy 2-smoke wall cutting off Garage and Main sightlines to cross cleanly into Secret',
    difficulty: 'COORDINATED',
    requiredUtility: ['SMOKE', 'FLASHBANG'],
    recommendedRoles: ['Support', 'Entry', 'Lurk', 'Anchor'],
    phases: [
      {
        phaseNumber: 1,
        name: 'Wall of Smokes Deployment',
        timingSeconds: 0,
        linkedLineupIds: [
          'lineup-nuke-outside-cross-close',
          'lineup-nuke-outside-cross-far',
        ],
        instructions: 'Run-jumpthrow both outside smokes from T Roof at 0:00.',
        keyCallout: 'Outside Yard',
        steps: [
          {
            stepId: 'step-nuke-close-cross',
            phaseNumber: 1,
            timingOffsetSeconds: 0,
            durationSeconds: 2.0,
            role: 'Support',
            actionType: 'THROW_UTILITY',
            lineupId: 'lineup-nuke-outside-cross-close',
            targetCallout: 'Close Cross (Red Box)',
            description: 'Throw close cross smoke.',
          },
          {
            stepId: 'step-nuke-far-cross',
            phaseNumber: 1,
            timingOffsetSeconds: 0,
            durationSeconds: 2.0,
            role: 'Anchor',
            actionType: 'THROW_UTILITY',
            lineupId: 'lineup-nuke-outside-cross-far',
            targetCallout: 'Far Cross (Garage)',
            description: 'Throw far cross smoke.',
          },
        ],
      },
      {
        phaseNumber: 2,
        name: 'Yard Cross to Secret',
        timingSeconds: 4,
        linkedLineupIds: [],
        instructions: 'Cross behind the wall of smokes into Secret stairs. Check Red Box for CT push.',
        keyCallout: 'Secret Stairs',
        steps: [
          {
            stepId: 'step-nuke-cross',
            phaseNumber: 2,
            timingOffsetSeconds: 4,
            durationSeconds: 3.0,
            role: 'Entry',
            actionType: 'PUSH_SITE',
            targetCallout: 'Secret Stairs',
            description: 'Sprint into Secret behind smokes.',
            prerequisiteStepIds: ['step-nuke-close-cross'],
          },
        ],
      },
      {
        phaseNumber: 3,
        name: 'Lower B Site Control',
        timingSeconds: 10,
        linkedLineupIds: [],
        instructions: 'Descend Secret into Lower B. Plant on B Silo or Vents.',
        keyCallout: 'Lower B Site',
        steps: [
          {
            stepId: 'step-nuke-plant',
            phaseNumber: 3,
            timingOffsetSeconds: 10,
            durationSeconds: 4.0,
            role: 'Anchor',
            actionType: 'START_PLANT',
            targetCallout: 'Lower B Site',
            description: 'Take B site and plant.',
            prerequisiteStepIds: ['step-nuke-cross'],
          },
        ],
      },
    ],
    contingencies: [
      { trigger: 'CT spamming through smoke with M4/AWP', action: 'Wait 2 seconds and flash over Red container before running.' },
    ],
    coordinationNotes: 'Both smokers must throw simultaneously to prevent gap visibility.',
    sourceAttribution: 'CSNADES / HLTV Strategy Archive',
    tags: ['Outside', 'Secret', 'Wall-of-Smokes', 'Coordinated'],
    isCustom: false,
    favorite: false,
  },

  // --------------------------------------------------------------------------
  // TIER: BASIC
  // MIRAGE: Solo B Short Smoke from Back Alley
  // --------------------------------------------------------------------------
  {
    id: 'strat-mirage-b-short-basic',
    name: 'Mirage Solo B Short Smoke & Apartments Setup',
    map: 'de_mirage',
    side: 'T',
    objective: 'Deploy single isolated smoke on B Short Catwalk to deny CT aggression while preparing B Apartments push',
    difficulty: 'BASIC',
    requiredUtility: ['SMOKE'],
    recommendedRoles: ['Support'],
    phases: [
      {
        phaseNumber: 1,
        name: 'B Short Smoke Deployment',
        timingSeconds: 0,
        linkedLineupIds: ['lineup-mirage-b-short'],
        instructions: 'Wedge against cart in courtyard outside TV room and jumpthrow B Short smoke.',
        keyCallout: 'Outside B Apps',
        steps: [
          {
            stepId: 'step-b-short-smoke',
            phaseNumber: 1,
            timingOffsetSeconds: 0,
            durationSeconds: 2.0,
            role: 'Support',
            actionType: 'THROW_UTILITY',
            lineupId: 'lineup-mirage-b-short',
            targetCallout: 'B Short / Catwalk',
            description: 'Deploy B Short jumpthrow smoke.',
          },
        ],
      },
    ],
    contingencies: [
      { trigger: 'CT pushes TV room early', action: 'Cancel lineup and hold pre-aim on TV doorway.' },
    ],
    coordinationNotes: 'Solo lineup: call out "Smoking Short" to team.',
    sourceAttribution: 'CSNADES Basic Guides',
    tags: ['B-Short', 'Solo', 'Smoke', 'Basic'],
    isCustom: false,
    favorite: false,
  },
];

// ----------------------------------------------------------------------------
// Query and Helper Functions
// ----------------------------------------------------------------------------

export function getAllStrategies(): Strategy[] {
  return COMPETITIVE_STRATEGIES.map((s) => ({ ...s }));
}

export function getStrategiesByMap(map: CS2Map): Strategy[] {
  return COMPETITIVE_STRATEGIES.filter((s) => s.map === map).map((s) => ({ ...s }));
}

export function getStrategyById(id: string): Strategy | null {
  const found = COMPETITIVE_STRATEGIES.find((s) => s.id === id);
  return found ? { ...found } : null;
}

export function filterStrategies(strategies: Strategy[], filter?: StrategyFilter): Strategy[] {
  if (!filter) return strategies.map((s) => ({ ...s }));

  return strategies.filter((s) => {
    if (filter.map && s.map !== filter.map) return false;
    if (filter.side && filter.side !== 'ALL' && s.side !== filter.side && s.side !== 'BOTH') return false;
    if (filter.difficulty && filter.difficulty !== 'ALL' && s.difficulty !== filter.difficulty) return false;
    if (filter.searchQuery && filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase().trim();
      const matchesName = s.name.toLowerCase().includes(q);
      const matchesObjective = s.objective.toLowerCase().includes(q);
      const matchesTags = s.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchesName && !matchesObjective && !matchesTags) return false;
    }
    return true;
  });
}
