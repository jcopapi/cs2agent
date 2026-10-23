/**
 * CS Overlay Assistant - Tactical Plan Detail & Editor Modal
 * File: src/renderer/components/utility-room/PlanDetailModal.tsx
 *
 * Allows viewing all lineups inside a plan, reordering them,
 * removing lineups, adding lineups, renaming, sharing, and deleting plans.
 */

import React, { useState } from 'react';
import type { Play, Lineup, CS2Map } from '../../../shared/ipc-types';
import {
  savePlay,
  deletePlay as dbDeletePlay,
  exportPlayToCode,
  getAllPlays,
} from '../../../core/utility/play-database';
import { getLineupById, getAllLineups } from '../../../core/utility/lineup-database';
import { useI18n } from '../../i18n/I18nContext';

interface PlanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Play | null;
  onPlanUpdated: () => void;
  onSelectLineupToInspect?: (lineup: Lineup) => void;
}

export const PlanDetailModal: React.FC<PlanDetailModalProps> = ({
  isOpen,
  onClose,
  plan,
  onPlanUpdated,
  onSelectLineupToInspect,
}) => {
  const { t, language, localize, localizeCallout } = useI18n();
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameValue, setNameValue] = useState<string>('');
  const [isAddingLineups, setIsAddingLineups] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  if (!isOpen || !plan) return null;

  const isPt = language === 'pt-BR';

  const handleStartRename = () => {
    setNameValue(plan.name);
    setIsEditingName(true);
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameValue.trim()) return;
    const updated: Play = {
      ...plan,
      name: nameValue.trim(),
    };
    savePlay(updated);
    setIsEditingName(false);
    onPlanUpdated();
  };

  const handleMoveStep = (idx: number, dir: 'UP' | 'DOWN') => {
    const list = [...(plan.lineupIds || [])];
    const targetIdx = dir === 'UP' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;

    const updated: Play = {
      ...plan,
      lineupIds: list,
    };
    savePlay(updated);
    onPlanUpdated();
  };

  const handleRemoveStep = (idx: number) => {
    const list = [...(plan.lineupIds || [])];
    list.splice(idx, 1);
    const updated: Play = {
      ...plan,
      lineupIds: list,
    };
    savePlay(updated);
    onPlanUpdated();
  };

  const handleAddLineupToPlan = (lineupId: string) => {
    const list = [...(plan.lineupIds || [])];
    list.push(lineupId);
    const updated: Play = {
      ...plan,
      lineupIds: list,
    };
    savePlay(updated);
    onPlanUpdated();
  };

  const handleDeletePlan = () => {
    if (confirm(isPt ? `Excluir o plano tático "${plan.name}"?` : `Delete tactical plan "${plan.name}"?`)) {
      dbDeletePlay(plan.id);
      onPlanUpdated();
      onClose();
    }
  };

  const handleCopyCode = () => {
    const code = exportPlayToCode(plan);
    navigator.clipboard.writeText(code);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  // Available map lineups for the add section
  const availableLineups = getAllLineups().filter((l) => {
    if (plan.map && l.map !== plan.map) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const mTitle = l.title.toLowerCase().includes(q) || (l.titles && (l.titles['pt-BR']?.toLowerCase().includes(q) || l.titles.pt?.toLowerCase().includes(q)));
      const mFrom = localizeCallout(l.startPosition?.callout).toLowerCase().includes(q);
      const mTo = localizeCallout(l.landingArea?.callout).toLowerCase().includes(q);
      if (!mTitle && !mFrom && !mTo) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl bg-surface-container border border-border-subtle p-5 shadow-2xl flex flex-col gap-4 text-text-primary">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border-subtle pb-3 gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">alt_route</span>
            </div>
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <form onSubmit={handleSaveRename} className="flex items-center gap-2">
                  <input
                    type="text"
                    autoFocus
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    className="bg-surface-container-high border border-primary px-2.5 py-1 rounded-lg text-sm text-white font-semibold outline-none flex-1"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 rounded-lg bg-primary text-surface text-xs font-semibold"
                  >
                    {isPt ? 'Salvar' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="w-7 h-7 rounded-lg text-text-muted hover:text-white"
                  >
                    ✕
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-white truncate">{plan.name}</h2>
                  <button
                    onClick={handleStartRename}
                    title={isPt ? 'Editar nome do plano' : 'Rename plan'}
                    className="w-6 h-6 rounded-lg text-text-muted hover:text-white flex items-center justify-center hover:bg-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted">
                <span className="font-mono text-primary font-medium">{plan.map || 'All Maps'}</span>
                <span>•</span>
                <span>{plan.side ? `${plan.side}-Side` : 'Any'}</span>
                <span>•</span>
                <span>
                  {plan.lineupIds?.length || 0} {isPt ? 'lineups no plano' : 'lineups in plan'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCopyCode}
              title={isPt ? 'Copiar código de compartilhamento' : 'Copy share code'}
              className="px-2.5 py-1 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs text-text-secondary hover:text-white flex items-center gap-1 border border-border-subtle transition-all"
            >
              <span className="material-symbols-outlined text-[15px]">share</span>
              <span>{copiedToast ? (isPt ? 'Copiado!' : 'Copied!') : isPt ? 'Compartilhar' : 'Share'}</span>
            </button>
            <button
              onClick={handleDeletePlan}
              title={isPt ? 'Excluir plano' : 'Delete plan'}
              className="w-8 h-8 rounded-xl bg-surface-container hover:bg-danger-soft hover:text-danger text-text-muted flex items-center justify-center border border-border-subtle transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl hover:bg-surface-container-high text-text-muted hover:text-white flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Action Bar: Toggle Add Lineups */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-white tracking-wide uppercase">
            {isPt ? 'Sequência de Lineups do Plano' : 'Plan Lineups Sequence'}
          </span>
          <button
            onClick={() => setIsAddingLineups(!isAddingLineups)}
            className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              isAddingLineups
                ? 'bg-primary text-surface font-semibold'
                : 'bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-white border border-border-subtle'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {isAddingLineups ? 'close' : 'add'}
            </span>
            <span>{isAddingLineups ? (isPt ? 'Fechar Adição' : 'Done Adding') : (isPt ? '+ Adicionar Lineup' : '+ Add Lineup')}</span>
          </button>
        </div>

        {/* If user clicked "+ Add Lineup", show picker drawer */}
        {isAddingLineups && (
          <div className="p-3 rounded-2xl bg-surface-container-low border border-primary/30 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-primary">
                {isPt ? 'Escolha uma lineup para adicionar ao plano:' : 'Pick a lineup to add to this plan:'}
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isPt ? 'Buscar por nome ou local...' : 'Search by name or callout...'}
                className="bg-surface-container-high border border-border-subtle rounded-lg px-2 py-0.5 text-xs text-white placeholder:text-text-muted/60 outline-none w-48"
              />
            </div>
            <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
              {availableLineups.map((lineup) => {
                const landingImg = lineup.thumbnailUrl || lineup.resultImageUrl || lineup.imageUrl;
                return (
                  <div
                    key={lineup.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-border-subtle transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-8 rounded-lg overflow-hidden bg-black shrink-0 border border-border-subtle">
                        {landingImg && <img src={landingImg} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-medium text-white truncate">
                          {localize(lineup.titles || lineup.title)}
                        </div>
                        <div className="text-[10px] text-text-muted flex items-center gap-1">
                          <span>{t('common.from', 'From')}: {localizeCallout(lineup.startPosition?.callout) || 'Base'}</span>
                          <span>•</span>
                          <span className="text-primary">{t('common.to', 'To')}: {localizeCallout(lineup.landingArea?.callout) || 'Destino'}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddLineupToPlan(lineup.id)}
                      className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary/90 text-surface font-semibold text-xs transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                      <span>{isPt ? 'Adicionar' : 'Add'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Lineups List Inside Plan */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px]">
          {(!plan.lineupIds || plan.lineupIds.length === 0) ? (
            <div className="py-12 flex flex-col items-center justify-center text-text-muted text-xs gap-2">
              <span className="material-symbols-outlined text-[32px] text-text-muted/60">playlist_remove</span>
              <span>{isPt ? 'Nenhuma lineup neste plano ainda.' : 'No lineups in this plan yet.'}</span>
              <button
                onClick={() => setIsAddingLineups(true)}
                className="mt-1 px-3 py-1 rounded-xl bg-primary text-surface font-semibold text-xs"
              >
                {isPt ? '+ Adicionar Lineups' : '+ Add Lineups'}
              </button>
            </div>
          ) : (
            plan.lineupIds.map((lid, idx) => {
              const lineup = getLineupById(lid);
              if (!lineup) return null;
              const landingImg = lineup.thumbnailUrl || lineup.resultImageUrl || lineup.imageUrl;

              return (
                <div
                  key={`${lid}-${idx}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-border-subtle hover:border-border-medium transition-all group"
                >
                  <div
                    onClick={() => onSelectLineupToInspect?.(lineup)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <span className="w-6 h-6 rounded-lg bg-surface-container-highest text-primary font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    {/* Prominent Landing Bloom Photo */}
                    <div className="w-12 h-9 rounded-lg overflow-hidden bg-black shrink-0 border border-primary/30 ring-1 ring-primary/20 flex items-center justify-center">
                      {landingImg ? (
                        <img src={landingImg} alt="Landing" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-primary text-[16px]">cloud</span>
                      )}
                    </div>

                    <div className="truncate">
                      <div className="text-xs font-semibold text-white truncate">
                        {localize(lineup.titles || lineup.title)}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                        <span className="text-text-muted">
                          {t('common.from', 'From')}: <strong className="text-white font-medium">{localizeCallout(lineup.startPosition?.callout) || 'Base'}</strong>
                        </span>
                        <span>•</span>
                        <span className="text-primary font-medium">
                          {t('common.to', 'To')}: {localizeCallout(lineup.landingArea?.callout) || 'Destino'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Move & Remove Controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMoveStep(idx, 'UP')}
                      title="Move Up"
                      className="w-7 h-7 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-muted hover:text-white flex items-center justify-center disabled:opacity-20"
                    >
                      <span className="material-symbols-outlined text-[16px]">expand_less</span>
                    </button>
                    <button
                      disabled={idx === plan.lineupIds.length - 1}
                      onClick={() => handleMoveStep(idx, 'DOWN')}
                      title="Move Down"
                      className="w-7 h-7 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-muted hover:text-white flex items-center justify-center disabled:opacity-20"
                    >
                      <span className="material-symbols-outlined text-[16px]">expand_more</span>
                    </button>
                    <button
                      onClick={() => handleRemoveStep(idx)}
                      title={isPt ? 'Remover do plano' : 'Remove from plan'}
                      className="w-7 h-7 rounded-lg hover:bg-danger-soft hover:text-danger text-text-muted flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border-subtle pt-3">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-white text-xs font-medium transition-all border border-border-subtle"
          >
            {isPt ? 'Fechar' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
