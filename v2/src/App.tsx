export default function App() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="text-sm text-zinc-500">Header placeholder</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <aside className="space-y-4">
          <div className="text-sm text-zinc-500">Sidebar placeholder</div>
        </aside>

        <section>
          <div className="text-sm text-zinc-500">Papers placeholder</div>
        </section>
      </main>
    </div>
  );
}
