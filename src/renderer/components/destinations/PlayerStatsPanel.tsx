/**
 * CS2 Assistant - In-Launcher Player Stats & Match History Panel
 * File: src/renderer/components/destinations/PlayerStatsPanel.tsx
 *
 * Displays player telemetry, overall performance metrics, and chronological
 * match history directly within the initial launcher.
 */

import React, { useState } from 'react';
import type { CS2Map } from '../../../core/utility/types';
import type { MatchRecord } from '../../../shared/ipc-types';
import { useI18n } from '../../i18n/I18nContext';

interface PlayerStatsPanelProps {
  onSelectMapAndPractice?: (map: CS2Map) => void;
}

export const PlayerStatsPanel: React.FC<PlayerStatsPanelProps> = ({ onSelectMapAndPractice }) => {
  const { t } = useI18n();

  const [matches] = useState<MatchRecord[]>([
    {
      id: 'match-01',
      map: 'de_mirage',
      date: '2026-10-22 11:30',
      score: { ct: 13, t: 8 },
      result: 'WIN',
      measuredStats: {
        kills: 24,
        deaths: 13,
        adr: 96.4,
        utilityDamage: 240,
        flashAssists: 6,
      },
      aiObservations: [
        'High utility effectiveness holding A Stairs with deep smokes.',
        'Strong first-bullet accuracy on mid window duels.',
      ],
      recommendedPractice: {
        strategyId: 'strat-mirage-a-retake',
        label: 'PRACTICE — MIRAGE A RETAKE',
      },
    },
    {
      id: 'match-02',
      map: 'de_inferno',
      date: '2026-10-21 20:15',
      score: { ct: 11, t: 13 },
      result: 'LOSS',
      measuredStats: {
        kills: 17,
        deaths: 18,
        adr: 78.2,
        utilityDamage: 165,
        flashAssists: 2,
      },
      aiObservations: [
        'Repeated early trades conceded at Banana without smoke cover.',
        'Solid crossfire holds on B Site defense.',
      ],
      recommendedPractice: {
        strategyId: 'strat-inferno-b-exec',
        label: 'PRACTICE — INFERNO B SMOKES',
      },
    },
    {
      id: 'match-03',
      map: 'de_dust2',
      date: '2026-10-21 17:40',
      score: { ct: 13, t: 6 },
      result: 'WIN',
      measuredStats: {
        kills: 22,
        deaths: 11,
        adr: 91.0,
        utilityDamage: 195,
        flashAssists: 4,
      },
      aiObservations: [
        'Excellent Long A control utilizing high flashbang pops.',
      ],
      recommendedPractice: {
        strategyId: 'strat-dust2-a-long',
        label: 'PRACTICE — DUST II LONG A',
      },
    },
    {
      id: 'match-04',
      map: 'de_nuke',
      date: '2026-10-20 22:10',
      score: { ct: 13, t: 10 },
      result: 'WIN',
      measuredStats: {
        kills: 19,
        deaths: 14,
        adr: 82.5,
        utilityDamage: 150,
        flashAssists: 3,
      },
      aiObservations: [
        'Effective outside cross smokes enabling fast secret transitions.',
      ],
    },
  ]);

  const [selectedMatch, setSelectedMatch] = useState<MatchRecord>(matches[0]);

  // Aggregate stats
  const totalKills = matches.reduce((acc, m) => acc + (m.measuredStats?.kills || 0), 0);
  const totalDeaths = matches.reduce((acc, m) => acc + (m.measuredStats?.deaths || 0), 0);
  const kdRatio = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : totalKills.toFixed(2);
  const avgAdr = (
    matches.reduce((acc, m) => acc + (m.measuredStats?.adr || 0), 0) / matches.length
  ).toFixed(1);
  const totalUtilDmg = matches.reduce((acc, m) => acc + (m.measuredStats?.utilityDamage || 0), 0);
  const totalFlashAssists = matches.reduce((acc, m) => acc + (m.measuredStats?.flashAssists || 0), 0);
  const wins = matches.filter((m) => m.result === 'WIN').length;
  const winRate = Math.round((wins / matches.length) * 100);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface p-6">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">monitoring</span>
            {t('stats.title')}
          </h2>
          <p className="text-xs text-text-muted mt-0.5">{t('stats.subtitle')}</p>
        </div>
      </div>

      {/* KPI Stats Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 shrink-0">
        {/* K/D */}
        <div className="p-3.5 rounded-2xl bg-surface-container border border-border-subtle flex flex-col justify-between shadow-sm">
          <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">{t('stats.kd')}</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white font-mono">{kdRatio}</span>
            <span className="text-[10px] text-success font-semibold">1.84+</span>
          </div>
        </div>

        {/* Kills / Deaths */}
        <div className="p-3.5 rounded-2xl bg-surface-container border border-border-subtle flex flex-col justify-between shadow-sm">
          <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">K / D</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-primary font-mono">{totalKills}</span>
            <span className="text-sm text-text-muted">/</span>
            <span className="text-lg font-bold text-text-muted font-mono">{totalDeaths}</span>
          </div>
        </div>

        {/* ADR */}
        <div className="p-3.5 rounded-2xl bg-surface-container border border-border-subtle flex flex-col justify-between shadow-sm">
          <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">{t('stats.adr')}</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white font-mono">{avgAdr}</span>
            <span className="text-[10px] text-text-muted">dmg</span>
          </div>
        </div>

        {/* Utility DMG */}
        <div className="p-3.5 rounded-2xl bg-surface-container border border-border-subtle flex flex-col justify-between shadow-sm">
          <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">{t('stats.utilityDmg')}</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-warning font-mono">{totalUtilDmg}</span>
            <span className="text-[10px] text-text-muted">pts</span>
          </div>
        </div>

        {/* Flash Assists */}
        <div className="p-3.5 rounded-2xl bg-surface-container border border-border-subtle flex flex-col justify-between shadow-sm">
          <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">{t('stats.flashAssists')}</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-secondary font-mono">{totalFlashAssists}</span>
            <span className="text-[10px] text-text-muted">bangs</span>
          </div>
        </div>

        {/* Win Rate */}
        <div className="p-3.5 rounded-2xl bg-surface-container border border-border-subtle flex flex-col justify-between shadow-sm">
          <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">{t('stats.winRate')}</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-success font-mono">{winRate}%</span>
            <span className="text-[10px] text-text-muted">({matches.length} matches)</span>
          </div>
        </div>
      </div>

      {/* Dual Column: Matches List & Match Detail */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden">
        {/* Matches List (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col h-full overflow-hidden bg-surface-container rounded-2xl border border-border-subtle p-3">
          <div className="px-2 py-1.5 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle shrink-0">
            {t('stats.recentMatches')}
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 p-1.5 mt-2 custom-scrollbar">
            {matches.map((m) => {
              const active = selectedMatch.id === m.id;
              const isWin = m.result === 'WIN';
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMatch(m)}
                  type="button"
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    active
                      ? 'bg-surface-container-high border-primary/50 shadow-sm'
                      : 'bg-surface-subtle/40 border-border-subtle hover:bg-surface-container-high/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isWin ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
                      }`}
                    >
                      {isWin ? 'W' : 'L'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white uppercase tracking-tight">
                        {m.map.replace('de_', '')}
                      </div>
                      <div className="text-[10px] text-text-muted font-mono">{m.date}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-white">
                      {m.score.ct} : {m.score.t}
                    </div>
                    <div className="text-[10px] font-mono text-text-secondary">
                      {m.measuredStats?.kills}K / {m.measuredStats?.deaths}D
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Match Inspector (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-surface-container rounded-2xl border border-border-subtle p-5">
          <div className="flex items-center justify-between pb-4 border-b border-border-subtle shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedMatch.result === 'WIN' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                  }`}
                >
                  {selectedMatch.result === 'WIN' ? t('stats.victory') : t('stats.defeat')}
                </span>
                <span className="text-base font-bold text-white uppercase font-mono">
                  {selectedMatch.map.replace('de_', '')}
                </span>
              </div>
              <div className="text-xs text-text-muted mt-0.5 font-mono">{selectedMatch.date}</div>
            </div>

            <div className="text-2xl font-black font-mono text-white tracking-widest bg-black/30 px-3 py-1 rounded-xl border border-white/5">
              {selectedMatch.score.ct} : {selectedMatch.score.t}
            </div>
          </div>

          {/* Measured Match Stats Grid */}
          <div className="grid grid-cols-4 gap-2.5 my-4 shrink-0">
            <div className="p-2.5 rounded-xl bg-surface-subtle border border-border-subtle text-center">
              <span className="text-[10px] text-text-muted uppercase">Kills</span>
              <div className="text-lg font-black text-white font-mono">{selectedMatch.measuredStats?.kills}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-subtle border border-border-subtle text-center">
              <span className="text-[10px] text-text-muted uppercase">Deaths</span>
              <div className="text-lg font-black text-text-muted font-mono">{selectedMatch.measuredStats?.deaths}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-subtle border border-border-subtle text-center">
              <span className="text-[10px] text-text-muted uppercase">ADR</span>
              <div className="text-lg font-black text-primary font-mono">{selectedMatch.measuredStats?.adr}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-subtle border border-border-subtle text-center">
              <span className="text-[10px] text-text-muted uppercase">Utility Dmg</span>
              <div className="text-lg font-black text-warning font-mono">{selectedMatch.measuredStats?.utilityDamage}</div>
            </div>
          </div>

          {/* Observations */}
          <div className="flex-1 overflow-y-auto space-y-2 mt-2">
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Performance Insights
            </div>
            {selectedMatch.aiObservations?.map((obs, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-surface-subtle border border-border-subtle/80 flex items-start gap-2 text-xs text-text-secondary">
                <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">verified</span>
                <span>{obs}</span>
              </div>
            ))}

            {/* Practice Button */}
            {selectedMatch.recommendedPractice && (
              <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-primary font-bold uppercase tracking-wider">{t('stats.practiceRecommended')}</div>
                  <div className="text-xs font-semibold text-white mt-0.5">{selectedMatch.recommendedPractice.label}</div>
                </div>
                <button
                  onClick={() => onSelectMapAndPractice?.(selectedMatch.map as CS2Map)}
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-primary text-surface font-bold text-xs hover:bg-primary-hover transition-colors flex items-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  Practice
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
