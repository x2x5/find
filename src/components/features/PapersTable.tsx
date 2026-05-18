import { useState, useCallback, useMemo } from 'react';
import { Plus, Minus } from 'lucide-react';
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
          onClick={(e) => { e.stopPropagation(); onWordClick(cleanWord); }}
          className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          {content}
        </span>
      );
    }
    return isHighlighted ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded-sm px-0.5">{token}</mark> : token;
  });
}

const FIELD_COLORS: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  CV: { bg: 'bg-blue-100', text: 'text-blue-700', darkBg: 'dark:bg-blue-950', darkText: 'dark:text-blue-300' },
  AI: { bg: 'bg-amber-100', text: 'text-amber-700', darkBg: 'dark:bg-amber-950', darkText: 'dark:text-amber-300' },
  ML: { bg: 'bg-emerald-100', text: 'text-emerald-700', darkBg: 'dark:bg-emerald-950', darkText: 'dark:text-emerald-300' },
};

export default function PapersTable({ papers = [], pageSize = 50, searchTrigger = '', onShowToast, cart = [], onToggleCart, onWordClick }: PapersTableProps) {
  const { t } = useAppContext();
  const [currentPage, setCurrentPage] = useState(1);

  const cartKeys = useMemo(() => new Set(cart.map(getPaperKey)), [cart]);

  const totalPages = Math.max(1, Math.ceil(papers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const pagePapers = papers.slice(startIdx, startIdx + pageSize);

  const yearNums = papers.map((p) => parseInt(p.year));
  const yearMin = Math.min(...yearNums, new Date().getFullYear());
  const yearMax = Math.max(...yearNums, new Date().getFullYear());

  const yearStyle = (y: string) => {
    const n = parseInt(y);
    const t = yearMax > yearMin ? (n - yearMin) / (yearMax - yearMin) : 0.5;
    const alpha = 0.06 + t * 0.14;
    return {
      background: `rgba(99, 102, 241, ${alpha})`,
      color: `rgba(67, 56, 202, ${0.5 + t * 0.5})`,
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
    <div className="w-full min-w-0 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
          {papers.length > 0 ? `${papers.length} 篇` : ''}
        </span>
        <span className="text-base text-zinc-500">
          {papers.length > 0 ? `${startIdx + 1}-${Math.min(startIdx + pageSize, papers.length)}（点击单词即可加入搜索）` : ''}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyPage}
            disabled={pagePapers.length === 0}
            className="text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30 transition-colors"
          >
            {t.table.copyPage}
          </button>
          <button
            onClick={handleCopyAll}
            disabled={papers.length === 0}
            className="text-xs px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900 disabled:opacity-30 transition-colors"
          >
            {t.table.copyAll}
          </button>
        </div>
      </div>

      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {papers.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">
            {t.table.noResults}
          </div>
        ) : (
          pagePapers.map((paper, i) => {
            const globalIdx = startIdx + i;
            const field = CONFERENCE_FIELDS[paper.conference] || 'ML';
            const colors = FIELD_COLORS[field] || FIELD_COLORS.ML;

            return (
              <div
                key={globalIdx}
                className="px-4 py-2.5 flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
              >
                <span className={`inline-flex items-center justify-center w-[4.5rem] shrink-0 px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText}`}>
                  {paper.conference.toUpperCase()}
                </span>
                <span
                  className="inline-flex items-center justify-center w-14 shrink-0 px-2 py-0.5 rounded text-xs font-medium tabular-nums"
                  style={yearStyle(paper.year)}
                >
                  {paper.year}
                </span>
                <button
                  onClick={() => onToggleCart?.(paper)}
                  className={`shrink-0 w-5 h-5 flex items-center justify-center rounded transition-colors ${cartKeys.has(getPaperKey(paper)) ? "text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" : "text-zinc-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"}`}
                  title={cartKeys.has(getPaperKey(paper)) ? "Remove from cart" : "Add to cart"}
                >
                  {cartKeys.has(getPaperKey(paper)) ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
                <span className="text-sm text-zinc-900 dark:text-zinc-100 flex-1 min-w-0 truncate">
                  {highlightText(paper.title, searchTrigger, (word) => onWordClick?.(word, paper, globalIdx))}
                </span>
              </div>
            );
          })
        )
        }
      </div>

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
