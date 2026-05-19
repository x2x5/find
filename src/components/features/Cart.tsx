import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ShoppingCart, Github } from 'lucide-react';
import { CONFERENCE_FIELDS, CONFERENCE_NAMES } from '@/lib/conferences';
import { getPaperKey } from '@/lib/utils';
import { useCitationCount } from '@/hooks/useCitationCount';

interface CartProps {
  items: { conference: string; year: string; title: string }[];
  onRemove: (idx: number) => void;
  onCopy: () => void;
  onClear: () => void;
  onShowToast: (msg: string) => void;
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

function repoText(repo: { stars: number; url: string } | null | undefined): string {
  if (repo && repo.stars > 0) return `★${repo.stars >= 1000 ? (repo.stars / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : repo.stars} ${repo.url}`;
  return '';
}

export default function Cart({ items, onRemove, onCopy, onClear, onShowToast, t }: CartProps) {
  const { citations, fetchBatch, fetching } = useCitationCount('');
  const lastAddedRef = useRef<HTMLDivElement | null>(null);
  const previousLengthRef = useRef(items.length);

  const pageKeys = useMemo(() => items.map((p) => ({ key: getPaperKey(p as any), title: p.title })), [items]);

  const totalStars = useMemo(() => {
    let total = 0;
    for (const item of items) {
      const repo = citations[getPaperKey(item as any)];
      if (repo && repo.stars > 0) total += repo.stars;
    }
    return total;
  }, [items, citations]);

  const handleFetch = useCallback(async () => {
    if (items.length === 0) return;
    const { found, limited, badToken } = await fetchBatch(pageKeys);
    if (badToken) onShowToast?.('GitHub Token 无效');
    else if (limited) onShowToast?.('API 限流，请稍后重试');
    else onShowToast?.(`找到 ${found}/${items.length} 个 GitHub 仓库`);
  }, [fetchBatch, pageKeys, items.length, onShowToast]);

  const handleCheckout = useCallback(async () => {
    const lines = items.map((item) => {
      const repo = citations[getPaperKey(item as any)];
      const gh = repoText(repo);
      return `${item.conference.toUpperCase()} ${item.year} ${item.title}${gh ? ' ' + gh : ''}`;
    });
    const total = totalStars > 0 ? `\n\n总 ★ ${totalStars >= 1000 ? (totalStars / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : totalStars}` : '';
    const text = lines.join('\n') + total;
    try {
      await navigator.clipboard.writeText(text);
      onShowToast?.(`已复制 ${items.length} 篇论文${totalStars > 0 ? `（总 ★ ${totalStars.toLocaleString()}）` : ''}`);
    } catch {}
  }, [items, citations, totalStars, onShowToast]);

  useEffect(() => {
    const wasAdded = items.length > previousLengthRef.current;
    if (wasAdded) {
      lastAddedRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    previousLengthRef.current = items.length;
  }, [items]);

  return (
    <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <ShoppingCart className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {t.cart} <span className="text-zinc-400 tabular-nums">({items.length})</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onCopy} disabled={items.length === 0} className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 disabled:opacity-30">
            {t.copy}
          </button>
          <button onClick={onClear} disabled={items.length === 0} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 disabled:opacity-30">
            {t.clear}
          </button>
        </div>
      </div>
      <div className="space-y-1 overflow-y-auto flex-1 min-h-0">
        {items.length === 0 ? (
          <div className="text-[11px] text-zinc-400 text-center py-3">{t.empty}</div>
        ) : items.map((item, i) => {
          const field = CONFERENCE_FIELDS[item.conference] || 'ML';
          const fc = FIELD_COLORS[field] || FIELD_COLORS.ML;
          const key = getPaperKey(item as any);
          const repo = citations[key];
          const isLastItem = i === items.length - 1;
          return (
            <div
              key={i}
              ref={isLastItem ? lastAddedRef : null}
              className="flex items-center gap-1.5 text-xs group"
            >
              <span className={`inline-flex items-center px-1 py-px rounded text-[9px] font-medium shrink-0 ${fc.bg} ${fc.text}`}>
                {CONFERENCE_NAMES[item.conference] || item.conference.toUpperCase()}
              </span>
              <span className="text-zinc-700 dark:text-zinc-200 truncate flex-1">{item.title}</span>
              {repo && repo.stars > 0 ? (
                <a href={repo.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[10px] text-zinc-400 hover:text-indigo-500 tabular-nums" onClick={(e) => e.stopPropagation()}>
                  {repo.stars >= 1000 ? (repo.stars / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : repo.stars}★
                </a>
              ) : repo === null ? (
                <span className="shrink-0 text-[10px] text-zinc-300 w-5 text-center">—</span>
              ) : null}
              <button onClick={() => onRemove(i)} className="text-zinc-300 hover:text-red-400 shrink-0 opacity-0 group-hover:opacity-100 text-[10px]">
                ✕
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
        <span className="text-[10px] text-zinc-400">总计：</span>
        <span className="text-[11px] font-bold text-amber-500 tabular-nums">
          {totalStars > 0 ? `★ ${totalStars.toLocaleString()}` : '★ 0'}
        </span>
      </div>
      <div className="mt-1.5 flex justify-end shrink-0">
        <button
          onClick={async () => {
            await handleFetch();
            handleCheckout();
          }}
          disabled={fetching}
          className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-30 transition-all shadow-sm"
        >
          <Github className="w-3 h-3" />
          {fetching ? '···' : '结算'}
        </button>
      </div>
    </div>
  );
}
