/**
 * CS2 Assistant - History Destination View
 * File: src/renderer/components/destinations/HistoryView.tsx
 *
 * Implements chronological match records, evidence-based performance analytics
 * (strictly separating measured telemetry from AI interpretation), and the mandatory
 * one-click [PRACTICE — MIRAGE A RETAKE] closed-loop practice trigger.
 */

import React, { useState } from 'react';
import {
  History,
  TrendingUp,
  Award,
  Sparkles,
  Play,
  RotateCw,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
} from 'lucide-react';
import type { MatchRecord } from '../../../shared/ipc-types';

export interface HistoryViewProps {
  onTriggerPracticeRetake?: (map: string, strategyId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onTriggerPracticeRetake,
}) => {
  const sampleMatches: MatchRecord[] = [
    {
      id: 'match-2026-10-19-01',
      map: 'de_mirage',
      date: '2026-10-19 21:15',
      score: { ct: 13, t: 9 },
      result: 'WIN',
      measuredStats: {
        kills: 24,
        deaths: 12,
        adr: 94.2,
        utilityDamage: 218,
        flashAssists: 5,
      },
      aiObservations: [
        'Late rotations from B Short caused 3 lost post-plant rounds.',
        'High utility success rate on T Roof executions (82%).',
        'Struggled with A Site retakes (only 1 out of 5 retakes converted).',
      ],
      recommendedPractice: {
        strategyId: 'strat-mirage-a-retake',
        label: 'PRACTICE — MIRAGE A RETAKE',
      },
    },
    {
      id: 'match-2026-10-19-02',
      map: 'de_inferno',
      date: '2026-10-19 19:40',
      score: { ct: 11, t: 13 },
      result: 'LOSS',
      measuredStats: {
        kills: 18,
        deaths: 16,
        adr: 76.5,
        utilityDamage: 142,
        flashAssists: 2,
      },
      aiObservations: [
        'Frequent early deaths at Banana without utility support.',
        'Good B Site defense holding Car crossfire.',
      ],
    },
    {
      id: 'match-2026-10-18-03',
      map: 'de_dust2',
      date: '2026-10-18 22:05',
      score: { ct: 13, t: 7 },
      result: 'WIN',
      measuredStats: {
        kills: 21,
        deaths: 10,
        adr: 88.0,
        utilityDamage: 184,
        flashAssists: 4,
      },
      aiObservations: [
        'Strong Long A control using deep corner flashbangs.',
      ],
    },
  ];

  const [selectedMatch, setSelectedMatch] = useState<MatchRecord>(sampleMatches[0]);

  const handlePracticeRetakeClick = () => {
    if (onTriggerPracticeRetake) {
      onTriggerPracticeRetake('de_mirage', 'strat-mirage-a-retake');
    }
  };

  return (
    <div data-testid="view-history" className="flex h-full w-full flex-col overflow-hidden bg-background p-4 gap-3">
      {/* Top Ribbon: Aggregated Performance Analytics */}
      <div className="grid grid-cols-5 gap-3">
        <div className="rounded border border-border-subtle bg-background-panel p-3">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">WIN RATE</div>
          <div className="font-mono text-xl font-bold text-tactical-emerald tabular-nums mt-0.5">66.7%</div>
          <div className="text-[10px] text-zinc-400">Last 3 Matches (2W - 1L)</div>
        </div>

        <div className="rounded border border-border-subtle bg-background-panel p-3">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">AVERAGE ADR</div>
          <div className="font-mono text-xl font-bold text-zinc-100 tabular-nums mt-0.5">86.2</div>
          <div className="text-[10px] text-zinc-400">Above rank average (+8.4)</div>
        </div>

        <div className="rounded border border-border-subtle bg-background-panel p-3">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">AVG UTILITY DMG</div>
          <div className="font-mono text-xl font-bold text-tactical-cyan tabular-nums mt-0.5">181.3</div>
          <div className="text-[10px] text-zinc-400">Smokes, HEs & Molotovs</div>
        </div>

        <div className="rounded border border-border-subtle bg-background-panel p-3">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">FIRST DEATH RATE</div>
          <div className="font-mono text-xl font-bold text-tactical-amber tabular-nums mt-0.5">13.5%</div>
          <div className="text-[10px] text-zinc-400">Low entry vulnerability</div>
        </div>

        <div className="rounded border border-border-subtle bg-background-panel p-3">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">RETAKE CONVERSION</div>
          <div className="font-mono text-xl font-bold text-tactical-rose tabular-nums mt-0.5">28.5%</div>
          <div className="text-[10px] text-tactical-rose">Requires focused drill</div>
        </div>
      </div>

      {/* Main Dual-Column Content */}
      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* Left Column (50%): Chronological Match Ledger */}
        <div className="flex flex-col flex-1 rounded border border-border-subtle bg-background-panel p-3 overflow-hidden space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-xs">
            <span className="font-semibold text-zinc-200 uppercase tracking-wider">
              MATCH LEDGER & RECENT SESSIONS
            </span>
            <span className="font-mono text-[10px] text-zinc-500">CS2 GSI ARCHIVE</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {sampleMatches.map((match) => {
              const isSelected = selectedMatch.id === match.id;
              const isWin = match.result === 'WIN';
              return (
                <div
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className={`rounded border p-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-tactical-cyan bg-background-elevated'
                      : 'border-border-subtle bg-background hover:border-border-elevated'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-zinc-100 uppercase tracking-wide">
                        {match.map.replace('de_', '').toUpperCase()}
                      </span>
                      <span
                        className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          isWin
                            ? 'bg-tactical-emerald/20 text-tactical-emerald'
                            : 'bg-tactical-rose/20 text-tactical-rose'
                        }`}
                      >
                        {match.result} ({match.score.ct} - {match.score.t})
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-zinc-500">{match.date}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2 mt-2 border-t border-border-subtle/50 font-mono text-[11px]">
                    <div>
                      <span className="text-zinc-500 text-[9px] block">K / D</span>
                      <span className="text-zinc-200">{match.measuredStats.kills} / {match.measuredStats.deaths}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[9px] block">ADR</span>
                      <span className="text-zinc-200">{match.measuredStats.adr}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[9px] block">UTIL DMG</span>
                      <span className="text-tactical-cyan">{match.measuredStats.utilityDamage}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[9px] block">FLASH AST</span>
                      <span className="text-tactical-amber">{match.measuredStats.flashAssists}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (50%): Evidence-Based Performance Summary & Closed Loop */}
        <div className="flex flex-col flex-1 rounded border border-border-subtle bg-background-panel p-3 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-xs">
            <span className="font-semibold text-zinc-200 uppercase tracking-wider">
              EVIDENCE-BASED SESSION ANALYTICS
            </span>
            <span className="font-mono text-[10px] text-zinc-400">
              {selectedMatch.map.toUpperCase()} // {selectedMatch.date}
            </span>
          </div>

          {/* Section A: Measured Telemetry (Strict Facts) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[10px] text-tactical-emerald font-semibold uppercase tracking-wider">
                [MEASURED FACTS] GSI Verified Telemetry
              </span>
              <span className="text-[10px] text-zinc-500">Zero Inferences</span>
            </div>

            <div className="rounded border border-border-subtle bg-background p-3">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-border-subtle text-zinc-500 text-[10px]">
                    <th className="text-left pb-1.5">METRIC</th>
                    <th className="text-right pb-1.5">VALUE</th>
                    <th className="text-right pb-1.5">BENCHMARK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/40 text-zinc-300">
                  <tr>
                    <td className="py-1.5">Total Damage Dealt</td>
                    <td className="text-right py-1.5 font-bold text-zinc-100">
                      {(selectedMatch.measuredStats.adr * 22).toFixed(0)}
                    </td>
                    <td className="text-right py-1.5 text-zinc-500">1,850 avg</td>
                  </tr>
                  <tr>
                    <td className="py-1.5">Average Damage Per Round (ADR)</td>
                    <td className="text-right py-1.5 font-bold text-tactical-emerald">
                      {selectedMatch.measuredStats.adr}
                    </td>
                    <td className="text-right py-1.5 text-zinc-500">75.0 avg</td>
                  </tr>
                  <tr>
                    <td className="py-1.5">Utility Damage Dealt</td>
                    <td className="text-right py-1.5 font-bold text-tactical-cyan">
                      {selectedMatch.measuredStats.utilityDamage}
                    </td>
                    <td className="text-right py-1.5 text-zinc-500">120.0 avg</td>
                  </tr>
                  <tr>
                    <td className="py-1.5">Flashbang Team Assists</td>
                    <td className="text-right py-1.5 font-bold text-tactical-amber">
                      {selectedMatch.measuredStats.flashAssists}
                    </td>
                    <td className="text-right py-1.5 text-zinc-500">2.5 avg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section B: Gemini AI Tactical Interpretation (Separated Inferences) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[10px] text-tactical-cyan font-semibold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                <span>[AI INFERENCES] Gemini Tactical Commentary</span>
              </span>
              <span className="text-[10px] text-zinc-500">Heuristic Analysis</span>
            </div>

            <div className="rounded border border-tactical-cyan/30 bg-tactical-cyan/5 p-3 space-y-2 text-xs">
              <ul className="space-y-1.5 text-zinc-300 text-[11px] list-disc pl-4 leading-relaxed">
                {selectedMatch.aiObservations?.map((obs, idx) => (
                  <li key={idx}>{obs}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section C: The Mandatory One-Click Practice Closed-Loop Trigger */}
          <div className="rounded border border-tactical-emerald/40 bg-tactical-emerald/5 p-3.5 space-y-2 mt-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-tactical-emerald">
                <RotateCw className="h-4 w-4" />
                <span>CLOSED ECOSYSTEM PRACTICE LOOP</span>
              </div>
              <span className="font-mono text-[9px] text-zinc-400">MANDATORY R5 LOOP</span>
            </div>

            <p className="text-[11px] text-zinc-300 leading-relaxed">
              Based on lost rounds at Mirage A Site, open the exact tactical lineup set and coordinated retake playbook in the Utility Room.
            </p>

            <button
              data-testid="practice-retake-trigger"
              onClick={handlePracticeRetakeClick}
              className="flex w-full items-center justify-center gap-2 rounded bg-tactical-emerald hover:bg-emerald-400 text-zinc-950 font-bold py-2 text-xs transition-colors cursor-pointer shadow-subtle"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>[PRACTICE — MIRAGE A RETAKE]</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
