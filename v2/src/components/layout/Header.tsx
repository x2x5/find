import { useMemo } from 'react';
import { Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import SearchBar from '@/components/features/SearchBar';
import { useAppContext } from '@/context/AppContext';
import type { Manifest } from '@/types';

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  resultCount: number;
  manifest: Manifest | null;
  yearRange: [number, number];
  onYearChange: (range: [number, number]) => void;
}

export default function Header({ searchValue, onSearchChange, resultCount, manifest, yearRange, onYearChange }: HeaderProps) {
  const { theme, toggleTheme, language, toggleLanguage, t } = useAppContext();
  const [startYear, endYear] = yearRange;

  const { minYear, maxYear } = useMemo(() => {
    if (!manifest) return { minYear: 2000, maxYear: 2030 };
    const years = new Set<number>();
    for (const conf of Object.values(manifest.conferences)) {
      for (const y of Object.keys(conf.years)) {
        years.add(parseInt(y, 10));
      }
    }
    const arr = Array.from(years);
    return {
      minYear: Math.min(...arr),
      maxYear: Math.max(...arr),
    };
  }, [manifest]);

  const adjustStart = (delta: number) => {
    const next = startYear + delta;
    if (next < minYear || next > endYear) return;
    onYearChange([next, endYear]);
  };

  const adjustEnd = (delta: number) => {
    const next = endYear + delta;
    if (next < startYear || next > maxYear) return;
    onYearChange([startYear, next]);
  };

  const setRecent = () => {
    const recentStart = Math.max(minYear, maxYear - 1);
    onYearChange([recentStart, maxYear]);
  };

  return (
    <header className="sticky top-0 z-50 max-w-7xl mx-auto px-4">
      <div className="py-3 flex items-center gap-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-zinc-500">{t.sidebar.from}</span>
          <button onClick={() => adjustStart(-1)} disabled={startYear <= minYear} className="p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30">
            <ChevronLeft className="w-3 h-3" />
          </button>
          <span className="text-xs font-medium tabular-nums">{startYear}</span>
          <button onClick={() => adjustStart(1)} disabled={startYear >= endYear} className="p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30">
            <ChevronRight className="w-3 h-3" />
          </button>
          <span className="text-xs text-zinc-500">{t.sidebar.to}</span>
          <button onClick={() => adjustEnd(-1)} disabled={endYear <= startYear} className="p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30">
            <ChevronLeft className="w-3 h-3" />
          </button>
          <span className="text-xs font-medium tabular-nums">{endYear}</span>
          <button onClick={() => adjustEnd(1)} disabled={endYear >= maxYear} className="p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30">
            <ChevronRight className="w-3 h-3" />
          </button>
          <button onClick={setRecent} className="text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700">
            {t.sidebar.recent2y}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
          />
          <span className="text-xs text-zinc-500 whitespace-nowrap">{resultCount} {t.table.results}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-auto">
          <button onClick={toggleTheme} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500" title={theme === 'dark' ? t.theme.light : t.theme.dark}>
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <button onClick={toggleLanguage} className="text-xs px-1.5 py-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
            {language === 'zh' ? t.language.en : t.language.zh}
          </button>
        </div>
      </div>
    </header>
  );
}
