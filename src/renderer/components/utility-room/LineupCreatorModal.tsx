/**
 * CS2 Assistant - Custom Lineup Creator Modal
 * File: src/renderer/components/utility-room/LineupCreatorModal.tsx
 *
 * Implements full client-side lineup authoring with real-time SVG landmark preview,
 * coordinate input, multi-step execution protocol, and schema validation.
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Check, AlertCircle, Plus, Trash2, Camera, Upload, Image as ImageIcon } from 'lucide-react';
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
  const [startX, setStartX] = useState<number>(0);
  const [startY, setStartY] = useState<number>(0);
  const [startZ, setStartZ] = useState<number>(0);
  const [tolerance, setTolerance] = useState<number>(6);

  const [targetCallout, setTargetCallout] = useState<string>('');
  const [targetX, setTargetX] = useState<number>(0);
  const [targetY, setTargetY] = useState<number>(0);
  const [targetZ, setTargetZ] = useState<number>(0);

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
  const [svgReference, setSvgReference] = useState<string>(defaultSvg);

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

  const handleUpdateInstruction = (index: number, val: string) => {
    const updated = [...instructions];
    updated[index] = val;
    setInstructions(updated);
  };

  const handleRemoveInstruction = (index: number) => {
    if (instructions.length <= 1) return;
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const idSlug =
      title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30) || 'custom-pixel';
    const candidate = {
      id: `custom-${map}-${idSlug}-${Date.now().toString().slice(-4)}`,
      map,
      side,
      utilityType,
      title: title || `${targetCallout || 'Utility'} from ${startCallout || 'Spawn'}`,
      startPosition: {
        x: Number(startX),
        y: Number(startY),
        z: Number(startZ),
        callout: startCallout || 'Position',
        toleranceUnits: Number(tolerance),
      },
      targetDestination: {
        x: Number(targetX),
        y: Number(targetY),
        z: Number(targetZ),
        callout: targetCallout || 'Target',
      },
      throwType,
      movementRequirements,
      aimReference: {
        crosshairPlacement: crosshairPlacement || 'Align reticle directly with center pixel landmark',
        visualLandmark: visualLandmark || targetCallout || 'Center landmark',
      },
      svgReference,
      imageUrl: imageUrl || undefined,
      instructions: instructions.filter((s) => s.trim().length > 0),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 select-none font-mono">
      <div className="relative flex h-[90vh] w-[950px] flex-col rounded-lg border border-zinc-800 bg-[#0c0c0e] shadow-2xl overflow-hidden">
        {/* Corner Handles */}
        <span className="absolute top-1 left-1 text-zinc-600 font-mono text-[10px] leading-none select-none">┌</span>
        <span className="absolute top-1 right-1 text-zinc-600 font-mono text-[10px] leading-none select-none">┐</span>
        <span className="absolute bottom-1 left-1 text-zinc-600 font-mono text-[10px] leading-none select-none">└</span>
        <span className="absolute bottom-1 right-1 text-zinc-600 font-mono text-[10px] leading-none select-none">┘</span>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3 bg-[#111114]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-zinc-100 uppercase tracking-wider">
              [Add Custom Pixel]
            </span>
            <span className="text-xs text-tactical-cyan">[{map.toUpperCase()}]</span>
          </div>
          <button onClick={onClose} className="rounded p-1 text-zinc-400 hover:text-zinc-200 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Validation Error Banner */}
        {validationErrors.length > 0 && (
          <div className="bg-rose-500/10 border-b border-rose-500/30 px-5 py-2.5 text-xs text-rose-400 space-y-1">
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
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-2 gap-5 text-xs">
          {/* Left Column: Metadata & Coordinates */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">PIXEL TITLE</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Window Smoke from T Spawn"
                className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-tactical-cyan focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">MAP</label>
                <select
                  value={map}
                  onChange={(e) => setMap(e.target.value as CS2Map)}
                  className="w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-100 focus:outline-none cursor-pointer"
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
                <label className="block text-[11px] text-zinc-400 mb-1">SIDE</label>
                <select
                  value={side}
                  onChange={(e) => setSide(e.target.value as TeamSide)}
                  className="w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-100 focus:outline-none cursor-pointer"
                >
                  <option value="T">T (Attack)</option>
                  <option value="CT">CT (Defense)</option>
                  <option value="BOTH">BOTH</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">TYPE</label>
                <select
                  value={utilityType}
                  onChange={(e) => setUtilityType(e.target.value as UtilityType)}
                  className="w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-100 focus:outline-none cursor-pointer"
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
                <label className="block text-[11px] text-zinc-400 mb-1">THROW TECHNIQUE</label>
                <select
                  value={throwType}
                  onChange={(e) => setThrowType(e.target.value as any)}
                  className="w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-100 focus:outline-none cursor-pointer"
                >
                  <option value="STANDING">Standing (Left-Click)</option>
                  <option value="JUMPTHROW">Jumpthrow</option>
                  <option value="RUN_JUMPTHROW">Run + Jumpthrow</option>
                  <option value="CROUCH_JUMPTHROW">Crouch + Jumpthrow</option>
                  <option value="WALK_THROW">Walk + Throw</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">DIFFICULTY</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-100 focus:outline-none cursor-pointer"
                >
                  <option value="EASY">Easy (Standard)</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard (Pixel Perfect)</option>
                </select>
              </div>
            </div>

            {/* Start Position */}
            <div className="rounded border border-zinc-800 bg-zinc-950/60 p-2.5 space-y-2">
              <label className="block text-[11px] font-bold text-zinc-300">START POSITION</label>
              <input
                type="text"
                value={startCallout}
                onChange={(e) => setStartCallout(e.target.value)}
                placeholder="Callout (e.g. T Spawn Trash Can / Fence)"
                className="w-full rounded border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-100 focus:outline-none"
              />
            </div>

            {/* Target Destination */}
            <div className="rounded border border-zinc-800 bg-zinc-950/60 p-2.5 space-y-2">
              <label className="block text-[11px] font-bold text-zinc-300">TARGET DESTINATION</label>
              <input
                type="text"
                value={targetCallout}
                onChange={(e) => setTargetCallout(e.target.value)}
                placeholder="Target (e.g. Window / A Stairs)"
                className="w-full rounded border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">MOVEMENT / THROW NOTES</label>
              <input
                type="text"
                value={movementRequirements}
                onChange={(e) => setMovementRequirements(e.target.value)}
                placeholder="e.g. Hold D and release at jump peak"
                className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Right Column: Screenshot Upload / Paste, Aim Reference, Preview */}
          <div className="space-y-3.5">
            {/* SCREENSHOT / PRINT UPLOADER */}
            <div className="rounded border border-zinc-800 bg-zinc-950/60 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-tactical-cyan uppercase">
                  [Screenshot / Print]
                </span>
                <span className="text-[10px] text-zinc-500">PASTE (CTRL+V) OR UPLOAD</span>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {imageUrl ? (
                <div className="relative w-full h-[180px] bg-black rounded border border-zinc-700 overflow-hidden flex items-center justify-center">
                  <img src={imageUrl} alt="Custom pixel" className="w-full h-full object-contain" />
                  
                  {/* Aim Reticle Preview */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 rounded-full border-2 border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)] flex items-center justify-center animate-pulse">
                      <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                    </div>
                    <div className="absolute -left-3 w-2 h-0.5 bg-emerald-400" />
                    <div className="absolute -right-3 w-2 h-0.5 bg-emerald-400" />
                    <div className="absolute -top-3 h-2 w-0.5 bg-emerald-400" />
                    <div className="absolute -bottom-3 h-2 w-0.5 bg-emerald-400" />
                  </div>

                  {/* 4x Loupe Preview */}
                  <div className="absolute bottom-1.5 left-1.5 rounded border border-cyan-400 bg-black/95 p-0.5 shadow flex flex-col items-center">
                    <span className="text-[7px] text-cyan-400 uppercase">LOUPE 4X</span>
                    <div
                      className="w-16 h-12 rounded border border-zinc-700 overflow-hidden"
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
                    className="absolute top-2 right-2 rounded bg-black/80 border border-zinc-700 px-2 py-0.5 text-[10px] text-zinc-300 hover:text-white cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-[140px] rounded border border-dashed border-zinc-700 bg-zinc-950 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-tactical-cyan hover:bg-zinc-900/40 transition-colors"
                >
                  <Camera className="h-6 w-6 text-zinc-500" />
                  <div className="text-center">
                    <div className="text-xs font-semibold text-zinc-300">Click to upload screenshot or press Ctrl+V</div>
                    <div className="text-[10px] text-zinc-500">Take screenshot in CS2, Alt+Tab and paste directly</div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">CROSSHAIR PLACEMENT</label>
              <input
                type="text"
                value={crosshairPlacement}
                onChange={(e) => setCrosshairPlacement(e.target.value)}
                placeholder="e.g. Aim at the apex of the center wall indentation"
                className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">VISUAL LANDMARK</label>
              <input
                type="text"
                value={visualLandmark}
                onChange={(e) => setVisualLandmark(e.target.value)}
                placeholder="e.g. Left pin of smoke aligned with wooden protrusion"
                className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none"
              />
            </div>

            {/* Protocol Steps */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-zinc-400">EXECUTION STEPS</label>
                <button
                  onClick={handleAddInstruction}
                  className="flex items-center gap-1 text-[11px] text-tactical-cyan hover:underline cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Step</span>
                </button>
              </div>
              <div className="space-y-1.5">
                {instructions.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 w-4">{idx + 1}.</span>
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => handleUpdateInstruction(idx, e.target.value)}
                      placeholder={`Step ${idx + 1}`}
                      className="flex-1 rounded border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-100 focus:outline-none"
                    />
                    {instructions.length > 1 && (
                      <button
                        onClick={() => handleRemoveInstruction(idx)}
                        className="text-zinc-500 hover:text-rose-400 cursor-pointer"
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
        <div className="flex items-center justify-end gap-2 border-t border-zinc-800 px-5 py-3 bg-[#111114]">
          <button
            onClick={onClose}
            className="rounded border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded bg-tactical-cyan px-5 py-1.5 text-xs font-bold text-zinc-950 hover:bg-tactical-cyan/90 flex items-center gap-1.5 cursor-pointer shadow hatched-bg"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Save Custom Pixel &gt;&gt;&gt;</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LineupCreatorModal;
