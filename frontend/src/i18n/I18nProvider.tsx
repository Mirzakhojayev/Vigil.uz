'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  DEFAULT_LANGUAGE,
  dictionaries,
  isLanguage,
  type Dict,
  type Language,
} from './index';

interface I18nContextValue {
  /** Active language code. */
  lang: Language;
  /** Change and persist the active language. */
  setLang: (lang: Language) => void;
  /** Resolved dictionary for the active language (typed, nested access). */
  t: Dict;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const STORAGE_KEY = 'vigil_lang';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLanguage(saved)) {
      setLangState(saved);
    }
  }, []);

  const setLang = (next: Language) => {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t: dictionaries[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}
