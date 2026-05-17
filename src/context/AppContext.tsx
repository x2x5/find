import { createContext, useContext, ReactNode } from 'react';
import { useTheme, type Theme } from '@/hooks/useTheme';
import { useLanguage, type Language } from '@/hooks/useLanguage';
import type { Translations } from '@/i18n/en';

interface AppContextValue {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  toggleLanguage: () => void;
  t: Translations;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const { language, t, toggleLanguage } = useLanguage();

  return (
    <AppContext.Provider value={{ theme, toggleTheme, language, toggleLanguage, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
}
