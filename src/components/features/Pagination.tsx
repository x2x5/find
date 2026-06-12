import { ChevronLeft, ChevronRight, ChevronsLeft } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
}: PaginationProps) {
  const { t } = useAppContext();
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center px-4 py-4 border-t border-zinc-200 dark:border-zinc-800 gap-4">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage <= 1}
        className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title={t.pagination.firstPage}
      >
        <ChevronsLeft className="w-4 h-4" />
        {t.pagination.firstPage}
      </button>

      <div className="flex items-center justify-center gap-3">
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

      {onPageSizeChange && (
        <div className="flex items-center gap-1.5 justify-end">
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {t.common.perPage}
          </span>
          {[10, 50, 100].map((size) => (
            <button
              key={size}
              onClick={() => onPageSizeChange(size)}
              className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${
                pageSize === size
                  ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
