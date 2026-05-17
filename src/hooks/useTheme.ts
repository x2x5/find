import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme | null {
  try {
    const raw = localStorage.getItem('theme');
    if (raw === 'light' || raw === 'dark') return raw;
  } catch {
    // ignore
  }
  return null;
}

function storeTheme(theme: Theme) {
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // ignore
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    return getStoredTheme() || getSystemTheme();
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    storeTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
}
