import { useMemo } from 'react';
import type { Paper } from '@/types';

interface YearDistributionProps {
  papers: Paper[];
  className?: string;
}

export default function YearDistribution({ papers, className }: YearDistributionProps) {
  const yearCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const paper of papers) {
      counts[paper.year] = (counts[paper.year] || 0) + 1;
    }
    return counts;
  }, [papers]);

  const sortedYearEntries = useMemo(() => {
    return Object.entries(yearCounts).sort(([a], [b]) => parseInt(b, 10) - parseInt(a, 10));
  }, [yearCounts]);

  if (sortedYearEntries.length === 0) return null;

  const yearNums = sortedYearEntries.map(([year]) => parseInt(year, 10));
  const yearMin = Math.min(...yearNums);
  const yearMax = Math.max(...yearNums);
  const countMax = Math.max(1, ...Object.values(yearCounts));

  return (
    <div className={className ?? "rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3"}>
      <div className="space-y-1 text-xs">
        {sortedYearEntries.map(([year, count]) => {
          const n = parseInt(year, 10);
          const t = yearMax > yearMin ? (n - yearMin) / (yearMax - yearMin) : 0.5;
          return (
            <div key={year} className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-x-1.5">
              <span
                className="text-left font-medium tabular-nums"
                style={{ color: `rgba(234, 88, 12, ${0.65 + t * 0.35})` }}
              >
                {year}
              </span>
              <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all"
                  style={{
                    width: `${(count / countMax) * 100}%`,
                    background: `rgba(234, 88, 12, ${0.25 + t * 0.35})`,
                  }}
                />
              </div>
              <span className="text-left tabular-nums text-zinc-800 dark:text-zinc-200">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
