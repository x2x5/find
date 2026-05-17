import { useMemo, useState, useCallback } from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Timeline from './components/features/Timeline';
import PapersTable from './components/features/PapersTable';
import Toast from './components/ui/Toast';
import { Skeleton } from './components/ui/Skeleton';
import { useManifest } from './hooks/useManifest';
import { usePapers } from './hooks/usePapers';
import { filterPapers } from './lib/search';
import { shuffle } from './lib/shuffle';

function AppContent() {
  const { manifest, loading: manifestLoading, error: manifestError } = useManifest();
  const defaultYear = new Date().getFullYear();

  const [selectedConfs, setSelectedConfs] = useState<Set<string>>(
    () => new Set(['nips', 'icml', 'iclr', 'cvpr', 'eccv', 'iccv'])
  );
  const [yearRange, setYearRange] = useState<[number, number]>([defaultYear - 1, defaultYear]);
  const [searchValue, setSearchValue] = useState('');
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const { papers: loadedPapers, loading: papersLoading, error: papersError } = usePapers(
    selectedConfs,
    yearRange,
    manifest
  );

  const filteredPapers = useMemo(() => {
    return filterPapers(loadedPapers, searchValue, yearRange, selectedConfs);
  }, [loadedPapers, searchValue, yearRange, selectedConfs]);

  const shuffledPapers = useMemo(() => {
    return shuffle(filteredPapers);
  }, [filteredPapers]);

  const combinedLoading = manifestLoading || papersLoading;
  const combinedError = manifestError || papersError;

  const handleToggleConf = useCallback((conf: string) => {
    setSelectedConfs((prev) => {
      const next = new Set(prev);
      if (next.has(conf)) next.delete(conf);
      else next.add(conf);
      return next;
    });
  }, []);

  const handleYearChange = useCallback((range: [number, number]) => {
    setYearRange(range);
  }, []);

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
      <Header
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        resultCount={filteredPapers.length}
        manifest={manifest}
        yearRange={yearRange}
        onYearChange={handleYearChange}
      />

      <Timeline />

      <main className="max-w-7xl mx-auto px-4 pt-0 pb-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <Sidebar
          manifest={manifest}
          selectedConfs={selectedConfs}
          onToggleConf={handleToggleConf}
        />

        <section className="space-y-4 min-w-0">
          {combinedLoading && (
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                    <Skeleton className="h-5 w-12 rounded" />
                    <Skeleton className="h-5 w-10 rounded" />
                    <Skeleton className="h-4 flex-1 rounded" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {combinedError && (
            <div className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 text-sm text-red-700 dark:text-red-300">
              Error: {combinedError.message}
            </div>
          )}

          {!combinedLoading && !combinedError && (
            <PapersTable papers={shuffledPapers} searchTrigger={searchValue} onShowToast={showToast} />
          )}
        </section>
      </main>

      <Toast
        message={toast.message}
        visible={toast.visible}
        onClose={hideToast}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
