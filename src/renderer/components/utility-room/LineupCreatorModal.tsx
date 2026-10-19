/**
 * CS2 Assistant - Custom Lineup Creator Modal
 * File: src/renderer/components/utility-room/LineupCreatorModal.tsx
 *
 * Implements full client-side lineup authoring with real-time SVG landmark preview,
 * coordinate input, multi-step execution protocol, and schema validation.
 */

import React, { useState } from 'react';
import { X, Check, AlertCircle, Plus, Trash2 } from 'lucide-react';
import type { CS2Map, TeamSide, UtilityType, Lineup } from '../../../core/utility/types';
import { validateLineup } from '../../../core/utility/json-io';

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

  // Aim Reference
  const [crosshairPlacement, setCrosshairPlacement] = useState<string>('');
  const [visualLandmark, setVisualLandmark] = useState<string>('');

  // Instructions
  const [instructions, setInstructions] = useState<string[]>([
    'Wedge yourself into the indicated position.',
    'Align crosshair with the visual landmark.',
    'Perform standard release.',
  ]);

  // SVG Markup
  const defaultSvg = `<svg width="240" height="140" viewBox="0 0 240 140">\n  <rect width="240" height="140" fill="#121215"/>\n  <circle cx="120" cy="70" r="4" fill="#06b6d4"/>\n  <line x1="120" y1="50" x2="120" y2="90" stroke="#06b6d4" stroke-dasharray="2"/>\n  <line x1="100" y1="70" x2="140" y2="70" stroke="#06b6d4" stroke-dasharray="2"/>\n  <text x="120" y="110" font-family="monospace" font-size="10" fill="#a1a1aa" text-anchor="middle">CUSTOM ALIGNMENT POINT</text>\n</svg>`;
  const [svgReference, setSvgReference] = useState<string>(defaultSvg);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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
      title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30) || 'custom-lineup';
    const candidate = {
      id: `custom-${map}-${idSlug}-${Date.now().toString().slice(-4)}`,
      map,
      side,
      utilityType,
      title,
      startPosition: {
        x: Number(startX),
        y: Number(startY),
        z: Number(startZ),
        callout: startCallout,
        toleranceUnits: Number(tolerance),
      },
      targetDestination: {
        x: Number(targetX),
        y: Number(targetY),
        z: Number(targetZ),
        callout: targetCallout,
      },
      throwType,
      movementRequirements,
      aimReference: { crosshairPlacement, visualLandmark },
      svgReference,
      instructions: instructions.filter((s) => s.trim().length > 0),
      tags: ['Custom', utilityType, startCallout].filter(Boolean),
      difficulty,
      sourceAttribution: 'User Created',
      verified: true,
      gameVersion: '1.40.2.1',
      lastVerificationDate: new Date().toISOString().slice(0, 10),
      isCustom: true,
      favorite: false,
    };

    const result = validateLineup(candidate);
    if (!result.valid) {
      setValidationErrors(result.errors.map((e) => `${e.path}: ${e.message}`));
      return;
    }

    if (result.sanitizedData) {
      window.cs2Assistant?.lineup?.save?.(result.sanitizedData as any);
      onSaveLineup(result.sanitizedData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 select-none">
      <div className="flex h-[90vh] w-[950px] flex-col rounded-lg border border-border-subtle bg-background-panel shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-zinc-100 uppercase tracking-wider">
              CREATE CUSTOM LINEUP
            </span>
            <span className="font-mono text-xs text-tactical-cyan">[{map.toUpperCase()}]</span>
          </div>
          <button onClick={onClose} className="rounded p-1 text-zinc-400 hover:text-zinc-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Validation Error Banner */}
        {validationErrors.length > 0 && (
          <div className="bg-tactical-rose/10 border-b border-tactical-rose/30 px-5 py-2.5 text-xs text-tactical-rose space-y-1">
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
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">TITLE</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. A Site Stairs Smoke from T Roof"
                className="w-full rounded border border-border-subtle bg-background px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-tactical-cyan focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">MAP</label>
                <select
                  value={map}
                  onChange={(e) => setMap(e.target.value as CS2Map)}
                  className="w-full rounded border border-border-subtle bg-background px-2 py-1.5 text-xs text-zinc-100 focus:outline-none"
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
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">SIDE</label>
                <select
                  value={side}
                  onChange={(e) => setSide(e.target.value as TeamSide)}
                  className="w-full rounded border border-border-subtle bg-background px-2 py-1.5 text-xs text-zinc-100 focus:outline-none"
                >
                  <option value="T">T</option>
                  <option value="CT">CT</option>
                  <option value="BOTH">BOTH</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">UTILITY TYPE</label>
                <select
                  value={utilityType}
                  onChange={(e) => setUtilityType(e.target.value as UtilityType)}
                  className="w-full rounded border border-border-subtle bg-background px-2 py-1.5 text-xs text-zinc-100 focus:outline-none"
                >
                  <option value="SMOKE">SMOKE</option>
                  <option value="FLASHBANG">FLASHBANG</option>
                  <option value="MOLOTOV_INCENDIARY">MOLOTOV</option>
                  <option value="HE_GRENADE">HE GRENADE</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">THROW TYPE</label>
                <select
                  value={throwType}
                  onChange={(e) => setThrowType(e.target.value as any)}
                  className="w-full rounded border border-border-subtle bg-background px-2 py-1.5 text-xs text-zinc-100 focus:outline-none"
                >
                  <option value="STANDING">STANDING</option>
                  <option value="JUMPTHROW">JUMPTHROW</option>
                  <option value="RUN_JUMPTHROW">RUN_JUMPTHROW</option>
                  <option value="CROUCH_JUMPTHROW">CROUCH_JUMPTHROW</option>
                  <option value="WALK_THROW">WALK_THROW</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">DIFFICULTY</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full rounded border border-border-subtle bg-background px-2 py-1.5 text-xs text-zinc-100 focus:outline-none"
                >
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </select>
              </div>
            </div>

            {/* Start Position */}
            <div className="rounded border border-border-subtle bg-background p-2.5 space-y-2">
              <label className="block text-[11px] font-mono font-bold text-zinc-300">START POSITION</label>
              <input
                type="text"
                value={startCallout}
                onChange={(e) => setStartCallout(e.target.value)}
                placeholder="Callout (e.g. T Roof Wooden Beam)"
                className="w-full rounded border border-border-subtle bg-background-panel px-2.5 py-1 text-xs text-zinc-100 focus:outline-none"
              />
              <div className="grid grid-cols-4 gap-1.5">
                <input
                  type="number"
                  value={startX}
                  onChange={(e) => setStartX(Number(e.target.value))}
                  placeholder="X"
                  className="rounded border border-border-subtle bg-background-panel px-2 py-1 text-xs font-mono text-zinc-100"
                />
                <input
                  type="number"
                  value={startY}
                  onChange={(e) => setStartY(Number(e.target.value))}
                  placeholder="Y"
                  className="rounded border border-border-subtle bg-background-panel px-2 py-1 text-xs font-mono text-zinc-100"
                />
                <input
                  type="number"
                  value={startZ}
                  onChange={(e) => setStartZ(Number(e.target.value))}
                  placeholder="Z"
                  className="rounded border border-border-subtle bg-background-panel px-2 py-1 text-xs font-mono text-zinc-100"
                />
                <input
                  type="number"
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  placeholder="Tol (±)"
                  className="rounded border border-border-subtle bg-background-panel px-2 py-1 text-xs font-mono text-zinc-100"
                />
              </div>
            </div>

            {/* Target Destination */}
            <div className="rounded border border-border-subtle bg-background p-2.5 space-y-2">
              <label className="block text-[11px] font-mono font-bold text-zinc-300">TARGET DESTINATION</label>
              <input
                type="text"
                value={targetCallout}
                onChange={(e) => setTargetCallout(e.target.value)}
                placeholder="Callout (e.g. Stairs / Sandwich)"
                className="w-full rounded border border-border-subtle bg-background-panel px-2.5 py-1 text-xs text-zinc-100 focus:outline-none"
              />
              <div className="grid grid-cols-3 gap-1.5">
                <input
                  type="number"
                  value={targetX}
                  onChange={(e) => setTargetX(Number(e.target.value))}
                  placeholder="X"
                  className="rounded border border-border-subtle bg-background-panel px-2 py-1 text-xs font-mono text-zinc-100"
                />
                <input
                  type="number"
                  value={targetY}
                  onChange={(e) => setTargetY(Number(e.target.value))}
                  placeholder="Y"
                  className="rounded border border-border-subtle bg-background-panel px-2 py-1 text-xs font-mono text-zinc-100"
                />
                <input
                  type="number"
                  value={targetZ}
                  onChange={(e) => setTargetZ(Number(e.target.value))}
                  placeholder="Z"
                  className="rounded border border-border-subtle bg-background-panel px-2 py-1 text-xs font-mono text-zinc-100"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Aim Reference, Steps & SVG Preview */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">CROSSHAIR PLACEMENT</label>
              <input
                type="text"
                value={crosshairPlacement}
                onChange={(e) => setCrosshairPlacement(e.target.value)}
                placeholder="e.g. Aim at the apex of the center wall indentation"
                className="w-full rounded border border-border-subtle bg-background px-3 py-1.5 text-xs text-zinc-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">VISUAL LANDMARK</label>
              <input
                type="text"
                value={visualLandmark}
                onChange={(e) => setVisualLandmark(e.target.value)}
                placeholder="e.g. Align left pin of smoke grenade with wooden protrusion"
                className="w-full rounded border border-border-subtle bg-background px-3 py-1.5 text-xs text-zinc-100 focus:outline-none"
              />
            </div>

            {/* SVG Reference & Live Preview */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono text-zinc-400">SVG LANDMARK DIAGRAM</label>
                <span className="font-mono text-[10px] text-zinc-500">240x140 RECOMMENDED</span>
              </div>
              <textarea
                value={svgReference}
                onChange={(e) => setSvgReference(e.target.value)}
                rows={4}
                className="w-full rounded border border-border-subtle bg-background p-2 font-mono text-[10px] text-zinc-300 focus:outline-none"
              />
              <div
                className="mt-1 flex items-center justify-center rounded border border-border-subtle bg-background p-2 min-h-[100px]"
                dangerouslySetInnerHTML={{ __html: svgReference }}
              />
            </div>

            {/* Protocol Steps */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono text-zinc-400">EXECUTION PROTOCOL STEPS</label>
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
                    <span className="font-mono text-[10px] text-zinc-500 w-4">{idx + 1}.</span>
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => handleUpdateInstruction(idx, e.target.value)}
                      placeholder={`Step ${idx + 1}`}
                      className="flex-1 rounded border border-border-subtle bg-background px-2.5 py-1 text-xs text-zinc-100 focus:outline-none"
                    />
                    {instructions.length > 1 && (
                      <button
                        onClick={() => handleRemoveInstruction(idx)}
                        className="text-zinc-500 hover:text-tactical-rose cursor-pointer"
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
        <div className="flex items-center justify-end gap-2 border-t border-border-subtle px-5 py-3">
          <button
            onClick={onClose}
            className="rounded border border-border-elevated bg-background px-4 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-background-elevated cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded bg-tactical-cyan px-4 py-1.5 text-xs font-bold text-zinc-950 hover:bg-tactical-cyan/90 flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Save Custom Lineup</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LineupCreatorModal;
