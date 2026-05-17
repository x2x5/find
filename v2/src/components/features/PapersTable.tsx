export default function PapersTable() {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Papers
        </h2>
        <span className="text-xs text-zinc-500">0 results</span>
      </div>
      <div className="p-8 text-center text-sm text-zinc-500">
        Papers table placeholder — data will load here
      </div>
    </div>
  );
}
