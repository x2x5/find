import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ShoppingCart, Github, Copy, Check, Trash2, Minus } from 'lucide-react';
import { CONFERENCE_FIELDS } from '@/lib/conferences';
import { getPaperKey } from '@/lib/utils';
import { useCitationCount, type RepoEntry } from '@/hooks/useCitationCount';
import { useAppContext } from '@/context/AppContext';

interface CartProps {
  items: { conference: string; year: string; title: string }[];
  onRemove: (idx: number) => void;
  onCopy: () => void;
  onClear: () => void;
  onShowToast: (msg: string) => void;
  githubToken: string;
  t: {
    cart: string;
    copy: string;
    clear: string;
    empty: string;
  };
}

const FIELD_COLORS: Record<string, { bg: string; text: string }> = {
  ML: { bg: 'bg-violet-100 dark:bg-violet-950', text: 'text-violet-700 dark:text-violet-300' },
  CV: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300' },
  AI: { bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-700 dark:text-emerald-300' },
};
function repoText(repo: RepoEntry | undefined): string {
  if (repo?.kind === 'found' && repo.stars > 0) return `★${repo.stars >= 1000 ? (repo.stars / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : repo.stars} ${repo.url}`;
  return '';
}

export default function Cart({ items, onRemove, onCopy, onClear, onShowToast, githubToken, t }: CartProps) {
  const { t: tx } = useAppContext();
  const [justCopied, setJustCopied] = useState(false);
  const { citations, fetchBatch, fetching } = useCitationCount(githubToken);
  const lastAddedRef = useRef<HTMLDivElement | null>(null);
  const previousLengthRef = useRef(items.length);

  const pageKeys = useMemo(() => items.map((p) => ({ key: getPaperKey(p as any), title: p.title })), [items]);

  const totalStars = useMemo(() => {
    let total = 0;
    for (const item of items) {
      const repo = citations[getPaperKey(item as any)];
      if (repo?.kind === 'found') total += repo.stars;
    }
    return total;
  }, [items, citations]);

  const handleFetch = useCallback(async () => {
    if (items.length === 0) return;
    const { found, searched, unmatched, blocked, failed, limited, badToken } = await fetchBatch(pageKeys);
    if (badToken) {
      onShowToast?.(tx.cart.badToken);
      return;
    }
    if (limited) {
      onShowToast?.(
        githubToken
          ? tx.cart.rateLimit.replace('{searched}', String(searched)).replace('{total}', String(items.length)).replace('{found}', String(found)).replace('{blocked}', String(blocked))
          : tx.cart.rateLimitNoToken.replace('{searched}', String(searched)).replace('{total}', String(items.length))
      );
      return;
    }
    if (failed > 0) {
      onShowToast?.(tx.cart.queryFailed.replace('{failed}', String(failed)).replace('{searched}', String(searched)).replace('{total}', String(items.length)));
      return;
    }
    if (found === 0) {
      onShowToast?.(unmatched > 0 ? tx.cart.noMatch.replace('{searched}', String(searched)) : tx.cart.noSearchable);
      return;
    }
    if (unmatched > 0) {
      onShowToast?.(tx.cart.foundReposPartial.replace('{found}', String(found)).replace('{searched}', String(searched)).replace('{unmatched}', String(unmatched)));
      return;
    }
    onShowToast?.(tx.cart.foundRepos.replace('{found}', String(found)).replace('{searched}', String(searched)));
  }, [fetchBatch, pageKeys, items.length, onShowToast, githubToken, tx.cart]);

  const handleCheckout = useCallback(async () => {
    const lines = items.map((item) => {
      const repo = citations[getPaperKey(item as any)];
      const gh = repoText(repo);
      return `${item.conference.toUpperCase()} ${item.year} ${item.title}${gh ? ' ' + gh : ''}`;
    });
    const total = totalStars > 0 ? `\n\n${tx.cart.total.replace('：', ':')} ★ ${totalStars >= 1000 ? (totalStars / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : totalStars}` : '';
    const text = lines.join('\n') + total;
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }, [items, citations, totalStars, onShowToast, tx.cart]);

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
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-amber-500" />
          <span className="text-sm text-zinc-800 dark:text-zinc-100">
            {t.cart} <span className="text-zinc-600 dark:text-zinc-400 tabular-nums">({items.length})</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              onCopy();
              setJustCopied(true);
              setTimeout(() => setJustCopied(false), 1500);
            }}
            disabled={items.length === 0}
            title={t.copy}
            aria-label={t.copy}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 hover:text-indigo-700 dark:hover:bg-indigo-900 dark:hover:text-indigo-300 disabled:opacity-30 active:scale-90 transition-all"
          >
            {justCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            onClick={onClear}
            disabled={items.length === 0}
            title={t.clear}
            aria-label={t.clear}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-red-100 dark:bg-red-950 text-red-500 dark:text-red-400 hover:bg-red-200 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-300 disabled:opacity-30 active:scale-90 transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="space-y-1 overflow-y-auto flex-1 min-h-0">
        {items.length === 0 ? (
          <div className="text-[11px] text-zinc-400 text-center flex-1 flex items-center justify-center">{t.empty}</div>
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
              className="flex items-start gap-2 text-xs"
            >
              <button
                onClick={() => onRemove(i)}
                className="shrink-0 w-5 h-5 flex items-center justify-center rounded bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900 dark:hover:text-red-300 active:scale-90 transition-all mt-0.5"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className={`break-words flex-1 ${fc.text}`}>{item.title}</span>
              <div className="flex flex-col items-end gap-0.5 shrink-0 w-10">
                {repo?.kind === 'found' ? (
                  <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 tabular-nums" onClick={(e) => e.stopPropagation()}>
                    {repo.stars >= 1000 ? (repo.stars / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : repo.stars}
                  </a>
                ) : repo?.kind === 'not_found' ? (
                  <span className="text-sm text-zinc-400">❌</span>
                ) : repo?.kind === 'rate_limited' || repo?.kind === 'error' ? (
                  <span className="text-sm text-zinc-400">❓</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
        <span className="text-sm text-zinc-800 dark:text-zinc-200">{tx.cart.total}</span>
        <span className="text-base font-bold text-amber-500 tabular-nums">
          {totalStars > 0 ? `${totalStars.toLocaleString()}🌟` : '0🌟'}
        </span>
      </div>
      <div className="mt-1.5 shrink-0">
        <div className="flex items-center justify-end gap-1.5">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">找代码</span>
          <button
            onClick={async () => {
              await handleFetch();
              handleCheckout();
            }}
            disabled={fetching}
            title={fetching ? tx.cart.tooltipQuerying : tx.cart.tooltipCheckout}
            aria-label={fetching ? tx.cart.tooltipQuerying : tx.cart.tooltipCheckout}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-30 transition-all shadow-sm"
          >
            {fetching ? <span className="text-[10px] leading-none">···</span> : <Github className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
