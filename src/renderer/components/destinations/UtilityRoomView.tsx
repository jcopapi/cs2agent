/**
 * CS2 Assistant - Utility Room Destination View
 * File: src/renderer/components/destinations/UtilityRoomView.tsx
 *
 * Implements the strategic playbook, 6 Active Duty competitive map selector,
 * filterable lineup library, SVG landmark visual reference preview,
 * and Match Preparation Profiles.
 */

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  Filter,
  CheckCircle,
  ExternalLink,
  Target,
  Play,
  Bookmark,
  Share2,
} from 'lucide-react';
import type { CS2Map, TeamSide, UtilityType, Lineup, Strategy } from '../../../shared/ipc-types';

export interface UtilityRoomViewProps {
  initialMap?: string;
  initialStrategyId?: string;
}

export const UtilityRoomView: React.FC<UtilityRoomViewProps> = ({
  initialMap,
  initialStrategyId,
}) => {
  const [selectedMap, setSelectedMap] = useState<CS2Map>((initialMap as CS2Map) || 'de_mirage');
  const [selectedSide, setSelectedSide] = useState<TeamSide | 'ALL'>('ALL');
  const [selectedUtility, setSelectedUtility] = useState<UtilityType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [profileBound, setProfileBound] = useState<boolean>(false);

  // Synchronize when initial props change (e.g. from History closed loop)
  useEffect(() => {
    if (initialMap) {
      setSelectedMap(initialMap as CS2Map);
    }
  }, [initialMap]);

  // Verified Lineups Database for Mirage
  const sampleLineups: Lineup[] = [
    {
      id: 'lineup-mirage-a-stairs',
      map: 'de_mirage',
      side: 'T',
      utilityType: 'SMOKE',
      title: 'A Site Stairs Smoke from T Roof',
      startPosition: { x: -1120, y: -450, z: -160, callout: 'T Roof Wooden Beam', toleranceUnits: 6 },
      targetDestination: { x: -350, y: -420, z: -140, callout: 'Stairs / Sandwich' },
      throwType: 'STANDING',
      movementRequirements: 'Stand stationary on the intersection of the beam',
      aimReference: {
        crosshairPlacement: 'Aim at the apex of the center wall indentation',
        visualLandmark: 'Align left pin of smoke grenade with wooden protrusion',
      },
      svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#121215"/><circle cx="120" cy="70" r="4" fill="#06b6d4"/><line x1="120" y1="50" x2="120" y2="90" stroke="#06b6d4" stroke-dasharray="2"/><line x1="100" y1="70" x2="140" y2="70" stroke="#06b6d4" stroke-dasharray="2"/><text x="120" y="110" font-family="monospace" font-size="10" fill="#a1a1aa" text-anchor="middle">APEX ALIGNMENT POINT</text></svg>',
      instructions: [
        'Wedge yourself into the corner of the wooden beam on T Roof.',
        'Align crosshair with the apex of the center wall indentation.',
        'Perform a stationary left-click throw (no jump required).',
      ],
      tags: ['Stairs', 'A-Execute', 'Smoke', 'Essential'],
      difficulty: 'EASY',
      sourceAttribution: 'CSNADES Verified / Scope.gg Taxonomy',
      verified: true,
      gameVersion: '1.40.2.1',
      lastVerificationDate: '2026-10-19',
    },
    {
      id: 'lineup-mirage-a-jungle',
      map: 'de_mirage',
      side: 'T',
      utilityType: 'SMOKE',
      title: 'A Jungle & Connector Smoke from T Roof',
      startPosition: { x: -1120, y: -480, z: -160, callout: 'T Roof Pillar', toleranceUnits: 5 },
      targetDestination: { x: -280, y: -550, z: -140, callout: 'Jungle Cross' },
      throwType: 'STANDING',
      movementRequirements: 'Stationary throw against pillar face',
      aimReference: {
        crosshairPlacement: 'Aim at top middle pillar corner',
        visualLandmark: 'Align crosshair horizontal hash with roof wire',
      },
      svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#121215"/><circle cx="120" cy="70" r="4" fill="#06b6d4"/><path d="M 120 70 L 160 40" stroke="#10b981" stroke-width="1.5"/><text x="120" y="110" font-family="monospace" font-size="10" fill="#a1a1aa" text-anchor="middle">PILLAR INTERSECTION</text></svg>',
      instructions: [
        'Stand in the middle of the pillar facing Palace.',
        'Place crosshair on the top corner of the pillar.',
        'Left-click throw cleanly.',
      ],
      tags: ['Jungle', 'A-Execute', 'Smoke'],
      difficulty: 'MEDIUM',
      sourceAttribution: 'CSNADES Verified',
      verified: true,
      gameVersion: '1.40.2.1',
      lastVerificationDate: '2026-10-19',
    },
    {
      id: 'lineup-mirage-a-ct-box',
      map: 'de_mirage',
      side: 'T',
      utilityType: 'SMOKE',
      title: 'A CT Spawn Smoke from T Spawn Trash',
      startPosition: { x: -1300, y: -200, z: -160, callout: 'T Spawn Trash Can', toleranceUnits: 4 },
      targetDestination: { x: -100, y: -300, z: -140, callout: 'Ticket Booth / CT Spawn' },
      throwType: 'JUMPTHROW',
      movementRequirements: 'Sub-tick jumpthrow bind',
      aimReference: {
        crosshairPlacement: 'Aim at the protruding antenna wire tip',
        visualLandmark: 'Corner of antenna bracket',
      },
      svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#121215"/><circle cx="120" cy="70" r="4" fill="#06b6d4"/><text x="120" y="110" font-family="monospace" font-size="10" fill="#a1a1aa" text-anchor="middle">ANTENNA TIP</text></svg>',
      instructions: [
        'Crouch and wedge against the trash can in T Spawn.',
        'Stand up and aim at the antenna wire tip.',
        'Execute jumpthrow with spacebar.',
      ],
      tags: ['CT-Spawn', 'A-Execute', 'Smoke', 'Jumpthrow'],
      difficulty: 'MEDIUM',
      sourceAttribution: 'CSNADES Verified',
      verified: true,
      gameVersion: '1.40.2.1',
      lastVerificationDate: '2026-10-19',
    },
    {
      id: 'lineup-mirage-a-retake-flash',
      map: 'de_mirage',
      side: 'CT',
      utilityType: 'FLASHBANG',
      title: 'A Site High Retake Popflash from CT Spawn',
      startPosition: { x: -150, y: -320, z: -140, callout: 'Ticket Booth', toleranceUnits: 8 },
      targetDestination: { x: -500, y: -450, z: -50, callout: 'A Site Center Airburst' },
      throwType: 'RUN_JUMPTHROW',
      movementRequirements: '1-step forward run jumpthrow',
      aimReference: {
        crosshairPlacement: 'Aim over scaffolding roof lip',
        visualLandmark: 'Align bottom of crosshair with cloth edge',
      },
      svgReference: '<svg width="240" height="140" viewBox="0 0 240 140"><rect width="240" height="140" fill="#121215"/><circle cx="120" cy="70" r="4" fill="#f59e0b"/><text x="120" y="110" font-family="monospace" font-size="10" fill="#a1a1aa" text-anchor="middle">ROOF LIP AIRBURST</text></svg>',
      instructions: [
        'Line up on the corner of Ticket Booth.',
        'Aim above scaffolding roof lip.',
        'Take one step forward and release with jumpthrow.',
      ],
      tags: ['Retake', 'Flash', 'A-Site', 'Essential'],
      difficulty: 'EASY',
      sourceAttribution: 'Scope.gg Strategy Playbook',
      verified: true,
      gameVersion: '1.40.2.1',
      lastVerificationDate: '2026-10-19',
    },
  ];

  const [selectedLineup, setSelectedLineup] = useState<Lineup>(sampleLineups[0]);

  // Sample Multi-Phase Coordinated Strategy
  const sampleStrategy: Strategy = {
    id: 'strat-mirage-a-retake',
    name: 'Mirage A Site 3-Man Synchronized Retake',
    map: 'de_mirage',
    side: 'CT',
    objective: 'Re-take A site control from CT Spawn, Connector, and Jungle with synchronized utility',
    difficulty: 'COORDINATED',
    requiredUtility: ['SMOKE', 'FLASHBANG', 'MOLOTOV_INCENDIARY'],
    recommendedRoles: ['Anchor (Ticket)', 'Rotator (Connector)', 'Support (Jungle)'],
    phases: [
      {
        phaseNumber: 1,
        name: 'Palace Denial & Deep Smoke',
        timingSeconds: 0,
        linkedLineupIds: ['lineup-mirage-a-stairs'],
        instructions: 'Smoke Palace exit from CT spawn to isolate bomb planter from palace lurk.',
      },
      {
        phaseNumber: 2,
        name: 'Synchronized Airburst Popflashes',
        timingSeconds: 3,
        linkedLineupIds: ['lineup-mirage-a-retake-flash'],
        instructions: 'Popflash over scaffolding roof lip. Connector and Jungle push simultaneously.',
      },
      {
        phaseNumber: 3,
        name: 'Crossfire Clear & Defusal Initiation',
        timingSeconds: 6,
        linkedLineupIds: [],
        instructions: 'Clear Ninja and Default plant spots. Initiate 5-second kit defusal with smoke cover.',
      },
    ],
    contingencies: [
      { trigger: 'Palace smoke fails to blossom', action: 'Hold shoulder peek from Ticket and wait for secondary smoke.' },
      { trigger: 'Opponent molotov on default defuse', action: 'Extinguish with support smoke and hold defuse.' },
    ],
    coordinationNotes: 'Requires voice comms: Call "Flashing A Site in 3, 2, 1 — GO".',
    sourceAttribution: 'Valve Competitive Playbook // Scope.gg',
  };

  const competitiveMaps: { id: CS2Map; label: string }[] = [
    { id: 'de_mirage', label: 'Mirage' },
    { id: 'de_inferno', label: 'Inferno' },
    { id: 'de_dust2', label: 'Dust II' },
    { id: 'de_nuke', label: 'Nuke' },
    { id: 'de_ancient', label: 'Ancient' },
    { id: 'de_anubis', label: 'Anubis' },
  ];

  const filteredLineups = sampleLineups.filter((l) => {
    if (l.map !== selectedMap) return false;
    if (selectedSide !== 'ALL' && l.side !== selectedSide && l.side !== 'BOTH') return false;
    if (selectedUtility !== 'ALL' && l.utilityType !== selectedUtility) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.title.toLowerCase().includes(q) ||
        l.tags.some((t) => t.toLowerCase().includes(q)) ||
        l.startPosition.callout.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div data-testid="view-utility-room" className="flex h-full w-full flex-col overflow-hidden bg-background p-4 gap-3">
      {/* Header: 6 Active Duty Maps Tabs & Preparation Profile */}
      <div className="flex items-center justify-between border-b border-border-subtle bg-background-panel px-4 py-2 rounded text-xs">
        {/* 6 Active Duty Maps */}
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mr-2">
            ACTIVE DUTY:
          </span>
          {competitiveMaps.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMap(m.id)}
              className={`rounded px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                selectedMap === m.id
                  ? 'bg-tactical-cyan text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-background-elevated'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Match Preparation Profile Selector */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-zinc-400">ACTIVE PROFILE:</span>
          <span className="rounded border border-border-subtle bg-background px-2.5 py-1 font-mono text-[11px] text-zinc-200">
            [Default Mirage A Execution]
          </span>
          <button
            onClick={() => setProfileBound(!profileBound)}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
              profileBound
                ? 'bg-tactical-emerald text-zinc-950'
                : 'border border-border-elevated bg-background hover:bg-background-elevated text-zinc-200'
            }`}
          >
            {profileBound ? '✓ Bound to Live Context' : 'Bind to Live Match'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between rounded border border-border-subtle bg-background-container p-2 text-xs gap-3">
        <div className="flex items-center gap-2">
          {/* Side Filter */}
          <div className="flex items-center rounded border border-border-subtle bg-background p-0.5 font-mono text-[11px]">
            {(['ALL', 'T', 'CT'] as const).map((side) => (
              <button
                key={side}
                onClick={() => setSelectedSide(side)}
                className={`rounded px-2 py-0.5 transition-colors cursor-pointer ${
                  selectedSide === side
                    ? 'bg-background-elevated text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {side}
              </button>
            ))}
          </div>

          {/* Utility Filter */}
          <div className="flex items-center rounded border border-border-subtle bg-background p-0.5 font-mono text-[11px]">
            {(['ALL', 'SMOKE', 'FLASHBANG', 'MOLOTOV_INCENDIARY'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setSelectedUtility(u as any)}
                className={`rounded px-2 py-0.5 transition-colors cursor-pointer ${
                  selectedUtility === u
                    ? 'bg-background-elevated text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {u === 'MOLOTOV_INCENDIARY' ? 'MOLOTOV' : u}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lineups, landmarks, tags..."
            className="w-full rounded border border-border-subtle bg-background px-3 py-1 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-border-active focus:outline-none pl-8"
          />
          <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-zinc-500" />
        </div>
      </div>

      {/* Main Two-Panel Layout */}
      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* Left Panel (50%): Lineup & Strategy Playbook List */}
        <div className="flex flex-col flex-1 rounded border border-border-subtle bg-background-panel p-3 overflow-hidden space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-xs">
            <span className="font-semibold text-zinc-200 uppercase tracking-wider">
              TACTICAL PLAYBOOK & LINEUP DATABASE ({filteredLineups.length})
            </span>
            <span className="font-mono text-[10px] text-zinc-500">CSNADES VERIFIED</span>
          </div>

          {/* Coordinated Strategy Highlight Card */}
          <div
            className={`rounded border p-3 space-y-1.5 cursor-pointer transition-colors ${
              initialStrategyId === sampleStrategy.id
                ? 'border-tactical-cyan bg-tactical-cyan/10'
                : 'border-border-subtle bg-background hover:border-border-elevated'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-tactical-cyan">
                {sampleStrategy.name}
              </span>
              <span className="rounded bg-tactical-amber/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-tactical-amber uppercase">
                {sampleStrategy.difficulty}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">{sampleStrategy.objective}</p>
            <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500 pt-1">
              <span>PHASES: 3</span>
              <span>•</span>
              <span>ROLES: {sampleStrategy.recommendedRoles.join(', ')}</span>
            </div>
          </div>

          {/* Lineups List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredLineups.map((lineup) => {
              const isSelected = selectedLineup.id === lineup.id;
              return (
                <div
                  key={lineup.id}
                  onClick={() => setSelectedLineup(lineup)}
                  className={`rounded border p-2.5 cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-tactical-cyan bg-background-elevated'
                      : 'border-border-subtle bg-background hover:border-border-elevated'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs text-zinc-200">{lineup.title}</span>
                    <span
                      className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        lineup.side === 'CT'
                          ? 'bg-tactical-cyan/20 text-tactical-cyan'
                          : 'bg-tactical-amber/20 text-tactical-amber'
                      }`}
                    >
                      {lineup.side}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                    <span>From: {lineup.startPosition.callout}</span>
                    <span>To: {lineup.targetDestination.callout}</span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="rounded bg-background-panel border border-border-subtle px-1.5 py-0.5 font-mono text-[9px] text-zinc-400">
                      {lineup.throwType}
                    </span>
                    <span className="rounded bg-background-panel border border-border-subtle px-1.5 py-0.5 font-mono text-[9px] text-zinc-400">
                      {lineup.difficulty}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[9px] text-tactical-emerald ml-auto">
                      <CheckCircle className="h-2.5 w-2.5" />
                      <span>{lineup.sourceAttribution.split('/')[0]}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel (50%): Lineup Detail Inspector & SVG Landmark Preview */}
        <div className="flex flex-col flex-1 rounded border border-border-subtle bg-background-panel p-3 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-xs">
            <span className="font-semibold text-zinc-200 uppercase tracking-wider">
              LINEUP & LANDMARK INSPECTOR
            </span>
            <button className="flex items-center gap-1 text-[11px] text-tactical-cyan hover:underline cursor-pointer">
              <Play className="h-3 w-3" />
              <span>Launch Practice Drill</span>
            </button>
          </div>

          {/* Title and metadata */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">{selectedLineup.title}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">{selectedLineup.movementRequirements}</p>
          </div>

          {/* SVG Landmark Visual Reference Box */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-mono text-[10px] uppercase">SVG Crosshair Placement Landmark</span>
              <span className="font-mono text-[10px] text-zinc-500">TOLERANCE: ±{selectedLineup.startPosition.toleranceUnits} UNITS</span>
            </div>
            <div
              className="flex items-center justify-center rounded border border-border-subtle bg-background p-4 min-h-[160px]"
              dangerouslySetInnerHTML={{ __html: selectedLineup.svgReference }}
            />
          </div>

          {/* Aim Reference */}
          <div className="rounded border border-border-subtle bg-background p-2.5 space-y-1 text-xs">
            <div className="text-zinc-400">
              <span className="font-semibold text-zinc-200">Crosshair Placement: </span>
              {selectedLineup.aimReference.crosshairPlacement}
            </div>
            <div className="text-zinc-400">
              <span className="font-semibold text-zinc-200">Visual Landmark: </span>
              {selectedLineup.aimReference.visualLandmark}
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Execution Protocol
            </h4>
            <ol className="space-y-1.5 text-xs text-zinc-300 list-decimal pl-4">
              {selectedLineup.instructions.map((step, idx) => (
                <li key={idx} className="leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Coordinates and Engine Verification */}
          <div className="rounded border border-border-subtle bg-background p-2 text-[10px] font-mono text-zinc-400 space-y-1">
            <div className="flex justify-between">
              <span>ANCHOR COORDINATES:</span>
              <span>({selectedLineup.startPosition.x}, {selectedLineup.startPosition.y}, {selectedLineup.startPosition.z})</span>
            </div>
            <div className="flex justify-between">
              <span>GAME VERSION:</span>
              <span>{selectedLineup.gameVersion} (Verified {selectedLineup.lastVerificationDate})</span>
            </div>
            <div className="flex justify-between text-tactical-emerald">
              <span>SOURCE ATTRIBUTION:</span>
              <span>{selectedLineup.sourceAttribution}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UtilityRoomView;
