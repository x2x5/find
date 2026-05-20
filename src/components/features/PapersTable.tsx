import { useState, useCallback, useMemo, useRef } from 'react';
import { Plus, Minus, Copy, Files, Sparkles } from 'lucide-react';
import type { Paper } from '@/types';
import { getPaperKey } from '@/lib/utils';
import { CONFERENCE_FIELDS } from '@/lib/conferences';
import { useAppContext } from '@/context/AppContext';
import Pagination from './Pagination';

interface PapersTableProps {
  papers?: Paper[];
  pageSize?: number;
  searchTrigger?: string;
  onShowToast?: (message: string) => void;
  cart?: Paper[];
  onToggleCart?: (paper: Paper) => void;
  onWordClick?: (word: string, paper: Paper, globalIdx: number) => void;
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

function handleHorizontalWheel(event: React.WheelEvent<HTMLDivElement>) {
  const node = event.currentTarget;
  if (node.scrollWidth <= node.clientWidth) return;
  if (Math.abs(event.deltaY) < Math.abs(event.deltaX) && event.deltaX === 0) return;
  event.preventDefault();
  node.scrollLeft += event.deltaY + event.deltaX;
}

function ScrollableTitle({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className: string;
  style?: React.CSSProperties;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({ active: false, startX: 0, startScrollLeft: 0, moved: false });
  const suppressClickRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest('[data-clickable-word]')) return;
    const node = containerRef.current;
    if (!node || node.scrollWidth <= node.clientWidth) return;
    dragStateRef.current = {
      active: true,
      startX: event.clientX,
      startScrollLeft: node.scrollLeft,
      moved: false,
    };
    suppressClickRef.current = false;
    node.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const node = containerRef.current;
    const drag = dragStateRef.current;
    if (!node || !drag.active) return;
    const deltaX = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(deltaX) > 6) {
      drag.moved = true;
      suppressClickRef.current = true;
      setDragging(true);
    }
    if (!drag.moved) return;
    event.preventDefault();
    node.scrollLeft = drag.startScrollLeft - deltaX;
  }, []);

  const endDrag = useCallback((event?: React.PointerEvent<HTMLDivElement>) => {
    const node = containerRef.current;
    const drag = dragStateRef.current;
    if (event && node?.hasPointerCapture(event.pointerId)) {
      node.releasePointerCapture(event.pointerId);
    }
    drag.active = false;
    if (drag.moved) {
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
    drag.moved = false;
    setDragging(false);
  }, []);

  const handleClickCapture = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`self-stretch flex flex-1 min-w-0 items-center overflow-x-auto overflow-y-hidden whitespace-nowrap py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${dragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
      onWheel={handleHorizontalWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={handleClickCapture}
    >
      <span className={`${className} pr-6`} style={style}>
        {children}
      </span>
    </div>
  );
}

const FIELD_COLORS: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  ML: { bg: 'bg-violet-100', text: 'text-violet-700', darkBg: 'dark:bg-violet-950', darkText: 'dark:text-violet-300' },
  CV: { bg: 'bg-blue-100', text: 'text-blue-700', darkBg: 'dark:bg-blue-950', darkText: 'dark:text-blue-300' },
  AI: { bg: 'bg-emerald-100', text: 'text-emerald-700', darkBg: 'dark:bg-emerald-950', darkText: 'dark:text-emerald-300' },
};

export default function PapersTable({ papers = [], pageSize = 50, searchTrigger = '', onShowToast, cart = [], onToggleCart, onWordClick }: PapersTableProps) {
  const { t } = useAppContext();
  const [currentPage, setCurrentPage] = useState(1);

  const cartKeys = useMemo(() => new Set(cart.map(getPaperKey)), [cart]);

  const totalPages = Math.max(1, Math.ceil(papers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const pagePapers = papers.slice(startIdx, startIdx + pageSize);
  const placeholderCount = Math.max(0, pageSize - pagePapers.length);

  const yearNums = papers.map((p) => parseInt(p.year));
  const yearMin = Math.min(...yearNums, new Date().getFullYear());
  const yearMax = Math.max(...yearNums, new Date().getFullYear());

  const yearStyle = (y: string) => {
    const n = parseInt(y);
    const t = yearMax > yearMin ? (n - yearMin) / (yearMax - yearMin) : 0.5;
    return {
      background: `rgba(234, 88, 12, ${0.2 + t * 0.25})`,
      color: `rgba(180, 60, 10, ${0.7 + t * 0.15})`,
    };
  };

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
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-zinc-50 via-white to-amber-50/70 dark:from-zinc-900 dark:via-zinc-900 dark:to-amber-950/20">
        <div className="px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 dark:border-amber-900/70 bg-white/90 dark:bg-zinc-950/80 px-2.5 py-1 shadow-sm">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
                <Sparkles className="h-3 w-3" />
              </span>
              <div className="leading-none">
                <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 tabular-nums">
                  {papers.length > 0 ? `${startIdx + 1} – ${Math.min(startIdx + pageSize, papers.length)}` : '0'}
                </div>
              </div>
            </div>
            <span className="hidden sm:inline text-xs text-zinc-400 dark:text-zinc-500 truncate">
              {papers.length > 0 ? '点论文标题里的单词，可以继续缩小范围' : t.table.noResults}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="sm:hidden text-[11px] text-zinc-400 dark:text-zinc-500">
              {papers.length > 0 ? '点词继续搜' : t.table.noResults}
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
            const globalIdx = startIdx + i;
            const field = CONFERENCE_FIELDS[paper.conference] || 'ML';
            const colors = FIELD_COLORS[field] || FIELD_COLORS.ML;

            return (
              <div
                key={globalIdx}
                className="px-4 py-2.5 flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
              >
                <span
                  className="inline-flex items-center justify-center w-14 shrink-0 px-2 py-0.5 rounded text-xs font-medium tabular-nums"
                  style={yearStyle(paper.year)}
                >
                  {paper.year}
                </span>
                <span className={`inline-flex items-center justify-center w-[4.5rem] shrink-0 px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText}`}>
                  {paper.conference.toUpperCase()}
                </span>
                <button
                  onClick={() => onToggleCart?.(paper)}
                  className={`shrink-0 w-5 h-5 flex items-center justify-center rounded transition-colors ${cartKeys.has(getPaperKey(paper)) ? "text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"}`}
                  title={cartKeys.has(getPaperKey(paper)) ? "Remove from cart" : "Add to cart"}
                >
                  {cartKeys.has(getPaperKey(paper)) ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={async () => {
                    try { await navigator.clipboard.writeText(paper.title); onShowToast?.('已复制标题'); }
                    catch {}
                  }}
                  className="shrink-0 text-zinc-300 hover:text-zinc-500 dark:hover:text-zinc-300"
                  title="复制标题"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <ScrollableTitle
                  className={`inline-block min-w-max text-sm ${colors.text} ${colors.darkText}`}
                  style={{ opacity: yearMax > yearMin ? 0.7 + 0.3 * (parseInt(paper.year) - yearMin) / (yearMax - yearMin) : 1 }}
                >
                  {highlightText(paper.title, searchTrigger, (word) => onWordClick?.(word, paper, globalIdx))}
                </ScrollableTitle>
              </div>
            );
          })}
        {Array.from({ length: placeholderCount }).map((_, i) => (
          <div
            key={`placeholder-${i}`}
            className="px-4 py-2.5 flex items-center gap-3"
            aria-hidden="true"
          >
            <span className="inline-flex items-center justify-center w-14 shrink-0 px-2 py-0.5 rounded text-xs font-medium tabular-nums bg-zinc-100 dark:bg-zinc-800 text-transparent select-none">
              0000
            </span>
            <span className="inline-flex items-center justify-center w-[4.5rem] shrink-0 px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-transparent select-none">
              CONF
            </span>
            <span className="shrink-0 w-5 h-5" />
            <span className="h-4 flex-1 rounded bg-zinc-50 dark:bg-zinc-900/70" />
          </div>
        ))}
      </div>

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
