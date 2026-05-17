import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import type { Paper } from '@/types';
import { CONFERENCE_FIELDS } from '@/lib/conferences';
import { useAppContext } from '@/context/AppContext';
import Pagination from './Pagination';

interface PapersTableProps {
  papers?: Paper[];
  pageSize?: number;
  onShowToast?: (message: string) => void;
}

const FIELD_COLORS: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  CV: { bg: 'bg-blue-100', text: 'text-blue-700', darkBg: 'dark:bg-blue-950', darkText: 'dark:text-blue-300' },
  AI: { bg: 'bg-amber-100', text: 'text-amber-700', darkBg: 'dark:bg-amber-950', darkText: 'dark:text-amber-300' },
  ML: { bg: 'bg-emerald-100', text: 'text-emerald-700', darkBg: 'dark:bg-emerald-950', darkText: 'dark:text-emerald-300' },
};

export default function PapersTable({ papers = [], pageSize = 50, onShowToast }: PapersTableProps) {
  const { t } = useAppContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const totalPages = Math.max(1, Math.ceil(papers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const pagePapers = papers.slice(startIdx, startIdx + pageSize);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCopy = useCallback(async (title: string, index: number) => {
    try {
      await navigator.clipboard.writeText(title);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
      onShowToast?.('Copied to clipboard');
    } catch {
      // ignore
    }
  }, [onShowToast]);

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
    const MAX = 200;
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
    <div className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {t.table.title}
        </h2>
        <div className="flex items-center gap-2">
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
          <span className="text-xs text-zinc-500">
            {papers.length} {t.table.results}
            {papers.length > 0 && ` (${t.table.showing} ${startIdx + 1}-${Math.min(startIdx + pageSize, papers.length)})`}
          </span>
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
                className="px-4 py-2.5 flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group"
              >
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText}`}>
                  {paper.conference.toUpperCase()}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 tabular-nums">
                  {paper.year}
                </span>
                <span className="text-sm text-zinc-900 dark:text-zinc-100 flex-1 truncate">
                  {paper.title}
                </span>
                <button
                  onClick={() => handleCopy(paper.title, globalIdx)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all"
                  title="Copy title"
                >
                  {copiedIndex === globalIdx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
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
