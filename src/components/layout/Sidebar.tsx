import { useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Undo2,
  Lightbulb,
  BarChart3,
  Search,
} from "lucide-react";
import Distributions from "@/components/features/Distributions";
import YearDistribution from "@/components/features/YearDistribution";
import { useAppContext } from "@/context/AppContext";
import type { Manifest, Paper } from "@/types";

interface SidebarProps {
  manifest: Manifest | null;
  papers: Paper[];
  selectedConfs: Set<string>;
  onToggleConf: (conf: string) => void;
  yearRange: [number, number];
  onYearChange: (range: [number, number]) => void;
  visitCount?: number | null;
  searchCount?: number | null;
  onFeatureRequest?: () => void;
}

export default function Sidebar({
  manifest,
  papers,
  selectedConfs,
  onToggleConf,
  yearRange,
  onYearChange,
  visitCount,
  searchCount,
  onFeatureRequest,
}: SidebarProps) {
  const { t } = useAppContext();
  const [startYear, endYear] = yearRange;
  const currentYear = new Date().getFullYear();
  const formatYear = (year: number) => String(year).slice(-2);

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

  const setRecent = () => {
    const recentEnd = Math.min(maxYear, currentYear);
    const recentStart = Math.max(minYear, recentEnd - 2);
    onYearChange([recentStart, recentEnd]);
  };

  const adjustStart = (delta: number) => {
    const nextStart = Math.min(endYear, Math.max(minYear, startYear + delta));
    if (nextStart !== startYear) {
      onYearChange([nextStart, endYear]);
    }
  };

  const adjustEnd = (delta: number) => {
    const nextEnd = Math.max(startYear, Math.min(maxYear, endYear + delta));
    if (nextEnd !== endYear) {
      onYearChange([startYear, nextEnd]);
    }
  };

  return (
    <aside className="self-start flex flex-col gap-3">
      <div className="shrink-0 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="mb-3 flex items-end justify-between">
          <span className="text-xs font-bold text-amber-500 dark:text-amber-400">
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
        <div className="sm:hidden">
          <div className="flex items-center justify-between gap-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1.5">
            <span className="shrink-0 text-xs font-semibold text-amber-600 dark:text-amber-400">
              {t.sidebar.from}
            </span>
            <div className="flex min-w-0 items-center justify-center gap-1">
              <button
                type="button"
                onClick={() => adjustStart(-1)}
                disabled={startYear <= minYear}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 disabled:cursor-default disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label={`${t.sidebar.from} -1`}
              >
                <ChevronUp className="h-3.5 w-3.5 -rotate-90" />
              </button>
              <span className="min-w-[2rem] text-center text-sm font-semibold tabular-nums leading-none text-zinc-700 dark:text-zinc-200">
                {formatYear(startYear)}
              </span>
              <button
                type="button"
                onClick={() => adjustStart(1)}
                disabled={startYear >= endYear}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 disabled:cursor-default disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label={`${t.sidebar.from} +1`}
              >
                <ChevronUp className="h-3.5 w-3.5 rotate-90" />
              </button>
            </div>
            <span className="shrink-0 text-xs font-semibold text-amber-600 dark:text-amber-400">
              {t.sidebar.to}
            </span>
            <div className="flex min-w-0 items-center justify-center gap-1">
              <button
                type="button"
                onClick={() => adjustEnd(-1)}
                disabled={endYear <= startYear}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 disabled:cursor-default disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label={`${t.sidebar.to} -1`}
              >
                <ChevronUp className="h-3.5 w-3.5 -rotate-90" />
              </button>
              <span className="min-w-[2rem] text-center text-sm font-semibold tabular-nums leading-none text-zinc-700 dark:text-zinc-200">
                {formatYear(endYear)}
              </span>
              <button
                type="button"
                onClick={() => adjustEnd(1)}
                disabled={endYear >= maxYear}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 disabled:cursor-default disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label={`${t.sidebar.to} +1`}
              >
                <ChevronUp className="h-3.5 w-3.5 rotate-90" />
              </button>
            </div>
            <button
              onClick={setRecent}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-500 hover:bg-amber-100 hover:text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 dark:hover:text-amber-200"
              title={t.sidebar.recent2y}
            >
              <Undo2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2">
          <div className="min-w-0 grid grid-cols-[auto_1fr] items-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1.5">
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
              {t.sidebar.from}
            </span>
            <div className="flex min-w-0 flex-col items-center justify-center gap-0.5">
              <button
                type="button"
                onClick={() => adjustStart(1)}
                disabled={startYear >= endYear}
                className="inline-flex h-4 w-6 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 disabled:cursor-default disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label={`${t.sidebar.from} +1`}
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-0 text-center text-base font-semibold tabular-nums leading-none text-zinc-700 dark:text-zinc-200">
                {formatYear(startYear)}
              </span>
              <button
                type="button"
                onClick={() => adjustStart(-1)}
                disabled={startYear <= minYear}
                className="inline-flex h-4 w-6 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 disabled:cursor-default disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label={`${t.sidebar.from} -1`}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="min-w-0 grid grid-cols-[auto_1fr] items-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1.5">
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
              {t.sidebar.to}
            </span>
            <div className="flex min-w-0 flex-col items-center justify-center gap-0.5">
              <button
                type="button"
                onClick={() => adjustEnd(1)}
                disabled={endYear >= maxYear}
                className="inline-flex h-4 w-6 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 disabled:cursor-default disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label={`${t.sidebar.to} +1`}
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-0 text-center text-base font-semibold tabular-nums leading-none text-zinc-700 dark:text-zinc-200">
                {formatYear(endYear)}
              </span>
              <button
                type="button"
                onClick={() => adjustEnd(-1)}
                disabled={endYear <= startYear}
                className="inline-flex h-4 w-6 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 disabled:cursor-default disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label={`${t.sidebar.to} -1`}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <button
            onClick={setRecent}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-amber-50 px-2 text-amber-500 hover:bg-amber-100 hover:text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 dark:hover:text-amber-200"
            title={t.sidebar.recent2y}
          >
            <Undo2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <YearDistribution papers={papers} className="" />
        </div>
      </div>

      {/* Stats & feedback */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-800">
          <div className="px-2 py-2 text-center">
            <div className="text-xs font-semibold tabular-nums text-zinc-700 dark:text-zinc-200 flex items-center justify-center gap-1">
              <BarChart3 className="w-3 h-3 text-amber-500" />
              {visitCount != null ? visitCount.toLocaleString() : "···"}
            </div>
            <div className="text-[9px] text-zinc-400 mt-0.5">
              {t.footer.totalVisits}
            </div>
          </div>
          <div className="px-2 py-2 text-center">
            <div className="text-xs font-semibold tabular-nums text-zinc-700 dark:text-zinc-200 flex items-center justify-center gap-1">
              <Search className="w-3 h-3 text-indigo-500" />
              {searchCount != null ? searchCount.toLocaleString() : "···"}
            </div>
            <div className="text-[9px] text-zinc-400 mt-0.5">
              {t.footer.totalSearches}
            </div>
          </div>
          <button
            onClick={onFeatureRequest}
            className="px-2 py-2 text-center hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5 mx-auto text-indigo-500" />
            <div className="text-[9px] text-indigo-500 mt-0.5">
              {t.footer.featureRequest}
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
}
