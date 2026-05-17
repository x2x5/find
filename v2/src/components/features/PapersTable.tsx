import type { Paper } from '@/types';

interface PapersTableProps {
  papers?: Paper[];
}

export default function PapersTable({ papers = [] }: PapersTableProps) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Papers
        </h2>
        <span className="text-xs text-zinc-500">{papers.length} results</span>
      </div>
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {papers.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">
            No papers loaded yet
          </div>
        ) : (
          papers.map((paper, i) => (
            <div
              key={i}
              className="px-4 py-2.5 flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
            >
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {paper.conference.toUpperCase()}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {paper.year}
              </span>
              <span className="text-sm text-zinc-900 dark:text-zinc-100 flex-1 truncate">
                {paper.title}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
