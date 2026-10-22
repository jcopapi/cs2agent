/**
 * CS2 Assistant - Offline .ZIP Pixel Pack Manager
 * File: src/core/utility/pixel-pack-manager.ts
 *
 * Provides 100% local, offline pixel pack import & export:
 * - Reads .zip archives containing `pack.json` and real in-game image files (`images/*`)
 * - Converts image assets into instant local base64 Data URIs (zero network/fetching dependency)
 * - Exports player-created or filtered lineups into distributable `.zip` packs
 * - Bundles the initial default core pack model across active duty maps (Mirage, Inferno, Dust II, Nuke, Ancient, Anubis)
 */

import JSZip from 'jszip';
import type { Lineup, CS2Map, UtilityType, TeamSide, ThrowType, ThrowTechnique } from './types';
import { saveLineup, getAllLineups, importLineupsBatch, clearAllLineups } from './lineup-database';
import {
  getCuratedMapPackLineups,
  getAvailableMapPacksMeta,
  type MapPackMeta,
} from './map-packs-data';

export { getAvailableMapPacksMeta, getCuratedMapPackLineups, type MapPackMeta, clearAllLineups };

export interface PixelPackManifest {
  schemaVersion: '1.0';
  id: string;
  name: string | Record<string, string>;
  author: string;
  version: string;
  description: string | Record<string, string>;
  map?: CS2Map | 'MULTI';
  createdAt: string;
  lineups: PixelPackLineupEntry[];
}

export interface PixelPackLineupEntry {
  id: string;
  map: CS2Map;
  title: string | Record<string, string>;
  side: TeamSide;
  utilityType: UtilityType;
  technique: ThrowTechnique;
  throwType: ThrowType;
  startPosition: {
    x?: number;
    y?: number;
    z?: number;
    callout: string;
    description?: string;
    toleranceUnits?: number;
  };
  aimReference?: {
    crosshairPlacement?: string;
    visualLandmark?: string;
  };
  landingArea?: {
    x?: number;
    y?: number;
    z?: number;
    callout: string;
    description?: string;
  };
  instructions?: string[] | Record<string, string[]>;
  titles?: Record<string, string>;
  instructionsI18n?: Record<string, string[]>;
  movementRequirements?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  tags?: string[];
  // File paths inside the zip archive (e.g. "images/mirage-stairs.webp")
  imageFileName?: string;
  standImageFileName?: string;
  resultImageFileName?: string;
  thumbnailFileName?: string;
  // Fallback direct URL if provided
  imageUrl?: string;
}

export interface ImportPackResult {
  success: boolean;
  packName: string;
  author: string;
  totalImported: number;
  lineupTitles: string[];
  error?: string;
}

/**
 * Imports a .zip pixel pack and extracts all lineups and local image assets.
 */
export async function importPixelPackFromZip(
  zipData: File | Blob | ArrayBuffer | Uint8Array
): Promise<ImportPackResult> {
  try {
    const zip = await JSZip.loadAsync(zipData);

    // Look for pack.json or manifest.json
    let manifestFile = zip.file('pack.json');
    if (!manifestFile) {
      manifestFile = zip.file('manifest.json');
    }

    if (!manifestFile) {
      return {
        success: false,
        packName: '',
        author: '',
        totalImported: 0,
        lineupTitles: [],
        error: 'Arquivo pack.json ou manifest.json não encontrado no interior do .zip.',
      };
    }

    const manifestText = await manifestFile.async('text');
    const manifest: PixelPackManifest = JSON.parse(manifestText);
    const resolvedPackName =
      typeof manifest.name === 'string'
        ? manifest.name
        : manifest.name?.en || Object.values(manifest.name || {})[0] || 'Pacote Inválido';

    if (!manifest.lineups || !Array.isArray(manifest.lineups)) {
      return {
        success: false,
        packName: resolvedPackName,
        author: manifest.author || 'Desconhecido',
        totalImported: 0,
        lineupTitles: [],
        error: 'O manifesto do pacote não contém uma lista válida de lineups.',
      };
    }

    const importedTitles: string[] = [];

    for (const entry of manifest.lineups) {
      let finalImageUrl = entry.imageUrl || '';
      let finalStandUrl = '';
      let finalResultUrl = '';
      let finalThumbUrl = '';

      // Helper to extract an image from the zip as a local base64 Data URI
      const extractImageAsDataUri = async (fileName?: string): Promise<string> => {
        if (!fileName) return '';
        // Handle possible relative path variations
        const cleaned = fileName.replace(/^\.?\//, '');
        const file = zip.file(cleaned) || zip.file(`images/${cleaned}`) || zip.file(fileName);
        if (!file) return '';

        const ext = cleaned.split('.').pop()?.toLowerCase() || 'webp';
        const mime = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/webp';
        const base64 = await file.async('base64');
        return `data:${mime};base64,${base64}`;
      };

      if (entry.imageFileName) {
        const extracted = await extractImageAsDataUri(entry.imageFileName);
        if (extracted) finalImageUrl = extracted;
      }
      if (entry.standImageFileName) {
        finalStandUrl = await extractImageAsDataUri(entry.standImageFileName);
      }
      if (entry.resultImageFileName) {
        finalResultUrl = await extractImageAsDataUri(entry.resultImageFileName);
      }
      if (entry.thumbnailFileName) {
        finalThumbUrl = await extractImageAsDataUri(entry.thumbnailFileName);
      } else if (finalImageUrl) {
        finalThumbUrl = finalImageUrl;
      }

      const titlesObj =
        typeof entry.title === 'object' && entry.title !== null
          ? (entry.title as Record<string, string>)
          : entry.titles || {};
      const resolvedTitle =
        typeof entry.title === 'string'
          ? entry.title
          : titlesObj.en || Object.values(titlesObj)[0] || 'Lineup';

      const instrObj =
        typeof entry.instructions === 'object' && !Array.isArray(entry.instructions) && entry.instructions !== null
          ? (entry.instructions as Record<string, string[]>)
          : entry.instructionsI18n || {};
      const resolvedInstructions = Array.isArray(entry.instructions)
        ? entry.instructions
        : instrObj.en || Object.values(instrObj)[0] || [
            `Position at: ${entry.startPosition?.callout || 'Position'}`,
            'Align crosshair with reference marker',
            entry.technique === 'JUMPTHROW' ? 'Jumpthrow' : 'Standard throw',
          ];

      const newLineup: Lineup = {
        id: entry.id || `custom-pack-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        map: entry.map,
        title: resolvedTitle,
        titles: Object.keys(titlesObj).length > 0 ? titlesObj : undefined,
        instructionsI18n: Object.keys(instrObj).length > 0 ? instrObj : undefined,
        side: entry.side || 'T',
        utilityType: entry.utilityType || 'SMOKE',
        technique: entry.technique || 'STAND',
        throwType: entry.throwType || 'STANDING',
        throwPosition: {
          x: entry.startPosition?.x ?? 0,
          y: entry.startPosition?.y ?? 0,
          z: entry.startPosition?.z ?? 0,
          callout: entry.startPosition?.callout || 'Posição',
          description: entry.startPosition?.description || entry.movementRequirements || '',
          toleranceUnits: entry.startPosition?.toleranceUnits || 8,
        },
        startPosition: {
          x: entry.startPosition?.x ?? 0,
          y: entry.startPosition?.y ?? 0,
          z: entry.startPosition?.z ?? 0,
          callout: entry.startPosition?.callout || 'Posição',
          toleranceUnits: entry.startPosition?.toleranceUnits || 8,
        },
        crosshairTarget: {
          pitch: 0,
          yaw: 0,
          description: entry.aimReference?.crosshairPlacement || 'Alinhar mira conforme captura real',
          visualLandmark: entry.aimReference?.visualLandmark || entry.landingArea?.callout || '',
        },
        aimReference: {
          crosshairPlacement: entry.aimReference?.crosshairPlacement || 'Alinhar mira conforme captura real',
          visualLandmark: entry.aimReference?.visualLandmark || entry.landingArea?.callout || '',
        },
        landingArea: {
          x: entry.landingArea?.x ?? 0,
          y: entry.landingArea?.y ?? 0,
          z: entry.landingArea?.z ?? 0,
          callout: entry.landingArea?.callout || 'Destino',
          description: entry.landingArea?.description || '',
        },
        targetDestination: {
          x: entry.landingArea?.x ?? 0,
          y: entry.landingArea?.y ?? 0,
          z: entry.landingArea?.z ?? 0,
          callout: entry.landingArea?.callout || 'Destino',
        },
        movementKey: entry.technique === 'JUMPTHROW' ? 'JUMPTHROW' : 'NONE',
        movementRequirements: entry.movementRequirements || (entry.technique === 'JUMPTHROW' ? 'Jumpthrow' : 'Parado'),
        tickrate: 'SUBTICK_CS2',
        tags: entry.tags || [entry.utilityType, entry.map, 'Pack'],
        isCustom: true,
        favorite: false,
        instructions: resolvedInstructions,
        difficulty: entry.difficulty || 'EASY',
        sourceAttribution: `${manifest.name} (${manifest.author})`,
        verified: true,
        gameVersion: '1.40.2.1',
        lastVerificationDate: new Date().toISOString().slice(0, 10),
        imageUrl: finalImageUrl || undefined,
        thumbnailUrl: finalThumbUrl || finalImageUrl || undefined,
        standImageUrl: finalStandUrl || undefined,
        resultImageUrl: finalResultUrl || undefined,
      };

      saveLineup(newLineup);
      importedTitles.push(newLineup.title);
    }

    return {
      success: true,
      packName: resolvedPackName,
      author: manifest.author,
      totalImported: importedTitles.length,
      lineupTitles: importedTitles,
    };
  } catch (err) {
    return {
      success: false,
      packName: '',
      author: '',
      totalImported: 0,
      lineupTitles: [],
      error: `Erro ao descompactar .zip: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Exports a set of Lineup objects into a standard .zip pixel pack.
 */
export async function exportLineupsToZip(
  packMeta: { name: string; author?: string; description?: string; map?: CS2Map | 'MULTI' },
  lineups: Lineup[]
): Promise<Blob> {
  const zip = new JSZip();
  const imagesFolder = zip.folder('images');

  const manifestEntries: PixelPackLineupEntry[] = [];

  for (let i = 0; i < lineups.length; i++) {
    const l = lineups[i];
    let imageFileName: string | undefined;
    let standFileName: string | undefined;
    let resultFileName: string | undefined;

    // Helper to store base64 Data URI into zip folder
    const storeDataUri = (dataUri?: string, suffix: string = 'aim'): string | undefined => {
      if (!dataUri || !imagesFolder) return undefined;
      if (dataUri.startsWith('data:image/')) {
        const matches = dataUri.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          const fileName = `images/${l.id}-${suffix}.${ext}`;
          imagesFolder.file(`${l.id}-${suffix}.${ext}`, matches[2], { base64: true });
          return fileName;
        }
      }
      return undefined;
    };

    imageFileName = storeDataUri(l.imageUrl, 'aim');
    standFileName = storeDataUri(l.standImageUrl, 'stand');
    resultFileName = storeDataUri(l.resultImageUrl, 'result');

    manifestEntries.push({
      id: l.id,
      map: l.map,
      title: l.title,
      side: l.side,
      utilityType: l.utilityType,
      technique: l.technique,
      throwType: l.throwType,
      startPosition: {
        x: l.startPosition.x,
        y: l.startPosition.y,
        z: l.startPosition.z,
        callout: l.startPosition.callout,
        description: l.movementRequirements,
      },
      aimReference: {
        crosshairPlacement: l.aimReference?.crosshairPlacement,
        visualLandmark: l.aimReference?.visualLandmark,
      },
      landingArea: {
        x: l.landingArea.x,
        y: l.landingArea.y,
        z: l.landingArea.z,
        callout: l.landingArea.callout,
      },
      instructions: l.instructions,
      movementRequirements: l.movementRequirements,
      difficulty: l.difficulty,
      tags: l.tags,
      imageFileName,
      standImageFileName: standFileName,
      resultImageFileName: resultFileName,
      imageUrl: imageFileName ? undefined : l.imageUrl,
    });
  }

  const manifest: PixelPackManifest = {
    schemaVersion: '1.0',
    id: `pack-${Date.now()}`,
    name: packMeta.name.trim() || 'Custom Pixel Pack',
    author: packMeta.author?.trim() || 'Player',
    version: '1.0.0',
    description: packMeta.description?.trim() || 'Exported tactical pixel pack for CS2 Assistant',
    map: packMeta.map || 'MULTI',
    createdAt: new Date().toISOString(),
    lineups: manifestEntries,
  };

  zip.file('pack.json', JSON.stringify(manifest, null, 2));

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

/**
 * Installs the complete authentic curated offline pack for a specific CS2 map.
 */
export function installMapPack(map: CS2Map): { count: number; map: CS2Map } {
  const lineups = getCuratedMapPackLineups(map);
  const result = importLineupsBatch(lineups);
  return { count: result.added, map };
}

/**
 * Installs all official curated map packs across all 6 active duty maps.
 */
export function installAllOfficialMapPacks(): { totalCount: number } {
  const maps: CS2Map[] = [
    'de_mirage',
    'de_inferno',
    'de_dust2',
    'de_nuke',
    'de_ancient',
    'de_anubis',
  ];
  let total = 0;
  for (const m of maps) {
    const res = installMapPack(m);
    total += res.count;
  }
  return { totalCount: total };
}

// ----------------------------------------------------------------------------
// Curated Default Core Starter Pack Model (Real In-Game Coordinates & Data)
// ----------------------------------------------------------------------------

export const DEFAULT_CORE_STARTER_PACK_MANIFEST: PixelPackManifest = {
  schemaVersion: '1.0',
  id: 'jco-core-starter-pack-v1',
  name: 'Core Competitive Starter Pack',
  author: 'jco cs2 assistant',
  version: '1.0.0',
  description: 'Pacote padrão inicial com as principais lineups essenciais (Smokes, Bangs, Molotovs e HE) dos mapas competitivos do CS2.',
  map: 'MULTI',
  createdAt: '2026-10-22T12:00:00.000Z',
  lineups: [
    // --- DE_MIRAGE ---
    {
      id: 'core-mirage-stairs-smoke',
      map: 'de_mirage',
      title: 'A Stairs Smoke from T Roof',
      side: 'T',
      utilityType: 'SMOKE',
      technique: 'STAND',
      throwType: 'STANDING',
      startPosition: { callout: 'T Roof Wooden Beam', description: 'Encoste no canto direito da viga de madeira do telhado T' },
      aimReference: { crosshairPlacement: 'Alinhe a mira no topo do entalhe da parede acima da entrada A' },
      landingArea: { callout: 'A Stairs / Sandwich' },
      instructions: ['Trave no canto da viga de madeira no T Roof', 'Mire no topo do entalhe da parede', 'Solte com clique esquerdo padrão'],
      tags: ['Stairs', 'A-Execute', 'Smoke', 'Essential'],
      imageUrl: 'https://assets.csnades.gg/nades/mirage-smoke-8xUT3aGGSl/lineup.webp',
      thumbnailFileName: undefined,
    },
    {
      id: 'core-mirage-jungle-smoke',
      map: 'de_mirage',
      title: 'A Jungle & Con Smoke from T Roof',
      side: 'T',
      utilityType: 'SMOKE',
      technique: 'STAND',
      throwType: 'STANDING',
      startPosition: { callout: 'T Roof Pillar', description: 'Fique no pilar central do telhado T virado para o Palace' },
      aimReference: { crosshairPlacement: 'Mire na quina esquerda da torre de ventilação no céu' },
      landingArea: { callout: 'Jungle / Connector Arch' },
      instructions: ['Posicione-se no pilar de pedra no T Roof', 'Mire na borda da torre de ventilação', 'Solte com clique esquerdo'],
      tags: ['Jungle', 'A-Execute', 'Smoke', 'Essential'],
      imageUrl: 'https://assets.csnades.gg/nades/mirage-smoke-azNiRzhJVG/lineup.webp',
    },
    {
      id: 'core-mirage-ticket-smoke',
      map: 'de_mirage',
      title: 'Ticket Booth Smoke from A Ramp',
      side: 'T',
      utilityType: 'SMOKE',
      technique: 'STAND',
      throwType: 'STANDING',
      startPosition: { callout: 'A Ramp Corner Wall', description: 'Encoste na quina da parede de madeira na rampa A' },
      aimReference: { crosshairPlacement: 'Mire na ponta direita da antena da torre CT' },
      landingArea: { callout: 'CT Ticket Booth' },
      instructions: ['Encoste na quina da rampa A', 'Mire na ponta superior da antena', 'Solte com clique esquerdo'],
      tags: ['CT', 'A-Execute', 'Smoke', 'Essential'],
      imageUrl: 'https://assets.csnades.gg/nades/mirage-smoke-6UrrcOsJSD/lineup.webp',
    },
    {
      id: 'core-mirage-window-smoke',
      map: 'de_mirage',
      title: 'Mid Window Smoke from T Spawn',
      side: 'T',
      utilityType: 'SMOKE',
      technique: 'JUMPTHROW',
      throwType: 'JUMPTHROW',
      startPosition: { callout: 'T Spawn Trashcan', description: 'Encoste na lixeira à esquerda no T Spawn' },
      aimReference: { crosshairPlacement: 'Mire no topo da quina da janela e aperte D + Jumpthrow' },
      landingArea: { callout: 'Snipers Nest / Window' },
      instructions: ['Encoste na lixeira do Spawn T', 'Mire na quina da moldura superior', 'Execute o jumpthrow instantâneo'],
      tags: ['Window', 'Mid-Control', 'Smoke', 'Essential'],
      imageUrl: 'https://assets.csnades.gg/nades/mirage-smoke-3sRuAaqnas/lineup.webp',
    },
    {
      id: 'core-mirage-ramp-flash',
      map: 'de_mirage',
      title: 'A Ramp High Popflash',
      side: 'T',
      utilityType: 'FLASHBANG',
      technique: 'STAND',
      throwType: 'STANDING',
      startPosition: { callout: 'A Ramp Sandbags', description: 'Encoste nos sacos de areia na entrada da rampa A' },
      aimReference: { crosshairPlacement: 'Mire logo acima do poste da lâmpada' },
      landingArea: { callout: 'A Site High Sky' },
      instructions: ['Suba nos sacos de areia da rampa A', 'Mire 1 palmo acima da lâmpada', 'Arremesse com clique esquerdo antes dos companheiros abrirem'],
      tags: ['Flash', 'A-Rush', 'Popflash'],
      imageUrl: 'https://assets.csnades.gg/nades/mirage-smoke-h4RLQbKgkO/lineup.webp',
    },
    {
      id: 'core-mirage-under-palace-moly',
      map: 'de_mirage',
      title: 'Under Palace / Shadow Molotov',
      side: 'T',
      utilityType: 'MOLOTOV',
      technique: 'STAND',
      throwType: 'STANDING',
      startPosition: { callout: 'Tetris Shadow Corner', description: 'Encoste na quina de Tetris alinhando com a sombra' },
      aimReference: { crosshairPlacement: 'Mire na quina do pilar de madeira sob a varanda do Palace' },
      landingArea: { callout: 'Under Palace Wood Box' },
      instructions: ['Trave na quina de Tetris', 'Mire na madeira de Under Palace', 'Solte com clique esquerdo para queimar os defensores escondidos'],
      tags: ['Molotov', 'Under-Palace', 'A-Clear'],
      imageUrl: 'https://assets.csnades.gg/nades/mirage-smoke-I60PpERA4N/lineup.webp',
    },
    {
      id: 'core-mirage-short-he',
      map: 'de_mirage',
      title: 'B Short Flush HE Grenade',
      side: 'T',
      utilityType: 'HE_GRENADE',
      technique: 'STAND',
      throwType: 'STANDING',
      startPosition: { callout: 'B Appts Sink', description: 'Encoste na pia dos apartamentos B' },
      aimReference: { crosshairPlacement: 'Mire no topo da janela aberta de Short' },
      landingArea: { callout: 'B Catwalk / Short' },
      instructions: ['Encoste na pia dos apartamentos', 'Mire na janela do meio de Short', 'Arremesse a HE com clique esquerdo'],
      tags: ['HE', 'B-Short', 'Damage'],
      imageUrl: 'https://assets.csnades.gg/nades/mirage-smoke-EHvVQ0Ebqm/lineup.webp',
    },

    // --- DE_INFERNO ---
    {
      id: 'core-inferno-coffins-smoke',
      map: 'de_inferno',
      title: 'B Coffins Smoke from Banana',
      side: 'T',
      utilityType: 'SMOKE',
      technique: 'STAND',
      throwType: 'STANDING',
      startPosition: { callout: 'Banana Half-Wall', description: 'Trave no canto do meio-muro da Banana' },
      aimReference: { crosshairPlacement: 'Mire na ponta da grade metálica alta da igreja' },
      landingArea: { callout: 'B Coffins' },
      instructions: ['Trave na meia-parede de Banana', 'Mire na cerca no topo da torre', 'Solte com clique esquerdo'],
      tags: ['Coffins', 'B-Execute', 'Smoke'],
      imageUrl: 'https://assets.csnades.gg/nades/inferno-smoke-Fomlq5TPso/lineup.webp',
    },
    {
      id: 'core-inferno-ct-smoke',
      map: 'de_inferno',
      title: 'B CT Cross Smoke from Banana',
      side: 'T',
      utilityType: 'SMOKE',
      technique: 'STAND',
      throwType: 'STANDING',
      startPosition: { callout: 'Banana Wood Logs', description: 'Trave na pilha de toras de madeira na Banana' },
      aimReference: { crosshairPlacement: 'Mire na fiação elétrica logo acima do telhado' },
      landingArea: { callout: 'CT Spawn Arch' },
      instructions: ['Encoste nas toras de madeira da Banana', 'Mire no cruzamento dos fios elétricos', 'Solte com clique esquerdo'],
      tags: ['CT', 'B-Execute', 'Smoke'],
      imageUrl: 'https://assets.csnades.gg/nades/inferno-smoke-MrAFqNRIOT/lineup.webp',
    },
    {
      id: 'core-inferno-banana-moly',
      map: 'de_inferno',
      title: 'Car / Sandbags Deep Molotov',
      side: 'T',
      utilityType: 'MOLOTOV',
      technique: 'STAND',
      throwType: 'STANDING',
      startPosition: { callout: 'Banana Tree', description: 'Encoste no tronco da árvore antes da rampa de Banana' },
      aimReference: { crosshairPlacement: 'Mire no topo da chaminé alta' },
      landingArea: { callout: 'Banana Car / Sandbags' },
      instructions: ['Trave na árvore de Banana', 'Mire na chaminé da casa de tijolos', 'Arremesse para queimar o carro completamente'],
      tags: ['Molotov', 'Banana-Control'],
      imageUrl: 'https://assets.csnades.gg/nades/inferno-smoke-a2ITuReCiS/lineup.webp',
    },
    {
      id: 'core-inferno-banana-flash',
      map: 'de_inferno',
      title: 'Banana Entry High Popflash',
      side: 'T',
      utilityType: 'FLASHBANG',
      technique: 'STAND',
      throwType: 'STANDING',
      startPosition: { callout: 'Banana Corner', description: 'Encoste na quina de Banana antes da meia-parede' },
      aimReference: { crosshairPlacement: 'Mire na beirada do telhado acima' },
      landingArea: { callout: 'Banana Sky' },
      instructions: ['Encoste na quina de Banana', 'Mire no topo do beiral', 'Solte com clique esquerdo para cegar CTs que estiverem espiando a Banana'],
      tags: ['Flash', 'Banana', 'Popflash'],
      imageUrl: 'https://assets.csnades.gg/nades/inferno-smoke-9LzHE8aRot/lineup.webp',
    },

    // --- DE_DUST2 ---
    {
      id: 'core-dust2-xbox-smoke',
      map: 'de_dust2',
      title: 'XBox Smoke from Lower Tunnels',
      side: 'T',
      utilityType: 'SMOKE',
      technique: 'STAND',
      throwType: 'STANDING',
      startPosition: { callout: 'Lower Tunnels Steps', description: 'Encoste no canto do degrau inferior do túnel baixo' },
      aimReference: { crosshairPlacement: 'Mire na quina superior esquerda da moldura da porta' },
      landingArea: { callout: 'Mid XBox' },
      instructions: ['Fique no canto dos degraus do túnel baixo', 'Mire na moldura superior da porta', 'Solte com clique esquerdo'],
      tags: ['XBox', 'Mid-Cat', 'Smoke'],
      imageUrl: 'https://assets.csnades.gg/nades/dust2-smoke-epau9Q3Dll/lineup.webp',
    },
    {
      id: 'core-dust2-long-cross-smoke',
      map: 'de_dust2',
      title: 'A Long Corner / Cross Smoke',
      side: 'T',
      utilityType: 'SMOKE',
      technique: 'STAND',
      throwType: 'STANDING',
      startPosition: { callout: 'Outside Long Doors', description: 'Trave na quina azul das portas do Fundo' },
      aimReference: { crosshairPlacement: 'Mire na ponta do dente do muro de pedra' },
      landingArea: { callout: 'A Long Corner Cross' },
      instructions: ['Encoste na quina da porta do Fundo', 'Mire no topo do dente de pedra', 'Solte com clique esquerdo'],
      tags: ['Long', 'A-Execute', 'Smoke'],
      imageUrl: 'https://assets.csnades.gg/nades/dust2-smoke-dBt2lcA3vc/lineup.webp',
    },
    {
      id: 'core-dust2-long-flash',
      map: 'de_dust2',
      title: 'Long Doors Fast Popflash',
      side: 'T',
      utilityType: 'FLASHBANG',
      technique: 'STAND',
      throwType: 'STANDING',
      startPosition: { callout: 'Long Doors Blue Bin', description: 'Encoste na caçamba azul de Long Doors' },
      aimReference: { crosshairPlacement: 'Mire na quina superior do telhado de Long Doors' },
      landingArea: { callout: 'Long Doors Sky' },
      instructions: ['Encoste na caçamba de Long Doors', 'Mire no telhado', 'Arremesse a bang com clique esquerdo para estourar no céu de Long'],
      tags: ['Flash', 'Long', 'Entry'],
      imageUrl: 'https://assets.csnades.gg/nades/dust2-smoke-HupX3P0FUE/lineup.webp',
    },

    // --- DE_NUKE ---
    {
      id: 'core-nuke-secret-smoke',
      map: 'de_nuke',
      title: 'Outside Secret Close Smoke',
      side: 'T',
      utilityType: 'SMOKE',
      technique: 'STAND',
      throwType: 'STANDING',
      startPosition: { callout: 'T Spawn Fence', description: 'Trave na cerca de arame do Spawn T' },
      aimReference: { crosshairPlacement: 'Mire na junção das vigas de ferro da passarela' },
      landingArea: { callout: 'Outside Secret Entrance' },
      instructions: ['Trave na cerca do Spawn T', 'Mire na quina da viga de ferro', 'Solte com clique esquerdo'],
      tags: ['Secret', 'Outside', 'Smoke'],
      imageUrl: 'https://assets.csnades.gg/nades/nuke-smoke-Ox2V20EXl2/lineup.webp',
    },
    {
      id: 'core-nuke-outside-flash',
      map: 'de_nuke',
      title: 'Outside High Sky Popflash',
      side: 'T',
      utilityType: 'FLASHBANG',
      technique: 'STAND',
      throwType: 'STANDING',
      startPosition: { callout: 'T Roof Ladder', description: 'Encoste na escada do telhado T' },
      aimReference: { crosshairPlacement: 'Mire no topo da caixa d água' },
      landingArea: { callout: 'Outside High' },
      instructions: ['Fique na base da escada', 'Mire no topo do tanque', 'Arremesse com clique esquerdo'],
      tags: ['Flash', 'Outside', 'Popflash'],
      imageUrl: 'https://assets.csnades.gg/nades/nuke-smoke-l3koCgeoHZ/lineup.webp',
    },

    // --- DE_ANCIENT ---
    {
      id: 'core-ancient-temple-smoke',
      map: 'de_ancient',
      title: 'A Temple Smoke from Outside A',
      side: 'T',
      utilityType: 'SMOKE',
      technique: 'STAND',
      throwType: 'STANDING',
      startPosition: { callout: 'Outside A Stone Pillar', description: 'Trave no pilar de pedra fora de A' },
      aimReference: { crosshairPlacement: 'Mire na folha superior da árvore virada para o templo' },
      landingArea: { callout: 'A Temple Entrance' },
      instructions: ['Trave no pilar de pedra', 'Mire na folha da árvore', 'Solte com clique esquerdo'],
      tags: ['Temple', 'A-Execute', 'Smoke'],
      imageUrl: 'https://assets.csnades.gg/nades/ancient-smoke-jRgHHBZPeJ/lineup.webp',
    },
    {
      id: 'core-ancient-donut-smoke',
      map: 'de_ancient',
      title: 'Donut Tunnel Smoke from Outside A',
      side: 'T',
      utilityType: 'SMOKE',
      technique: 'STAND',
      throwType: 'STANDING',
      startPosition: { callout: 'Outside A Rock', description: 'Encoste na rocha à esquerda da entrada A' },
      aimReference: { crosshairPlacement: 'Mire na fresta da copa das árvores' },
      landingArea: { callout: 'Donut Tunnel' },
      instructions: ['Trave na rocha', 'Mire no topo da folhagem', 'Solte com clique esquerdo'],
      tags: ['Donut', 'A-Execute', 'Smoke'],
      imageUrl: 'https://assets.csnades.gg/nades/ancient-smoke-0JpsvFLFbE/lineup.webp',
    },

    // --- DE_ANUBIS ---
    {
      id: 'core-anubis-heaven-smoke',
      map: 'de_anubis',
      title: 'A Heaven Smoke from Water',
      side: 'T',
      utilityType: 'SMOKE',
      technique: 'STAND',
      throwType: 'STANDING',
      startPosition: { callout: 'Canal Water Step', description: 'Trave no degrau de água sob a ponte' },
      aimReference: { crosshairPlacement: 'Mire no topo da janela do templo' },
      landingArea: { callout: 'A Heaven' },
      instructions: ['Fique no degrau da água', 'Mire na moldura superior da janela', 'Solte com clique esquerdo'],
      tags: ['Heaven', 'A-Execute', 'Smoke'],
      imageUrl: 'https://assets.csnades.gg/nades/anubis-smoke-kmlXeKSDJM/lineup.webp',
    },
    {
      id: 'core-anubis-b-connector-smoke',
      map: 'de_anubis',
      title: 'B Connector Smoke from Mid Doors',
      side: 'T',
      utilityType: 'SMOKE',
      technique: 'JUMPTHROW',
      throwType: 'JUMPTHROW',
      startPosition: { callout: 'Mid Doors Arch', description: 'Encoste no arco da porta do Meio' },
      aimReference: { crosshairPlacement: 'Mire na ponta da torre egípcia' },
      landingArea: { callout: 'B Connector Arch' },
      instructions: ['Encoste no batente da porta do Meio', 'Mire na ponta da torre', 'Execute jumpthrow'],
      tags: ['Connector', 'B-Execute', 'Smoke'],
      imageUrl: 'https://assets.csnades.gg/nades/anubis-smoke-kBDHAlSvdZ/lineup.webp',
    },
  ],
};

/**
 * Installs the default core starter pack into the local lineup database.
 */
export function installDefaultCoreStarterPack(): { count: number; titles: string[] } {
  const titles: string[] = [];
  for (const entry of DEFAULT_CORE_STARTER_PACK_MANIFEST.lineups) {
    const resolvedTitle =
      typeof entry.title === 'string'
        ? entry.title
        : entry.title?.en || Object.values(entry.title || {})[0] || 'Lineup';
    const resolvedInstructions = Array.isArray(entry.instructions)
      ? entry.instructions
      : entry.instructions?.en || Object.values(entry.instructions || {})[0] || [];

    const lineup: Lineup = {
      id: entry.id,
      map: entry.map,
      title: resolvedTitle,
      side: entry.side,
      utilityType: entry.utilityType,
      technique: entry.technique,
      throwType: entry.throwType,
      throwPosition: {
        x: entry.startPosition.x ?? 0,
        y: entry.startPosition.y ?? 0,
        z: entry.startPosition.z ?? 0,
        callout: entry.startPosition.callout,
        description: entry.startPosition.description || '',
        toleranceUnits: 8,
      },
      startPosition: {
        x: entry.startPosition.x ?? 0,
        y: entry.startPosition.y ?? 0,
        z: entry.startPosition.z ?? 0,
        callout: entry.startPosition.callout,
        toleranceUnits: 8,
      },
      crosshairTarget: {
        pitch: 0,
        yaw: 0,
        description: entry.aimReference?.crosshairPlacement || '',
        visualLandmark: entry.landingArea?.callout || '',
      },
      aimReference: {
        crosshairPlacement: entry.aimReference?.crosshairPlacement || '',
        visualLandmark: entry.landingArea?.callout || '',
      },
      landingArea: {
        x: entry.landingArea?.x ?? 0,
        y: entry.landingArea?.y ?? 0,
        z: entry.landingArea?.z ?? 0,
        callout: entry.landingArea?.callout || '',
      },
      targetDestination: {
        x: entry.landingArea?.x ?? 0,
        y: entry.landingArea?.y ?? 0,
        z: entry.landingArea?.z ?? 0,
        callout: entry.landingArea?.callout || '',
      },
      movementKey: entry.technique === 'JUMPTHROW' ? 'JUMPTHROW' : 'NONE',
      movementRequirements: entry.technique === 'JUMPTHROW' ? 'Jumpthrow' : 'Parado',
      tickrate: 'SUBTICK_CS2',
      tags: entry.tags || [entry.utilityType, entry.map],
      isCustom: false,
      favorite: false,
      instructions: resolvedInstructions,
      difficulty: 'EASY',
      sourceAttribution: 'CS2 Tactical Assistant Core Pack',
      verified: true,
      gameVersion: '1.40.2.1',
      lastVerificationDate: '2026-10-22',
      imageUrl: entry.imageUrl,
      thumbnailUrl: entry.imageUrl,
    };
    saveLineup(lineup);
    titles.push(lineup.title);
  }
  return { count: titles.length, titles };
}
