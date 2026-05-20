import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ShoppingCart, Github, Copy, Trash2, CircleHelp, KeyRound, Eraser, Save } from 'lucide-react';
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
  ML: { bg: 'bg-violet-100 dark:bg-violet-950', text: 'text-violet-700 dark:text-violet-300' },
  CV: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300' },
  AI: { bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-700 dark:text-emerald-300' },
};
const GITHUB_TOKEN_STORAGE_KEY = 'github_token';

function repoText(repo: { stars: number; url: string } | null | undefined): string {
  if (repo && repo.stars > 0) return `★${repo.stars >= 1000 ? (repo.stars / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : repo.stars} ${repo.url}`;
  return '';
}

export default function Cart({ items, onRemove, onCopy, onClear, onShowToast, t }: CartProps) {
  const [token, setToken] = useState('');
  const [tokenDraft, setTokenDraft] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const { citations, fetchBatch, fetching } = useCitationCount(token);
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
    const { found, searched, unmatched, blocked, failed, limited, badToken } = await fetchBatch(pageKeys);
    if (badToken) {
      onShowToast?.('GitHub Token 无效');
      return;
    }
    if (limited) {
      onShowToast?.(
        token
          ? `GitHub API 限流：仅完成 ${searched}/${items.length} 个查询，找到 ${found} 个，${blocked} 个未完成`
          : `GitHub API 限流：仅完成 ${searched}/${items.length} 个查询，可先填写 Token`
      );
      return;
    }
    if (failed > 0) {
      onShowToast?.(`GitHub 查询失败：${failed} 篇没查成，已成功检查 ${searched}/${items.length} 篇`);
      return;
    }
    if (found === 0) {
      onShowToast?.(unmatched > 0 ? `没搜到匹配仓库（已检查 ${searched} 篇）` : '没有可搜索的论文');
      return;
    }
    if (unmatched > 0) {
      onShowToast?.(`找到 ${found}/${searched} 个仓库，另有 ${unmatched} 篇没搜到`);
      return;
    }
    onShowToast?.(`找到 ${found}/${searched} 个 GitHub 仓库`);
  }, [fetchBatch, pageKeys, items.length, onShowToast, token]);

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
    } catch {}
  }, [items, citations, totalStars, onShowToast]);

  useEffect(() => {
    const wasAdded = items.length > previousLengthRef.current;
    if (wasAdded) {
      lastAddedRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    previousLengthRef.current = items.length;
  }, [items]);

  useEffect(() => {
    const saved = localStorage.getItem(GITHUB_TOKEN_STORAGE_KEY) || '';
    setToken(saved);
    setTokenDraft(saved);
  }, []);

  const handleSaveToken = useCallback(() => {
    const next = tokenDraft.trim();
    localStorage.setItem(GITHUB_TOKEN_STORAGE_KEY, next);
    setToken(next);
    setShowTokenInput(false);
    onShowToast?.(next ? 'GitHub Token 已保存到本地浏览器' : 'GitHub Token 已清空');
  }, [tokenDraft, onShowToast]);

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
          <button
            onClick={onCopy}
            disabled={items.length === 0}
            title={t.copy}
            aria-label={t.copy}
            className="inline-flex h-5 w-5 items-center justify-center rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 disabled:opacity-30"
          >
            <Copy className="h-3 w-3" />
          </button>
          <button
            onClick={onClear}
            disabled={items.length === 0}
            title={t.clear}
            aria-label={t.clear}
            className="inline-flex h-5 w-5 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 disabled:opacity-30"
          >
            <Trash2 className="h-3 w-3" />
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
      <div className="mt-1.5 space-y-1.5 shrink-0">
        {showTokenInput && (
          <div className="flex items-center gap-1.5">
            <input
              type="password"
              value={tokenDraft}
              onChange={(e) => setTokenDraft(e.target.value)}
              placeholder="GitHub token"
              className="flex-1 min-w-0 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-[10px] text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400 outline-none focus:border-indigo-400"
            />
            <button
              onClick={handleSaveToken}
              title="保存 Token"
              aria-label="保存 Token"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
            >
              <Save className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <div className="flex items-center justify-end gap-1.5">
          <a
            href="/find/token"
            target="_blank"
            rel="noopener noreferrer"
            title="怎么获取 Token"
            aria-label="怎么获取 Token"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
          >
            <CircleHelp className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={() => setShowTokenInput((prev) => !prev)}
            title={token ? 'Token 已设置' : '设置 Token'}
            aria-label={token ? 'Token 已设置' : '设置 Token'}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors ${token ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-300'}`}
          >
            <KeyRound className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              setTokenDraft('');
              localStorage.removeItem(GITHUB_TOKEN_STORAGE_KEY);
              setToken('');
              setShowTokenInput(false);
              onShowToast?.('GitHub Token 已清空');
            }}
            disabled={!token && !tokenDraft}
            title="清空 Token"
            aria-label="清空 Token"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-300 disabled:opacity-30"
          >
            <Eraser className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={async () => {
              await handleFetch();
              handleCheckout();
            }}
            disabled={fetching}
            title={fetching ? '正在查询 GitHub' : '查询 GitHub 并结算'}
            aria-label={fetching ? '正在查询 GitHub' : '查询 GitHub 并结算'}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-30 transition-all shadow-sm"
          >
            {fetching ? <span className="text-[10px] leading-none">···</span> : <Github className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
