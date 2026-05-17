import { CONFERENCE_FIELDS, CONFERENCE_NAMES } from '@/lib/conferences';

interface CartProps {
  items: { conference: string; year: string; title: string }[];
  onRemove: (idx: number) => void;
  onCopy: () => void;
  onClear: () => void;
  t: {
    cart: string;
    copy: string;
    clear: string;
    empty: string;
  };
}

const FIELD_COLORS: Record<string, { bg: string; text: string }> = {
  CV: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300' },
  AI: { bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-700 dark:text-amber-300' },
  ML: { bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-700 dark:text-emerald-300' },
};

export default function Cart({ items, onRemove, onCopy, onClear, t }: CartProps) {
  return (
    <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {t.cart} ({items.length})
        </span>
        <div className="flex items-center gap-1">
          <button onClick={onCopy} disabled={items.length === 0} className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 disabled:opacity-30">
            {t.copy}
          </button>
          <button onClick={onClear} disabled={items.length === 0} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 disabled:opacity-30">
            {t.clear}
          </button>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="text-[11px] text-zinc-400 text-center py-3">{t.empty}</div>
      ) : (
        <div className="space-y-1 max-h-[240px] overflow-y-auto">
          {items.map((item, i) => {
            const field = CONFERENCE_FIELDS[item.conference] || 'ML';
            const fc = FIELD_COLORS[field] || FIELD_COLORS.ML;
            return (
              <div key={i} className="flex items-center gap-1.5 text-xs group">
                <span className={`inline-flex items-center px-1 py-px rounded text-[9px] font-medium shrink-0 ${fc.bg} ${fc.text}`}>
                  {CONFERENCE_NAMES[item.conference] || item.conference.toUpperCase()}
                </span>
                <span className="text-zinc-700 dark:text-zinc-200 truncate flex-1">{item.title}</span>
                <button onClick={() => onRemove(i)} className="text-zinc-300 hover:text-red-400 shrink-0 opacity-0 group-hover:opacity-100 text-[10px]">
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
