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
    <div data-testid="view-history" className="flex h-full w-full flex-col overflow-hidden bg-[#09090b] p-3 gap-2.5 select-none font-mono text-zinc-100">
      {/* Top Ribbon: Aggregated Performance Analytics */}
      <div className="grid grid-cols-5 gap-2.5 shrink-0">
        <div className="border border-zinc-800 bg-[#0c0c0e] p-2.5 relative">
          <span className="absolute -top-1 -left-1 text-zinc-500 font-mono text-xs select-none">┌</span>
          <span className="absolute -top-1 -right-1 text-zinc-500 font-mono text-xs select-none">┐</span>
          <span className="absolute -bottom-1 -left-1 text-zinc-500 font-mono text-xs select-none">└</span>
          <span className="absolute -bottom-1 -right-1 text-zinc-500 font-mono text-xs select-none">┘</span>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">[WIN RATE]</div>
          <div className="text-xl font-bold text-emerald-400 tabular-nums mt-0.5">66.7%</div>
          <div className="text-[10px] text-zinc-400">3 Matches (2W - 1L)</div>
        </div>

        <div className="border border-zinc-800 bg-[#0c0c0e] p-2.5 relative">
          <span className="absolute -top-1 -left-1 text-zinc-500 font-mono text-xs select-none">┌</span>
          <span className="absolute -top-1 -right-1 text-zinc-500 font-mono text-xs select-none">┐</span>
          <span className="absolute -bottom-1 -left-1 text-zinc-500 font-mono text-xs select-none">└</span>
          <span className="absolute -bottom-1 -right-1 text-zinc-500 font-mono text-xs select-none">┘</span>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">[AVG ADR]</div>
          <div className="text-xl font-bold text-zinc-100 tabular-nums mt-0.5">86.2</div>
          <div className="text-[10px] text-zinc-400">Benchmark: 75.0</div>
        </div>

        <div className="border border-zinc-800 bg-[#0c0c0e] p-2.5 relative">
          <span className="absolute -top-1 -left-1 text-zinc-500 font-mono text-xs select-none">┌</span>
          <span className="absolute -top-1 -right-1 text-zinc-500 font-mono text-xs select-none">┐</span>
          <span className="absolute -bottom-1 -left-1 text-zinc-500 font-mono text-xs select-none">└</span>
          <span className="absolute -bottom-1 -right-1 text-zinc-500 font-mono text-xs select-none">┘</span>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">[AVG UTIL DMG]</div>
          <div className="text-xl font-bold text-cyan-400 tabular-nums mt-0.5">181.3</div>
          <div className="text-[10px] text-zinc-400">Smokes & Molotovs</div>
        </div>

        <div className="border border-zinc-800 bg-[#0c0c0e] p-2.5 relative">
          <span className="absolute -top-1 -left-1 text-zinc-500 font-mono text-xs select-none">┌</span>
          <span className="absolute -top-1 -right-1 text-zinc-500 font-mono text-xs select-none">┐</span>
          <span className="absolute -bottom-1 -left-1 text-zinc-500 font-mono text-xs select-none">└</span>
          <span className="absolute -bottom-1 -right-1 text-zinc-500 font-mono text-xs select-none">┘</span>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">[FIRST DEATH RATE]</div>
          <div className="text-xl font-bold text-amber-400 tabular-nums mt-0.5">13.5%</div>
          <div className="text-[10px] text-zinc-400">Low opening risk</div>
        </div>

        <div className="border border-zinc-800 bg-[#0c0c0e] p-2.5 relative">
          <span className="absolute -top-1 -left-1 text-zinc-500 font-mono text-xs select-none">┌</span>
          <span className="absolute -top-1 -right-1 text-zinc-500 font-mono text-xs select-none">┐</span>
          <span className="absolute -bottom-1 -left-1 text-zinc-500 font-mono text-xs select-none">└</span>
          <span className="absolute -bottom-1 -right-1 text-zinc-500 font-mono text-xs select-none">┘</span>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">[RETAKE CONVERT]</div>
          <div className="text-xl font-bold text-rose-400 tabular-nums mt-0.5">28.5%</div>
          <div className="text-[10px] text-rose-400">Target drill required</div>
        </div>
      </div>

      {/* Main Dual-Column Content */}
      <div className="flex flex-1 gap-2.5 overflow-hidden min-h-0">
        {/* Left Column (50%): Chronological Match Ledger */}
        <div className="flex flex-col flex-1 border border-zinc-800 bg-[#0c0c0e] p-3 overflow-hidden space-y-2.5 relative">
          <span className="absolute -top-1 -left-1 text-zinc-500 font-mono text-xs select-none">┌</span>
          <span className="absolute -top-1 -right-1 text-zinc-500 font-mono text-xs select-none">┐</span>
          <span className="absolute -bottom-1 -left-1 text-zinc-500 font-mono text-xs select-none">└</span>
          <span className="absolute -bottom-1 -right-1 text-zinc-500 font-mono text-xs select-none">┘</span>

          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs">
            <span className="font-bold text-zinc-100 uppercase tracking-wider">
              [MATCH LEDGER // RECENT SESSIONS]
            </span>
            <span className="text-[10px] text-zinc-500">CS2 GSI ARCHIVE</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {sampleMatches.map((match) => {
              const isSelected = selectedMatch.id === match.id;
              const isWin = match.result === 'WIN';
              return (
                <div
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className={`border p-2.5 cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/20'
                      : 'border-zinc-800 bg-black/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-zinc-100 uppercase tracking-wide">
                        {match.map.replace('de_', '').toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 border ${
                          isWin
                            ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-400'
                            : 'border-rose-500/60 bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {match.result} ({match.score.ct} - {match.score.t})
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500">{match.date}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2 mt-2 border-t border-zinc-900 text-[11px]">
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
                      <span className="text-cyan-400">{match.measuredStats.utilityDamage}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[9px] block">FLASH AST</span>
                      <span className="text-amber-400">{match.measuredStats.flashAssists}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (50%): Evidence-Based Performance Summary & Closed Loop */}
        <div className="flex flex-col flex-1 border border-zinc-800 bg-[#0c0c0e] p-3 overflow-y-auto space-y-3 relative">
          <span className="absolute -top-1 -left-1 text-zinc-500 font-mono text-xs select-none">┌</span>
          <span className="absolute -top-1 -right-1 text-zinc-500 font-mono text-xs select-none">┐</span>
          <span className="absolute -bottom-1 -left-1 text-zinc-500 font-mono text-xs select-none">└</span>
          <span className="absolute -bottom-1 -right-1 text-zinc-500 font-mono text-xs select-none">┘</span>

          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs">
            <span className="font-bold text-zinc-100 uppercase tracking-wider">
              [EVIDENCE-BASED SESSION ANALYTICS]
            </span>
            <span className="text-[10px] text-zinc-400">
              {selectedMatch.map.toUpperCase()} // {selectedMatch.date}
            </span>
          </div>

          {/* Section A: Measured Telemetry (Strict Facts) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                [MEASURED FACTS] GSI Verified Telemetry
              </span>
              <span className="text-[10px] text-zinc-500">Zero Inferences</span>
            </div>

            <div className="border border-zinc-800 bg-black/60 p-2.5">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-[10px]">
                    <th className="text-left pb-1.5">METRIC</th>
                    <th className="text-right pb-1.5">VALUE</th>
                    <th className="text-right pb-1.5">BENCHMARK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  <tr>
                    <td className="py-1">Total Damage Dealt</td>
                    <td className="text-right py-1 font-bold text-zinc-100">
                      {(selectedMatch.measuredStats.adr * 22).toFixed(0)}
                    </td>
                    <td className="text-right py-1 text-zinc-500">1,850 avg</td>
                  </tr>
                  <tr>
                    <td className="py-1">Average Damage Per Round (ADR)</td>
                    <td className="text-right py-1 font-bold text-emerald-400">
                      {selectedMatch.measuredStats.adr}
                    </td>
                    <td className="text-right py-1 text-zinc-500">75.0 avg</td>
                  </tr>
                  <tr>
                    <td className="py-1">Utility Damage Dealt</td>
                    <td className="text-right py-1 font-bold text-cyan-400">
                      {selectedMatch.measuredStats.utilityDamage}
                    </td>
                    <td className="text-right py-1 text-zinc-500">120.0 avg</td>
                  </tr>
                  <tr>
                    <td className="py-1">Flashbang Team Assists</td>
                    <td className="text-right py-1 font-bold text-amber-400">
                      {selectedMatch.measuredStats.flashAssists}
                    </td>
                    <td className="text-right py-1 text-zinc-500">2.5 avg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section B: Gemini AI Tactical Interpretation */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                <span>[AI INFERENCES] Gemini Tactical Commentary</span>
              </span>
              <span className="text-[10px] text-zinc-500">Round Analysis</span>
            </div>

            <div className="border border-zinc-800 bg-black/60 p-2.5 space-y-1.5 text-xs">
              <ul className="space-y-1 text-zinc-300 text-[11px] leading-relaxed">
                {selectedMatch.aiObservations?.map((obs, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-cyan-400 shrink-0">#</span>
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section C: The One-Click Practice Closed-Loop Trigger */}
          <div className="border border-emerald-500/50 bg-emerald-500/5 p-3 space-y-2 mt-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <RotateCw className="h-3.5 w-3.5" />
                <span>[CLOSED ECOSYSTEM PRACTICE LOOP]</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-300 leading-relaxed">
              Based on lost rounds at Mirage A Site, open the exact tactical lineup set and coordinated retake playbook in the Utility Room.
            </p>

            <button
              data-testid="practice-retake-trigger"
              onClick={handlePracticeRetakeClick}
              className="flex w-full items-center justify-center gap-2 border border-emerald-500/80 text-emerald-300 font-black py-2 text-xs transition-opacity cursor-pointer hatched-bg hover:opacity-90 uppercase tracking-wider"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>[ PRACTICE — MIRAGE A RETAKE ]</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
