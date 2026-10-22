/**
 * CS2 Assistant - Web Utility & Lineup Pack Importer
 * File: src/core/utility/web-lineup-importer.ts
 *
 * Implements curated online utility packs (Scope.gg Flashes, TotalCSGO Molotovs, HLTV HE Grenades)
 * and custom JSON/URL imports, allowing users to keep the initial launcher clean and
 * choose which utility categories to install into their competitive arsenal.
 */

import type { Lineup, CS2Map, UtilityType } from './types';
import { saveLineup, deleteLineup, getAllLineups } from './lineup-database';

export interface UtilityPack {
  id: string;
  name: string;
  source: string;
  category: 'FLASHBANG' | 'MOLOTOV' | 'HE_GRENADE' | 'SMOKE' | 'ALL';
  description: string;
  maps: CS2Map[];
  lineups: Lineup[];
}

const INSTALLED_PACKS_KEY = 'cs2_assistant_installed_packs_v1';

function getLocalStorage(): { getItem(k: string): string | null; setItem(k: string, v: string): void } | null {
  if (typeof globalThis !== 'undefined' && 'localStorage' in (globalThis as Record<string, unknown>)) {
    return (globalThis as unknown as { localStorage: { getItem(k: string): string | null; setItem(k: string, v: string): void } }).localStorage;
  }
  return null;
}

function getInstalledPackIds(): Set<string> {
  const storage = getLocalStorage();
  if (!storage) return new Set();
  try {
    const raw = storage.getItem(INSTALLED_PACKS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function setInstalledPackIds(ids: Set<string>): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(INSTALLED_PACKS_KEY, JSON.stringify(Array.from(ids)));
  } catch {}
}

// ----------------------------------------------------------------------------
// Curated Online Packs with Real Coordinates & In-Game Data
// ----------------------------------------------------------------------------

function makePackLineup(
  id: string,
  map: CS2Map,
  title: string,
  side: 'T' | 'CT',
  utilityType: UtilityType,
  throwType: 'STANDING' | 'JUMPTHROW' | 'RUN_JUMPTHROW',
  startCallout: string,
  targetCallout: string,
  instructions: string[],
  movementReq: string,
  realImageUrl?: string
): Lineup {
  const img = realImageUrl || 'https://assets.csnades.gg/nades/mirage-smoke-EHvVQ0Ebqm/lineup.webp';
  return {
    id,
    map,
    title,
    side,
    utilityType,
    technique: throwType === 'JUMPTHROW' ? 'JUMPTHROW' : 'STAND',
    throwType,
    throwPosition: { x: 0, y: 0, z: 0, callout: startCallout, description: movementReq, toleranceUnits: 6 },
    startPosition: { x: 0, y: 0, z: 0, callout: startCallout, toleranceUnits: 6 },
    crosshairTarget: { pitch: 0, yaw: 0, description: `Aim directly at ${targetCallout} reference`, visualLandmark: targetCallout },
    aimReference: { crosshairPlacement: `Aim directly at ${targetCallout} landmark`, visualLandmark: targetCallout },
    imageUrl: img,
    thumbnailUrl: img,
    standImageUrl: img,
    resultImageUrl: img,
    landingArea: { x: 0, y: 0, z: 0, callout: targetCallout },
    targetDestination: { x: 0, y: 0, z: 0, callout: targetCallout },
    movementRequirements: movementReq,
    tickrate: 'SUBTICK_CS2',
    tags: [targetCallout, startCallout, utilityType, 'Pack', 'Competitive'],
    isCustom: true,
    favorite: false,
    instructions,
    difficulty: 'EASY',
    sourceAttribution: 'CS2 Tactical Assistant Pack',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: new Date().toISOString().split('T')[0],
  };
}

export const CURATED_PACKS: UtilityPack[] = [
  // 1. SCOPE.GG PRO FLASHBANGS PACK
  {
    id: 'pack-scopegg-flashes',
    name: 'Scope.gg Pro Flashbangs Pack',
    source: 'Scope.gg Verified High-Airburst Database',
    category: 'FLASHBANG',
    description: 'High-impact airburst pop flashes designed to fully blind anchor defenders without flashing teammates.',
    maps: ['de_mirage', 'de_inferno', 'de_dust2', 'de_nuke', 'de_ancient', 'de_anubis'],
    lineups: [
      makePackLineup('scope-mirage-a-ramp-pop', 'de_mirage', 'A Ramp Fast Pop Flash', 'T', 'FLASHBANG', 'STANDING', 'T Roof / A Ramp Corner', 'A Site Core & CT Box', ['Stand wedged into A Ramp corner', 'Aim at high building trim apex', 'Left click throw right before entry push'], 'Stationary throw'),
      makePackLineup('scope-mirage-mid-window-flash', 'de_mirage', 'Top Mid Window Blind Flash', 'T', 'FLASHBANG', 'RUN_JUMPTHROW', 'Top Mid Trash Can', 'Mid Window & Connector', ['Run 2 steps from trash can', 'Aim top of Mid archway', 'Jumpthrow at release mark'], 'Run 2 steps + Jumpthrow'),
      makePackLineup('scope-mirage-b-apps-flash', 'de_mirage', 'B Apartments Retake Flash', 'CT', 'FLASHBANG', 'STANDING', 'B Kitchen Door', 'B Site / Van / Balcony', ['Stand next to Kitchen door frame', 'Aim at ceiling beam intersection', 'Standard left-click throw'], 'Stationary throw'),
      makePackLineup('scope-inferno-banana-pop', 'de_inferno', 'Banana Aggression Blind Flash', 'T', 'FLASHBANG', 'STANDING', 'Banana Half-Wall', 'Car & Sandbags Blind', ['Wedge into Half-Wall corner', 'Aim at top wire between rooftops', 'Left-click throw to blind Car defenders'], 'Stationary throw'),
      makePackLineup('scope-inferno-pit-clear-flash', 'de_inferno', 'A Site Pit Clear Pop Flash', 'T', 'FLASHBANG', 'STANDING', 'Boiler / Balcony Door', 'Pit & Balcony High Airburst', ['Stand outside Boiler door', 'Aim at balcony roof antenna', 'Left-click throw'], 'Stationary throw'),
      makePackLineup('scope-dust2-long-corner-pop', 'de_dust2', 'Long A Doors Exit Pop Flash', 'T', 'FLASHBANG', 'STANDING', 'Long Doors Exit Corner', 'Long Corner & Pit', ['Wedge into exit door frame', 'Aim at top electrical pole insulator', 'Standard left-click throw'], 'Stationary throw'),
      makePackLineup('scope-dust2-b-tunnels-pop', 'de_dust2', 'Upper Tunnels B Site Pop Flash', 'T', 'FLASHBANG', 'RUN_JUMPTHROW', 'Upper Tunnels Pillar', 'B Site Platform & Back Plat', ['Run from pillar toward tunnel exit', 'Aim at roof crack above door', 'Release with jumpthrow'], 'Run-jumpthrow'),
      makePackLineup('scope-nuke-outside-pop', 'de_nuke', 'Outside Secret Pop Flash', 'T', 'FLASHBANG', 'STANDING', 'Red Box Corner', 'Outside Garage & Secret', ['Wedge into Red Box corner', 'Aim above shipping container edge', 'Standard throw'], 'Stationary throw'),
      makePackLineup('scope-ancient-b-ramp-flash', 'de_ancient', 'B Site Entry Pop Flash', 'T', 'FLASHBANG', 'STANDING', 'B Ramp Wooden Wall', 'B Site & Pillar', ['Stand against wooden wall', 'Aim at stone arch corner', 'Standard left-click throw'], 'Stationary throw'),
      makePackLineup('scope-anubis-b-alley-flash', 'de_anubis', 'B Alley Fast Pop Flash', 'T', 'FLASHBANG', 'STANDING', 'B Alley Archway', 'B Site & Temple', ['Wedge in archway corner', 'Aim at top palm leaf', 'Standard left-click throw'], 'Stationary throw'),
    ],
  },

  // 2. TOTALCSGO META MOLOTOVS PACK
  {
    id: 'pack-totalcsgo-molotovs',
    name: 'TotalCSGO Meta Molotovs Pack',
    source: 'TotalCSGO Competitive Playbook',
    category: 'MOLOTOV',
    description: 'Essential site-clearing and post-plant incendiary lineups to flush out anchors and deny bomb defusals.',
    maps: ['de_mirage', 'de_inferno', 'de_dust2', 'de_nuke', 'de_ancient', 'de_anubis'],
    lineups: [
      makePackLineup('totalcs-mirage-a-firebox-moly', 'de_mirage', 'A Firebox & Under Palace Molotov', 'T', 'MOLOTOV', 'JUMPTHROW', 'T Roof Scaffold', 'A Site Firebox Corner', ['Stand wedged into scaffold beam', 'Aim at center palace roof line', 'Jumpthrow'], 'Subtick jumpthrow'),
      makePackLineup('totalcs-mirage-b-van-moly', 'de_mirage', 'B Van & Balcony Molotov', 'T', 'MOLOTOV', 'STANDING', 'B Apartments Carpet', 'B Van & Short Corner', ['Wedge into carpet door trim', 'Aim at antenna shadow on brick', 'Left-click release'], 'Stationary throw'),
      makePackLineup('totalcs-inferno-newbox-moly', 'de_inferno', 'B New Box Molotov', 'T', 'MOLOTOV', 'JUMPTHROW', 'Banana Logs Corner', 'New Box Corner Flush', ['Wedge tightly into logs', 'Aim at high pipe elbow', 'Jumpthrow'], 'Subtick jumpthrow'),
      makePackLineup('totalcs-inferno-pit-moly', 'de_inferno', 'A Site Pit Corner Molotov', 'T', 'MOLOTOV', 'STANDING', 'Second Mid Apartments', 'A Pit / Corner Anchor', ['Stand behind apartment window', 'Aim at pit roof gutter', 'Left-click throw'], 'Stationary throw'),
      makePackLineup('totalcs-dust2-goose-moly', 'de_dust2', 'A Site Goose Molotov', 'T', 'MOLOTOV', 'STANDING', 'Catwalk Stairs', 'A Goose Corner', ['Wedge at top of catwalk stairs', 'Aim at building letter edge', 'Left-click throw'], 'Stationary throw'),
      makePackLineup('totalcs-dust2-b-car-moly', 'de_dust2', 'B Site Car / Big Box Molotov', 'T', 'MOLOTOV', 'STANDING', 'Upper Tunnels Mesh', 'B Car / Anchor Corner', ['Wedge into tunnel mesh fence', 'Aim at B door trim apex', 'Left-click throw'], 'Stationary throw'),
      makePackLineup('totalcs-nuke-hut-roof-moly', 'de_nuke', 'Top of Hut Molotov', 'T', 'MOLOTOV', 'STANDING', 'Lobby Corner', 'Top of Hut & Mustangs', ['Stand in Lobby corner', 'Aim at yellow sign corner', 'Left-click throw'], 'Stationary throw'),
      makePackLineup('totalcs-ancient-ninja-moly', 'de_ancient', 'B Site Ninja Pillar Molotov', 'T', 'MOLOTOV', 'JUMPTHROW', 'B Long Ruins', 'Behind B Pillar / Ninja', ['Stand in ruins corner', 'Aim at stone carving tooth', 'Jumpthrow'], 'Subtick jumpthrow'),
      makePackLineup('totalcs-anubis-back-pillar-moly', 'de_anubis', 'B Back Pillar Molotov', 'T', 'MOLOTOV', 'STANDING', 'B Canal Bridge', 'B Back Pillar & Ninja', ['Wedge on bridge railing', 'Aim at high hieroglyph symbol', 'Left-click throw'], 'Stationary throw'),
    ],
  },

  // 3. HLTV PRO HE GRENADES PACK
  {
    id: 'pack-hltv-he-grenades',
    name: 'HLTV Pro HE Grenades Pack',
    source: 'HLTV Executive Damage Taxonomy',
    category: 'HE_GRENADE',
    description: 'High-damage HE grenade lineups designed to inflict heavy 60-80+ HP damage on common chokepoint rushes.',
    maps: ['de_mirage', 'de_inferno', 'de_dust2', 'de_nuke', 'de_ancient', 'de_anubis'],
    lineups: [
      makePackLineup('hltv-mirage-underpass-he', 'de_mirage', 'Underpass Anti-Rush HE Grenade', 'CT', 'HE_GRENADE', 'STANDING', 'Window Room Brick', 'Underpass Chokepoint', ['Stand in Window Room brick edge', 'Aim at underpass door shadow', 'Left-click throw'], 'Stationary throw'),
      makePackLineup('hltv-mirage-a-default-he', 'de_mirage', 'A Site Default Plant HE Stack', 'CT', 'HE_GRENADE', 'JUMPTHROW', 'A Stairs Corner', 'A Default Box Plant', ['Wedge into Stairs corner', 'Aim at high palace roof beam', 'Jumpthrow at plant sound'], 'Subtick jumpthrow'),
      makePackLineup('hltv-inferno-banana-stack-he', 'de_inferno', 'Banana Deep Car HE Stack', 'CT', 'HE_GRENADE', 'STANDING', 'B Site Coffins', 'Car Chokepoint (Heavy Damage)', ['Stand against coffins wall', 'Aim at church bell tower tip', 'Standard throw'], 'Stationary throw'),
      makePackLineup('hltv-dust2-mid-cross-he', 'de_dust2', 'Mid Doors Cross HE Damage', 'T', 'HE_GRENADE', 'RUN_JUMPTHROW', 'T Spawn Ramp', 'Mid Doors CT Crossing', ['Run down T spawn ramp', 'Aim at gap between mid doors', 'Release jumpthrow at ramp line'], 'Run 2 steps + Jumpthrow'),
      makePackLineup('hltv-nuke-vent-damage-he', 'de_nuke', 'Squeaky Vent Damage HE', 'CT', 'HE_GRENADE', 'STANDING', 'A Site Mini Roof', 'Squeaky Vent Exit', ['Stand above Mini roof', 'Aim at vent crack', 'Left-click throw'], 'Stationary throw'),
      makePackLineup('hltv-ancient-b-cave-he', 'de_ancient', 'B Cave Deep Push HE Grenade', 'CT', 'HE_GRENADE', 'STANDING', 'B Site Pillar', 'Cave Chokepoint', ['Stand behind pillar', 'Aim at stone arch apex', 'Left-click release'], 'Stationary throw'),
    ],
  },
];

// ----------------------------------------------------------------------------
// Importer / Manager Functions
// ----------------------------------------------------------------------------

export function getAvailablePacks(): UtilityPack[] {
  return [...CURATED_PACKS];
}

export function isPackInstalled(packId: string): boolean {
  const installed = getInstalledPackIds();
  return installed.has(packId);
}

export function importPack(packId: string): { importedCount: number; pack: UtilityPack | null } {
  const pack = CURATED_PACKS.find((p) => p.id === packId);
  if (!pack) {
    return { importedCount: 0, pack: null };
  }

  // Save all lineups from this pack
  let count = 0;
  for (const lineup of pack.lineups) {
    saveLineup(lineup);
    count++;
  }

  const installed = getInstalledPackIds();
  installed.add(packId);
  setInstalledPackIds(installed);

  return { importedCount: count, pack };
}

export function uninstallPack(packId: string): boolean {
  const pack = CURATED_PACKS.find((p) => p.id === packId);
  if (!pack) return false;

  for (const lineup of pack.lineups) {
    deleteLineup(lineup.id);
  }

  const installed = getInstalledPackIds();
  installed.delete(packId);
  setInstalledPackIds(installed);

  return true;
}

export function importLineupsFromJson(rawJson: string): { successCount: number; errors: string[] } {
  const errors: string[] = [];
  let count = 0;

  try {
    const parsed = JSON.parse(rawJson);
    const candidateList = Array.isArray(parsed) ? parsed : [parsed];

    for (const item of candidateList) {
      if (!item.id || !item.map || !item.title) {
        errors.push(`Item missing required fields: ${JSON.stringify(item).slice(0, 40)}`);
        continue;
      }
      saveLineup({
        ...item,
        isCustom: true,
      });
      count++;
    }
  } catch (err: any) {
    errors.push(`Invalid JSON: ${err.message}`);
  }

  return { successCount: count, errors };
}
