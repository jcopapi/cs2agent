/**
 * CS Overlay Assistant - Auto Update & Release Modal
 * File: src/renderer/components/update/UpdateModal.tsx
 */

import React, { useState, useEffect } from 'react';
import type { AppUpdateInfo, AppUpdateProgress } from '../../../shared/ipc-types';
import { useI18n } from '../../i18n/I18nContext';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: AppUpdateInfo | null;
  isChecking: boolean;
  onCheckAgain: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  updateInfo,
  isChecking,
  onCheckAgain,
}) => {
  const { t, language } = useI18n();
  const [downloadProgress, setDownloadProgress] = useState<AppUpdateProgress | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setDownloadProgress(null);
      setIsDownloading(false);
      return;
    }

    const unsub = window.cs2Assistant?.system?.onUpdateProgress?.((progress) => {
      setDownloadProgress(progress);
      if (progress.status === 'ERROR') {
        setIsDownloading(false);
      }
    });

    return () => {
      unsub?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartAutoUpdate = async () => {
    if (!updateInfo?.installerUrl) {
      if (updateInfo?.releasePageUrl) {
        window.open(updateInfo.releasePageUrl, '_blank');
      }
      return;
    }

    setIsDownloading(true);
    try {
      await window.cs2Assistant?.system?.downloadAndInstallUpdate(updateInfo.installerUrl);
    } catch (err: any) {
      setIsDownloading(false);
      alert('Falha ao baixar atualização: ' + (err?.message || 'Erro desconhecido'));
    }
  };

  const isPt = language === 'pt-BR';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-surface-container border border-border-subtle p-5 shadow-2xl flex flex-col gap-4 text-text-primary">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <span className={`material-symbols-outlined text-[18px] ${isChecking ? 'animate-spin' : ''}`}>
                {isChecking ? 'sync' : updateInfo?.hasUpdate ? 'system_update' : 'check_circle'}
              </span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {isChecking
                  ? isPt ? 'Verificando Atualizações...' : 'Checking for Updates...'
                  : updateInfo?.hasUpdate
                  ? isPt ? 'Nova Atualização Disponível!' : 'New Update Available!'
                  : isPt ? 'Aplicativo Atualizado' : 'App is Up to Date'}
              </h2>
              <p className="text-[11px] text-text-muted">
                {isPt ? 'Versão instalada: ' : 'Installed version: '}
                <span className="font-mono text-white">v{updateInfo?.currentVersion || '1.0.0'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-surface-container-high text-text-muted hover:text-white flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        {isChecking ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-text-muted">
            <span className="material-symbols-outlined text-primary text-[32px] animate-spin">sync</span>
            <span className="text-xs">{isPt ? 'Consultando repositório no GitHub...' : 'Checking GitHub repository...'}</span>
          </div>
        ) : updateInfo?.hasUpdate ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/30">
              <div>
                <div className="text-xs font-bold text-primary">
                  {updateInfo.releaseName || `Versão v${updateInfo.latestVersion}`}
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">
                  {isPt ? 'Disponível no GitHub Releases' : 'Available on GitHub Releases'}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-primary text-surface font-mono font-bold text-[10px]">
                v{updateInfo.latestVersion}
              </span>
            </div>

            {/* Release Notes */}
            {updateInfo.releaseNotes && (
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  {isPt ? 'Novidades & Notas de Atualização' : 'Release Notes'}
                </span>
                <div className="max-h-36 overflow-y-auto p-3 rounded-xl bg-surface-container-low border border-border-subtle text-xs text-zinc-300 font-mono whitespace-pre-line leading-relaxed">
                  {updateInfo.releaseNotes}
                </div>
              </div>
            )}

            {/* Download Progress Bar */}
            {isDownloading && (
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-container-high border border-primary/40">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-primary font-bold">
                    {downloadProgress?.status === 'READY_TO_INSTALL'
                      ? isPt ? 'Pronto! Reiniciando...' : 'Ready! Restarting...'
                      : isPt ? 'Baixando instalador...' : 'Downloading update...'}
                  </span>
                  <span className="text-white">{downloadProgress?.percent || 0}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-200"
                    style={{ width: `${downloadProgress?.percent || 0}%` }}
                  />
                </div>
                {downloadProgress?.totalMb ? (
                  <span className="text-[10px] text-text-muted font-mono text-right">
                    {downloadProgress.transferredMb} MB / {downloadProgress.totalMb} MB
                  </span>
                ) : null}
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center gap-2 text-center">
            <span className="material-symbols-outlined text-success text-[36px]">verified</span>
            <div className="text-sm font-semibold text-white">
              {isPt ? 'Você já está na versão mais recente!' : 'You are on the latest version!'}
            </div>
            <p className="text-xs text-text-muted max-w-sm">
              {isPt
                ? 'Nenhuma nova atualização disponível no momento. O CS Overlay Assistant está 100% atualizado.'
                : 'No new updates available at this time. CS Overlay Assistant is 100% up to date.'}
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border-subtle pt-3">
          <button
            onClick={onCheckAgain}
            disabled={isChecking || isDownloading}
            className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-white text-xs font-medium transition-all border border-border-subtle disabled:opacity-50 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[15px]">refresh</span>
            <span>{isPt ? 'Verificar Novamente' : 'Check Again'}</span>
          </button>

          <div className="flex items-center gap-2">
            {updateInfo?.hasUpdate ? (
              <>
                <button
                  onClick={() => window.open(updateInfo.releasePageUrl, '_blank')}
                  className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-white text-xs font-medium transition-all border border-border-subtle"
                >
                  GitHub
                </button>
                <button
                  onClick={handleStartAutoUpdate}
                  disabled={isDownloading}
                  className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-surface font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>{isPt ? 'Atualizar Automaticamente' : 'Update Automatically'}</span>
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-white text-xs font-medium transition-all border border-border-subtle"
              >
                {isPt ? 'Fechar' : 'Close'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
