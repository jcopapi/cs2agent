/**
 * CS2 Assistant - Pixel Pack (.ZIP) Manager Modal
 * File: src/renderer/components/utility-room/PixelPackModal.tsx
 *
 * Implements 100% offline .zip pixel pack import and export:
 * - Import any .zip pixel pack without internet or external fetching
 * - 1-Click installation of the default Core Starter Pack (Smokes, Bangs, Molys, HE)
 * - Export custom or map-specific lineups into distributable .zip archives
 */

import React, { useState, useRef } from 'react';
import type { CS2Map } from '../../../core/utility/types';
import {
  importPixelPackFromZip,
  exportLineupsToZip,
  installDefaultCoreStarterPack,
  DEFAULT_CORE_STARTER_PACK_MANIFEST,
  type ImportPackResult,
} from '../../../core/utility/pixel-pack-manager';
import { getAllLineups } from '../../../core/utility/lineup-database';

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
  const [activeTab, setActiveTab] = useState<'IMPORT' | 'STARTER' | 'EXPORT'>('STARTER');
  const [importStatus, setImportStatus] = useState<ImportPackResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [exportName, setExportName] = useState<string>('Meus Pixels CS2');
  const [exportAuthor, setExportAuthor] = useState<string>('Player');
  const [exportScope, setExportScope] = useState<'MAP' | 'ALL' | 'CUSTOM'>('MAP');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

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

  const handleInstallStarterPack = () => {
    setIsProcessing(true);
    const result = installDefaultCoreStarterPack();
    setImportStatus({
      success: true,
      packName: DEFAULT_CORE_STARTER_PACK_MANIFEST.name,
      author: DEFAULT_CORE_STARTER_PACK_MANIFEST.author,
      totalImported: result.count,
      lineupTitles: result.titles,
    });
    setIsProcessing(false);
    onPacksUpdated();
  };

  const handleExportStarterZip = async () => {
    setIsProcessing(true);
    const lineups = getAllLineups().filter((l) =>
      DEFAULT_CORE_STARTER_PACK_MANIFEST.lineups.some((m) => m.id === l.id)
    );
    const blob = await exportLineupsToZip(
      {
        name: DEFAULT_CORE_STARTER_PACK_MANIFEST.name,
        author: DEFAULT_CORE_STARTER_PACK_MANIFEST.author,
        description: DEFAULT_CORE_STARTER_PACK_MANIFEST.description,
        map: 'MULTI',
      },
      lineups
    );
    triggerZipDownload(blob, 'cs2-core-starter-pack.zip');
    setIsProcessing(false);
  };

  const handleExportCustomZip = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const all = getAllLineups();
    let selectedLineups = all;

    if (exportScope === 'MAP') {
      selectedLineups = all.filter((l) => l.map === currentMap);
    } else if (exportScope === 'CUSTOM') {
      selectedLineups = all.filter((l) => l.isCustom);
    }

    if (selectedLineups.length === 0) {
      alert('Nenhum pixel encontrado no escopo selecionado para exportar.');
      setIsProcessing(false);
      return;
    }

    const blob = await exportLineupsToZip(
      {
        name: exportName.trim() || 'Pacote de Pixels',
        author: exportAuthor.trim() || 'Player',
        map: exportScope === 'MAP' ? currentMap : 'MULTI',
      },
      selectedLineups
    );

    const safeFileName = (exportName.trim() || 'pixels').toLowerCase().replace(/\s+/g, '-');
    triggerZipDownload(blob, `${safeFileName}.zip`);
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl rounded-2xl bg-surface border border-border-medium shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-surface-subtle shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">folder_zip</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Pacotes de Pixels (.ZIP)</h2>
              <p className="text-[11px] text-text-muted">
                100% offline • Sem dependência de internet ou falhas de carregamento
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-text-muted hover:text-white hover:bg-surface-container flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Sub-Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-border-subtle bg-surface-subtle/50 shrink-0">
          <button
            onClick={() => setActiveTab('STARTER')}
            className={`px-3 py-1.5 rounded-t-xl text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'STARTER'
                ? 'border-primary text-white bg-surface font-semibold'
                : 'border-transparent text-text-muted hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-primary">verified</span>
            <span>Pacote Inicial Padrão</span>
          </button>

          <button
            onClick={() => setActiveTab('IMPORT')}
            className={`px-3 py-1.5 rounded-t-xl text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'IMPORT'
                ? 'border-primary text-white bg-surface font-semibold'
                : 'border-transparent text-text-muted hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-secondary">file_upload</span>
            <span>Importar .ZIP</span>
          </button>

          <button
            onClick={() => setActiveTab('EXPORT')}
            className={`px-3 py-1.5 rounded-t-xl text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'EXPORT'
                ? 'border-primary text-white bg-surface font-semibold'
                : 'border-transparent text-text-muted hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-tertiary">file_download</span>
            <span>Exportar .ZIP</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: PACOTE INICIAL PADRAO */}
          {activeTab === 'STARTER' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-container border border-border-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">
                    {DEFAULT_CORE_STARTER_PACK_MANIFEST.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                    {DEFAULT_CORE_STARTER_PACK_MANIFEST.lineups.length} LINEUPS
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {DEFAULT_CORE_STARTER_PACK_MANIFEST.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                  <div className="p-2 rounded-lg bg-surface-container-high text-center">
                    <div className="text-[10px] font-mono text-secondary">SMOKES</div>
                    <div className="text-xs font-bold text-white mt-0.5">Stairs, Jungle, Window...</div>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-container-high text-center">
                    <div className="text-[10px] font-mono text-tertiary">BANGS</div>
                    <div className="text-xs font-bold text-white mt-0.5">Ramp, Banana, Long...</div>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-container-high text-center">
                    <div className="text-[10px] font-mono text-danger">MOLOTOVS & HE</div>
                    <div className="text-xs font-bold text-white mt-0.5">Palace, Car, Short...</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3">
                  <button
                    disabled={isProcessing}
                    onClick={handleInstallStarterPack}
                    className="flex-1 py-2 px-3 rounded-xl bg-primary text-surface font-semibold text-xs hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">install_desktop</span>
                    <span>Instalar Pacote no Launcher</span>
                  </button>

                  <button
                    disabled={isProcessing}
                    onClick={handleExportStarterZip}
                    title="Baixar arquivo .zip do modelo padrão para compartilhar"
                    className="py-2 px-3 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs text-text-secondary hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Baixar .ZIP</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORTAR .ZIP */}
          {activeTab === 'IMPORT' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border-medium hover:border-primary/60 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-surface-container/40 hover:bg-surface-container"
              >
                <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[26px]">upload_file</span>
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-white">
                    Clique para selecionar um arquivo .ZIP
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    Contendo pack.json e pasta images/ com as capturas do jogo
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXPORTAR .ZIP */}
          {activeTab === 'EXPORT' && (
            <form onSubmit={handleExportCustomZip} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-text-muted">NOME DO PACOTE</label>
                <input
                  type="text"
                  value={exportName}
                  onChange={(e) => setExportName(e.target.value)}
                  placeholder="Ex: Mirage T Execs Pro"
                  className="w-full bg-surface-container rounded-xl border border-border-subtle px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-text-muted">AUTOR</label>
                <input
                  type="text"
                  value={exportAuthor}
                  onChange={(e) => setExportAuthor(e.target.value)}
                  placeholder="Seu Nick / Equipe"
                  className="w-full bg-surface-container rounded-xl border border-border-subtle px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-text-muted">ESCOPO DAS LINEUPS</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportScope('MAP')}
                    className={`p-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      exportScope === 'MAP'
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-border-subtle bg-surface-container text-text-muted hover:text-white'
                    }`}
                  >
                    Mapa Atual ({currentMap.replace('de_', '').toUpperCase()})
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportScope('CUSTOM')}
                    className={`p-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      exportScope === 'CUSTOM'
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-border-subtle bg-surface-container text-text-muted hover:text-white'
                    }`}
                  >
                    Meus Pixels Criados
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportScope('ALL')}
                    className={`p-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      exportScope === 'ALL'
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-border-subtle bg-surface-container text-text-muted hover:text-white'
                    }`}
                  >
                    Todos os Mapas
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 rounded-xl bg-primary text-surface font-semibold text-xs hover:bg-primary/90 flex items-center justify-center gap-1.5 transition-all shadow-sm mt-4"
              >
                <span className="material-symbols-outlined text-[16px]">archive</span>
                <span>Exportar e Baixar Arquivo .ZIP</span>
              </button>
            </form>
          )}

          {/* Feedback Status Alert */}
          {importStatus && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs animate-fade-in ${
                importStatus.success
                  ? 'bg-success-soft border-success/30 text-success'
                  : 'bg-danger-soft border-danger/30 text-danger'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                {importStatus.success ? 'check_circle' : 'error'}
              </span>
              <div className="flex-1">
                <div className="font-semibold">
                  {importStatus.success
                    ? `Pacote "${importStatus.packName}" instalado com sucesso!`
                    : 'Falha na importação do pacote'}
                </div>
                <div className="text-[11px] mt-0.5 opacity-90">
                  {importStatus.success
                    ? `${importStatus.totalImported} lineups adicionadas ao launcher. Imagens carregadas 100% offline.`
                    : importStatus.error}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PixelPackModal;
