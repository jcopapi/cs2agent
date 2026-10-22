/**
 * CS2 Assistant - Pixel Pack (.ZIP) Manager Modal
 * File: src/renderer/components/utility-room/PixelPackModal.tsx
 *
 * Implements 100% offline .zip pixel pack management:
 * - Tab 1: Per-map offline curated packs (Mirage, Inferno, Dust II, Nuke, Ancient, Anubis)
 * - Tab 2: Import custom community .zip packs from disk or 'Custom Lineups/' folder
 * - Tab 3: Export player lineups to .zip archive
 * - Manage: Reset/Clear all loaded lineups to 0
 */

import React, { useState, useRef } from 'react';
import type { CS2Map } from '../../../core/utility/types';
import {
  importPixelPackFromZip,
  exportLineupsToZip,
  getAvailableMapPacksMeta,
  installMapPack,
  installAllOfficialMapPacks,
  clearAllLineups,
  type ImportPackResult,
  type MapPackMeta,
} from '../../../core/utility/pixel-pack-manager';
import { getAllLineups } from '../../../core/utility/lineup-database';
import { useI18n } from '../../i18n/I18nContext';

function triggerZipDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.zip') ? filename : `${filename}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

interface PixelPackModalProps {
  isOpen: boolean;
  currentMap: CS2Map;
  onClose: () => void;
  onPacksUpdated: () => void;
}

export const PixelPackModal: React.FC<PixelPackModalProps> = ({
  isOpen,
  currentMap,
  onClose,
  onPacksUpdated,
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'MAPS' | 'IMPORT' | 'EXPORT'>('MAPS');
  const [importStatus, setImportStatus] = useState<ImportPackResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [exportName, setExportName] = useState<string>('Custom Pixel Pack');
  const [exportAuthor, setExportAuthor] = useState<string>('Player');
  const [exportScope, setExportScope] = useState<'MAP' | 'ALL' | 'CUSTOM'>('MAP');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const mapPacks = getAvailableMapPacksMeta();
  const loadedLineups = getAllLineups();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportStatus(null);

    const result = await importPixelPackFromZip(file);
    setImportStatus(result);
    setIsProcessing(false);

    if (result.success) {
      onPacksUpdated();
    }
  };

  const handleInstallSingleMap = (map: CS2Map) => {
    setIsProcessing(true);
    const res = installMapPack(map);
    setImportStatus({
      success: true,
      packName: `${map.replace('de_', '').toUpperCase()} Pack`,
      author: 'Official In-Game CS2 Set',
      totalImported: res.count,
    });
    setIsProcessing(false);
    onPacksUpdated();
  };

  const handleInstallAllMaps = () => {
    setIsProcessing(true);
    const res = installAllOfficialMapPacks();
    setImportStatus({
      success: true,
      packName: 'All Official Map Packs',
      author: 'Official In-Game CS2 Set',
      totalImported: res.totalCount,
    });
    setIsProcessing(false);
    onPacksUpdated();
  };

  const handleClearAll = () => {
    if (window.confirm(t('packModal.clearConfirm'))) {
      clearAllLineups();
      setImportStatus({
        success: true,
        packName: 'Database Cleared',
        author: 'System',
        totalImported: 0,
      });
      onPacksUpdated();
    }
  };

  const handleExportZip = async () => {
    setIsProcessing(true);
    const all = getAllLineups();
    let toExport = all;
    if (exportScope === 'MAP') {
      toExport = all.filter((l) => l.map === currentMap);
    } else if (exportScope === 'CUSTOM') {
      toExport = all.filter((l) => l.isCustom);
    }

    if (toExport.length === 0) {
      alert('Nenhum pixel encontrado para o filtro selecionado.');
      setIsProcessing(false);
      return;
    }

    const safeFileName = exportName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const blob = await exportLineupsToZip(
      {
        name: exportName,
        author: exportAuthor,
        description: `Exported pixel pack (${toExport.length} lineups)`,
        map: exportScope === 'MAP' ? currentMap : 'MULTI',
      },
      toExport
    );

    triggerZipDownload(blob, `${safeFileName}.zip`);
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-surface-container border border-border-subtle shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">folder_zip</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">{t('packModal.title')}</h3>
              <p className="text-[11px] text-text-muted">{t('packModal.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-7 h-7 rounded-lg hover:bg-surface-container-high text-text-secondary hover:text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-border-subtle shrink-0">
          <button
            onClick={() => setActiveTab('MAPS')}
            type="button"
            className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
              activeTab === 'MAPS'
                ? 'border-primary text-white bg-surface-container-high'
                : 'border-transparent text-text-secondary hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">map</span>
            {t('packModal.tabPacks')}
          </button>
          <button
            onClick={() => setActiveTab('IMPORT')}
            type="button"
            className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
              activeTab === 'IMPORT'
                ? 'border-primary text-white bg-surface-container-high'
                : 'border-transparent text-text-secondary hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">file_upload</span>
            {t('packModal.tabImport')}
          </button>
          <button
            onClick={() => setActiveTab('EXPORT')}
            type="button"
            className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
              activeTab === 'EXPORT'
                ? 'border-primary text-white bg-surface-container-high'
                : 'border-transparent text-text-secondary hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">file_download</span>
            {t('packModal.tabExport')}
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {/* Status Message */}
          {importStatus && (
            <div
              className={`mb-4 p-3 rounded-xl border text-xs flex items-center justify-between ${
                importStatus.success
                  ? 'bg-success/15 border-success/30 text-success'
                  : 'bg-danger/15 border-danger/30 text-danger'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">
                  {importStatus.success ? 'check_circle' : 'error'}
                </span>
                <span>
                  {importStatus.success
                    ? `${importStatus.packName}: ${importStatus.totalImported} pixels sincronizados.`
                    : `Erro: ${importStatus.error}`}
                </span>
              </div>
              <button
                onClick={() => setImportStatus(null)}
                className="text-[10px] uppercase font-bold tracking-wider hover:underline"
              >
                ✕
              </button>
            </div>
          )}

          {/* TAB 1: PER-MAP PACKS */}
          {activeTab === 'MAPS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    {t('packModal.curatedTitle')}
                  </h4>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {t('packModal.curatedDesc')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleInstallAllMaps}
                    disabled={isProcessing}
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-primary text-surface font-bold text-xs hover:bg-primary-hover transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[15px]">download_done</span>
                    Instalar Todos (300+)
                  </button>
                  <button
                    onClick={handleClearAll}
                    disabled={isProcessing || loadedLineups.length === 0}
                    type="button"
                    className="px-2.5 py-1.5 rounded-xl bg-danger/15 text-danger hover:bg-danger/25 text-xs font-bold transition-all border border-danger/30"
                    title={t('packModal.clearDatabase')}
                  >
                    <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
                  </button>
                </div>
              </div>

              {/* Maps Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {mapPacks.map((m) => {
                  const mapInstalledCount = loadedLineups.filter((l) => l.map === m.map).length;
                  const isInstalled = mapInstalledCount > 0;

                  return (
                    <div
                      key={m.map}
                      className="p-3.5 rounded-xl bg-surface-subtle border border-border-subtle flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-bold text-white uppercase font-mono tracking-wide">
                            {m.name}
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-surface-container font-semibold text-text-secondary">
                            {m.count} pixels
                          </span>
                        </div>
                        <div className="text-[10px] text-text-muted flex items-center gap-2">
                          <span>{m.smokes} Smokes</span>
                          <span>•</span>
                          <span>{m.flashes} Flashes</span>
                          <span>•</span>
                          <span>{m.molies} Molies</span>
                          <span>•</span>
                          <span>{m.hes} HE</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-border-subtle/60 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-text-muted">
                          {isInstalled ? `${mapInstalledCount} no launcher` : 'Não instalado'}
                        </span>
                        <button
                          onClick={() => handleInstallSingleMap(m.map)}
                          disabled={isProcessing}
                          type="button"
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            isInstalled
                              ? 'bg-surface-container hover:bg-surface-container-high text-white border border-border-subtle'
                              : 'bg-primary text-surface hover:bg-primary-hover shadow-sm'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {isInstalled ? 'refresh' : 'download'}
                          </span>
                          {isInstalled ? t('packModal.reinstall') : t('packModal.install')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT CUSTOM ZIP */}
          {activeTab === 'IMPORT' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border-subtle hover:border-primary/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-surface-subtle/30"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-[26px]">folder_open</span>
                </div>
                <div className="text-sm font-bold text-white">{t('packModal.selectZip')}</div>
                <div className="text-xs text-text-muted mt-1">{t('packModal.dropZip')}</div>
                <div className="text-[10px] text-text-muted mt-2 font-mono">
                  Compatível com pasta &quot;Custom Lineups&quot;
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip,application/zip"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* TAB 3: EXPORT */}
          {activeTab === 'EXPORT' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Nome do Pacote
                </label>
                <input
                  type="text"
                  value={exportName}
                  onChange={(e) => setExportName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Autor
                </label>
                <input
                  type="text"
                  value={exportAuthor}
                  onChange={(e) => setExportAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Escopo de Exportação
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportScope('MAP')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                      exportScope === 'MAP'
                        ? 'bg-primary text-surface border-primary'
                        : 'bg-surface-subtle text-text-secondary border-border-subtle hover:text-white'
                    }`}
                  >
                    Mapa Atual ({currentMap.replace('de_', '')})
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportScope('CUSTOM')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                      exportScope === 'CUSTOM'
                        ? 'bg-primary text-surface border-primary'
                        : 'bg-surface-subtle text-text-secondary border-border-subtle hover:text-white'
                    }`}
                  >
                    Apenas Customizados
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportScope('ALL')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                      exportScope === 'ALL'
                        ? 'bg-primary text-surface border-primary'
                        : 'bg-surface-subtle text-text-secondary border-border-subtle hover:text-white'
                    }`}
                  >
                    Todos ({loadedLineups.length})
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleExportZip}
                  disabled={isProcessing}
                  type="button"
                  className="w-full py-2.5 rounded-xl bg-primary text-surface font-bold text-xs hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  {t('packModal.exportZip')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
