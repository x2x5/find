import { useState, useCallback } from 'react';
import type { Paper } from '@/types';
import { CONFERENCE_FIELDS } from '@/lib/conferences';
import { useAppContext } from '@/context/AppContext';
import Pagination from './Pagination';

interface PapersTableProps {
  papers?: Paper[];
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  searchTrigger?: string;
  onShowToast?: (message: string) => void;
  onAddToCart?: (paper: Paper) => void;
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const words = query.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return text;

  // Escape regex special characters
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escaped = words.map(escapeRegExp);

  // Build regex matching any word, case-insensitive
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(regex);

  if (parts.length <= 1) return text;

  return parts.map((part, i) => {
    if (i % 2 === 0) return part;
    return (
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded-sm px-0.5">
        {part}
      </mark>
    );
  });
}

const FIELD_COLORS: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  CV: { bg: 'bg-blue-100', text: 'text-blue-700', darkBg: 'dark:bg-blue-950', darkText: 'dark:text-blue-300' },
  AI: { bg: 'bg-amber-100', text: 'text-amber-700', darkBg: 'dark:bg-amber-950', darkText: 'dark:text-amber-300' },
  ML: { bg: 'bg-emerald-100', text: 'text-emerald-700', darkBg: 'dark:bg-emerald-950', darkText: 'dark:text-emerald-300' },
};

export default function PapersTable({ papers = [], pageSize = 50, onPageSizeChange, searchTrigger = '', onShowToast, onAddToCart }: PapersTableProps) {
  const { t } = useAppContext();
  const [currentPage, setCurrentPage] = useState(1);

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
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 shrink-0">
          {t.table.title}
        </h2>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-indigo-300 dark:text-indigo-500 mr-0.5">{t.pagination.perPage}</span>
          {[10, 50, 100].map((n) => (
            <button
              key={n}
              onClick={() => onPageSizeChange?.(n)}
              className={`text-xs px-1.5 py-0.5 rounded font-medium tabular-nums transition-colors ${
                pageSize === n
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                  : 'text-indigo-400 hover:text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
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
                <span
                  onClick={() => onAddToCart?.(paper)}
                  className="text-sm text-zinc-900 dark:text-zinc-100 flex-1 min-w-0 truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  title="Add to cart"
                >
                  {highlightText(paper.title, searchTrigger)}
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
