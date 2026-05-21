import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Minus, Copy, Files, ArrowUpRight, ShoppingCart } from 'lucide-react';
import type { Paper } from '@/types';
import { getPaperKey } from '@/lib/utils';
import { CONFERENCE_FIELDS } from '@/lib/conferences';
import { useAppContext } from '@/context/AppContext';
import Pagination from './Pagination';

interface PapersTableProps {
  papers?: Paper[];
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  searchTrigger?: string;
  onShowToast?: (message: string) => void;
  cart?: Paper[];
  onToggleCart?: (paper: Paper) => void;
  onWordClick?: (word: string, paper: Paper, globalIdx: number) => void;
  infiniteScroll?: boolean;
}

function highlightText(text: string, query: string, onWordClick?: (word: string) => void): React.ReactNode {
  if (!query.trim() && !onWordClick) return text;

  const words = query.trim().split(/\s+/).filter(Boolean);
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escaped = words.map(escapeRegExp);

  // Split by whitespace, then split hyphenated tokens into parts ("System-Aware" → ["System", "-", "Aware"])
  const tokens = text.split(/(\s+)/).flatMap((t) => {
    if (!t.trim()) return [t];
    return t.split(/(-)/).filter(Boolean);
  });

  return tokens.map((token, i) => {
    if (!token.trim() || token === '-') return token;

    const cleanWord = token.replace(/[^a-zA-Z0-9一-鿿]/g, '');
    const isHighlighted = escaped.some((pat) => new RegExp(pat, 'i').test(token));

    const content = isHighlighted ? (
      <mark className="bg-yellow-200 dark:bg-yellow-800 rounded-sm px-0.5">{token}</mark>
    ) : (
      token
    );

    if (cleanWord && onWordClick) {
      return (
        <span
          key={i}
          data-clickable-word
          onClick={(e) => { e.stopPropagation(); onWordClick(cleanWord); }}
          className="relative z-10 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          {content}
        </span>
      );
    }
    return isHighlighted ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded-sm px-0.5">{token}</mark> : token;
  });
}

const FIELD_COLORS: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  ML: { bg: 'bg-violet-100', text: 'text-violet-700', darkBg: 'dark:bg-violet-950', darkText: 'dark:text-violet-300' },
  CV: { bg: 'bg-blue-100', text: 'text-blue-700', darkBg: 'dark:bg-blue-950', darkText: 'dark:text-blue-300' },
  AI: { bg: 'bg-emerald-100', text: 'text-emerald-700', darkBg: 'dark:bg-emerald-950', darkText: 'dark:text-emerald-300' },
};

function getTitleWordCount(title: string) {
  const words = title.match(/[A-Za-z0-9]+|[\u4e00-\u9fff]+/g) || [];
  return words.length;
}

const BATCH_SIZE = 20;

export default function PapersTable({ papers = [], pageSize = 50, onPageSizeChange, searchTrigger = '', onShowToast, cart = [], onToggleCart, onWordClick, infiniteScroll = false }: PapersTableProps) {
  const { t } = useAppContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [displayCount, setDisplayCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const cartKeys = useMemo(() => new Set(cart.map(getPaperKey)), [cart]);

  const totalPages = Math.max(1, Math.ceil(papers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const pagePapers = useMemo(() => {
    if (infiniteScroll) {
      return papers.slice(0, displayCount);
    }
    return papers
      .slice(startIdx, startIdx + pageSize)
      .map((paper, index) => ({ paper, index }))
      .sort((a, b) => {
        const countDiff = getTitleWordCount(a.paper.title) - getTitleWordCount(b.paper.title);
        if (countDiff !== 0) return countDiff;
        return a.index - b.index;
      })
      .map(({ paper }) => paper);
  }, [papers, startIdx, pageSize, infiniteScroll, displayCount]);
  const placeholderCount = infiniteScroll ? 0 : Math.max(0, pageSize - pagePapers.length);

  useEffect(() => {
    if (!infiniteScroll) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < papers.length) {
          setDisplayCount((prev) => Math.min(prev + BATCH_SIZE, papers.length));
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [infiniteScroll, papers.length, displayCount]);

  const yearNums = papers.map((p) => parseInt(p.year));
  const yearMin = Math.min(...yearNums, new Date().getFullYear());
  const yearMax = Math.max(...yearNums, new Date().getFullYear());


  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCopyPage = useCallback(async () => {
    const titles = pagePapers.map((p) => p.title).join('\n');
    try {
      await navigator.clipboard.writeText(titles);
      onShowToast?.(`Copied ${pagePapers.length} titles`);
    } catch {
      // ignore
    }
  }, [pagePapers, onShowToast]);

  const handleCopyAll = useCallback(async () => {
    const MAX = 500;
    const toCopy = papers.slice(0, MAX);
    const titles = toCopy.map((p) => p.title).join('\n');
    try {
      await navigator.clipboard.writeText(titles);
      if (papers.length > MAX) {
        onShowToast?.(`Copied first ${MAX} of ${papers.length} titles`);
      } else {
        onShowToast?.(`Copied ${papers.length} titles`);
      }
    } catch {
      // ignore
    }
  }, [papers, onShowToast]);

  return (
    <div data-papers-table className="w-full min-w-0 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className={`border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-zinc-50 via-white to-amber-50/70 dark:from-zinc-900 dark:via-zinc-900 dark:to-amber-950/20 ${infiniteScroll ? 'hidden sm:block' : ''}`}>
        <div className="px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="inline-flex items-center rounded-full border border-amber-200/80 dark:border-amber-900/70 bg-white/90 dark:bg-zinc-950/80 px-3 py-1 shadow-sm">
              <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 tabular-nums">
                {papers.length > 0
                  ? infiniteScroll
                    ? `${t.table.showing} ${pagePapers.length}/${papers.length}`
                    : `${t.table.showing} ${startIdx + 1}-${Math.min(startIdx + pageSize, papers.length)}`
                  : `${t.table.showing} 0`}
              </div>
            </div>
            <span className="hidden sm:inline text-xs text-indigo-600 dark:text-indigo-400 truncate">
              {papers.length > 0 ? t.table.clickWordHint : t.table.noResults}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="sm:hidden text-[11px] text-indigo-600 dark:text-indigo-400">
              {papers.length > 0 ? t.table.clickWordHintShort : t.table.noResults}
            </span>
            <button
              onClick={handleCopyPage}
              disabled={pagePapers.length === 0}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-950 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
              {t.table.copyPage}
            </button>
            <button
              onClick={handleCopyAll}
              disabled={papers.length === 0}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-30 transition-colors shadow-sm shadow-amber-500/20"
            >
              <Files className="h-3.5 w-3.5" />
              {t.table.copyAll}
            </button>
          </div>
        </div>
      </div>

      <div className="relative divide-y divide-zinc-200 dark:divide-zinc-800">
        {papers.length === 0 && (
          <div className="absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 text-center text-sm text-zinc-500 pointer-events-none">
            {t.table.noResults}
          </div>
        )}
        {pagePapers.map((paper, i) => {
            const globalIdx = infiniteScroll ? i : startIdx + i;
            const field = CONFERENCE_FIELDS[paper.conference] || 'ML';
            const colors = FIELD_COLORS[field] || FIELD_COLORS.ML;
            const opacityStyle = { opacity: yearMax > yearMin ? 0.7 + 0.3 * (parseInt(paper.year) - yearMin) / (yearMax - yearMin) : 1 };
            const isInCart = cartKeys.has(getPaperKey(paper));
            const externalHref = `https://papers.cool/arxiv/search?highlight=1&query=${encodeURIComponent(paper.title)}`;

            return (
              <div
                key={globalIdx}
                className="px-2 sm:px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
              >
                {/* Mobile: title left, year+conf row, buttons row */}
                <div className="flex gap-2 sm:hidden">
                  <span
                    className={`text-sm ${colors.text} ${colors.darkText} flex-1 min-w-0 break-words leading-5`}
                    style={opacityStyle}
                  >
                    {highlightText(paper.title, searchTrigger, (word) => onWordClick?.(word, paper, globalIdx))}
                  </span>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span
                      className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-medium ${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText}`}
                    >
                      {paper.conference.toUpperCase()} {paper.year.slice(-2)}
                    </span>
                    <div className="flex gap-1">
                      <a
                        href={externalHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 w-5 h-5 flex items-center justify-center rounded-md bg-amber-100 text-amber-600 hover:bg-amber-200 hover:text-amber-700 dark:bg-amber-950 dark:text-amber-400 dark:hover:bg-amber-900 dark:hover:text-amber-300 active:scale-90 transition-all"
                        title={t.table.searchExternal}
                      >
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => onToggleCart?.(paper)}
                        className={`shrink-0 w-5 h-5 flex items-center justify-center rounded-md active:scale-90 transition-all ${isInCart ? "bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900 dark:hover:text-red-300" : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200 hover:text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 dark:hover:bg-emerald-900 dark:hover:text-emerald-300"}`}
                        title={isInCart ? "Remove from cart" : "Add to cart"}
                      >
                        {isInCart ? <Minus className="w-3 h-3" /> : <ShoppingCart className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desktop: horizontal row */}
                <div className="hidden sm:flex items-center gap-3">
                  <span
                    className={`inline-flex items-center justify-center w-[4.5rem] shrink-0 px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText}`}
                  >
                    {paper.conference.toUpperCase()} {paper.year.slice(-2)}
                  </span>
                  <span
                    className={`text-sm ${colors.text} ${colors.darkText} flex-1 min-w-0 break-words leading-5`}
                    style={opacityStyle}
                  >
                    {highlightText(paper.title, searchTrigger, (word) => onWordClick?.(word, paper, globalIdx))}
                  </span>
                  <a
                    href={externalHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-amber-100 text-amber-600 hover:bg-amber-200 hover:text-amber-700 dark:bg-amber-950 dark:text-amber-400 dark:hover:bg-amber-900 dark:hover:text-amber-300 active:scale-90 transition-all"
                    title={t.table.searchExternal}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => onToggleCart?.(paper)}
                    className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-md active:scale-90 transition-all ${isInCart ? "bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900 dark:hover:text-red-300" : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200 hover:text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 dark:hover:bg-emerald-900 dark:hover:text-emerald-300"}`}
                    title={isInCart ? "Remove from cart" : "Add to cart"}
                  >
                    {isInCart ? <Minus className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        {Array.from({ length: placeholderCount }).map((_, i) => (
          <div
            key={`placeholder-${i}`}
            className="px-2 sm:px-4 py-2.5 flex items-center gap-1.5 sm:gap-3"
            aria-hidden="true"
          >
            <span className="inline-flex items-center justify-center w-[4.5rem] shrink-0 px-1 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-transparent select-none">
              CONF 00
            </span>
            <div className="self-stretch flex flex-1 min-w-0 items-center py-0.5">
              <span className="block h-5 w-full rounded bg-zinc-50 dark:bg-zinc-900/70" />
            </div>
            <span className="shrink-0 w-6 h-6 sm:w-7 sm:h-7" />
            <span className="shrink-0 w-6 h-6 sm:w-7 sm:h-7" />
          </div>
        ))}
      </div>

        {infiniteScroll && papers.length > displayCount && (
          <div ref={sentinelRef} className="py-4 text-center text-xs text-zinc-400">
            ···
          </div>
        )}

        {!infiniteScroll && (
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
          />
        )}
      </div>
  );
}
