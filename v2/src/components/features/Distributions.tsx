import { useMemo } from 'react';
import type { Paper } from '@/types';
import { CONFERENCE_FIELDS, CONFERENCE_NAMES } from '@/lib/conferences';

interface DistributionsProps {
  papers: Paper[];
  selectedConfs: Set<string>;
  onToggleConf: (conf: string) => void;
}

const FIELDS = [
  { key: 'ML', label: 'ML', color: 'bg-emerald-400 dark:bg-emerald-500' },
  { key: 'CV', label: 'CV', color: 'bg-blue-400 dark:bg-blue-500' },
  { key: 'AI', label: 'AI', color: 'bg-amber-400 dark:bg-amber-500' },
] as const;

const CONF_ORDER = Object.keys(CONFERENCE_FIELDS);

export default function Distributions({ papers, selectedConfs, onToggleConf }: DistributionsProps) {
  const { confCounts, yearCounts, fieldGroups } = useMemo(() => {
    const cc: Record<string, number> = {};
    const yc: Record<string, number> = {};
    for (const p of papers) {
      cc[p.conference] = (cc[p.conference] || 0) + 1;
      yc[p.year] = (yc[p.year] || 0) + 1;
    }

    const groups: Record<string, string[]> = {};
    for (const c of CONF_ORDER) {
      const field = CONFERENCE_FIELDS[c];
      if (!groups[field]) groups[field] = [];
      groups[field].push(c);
    }

    return { confCounts: cc, yearCounts: yc, fieldGroups: groups };
  }, [papers]);

  const confMax = Math.max(1, ...Object.values(confCounts));
  const yearMax = Math.max(1, ...Object.values(yearCounts));

  const sortedYearEntries = useMemo(() => {
    return Object.entries(yearCounts).sort(([a], [b]) => parseInt(a) - parseInt(b));
  }, [yearCounts]);

  const toggleField = (confs: string[]) => {
    const allField = confs.every((c) => selectedConfs.has(c));
    confs.forEach((c) => {
      if (allField ? selectedConfs.has(c) : !selectedConfs.has(c)) {
        onToggleConf(c);
      }
    });
  };

  if (papers.length === 0) return null;

  return (
    <div className="text-xs space-y-3">
      <div className="space-y-2">
        {FIELDS.map(({ key, label, color }) => {
          const confs = fieldGroups[key] || [];
          const fieldAll = confs.every((c) => selectedConfs.has(c));
          const fieldAny = confs.some((c) => selectedConfs.has(c));

          return (
            <div key={key} className="space-y-0.5">
              <button
                onClick={() => toggleField(confs)}
                className={`inline-flex items-center justify-center w-6 h-4 rounded text-[9px] font-bold transition-all ${color} ${
                  fieldAll ? '' : fieldAny ? 'opacity-50' : 'opacity-25 grayscale'
                }`}
              >
                {label}
              </button>
              {confs.map((conf) => {
                const name = CONFERENCE_NAMES[conf] || conf.toUpperCase();
                const count = confCounts[conf] || 0;
                const sel = selectedConfs.has(conf);

                return (
                  <button
                    key={conf}
                    onClick={() => onToggleConf(conf)}
                    className={`flex items-center gap-1.5 w-full group ${
                      sel ? '' : 'opacity-30'
                    }`}
                  >
                    <span className="w-10 text-right text-zinc-500 shrink-0 tabular-nums">{count}</span>
                    <div className="flex-1 h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-sm overflow-hidden">
                      <div
                        className={`h-full rounded-sm transition-all ${
                          sel
                            ? color
                            : 'bg-zinc-300 dark:bg-zinc-600'
                        }`}
                        style={{ width: `${(count / confMax) * 100}%` }}
                      />
                    </div>
                    <span className={`w-16 shrink-0 ${sel ? 'text-zinc-700 dark:text-zinc-200' : 'text-zinc-400'}`}>
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-2 space-y-1">
        {sortedYearEntries.map(([year, count]) => (
          <div key={year} className="flex items-center gap-1.5">
            <span className="w-10 text-right text-zinc-500 shrink-0 tabular-nums">{count}</span>
            <div className="flex-1 h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-sm overflow-hidden">
              <div
                className="h-full bg-emerald-400 dark:bg-emerald-500 rounded-sm transition-all"
                style={{ width: `${(count / yearMax) * 100}%` }}
              />
            </div>
            <span className="w-8 text-zinc-600 dark:text-zinc-400 shrink-0 text-right">{year}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
