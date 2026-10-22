/**
 * CS2 Assistant - Internationalization (i18n) Types
 * File: src/renderer/i18n/types.ts
 */

export type Language = 'en' | 'pt-BR' | 'es';

export type LocalizedText =
  | string
  | {
      en: string;
      pt?: string;
      'pt-BR'?: string;
      es?: string;
    };

export interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  localize: (field: LocalizedText | undefined | null, fallback?: string) => string;
}
