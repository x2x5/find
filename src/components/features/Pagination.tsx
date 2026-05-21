import { ChevronLeft, ChevronRight, ChevronsLeft } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const { t } = useAppContext();
  return (
    <div className="flex items-center justify-center px-4 py-4 border-t border-zinc-200 dark:border-zinc-800 gap-3">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage <= 1}
        className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title={t.pagination.firstPage}
      >
        <ChevronsLeft className="w-4 h-4" />
        {t.pagination.firstPage}
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        {t.pagination.prevPage}
      </button>
      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 px-3 py-2 tabular-nums">
        {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        {t.pagination.nextPage}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
