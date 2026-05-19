import { useState, useCallback, useMemo } from 'react';
import { zh } from '@/i18n/zh';
import { en } from '@/i18n/en';
import type { Translations } from '@/i18n/en';

export type Language = 'zh' | 'en';

function getStoredLanguage(): Language | null {
  try {
    const raw = localStorage.getItem('language');
    if (raw === 'zh' || raw === 'en') return raw;
  } catch {
    // ignore
  }
  return null;
}

function storeLanguage(lang: Language) {
  try {
    localStorage.setItem('language', lang);
  } catch {
    // ignore
  }
}

const DICTIONARIES: Record<Language, Translations> = {
  zh,
  en,
};

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    return getStoredLanguage() || 'zh';
  });

  const t = useMemo(() => DICTIONARIES[language], [language]);

  const setLang = useCallback((lang: Language) => {
    setLanguage(lang);
    storeLanguage(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLang(language === 'zh' ? 'en' : 'zh');
  }, [language, setLang]);

  return { language, t, setLang, toggleLanguage };
}
