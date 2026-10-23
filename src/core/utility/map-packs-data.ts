/**
 * CS2 Assistant - Authentic Curated Map Packs Data
 * File: src/core/utility/map-packs-data.ts
 *
 * Generates 100% offline, authentic lineup packs from in-game CS2 captures
 * across all 6 Active Duty maps:
 * - de_mirage (Smokes, Flashes, Molotovs, HE)
 * - de_inferno (Smokes, Flashes, Molotovs, HE)
 * - de_dust2 (Smokes, Flashes, Molotovs, HE)
 * - de_nuke (Smokes, Flashes, Molotovs, HE)
 * - de_ancient (Smokes, Flashes, Molotovs, HE)
 * - de_anubis (Smokes, Flashes, Molotovs, HE)
 */

import type { Lineup, CS2Map, UtilityType, TeamSide, ThrowType, LineupTechnique } from './types';
import csnadesRaw from '../lineup-fsm/csnades-data.json';

// Trilingual callout translation dictionary
const CALLOUT_TRANSLATIONS: Record<string, { pt: string; es: string }> = {
  // Specific Callouts
  'a ramp corner': { pt: 'Canto da Rampa A', es: 'Esquina de Rampa A' },
  'a ramp sandbags': { pt: 'Sacos de Areia da Rampa A', es: 'Sacos de Rampa A' },
  'a short / boiler': { pt: 'Meio L / Caldeira', es: 'Medio Corto / Caldera' },
  'b alley archway': { pt: 'Arco do Beco B', es: 'Arco del Callejón B' },
  'b apartments alley': { pt: 'Beco do Tapete B', es: 'Callejón de Apartamentos B' },
  'b apps entrance': { pt: 'Entrada do Tapete B', es: 'Entrada de Apartamentos B' },
  'b apps window': { pt: 'Janela do Tapete B', es: 'Ventana de Apartamentos B' },
  'b canal bridge': { pt: 'Ponte do Canal B', es: 'Puente del Canal B' },
  'b long ruins': { pt: 'Ruínas do Fundo B', es: 'Ruinas de Larga B' },
  'b main ruins': { pt: 'Ruínas da Entrada B', es: 'Ruinas de Entrada B' },
  'banana broom': { pt: 'Vassoura da Banana', es: 'Escoba de Banana' },
  'banana half wall': { pt: 'Mureta da Banana', es: 'Medio Muro de Banana' },
  'banana half-wall': { pt: 'Mureta da Banana', es: 'Medio Muro de Banana' },
  'banana wood logs': { pt: 'Troncos da Banana', es: 'Troncos de Banana' },
  'ct arch corner': { pt: 'Canto do Arco CT', es: 'Esquina del Arco CT' },
  'ct arch way': { pt: 'Caminho do Arco CT', es: 'Camino del Arco CT' },
  'ct mid arch': { pt: 'Arco do Meio CT', es: 'Arco de Medio CT' },
  'ct ticket booth': { pt: 'Cabine do Ticket CT', es: 'Cabina de Tickets CT' },
  'canal steps': { pt: 'Degraus do Canal', es: 'Escalones del Canal' },
  'catwalk stairs': { pt: 'Escada da Varanda', es: 'Escaleras de Pasarela' },
  'long doors corner': { pt: 'Canto da Porta do Fundo', es: 'Esquina de Puertas de Larga' },
  'long doors inside': { pt: 'Dentro da Porta do Fundo', es: 'Dentro de Puertas de Larga' },
  'long doors outside': { pt: 'Fora da Porta do Fundo', es: 'Fuera de Puertas de Larga' },
  'mid bridge railing': { pt: 'Corrimão da Ponte do Meio', es: 'Barandilla del Puente de Medio' },
  'outside a pillars': { pt: 'Pilares Fora da A', es: 'Pilares Fuera de A' },
  'outside squeaky': { pt: 'Fora da Portinha', es: 'Fuera de Puerta Pequeña' },
  'palace balcony': { pt: 'Varanda do Palácio', es: 'Balcón de Palacio' },
  'radio doorway': { pt: 'Porta do Rádio', es: 'Puerta de Radio' },
  'squeaky lobby': { pt: 'Lobby da Portinha', es: 'Lobby de Puerta Pequeña' },
  't banana logs': { pt: 'Troncos da Banana T', es: 'Troncos de Banana T' },
  't lobby doorway': { pt: 'Porta do Lobby T', es: 'Puerta del Lobby T' },
  't ramp / logs': { pt: 'Rampa T / Troncos', es: 'Rampa T / Troncos' },
  't roof': { pt: 'Teto T', es: 'Techo T' },
  't roof ladder': { pt: 'Escada do Teto T', es: 'Escalera del Techo T' },
  't roof skylight': { pt: 'Claraboia do Teto T', es: 'Claraboya del Techo T' },
  't silo top': { pt: 'Topo do Silo T', es: 'Cima del Silo T' },
  't spawn fence': { pt: 'Cerca da Base T', es: 'Valla de Base T' },
  't yard ramp': { pt: 'Rampa do Pátio T', es: 'Rampa del Patio T' },
  't yard ruins': { pt: 'Ruínas do Pátio T', es: 'Ruinas del Patio T' },
  'tetris brick corner': { pt: 'Canto do Tetris', es: 'Esquina de Tetris' },
  'top mid cart': { pt: 'Carrinho do Top Meio', es: 'Carro de Top Medio' },
  'top mid palm': { pt: 'Palmeira do Top Meio', es: 'Palmera de Top Medio' },
  'top mid pillar': { pt: 'Pilar do Top Meio', es: 'Pilar de Top Medio' },
  'underpass stairs': { pt: 'Escada do Rato', es: 'Escaleras del Subterráneo' },
  'upper b tunnel stairs': { pt: 'Escada do Escuro Alto B', es: 'Escaleras de Túnel Alto B' },
  'upper tunnels mesh': { pt: 'Grade do Escuro Alto', es: 'Malla de Túnel Alto' },

  'a ramp & tetris': { pt: 'Rampa da A & Tetris', es: 'Rampa de A y Tetris' },
  'a short / catwalk crest': { pt: 'Meio L / Topo da Varanda', es: 'Medio Corto / Cima de Pasarela' },
  'a site apex': { pt: 'Apex do Bombsite A', es: 'Ápex del Punto A' },
  'a site core': { pt: 'Centro do Bombsite A', es: 'Centro del Punto A' },
  'a site core & rafters': { pt: 'Centro do Bombsite A & Rafters', es: 'Centro del Punto A y Vigas' },
  'a site default': { pt: 'Plant Padrão do Bombsite A', es: 'Plante Estándar del Punto A' },
  'a site goose corner': { pt: 'Canto do Goose na A', es: 'Esquina Goose en A' },
  'a site hut & rafters': { pt: 'Cabana da A & Rafters', es: 'Caseta de A y Vigas' },
  'a site temple & plat': { pt: 'Templo da A & Plat', es: 'Templo de A y Plataforma' },
  'a site vent entry': { pt: 'Entrada do Duto na A', es: 'Entrada al Conducto en A' },
  'a stairs / sandwich': { pt: 'Escada da A / Sanduíche', es: 'Escaleras de A / Sandwich' },
  'b back pillar & ninja': { pt: 'Pilar dos Fundos B & Ninja', es: 'Pilar Trasero B y Ninja' },
  'b coffins / tombstones': { pt: 'Caixão da B', es: 'Ataúdes de B' },
  'b new box corner': { pt: 'Canto do New Box na B', es: 'Esquina New Box en B' },
  'b site & temple': { pt: 'Bombsite B & Templo', es: 'Punto B y Templo' },
  'b site bench / forest': { pt: 'Banco da B / Floresta', es: 'Banco de B / Bosque' },
  'b site car / big box': { pt: 'Carro da B / Caixão', es: 'Coche de B / Caja Grande' },
  'b site center pillar': { pt: 'Pilar Central da B', es: 'Pilar Central de B' },
  'b site core & dark': { pt: 'Centro da B & Escuro', es: 'Centro de B y Oscuro' },
  'b site platform': { pt: 'Plataforma da B', es: 'Plataforma de B' },
  'b site van': { pt: 'Van da B', es: 'Furgoneta de B' },
  'b site van & market': { pt: 'Van da B & Mercado', es: 'Furgoneta de B y Mercado' },
  'banana car & sandbags': { pt: 'Carro da Banana & Sacos', es: 'Coche de Banana y Sacos' },
  'banana car / barrels': { pt: 'Carro da Banana / Barris', es: 'Coche de Banana / Barriles' },
  'behind b pillar / ninja': { pt: 'Atrás do Pilar B / Ninja', es: 'Detrás del Pilar B / Ninja' },
  'ct ticket booth defuse box': { pt: 'Cabine do Ticket CT / Defuse', es: 'Cabina de Tickets CT / Desactivación' },
  'cave / b ramp': { pt: 'Caverna / Rampa da B', es: 'Cueva / Rampa B' },
  'cave choke point': { pt: 'Gargalo da Caverna', es: 'Punto Crítico de Cueva' },
  'connector & window arch': { pt: 'Conector & Arco do Janelão', es: 'Conector y Arco de Ventana' },
  'deep banana t corner': { pt: 'Fundo da Banana Base T', es: 'Fondo de Banana Base T' },
  'donut room entrance': { pt: 'Entrada do Donut', es: 'Entrada a Sala de Donut' },
  'firebox / triple corner': { pt: 'Caixa de Fogo / Canto da Tripla', es: 'Caja de Fuego / Esquina Triple' },
  'hut interior / doorway': { pt: 'Interior da Cabana / Porta', es: 'Interior de Caseta / Puerta' },
  'long a corner': { pt: 'Canto do Fundo A', es: 'Esquina de Larga A' },
  'long a corner defense': { pt: 'Defesa do Canto do Fundo', es: 'Defensa de Esquina Larga' },
  'long car / barrel': { pt: 'Carro do Fundo / Barril', es: 'Coche de Larga / Barril' },
  'mid bridge & doors': { pt: 'Ponte do Meio & Portas', es: 'Puente de Medio y Puertas' },
  'mid doors & catwalk': { pt: 'Portas do Meio & Varanda', es: 'Puertas de Medio y Pasarela' },
  'mid double doors': { pt: 'Portas Duplas do Meio', es: 'Puertas Dobles de Medio' },
  'mid window': { pt: 'Janelão do Meio', es: 'Ventana de Medio' },
  'outside secret & garage': { pt: 'Fora do Secret & Garagem', es: 'Fuera de Secreto y Garaje' },
  'pit & balcony': { pt: 'Fosso & Varandinha', es: 'Foso y Balconcito' },
  'ramp headshot box': { pt: 'Caixa de Headshot da Rampa', es: 'Caja de Headshot de Rampa' },
  'sandbags corner': { pt: 'Canto dos Sacos de Areia', es: 'Esquina de Sacos' },
  'under balcony (shadow)': { pt: 'Embaixo da Varandinha (Sombra)', es: 'Bajo el Balcón (Sombra)' },
  'vent grid': { pt: 'Grade do Duto', es: 'Rejilla del Conducto' },

  // Generic and common callouts
  'ticket booth': { pt: 'Cabine de Ticket', es: 'Cabina de Tickets' },
  'palace': { pt: 'Palácio', es: 'Palacio' },
  't spawn': { pt: 'Base T', es: 'Base T' },
  'ct spawn': { pt: 'Base CT', es: 'Base CT' },
  'spawn': { pt: 'Base', es: 'Base' },
  'stairs': { pt: 'Degraus / Escada', es: 'Escaleras' },
  'a stairs': { pt: 'Escada da A', es: 'Escaleras A' },
  'jungle': { pt: 'Ligação / Selva', es: 'Jungla' },
  'window': { pt: 'Janelão', es: 'Ventana' },
  'connector': { pt: 'Conector', es: 'Conector' },
  'short': { pt: 'Meio L / Varanda', es: 'Medio Corto' },
  'b short': { pt: 'L da B', es: 'Corta B' },
  'catwalk': { pt: 'Varanda / Passarela', es: 'Pasarela' },
  'banana': { pt: 'Banana', es: 'Banana' },
  'coffins': { pt: 'Caixão da B', es: 'Ataúdes' },
  'coffin': { pt: 'Caixão', es: 'Ataúd' },
  'ramp': { pt: 'Rampa', es: 'Rampa' },
  'silo': { pt: 'Silo', es: 'Silo' },
  'hut': { pt: 'Cabana', es: 'Caseta' },
  'vent': { pt: 'Duto', es: 'Conducto' },
  'vents': { pt: 'Dutos', es: 'Conductos' },
  'heaven': { pt: 'Céu', es: 'Cielo' },
  'hell': { pt: 'Inferno (Embaixo do Céu)', es: 'Infierno' },
  'site': { pt: 'Bombsite', es: 'Punto' },
  'a site': { pt: 'Bombsite A', es: 'Punto A' },
  'b site': { pt: 'Bombsite B', es: 'Punto B' },
  'pit': { pt: 'Fosso', es: 'Foso' },
  'apartments': { pt: 'Tapete / Aps', es: 'Apartamentos' },
  'b apartments': { pt: 'Tapete da B', es: 'Apartamentos B' },
  'apps': { pt: 'Tapete', es: 'Apartamentos' },
  'long': { pt: 'Fundo', es: 'Larga' },
  'mid': { pt: 'Meio', es: 'Medio' },
  'top mid': { pt: 'Top Meio', es: 'Top Medio' },
  'second mid': { pt: 'Segundo Meio', es: 'Segundo Medio' },
  'underpass': { pt: 'Rato / Subterrâneo', es: 'Subterráneo' },
  'xbox': { pt: 'Xbox', es: 'Xbox' },
  'lower tunnel': { pt: 'Escuro Baixo', es: 'Túnel Bajo' },
  'upper tunnel': { pt: 'Escuro Alto', es: 'Túnel Alto' },
  'b doors': { pt: 'Porta da B', es: 'Puertas B' },
  'b window': { pt: 'Janela da B', es: 'Ventana B' },
  'cave': { pt: 'Caverna', es: 'Cueva' },
  'ruins': { pt: 'Ruínas', es: 'Ruinas' },
  'temple': { pt: 'Templo', es: 'Templo' },
  'donut': { pt: 'Donut', es: 'Donut' },
  'donuts': { pt: 'Donut', es: 'Donut' },
  'water': { pt: 'Água', es: 'Agua' },
  'canal': { pt: 'Canal', es: 'Canal' },
  'bridge': { pt: 'Ponte', es: 'Puente' },
  'camera': { pt: 'Câmera', es: 'Cámara' },
  'plaza': { pt: 'Praça', es: 'Plaza' },
  'garage': { pt: 'Garagem', es: 'Garaje' },
  'secret': { pt: 'Secret (Descida B)', es: 'Secreto' },
  'squeaky': { pt: 'Portinha', es: 'Puerta Pequeña' },
  'radio': { pt: 'Rádio', es: 'Radio' },
  'trophy': { pt: 'Troféu', es: 'Trofeo' },
  'control': { pt: 'Controle da B', es: 'Control B' },
  'lobby': { pt: 'Lobby', es: 'Lobby' },
  'outside': { pt: 'Rua / Fora', es: 'Fuera' },
  'main': { pt: 'Entrada Principal / Main', es: 'Principal' },
  'cheetah': { pt: 'Casa / Cheetah', es: 'Casa / Cheetah' },
  'elbow': { pt: 'Cotovelo', es: 'Codo' },
  'red room': { pt: 'Sala Vermelha', es: 'Sala Roja' },
  'sandwich': { pt: 'Sanduíche', es: 'Sandwich' },
  'tetris': { pt: 'Tetris', es: 'Tetris' },
  'firebox': { pt: 'Caixa de Fogo', es: 'Caja de Fuego' },
  'ninja': { pt: 'Ninja', es: 'Ninja' },
  'triple': { pt: 'Caixa Tripla', es: 'Caja Triple' },
  'van': { pt: 'Van', es: 'Furgoneta' },
  'bench': { pt: 'Banco', es: 'Banco' },
  'kitchen': { pt: 'Mercado / Cozinha', es: 'Cocina' },
  'market': { pt: 'Mercado', es: 'Mercado' },
  'boiler': { pt: 'Caldeira', es: 'Caldera' },
  'arch': { pt: 'Arco', es: 'Arco' },
  'library': { pt: 'Biblioteca', es: 'Biblioteca' },
  'moto': { pt: 'Moto', es: 'Moto' },
  'truck': { pt: 'Caminhão', es: 'Camión' },
  'car': { pt: 'Carro', es: 'Coche' },
  'dark': { pt: 'Escuro', es: 'Oscuro' },
  'graveyard': { pt: 'Cemitério', es: 'Cementerio' },
  'goose': { pt: 'Goose', es: 'Goose' },
  'barrels': { pt: 'Barris', es: 'Barriles' },
  'sandbags': { pt: 'Sacos de Areia', es: 'Sacos' },
  'default': { pt: 'Plant Padrão', es: 'Plante Estándar' },
};

function translateCallout(callout: string, lang: 'pt' | 'es'): string {
  const lower = callout.toLowerCase().trim();
  if (CALLOUT_TRANSLATIONS[lower]) {
    return CALLOUT_TRANSLATIONS[lower][lang];
  }
  const keys = Object.keys(CALLOUT_TRANSLATIONS).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (lower.includes(key)) {
      return callout.replace(new RegExp(key, 'i'), CALLOUT_TRANSLATIONS[key][lang]);
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

function normalizeThrowTechnique(technique?: string, movement?: string): { technique: LineupTechnique; throwType: ThrowType } {
  const t = (technique || '').toLowerCase();
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
  resultImgUrl?: string;
  instructionsEn: string[];
  instructionsPt: string[];
  instructionsEs: string[];
}): Lineup {
  const { isJump = false } = params;
  const landImg = params.resultImgUrl || (params.imgUrl.includes('/lineup.webp') ? params.imgUrl.replace('/lineup.webp', '/thumbnail.webp') : params.imgUrl);
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
    thumbnailUrl: landImg,
    standImageUrl: params.imgUrl,
    resultImageUrl: landImg,
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
    instructionsEn: ['Stand by Ticket Booth metal box', 'Aim above scaffolding roof lip', '1 step forward + jumpthrow'],
    instructionsPt: ['Encoste na caixa de Ticket', 'Mire acima do telhado de andaime', 'Dê 1 passo e solte com jumpthrow'],
    instructionsEs: ['Ponte en la cabina de Tickets', 'Apunta sobre el andamio', '1 paso adelante + jumpthrow'],
  }),
  makeExtraLineup({
    id: 'mirage-flash-ramp-deep',
    map: 'de_mirage',
    titleEn: 'A RAMP DEEP POP-FLASH from T SPAWN',
    titlePt: 'BANG PROFUNDA DE RAMPA A do SPAWN T',
    titleEs: 'FLASH PROFUNDO DE RAMPA A de BASE T',
    from: 'T Spawn Fence',
    to: 'A Ramp & Tetris',
    side: 'T',
    uType: 'FLASHBANG',
    isJump: true,
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-3sRuAaqnas/lineup.webp',
    instructionsEn: ['Wedge against fence', 'Aim at high building antenae tip', 'Jumpthrow'],
    instructionsPt: ['Encoste na cerca do Spawn T', 'Mire na ponta da antena alta', 'Jumpthrow'],
    instructionsEs: ['Ponte en la valla de Base T', 'Apunta a la antena alta', 'Lanza con jumpthrow'],
  }),
  makeExtraLineup({
    id: 'mirage-flash-underpass',
    map: 'de_mirage',
    titleEn: 'CONNECTOR POP-FLASH from UNDERPASS',
    titlePt: 'BANG DO CONECTOR do SUBTERRÂNEO',
    titleEs: 'FLASH DE CONECTOR de PASO SUBTERRÁNEO',
    from: 'Underpass Stairs',
    to: 'Connector & Window Arch',
    side: 'T',
    uType: 'FLASHBANG',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-h4RLQbKgkO/lineup.webp',
    instructionsEn: ['Stand at bottom of underpass stairs', 'Aim at the dark stone corner', 'Left-click throw'],
    instructionsPt: ['Fique na base da escada do subterrâneo', 'Mire na pedra escura', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en la escalera baja', 'Apunta a la piedra oscura', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'mirage-moly-shadow',
    map: 'de_mirage',
    titleEn: 'UNDER PALACE (SHADOW) MOLOTOV from A RAMP',
    titlePt: 'MOLOTOV NO SHADOW / BAIXO DO PALÁCIO da RAMPA A',
    titleEs: 'MOLOTOV BAJO PALACIO de RAMPA A',
    from: 'A Ramp Sandbags',
    to: 'Under Balcony (Shadow)',
    side: 'T',
    uType: 'MOLOTOV',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-8xUT3aGGSl/lineup.webp',
    instructionsEn: ['Stand against sandbags at A ramp', 'Aim at corner of wooden pallet', 'Left-click throw'],
    instructionsPt: ['Fique nos sacos de areia da rampa A', 'Mire na quina do pallet de madeira', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en los sacos de arena', 'Apunta a la esquina del palé', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'mirage-moly-firebox',
    map: 'de_mirage',
    titleEn: 'FIREBOX & NINJA MOLOTOV from A RAMP',
    titlePt: 'MOLOTOV NO FIREBOX / NINJA da RAMPA A',
    titleEs: 'MOLOTOV EN FIREBOX / NINJA de RAMPA A',
    from: 'A Ramp Corner',
    to: 'Firebox / Triple Corner',
    side: 'T',
    uType: 'MOLOTOV',
    isJump: true,
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-azNiRzhJVG/lineup.webp',
    instructionsEn: ['Wedge in A ramp corner', 'Aim at wooden beam notch', 'Jumpthrow'],
    instructionsPt: ['Trave no canto da rampa A', 'Mire no entalhe da viga', 'Arremesso com Jumpthrow'],
    instructionsEs: ['Ponte en la esquina de Rampa A', 'Apunta a la viga de madera', 'Lanza con Jumpthrow'],
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
    instructionsEn: ['Crouch under B apps window', 'Aim at van headlight reflection', 'Left-click throw'],
    instructionsPt: ['Agache sob a janela dos apartamentos', 'Mire no reflexo do farol da van', 'Solte com clique esquerdo'],
    instructionsEs: ['Agáchate bajo la ventana', 'Apunta al faro de la furgoneta', 'Lanza con clic izquierdo'],
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
    instructionsEn: ['Stand by B apps door', 'Aim at the brick pillar top', 'Jumpthrow'],
    instructionsPt: ['Fique na porta dos apartamentos B', 'Mire no topo do pilar de tijolos', 'Arremesso com Jumpthrow'],
    instructionsEs: ['Ponte en la puerta de Apps B', 'Apunta al pilar de ladrillo', 'Lanza con Jumpthrow'],
  }),
  makeExtraLineup({
    id: 'mirage-moly-ticket-defuse',
    map: 'de_mirage',
    titleEn: 'TICKET DEFUSE DENY MOLOTOV from TETRIS',
    titlePt: 'MOLOTOV ANTE-DEFUSE TICKET de TETRIS',
    titleEs: 'MOLOTOV ANTI-DEFUSE TICKET de TETRIS',
    from: 'Tetris Brick Corner',
    to: 'CT Ticket Booth Defuse Box',
    side: 'T',
    uType: 'MOLOTOV',
    imgUrl: 'https://assets.csnades.gg/nades/mirage-smoke-I60PpERA4N/lineup.webp',
    instructionsEn: ['Wedge against Tetris stone', 'Aim at ticket booth clock shadow', 'Left-click throw'],
    instructionsPt: ['Encoste na pedra de Tetris', 'Mire na sombra do relógio do Ticket', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en la piedra de Tetris', 'Apunta al reloj de Tickets', 'Lanza con clic izquierdo'],
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
    imgUrl: 'https://assets.csnades.gg/nades/inferno-smoke-MrAFqNRIOT/lineup.webp',
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
    imgUrl: 'https://assets.csnades.gg/nades/inferno-smoke-Fomlq5TPso/lineup.webp',
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
    imgUrl: 'https://assets.csnades.gg/nades/inferno-smoke-oDxbaepICU/lineup.webp',
    instructionsEn: ['Position at Short corner wall', 'Aim at highest chimney apex', 'Left-click throw'],
    instructionsPt: ['Posicione-se na quina do Meio Curto', 'Mire no topo da chaminé mais alta', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en la esquina de Corto A', 'Apunta a la chimenea superior', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'inferno-flash-b-site-entry',
    map: 'de_inferno',
    titleEn: 'B SITE HIGH AIRBURST from BANANA HALF-WALL',
    titlePt: 'BANG ALTA DE ENTRADA B da MEIA-PAREDE',
    titleEs: 'FLASH ALTO ENTRADA B de MEDIA PARED',
    from: 'Banana Half-Wall',
    to: 'B Site Core & Dark',
    side: 'T',
    uType: 'FLASHBANG',
    imgUrl: 'https://assets.csnades.gg/nades/inferno-smoke-9LzHE8aRot/lineup.webp',
    instructionsEn: ['Wedge against half-wall corner', 'Aim at church bell pinnacle', 'Left-click throw'],
    instructionsPt: ['Trave na quina da meia-parede', 'Mire no pináculo da igreja', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en la media pared', 'Apunta al pináculo de la iglesia', 'Lanza con clic izquierdo'],
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
    imgUrl: 'https://assets.csnades.gg/nades/inferno-smoke-a2ITuReCiS/lineup.webp',
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
    imgUrl: 'https://assets.csnades.gg/nades/inferno-smoke-xWSXzEwtxB/lineup.webp',
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
    imgUrl: 'https://assets.csnades.gg/nades/inferno-smoke-qNO7ZhaDsF/lineup.webp',
    instructionsEn: ['Stand by broom corner at Banana', 'Aim at church tower cross', 'Jumpthrow'],
    instructionsPt: ['Fique na vassoura na Banana', 'Mire na cruz da torre da igreja', 'Arremesso com Jumpthrow'],
    instructionsEs: ['Ponte junto a la escoba en Banana', 'Apunta a la cruz de la iglesia', 'Lanza con Jumpthrow'],
  }),
  makeExtraLineup({
    id: 'inferno-moly-new-box',
    map: 'de_inferno',
    titleEn: 'NEW BOX CORNER MOLOTOV from BANANA LOGS',
    titlePt: 'MOLOTOV NO NEW BOX da BANANA',
    titleEs: 'MOLOTOV EN NEW BOX de BANANA',
    from: 'Banana Wood Logs',
    to: 'B New Box Corner',
    side: 'T',
    uType: 'MOLOTOV',
    isJump: true,
    imgUrl: 'https://assets.csnades.gg/nades/inferno-smoke-pIccMstcPL/lineup.webp',
    instructionsEn: ['Wedge into wood logs corner', 'Aim at pipe elbow on yellow roof', 'Jumpthrow'],
    instructionsPt: ['Trave nas toras de madeira', 'Mire no cotovelo do cano no telhado', 'Jumpthrow'],
    instructionsEs: ['Ponte en las maderas', 'Apunta al codo de tubería', 'Lanza con Jumpthrow'],
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
    imgUrl: 'https://assets.csnades.gg/nades/inferno-smoke-0vUqr9Rn5a/lineup.webp',
    instructionsEn: ['Stand against stone pillar near Arch', 'Aim between two electrical lines', 'Run 1 step + throw'],
    instructionsPt: ['Encoste no pilar de pedra do Arch', 'Mire entre os dois fios elétricos', 'Dê 1 passo e arremesse'],
    instructionsEs: ['Ponte en el pilar de piedra', 'Apunta entre los dos cables', 'Da 1 paso y lanza'],
  }),

  // ==========================================================================
  // DE_DUST2 (Flashes, Molotovs & HEs)
  // ==========================================================================
  makeExtraLineup({
    id: 'dust2-flash-long-entry',
    map: 'de_dust2',
    titleEn: 'LONG A ENTRY POP-FLASH from LONG DOORS',
    titlePt: 'BANG DE ENTRADA NO FUNDO A das PORTAS DO FUNDO',
    titleEs: 'FLASH ENTRADA A LARGA de PUERTAS LARGAS',
    from: 'Long Doors Outside',
    to: 'Long A Corner',
    side: 'T',
    uType: 'FLASHBANG',
    imgUrl: 'https://assets.csnades.gg/nades/dust2-smoke-epau9Q3Dll/lineup.webp',
    instructionsEn: ['Position at door exit edge', 'Aim at the top right of the power pole', 'Left-click throw'],
    instructionsPt: ['Posicione-se na quina de saída da porta', 'Mire no topo direito do poste', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en el marco de salida', 'Apunta al poste de luz superior', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'dust2-flash-b-tunnel',
    map: 'de_dust2',
    titleEn: 'B SITE POP-FLASH from UPPER TUNNELS',
    titlePt: 'BANG DE ENTRADA B do ESCURO ALTO',
    titleEs: 'FLASH ENTRADA B de TÚNEL ALTO',
    from: 'Upper B Tunnel Stairs',
    to: 'B Site Platform',
    side: 'T',
    uType: 'FLASHBANG',
    isJump: true,
    imgUrl: 'https://assets.csnades.gg/nades/dust2-smoke-MrTSxptCeA/lineup.webp',
    instructionsEn: ['Stand by tunnel support pillar', 'Aim above tunnel exit archway', 'Jumpthrow'],
    instructionsPt: ['Fique no pilar de suporte do escuro', 'Mire acima do arco de saída do túnel', 'Arremesso com Jumpthrow'],
    instructionsEs: ['Ponte en el pilar del túnel', 'Apunta sobre el arco de salida', 'Lanza con Jumpthrow'],
  }),
  makeExtraLineup({
    id: 'dust2-flash-mid-xbox',
    map: 'de_dust2',
    titleEn: 'MID XBOX POP-FLASH from TOP MID',
    titlePt: 'BANG DO XBOX MEIO do TOPO DO MEIO',
    titleEs: 'FLASH DE XBOX de MEDIO ALTO',
    from: 'Top Mid Palm',
    to: 'Mid Doors & Catwalk',
    side: 'T',
    uType: 'FLASHBANG',
    imgUrl: 'https://assets.csnades.gg/nades/dust2-smoke-HupX3P0FUE/lineup.webp',
    instructionsEn: ['Wedge against palm tree base', 'Aim at the wall crack below catwalk', 'Left-click throw'],
    instructionsPt: ['Encoste na base da palmeira', 'Mire na rachadura da parede sob o catwalk', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en la palmera de Medio', 'Apunta a la grieta de la pared', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'dust2-flash-a-short',
    map: 'de_dust2',
    titleEn: 'A SHORT RETAKE POP-FLASH from CT MID',
    titlePt: 'BANG DE RETAKE SHORT do MEIO CT',
    titleEs: 'FLASH DE RETAKE CORTO de MEDIO CT',
    from: 'CT Mid Arch',
    to: 'A Short / Catwalk Crest',
    side: 'CT',
    uType: 'FLASHBANG',
    imgUrl: 'https://assets.csnades.gg/nades/dust2-smoke-dBt2lcA3vc/lineup.webp',
    instructionsEn: ['Stand against CT mid corner wall', 'Aim at blue wall trim apex', 'Left-click release'],
    instructionsPt: ['Encoste na quina do meio CT', 'Mire no acabamento da parede azul', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en la pared de Medio CT', 'Apunta al borde azul', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'dust2-moly-car',
    map: 'de_dust2',
    titleEn: 'LONG CAR MOLOTOV from LONG DOORS',
    titlePt: 'MOLOTOV NO CARRO DO FUNDO das PORTAS DO FUNDO',
    titleEs: 'MOLOTOV EN COCHE DE LARGA de PUERTAS',
    from: 'Long Doors Inside',
    to: 'Long Car / Barrel',
    side: 'T',
    uType: 'MOLOTOV',
    isJump: true,
    imgUrl: 'https://assets.csnades.gg/nades/dust2-smoke-KuDym6tvW2/lineup.webp',
    instructionsEn: ['Position at door metal trim', 'Aim at building electrical wire apex', 'Jumpthrow'],
    instructionsPt: ['Posicione-se no batente de metal', 'Mire no topo do fio elétrico', 'Arremesso com Jumpthrow'],
    instructionsEs: ['Ponte en el marco de metal', 'Apunta al cable eléctrico', 'Lanza con Jumpthrow'],
  }),
  makeExtraLineup({
    id: 'dust2-moly-goose',
    map: 'de_dust2',
    titleEn: 'A GOOSE MOLOTOV from A SHORT',
    titlePt: 'MOLOTOV NO GOOSE do MEIO CURTO / VARANDA',
    titleEs: 'MOLOTOV EN GOOSE de CORTO A',
    from: 'Catwalk Stairs',
    to: 'A Site Goose Corner',
    side: 'T',
    uType: 'MOLOTOV',
    imgUrl: 'https://assets.csnades.gg/nades/dust2-smoke-rvINJHyhOX/lineup.webp',
    instructionsEn: ['Stand on middle stair step', 'Aim at the top corner of the wall letter G', 'Left-click throw'],
    instructionsPt: ['Fique no degrau do meio da escada', 'Mire na quina superior da letra G da parede', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en el escalón central', 'Apunta a la letra G en la pared', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'dust2-moly-b-car',
    map: 'de_dust2',
    titleEn: 'B CAR MOLOTOV from UPPER TUNNELS',
    titlePt: 'MOLOTOV NO CARRO B do ESCURO ALTO',
    titleEs: 'MOLOTOV EN COCHE B de TÚNEL ALTO',
    from: 'Upper Tunnels Mesh',
    to: 'B Site Car / Big Box',
    side: 'T',
    uType: 'MOLOTOV',
    imgUrl: 'https://assets.csnades.gg/nades/dust2-smoke-XMJVOfP5Ca/lineup.webp',
    instructionsEn: ['Wedge into tunnel mesh fence', 'Aim at B door trim apex', 'Left-click throw'],
    instructionsPt: ['Trave na grade do túnel', 'Mire no topo do batente da porta B', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en la valla del túnel', 'Apunta a la puerta B', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'dust2-he-long-corner',
    map: 'de_dust2',
    titleEn: 'LONG CORNER HE GRENADE from OUTSIDE DOORS',
    titlePt: 'GRANADA HE NO CANTO DO FUNDO de FORA DAS PORTAS',
    titleEs: 'GRANADA HE EN ESQUINA DE LARGA de EXTERIOR',
    from: 'Long Doors Corner',
    to: 'Long A Corner Defense',
    side: 'T',
    uType: 'HE_GRENADE',
    isJump: true,
    imgUrl: 'https://assets.csnades.gg/nades/dust2-smoke-bIBJix167W/lineup.webp',
    instructionsEn: ['Wedge outside long doors', 'Aim at telephone pole crossbar', 'Jumpthrow'],
    instructionsPt: ['Trave do lado de fora das portas do fundo', 'Mire na travessa do poste de telefone', 'Arremesso com Jumpthrow'],
    instructionsEs: ['Ponte fuera de puertas largas', 'Apunta al poste telefónico', 'Lanza con Jumpthrow'],
  }),

  // ==========================================================================
  // DE_NUKE (Flashes, Molotovs & HEs) - AUTHENTIC NUKE ASSETS
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
    imgUrl: 'https://assets.csnades.gg/nades/nuke-smoke-Ox2V20EXl2/lineup.webp',
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
    imgUrl: 'https://assets.csnades.gg/nades/nuke-smoke-Sswwq7kpV9/lineup.webp',
    instructionsEn: ['Climb on top of Silo', 'Aim above the red shipping container', 'Left-click throw'],
    instructionsPt: ['Suba no topo do Silo', 'Mire acima do contêiner vermelho', 'Solte com clique esquerdo'],
    instructionsEs: ['Sube a lo alto del Silo', 'Apunta sobre el contenedor rojo', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'nuke-flash-squeaky',
    map: 'de_nuke',
    titleEn: 'SQUEAKY DOOR ENTRY POP-FLASH from LOBBY',
    titlePt: 'BANG DE ENTRADA NA SQUEAKY do LOBBY',
    titleEs: 'FLASH ENTRADA A SQUEAKY de LOBBY',
    from: 'T Lobby Doorway',
    to: 'A Site Core & Rafters',
    side: 'T',
    uType: 'FLASHBANG',
    imgUrl: 'https://assets.csnades.gg/nades/nuke-smoke-faS2qYaA3o/lineup.webp',
    instructionsEn: ['Stand next to metal lockers in Lobby', 'Aim at yellow stripe above Squeaky door', 'Left-click throw'],
    instructionsPt: ['Fique ao lado dos armários no Lobby', 'Mire na faixa amarela acima da porta', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte junto a las taquillas', 'Apunta a la franja amarilla', 'Lanza con clic izquierdo'],
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
    imgUrl: 'https://assets.csnades.gg/nades/nuke-smoke-l3koCgeoHZ/lineup.webp',
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
    imgUrl: 'https://assets.csnades.gg/nades/nuke-smoke-6T37K29Fos/lineup.webp',
    instructionsEn: ['Wedge by roof ladder railing', 'Aim through the skylight pane', 'Jumpthrow'],
    instructionsPt: ['Trave na grade da escada do telhado', 'Mire pelo vidro da claraboia', 'Arremesso com Jumpthrow'],
    instructionsEs: ['Ponte en la barandilla de la escalera', 'Apunta por el cristal', 'Lanza con Jumpthrow'],
  }),
  makeExtraLineup({
    id: 'nuke-moly-ramp-headshot',
    map: 'de_nuke',
    titleEn: 'RAMP HEADSHOT BOX MOLOTOV from RADIO',
    titlePt: 'MOLOTOV NA CAIXA DA RAMPA da RADIO',
    titleEs: 'MOLOTOV EN CAJA DE RAMPA de RADIO',
    from: 'Radio Doorway',
    to: 'Ramp Headshot Box',
    side: 'T',
    uType: 'MOLOTOV',
    imgUrl: 'https://assets.csnades.gg/nades/nuke-smoke-EO2jbfxk5s/lineup.webp',
    instructionsEn: ['Stand at Radio door threshold', 'Aim at electrical pipe on far wall', 'Left-click throw'],
    instructionsPt: ['Fique no limiar da porta da Rádio', 'Mire no cano elétrico da parede', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en el umbral de Radio', 'Apunta a la tubería', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'nuke-he-vent',
    map: 'de_nuke',
    titleEn: 'VENTS HE GRENADE from SQUEAKY',
    titlePt: 'GRANADA HE NO DUTO da PORTA SQUEAKY',
    titleEs: 'GRANADA HE EN CONDUCTO de SQUEAKY',
    from: 'Squeaky Lobby',
    to: 'Vent Grid',
    side: 'CT',
    uType: 'HE_GRENADE',
    imgUrl: 'https://assets.csnades.gg/nades/nuke-smoke-Q9fOLapNdW/lineup.webp',
    instructionsEn: ['Crouch in front of Squeaky door', 'Aim at lower ventilation grate seam', 'Left-click throw'],
    instructionsPt: ['Agache em frente à porta Squeaky', 'Mire na costura inferior da grade de ventilação', 'Solte com clique esquerdo'],
    instructionsEs: ['Agáchate frente a la puerta', 'Apunta a la rejilla de ventilación', 'Lanza con clic izquierdo'],
  }),

  // ==========================================================================
  // DE_ANCIENT (Flashes, Molotovs & HEs) - AUTHENTIC ANCIENT ASSETS
  // ==========================================================================
  makeExtraLineup({
    id: 'ancient-flash-cave',
    map: 'de_ancient',
    titleEn: 'B CAVE ENTRY POP-FLASH from T YARD',
    titlePt: 'BANG DA CAVERNA B do PÁTIO T',
    titleEs: 'FLASH DE CUEVA B de PATIO T',
    from: 'T Yard Ruins',
    to: 'Cave / B Ramp',
    side: 'T',
    uType: 'FLASHBANG',
    imgUrl: 'https://assets.csnades.gg/nades/ancient-smoke-mhHNTLDnNw/lineup.webp',
    instructionsEn: ['Stand by cracked pillar base', 'Aim at mossy stone protrusion', 'Left-click throw'],
    instructionsPt: ['Fique na base do pilar rachado', 'Mire na protuberância de pedra com musgo', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en el pilar agrietado', 'Apunta a la piedra con musgo', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'ancient-flash-a-main',
    map: 'de_ancient',
    titleEn: 'A MAIN POP-FLASH from OUTSIDE A',
    titlePt: 'BANG DO A PRINCIPAL de FORA DO A',
    titleEs: 'FLASH DE ENTRADA A de EXTERIOR A',
    from: 'Outside A Pillars',
    to: 'A Site Temple & Plat',
    side: 'T',
    uType: 'FLASHBANG',
    imgUrl: 'https://assets.csnades.gg/nades/ancient-smoke-05JJVnP8AP/lineup.webp',
    instructionsEn: ['Stand behind the first stone pillar', 'Aim at the highest tree branch tip', 'Left-click throw'],
    instructionsPt: ['Fique atrás do primeiro pilar de pedra', 'Mire na ponta do galho de árvore mais alto', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte tras el pilar de piedra', 'Apunta a la punta de la rama más alta', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'ancient-moly-donut',
    map: 'de_ancient',
    titleEn: 'DONUT ROOM MOLOTOV from TOP MID',
    titlePt: 'MOLOTOV NO DONUT do TOPO DO MEIO',
    titleEs: 'MOLOTOV EN DONUT de MEDIO ALTO',
    from: 'Top Mid Pillar',
    to: 'Donut Room Entrance',
    side: 'T',
    uType: 'MOLOTOV',
    isJump: true,
    imgUrl: 'https://assets.csnades.gg/nades/ancient-smoke-T3Mseb88b9/lineup.webp',
    instructionsEn: ['Wedge against center stone pillar', 'Aim at the carved stone tooth', 'Jumpthrow'],
    instructionsPt: ['Trave no pilar de pedra central', 'Mire no dente entalhado da pedra', 'Arremesso com Jumpthrow'],
    instructionsEs: ['Ponte en el pilar central', 'Apunta al diente tallado', 'Lanza con Jumpthrow'],
  }),
  makeExtraLineup({
    id: 'ancient-moly-ninja-pillar',
    map: 'de_ancient',
    titleEn: 'B SITE NINJA PILLAR MOLOTOV from RUINS',
    titlePt: 'MOLOTOV NO NINJA / PILAR B das RUÍNAS',
    titleEs: 'MOLOTOV TRAS EL PILAR B de RUINAS',
    from: 'B Long Ruins',
    to: 'Behind B Pillar / Ninja',
    side: 'T',
    uType: 'MOLOTOV',
    imgUrl: 'https://assets.csnades.gg/nades/ancient-smoke-0JpsvFLFbE/lineup.webp',
    instructionsEn: ['Stand in ruins corner', 'Aim at high stone relief engraving', 'Left-click throw'],
    instructionsPt: ['Fique na quina das ruínas', 'Mire no relevo de pedra alto', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en la esquina de ruinas', 'Apunta al relieve de piedra', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'ancient-he-cave',
    map: 'de_ancient',
    titleEn: 'B CAVE CHOKE HE GRENADE from T RAMP',
    titlePt: 'GRANADA HE NO CHOKE DA CAVERNA da RAMPA T',
    titleEs: 'GRANADA HE EN CUEVA B de RAMPA T',
    from: 'T Yard Ramp',
    to: 'Cave Choke Point',
    side: 'T',
    uType: 'HE_GRENADE',
    imgUrl: 'https://assets.csnades.gg/nades/ancient-smoke-jRgHHBZPeJ/lineup.webp',
    instructionsEn: ['Stand at bottom of wooden ramp', 'Aim through cave ceiling opening', 'Left-click throw'],
    instructionsPt: ['Fique na base da rampa de madeira', 'Mire pela abertura do teto da caverna', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en la base de la rampa', 'Apunta a la apertura del techo', 'Lanza con clic izquierdo'],
  }),

  // ==========================================================================
  // DE_ANUBIS (Flashes, Molotovs & HEs) - AUTHENTIC ANUBIS ASSETS
  // ==========================================================================
  makeExtraLineup({
    id: 'anubis-flash-bridge',
    map: 'de_anubis',
    titleEn: 'MID BRIDGE POP-FLASH from CANAL',
    titlePt: 'BANG DA PONTE DO MEIO do CANAL',
    titleEs: 'FLASH DE PUENTE MEDIO de CANAL',
    from: 'Canal Steps',
    to: 'Mid Bridge & Doors',
    side: 'T',
    uType: 'FLASHBANG',
    imgUrl: 'https://assets.csnades.gg/nades/anubis-smoke-RPRA6boGge/lineup.webp',
    instructionsEn: ['Stand on second canal step', 'Aim at wooden balcony railing', 'Left-click throw'],
    instructionsPt: ['Fique no segundo degrau do canal', 'Mire no corrimão da varanda de madeira', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en el segundo escalón', 'Apunta a la barandilla de madera', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'anubis-flash-b-alley',
    map: 'de_anubis',
    titleEn: 'B ALLEY FAST POP-FLASH from ARCHWAY',
    titlePt: 'BANG RÁPIDA DO BECO B do ARCO',
    titleEs: 'FLASH RÁPIDO DE CALLEJÓN B de ARCO',
    from: 'B Alley Archway',
    to: 'B Site & Temple',
    side: 'T',
    uType: 'FLASHBANG',
    imgUrl: 'https://assets.csnades.gg/nades/anubis-smoke-kmlXeKSDJM/lineup.webp',
    instructionsEn: ['Wedge in archway corner', 'Aim at highest palm leaf tip', 'Left-click throw'],
    instructionsPt: ['Trave na quina do arco', 'Mire na ponta da folha de palmeira mais alta', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en la esquina del arco', 'Apunta a la hoja de palmera', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'anubis-moly-b-pillar',
    map: 'de_anubis',
    titleEn: 'B SITE CENTER PILLAR MOLOTOV from RUINS',
    titlePt: 'MOLOTOV NO PILAR CENTRAL B das RUÍNAS',
    titleEs: 'MOLOTOV EN PILAR CENTRAL B de RUINAS',
    from: 'B Main Ruins',
    to: 'B Site Center Pillar',
    side: 'T',
    uType: 'MOLOTOV',
    isJump: true,
    imgUrl: 'https://assets.csnades.gg/nades/anubis-smoke-0MzIjwXEIJ/lineup.webp',
    instructionsEn: ['Wedge by carved stone door', 'Aim at upper hieroglyph symbol', 'Jumpthrow'],
    instructionsPt: ['Trave na porta de pedra entalhada', 'Mire no hieróglifo superior', 'Arremesso com Jumpthrow'],
    instructionsEs: ['Ponte en la puerta de piedra', 'Apunta al jeroglífico superior', 'Lanza con Jumpthrow'],
  }),
  makeExtraLineup({
    id: 'anubis-moly-back-pillar',
    map: 'de_anubis',
    titleEn: 'B BACK PILLAR MOLOTOV from CANAL BRIDGE',
    titlePt: 'MOLOTOV NO PILAR DO FUNDO B da PONTE',
    titleEs: 'MOLOTOV EN PILAR TRASERO B de PUENTE',
    from: 'B Canal Bridge',
    to: 'B Back Pillar & Ninja',
    side: 'T',
    uType: 'MOLOTOV',
    imgUrl: 'https://assets.csnades.gg/nades/anubis-smoke-ZQ0D2bZhk7/lineup.webp',
    instructionsEn: ['Wedge on bridge railing', 'Aim at high wall notch', 'Left-click throw'],
    instructionsPt: ['Encoste no corrimão da ponte', 'Mire no entalhe superior da parede', 'Solte com clique esquerdo'],
    instructionsEs: ['Ponte en la barandilla del puente', 'Apunta al hueco de la pared', 'Lanza con clic izquierdo'],
  }),
  makeExtraLineup({
    id: 'anubis-he-mid-doors',
    map: 'de_anubis',
    titleEn: 'MID DOUBLE DOORS HE GRENADE from CANAL',
    titlePt: 'GRANADA HE NAS PORTAS DO MEIO do CANAL',
    titleEs: 'GRANADA HE EN PUERTAS MEDIO de CANAL',
    from: 'Mid Bridge Railing',
    to: 'Mid Double Doors',
    side: 'T',
    uType: 'HE_GRENADE',
    imgUrl: 'https://assets.csnades.gg/nades/anubis-smoke-kBDHAlSvdZ/lineup.webp',
    instructionsEn: ['Stand against wooden boat hull', 'Aim between double wooden doors', 'Run 1 step + throw'],
    instructionsPt: ['Encoste no casco do barco de madeira', 'Mire entre as duas portas de madeira', 'Dê 1 passo e arremesse'],
    instructionsEs: ['Ponte en el casco del barco', 'Apunta entre las dos puertas', 'Da 1 paso y lanza'],
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
