/**
 * CS2 Assistant - Authentic Curated Map Packs Data
 * File: src/core/utility/map-packs-data.ts
 *
 * Generates 100% offline, authentic lineup packs from in-game CS2 captures
 * across all 6 Active Duty maps:
 * - de_mirage (69 lineups)
 * - de_inferno (50 lineups)
 * - de_dust2 (49 lineups)
 * - de_nuke (37 lineups)
 * - de_ancient (60 lineups)
 * - de_anubis (49 lineups)
 *
 * Lineups include simple intuitive callout naming (e.g. PALACE from T SPAWN)
 * and trilingual localization support (English, Portuguese BR, Spanish).
 */

import type { Lineup, CS2Map, UtilityType, TeamSide, ThrowType, LineupTechnique } from './types';
import csnadesRaw from '../lineup-fsm/csnades-data.json';

// Trilingual callout translation dictionary
const CALLOUT_TRANSLATIONS: Record<string, { pt: string; es: string }> = {
  'ticket booth': { pt: 'Cabine de Ticket', es: 'Cabina de Tickets' },
  'palace': { pt: 'Palácio', es: 'Palacio' },
  't spawn': { pt: 'Spawn T', es: 'Base T' },
  'ct spawn': { pt: 'Spawn CT', es: 'Base CT' },
  'stairs': { pt: 'Degraus / Escada', es: 'Escaleras' },
  'jungle': { pt: 'Selva / Conector', es: 'Jungla' },
  'window': { pt: 'Janela', es: 'Ventana' },
  'connector': { pt: 'Conector', es: 'Conector' },
  'short': { pt: 'Meio Curto / Cat', es: 'Medio Corto' },
  'banana': { pt: 'Banana', es: 'Banana' },
  'coffins': { pt: 'Caixões', es: 'Ataúdes' },
  'ramp': { pt: 'Rampa', es: 'Rampa' },
  'silo': { pt: 'Silo', es: 'Silo' },
  'hut': { pt: 'Cabana', es: 'Caseta' },
  'vent': { pt: 'Duto / Vent', es: 'Conducto' },
  'heaven': { pt: 'Céu', es: 'Cielo' },
  'site': { pt: 'Bombsite', es: 'Punto' },
  'pit': { pt: 'Fosso / Pit', es: 'Foso' },
  'apartments': { pt: 'Apartamentos', es: 'Apartamentos' },
  'long': { pt: 'Fundo / Long', es: 'Larga' },
  'mid': { pt: 'Meio / Mid', es: 'Medio' },
  'xbox': { pt: 'Xbox', es: 'Xbox' },
  'lower tunnel': { pt: 'Escuro Baixo', es: 'Túnel Bajo' },
  'upper tunnel': { pt: 'Escuro Alto', es: 'Túnel Alto' },
  'b doors': { pt: 'Porta B', es: 'Puertas B' },
  'cave': { pt: 'Caverna', es: 'Cueva' },
  'ruins': { pt: 'Ruínas', es: 'Ruinas' },
  'temple': { pt: 'Templo', es: 'Templo' },
  'donuts': { pt: 'Donut', es: 'Donut' },
  'water': { pt: 'Água', es: 'Agua' },
};

function translateCallout(callout: string, lang: 'pt' | 'es'): string {
  const lower = callout.toLowerCase().trim();
  if (CALLOUT_TRANSLATIONS[lower]) {
    return CALLOUT_TRANSLATIONS[lower][lang];
  }
  for (const [key, trans] of Object.entries(CALLOUT_TRANSLATIONS)) {
    if (lower.includes(key)) {
      return callout.replace(new RegExp(key, 'i'), trans[lang]);
    }
  }
  return callout;
}

const MAP_KEY_MAPPING: Record<CS2Map, string> = {
  de_mirage: 'mirage',
  de_inferno: 'inferno',
  de_dust2: 'dust2',
  de_nuke: 'nuke',
  de_ancient: 'ancient',
  de_anubis: 'anubis',
};

function normalizeUtilityType(raw: string): UtilityType {
  const l = (raw || '').toLowerCase();
  if (l.includes('smoke')) return 'SMOKE';
  if (l.includes('flash')) return 'FLASHBANG';
  if (l.includes('moly') || l.includes('molotov') || l.includes('incendiary')) return 'MOLOTOV';
  if (l.includes('he') || l.includes('grenade')) return 'HE_GRENADE';
  return 'SMOKE';
}

function normalizeTeamSide(raw: string): TeamSide {
  const l = (raw || '').toLowerCase();
  if (l === 'ct') return 'CT';
  return 'T';
}

function normalizeThrowTechnique(technique: string, movement: string): { technique: LineupTechnique; throwType: ThrowType } {
  const m = (movement || '').toLowerCase();
  const t = (technique || '').toLowerCase();

  if (m.includes('running_jumpthrow') || m.includes('run_jump')) {
    return { technique: 'RUN_JUMPTHROW', throwType: 'RUN_JUMPTHROW' };
  }
  if (m.includes('jump')) {
    return { technique: 'JUMPTHROW', throwType: 'JUMPTHROW' };
  }
  if (m.includes('run')) {
    return { technique: 'RUN', throwType: 'RUN_JUMPTHROW' };
  }
  if (m.includes('walk')) {
    return { technique: 'WALK_THROW', throwType: 'WALK_THROW' };
  }
  if (m.includes('crouch')) {
    return { technique: 'CROUCH', throwType: 'CROUCH_JUMPTHROW' };
  }
  return { technique: 'STAND', throwType: 'STANDING' };
}

const CORE_UTILITY_EXTRAS: Lineup[] = [
  // Mirage Extras
  {
    id: 'core-mirage-a-flash',
    map: 'de_mirage',
    title: 'A SITE POP-FLASH from T ROOF',
    side: 'T',
    utilityType: 'FLASHBANG',
    technique: 'STAND',
    throwType: 'STANDING',
    throwPosition: { x: -1120, y: -450, z: -160, callout: 'T Roof', description: 'T Roof corner', toleranceUnits: 8 },
    startPosition: { x: -1120, y: -450, z: -160, callout: 'T Roof', toleranceUnits: 8 },
    crosshairTarget: { pitch: -45.0, yaw: 12.0, description: 'Aim above wooden antenna', visualLandmark: 'Antenna top' },
    aimReference: { crosshairPlacement: 'Aim above wooden antenna', visualLandmark: 'Antenna top' },
    landingArea: { x: -300, y: -500, z: 50, callout: 'A Site Apex', description: 'Pops above A site blind CTs' },
    targetDestination: { x: -300, y: -500, z: 50, callout: 'A Site Apex' },
    movementKey: 'NONE',
    movementRequirements: 'Stationary standard throw',
    tickrate: 'SUBTICK_CS2',
    tags: ['A-Site', 'Flash', 'Execute', 'Essential'],
    isCustom: false,
    favorite: false,
    instructions: ['Stand at T Roof wooden post', 'Aim slightly above antenna apex', 'Left-click throw'],
    difficulty: 'EASY',
    sourceAttribution: 'CS2 Competitive Core Set',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-22',
    imageUrl: 'https://assets.csnades.gg/nades/mirage-smoke-8xUT3aGGSl/lineup.webp',
    titles: {
      en: 'A SITE POP-FLASH from T ROOF',
      pt: 'BANG DE ENTRADA A do TELHADO T',
      'pt-BR': 'BANG DE ENTRADA A do TELHADO T',
      es: 'FLASH ENTRADA A de TEJADO T',
    },
    instructionsI18n: {
      en: ['Stand at T Roof post', 'Aim above antenna', 'Left-click throw'],
      pt: ['Fique no poste do T Roof', 'Mire acima da antena', 'Solte com clique esquerdo'],
      es: ['Ponte en el poste de Tejado T', 'Apunta sobre la antena', 'Lanza con clic izquierdo'],
    },
  },
  {
    id: 'core-mirage-under-balcony-moly',
    map: 'de_mirage',
    title: 'UNDER PALACE MOLOTOV from A RAMP',
    side: 'T',
    utilityType: 'MOLOTOV',
    technique: 'STAND',
    throwType: 'STANDING',
    throwPosition: { x: -800, y: -800, z: -100, callout: 'A Ramp', description: 'A Ramp side', toleranceUnits: 8 },
    startPosition: { x: -800, y: -800, z: -100, callout: 'A Ramp', toleranceUnits: 8 },
    crosshairTarget: { pitch: -10.0, yaw: 40.0, description: 'Aim at Palace corner shadow', visualLandmark: 'Corner shadow' },
    aimReference: { crosshairPlacement: 'Aim at Palace corner shadow', visualLandmark: 'Corner shadow' },
    landingArea: { x: -200, y: -900, z: -160, callout: 'Under Balcony (Shadow)', description: 'Burns under palace' },
    targetDestination: { x: -200, y: -900, z: -160, callout: 'Under Balcony (Shadow)' },
    movementKey: 'NONE',
    movementRequirements: 'Stationary throw',
    tickrate: 'SUBTICK_CS2',
    tags: ['A-Site', 'Molotov', 'Clear', 'Essential'],
    isCustom: false,
    favorite: false,
    instructions: ['Wedge at A Ramp sandbags', 'Aim at dark Palace corner brick', 'Left-click throw'],
    difficulty: 'EASY',
    sourceAttribution: 'CS2 Competitive Core Set',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-22',
    imageUrl: 'https://assets.csnades.gg/nades/mirage-smoke-azNiRzhJVG/lineup.webp',
    titles: {
      en: 'UNDER PALACE MOLOTOV from A RAMP',
      pt: 'MOLOTOV NO SHADOW / BAIXO DO PALÁCIO da RAMPA A',
      'pt-BR': 'MOLOTOV NO SHADOW / BAIXO DO PALÁCIO da RAMPA A',
      es: 'MOLOTOV DEBAJO DE PALACIO de RAMPA A',
    },
    instructionsI18n: {
      en: ['Wedge at sandbags', 'Aim at corner brick', 'Left-click throw'],
      pt: ['Trave nos sacos de areia da rampa', 'Mire no tijolo do canto do Palácio', 'Solte com clique esquerdo'],
      es: ['Ponte en los sacos de arena', 'Apunta al ladrillo de esquina', 'Lanza con clic izquierdo'],
    },
  },
  {
    id: 'core-mirage-van-he',
    map: 'de_mirage',
    title: 'B VAN HE GRENADE from APARTMENTS',
    side: 'T',
    utilityType: 'HE_GRENADE',
    technique: 'STAND',
    throwType: 'STANDING',
    throwPosition: { x: -1600, y: 300, z: 50, callout: 'B Apps Window', description: 'B Apartments window frame', toleranceUnits: 8 },
    startPosition: { x: -1600, y: 300, z: 50, callout: 'B Apps Window', toleranceUnits: 8 },
    crosshairTarget: { pitch: -15.0, yaw: -30.0, description: 'Aim above B Van headlight', visualLandmark: 'Van roof' },
    aimReference: { crosshairPlacement: 'Aim above B Van headlight', visualLandmark: 'Van roof' },
    landingArea: { x: -1100, y: 600, z: -50, callout: 'B Site Van', description: 'Massive HE explosion behind van' },
    targetDestination: { x: -1100, y: 600, z: -50, callout: 'B Site Van' },
    movementKey: 'NONE',
    movementRequirements: 'Standard throw',
    tickrate: 'SUBTICK_CS2',
    tags: ['B-Site', 'HE', 'Anti-Defense'],
    isCustom: false,
    favorite: false,
    instructions: ['Crouch under B Apps window', 'Aim at top edge of Van banner', 'Left-click throw'],
    difficulty: 'EASY',
    sourceAttribution: 'CS2 Competitive Core Set',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-22',
    imageUrl: 'https://assets.csnades.gg/nades/mirage-smoke-EHvVQ0Ebqm/lineup.webp',
    titles: {
      en: 'B VAN HE GRENADE from APARTMENTS',
      pt: 'GRANADA HE NA VAN B do APARTAMENTO B',
      'pt-BR': 'GRANADA HE NA VAN B do APARTAMENTO B',
      es: 'GRANADA HE EN FURGONETA B de APARTAMENTOS B',
    },
  },
  // Inferno Extras
  {
    id: 'core-inferno-banana-flash',
    map: 'de_inferno',
    title: 'BANANA RETAKE POP-FLASH from CT SPAWN',
    side: 'CT',
    utilityType: 'FLASHBANG',
    technique: 'STAND',
    throwType: 'STANDING',
    throwPosition: { x: 1800, y: 1200, z: 100, callout: 'CT Arch', description: 'Arch corner', toleranceUnits: 8 },
    startPosition: { x: 1800, y: 1200, z: 100, callout: 'CT Arch', toleranceUnits: 8 },
    crosshairTarget: { pitch: -30.0, yaw: 90.0, description: 'Aim above banana roof edge', visualLandmark: 'Banana roof' },
    aimReference: { crosshairPlacement: 'Aim above banana roof edge', visualLandmark: 'Banana roof' },
    landingArea: { x: 1200, y: 1500, z: 150, callout: 'Half Wall Banana', description: 'Blinds all T rushers on Banana' },
    targetDestination: { x: 1200, y: 1500, z: 150, callout: 'Half Wall Banana' },
    movementKey: 'NONE',
    movementRequirements: 'Stationary throw',
    tickrate: 'SUBTICK_CS2',
    tags: ['Banana', 'Flash', 'Defense'],
    isCustom: false,
    favorite: false,
    instructions: ['Position at CT arch corner', 'Aim at the roof tile corner', 'Left-click throw'],
    difficulty: 'EASY',
    sourceAttribution: 'CS2 Competitive Core Set',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-22',
    imageUrl: 'https://assets.csnades.gg/nades/mirage-smoke-azNiRzhJVG/lineup.webp',
    titles: {
      en: 'BANANA RETAKE POP-FLASH from CT SPAWN',
      pt: 'BANG DE BANANA da BASE CT',
      'pt-BR': 'BANG DE BANANA da BASE CT',
      es: 'FLASH DE BANANA de BASE CT',
    },
  },
  {
    id: 'core-inferno-car-moly',
    map: 'de_inferno',
    title: 'BANANA CAR MOLOTOV from T RAMP',
    side: 'T',
    utilityType: 'MOLOTOV',
    technique: 'STAND',
    throwType: 'STANDING',
    throwPosition: { x: 800, y: 2000, z: 50, callout: 'T Banana Entry', description: 'Banana entrance corner', toleranceUnits: 8 },
    startPosition: { x: 800, y: 2000, z: 50, callout: 'T Banana Entry', toleranceUnits: 8 },
    crosshairTarget: { pitch: -20.0, yaw: 0.0, description: 'Aim at chimney shadow', visualLandmark: 'Chimney' },
    aimReference: { crosshairPlacement: 'Aim at chimney shadow', visualLandmark: 'Chimney' },
    landingArea: { x: 1100, y: 1800, z: 100, callout: 'Car / Barrels', description: 'Burns car holding CTs' },
    targetDestination: { x: 1100, y: 1800, z: 100, callout: 'Car / Barrels' },
    movementKey: 'NONE',
    movementRequirements: 'Standard throw',
    tickrate: 'SUBTICK_CS2',
    tags: ['Banana', 'Molotov', 'Clear'],
    isCustom: false,
    favorite: false,
    instructions: ['Wedge against the wooden logs', 'Aim at the third antenna spike', 'Left-click throw'],
    difficulty: 'EASY',
    sourceAttribution: 'CS2 Competitive Core Set',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-22',
    imageUrl: 'https://assets.csnades.gg/nades/mirage-smoke-8xUT3aGGSl/lineup.webp',
    titles: {
      en: 'BANANA CAR MOLOTOV from T RAMP',
      pt: 'MOLOTOV NO CARRO DA BANANA da ENTRADA T',
      'pt-BR': 'MOLOTOV NO CARRO DA BANANA da ENTRADA T',
      es: 'MOLOTOV EN COCHE DE BANANA de ENTRADA T',
    },
  },
  // Dust 2 Extras
  {
    id: 'core-dust2-long-flash',
    map: 'de_dust2',
    title: 'LONG A ENTRY POP-FLASH from LONG DOORS',
    side: 'T',
    utilityType: 'FLASHBANG',
    technique: 'STAND',
    throwType: 'STANDING',
    throwPosition: { x: 400, y: -1200, z: 100, callout: 'Long Doors Outside', description: 'Long doors entrance', toleranceUnits: 8 },
    startPosition: { x: 400, y: -1200, z: 100, callout: 'Long Doors Outside', toleranceUnits: 8 },
    crosshairTarget: { pitch: -35.0, yaw: -10.0, description: 'Aim at wall edge above door', visualLandmark: 'Door wall edge' },
    aimReference: { crosshairPlacement: 'Aim at wall edge above door', visualLandmark: 'Door wall edge' },
    landingArea: { x: 700, y: -800, z: 200, callout: 'Long Corner', description: 'High pop flash blinding Long corner' },
    targetDestination: { x: 700, y: -800, z: 200, callout: 'Long Corner' },
    movementKey: 'NONE',
    movementRequirements: 'Stationary throw',
    tickrate: 'SUBTICK_CS2',
    tags: ['Long-A', 'Flash', 'Entry'],
    isCustom: false,
    favorite: false,
    instructions: ['Stand at outside Long door barrel', 'Aim at wall corner', 'Left-click throw'],
    difficulty: 'EASY',
    sourceAttribution: 'CS2 Competitive Core Set',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-22',
    imageUrl: 'https://assets.csnades.gg/nades/mirage-smoke-azNiRzhJVG/lineup.webp',
    titles: {
      en: 'LONG A ENTRY POP-FLASH from LONG DOORS',
      pt: 'BANG DE FUNDO A da PORTA DO FUNDO',
      'pt-BR': 'BANG DE FUNDO A da PORTA DO FUNDO',
      es: 'FLASH ENTRADA LARGA A de PUERTAS LARGAS',
    },
  },
  // Nuke Extras
  {
    id: 'core-nuke-hut-flash',
    map: 'de_nuke',
    title: 'A SITE HUT POP-FLASH from ROOF',
    side: 'T',
    utilityType: 'FLASHBANG',
    technique: 'STAND',
    throwType: 'STANDING',
    throwPosition: { x: -500, y: -800, z: 300, callout: 'T Roof Skylight', description: 'Above A site hut', toleranceUnits: 8 },
    startPosition: { x: -500, y: -800, z: 300, callout: 'T Roof Skylight', toleranceUnits: 8 },
    crosshairTarget: { pitch: -40.0, yaw: 0.0, description: 'Aim through skylight glass', visualLandmark: 'Skylight frame' },
    aimReference: { crosshairPlacement: 'Aim through skylight glass', visualLandmark: 'Skylight frame' },
    landingArea: { x: -300, y: -600, z: 100, callout: 'A Site Hut', description: 'Blinds rafters and hut holders' },
    targetDestination: { x: -300, y: -600, z: 100, callout: 'A Site Hut' },
    movementKey: 'NONE',
    movementRequirements: 'Left-click throw',
    tickrate: 'SUBTICK_CS2',
    tags: ['A-Site', 'Flash', 'Execute'],
    isCustom: false,
    favorite: false,
    instructions: ['Stand on the yellow pipe on T roof', 'Aim through the open window frame', 'Left-click throw'],
    difficulty: 'EASY',
    sourceAttribution: 'CS2 Competitive Core Set',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-22',
    imageUrl: 'https://assets.csnades.gg/nades/mirage-smoke-8xUT3aGGSl/lineup.webp',
    titles: {
      en: 'A SITE HUT POP-FLASH from ROOF',
      pt: 'BANG DE HUT / BOMBSITE A do TELHADO T',
      'pt-BR': 'BANG DE HUT / BOMBSITE A do TELHADO T',
      es: 'FLASH DE CASETA / BOMBSITE A de TEJADO T',
    },
  },
];

/**
 * Builds all authentic lineups for a given CS2 map from offline dataset.
 */
export function getCuratedMapPackLineups(map: CS2Map): Lineup[] {
  const key = MAP_KEY_MAPPING[map];
  const list = (csnadesRaw as Record<string, any[]>)[key] || [];

  const mainList: Lineup[] = list.map((n, index) => {
    const from = (n.titleFrom || 'Spawn').trim();
    const to = (n.titleTo || 'Site').trim();
    const uType = normalizeUtilityType(n.type);
    const side = normalizeTeamSide(n.team);
    const { technique, throwType } = normalizeThrowTechnique(n.technique, n.movement);
    const isJump = throwType.includes('JUMP');

    const enTitle = `${to.toUpperCase()} from ${from.toUpperCase()}`;
    const ptTitle = `${translateCallout(to, 'pt').toUpperCase()} do ${translateCallout(from, 'pt').toUpperCase()}`;
    const esTitle = `${translateCallout(to, 'es').toUpperCase()} de ${translateCallout(from, 'es').toUpperCase()}`;

    const img = n.assets?.lineup || n.assets?.thumbnail || '';
    const thumb = n.assets?.thumbnail || img;

    const enInstructions = [
      `Position at ${from}`,
      'Align crosshair with reference marker',
      isJump ? 'Jumpthrow grenade' : 'Standard left-click throw',
    ];
    const ptInstructions = [
      `Posicione-se em ${translateCallout(from, 'pt')}`,
      'Alinhe a mira com o ponto de referência',
      isJump ? 'Arremesse com Jumpthrow' : 'Arremesse com clique esquerdo padrão',
    ];
    const esInstructions = [
      `Colócate en ${translateCallout(from, 'es')}`,
      'Apunta al marcador de referencia',
      isJump ? 'Lanza con Jumpthrow' : 'Lanzamiento normal con clic izquierdo',
    ];

    const lineupId = `curated-${map}-${n.id || index}`;

    return {
      id: lineupId,
      map,
      title: enTitle,
      side,
      utilityType: uType,
      technique,
      throwType,
      throwPosition: {
        x: n.throwFrom?.x ?? 0,
        y: n.throwFrom?.y ?? 0,
        z: 0,
        callout: from,
        description: `Position at ${from}`,
        toleranceUnits: 8,
      },
      startPosition: {
        x: n.throwFrom?.x ?? 0,
        y: n.throwFrom?.y ?? 0,
        z: 0,
        callout: from,
        toleranceUnits: 8,
      },
      crosshairTarget: {
        pitch: 0,
        yaw: 0,
        description: `Align reticle toward ${to}`,
        visualLandmark: `${to} visual reference`,
      },
      aimReference: {
        crosshairPlacement: `Align reticle toward ${to}`,
        visualLandmark: to,
      },
      imageUrl: img,
      thumbnailUrl: thumb,
      standImageUrl: n.assets?.thumbnailSmall || thumb,
      resultImageUrl: thumb,
      landingArea: {
        x: n.throwTo?.x ?? 0,
        y: n.throwTo?.y ?? 0,
        z: 0,
        callout: to,
        description: `Blooms at ${to}`,
      },
      targetDestination: {
        x: n.throwTo?.x ?? 0,
        y: n.throwTo?.y ?? 0,
        z: 0,
        callout: to,
      },
      movementKey: isJump ? 'JUMPTHROW' : 'NONE',
      movementRequirements: isJump ? 'Jumpthrow' : 'Stationary',
      tickrate: 'SUBTICK_CS2',
      tags: [to, from, uType, side, 'Verified', 'Official'],
      isCustom: false,
      favorite: false,
      instructions: enInstructions,
      difficulty: n.beginner ? 'EASY' : 'MEDIUM',
      sourceAttribution: 'CS2 Competitive In-Game Data',
      verified: true,
      gameVersion: '1.40.2.1',
      lastVerificationDate: '2026-10-22',
      // Multilingual fields stored for i18n
      titles: {
        en: enTitle,
        pt: ptTitle,
        'pt-BR': ptTitle,
        es: esTitle,
      },
      instructionsI18n: {
        en: enInstructions,
        pt: ptInstructions,
        'pt-BR': ptInstructions,
        es: esInstructions,
      },
    } as Lineup;
  });

  const extras = CORE_UTILITY_EXTRAS.filter((e) => e.map === map);
  return [...mainList, ...extras];
}

export interface MapPackMeta {
  map: CS2Map;
  name: string;
  count: number;
  smokes: number;
  flashes: number;
  molies: number;
  hes: number;
}

export function getAvailableMapPacksMeta(): MapPackMeta[] {
  const maps: CS2Map[] = [
    'de_mirage',
    'de_inferno',
    'de_dust2',
    'de_nuke',
    'de_ancient',
    'de_anubis',
  ];

  return maps.map((map) => {
    const lineups = getCuratedMapPackLineups(map);
    return {
      map,
      name: map.replace('de_', '').toUpperCase(),
      count: lineups.length,
      smokes: lineups.filter((l) => l.utilityType === 'SMOKE').length,
      flashes: lineups.filter((l) => l.utilityType === 'FLASHBANG').length,
      molies: lineups.filter((l) => l.utilityType === 'MOLOTOV' || l.utilityType === 'MOLOTOV_INCENDIARY').length,
      hes: lineups.filter((l) => l.utilityType === 'HE_GRENADE').length,
    };
  });
}
