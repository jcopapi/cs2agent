import { describe, it, expect } from 'vitest';
import {
  importPixelPackFromZip,
  exportLineupsToZip,
  installDefaultCoreStarterPack,
  DEFAULT_CORE_STARTER_PACK_MANIFEST,
  getAvailableMapPacksMeta,
  getCuratedMapPackLineups,
  installMapPack,
  clearAllLineups,
} from '../src/core/utility/pixel-pack-manager';
import { getAllLineups } from '../src/core/utility/lineup-database';
import JSZip from 'jszip';

describe('Offline .ZIP Pixel Pack Manager', () => {
  it('installs default core starter pack with all essential lineups', () => {
    const result = installDefaultCoreStarterPack();
    expect(result.count).toBe(DEFAULT_CORE_STARTER_PACK_MANIFEST.lineups.length);
    expect(result.count).toBeGreaterThanOrEqual(15);

    const all = getAllLineups();
    expect(all.some((l) => l.id === 'core-mirage-stairs-smoke')).toBe(true);
    expect(all.some((l) => l.id === 'core-inferno-coffins-smoke')).toBe(true);
  });

  it('exports and re-imports a .zip pixel pack without internet', async () => {
    const testLineup = getAllLineups()[0];

    const zipBlob = await exportLineupsToZip(
      {
        name: 'My Team Mirage Pack',
        author: 'Fallen',
        description: 'Mirage A execute test pack',
        map: 'de_mirage',
      },
      [testLineup]
    );

    expect(zipBlob).toBeInstanceOf(Blob);
    expect(zipBlob.size).toBeGreaterThan(100);

    // Verify zip content with JSZip
    const zip = await JSZip.loadAsync(zipBlob);
    const manifestFile = zip.file('pack.json');
    expect(manifestFile).not.toBeNull();

    const manifestText = await manifestFile!.async('text');
    const parsed = JSON.parse(manifestText);
    expect(parsed.name).toBe('My Team Mirage Pack');
    expect(parsed.lineups.length).toBe(1);

    // Re-import the pack
    const importResult = await importPixelPackFromZip(zipBlob);
    expect(importResult.success).toBe(true);
    expect(importResult.packName).toBe('My Team Mirage Pack');
    expect(importResult.totalImported).toBe(1);
  });

  it('handles invalid or corrupted zip gracefully', async () => {
    const emptyZip = new JSZip();
    emptyZip.file('random.txt', 'hello');
    const badBlob = await emptyZip.generateAsync({ type: 'blob' });

    const result = await importPixelPackFromZip(badBlob);
    expect(result.success).toBe(false);
    expect(result.error).toContain('pack.json');
  });

  it('provides rich curated map packs across all 6 active duty maps', () => {
    const meta = getAvailableMapPacksMeta();
    expect(meta.length).toBe(6);

    const mirage = meta.find((m) => m.map === 'de_mirage');
    expect(mirage).toBeDefined();
    expect(mirage!.count).toBeGreaterThanOrEqual(69);
    expect(mirage!.smokes).toBeGreaterThan(0);
    expect(mirage!.flashes).toBeGreaterThan(0);

    const nuke = meta.find((m) => m.map === 'de_nuke');
    expect(nuke!.count).toBeGreaterThanOrEqual(37);

    const inferno = meta.find((m) => m.map === 'de_inferno');
    expect(inferno!.count).toBeGreaterThanOrEqual(50);
  });

  it('installs map pack with multilingual callout naming and instructions', () => {
    const res = installMapPack('de_mirage');
    expect(res.count).toBeGreaterThanOrEqual(69);

    const lineups = getCuratedMapPackLineups('de_mirage');
    expect(lineups.length).toBeGreaterThanOrEqual(69);
    const sample = lineups[0];
    expect(sample.title).toBeDefined();
    expect(sample.titles?.en).toBeDefined();
    expect(sample.titles?.pt).toBeDefined();
    expect(sample.titles?.es).toBeDefined();
    expect(sample.instructionsI18n?.pt).toBeDefined();
  });

  it('imports multilingual zip pack preserving en, pt, es fields', async () => {
    const multilingualManifest = {
      schemaVersion: '1.0',
      id: 'test-multilingual',
      name: 'Bilingual Smoke Pack',
      author: 'Tester',
      version: '1.0.0',
      description: 'Test multilingual pack',
      lineups: [
        {
          id: 'test-poly-1',
          map: 'de_mirage',
          title: {
            en: 'PALACE from T SPAWN',
            pt: 'PALÁCIO do SPAWN T',
            es: 'PALACIO de BASE T',
          },
          side: 'T',
          utilityType: 'SMOKE',
          technique: 'STAND',
          throwType: 'STANDING',
          startPosition: { callout: 'T Spawn' },
          landingArea: { callout: 'Palace' },
          instructions: {
            en: ['Stand at spawn', 'Left-click throw'],
            pt: ['Fique no spawn', 'Arremesse com clique esquerdo'],
            es: ['Ponte en base', 'Lanza con clic izquierdo'],
          },
        },
      ],
    };

    const zip = new JSZip();
    zip.file('pack.json', JSON.stringify(multilingualManifest));
    const blob = await zip.generateAsync({ type: 'blob' });

    const importRes = await importPixelPackFromZip(blob);
    expect(importRes.success).toBe(true);
    expect(importRes.totalImported).toBe(1);

    const imported = getAllLineups().find((l) => l.id === 'test-poly-1');
    expect(imported).toBeDefined();
    expect(imported?.title).toBe('PALACE from T SPAWN');
    expect(imported?.titles?.pt).toBe('PALÁCIO do SPAWN T');
    expect(imported?.instructionsI18n?.pt?.[0]).toBe('Fique no spawn');
  });

  it('resets loaded database to 0 when clearAllLineups is executed', () => {
    const cleared = clearAllLineups();
    expect(cleared).toBe(true);
    const after = getAllLineups();
    expect(after.length).toBe(0);
  });
});
