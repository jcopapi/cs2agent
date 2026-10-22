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
  bombLatencyOffsetSec: 1.5,
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="relative w-full max-w-lg rounded-2xl bg-surface-container border border-border-subtle p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">settings</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Settings & Keybinds</h3>
              <p className="text-[11px] text-text-muted">Configure hotkeys, crosshair align opacity, and bomb timers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-7 h-7 rounded-lg hover:bg-surface-container-high text-text-secondary hover:text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Section 1: Hotkeys */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-primary tracking-wide flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">keyboard</span>
              <span>Hotkey Bindings</span>
            </div>

            {/* Align with Crosshair */}
            <div className="flex items-center justify-between rounded-xl bg-surface-container-high border border-border-subtle p-3">
              <div>
                <div className="text-xs font-medium text-white">Align with Crosshair</div>
                <div className="text-[11px] text-text-muted">Hold to display centered transparent pixel</div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={config.alignKey}
                  onChange={(e) => setConfig({ ...config, alignKey: e.target.value })}
                  className="rounded-lg bg-surface-container border border-border-subtle text-white text-xs px-2.5 py-1.5 focus:border-primary outline-none transition-colors cursor-pointer"
                >
                  {COMMON_KEYS.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, alignMode: config.alignMode === 'HOLD' ? 'TOGGLE' : 'HOLD' })}
                  className="rounded-lg border border-border-subtle bg-surface-container px-2.5 py-1 text-[11px] font-semibold text-text-secondary hover:text-white hover:border-primary transition-colors cursor-pointer"
                >
                  {config.alignMode}
                </button>
              </div>
            </div>

            {/* Overlay Reference Card */}
            <div className="flex items-center justify-between rounded-xl bg-surface-container-high border border-border-subtle p-3">
              <div>
                <div className="text-xs font-medium text-white">Corner Overlay</div>
                <div className="text-[11px] text-text-muted">Show reference photo and callouts</div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={config.overlayKey}
                  onChange={(e) => setConfig({ ...config, overlayKey: e.target.value })}
                  className="rounded-lg bg-surface-container border border-border-subtle text-white text-xs px-2.5 py-1.5 focus:border-primary outline-none transition-colors cursor-pointer"
                >
                  {COMMON_KEYS.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, overlayMode: config.overlayMode === 'HOLD' ? 'TOGGLE' : 'HOLD' })}
                  className="rounded-lg border border-border-subtle bg-surface-container px-2.5 py-1 text-[11px] font-semibold text-text-secondary hover:text-white hover:border-primary transition-colors cursor-pointer"
                >
                  {config.overlayMode}
                </button>
              </div>
            </div>

            {/* Next Pixel Step */}
            <div className="flex items-center justify-between rounded-xl bg-surface-container-high border border-border-subtle p-3">
              <div>
                <div className="text-xs font-medium text-white">Next Pixel Step</div>
                <div className="text-[11px] text-text-muted">Advance to next step in active tactical plan</div>
              </div>
              <select
                value={config.nextPixelKey}
                onChange={(e) => setConfig({ ...config, nextPixelKey: e.target.value })}
                className="rounded-lg bg-surface-container border border-border-subtle text-white text-xs px-2.5 py-1.5 focus:border-primary outline-none transition-colors cursor-pointer"
              >
                {COMMON_KEYS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Align with Crosshair Opacity */}
          <div className="space-y-2 border-t border-border-subtle pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary tracking-wide flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">opacity</span>
                <span>Align Opacity</span>
              </span>
              <span className="text-xs font-semibold text-white">{Math.round((config.alignOpacity ?? 0.5) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={config.alignOpacity ?? 0.5}
              onChange={(e) => setConfig({ ...config, alignOpacity: parseFloat(e.target.value) })}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Section 3: Overlay Positions */}
          <div className="space-y-2.5 border-t border-border-subtle pt-3">
            <div className="text-xs font-semibold text-primary tracking-wide flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">dock_to_right</span>
              <span>Overlay Screen Positions</span>
            </div>

            {/* Corner Card Position */}
            <div className="flex items-center justify-between rounded-xl bg-surface-container-high border border-border-subtle p-3">
              <div>
                <div className="text-xs font-medium text-white">Corner Card Dock</div>
                <div className="text-[11px] text-text-muted">Screen quadrant for visual reference card</div>
              </div>
              <select
                value={config.cornerCardPosition}
                onChange={(e) => setConfig({ ...config, cornerCardPosition: e.target.value as ScreenCorner })}
                className="rounded-lg bg-surface-container border border-border-subtle text-white text-xs px-2.5 py-1.5 focus:border-primary outline-none transition-colors cursor-pointer"
              >
                <option value="TOP_RIGHT">Top-Right</option>
                <option value="TOP_LEFT">Top-Left</option>
                <option value="BOTTOM_RIGHT">Bottom-Right</option>
                <option value="BOTTOM_LEFT">Bottom-Left</option>
              </select>
            </div>

            {/* Indicator Badge Position */}
            <div className="flex items-center justify-between rounded-xl bg-surface-container-high border border-border-subtle p-3">
              <div>
                <div className="text-xs font-medium text-white">In-Game Key Hint</div>
                <div className="text-[11px] text-text-muted">Screen corner for activation indicator</div>
              </div>
              <select
                value={config.indicatorPosition}
                onChange={(e) => setConfig({ ...config, indicatorPosition: e.target.value as ScreenCorner })}
                className="rounded-lg bg-surface-container border border-border-subtle text-white text-xs px-2.5 py-1.5 focus:border-primary outline-none transition-colors cursor-pointer"
              >
                <option value="TOP_RIGHT">Top-Right</option>
                <option value="TOP_LEFT">Top-Left</option>
                <option value="BOTTOM_RIGHT">Bottom-Right</option>
                <option value="BOTTOM_LEFT">Bottom-Left</option>
              </select>
            </div>
          </div>

          {/* Section 4: C4 Bomb Latency Offset */}
          <div className="space-y-2 border-t border-border-subtle pt-3">
            <div className="flex items-center justify-between rounded-xl bg-surface-container-high border border-border-subtle p-3">
              <div>
                <div className="text-xs font-medium text-white">C4 Detection Offset</div>
                <div className="text-[11px] text-text-muted">Compensates GSI plant notification delay (default: 1.5s)</div>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="4.0"
                  step="0.5"
                  value={config.bombLatencyOffsetSec ?? 1.5}
                  onChange={(e) => setConfig({ ...config, bombLatencyOffsetSec: parseFloat(e.target.value) || 1.5 })}
                  className="w-16 rounded-lg bg-surface-container border border-border-subtle text-white text-xs px-2.5 py-1.5 text-center focus:border-primary outline-none transition-colors"
                />
                <span className="text-xs text-text-muted font-medium">sec</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-border-subtle pt-4 mt-4 shrink-0">
          <button
            onClick={onClose}
            type="button"
            className="rounded-xl border border-border-subtle bg-surface-container-high text-text-muted hover:text-white px-4 py-2 text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            type="button"
            className="rounded-xl bg-primary text-surface font-semibold text-xs px-5 py-2 hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">{savedToast ? 'check' : 'save'}</span>
            <span>{savedToast ? 'Saved!' : 'Save Config'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
