import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Manifest } from '@/types';
import { CONFERENCE_FIELDS, CONFERENCE_NAMES } from '@/lib/conferences';
import { useAppContext } from '@/context/AppContext';

interface FieldFilterProps {
  manifest: Manifest | null;
  selectedConfs: Set<string>;
  onToggleConf: (conf: string) => void;
}

const FIELDS = ['ML', 'CV', 'AI'] as const;

export default function FieldFilter({ manifest, selectedConfs, onToggleConf }: FieldFilterProps) {
  const { t } = useAppContext();
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['ML', 'CV', 'AI']));

  const confsByField = manifest
    ? Object.keys(manifest.conferences).reduce((acc, conf) => {
        const field = CONFERENCE_FIELDS[conf];
        if (!field) return acc;
        if (!acc[field]) acc[field] = [];
        acc[field].push(conf);
        return acc;
      }, {} as Record<string, string[]>)
    : {};

  const toggleField = (field: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  const isFieldAllSelected = (field: string) => {
    const confs = confsByField[field] || [];
    return confs.length > 0 && confs.every((c) => selectedConfs.has(c));
  };

  const isFieldPartial = (field: string) => {
    const confs = confsByField[field] || [];
    const selectedCount = confs.filter((c) => selectedConfs.has(c)).length;
    return selectedCount > 0 && selectedCount < confs.length;
  };

  const toggleFieldAll = (field: string) => {
    const confs = confsByField[field] || [];
    const currentlyAll = isFieldAllSelected(field);
    confs.forEach((c) => {
      const isSelected = selectedConfs.has(c);
      if (currentlyAll) {
        if (isSelected) onToggleConf(c);
      } else {
        if (!isSelected) onToggleConf(c);
      }
    });
  };

  return (
    <div className="space-y-2">
      {FIELDS.map((field) => {
        const confs = confsByField[field] || [];
        const isOpen = expanded.has(field);
        const allSelected = isFieldAllSelected(field);
        const partial = isFieldPartial(field);

        return (
          <div key={field}>
            <button
              onClick={() => toggleField(field)}
              className="w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-4 h-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = partial;
                    }}
                    onChange={() => toggleFieldAll(field)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 accent-indigo-600 cursor-pointer"
                  />
                </div>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {(t.fields as Record<string, string>)[field]}
                </span>
                <span className="text-xs text-zinc-500">({confs.length})</span>
              </div>
              {isOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              )}
            </button>

            {isOpen && (
              <div className="ml-6 mt-1 space-y-1">
                {confs.map((conf) => (
                  <label
                    key={conf}
                    className="flex items-center gap-2 px-2 py-1 text-sm rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedConfs.has(conf)}
                      onChange={() => onToggleConf(conf)}
                      className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 accent-indigo-600"
                    />
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {CONFERENCE_NAMES[conf] || conf.toUpperCase()}
                    </span>
                    {manifest && (
                      <span className="text-xs text-zinc-400 ml-auto">
                        {Object.values(manifest.conferences[conf]?.years || {}).reduce(
                          (s, y) => s + y.count,
                          0
                        )}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
