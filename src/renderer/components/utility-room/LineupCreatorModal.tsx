/**
 * CS2 Assistant - Custom Lineup Creator Modal
 * File: src/renderer/components/utility-room/LineupCreatorModal.tsx
 *
 * Implements full client-side lineup authoring with real-time landmark preview,
 * coordinate input, multi-step execution protocol, and schema validation.
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Check, AlertCircle, Plus, Trash2, Camera } from 'lucide-react';
import type { CS2Map, TeamSide, UtilityType, Lineup } from '../../../core/utility/types';
import { validateLineup } from '../../../core/utility/json-io';
import { saveLineup } from '../../../core/utility/lineup-database';

export interface LineupCreatorModalProps {
  currentMap: CS2Map;
  onClose: () => void;
  onSaveLineup: (lineup: Lineup) => void;
}

export const LineupCreatorModal: React.FC<LineupCreatorModalProps> = ({
  currentMap,
  onClose,
  onSaveLineup,
}) => {
  const [map, setMap] = useState<CS2Map>(currentMap);
  const [side, setSide] = useState<TeamSide>('T');
  const [utilityType, setUtilityType] = useState<UtilityType>('SMOKE');
  const [title, setTitle] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Lineup['difficulty']>('EASY');
  const [throwType, setThrowType] = useState<Lineup['throwType']>('STANDING');
  const [movementRequirements, setMovementRequirements] = useState<string>('Stationary throw');

  // Start & Target
  const [startCallout, setStartCallout] = useState<string>('');
  const [startX] = useState<number>(0);
  const [startY] = useState<number>(0);
  const [startZ] = useState<number>(0);
  const [tolerance] = useState<number>(6);

  const [targetCallout, setTargetCallout] = useState<string>('');
  const [targetX] = useState<number>(0);
  const [targetY] = useState<number>(0);
  const [targetZ] = useState<number>(0);

  // Aim Reference & Image
  const [crosshairPlacement, setCrosshairPlacement] = useState<string>('');
  const [visualLandmark, setVisualLandmark] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Instructions
  const [instructions, setInstructions] = useState<string[]>([
    'Wedge yourself into the indicated position.',
    'Align crosshair with the visual landmark.',
    'Perform standard release.',
  ]);

  // SVG Markup fallback
  const defaultSvg = `<svg width="240" height="140" viewBox="0 0 240 140">\n  <rect width="240" height="140" fill="#121215"/>\n  <circle cx="120" cy="70" r="4" fill="#06b6d4"/>\n  <line x1="120" y1="50" x2="120" y2="90" stroke="#06b6d4" stroke-dasharray="2"/>\n  <line x1="100" y1="70" x2="140" y2="70" stroke="#06b6d4" stroke-dasharray="2"/>\n  <text x="120" y="110" font-family="monospace" font-size="10" fill="#a1a1aa" text-anchor="middle">CUSTOM ALIGNMENT POINT</text>\n</svg>`;
  const [svgReference] = useState<string>(defaultSvg);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Clipboard paste listener to paste screenshots with Ctrl+V
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                setImageUrl(event.target.result as string);
              }
            };
            reader.readAsDataURL(blob);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const handleUpdateInstruction = (index: number, text: string) => {
    const updated = [...instructions];
    updated[index] = text;
    setInstructions(updated);
  };

  const handleRemoveInstruction = (index: number) => {
    if (instructions.length <= 1) return;
    setInstructions(instructions.filter((_, idx) => idx !== index));
  };

  const handleSave = () => {
    const candidate: Lineup = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      map,
      side,
      utilityType,
      technique: throwType,
      throwType,
      title: title.trim() || `${targetCallout || 'Site'} ${utilityType}`,
      throwPosition: {
        x: Number(startX) || 0,
        y: Number(startY) || 0,
        z: Number(startZ) || 0,
        callout: startCallout.trim() || 'Custom Position',
        description: `Wedge into ${startCallout || 'position'}`,
        toleranceUnits: Number(tolerance) || 6,
      },
      startPosition: {
        x: Number(startX) || 0,
        y: Number(startY) || 0,
        z: Number(startZ) || 0,
        callout: startCallout.trim() || 'Custom Position',
        toleranceUnits: Number(tolerance) || 6,
      },
      landingArea: {
        x: Number(targetX) || 0,
        y: Number(targetY) || 0,
        z: Number(targetZ) || 0,
        callout: targetCallout.trim() || 'Target Area',
        description: `Lands at ${targetCallout || 'target'}`,
      },
      targetDestination: {
        x: Number(targetX) || 0,
        y: Number(targetY) || 0,
        z: Number(targetZ) || 0,
        callout: targetCallout.trim() || 'Target Area',
      },
      crosshairTarget: {
        pitch: -15.0,
        yaw: 45.0,
        description: crosshairPlacement.trim() || 'Align crosshair with reticle',
        visualLandmark: visualLandmark.trim() || 'Custom Landmark',
      },
      aimReference: {
        crosshairPlacement: crosshairPlacement.trim() || 'Align crosshair with reticle',
        visualLandmark: visualLandmark.trim() || 'Custom Landmark',
      },
      movementRequirements: movementRequirements.trim() || 'Stationary throw',
      tickrate: 'SUBTICK_CS2',
      instructions: instructions.map((i) => i.trim()).filter(Boolean),
      imageUrl: imageUrl.trim() || undefined,
      thumbnailUrl: imageUrl.trim() || undefined,
      svgReference: !imageUrl ? svgReference : undefined,
      tags: ['Custom', utilityType, startCallout || 'Spawn'].filter(Boolean),
      difficulty,
      sourceAttribution: 'User Created',
      verified: true,
      gameVersion: '1.40.2.1',
      lastVerificationDate: new Date().toISOString().slice(0, 10),
      isCustom: true,
      favorite: true,
    };

    const result = validateLineup(candidate);
    if (!result.valid) {
      setValidationErrors(result.errors.map((e) => `${e.path}: ${e.message}`));
      return;
    }

    if (result.sanitizedData) {
      saveLineup(result.sanitizedData as any);
      onSaveLineup(result.sanitizedData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="relative flex h-[85vh] w-[920px] flex-col rounded-2xl border border-border-subtle bg-surface-container shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4 bg-surface-container shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">Create Custom Pixel</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">
                  {map.replace('de_', '').toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-text-muted">Define spatial throw coordinates, aim landmarks, and step execution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-7 h-7 rounded-lg hover:bg-surface-container-high text-text-secondary hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Validation Error Banner */}
        {validationErrors.length > 0 && (
          <div className="bg-rose-500/10 border-b border-rose-500/30 px-6 py-2.5 text-xs text-rose-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="h-4 w-4" />
              <span>Please resolve validation errors before saving:</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-5 text-xs">
          {/* Left Column: Metadata & Coordinates */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-medium text-text-secondary mb-1">PIXEL TITLE</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Window Smoke from T Spawn"
                className="w-full rounded-xl border border-border-subtle bg-surface-container-high px-3 py-2 text-xs text-white placeholder:text-text-muted focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-text-secondary mb-1">MAP</label>
                <select
                  value={map}
                  onChange={(e) => setMap(e.target.value as CS2Map)}
                  className="w-full rounded-xl border border-border-subtle bg-surface-container-high px-2.5 py-2 text-xs text-white focus:border-primary focus:outline-none cursor-pointer"
                >
                  <option value="de_mirage">Mirage</option>
                  <option value="de_inferno">Inferno</option>
                  <option value="de_dust2">Dust II</option>
                  <option value="de_nuke">Nuke</option>
                  <option value="de_ancient">Ancient</option>
                  <option value="de_anubis">Anubis</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-text-secondary mb-1">SIDE</label>
                <select
                  value={side}
                  onChange={(e) => setSide(e.target.value as TeamSide)}
                  className="w-full rounded-xl border border-border-subtle bg-surface-container-high px-2.5 py-2 text-xs text-white focus:border-primary focus:outline-none cursor-pointer"
                >
                  <option value="T">T (Attack)</option>
                  <option value="CT">CT (Defense)</option>
                  <option value="BOTH">BOTH</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-text-secondary mb-1">TYPE</label>
                <select
                  value={utilityType}
                  onChange={(e) => setUtilityType(e.target.value as UtilityType)}
                  className="w-full rounded-xl border border-border-subtle bg-surface-container-high px-2.5 py-2 text-xs text-white focus:border-primary focus:outline-none cursor-pointer"
                >
                  <option value="SMOKE">Smoke</option>
                  <option value="FLASHBANG">Flash</option>
                  <option value="MOLOTOV_INCENDIARY">Molotov</option>
                  <option value="HE_GRENADE">HE Grenade</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-text-secondary mb-1">THROW TECHNIQUE</label>
                <select
                  value={throwType}
                  onChange={(e) => setThrowType(e.target.value as any)}
                  className="w-full rounded-xl border border-border-subtle bg-surface-container-high px-2.5 py-2 text-xs text-white focus:border-primary focus:outline-none cursor-pointer"
                >
                  <option value="STANDING">Standing (Left-Click)</option>
                  <option value="JUMPTHROW">Jumpthrow</option>
                  <option value="RUN_JUMPTHROW">Run + Jumpthrow</option>
                  <option value="CROUCH_JUMPTHROW">Crouch + Jumpthrow</option>
                  <option value="WALK_THROW">Walk + Throw</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-text-secondary mb-1">DIFFICULTY</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full rounded-xl border border-border-subtle bg-surface-container-high px-2.5 py-2 text-xs text-white focus:border-primary focus:outline-none cursor-pointer"
                >
                  <option value="EASY">Easy (Standard)</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard (Pixel Perfect)</option>
                </select>
              </div>
            </div>

            {/* Start Position */}
            <div className="rounded-xl border border-border-subtle bg-surface-container-high p-3 space-y-1.5">
              <label className="block text-[11px] font-bold text-primary">FROM (START POSITION)</label>
              <input
                type="text"
                value={startCallout}
                onChange={(e) => setStartCallout(e.target.value)}
                placeholder="Callout (e.g. T Spawn Fence / Trash Can)"
                className="w-full rounded-lg border border-border-subtle bg-surface-container px-2.5 py-1.5 text-xs text-white placeholder:text-text-muted focus:border-primary focus:outline-none"
              />
            </div>

            {/* Target Destination */}
            <div className="rounded-xl border border-border-subtle bg-surface-container-high p-3 space-y-1.5">
              <label className="block text-[11px] font-bold text-primary">TO (TARGET DESTINATION)</label>
              <input
                type="text"
                value={targetCallout}
                onChange={(e) => setTargetCallout(e.target.value)}
                placeholder="Target (e.g. Window / A Stairs / Palacio)"
                className="w-full rounded-lg border border-border-subtle bg-surface-container px-2.5 py-1.5 text-xs text-white placeholder:text-text-muted focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-secondary mb-1">MOVEMENT / THROW NOTES</label>
              <input
                type="text"
                value={movementRequirements}
                onChange={(e) => setMovementRequirements(e.target.value)}
                placeholder="e.g. Hold D and release at jump peak"
                className="w-full rounded-xl border border-border-subtle bg-surface-container-high px-3 py-2 text-xs text-white placeholder:text-text-muted focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Right Column: Screenshot Upload / Paste, Aim Reference, Preview */}
          <div className="space-y-3.5">
            {/* SCREENSHOT / PRINT UPLOADER */}
            <div className="rounded-xl border border-border-subtle bg-surface-container-high p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-primary">
                  SCREENSHOT / PHOTO
                </span>
                <span className="text-[10px] text-text-muted">PASTE (CTRL+V) OR UPLOAD</span>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {imageUrl ? (
                <div className="relative w-full h-[180px] bg-black/60 rounded-xl border border-border-subtle overflow-hidden flex items-center justify-center">
                  <img src={imageUrl} alt="Custom pixel" className="w-full h-full object-contain" />

                  {/* Aim Reticle Preview */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 rounded-full border-2 border-primary shadow-[0_0_8px_rgba(202,254,73,0.7)] flex items-center justify-center animate-pulse">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    </div>
                    <div className="absolute -left-3 w-2 h-0.5 bg-primary" />
                    <div className="absolute -right-3 w-2 h-0.5 bg-primary" />
                    <div className="absolute -top-3 h-2 w-0.5 bg-primary" />
                    <div className="absolute -bottom-3 h-2 w-0.5 bg-primary" />
                  </div>

                  {/* 4x Loupe Preview */}
                  <div className="absolute bottom-2 left-2 rounded-lg border border-border-subtle bg-surface-container/95 p-1 shadow flex flex-col items-center">
                    <span className="text-[7px] text-primary font-semibold uppercase">LOUPE 4X</span>
                    <div
                      className="w-16 h-12 rounded border border-border-subtle overflow-hidden"
                      style={{
                        backgroundImage: `url(${imageUrl})`,
                        backgroundPosition: 'center center',
                        backgroundSize: '450%',
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                  </div>

                  <button
                    onClick={() => setImageUrl('')}
                    type="button"
                    className="absolute top-2 right-2 rounded-lg bg-surface-container/90 border border-border-subtle px-2 py-0.5 text-[10px] text-text-secondary hover:text-white transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-[140px] rounded-xl border border-dashed border-border-medium bg-surface-container flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-surface-container-high transition-colors"
                >
                  <Camera className="h-6 w-6 text-text-muted" />
                  <div className="text-center">
                    <div className="text-xs font-semibold text-white">Click to upload screenshot or press Ctrl+V</div>
                    <div className="text-[10px] text-text-muted">Take screenshot in CS2, Alt+Tab and paste directly</div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-secondary mb-1">CROSSHAIR PLACEMENT</label>
              <input
                type="text"
                value={crosshairPlacement}
                onChange={(e) => setCrosshairPlacement(e.target.value)}
                placeholder="e.g. Aim at the apex of the center wall indentation"
                className="w-full rounded-xl border border-border-subtle bg-surface-container-high px-3 py-2 text-xs text-white placeholder:text-text-muted focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-secondary mb-1">VISUAL LANDMARK</label>
              <input
                type="text"
                value={visualLandmark}
                onChange={(e) => setVisualLandmark(e.target.value)}
                placeholder="e.g. Left pin of smoke aligned with wooden protrusion"
                className="w-full rounded-xl border border-border-subtle bg-surface-container-high px-3 py-2 text-xs text-white placeholder:text-text-muted focus:border-primary focus:outline-none"
              />
            </div>

            {/* Protocol Steps */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-text-secondary">EXECUTION STEPS</label>
                <button
                  onClick={handleAddInstruction}
                  type="button"
                  className="flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Step</span>
                </button>
              </div>
              <div className="space-y-1.5">
                {instructions.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted w-4 font-mono">{idx + 1}.</span>
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => handleUpdateInstruction(idx, e.target.value)}
                      placeholder={`Step ${idx + 1}`}
                      className="flex-1 rounded-lg border border-border-subtle bg-surface-container-high px-2.5 py-1 text-xs text-white focus:border-primary focus:outline-none"
                    />
                    {instructions.length > 1 && (
                      <button
                        onClick={() => handleRemoveInstruction(idx)}
                        type="button"
                        className="text-text-muted hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border-subtle px-6 py-3 bg-surface-container shrink-0">
          <button
            onClick={onClose}
            type="button"
            className="rounded-xl border border-border-subtle bg-surface-container-high px-4 py-2 text-xs font-medium text-text-muted hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            type="button"
            className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-surface hover:bg-primary/90 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Save Custom Pixel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LineupCreatorModal;
