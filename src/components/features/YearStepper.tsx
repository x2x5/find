import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Manifest } from '@/types';
import { useAppContext } from '@/context/AppContext';

interface YearStepperProps {
  manifest: Manifest | null;
  yearRange: [number, number];
  onChange: (range: [number, number]) => void;
}

export default function YearStepper({ manifest, yearRange, onChange }: YearStepperProps) {
  const { t } = useAppContext();
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
    onChange([next, endYear]);
  };

  const adjustEnd = (delta: number) => {
    const next = endYear + delta;
    if (next < startYear || next > maxYear) return;
    onChange([startYear, next]);
  };

  const setRecent = () => {
    const recentStart = Math.max(minYear, maxYear - 1);
    onChange([recentStart, maxYear]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t.sidebar.yearRange}</span>
        <button
          onClick={setRecent}
          className="text-xs px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          {t.sidebar.recent2y}
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 w-8">{t.sidebar.from}</span>
          <button
            onClick={() => adjustStart(-1)}
            disabled={startYear <= minYear}
            className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 w-12 text-center tabular-nums">
            {startYear}
          </span>
          <button
            onClick={() => adjustStart(1)}
            disabled={startYear >= endYear}
            className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 w-8">{t.sidebar.to}</span>
          <button
            onClick={() => adjustEnd(-1)}
            disabled={endYear <= startYear}
            className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 w-12 text-center tabular-nums">
            {endYear}
          </span>
          <button
            onClick={() => adjustEnd(1)}
            disabled={endYear >= maxYear}
            className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
