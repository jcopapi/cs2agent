/**
 * CS2 Assistant - i18n Context Provider & Hooks
 * File: src/renderer/i18n/I18nContext.tsx
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Language, LocalizedText, I18nContextValue } from './types';
import { TRANSLATIONS } from './translations';

const LANGUAGE_STORAGE_KEY = 'cs2agent_language';

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
      if (saved && (saved === 'en' || saved === 'pt-BR' || saved === 'es')) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en'; // English by default
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const t = useMemo(() => {
    return (key: string, fallback?: string): string => {
      const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
      if (dict[key]) return dict[key];
      const enDict = TRANSLATIONS.en;
      if (enDict[key]) return enDict[key];
      return fallback || key;
    };
  }, [language]);

  const localize = useMemo(() => {
    return (field: LocalizedText | undefined | null, fallback?: string): string => {
      if (!field) return fallback || '';
      if (typeof field === 'string') return field;
      if (typeof field === 'object') {
        if (language === 'pt-BR' && (field['pt-BR'] || field.pt)) {
          return field['pt-BR'] || field.pt || '';
        }
        if (language === 'es' && field.es) {
          return field.es;
        }
        if (field.en) {
          return field.en;
        }
        // Return first available language string
        const first = Object.values(field).find((v) => typeof v === 'string' && v.trim().length > 0);
        if (first) return first;
      }
      return fallback || '';
    };
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      localize,
    }),
    [language, t, localize]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Graceful fallback outside provider
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key: string, fallback?: string) => TRANSLATIONS.en[key] || fallback || key,
      localize: (field: LocalizedText | undefined | null, fallback?: string) => {
        if (!field) return fallback || '';
        if (typeof field === 'string') return field;
        if (typeof field === 'object' && field.en) return field.en;
        return fallback || '';
      },
    };
  }
  return ctx;
}
