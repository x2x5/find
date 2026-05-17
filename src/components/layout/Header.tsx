import { useMemo } from 'react';
import { Sun, Moon, ChevronLeft, ChevronRight, Undo2, PanelTopClose, PanelTopOpen, Info } from 'lucide-react';
import SearchBar from '@/components/features/SearchBar';
import { useAppContext } from '@/context/AppContext';
import { CONFERENCE_FIELDS } from '@/lib/conferences';
import type { Manifest, Paper } from '@/types';

const FIELD_COLORS: Record<string, { bg: string; text: string }> = {
  CV: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300' },
  AI: { bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-700 dark:text-amber-300' },
  ML: { bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-700 dark:text-emerald-300' },
};

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  resultCount: number;
  luckyPaper: Paper | null;
  showTimeline: boolean;
  onToggleTimeline: () => void;
  manifest: Manifest | null;
  yearRange: [number, number];
  onYearChange: (range: [number, number]) => void;
}

export default function Header({ searchValue, onSearchChange, resultCount, luckyPaper, showTimeline, onToggleTimeline, manifest, yearRange, onYearChange }: HeaderProps) {
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
      <div className="py-2 flex flex-col gap-2 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 md:flex-row md:items-center md:gap-4 md:py-3">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-indigo-600 dark:text-indigo-400 whitespace-nowrap font-medium min-w-[7rem] inline-block">
            {searchValue.trim() ? `${t.table.results} ` : ''}
            <span className="inline-block text-left tabular-nums min-w-[2.8rem]">{searchValue.trim() ? resultCount : ''}</span>
          </span>
          <button onClick={() => adjustStart(-1)} disabled={startYear <= minYear} className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:hover:text-emerald-200 disabled:opacity-20">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium tabular-nums">{startYear}</span>
          <button onClick={() => adjustStart(1)} disabled={startYear >= endYear} className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:hover:text-emerald-200 disabled:opacity-20">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={setRecent} className="p-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-500 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 dark:text-amber-400 dark:hover:text-amber-200" title={t.sidebar.recent2y}>
            <Undo2 className="w-4 h-4" />
          </button>
          <button onClick={() => adjustEnd(-1)} disabled={endYear <= startYear} className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:hover:text-emerald-200 disabled:opacity-20">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium tabular-nums">{endYear}</span>
          <button onClick={() => adjustEnd(1)} disabled={endYear >= maxYear} className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:hover:text-emerald-200 disabled:opacity-20">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 flex-1">
          <SearchBar value={searchValue} onChange={onSearchChange} />
        </div>
        {luckyPaper && searchValue.trim() && (() => {
          const field = CONFERENCE_FIELDS[luckyPaper.conference] || 'ML';
          const fc = FIELD_COLORS[field] || FIELD_COLORS.ML;
          return (
            <div className="flex items-center gap-1.5 text-xs min-w-0">
              <span className="text-pink-500 font-medium shrink-0">{t.subtitle}</span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${fc.bg} ${fc.text}`}>
                {luckyPaper.conference.toUpperCase()}
              </span>
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-medium tabular-nums shrink-0 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300">
                {luckyPaper.year}
              </span>
              <span
                onClick={async () => { try { await navigator.clipboard.writeText(luckyPaper.title); } catch {} }}
                className="text-pink-600 dark:text-pink-400 truncate cursor-pointer hover:text-pink-700 dark:hover:text-pink-300 max-w-[12rem] md:max-w-[30rem]"
                title={luckyPaper.title}
              >
                {luckyPaper.title}
              </span>
            </div>
          );
        })()}
        <div className="flex items-center gap-1 shrink-0 md:ml-auto">
          <button onClick={onToggleTimeline} className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:hover:text-emerald-200" title="时间轴">
            {showTimeline ? <PanelTopClose className="w-4 h-4" /> : <PanelTopOpen className="w-4 h-4" />}
          </button>
          <button onClick={toggleTheme} className="p-1.5 rounded-md bg-rose-50 dark:bg-rose-900/20 text-rose-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/40 dark:text-rose-300 dark:hover:text-rose-100" title={theme === 'dark' ? t.theme.light : t.theme.dark}>
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={toggleLanguage} className="text-sm px-2 py-1 rounded-md bg-rose-50 dark:bg-rose-900/20 text-rose-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/40 dark:text-rose-300 dark:hover:text-rose-100">
            {language === 'zh' ? t.language.en : t.language.zh}
          </button>
          <a href="about.html" className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 dark:text-indigo-300 dark:hover:text-indigo-100" title={t.language.about}>
            <Info className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
