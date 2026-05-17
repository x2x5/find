import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const { t } = useAppContext();
  const [jumpValue, setJumpValue] = useState('');

  const handleJump = useCallback(() => {
    const page = parseInt(jumpValue, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
      setJumpValue('');
    }
  }, [jumpValue, totalPages, onPageChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleJump();
    },
    [handleJump]
  );

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm text-zinc-600 dark:text-zinc-400 px-2">
          {t.pagination.page} <span className="font-medium text-zinc-900 dark:text-zinc-100">{currentPage}</span>{' '}
          {t.pagination.of} <span className="font-medium text-zinc-900 dark:text-zinc-100">{totalPages}</span>
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500">{t.pagination.goTo}</span>
        <input
          type="text"
          inputMode="numeric"
          value={jumpValue}
          onChange={(e) => setJumpValue(e.target.value.replace(/\D/g, ''))}
          onKeyDown={handleKeyDown}
          className="w-12 px-1.5 py-1 text-sm text-center rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          onClick={handleJump}
          className="px-2 py-1 text-xs rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          {t.pagination.go}
        </button>
      </div>
    </div>
  );
}
