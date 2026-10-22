import { describe, it, expect } from 'vitest';
import { TRANSLATIONS } from '../src/renderer/i18n/translations';
import { getCuratedMapPackLineups, getAvailableMapPacksMeta } from '../src/core/utility/map-packs-data';
import type { CS2Map } from '../src/core/utility/types';
import packageJson from '../package.json';

const MAPS: CS2Map[] = ['de_mirage', 'de_inferno', 'de_dust2', 'de_nuke', 'de_ancient', 'de_anubis'];

describe('UI Consistency, Branding & Balloon Metadata Tests', () => {
  it('CS-BRAND-01: App name is strictly "CS Overlay Assistant" across all languages', () => {
    expect(TRANSLATIONS.en['app.brand']).toBe('CS Overlay Assistant');
    expect(TRANSLATIONS['pt-BR']['app.brand']).toBe('CS Overlay Assistant');
    expect(TRANSLATIONS.es['app.brand']).toBe('CS Overlay Assistant');
    expect(packageJson.productName).toBe('CS Overlay Assistant');
    expect(packageJson.name).toBe('cs-overlay-assistant');
  });

  it('CS-UTIL-01: Map packs include a rich competitive balance of Smokes, Flashes, Molotovs, and HEs', () => {
    const metaList = getAvailableMapPacksMeta();
    expect(metaList.length).toBeGreaterThanOrEqual(6);

    for (const map of MAPS) {
      const lineups = getCuratedMapPackLineups(map);
      expect(lineups.length, `Map ${map} must have curated lineups`).toBeGreaterThanOrEqual(10);

      const utilityTypes = new Set(lineups.map((l) => l.utilityType));
      // Must contain SMOKE
      expect(utilityTypes.has('SMOKE'), `Map ${map} must have SMOKE`).toBe(true);
      // Must contain FLASHBANG
      expect(utilityTypes.has('FLASHBANG'), `Map ${map} must have FLASHBANG`).toBe(true);
      // Must contain MOLOTOV or MOLOTOV_INCENDIARY
      const hasMoly = utilityTypes.has('MOLOTOV') || utilityTypes.has('MOLOTOV_INCENDIARY');
      expect(hasMoly, `Map ${map} must have MOLOTOV`).toBe(true);
      // Must contain HE_GRENADE
      expect(utilityTypes.has('HE_GRENADE'), `Map ${map} must have HE_GRENADE`).toBe(true);
    }
  });

  it('CS-BALLOON-01: Every lineup has origin (From) and destination (To) callouts for dual-balloon rendering', () => {
    for (const map of MAPS) {
      const lineups = getCuratedMapPackLineups(map);
      for (const lineup of lineups) {
        const from = lineup.startPosition?.callout || lineup.throwPosition?.callout;
        const to = lineup.landingArea?.callout || lineup.targetDestination?.callout;
        expect(from, `Lineup ${lineup.id} in ${map} must have From callout`).toBeDefined();
        expect(from?.length).toBeGreaterThan(0);
        expect(to, `Lineup ${lineup.id} in ${map} must have To callout`).toBeDefined();
        expect(to?.length).toBeGreaterThan(0);
      }
    }
  });

  it('CS-MAP-01: No cross-contamination of map assets (no Mirage images in Nuke, etc.)', () => {
    for (const map of MAPS) {
      const mapKey = map.replace('de_', '');
      const lineups = getCuratedMapPackLineups(map);
      for (const lineup of lineups) {
        if (lineup.imageUrl && lineup.imageUrl.includes('assets.csnades.gg')) {
          const pathSlug = lineup.imageUrl.split('/')[4] || '';
          expect(
            pathSlug.startsWith(mapKey),
            `Lineup ${lineup.id} in map ${map} must not use asset from another map: ${lineup.imageUrl}`
          ).toBe(true);
        }
      }
    }
  });

  it('CS-LAND-01: Every lineup has a landing result photo showing where it falls/blooms', () => {
    for (const map of MAPS) {
      const lineups = getCuratedMapPackLineups(map);
      for (const lineup of lineups) {
        const landingPhoto = lineup.thumbnailUrl || lineup.resultImageUrl;
        expect(landingPhoto, `Lineup ${lineup.id} in ${map} must have landing result photo`).toBeDefined();
        expect(landingPhoto?.length).toBeGreaterThan(0);
      }
    }
  });
});
