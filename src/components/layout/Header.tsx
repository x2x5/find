import { useMemo, useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Undo2, PanelTopClose, PanelTopOpen, Settings, Sun, Moon } from 'lucide-react';
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
  luckyPaper: Paper | null;
  showTimeline: boolean;
  onToggleTimeline: () => void;
  manifest: Manifest | null;
  yearRange: [number, number];
  onYearChange: (range: [number, number]) => void;
}

export default function Header(props: HeaderProps) {
  const { searchValue, onSearchChange, luckyPaper, showTimeline, onToggleTimeline, manifest, yearRange, onYearChange } = props;
  const { theme, toggleTheme, language, toggleLanguage, t } = useAppContext();
  const [startYear, endYear] = yearRange;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    if (settingsOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [settingsOpen]);

  const { minYear, maxYear } = useMemo(() => {
    if (!manifest) return { minYear: 2000, maxYear: 2030 };
    const years = new Set<number>();
    for (const conf of Object.values(manifest.conferences)) {
      for (const y of Object.keys(conf.years)) {
        years.add(parseInt(y, 10));
      }
    }
    const arr = Array.from(years);
    return { minYear: Math.min(...arr), maxYear: Math.max(...arr) };
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
        <div className="flex items-center gap-2">
          <button onClick={onToggleTimeline} className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:hover:text-emerald-200" title="时间轴">
            {showTimeline ? <PanelTopClose className="w-4 h-4" /> : <PanelTopOpen className="w-4 h-4" />}
          </button>
          <SearchBar value={searchValue} onChange={onSearchChange} />
          {luckyPaper && (
            <div className="flex items-center gap-1.5 text-xs min-w-0">
              <span className="text-pink-500 font-medium shrink-0">{t.subtitle}</span>
              {searchValue.trim() ? (
                <>
                  {(() => {
                    const field = CONFERENCE_FIELDS[luckyPaper.conference] || 'ML';
                    const fc = FIELD_COLORS[field] || FIELD_COLORS.ML;
                    return (
                      <>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${fc.bg} ${fc.text}`}>
                          {luckyPaper.conference.toUpperCase()}
                        </span>
                        <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-medium tabular-nums shrink-0 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300">
                          {luckyPaper.year}
                        </span>
                        <span
                          onClick={async () => { try { await navigator.clipboard.writeText(luckyPaper.title); } catch {} }}
                          className="text-pink-600 dark:text-pink-400 truncate cursor-pointer hover:text-pink-700 dark:hover:text-pink-300 max-w-[15rem] md:max-w-[35rem]"
                          title={luckyPaper.title}
                        >
                          {luckyPaper.title}
                        </span>
                      </>
                    );
                  })()}
                </>
              ) : null}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0 md:ml-auto">
          <div className="relative" ref={settingsRef}>
            <button onClick={() => setSettingsOpen(!settingsOpen)} className="p-1.5 rounded-md bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700">
              <Settings className="w-4 h-4" />
            </button>
            {settingsOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-3 space-y-3 z-50">
                <div className="border-t-0 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400">{t.theme.light}/{t.theme.dark}</span>
                  <button onClick={toggleTheme} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
                    {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400">语言</span>
                  <button onClick={toggleLanguage} className="text-xs px-2 py-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
                    {language === 'zh' ? 'EN' : '中'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
