import { describe, it, expect } from 'vitest';
import {
  importPixelPackFromZip,
  exportLineupsToZip,
  installDefaultCoreStarterPack,
  DEFAULT_CORE_STARTER_PACK_MANIFEST,
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
});
