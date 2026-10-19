/**
 * CS2 Assistant - History Performance Intelligence Engine
 * File: src/core/history/history-analytics.ts
 *
 * Implements Section 9 (History — Performance Intelligence):
 * - Chronological match record storage & retrieval
 * - Evidence-based analytics strictly separating Measured Statistics from AI Interpretations
 * - Mandatory History -> Utility Room continuous improvement loop triggers
 *   (PLAY -> ANALYZE -> IDENTIFY WEAKNESS -> PRACTICE -> PREPARE -> PLAY AGAIN)
 */

import type {
  MatchRecord,
  MeasuredPerformanceSummary,
  PracticeDeepLinkRecommendation,
  HistoryAnalysisReport,
} from './types';

export const DEFAULT_MATCH_HISTORY: MatchRecord[] = [
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
    recommendedPractice: {
      strategyId: 'strat-inferno-b-exec',
      label: 'PRACTICE — INFERNO B CONTROL',
    },
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

export class HistoryAnalyticsEngine {
  private records: MatchRecord[];

  constructor(initialRecords: MatchRecord[] = DEFAULT_MATCH_HISTORY) {
    this.records = [...initialRecords];
  }

  public getAllMatches(): MatchRecord[] {
    return [...this.records].sort((a, b) => b.date.localeCompare(a.date));
  }

  public getMatchById(id: string): MatchRecord | null {
    return this.records.find((r) => r.id === id) ?? null;
  }

  public saveMatch(record: MatchRecord): MatchRecord {
    const idx = this.records.findIndex((r) => r.id === record.id);
    if (idx >= 0) {
      this.records[idx] = { ...record };
    } else {
      this.records.unshift({ ...record });
    }
    return { ...record };
  }

  public deleteMatch(id: string): boolean {
    const before = this.records.length;
    this.records = this.records.filter((r) => r.id !== id);
    return this.records.length < before;
  }

  /**
   * Computes strictly measured statistics without fabricating unavailable metrics.
   */
  public computeMeasuredFacts(records: MatchRecord[] = this.records): MeasuredPerformanceSummary {
    if (records.length === 0) {
      return {
        totalMatches: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        winRatePercent: 0,
        averageKills: 0,
        averageDeaths: 0,
        kdRatio: 0,
        averageAdr: 0,
        averageUtilityDamage: 0,
        averageFlashAssists: 0,
      };
    }

    const total = records.length;
    let wins = 0;
    let losses = 0;
    let ties = 0;
    let sumKills = 0;
    let sumDeaths = 0;
    let sumAdr = 0;
    let sumUtilDmg = 0;
    let sumFlash = 0;

    for (const r of records) {
      if (r.result === 'WIN') wins++;
      else if (r.result === 'LOSS') losses++;
      else ties++;

      sumKills += r.measuredStats.kills;
      sumDeaths += r.measuredStats.deaths;
      sumAdr += r.measuredStats.adr;
      sumUtilDmg += r.measuredStats.utilityDamage;
      sumFlash += r.measuredStats.flashAssists;
    }

    return {
      totalMatches: total,
      wins,
      losses,
      ties,
      winRatePercent: Number(((wins / total) * 100).toFixed(1)),
      averageKills: Number((sumKills / total).toFixed(1)),
      averageDeaths: Number((sumDeaths / total).toFixed(1)),
      kdRatio: sumDeaths > 0 ? Number((sumKills / sumDeaths).toFixed(2)) : sumKills,
      averageAdr: Number((sumAdr / total).toFixed(1)),
      averageUtilityDamage: Number((sumUtilDmg / total).toFixed(1)),
      averageFlashAssists: Number((sumFlash / total).toFixed(1)),
    };
  }

  /**
   * Produces a structured report clearly separating measured statistics from
   * AI interpretations and generating History -> Utility Room deep-link actions.
   */
  public generateReport(records: MatchRecord[] = this.records): HistoryAnalysisReport {
    const measuredFacts = this.computeMeasuredFacts(records);
    const aiInterpretations: string[] = [];
    const practiceRecommendations: PracticeDeepLinkRecommendation[] = [];

    for (const r of records) {
      if (r.aiObservations) {
        for (const obs of r.aiObservations) {
          if (!aiInterpretations.includes(obs)) {
            aiInterpretations.push(obs);
          }
        }
      }

      if (r.recommendedPractice) {
        practiceRecommendations.push({
          id: `prac-${r.id}`,
          title: `Practice Recommendation for ${r.map.replace('de_', '').toUpperCase()}`,
          evidenceSummary:
            r.aiObservations?.[r.aiObservations.length - 1] ||
            `Identified tactical opportunity in match ${r.id}`,
          targetMap: r.map,
          targetStrategyId: r.recommendedPractice.strategyId,
          buttonLabel: r.recommendedPractice.label,
        });
      }
    }

    return {
      measuredFacts,
      aiInterpretations,
      practiceRecommendations,
    };
  }
}
