/**
 * CS2 Assistant - Web Utility Packs Importer Modal
 * File: src/renderer/components/utility-room/WebUtilityImporterModal.tsx
 *
 * Implements one-click import of verified external utility packs
 * (Scope.gg Flashes, TotalCSGO Molotovs, HLTV HE Grenades) and raw JSON import.
 */

import React, { useState } from 'react';
import {
  getAvailablePacks,
  isPackInstalled,
  importPack,
  uninstallPack,
  importLineupsFromJson,
  UtilityPack,
} from '../../../core/utility/web-lineup-importer';

export interface WebUtilityImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPacksUpdated: () => void;
}

export const WebUtilityImporterModal: React.FC<WebUtilityImporterModalProps> = ({
  isOpen,
  onClose,
  onPacksUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'PACKS' | 'CUSTOM_JSON'>('PACKS');
  const [customJsonValue, setCustomJsonValue] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const packs = getAvailablePacks();

  const handleTogglePack = (pack: UtilityPack) => {
    const installed = isPackInstalled(pack.id);
    if (installed) {
      uninstallPack(pack.id);
      setStatusMessage(`UNINSTALLED: ${pack.name}`);
    } else {
      const res = importPack(pack.id);
      setStatusMessage(`IMPORTED ${res.importedCount} LINEUPS FROM ${pack.name}`);
    }
    onPacksUpdated();
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleImportCustomJson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customJsonValue.trim()) return;
    const res = importLineupsFromJson(customJsonValue.trim());
    if (res.successCount > 0) {
      setStatusMessage(`SUCCESSFULLY IMPORTED ${res.successCount} CUSTOM LINEUPS`);
      setCustomJsonValue('');
      onPacksUpdated();
    } else {
      setStatusMessage(`IMPORT FAILED: ${res.errors[0] || 'Check JSON format'}`);
    }
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono select-none">
      <div className="relative w-full max-w-2xl bg-[#0c0c0e] border border-zinc-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 bg-[#09090b]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-black tracking-wider text-zinc-100 uppercase">
              // WEB UTILITY PACKS IMPORTER
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 text-sm px-1.5 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className="bg-cyan-950 border-b border-cyan-800 px-4 py-1.5 text-[10px] font-bold text-cyan-300 uppercase tracking-wide flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex items-center border-b border-zinc-800 bg-[#09090b] px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('PACKS')}
            className={`px-3 py-1.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'PACKS'
                ? 'border-cyan-400 text-cyan-300 bg-black/40'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            POPULAR SITE PACKS
          </button>
          <button
            onClick={() => setActiveTab('CUSTOM_JSON')}
            className={`px-3 py-1.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'CUSTOM_JSON'
                ? 'border-cyan-400 text-cyan-300 bg-black/40'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            CUSTOM JSON / URL
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'PACKS' && (
            <div className="space-y-3">
              {packs.map((pack) => {
                const installed = isPackInstalled(pack.id);

                return (
                  <div
                    key={pack.id}
                    className={`p-3.5 border transition-all flex flex-col gap-2 ${
                      installed
                        ? 'border-cyan-600/60 bg-cyan-950/20 shadow-sm'
                        : 'border-zinc-800 bg-black/50 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.2 text-[8px] font-black tracking-wider uppercase border ${
                            pack.category === 'FLASHBANG'
                              ? 'border-amber-800 bg-amber-950 text-amber-300'
                              : pack.category === 'MOLOTOV'
                              ? 'border-orange-800 bg-orange-950 text-orange-400'
                              : 'border-rose-800 bg-rose-950 text-rose-300'
                          }`}
                        >
                          {pack.category}
                        </span>
                        <span className="text-xs font-bold text-zinc-100">{pack.name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {installed ? (
                          <span className="text-[9px] font-black tracking-wider text-emerald-400 border border-emerald-800 bg-emerald-950/70 px-2 py-0.5">
                            ● INSTALLED
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-zinc-500">
                            {pack.lineups.length} LINEUPS
                          </span>
                        )}

                        <button
                          onClick={() => handleTogglePack(pack)}
                          className={`text-xs font-bold px-3 py-1 border transition-colors ${
                            installed
                              ? 'border-rose-800 bg-rose-950/60 text-rose-300 hover:bg-rose-900'
                              : 'border-cyan-500 bg-cyan-950 text-cyan-200 hover:bg-cyan-900 hover:border-cyan-400'
                          }`}
                        >
                          {installed ? 'UNINSTALL' : 'IMPORT PACK'}
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {pack.description}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-[9px] text-zinc-500">
                      <span>SOURCE: {pack.source}</span>
                      <span>ALL 6 ACTIVE DUTY MAPS</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'CUSTOM_JSON' && (
            <form onSubmit={handleImportCustomJson} className="flex flex-col gap-3">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                Paste JSON Lineups Array:
              </label>
              <textarea
                value={customJsonValue}
                onChange={(e) => setCustomJsonValue(e.target.value)}
                placeholder='[ { "id": "my-pixel", "map": "de_mirage", "title": "My Smoke", "utilityType": "SMOKE", ... } ]'
                rows={10}
                className="w-full bg-black border border-zinc-800 p-3 text-xs text-zinc-200 placeholder-zinc-700 outline-none focus:border-cyan-500 font-mono resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-zinc-600">
                  Accepts single lineup object or array of Lineups.
                </span>
                <button
                  type="submit"
                  className="px-4 py-1.5 border border-cyan-500 bg-cyan-950 text-cyan-300 text-xs font-bold hover:bg-cyan-900"
                >
                  IMPORT JSON
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800 px-4 py-2.5 bg-[#09090b] flex items-center justify-between text-[10px] text-zinc-500">
          <span>ZERO EXTERNAL LAG // IMPORTED DIRECTLY TO LOCAL CLIENT STORAGE</span>
          <button
            onClick={onClose}
            className="border border-zinc-700 bg-black px-3 py-1 text-zinc-300 hover:text-white"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebUtilityImporterModal;
