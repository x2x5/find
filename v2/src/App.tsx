import { useMemo, useState, useCallback } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import PapersTable from './components/features/PapersTable';
import { useManifest } from './hooks/useManifest';
import { usePapers } from './hooks/usePapers';

export default function App() {
  const { manifest, loading: manifestLoading, error: manifestError } = useManifest();

  const [selectedConfs, setSelectedConfs] = useState<Set<string>>(
    () => new Set(['nips', 'icml', 'iclr', 'cvpr', 'eccv', 'iccv'])
  );
  const [yearRange, setYearRange] = useState<[number, number]>([2024, 2025]);

  const { papers, loading: papersLoading, error: papersError } = usePapers(
    selectedConfs,
    yearRange,
    manifest
  );

  const combinedLoading = manifestLoading || papersLoading;
  const combinedError = manifestError || papersError;

  const yearOptions = useMemo(() => {
    if (!manifest) return [];
    const years = new Set<number>();
    for (const conf of Object.values(manifest.conferences)) {
      for (const y of Object.keys(conf.years)) {
        years.add(parseInt(y, 10));
      }
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [manifest]);

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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <Sidebar
          manifest={manifest}
          selectedConfs={selectedConfs}
          onToggleConf={handleToggleConf}
          yearRange={yearRange}
          onYearChange={handleYearChange}
        />

        <section className="space-y-4">
          {manifest && (
            <div className="p-4 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 text-sm">
              <p className="font-medium text-indigo-900 dark:text-indigo-100">
                Phase 3+4 验证
              </p>
              <p className="text-indigo-700 dark:text-indigo-300">
                Selected: {selectedConfs.size} conferences × {yearRange[0]}-{yearRange[1]}
              </p>
              <p className="text-indigo-700 dark:text-indigo-300">
                Papers loaded: {papers.length}
              </p>
              <p className="text-indigo-700 dark:text-indigo-300">
                Available years: {yearOptions.join(', ')}
              </p>
            </div>
          )}

          {combinedLoading && (
            <div className="p-4 text-sm text-zinc-500">Loading data...</div>
          )}

          {combinedError && (
            <div className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 text-sm text-red-700 dark:text-red-300">
              Error: {combinedError.message}
            </div>
          )}

          <PapersTable papers={papers.slice(0, 10)} />
        </section>
      </main>
    </div>
  );
}
