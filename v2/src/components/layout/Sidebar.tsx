export default function Sidebar() {
  return (
    <aside className="space-y-4">
      <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
          Timeline
        </h2>
        <div className="text-sm text-zinc-500">
          Conference timeline placeholder
        </div>
      </div>

      <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
          Filters
        </h2>
        <div className="space-y-2">
          <div className="text-sm text-zinc-500">Field: CV / AI / ML</div>
          <div className="text-sm text-zinc-500">Conference list</div>
          <div className="text-sm text-zinc-500">Year range</div>
        </div>
      </div>
    </aside>
  );
}
