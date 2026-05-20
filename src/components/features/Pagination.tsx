import { ChevronLeft, ChevronRight, ChevronsLeft } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-center px-4 py-3 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-indigo-400 hover:text-indigo-600 dark:text-indigo-300 disabled:opacity-20"
          title="首页"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-indigo-400 hover:text-indigo-600 dark:text-indigo-300 disabled:opacity-20"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm text-zinc-500 dark:text-zinc-400 px-1">
          {currentPage}/{totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-indigo-400 hover:text-indigo-600 dark:text-indigo-300 disabled:opacity-20"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
