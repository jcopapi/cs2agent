/**
 * CS2 Assistant - Settings Modal
 * File: src/renderer/components/settings/SettingsModal.tsx
 *
 * Configures global hotkeys, activation modes, overlay positioning,
 * crosshair alignment opacity, and C4 bomb timer latency compensation.
 */

import React, { useState, useEffect } from 'react';
import type { HotkeyConfig, ScreenCorner } from '../../../shared/ipc-types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_CONFIG: HotkeyConfig = {
  key: 'F1',
  mode: 'TOGGLE',
  alignKey: 'CapsLock',
  alignMode: 'HOLD',
  alignOpacity: 0.5,
  overlayKey: 'F1',
  overlayMode: 'TOGGLE',
  nextPixelKey: 'F2',
  cornerCardPosition: 'TOP_RIGHT',
  indicatorPosition: 'TOP_RIGHT',
  bombLatencyOffsetSec: 1.0,
};

const COMMON_KEYS = ['CapsLock', 'F1', 'F2', 'F3', 'F4', 'ScrollLock', 'Insert', 'Home', 'PageUp', 'PageDown'];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<HotkeyConfig>(DEFAULT_CONFIG);
  const [savedToast, setSavedToast] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    const api = window.cs2Assistant;
    if (api?.hud?.getHotkeyConfig) {
      api.hud.getHotkeyConfig().then((cfg) => {
        if (cfg) {
          setConfig((prev) => ({ ...prev, ...cfg }));
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const api = window.cs2Assistant;
    if (api?.hud?.setHotkeyConfig) {
      await api.hud.setHotkeyConfig(config);
    }
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 font-mono select-none">
      <div className="relative w-full max-w-lg border border-zinc-700 bg-[#09090b] p-6 shadow-2xl">
        {/* Corner Notches */}
        <span className="absolute -top-1 -left-1 text-cyan-400 text-xs">┌</span>
        <span className="absolute -top-1 -right-1 text-cyan-400 text-xs">┐</span>
        <span className="absolute -bottom-1 -left-1 text-cyan-400 text-xs">└</span>
        <span className="absolute -bottom-1 -right-1 text-cyan-400 text-xs">┘</span>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-bold tracking-widest text-zinc-100 uppercase">[CONFIGURATION]</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-rose-400 text-xs px-2 py-1 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {/* Section 1: Hotkeys */}
          <div className="space-y-3">
            <div className="text-[10px] font-bold tracking-wider text-cyan-400 uppercase">
              // HOTKEY BINDINGS
            </div>

            {/* Align with Crosshair */}
            <div className="flex items-center justify-between border border-zinc-800 bg-zinc-900/50 p-2.5">
              <div>
                <div className="text-[11px] font-bold text-zinc-200">ALIGN WITH CROSSHAIR</div>
                <div className="text-[9px] text-zinc-500">Hold to display centered transparent pixel</div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={config.alignKey}
                  onChange={(e) => setConfig({ ...config, alignKey: e.target.value })}
                  className="bg-black border border-zinc-700 text-cyan-300 text-[11px] px-2 py-1 focus:border-cyan-400 outline-none"
                >
                  {COMMON_KEYS.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, alignMode: config.alignMode === 'HOLD' ? 'TOGGLE' : 'HOLD' })}
                  className="text-[9px] font-bold border border-zinc-700 bg-black px-2 py-1 text-zinc-300 hover:border-cyan-400"
                >
                  [{config.alignMode}]
                </button>
              </div>
            </div>

            {/* Overlay Reference Card */}
            <div className="flex items-center justify-between border border-zinc-800 bg-zinc-900/50 p-2.5">
              <div>
                <div className="text-[11px] font-bold text-zinc-200">CORNER OVERLAY</div>
                <div className="text-[9px] text-zinc-500">Show reference photo and callouts</div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={config.overlayKey}
                  onChange={(e) => setConfig({ ...config, overlayKey: e.target.value })}
                  className="bg-black border border-zinc-700 text-cyan-300 text-[11px] px-2 py-1 focus:border-cyan-400 outline-none"
                >
                  {COMMON_KEYS.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, overlayMode: config.overlayMode === 'HOLD' ? 'TOGGLE' : 'HOLD' })}
                  className="text-[9px] font-bold border border-zinc-700 bg-black px-2 py-1 text-zinc-300 hover:border-cyan-400"
                >
                  [{config.overlayMode}]
                </button>
              </div>
            </div>

            {/* Next Pixel Step */}
            <div className="flex items-center justify-between border border-zinc-800 bg-zinc-900/50 p-2.5">
              <div>
                <div className="text-[11px] font-bold text-zinc-200">NEXT PIXEL STEP</div>
                <div className="text-[9px] text-zinc-500">Advance to next step in active tactical plan</div>
              </div>
              <select
                value={config.nextPixelKey}
                onChange={(e) => setConfig({ ...config, nextPixelKey: e.target.value })}
                className="bg-black border border-zinc-700 text-cyan-300 text-[11px] px-2 py-1 focus:border-cyan-400 outline-none"
              >
                {COMMON_KEYS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Align with Crosshair Opacity */}
          <div className="space-y-2 border-t border-zinc-800 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-cyan-400 uppercase">// ALIGN OPACITY</span>
              <span className="text-[11px] font-bold text-zinc-300">{Math.round((config.alignOpacity ?? 0.5) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={config.alignOpacity ?? 0.5}
              onChange={(e) => setConfig({ ...config, alignOpacity: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Section 3: Overlay Positions */}
          <div className="space-y-3 border-t border-zinc-800 pt-3">
            <div className="text-[10px] font-bold tracking-wider text-cyan-400 uppercase">
              // OVERLAY SCREEN POSITIONS
            </div>

            {/* Corner Card Position */}
            <div className="flex items-center justify-between border border-zinc-800 bg-zinc-900/50 p-2.5">
              <div className="text-[11px] font-bold text-zinc-200">CORNER CARD DOCK</div>
              <select
                value={config.cornerCardPosition}
                onChange={(e) => setConfig({ ...config, cornerCardPosition: e.target.value as ScreenCorner })}
                className="bg-black border border-zinc-700 text-cyan-300 text-[11px] px-2 py-1 focus:border-cyan-400 outline-none"
              >
                <option value="TOP_RIGHT">TOP-RIGHT</option>
                <option value="TOP_LEFT">TOP-LEFT</option>
                <option value="BOTTOM_RIGHT">BOTTOM-RIGHT</option>
                <option value="BOTTOM_LEFT">BOTTOM-LEFT</option>
              </select>
            </div>

            {/* Indicator Badge Position */}
            <div className="flex items-center justify-between border border-zinc-800 bg-zinc-900/50 p-2.5">
              <div className="text-[11px] font-bold text-zinc-200">IN-GAME KEY HINT</div>
              <select
                value={config.indicatorPosition}
                onChange={(e) => setConfig({ ...config, indicatorPosition: e.target.value as ScreenCorner })}
                className="bg-black border border-zinc-700 text-cyan-300 text-[11px] px-2 py-1 focus:border-cyan-400 outline-none"
              >
                <option value="TOP_RIGHT">TOP-RIGHT</option>
                <option value="TOP_LEFT">TOP-LEFT</option>
                <option value="BOTTOM_RIGHT">BOTTOM-RIGHT</option>
                <option value="BOTTOM_LEFT">BOTTOM-LEFT</option>
              </select>
            </div>
          </div>

          {/* Section 4: C4 Bomb Latency Offset */}
          <div className="space-y-2 border-t border-zinc-800 pt-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-zinc-200">C4 DETECTION OFFSET</div>
                <div className="text-[9px] text-zinc-500">Compensates GSI plant notification delay</div>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="3.0"
                  step="0.5"
                  value={config.bombLatencyOffsetSec ?? 1.0}
                  onChange={(e) => setConfig({ ...config, bombLatencyOffsetSec: parseFloat(e.target.value) || 1.0 })}
                  className="w-16 bg-black border border-zinc-700 text-cyan-300 text-[11px] px-2 py-1 text-center outline-none"
                />
                <span className="text-[10px] text-zinc-500">sec</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-zinc-800 pt-4 mt-4">
          <button
            onClick={onClose}
            className="border border-zinc-800 px-4 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={handleSave}
            className="border border-cyan-500 bg-cyan-950/80 px-5 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-900 transition-colors flex items-center gap-1.5"
          >
            {savedToast ? 'SAVED ✓' : 'SAVE CONFIG'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
