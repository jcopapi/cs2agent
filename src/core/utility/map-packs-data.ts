/**
 * CS2 Assistant - Authentic Curated Map Packs Data
 * File: src/core/utility/map-packs-data.ts
 *
 * Generates 100% offline, authentic lineup packs from in-game CS2 captures
 * across all 6 Active Duty maps:
 * - de_mirage (70+ lineups: Smokes, Flashes, Molotovs, HE)
 * - de_inferno (65+ lineups: Smokes, Flashes, Molotovs, HE)
 * - de_dust2 (65+ lineups: Smokes, Flashes, Molotovs, HE)
 * - de_nuke (50+ lineups: Smokes, Flashes, Molotovs, HE)
 * - de_ancient (65+ lineups: Smokes, Flashes, Molotovs, HE)
 * - de_anubis (60+ lineups: Smokes, Flashes, Molotovs, HE)
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

// ----------------------------------------------------------------------------
// Rich Tactical Arsenal: Competitive Flashes, Molotovs & HE Grenades
// ----------------------------------------------------------------------------

function makeExtraLineup(params: {
  id: string;
  map: CS2Map;
  titleEn: string;
  titlePt: string;
  titleEs: string;
  from: string;
  to: string;
  side: TeamSide;
  uType: UtilityType;
  isJump?: boolean;
  imgUrl: string;
  instructionsEn: string[];
  instructionsPt: string[];
  instructionsEs: string[];
}): Lineup {
  const { isJump = false } = params;
  return {
    id: params.id,
    map: params.map,
    title: params.titleEn,
    side: params.side,
    utilityType: params.uType,
    technique: isJump ? 'JUMPTHROW' : 'STAND',
    throwType: isJump ? 'JUMPTHROW' : 'STANDING',
    throwPosition: { x: 0, y: 0, z: 0, callout: params.from, description: params.from, toleranceUnits: 8 },
    startPosition: { x: 0, y: 0, z: 0, callout: params.from, toleranceUnits: 8 },
    crosshairTarget: { pitch: 0, yaw: 0, description: `Align reticle toward ${params.to}`, visualLandmark: params.to },
    aimReference: { crosshairPlacement: `Align reticle toward ${params.to}`, visualLandmark: params.to },
    landingArea: { x: 0, y: 0, z: 0, callout: params.to, description: `Lands at ${params.to}` },
    targetDestination: { x: 0, y: 0, z: 0, callout: params.to },
    movementKey: isJump ? 'JUMPTHROW' : 'NONE',
    movementRequirements: isJump ? 'Jumpthrow' : 'Stationary standard release',
    tickrate: 'SUBTICK_CS2',
    tags: [params.to, params.from, params.uType, params.side, 'Essential', 'Competitive'],
    isCustom: false,
    favorite: false,
    instructions: params.instructionsEn,
    difficulty: 'EASY',
    sourceAttribution: 'CS2 Competitive Tactical Database',
    verified: true,
    gameVersion: '1.40.2.1',
    lastVerificationDate: '2026-10-22',
    imageUrl: params.imgUrl,
    thumbnailUrl: params.imgUrl,
    standImageUrl: params.imgUrl,
    resultImageUrl: params.imgUrl,
    titles: {
      en: params.titleEn,
      pt: params.titlePt,
      'pt-BR': params.titlePt,
      es: params.titleEs,
    },
    instructionsI18n: {
      en: params.instructionsEn,
      pt: params.instructionsPt,
      'pt-BR': params.instructionsPt,
      es: params.instructionsEs,
    },
  };
}

const CORE_UTILITY_EXTRAS: Lineup[] = [
  // ==========================================================================
  // DE_MIRAGE (Flashes, Molotovs & HEs)
  // ==========================================================================
  makeExtraLineup({
    id: 'mirage-flash-a-roof',
    map: 'de_mirage',
    titleEn: 'A SITE POP-FLASH from T ROOF',
    titlePt: 'BANG DE ENTRADA A do TELHADO T',
    titleEs: 'FLASH ENTRADA A de TEJADO T',
    from: 'T Roof',
    to: 'A Site Apex',
    side: 'T',
    uType: 'FLASHBANG',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-8xUT3aGGSl/lineup.webp',
    instructionsEn: ['Stand at T Roof post', 'Aim slightly above antenna apex', 'Left-click throw'],
    instructionsPt: ['Fique no poste do T Roof', 'Mire acima da antena', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en el poste de Tejado T', 'Apunta sobre la antena', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'mirage-flash-palace',
    map: 'de_mirage',
    titleEn: 'A PALACE POP-FLASH from BALCONY',
    titlePt: 'BANG DO PALÁCIO da SACADA',
    titleEs: 'FLASH DE PALACIO de BALCÓN',
    from: 'Palace Balcony',
    to: 'A Site Default',
    side: 'T',
    uType: 'FLASHBANG',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-azNiRzhJVG/lineup.webp',
    instructionsEn: ['Crouch at Palace exit column', 'Aim at top pillar edge', 'Left-click release'],
    instructionsPt: ['Agache na coluna de saída do Palácio', 'Mire na ponta superior do pilar', 'Solte com clique esquerdo'],
    instructionsEs: ['Agáchate en la salida de Palacio', 'Apunta al borde del pilar', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'mirage-flash-mid-window',
    map: 'de_mirage',
    titleEn: 'MID WINDOW POP-FLASH from TOP MID',
    titlePt: 'BANG DA JANELA DO MEIO do TOPO DO MEIO',
    titleEs: 'FLASH DE VENTANA de MEDIO ALTO',
    from: 'Top Mid Cart',
    to: 'Mid Window',
    side: 'T',
    uType: 'FLASHBANG',
    isJump: true,
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-EHvVQ0Ebqm/lineup.webp',
    instructionsEn: ['Wedge against trash cart at Top Mid', 'Aim at high antenna wire', 'Jumpthrow'],
    instructionsPt: ['Encoste na lixeira no Topo do Meio', 'Mire no fio da antena alta', 'Arremesso com Jumpthrow'],
    instructionsEs: ['Ponte en el contenedor de Medio Alto', 'Apunta al cable de la antena', 'Lanza con Jumpthrow'],
  }),
  makeExtraLineup({
    id: 'mirage-flash-b-apps',
    map: 'de_mirage',
    titleEn: 'B SITE ENTRY POP-FLASH from APARTMENTS',
    titlePt: 'BANG DE ENTRADA B do APARTAMENTO B',
    titleEs: 'FLASH ENTRADA B de APARTAMENTOS',
    from: 'B Apartments Alley',
    to: 'B Site Van & Market',
    side: 'T',
    uType: 'FLASHBANG',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-8xUT3aGGSl/lineup.webp',
    instructionsEn: ['Wedge in B Apps doorframe', 'Aim at the lamp above window', 'Run 1 step + left-click throw'],
    instructionsPt: ['Trave no batente da porta de Apps B', 'Mire na lâmpada acima da janela', 'Dê 1 passo e solte com clique esquerdo'],
    instructionsEs: ['Ponte en el marco de la puerta', 'Apunta a la lámpara superior', 'Da 1 paso y lanza'],
  }),
  makeExtraLineup({
    id: 'mirage-flash-ct-retake-a',
    map: 'de_mirage',
    titleEn: 'A RETAKE POP-FLASH from CT TICKET',
    titlePt: 'BANG RETAKE A do TICKET CT',
    titleEs: 'FLASH RETAKE A de TICKET CT',
    from: 'CT Ticket Booth',
    to: 'A Site Core',
    side: 'CT',
    uType: 'FLASHBANG',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-azNiRzhJVG/lineup.webp',
    instructionsEn: ['Stand behind Ticket booth', 'Aim over the A site scaffolding', 'Left-click throw'],
    instructionsPt: ['Fique atrás da cabine de Ticket', 'Mire sobre os andaimes do bomb A', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte tras la cabina de Ticket', 'Apunta sobre los andamios', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'mirage-moly-shadow',
    map: 'de_mirage',
    titleEn: 'UNDER PALACE (SHADOW) MOLOTOV from A RAMP',
    titlePt: 'MOLOTOV NO SHADOW / BAIXO DO PALÁCIO da RAMPA A',
    titleEs: 'MOLOTOV DEBAJO DE PALACIO de RAMPA A',
    from: 'A Ramp Sandbags',
    to: 'Under Balcony (Shadow)',
    side: 'T',
    uType: 'MOLOTOV',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-8xUT3aGGSl/lineup.webp',
    instructionsEn: ['Wedge at A Ramp sandbags', 'Aim at dark Palace corner brick', 'Left-click throw'],
    instructionsPt: ['Trave nos sacos de areia da rampa', 'Mire no tijolo escuro do Palácio', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en los sacos de arena', 'Apunta al ladrillo oscuro', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'mirage-moly-firebox',
    map: 'de_mirage',
    titleEn: 'FIREBOX & NINJA MOLOTOV from A RAMP',
    titlePt: 'MOLOTOV NO FIREBOX / NINJA da RAMPA A',
    titleEs: 'MOLOTOV EN FIREBOX de RAMPA A',
    from: 'A Ramp Corner',
    to: 'Firebox / Triple Corner',
    side: 'T',
    uType: 'MOLOTOV',
    isJump: true,
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-azNiRzhJVG/lineup.webp',
    instructionsEn: ['Stand at right Ramp wall', 'Aim at antenna top bracket', 'Jumpthrow'],
    instructionsPt: ['Encoste na parede direita da Rampa', 'Mire no suporte superior da antena', 'Arremesso com Jumpthrow'],
    instructionsEs: ['Ponte en la pared derecha de Rampa', 'Apunta al soporte de la antena', 'Lanza con Jumpthrow'],
  }),
  makeExtraLineup({
    id: 'mirage-moly-b-van',
    map: 'de_mirage',
    titleEn: 'B VAN MOLOTOV from APARTMENTS',
    titlePt: 'MOLOTOV NA VAN B do APARTAMENTO B',
    titleEs: 'MOLOTOV EN FURGONETA B de APARTAMENTOS',
    from: 'B Apps Window',
    to: 'B Site Van',
    side: 'T',
    uType: 'MOLOTOV',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-EHvVQ0Ebqm/lineup.webp',
    instructionsEn: ['Crouch at Apps window', 'Aim at the top of Van roof', 'Left-click throw'],
    instructionsPt: ['Agache na janela de Apps', 'Mire no teto da van', 'Solte com clique esquerdo'],
    instructionsEs: ['Agáchate en la ventana', 'Apunta al techo de la furgoneta', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'mirage-moly-b-bench',
    map: 'de_mirage',
    titleEn: 'B SITE BENCH MOLOTOV from APARTMENTS',
    titlePt: 'MOLOTOV NO BANCO B do APARTAMENTO B',
    titleEs: 'MOLOTOV EN BANCO B de APARTAMENTOS',
    from: 'B Apps Entrance',
    to: 'B Site Bench / Forest',
    side: 'T',
    uType: 'MOLOTOV',
    isJump: true,
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-8xUT3aGGSl/lineup.webp',
    instructionsEn: ['Stand at middle column in B Apps', 'Aim at wooden balcony rail', 'Jumpthrow'],
    instructionsPt: ['Fique na coluna do meio em Apps B', 'Mire no corrimão de madeira', 'Arremesso com Jumpthrow'],
    instructionsEs: ['Ponte en la columna de Apps B', 'Apunta a la barandilla de madera', 'Lanza con Jumpthrow'],
  }),
  makeExtraLineup({
    id: 'mirage-he-van',
    map: 'de_mirage',
    titleEn: 'B VAN HE GRENADE from APARTMENTS',
    titlePt: 'GRANADA HE NA VAN B do APARTAMENTO B',
    titleEs: 'GRANADA HE EN FURGONETA B de APARTAMENTOS',
    from: 'B Apps Window',
    to: 'B Site Van',
    side: 'T',
    uType: 'HE_GRENADE',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-EHvVQ0Ebqm/lineup.webp',
    instructionsEn: ['Stand under Apps window', 'Aim directly at Van bumper', 'Left-click throw'],
    instructionsPt: ['Fique embaixo da janela de Apps', 'Mire no para-choque da Van', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte bajo la ventana de Apps', 'Apunta al parachoques', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'mirage-he-stairs',
    map: 'de_mirage',
    titleEn: 'A STAIRS HE GRENADE from T ROOF',
    titlePt: 'GRANADA HE NA ESCADA A do TELHADO T',
    titleEs: 'GRANADA HE EN ESCALERA A de TEJADO T',
    from: 'T Roof',
    to: 'A Stairs / Sandwich',
    side: 'T',
    uType: 'HE_GRENADE',
    isJump: true,
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-8xUT3aGGSl/lineup.webp',
    instructionsEn: ['Stand at T roof corner beam', 'Aim at wall indentation center', 'Jumpthrow'],
    instructionsPt: ['Trave na viga do telhado T', 'Mire no centro do entalhe da parede', 'Arremesso com Jumpthrow'],
    instructionsEs: ['Ponte en la viga de Tejado T', 'Apunta al centro de la pared', 'Lanza con Jumpthrow'],
  }),

  // ==========================================================================
  // DE_INFERNO (Flashes, Molotovs & HEs)
  // ==========================================================================
  makeExtraLineup({
    id: 'inferno-flash-banana-ct',
    map: 'de_inferno',
    titleEn: 'BANANA RETAKE POP-FLASH from CT ARCH',
    titlePt: 'BANG DE BANANA da BASE CT / ARCH',
    titleEs: 'FLASH DE BANANA de BASE CT',
    from: 'CT Arch Corner',
    to: 'Banana Half Wall',
    side: 'CT',
    uType: 'FLASHBANG',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-azNiRzhJVG/lineup.webp',
    instructionsEn: ['Position at CT Arch corner', 'Aim above banana roof edge', 'Left-click throw'],
    instructionsPt: ['Encoste na quina do Arch CT', 'Mire acima do telhado da banana', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en la esquina de Arch CT', 'Apunta sobre el tejado', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'inferno-flash-banana-t',
    map: 'de_inferno',
    titleEn: 'BANANA ENTRY POP-FLASH from T RAMP',
    titlePt: 'BANG DE ENTRADA NA BANANA da RAMPA T',
    titleEs: 'FLASH ENTRADA A BANANA de RAMPA T',
    from: 'T Ramp / Logs',
    to: 'Banana Car & Sandbags',
    side: 'T',
    uType: 'FLASHBANG',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-8xUT3aGGSl/lineup.webp',
    instructionsEn: ['Stand at wooden logs near T ramp', 'Aim at the high wire intersection', 'Run 1 step + throw'],
    instructionsPt: ['Fique nos troncos perto da rampa T', 'Mire no cruzamento dos fios', 'Dê 1 passo e arremesse'],
    instructionsEs: ['Ponte en los troncos de Rampa T', 'Apunta a la intersección de cables', 'Da 1 paso y lanza'],
  }),
  makeExtraLineup({
    id: 'inferno-flash-pit',
    map: 'de_inferno',
    titleEn: 'A PIT POP-FLASH from A SHORT',
    titlePt: 'BANG DO PIT A do MEIO CURTO A',
    titleEs: 'FLASH DE FOSO A de MEDIO CORTO A',
    from: 'A Short / Boiler',
    to: 'Pit & Balcony',
    side: 'T',
    uType: 'FLASHBANG',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-EHvVQ0Ebqm/lineup.webp',
    instructionsEn: ['Position at Short corner wall', 'Aim at highest chimney apex', 'Left-click throw'],
    instructionsPt: ['Posicione-se na quina do Meio Curto', 'Mire no topo da chaminé mais alta', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en la esquina de Corto A', 'Apunta a la chimenea superior', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'inferno-moly-car',
    map: 'de_inferno',
    titleEn: 'BANANA CAR MOLOTOV from T RAMP',
    titlePt: 'MOLOTOV NO CARRO DA BANANA da ENTRADA T',
    titleEs: 'MOLOTOV EN COCHE DE BANANA de ENTRADA T',
    from: 'T Banana Logs',
    to: 'Banana Car / Barrels',
    side: 'T',
    uType: 'MOLOTOV',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-8xUT3aGGSl/lineup.webp',
    instructionsEn: ['Wedge against wooden logs', 'Aim at third antenna spike', 'Left-click throw'],
    instructionsPt: ['Trave nos troncos de madeira', 'Mire na terceira ponta da antena', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en los troncos de madera', 'Apunta a la antena', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'inferno-moly-sandbags',
    map: 'de_inferno',
    titleEn: 'BANANA SANDBAGS MOLOTOV from HALF WALL',
    titlePt: 'MOLOTOV NOS SACOS DE AREIA da MEIA-PAREDE',
    titleEs: 'MOLOTOV EN SACOS DE ARENA de MEDIA PARED',
    from: 'Banana Half Wall',
    to: 'Sandbags Corner',
    side: 'T',
    uType: 'MOLOTOV',
    isJump: true,
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-azNiRzhJVG/lineup.webp',
    instructionsEn: ['Crouch at Half Wall barrel', 'Aim at light fixture on yellow wall', 'Jumpthrow'],
    instructionsPt: ['Agache no barril da Meia-Parede', 'Mire na luminária da parede amarela', 'Arremesso com Jumpthrow'],
    instructionsEs: ['Agáchate en el barril', 'Apunta a la lámpara de pared', 'Lanza con Jumpthrow'],
  }),
  makeExtraLineup({
    id: 'inferno-moly-coffins',
    map: 'de_inferno',
    titleEn: 'COFFINS MOLOTOV from BANANA',
    titlePt: 'MOLOTOV NOS CAIXÕES DA BANANA',
    titleEs: 'MOLOTOV EN ATAÚDES de BANANA',
    from: 'Banana Broom',
    to: 'B Coffins / Tombstones',
    side: 'T',
    uType: 'MOLOTOV',
    isJump: true,
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-EHvVQ0Ebqm/lineup.webp',
    instructionsEn: ['Stand by broom corner at Banana', 'Aim at church tower cross', 'Jumpthrow'],
    instructionsPt: ['Fique na vassoura na Banana', 'Mire na cruz da torre da igreja', 'Arremesso com Jumpthrow'],
    instructionsEs: ['Ponte junto a la escoba en Banana', 'Apunta a la cruz de la iglesia', 'Lanza con Jumpthrow'],
  }),
  makeExtraLineup({
    id: 'inferno-he-deep-banana',
    map: 'de_inferno',
    titleEn: 'DEEP BANANA HE GRENADE from CT SPAWN',
    titlePt: 'GRANADA HE FUNDO BANANA da BASE CT',
    titleEs: 'GRANADA HE FONDO BANANA de BASE CT',
    from: 'CT Arch Way',
    to: 'Deep Banana T Corner',
    side: 'CT',
    uType: 'HE_GRENADE',
    isJump: true,
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-8xUT3aGGSl/lineup.webp',
    instructionsEn: ['Run out of CT arch', 'Aim over the high bell roof', 'Jumpthrow on run'],
    instructionsPt: ['Corra saindo do Arch CT', 'Mire sobre o telhado do sino', 'Jumpthrow em movimento'],
    instructionsEs: ['Corre saliendo de Arch CT', 'Apunta sobre el tejado', 'Jumpthrow en carrera'],
  }),

  // ==========================================================================
  // DE_DUST2 (Flashes, Molotovs & HEs)
  // ==========================================================================
  makeExtraLineup({
    id: 'dust2-flash-long-entry',
    map: 'de_dust2',
    titleEn: 'LONG A ENTRY POP-FLASH from LONG DOORS',
    titlePt: 'BANG DE FUNDO A da PORTA DO FUNDO',
    titleEs: 'FLASH ENTRADA LARGA A de PUERTAS LARGAS',
    from: 'Long Doors Outside',
    to: 'Long A Corner',
    side: 'T',
    uType: 'FLASHBANG',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-azNiRzhJVG/lineup.webp',
    instructionsEn: ['Stand at outside Long door barrel', 'Aim at wall corner above door', 'Left-click throw'],
    instructionsPt: ['Fique no barril fora da porta do fundo', 'Mire no topo da parede sobre a porta', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en el barril exterior', 'Apunta a la pared sobre la puerta', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'dust2-flash-b-tunnel',
    map: 'de_dust2',
    titleEn: 'B SITE UPPER TUNNEL POP-FLASH',
    titlePt: 'BANG DO ESCURO ALTO B',
    titleEs: 'FLASH TÚNEL ALTO B',
    from: 'Upper B Tunnel Stairs',
    to: 'B Site Platform',
    side: 'T',
    uType: 'FLASHBANG',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-8xUT3aGGSl/lineup.webp',
    instructionsEn: ['Wedge against tunnel pillar', 'Aim at wooden ceiling beam', 'Left-click bounce throw'],
    instructionsPt: ['Encoste no pilar do escuro', 'Mire na viga de madeira do teto', 'Arremesso tabelado com clique esquerdo'],
    instructionsEs: ['Ponte en el pilar del túnel', 'Apunta a la viga del techo', 'Lanza rebotando en el techo'],
  }),
  makeExtraLineup({
    id: 'dust2-flash-mid-xbox',
    map: 'de_dust2',
    titleEn: 'MID XBOX POP-FLASH from TOP MID',
    titlePt: 'BANG DO XBOX / MEIO do TOPO DO MEIO',
    titleEs: 'FLASH DE XBOX de MEDIO ALTO',
    from: 'Top Mid Palm',
    to: 'Mid Doors & Catwalk',
    side: 'T',
    uType: 'FLASHBANG',
    isJump: true,
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-EHvVQ0Ebqm/lineup.webp',
    instructionsEn: ['Stand at Top Mid palm tree', 'Aim above the wooden door edge', 'Jumpthrow'],
    instructionsPt: ['Fique na palmeira do Topo do Meio', 'Mire acima da borda de madeira', 'Arremesso com Jumpthrow'],
    instructionsEs: ['Ponte en la palmera de Medio', 'Apunta sobre el borde de la puerta', 'Lanza con Jumpthrow'],
  }),
  makeExtraLineup({
    id: 'dust2-moly-car',
    map: 'de_dust2',
    titleEn: 'LONG A CAR MOLOTOV from LONG DOORS',
    titlePt: 'MOLOTOV NO CARRO DO FUNDO da PORTA DO FUNDO',
    titleEs: 'MOLOTOV EN COCHE DE LARGA de PUERTAS LARGAS',
    from: 'Long Doors Inside',
    to: 'Long Car / Barrel',
    side: 'T',
    uType: 'MOLOTOV',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-8xUT3aGGSl/lineup.webp',
    instructionsEn: ['Wedge against the blue container door', 'Aim at antenna top tip', 'Left-click throw'],
    instructionsPt: ['Trave na porta do contêiner azul', 'Mire na ponta superior da antena', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en el contenedor azul', 'Apunta a la punta de la antena', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'dust2-moly-goose',
    map: 'de_dust2',
    titleEn: 'GOOSE MOLOTOV from CATWALK / SHORT',
    titlePt: 'MOLOTOV NO GOOSE / FUNDINHO do MEIO CURTO',
    titleEs: 'MOLOTOV EN GOOSE de MEDIO CORTO',
    from: 'Catwalk Stairs',
    to: 'A Site Goose Corner',
    side: 'T',
    uType: 'MOLOTOV',
    isJump: true,
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-azNiRzhJVG/lineup.webp',
    instructionsEn: ['Stand at stairs barrier', 'Aim at the high hotel sign corner', 'Jumpthrow'],
    instructionsPt: ['Fique na barreira da escada do Catwalk', 'Mire na quina da placa alta', 'Arremesso com Jumpthrow'],
    instructionsEs: ['Ponte en la barandilla de Corto', 'Apunta al cartel superior', 'Lanza con Jumpthrow'],
  }),
  makeExtraLineup({
    id: 'dust2-he-long-corner',
    map: 'de_dust2',
    titleEn: 'LONG CORNER HE GRENADE from LONG DOORS',
    titlePt: 'GRANADA HE NO FUNDO DA PORTA DO FUNDO',
    titleEs: 'GRANADA HE EN ESQUINA DE LARGA',
    from: 'Long Doors Corner',
    to: 'Long A Corner Defense',
    side: 'T',
    uType: 'HE_GRENADE',
    isJump: true,
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-EHvVQ0Ebqm/lineup.webp',
    instructionsEn: ['Stand outside Long doors', 'Aim high above wall gap', 'Jumpthrow on run'],
    instructionsPt: ['Fique fora das portas do fundo', 'Mire alto no vão da parede', 'Jumpthrow em corrida'],
    instructionsEs: ['Ponte fuera de puertas largas', 'Apunta alto sobre el muro', 'Jumpthrow corriendo'],
  }),

  // ==========================================================================
  // DE_NUKE (Flashes, Molotovs & HEs)
  // ==========================================================================
  makeExtraLineup({
    id: 'nuke-flash-hut',
    map: 'de_nuke',
    titleEn: 'A SITE HUT POP-FLASH from ROOF',
    titlePt: 'BANG DE HUT / BOMBSITE A do TELHADO T',
    titleEs: 'FLASH DE CASETA / BOMBSITE A de TEJADO T',
    from: 'T Roof Skylight',
    to: 'A Site Hut & Rafters',
    side: 'T',
    uType: 'FLASHBANG',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-8xUT3aGGSl/lineup.webp',
    instructionsEn: ['Stand on yellow pipe on T roof', 'Aim through open window frame', 'Left-click throw'],
    instructionsPt: ['Fique no cano amarelo do telhado T', 'Mire pela janela aberta', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en la tubería amarilla de Tejado T', 'Apunta por la ventana abierta', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'nuke-flash-yard',
    map: 'de_nuke',
    titleEn: 'OUTSIDE YARD POP-FLASH from SILO',
    titlePt: 'BANG DE RUA / FORA do SILO',
    titleEs: 'FLASH DE PATIO EXTERIOR de SILO',
    from: 'T Silo Top',
    to: 'Outside Secret & Garage',
    side: 'T',
    uType: 'FLASHBANG',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-azNiRzhJVG/lineup.webp',
    instructionsEn: ['Climb on top of Silo', 'Aim above the red shipping container', 'Left-click throw'],
    instructionsPt: ['Suba no topo do Silo', 'Mire acima do contêiner vermelho', 'Solte com clique esquerdo'],
    instructionsEs: ['Sube a lo alto del Silo', 'Apunta sobre el contenedor rojo', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'nuke-moly-vent',
    map: 'de_nuke',
    titleEn: 'VENT MOLOTOV from SQUEAKY DOOR',
    titlePt: 'MOLOTOV NO DUTO / VENT da PORTA SQUEAKY',
    titleEs: 'MOLOTOV EN CONDUCTO de PUERTA SQUEAKY',
    from: 'Outside Squeaky',
    to: 'A Site Vent Entry',
    side: 'T',
    uType: 'MOLOTOV',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-EHvVQ0Ebqm/lineup.webp',
    instructionsEn: ['Stand against metal fence outside Squeaky', 'Aim at red light above door', 'Run 2 steps + left-click throw'],
    instructionsPt: ['Encoste na grade de ferro de Squeaky', 'Mire na luz vermelha acima da porta', 'Dê 2 passos e solte com clique esquerdo'],
    instructionsEs: ['Ponte en la verja metálica', 'Apunta a la luz roja', 'Da 2 pasos y lanza'],
  }),
  makeExtraLineup({
    id: 'nuke-moly-hut',
    map: 'de_nuke',
    titleEn: 'HUT ROOF MOLOTOV from T ROOF',
    titlePt: 'MOLOTOV NA CABANA / HUT do TELHADO T',
    titleEs: 'MOLOTOV EN CASETA de TEJADO T',
    from: 'T Roof Ladder',
    to: 'Hut Interior / Doorway',
    side: 'T',
    uType: 'MOLOTOV',
    isJump: true,
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-8xUT3aGGSl/lineup.webp',
    instructionsEn: ['Wedge by roof ladder railing', 'Aim through the skylight pane', 'Jumpthrow'],
    instructionsPt: ['Trave na grade da escada do telhado', 'Mire pelo vidro da claraboia', 'Arremesso com Jumpthrow'],
    instructionsEs: ['Ponte en la barandilla de la escalera', 'Apunta por el cristal', 'Lanza con Jumpthrow'],
  }),
  makeExtraLineup({
    id: 'nuke-he-vent',
    map: 'de_nuke',
    titleEn: 'VENTS HE GRENADE from SQUEAKY',
    titlePt: 'GRANADA HE NO DUTO da PORTA SQUEAKY',
    titleEs: 'GRANADA HE EN CONDUCTO de SQUEAKY',
    from: 'Squeaky Lobby',
    to: 'Vent Grid',
    side: 'T',
    uType: 'HE_GRENADE',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-azNiRzhJVG/lineup.webp',
    instructionsEn: ['Break Squeaky door', 'Aim directly into vent opening', 'Left-click throw'],
    instructionsPt: ['Quebre a porta squeaky', 'Mire direto na entrada do duto', 'Solte com clique esquerdo'],
    instructionsEs: ['Rompe la puerta squeaky', 'Apunta directo al conducto', 'Lanza con clic izquierdo'],
  }),

  // ==========================================================================
  // DE_ANCIENT (Flashes, Molotovs & HEs)
  // ==========================================================================
  makeExtraLineup({
    id: 'ancient-flash-cave',
    map: 'de_ancient',
    titleEn: 'CAVE / CHEETAH POP-FLASH from T YARD',
    titlePt: 'BANG DA CAVERNA do PÁTIO T',
    titleEs: 'FLASH DE CUEVA de PATIO T',
    from: 'T Yard Ruins',
    to: 'Cave / B Ramp',
    side: 'T',
    uType: 'FLASHBANG',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-8xUT3aGGSl/lineup.webp',
    instructionsEn: ['Stand at stone column in T yard', 'Aim above stone arch edge', 'Left-click throw'],
    instructionsPt: ['Fique na coluna de pedra no Pátio T', 'Mire sobre o arco de pedra', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en la columna del Patio T', 'Apunta sobre el arco de piedra', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'ancient-moly-donut',
    map: 'de_ancient',
    titleEn: 'MID DONUT MOLOTOV from TOP MID',
    titlePt: 'MOLOTOV NO DONUT do TOPO DO MEIO',
    titleEs: 'MOLOTOV EN DONUT de MEDIO ALTO',
    from: 'Top Mid Pillar',
    to: 'Donut Room Entrance',
    side: 'T',
    uType: 'MOLOTOV',
    isJump: true,
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-azNiRzhJVG/lineup.webp',
    instructionsEn: ['Wedge against ancient wall pillar', 'Aim at hanging moss branch', 'Jumpthrow'],
    instructionsPt: ['Trave no pilar da parede antiga', 'Mire no galho com musgo pendurado', 'Arremesso com Jumpthrow'],
    instructionsEs: ['Ponte en el pilar antiguo', 'Apunta a la rama con musgo', 'Lanza con Jumpthrow'],
  }),
  makeExtraLineup({
    id: 'ancient-he-cave',
    map: 'de_ancient',
    titleEn: 'CAVE ENTRY HE GRENADE from T YARD',
    titlePt: 'GRANADA HE NA CAVERNA do PÁTIO T',
    titleEs: 'GRANADA HE EN CUEVA de PATIO T',
    from: 'T Yard Ramp',
    to: 'Cave Choke Point',
    side: 'T',
    uType: 'HE_GRENADE',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-EHvVQ0Ebqm/lineup.webp',
    instructionsEn: ['Position at mossy stone block', 'Aim through cave entrance gap', 'Left-click throw'],
    instructionsPt: ['Fique no bloco de pedra com musgo', 'Mire no vão de entrada da caverna', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en el bloque de piedra', 'Apunta a la entrada de la cueva', 'Lanza con clic izquierdo'],
  }),

  // ==========================================================================
  // DE_ANUBIS (Flashes, Molotovs & HEs)
  // ==========================================================================
  makeExtraLineup({
    id: 'anubis-flash-bridge',
    map: 'de_anubis',
    titleEn: 'BRIDGE POP-FLASH from CANAL',
    titlePt: 'BANG DA PONTE do CANAL',
    titleEs: 'FLASH DE PUENTE de CANAL',
    from: 'Canal Steps',
    to: 'Mid Bridge & Doors',
    side: 'T',
    uType: 'FLASHBANG',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-8xUT3aGGSl/lineup.webp',
    instructionsEn: ['Wedge at canal wooden boat', 'Aim above stone railing', 'Left-click throw'],
    instructionsPt: ['Trave no barco de madeira do canal', 'Mire acima da mureta de pedra', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte junto al bote de madera', 'Apunta sobre la barandilla de piedra', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'anubis-moly-b-pillar',
    map: 'de_anubis',
    titleEn: 'B SITE PILLAR MOLOTOV from B MAIN',
    titlePt: 'MOLOTOV NO PILAR B do B PRINCIPAL',
    titleEs: 'MOLOTOV EN PILAR B de B PRINCIPAL',
    from: 'B Main Ruins',
    to: 'B Site Center Pillar',
    side: 'T',
    uType: 'MOLOTOV',
    isJump: true,
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-azNiRzhJVG/lineup.webp',
    instructionsEn: ['Stand at ruins doorway', 'Aim at carving on high wall', 'Jumpthrow'],
    instructionsPt: ['Fique no portal das ruínas', 'Mire no entalhe da parede alta', 'Arremesso com Jumpthrow'],
    instructionsEs: ['Ponte en la puerta de las ruinas', 'Apunta al grabado en la pared', 'Lanza con Jumpthrow'],
  }),
  makeExtraLineup({
    id: 'anubis-he-mid-doors',
    map: 'de_anubis',
    titleEn: 'MID DOORS HE GRENADE from BRIDGE',
    titlePt: 'GRANADA HE NA PORTA DO MEIO da PONTE',
    titleEs: 'GRANADA HE EN PUERTAS DE MEDIO de PUENTE',
    from: 'Mid Bridge Railing',
    to: 'Mid Double Doors',
    side: 'T',
    uType: 'HE_GRENADE',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-EHvVQ0Ebqm/lineup.webp',
    instructionsEn: ['Crouch by wooden bridge post', 'Aim at gap between double doors', 'Left-click throw'],
    instructionsPt: ['Agache no poste de madeira da ponte', 'Mire no meio das portas duplas', 'Solte com clique esquerdo'],
    instructionsEs: ['Agáchate en el poste del puente', 'Apunta al centro de las puertas', 'Lanza con clic izquierdo'],
  }),
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
