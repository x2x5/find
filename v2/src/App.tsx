import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import PapersTable from './components/features/PapersTable';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <Sidebar />

        <section>
          <PapersTable />
        </section>
      </main>
    </div>
  );
}
