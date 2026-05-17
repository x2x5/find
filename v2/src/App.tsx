import { useMemo, useState, useCallback } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import PapersTable from './components/features/PapersTable';
import { useManifest } from './hooks/useManifest';
import { usePapers } from './hooks/usePapers';
import { filterPapers } from './lib/search';
import { shuffle } from './lib/shuffle';

export default function App() {
  const { manifest, loading: manifestLoading, error: manifestError } = useManifest();

  const [selectedConfs, setSelectedConfs] = useState<Set<string>>(
    () => new Set(['nips', 'icml', 'iclr', 'cvpr', 'eccv', 'iccv'])
  );
  const [yearRange, setYearRange] = useState<[number, number]>([2024, 2025]);
  const [searchValue, setSearchValue] = useState('');
  const [searchTrigger, setSearchTrigger] = useState('');

  const { papers: loadedPapers, loading: papersLoading, error: papersError } = usePapers(
    selectedConfs,
    yearRange,
    manifest
  );

  const filteredPapers = useMemo(() => {
    return filterPapers(loadedPapers, searchTrigger, yearRange, selectedConfs);
  }, [loadedPapers, searchTrigger, yearRange, selectedConfs]);

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

  const handleSearch = useCallback(() => {
    setSearchTrigger(searchValue);
  }, [searchValue]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
      <Header
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearch={handleSearch}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <Sidebar
          manifest={manifest}
          selectedConfs={selectedConfs}
          onToggleConf={handleToggleConf}
          yearRange={yearRange}
          onYearChange={handleYearChange}
        />

        <section className="space-y-4">
          {combinedLoading && (
            <div className="p-4 text-sm text-zinc-500">Loading data...</div>
          )}

          {combinedError && (
            <div className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 text-sm text-red-700 dark:text-red-300">
              Error: {combinedError.message}
            </div>
          )}

          {!combinedLoading && !combinedError && (
            <PapersTable papers={shuffledPapers} />
          )}
        </section>
      </main>
    </div>
  );
}
