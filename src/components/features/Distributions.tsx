import { useMemo } from 'react';
import type { Paper } from '@/types';
import { CONFERENCE_FIELDS, CONFERENCE_NAMES } from '@/lib/conferences';

interface DistributionsProps {
  papers: Paper[];
  selectedConfs: Set<string>;
  onToggleConf: (conf: string) => void;
}

const FIELDS = [
  { key: 'ML', label: 'ML', bar: 'bg-violet-400 dark:bg-violet-500',    barDim: 'bg-violet-100 dark:bg-violet-900/40',    text: 'text-violet-700 dark:text-violet-300',    bg: 'bg-violet-50/50 dark:bg-violet-950/20' },
  { key: 'CV', label: 'CV', bar: 'bg-blue-400 dark:bg-blue-500',        barDim: 'bg-blue-100 dark:bg-blue-900/40',        text: 'text-blue-700 dark:text-blue-300',        bg: 'bg-blue-50/50 dark:bg-blue-950/20' },
  { key: 'AI', label: 'AI', bar: 'bg-emerald-400 dark:bg-emerald-500',  barDim: 'bg-emerald-100 dark:bg-emerald-900/40',  text: 'text-emerald-700 dark:text-emerald-300',  bg: 'bg-emerald-50/50 dark:bg-emerald-950/20' },
] as const;

const CONF_ORDER = Object.keys(CONFERENCE_FIELDS);

export default function Distributions({ papers, selectedConfs, onToggleConf }: DistributionsProps) {
  const { confCounts, fieldGroups } = useMemo(() => {
    const cc: Record<string, number> = {};
    for (const p of papers) {
      cc[p.conference] = (cc[p.conference] || 0) + 1;
    }
    const groups: Record<string, string[]> = {};
    for (const c of CONF_ORDER) {
      const field = CONFERENCE_FIELDS[c];
      if (!groups[field]) groups[field] = [];
      groups[field].push(c);
    }
    return { confCounts: cc, fieldGroups: groups };
  }, [papers]);

  const confMax = Math.max(1, ...Object.values(confCounts));

  const toggleField = (confs: string[]) => {
    const allField = confs.every((c) => selectedConfs.has(c));
    confs.forEach((c) => {
      if (allField ? selectedConfs.has(c) : !selectedConfs.has(c)) {
        onToggleConf(c);
      }
    });
  };

  return (
    <div className="text-xs">
      {FIELDS.map(({ key, label, bar, barDim, text, bg }) => {
        const confs = fieldGroups[key] || [];
        const fieldAll = confs.every((c) => selectedConfs.has(c));
        const fieldAny = confs.some((c) => selectedConfs.has(c));

        return (
          <div key={key} className={`relative pl-7 rounded ${bg}`}>
            <button
              onClick={() => toggleField(confs)}
              className="absolute left-0.5 top-0 bottom-0 w-5 flex items-center justify-center"
            >
              <span className={`text-[11px] font-extrabold leading-none ${text} ${
                fieldAll ? '' : fieldAny ? 'opacity-50' : 'opacity-30'
              }`}>
                {label}
              </span>
            </button>

            {confs.map((conf) => {
              const name = CONFERENCE_NAMES[conf] || conf.toUpperCase();
              const count = confCounts[conf] || 0;
              const sel = selectedConfs.has(conf);

              return (
                <button
                  key={conf}
                  onClick={() => onToggleConf(conf)}
                  className="flex items-center gap-1.5 w-full py-[1px]"
                >
                  <span className={`w-14 shrink-0 text-right font-medium ${
                    sel ? text : 'text-zinc-300 dark:text-zinc-600'
                  }`}>
                    {name}
                  </span>
                  <div className="flex-1 h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-sm overflow-hidden">
                    <div
                      className={`h-full rounded-sm transition-all ${sel ? bar : barDim}`}
                      style={{ width: `${confMax > 0 ? (count / confMax) * 100 : 0}%` }}
                    />
                  </div>
                  <span className={`w-8 shrink-0 text-right tabular-nums ${sel ? 'text-zinc-500' : 'text-zinc-300 dark:text-zinc-600'}`}>{count}</span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
