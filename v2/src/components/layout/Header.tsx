export default function Header() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
          Top AI Papers
        </h1>
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search papers..."
            className="w-full px-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span>Filters</span>
          <span>Theme</span>
        </div>
      </div>
    </header>
  );
}
