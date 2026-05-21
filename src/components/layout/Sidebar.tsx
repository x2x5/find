import { useMemo } from 'react';
import { ChevronUp, ChevronDown, Undo2 } from 'lucide-react';
import Distributions from '@/components/features/Distributions';
import YearDistribution from '@/components/features/YearDistribution';
import { useAppContext } from '@/context/AppContext';
import type { Manifest, Paper } from '@/types';

interface SidebarProps {
  manifest: Manifest | null;
  papers: Paper[];
  selectedConfs: Set<string>;
  onToggleConf: (conf: string) => void;
  yearRange: [number, number];
  onYearChange: (range: [number, number]) => void;
}

export default function Sidebar({
  manifest,
  papers,
  selectedConfs,
  onToggleConf,
  yearRange,
  onYearChange,
}: SidebarProps) {
  const { t } = useAppContext();
  const [startYear, endYear] = yearRange;
  const currentYear = new Date().getFullYear();

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
    const recentEnd = Math.min(maxYear, currentYear);
    const recentStart = Math.max(minYear, recentEnd - 2);
    onYearChange([recentStart, recentEnd]);
  };

  return (
    <aside className="lg:sticky lg:top-[3.5rem] self-start flex flex-col gap-3">
      <div className="shrink-0 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="mb-3 flex items-end justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-500">
            {t.sidebar.total}
          </span>
          <span className="text-base font-semibold tabular-nums text-amber-600 dark:text-amber-300 leading-none">
            {papers.length}
          </span>
        </div>
        <Distributions
          papers={papers}
          selectedConfs={selectedConfs}
          onToggleConf={onToggleConf}
        />
      </div>
      <div className="shrink-0 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            {t.sidebar.from}
          </span>
          <div className="min-w-0 flex flex-col items-center gap-1">
            <button onClick={() => adjustStart(1)} disabled={startYear >= endYear} className="shrink-0 p-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:hover:text-emerald-200 disabled:opacity-20">
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <span className="text-center text-xs font-medium tabular-nums">{startYear}</span>
            <button onClick={() => adjustStart(-1)} disabled={startYear <= minYear} className="shrink-0 p-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:hover:text-emerald-200 disabled:opacity-20">
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            {t.sidebar.to}
          </span>
          <div className="min-w-0 flex flex-col items-center gap-1">
            <button onClick={() => adjustEnd(1)} disabled={endYear >= maxYear} className="shrink-0 p-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:hover:text-emerald-200 disabled:opacity-20">
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <span className="text-center text-xs font-medium tabular-nums">{endYear}</span>
            <button onClick={() => adjustEnd(-1)} disabled={endYear <= startYear} className="shrink-0 p-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:hover:text-emerald-200 disabled:opacity-20">
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
          <button onClick={setRecent} className="shrink-0 p-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-500 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 dark:text-amber-400 dark:hover:text-amber-200" title={t.sidebar.recent2y}>
            <Undo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="shrink-0">
        <YearDistribution papers={papers} />
      </div>
    </aside>
  );
}
