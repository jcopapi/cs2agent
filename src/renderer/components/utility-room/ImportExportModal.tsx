/**
 * CS2 Assistant - JSON Import / Export Modal
 * File: src/renderer/components/utility-room/ImportExportModal.tsx
 *
 * Implements schema-validated JSON import and export with prototype pollution
 * verification, real-time error reporting, conflict resolution policies,
 * clipboard copy, and file download.
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  Upload,
  Download,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import type { CS2Map, Lineup, Strategy } from '../../../core/utility/types';
import {
  serializeExportEnvelope,
  deserializeAndValidate,
  type ImportConflictPolicy,
  type ImportSummary,
} from '../../../core/utility/json-io';

export interface ImportExportModalProps {
  defaultTab?: 'IMPORT' | 'EXPORT';
  currentMap: CS2Map;
  existingLineups: Lineup[];
  existingStrategies: Strategy[];
  onClose: () => void;
  onImportComplete: (updatedData: { lineups: Lineup[]; strategies: Strategy[] }) => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  defaultTab = 'IMPORT',
  currentMap,
  existingLineups,
  existingStrategies,
  onClose,
  onImportComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'IMPORT' | 'EXPORT'>(defaultTab);

  // Export State
  const [exportScope, setExportScope] = useState<'MAP' | 'ALL' | 'CUSTOM'>('MAP');
  const [copied, setCopied] = useState<boolean>(false);

  // Import State
  const [importJson, setImportJson] = useState<string>('');
  const [conflictPolicy, setConflictPolicy] = useState<ImportConflictPolicy>('SKIP');
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);

  // Compute Export Payload
  const exportPayloadString = useMemo(() => {
    let targetLineups = existingLineups;
    let targetStrategies = existingStrategies;

    if (exportScope === 'MAP') {
      targetLineups = existingLineups.filter((l) => l.map === currentMap);
      targetStrategies = existingStrategies.filter((s) => s.map === currentMap);
    } else if (exportScope === 'CUSTOM') {
      targetLineups = existingLineups.filter((l) => l.isCustom);
      targetStrategies = existingStrategies.filter((s) => s.isCustom);
    }

    return serializeExportEnvelope(
      'PLAYBOOK_BUNDLE',
      { lineups: targetLineups, strategies: targetStrategies },
      { mapFilter: exportScope === 'MAP' ? currentMap : undefined }
    );
  }, [exportScope, currentMap, existingLineups, existingStrategies]);

  // Copy Export to Clipboard
  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportPayloadString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  // Download Export File
  const handleDownloadFile = () => {
    const blob = new Blob([exportPayloadString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cs2-assistant-playbook-${exportScope.toLowerCase()}-${currentMap}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setImportJson(content);
        setImportSummary(null);
      }
    };
    reader.readAsText(file);
  };

  // Perform Validation & Import
  const handleExecuteImport = () => {
    if (!importJson.trim()) return;

    try {
      const result = deserializeAndValidate(
        importJson,
        conflictPolicy,
        existingLineups,
        existingStrategies
      );

      setImportSummary(result.summary);

      if (result.summary.errors.length === 0 && result.summary.importedCount > 0) {
        onImportComplete({
          lineups: result.lineups,
          strategies: result.strategies,
        });
      }
    } catch (err: any) {
      setImportSummary({
        totalProcessed: 0,
        importedCount: 0,
        skippedCount: 0,
        overwrittenCount: 0,
        renamedCount: 0,
        errors: [{ path: 'payload', message: err.message || 'Fatal parsing error' }],
        sanitizationWarnings: [],
        importedLineupIds: [],
        importedStrategyIds: [],
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 select-none">
      <div className="flex h-[80vh] w-[850px] flex-col rounded-lg border border-border-subtle bg-background-panel shadow-2xl overflow-hidden">
        {/* Modal Header & Tabs */}
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm text-zinc-100 uppercase tracking-wider">
              JSON PLAYBOOK I/O
            </span>
            <div className="flex rounded border border-border-subtle bg-background p-0.5 text-xs font-mono">
              <button
                onClick={() => setActiveTab('IMPORT')}
                className={`rounded px-3 py-1 transition-colors cursor-pointer ${
                  activeTab === 'IMPORT'
                    ? 'bg-tactical-cyan text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                IMPORT
              </button>
              <button
                onClick={() => setActiveTab('EXPORT')}
                className={`rounded px-3 py-1 transition-colors cursor-pointer ${
                  activeTab === 'EXPORT'
                    ? 'bg-tactical-cyan text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                EXPORT
              </button>
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1 text-zinc-400 hover:text-zinc-200 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs space-y-4">
          {activeTab === 'EXPORT' ? (
            /* EXPORT TAB */
            <div className="space-y-4">
              {/* Scope Options */}
              <div className="flex items-center justify-between rounded border border-border-subtle bg-background p-3">
                <span className="font-mono text-zinc-400">EXPORT SCOPE:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExportScope('MAP')}
                    className={`rounded px-3 py-1 font-mono text-[11px] border cursor-pointer ${
                      exportScope === 'MAP'
                        ? 'border-tactical-cyan bg-tactical-cyan/10 text-tactical-cyan font-bold'
                        : 'border-border-subtle text-zinc-400'
                    }`}
                  >
                    Current Map ({currentMap})
                  </button>
                  <button
                    onClick={() => setExportScope('ALL')}
                    className={`rounded px-3 py-1 font-mono text-[11px] border cursor-pointer ${
                      exportScope === 'ALL'
                        ? 'border-tactical-cyan bg-tactical-cyan/10 text-tactical-cyan font-bold'
                        : 'border-border-subtle text-zinc-400'
                    }`}
                  >
                    All Active Duty Maps
                  </button>
                  <button
                    onClick={() => setExportScope('CUSTOM')}
                    className={`rounded px-3 py-1 font-mono text-[11px] border cursor-pointer ${
                      exportScope === 'CUSTOM'
                        ? 'border-tactical-cyan bg-tactical-cyan/10 text-tactical-cyan font-bold'
                        : 'border-border-subtle text-zinc-400'
                    }`}
                  >
                    User Custom Items Only
                  </button>
                </div>
              </div>

              {/* JSON Payload Preview */}
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  SERIALIZED PLAYBOOK ENVELOPE (JSON)
                </label>
                <textarea
                  readOnly
                  value={exportPayloadString}
                  rows={14}
                  className="w-full rounded border border-border-subtle bg-background p-3 font-mono text-[11px] text-zinc-300 focus:outline-none"
                />
              </div>

              {/* Export Action Buttons */}
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={handleCopyClipboard}
                  className="rounded border border-border-elevated bg-background hover:bg-background-elevated px-4 py-2 font-semibold text-zinc-200 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-tactical-emerald" /> : <Copy className="h-4 w-4 text-zinc-400" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy JSON'}</span>
                </button>
                <button
                  onClick={handleDownloadFile}
                  className="rounded bg-tactical-cyan hover:bg-tactical-cyan/90 px-4 py-2 font-bold text-zinc-950 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download .json File</span>
                </button>
              </div>
            </div>
          ) : (
            /* IMPORT TAB */
            <div className="space-y-4">
              {/* Conflict Resolution Settings */}
              <div className="flex items-center justify-between rounded border border-border-subtle bg-background p-3">
                <span className="font-mono text-zinc-400">CONFLICT RESOLUTION:</span>
                <div className="flex items-center gap-2">
                  {(['SKIP', 'RENAME', 'OVERWRITE'] as const).map((policy) => (
                    <button
                      key={policy}
                      onClick={() => setConflictPolicy(policy)}
                      className={`rounded px-3 py-1 font-mono text-[11px] border cursor-pointer ${
                        conflictPolicy === policy
                          ? 'border-tactical-cyan bg-tactical-cyan/10 text-tactical-cyan font-bold'
                          : 'border-border-subtle text-zinc-400'
                      }`}
                    >
                      {policy === 'SKIP' && 'Skip Existing (Safe)'}
                      {policy === 'RENAME' && 'Rename & Keep Both'}
                      {policy === 'OVERWRITE' && 'Overwrite Existing'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono text-zinc-400">
                    PASTE JSON PAYLOAD OR LOAD FROM FILE
                  </label>
                  <label className="text-[11px] text-tactical-cyan hover:underline cursor-pointer flex items-center gap-1">
                    <Upload className="h-3 w-3" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  value={importJson}
                  onChange={(e) => {
                    setImportJson(e.target.value);
                    setImportSummary(null);
                  }}
                  rows={10}
                  placeholder="Paste JSON lineup, strategy, or playbook bundle here..."
                  className="w-full rounded border border-border-subtle bg-background p-3 font-mono text-[11px] text-zinc-200 placeholder:text-zinc-600 focus:border-tactical-cyan focus:outline-none"
                />
              </div>

              {/* Import Results Summary Banner */}
              {importSummary && (
                <div
                  className={`rounded border p-3 space-y-2 ${
                    importSummary.errors.length > 0
                      ? 'border-tactical-rose/40 bg-tactical-rose/10 text-tactical-rose'
                      : 'border-tactical-emerald/40 bg-tactical-emerald/10 text-tactical-emerald'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <div className="flex items-center gap-2">
                      {importSummary.errors.length > 0 ? (
                        <>
                          <ShieldAlert className="h-4 w-4" />
                          <span>Validation Failed ({importSummary.errors.length} errors)</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          <span>Validation & Security Inspection Passed!</span>
                        </>
                      )}
                    </div>
                    <span className="font-mono text-[10px]">
                      {importSummary.importedCount} Imported • {importSummary.skippedCount} Skipped •{' '}
                      {importSummary.renamedCount} Renamed
                    </span>
                  </div>

                  {importSummary.errors.length > 0 && (
                    <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                      {importSummary.errors.slice(0, 5).map((err, idx) => (
                        <li key={idx}>
                          <span className="font-mono">{err.path}</span>: {err.message}
                        </li>
                      ))}
                    </ul>
                  )}

                  {importSummary.sanitizationWarnings.length > 0 && (
                    <div className="text-[10px] text-tactical-amber font-mono pt-1">
                      Sanitization Warnings ({importSummary.sanitizationWarnings.length}): Dangerous tags or
                      attributes were sanitized safely.
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <div className="flex items-center justify-end">
                <button
                  onClick={handleExecuteImport}
                  disabled={!importJson.trim()}
                  className="rounded bg-tactical-cyan hover:bg-tactical-cyan/90 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2 font-bold text-zinc-950 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>Execute Schema Validation & Import</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportExportModal;
