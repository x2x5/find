import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import type { Paper } from '@/types';
import { AppProvider } from './context/AppContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import RightSidebar from './components/layout/RightSidebar';
import Timeline from './components/features/Timeline';
import PapersTable from './components/features/PapersTable';
import Toast from './components/ui/Toast';
import IssueDialog from './components/ui/IssueDialog';
import { Skeleton } from './components/ui/Skeleton';
import { useManifest } from './hooks/useManifest';
import { usePapers } from './hooks/usePapers';
import { getPaperKey } from './lib/utils';
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
  const pageSize = 10;
  const [showTimeline, setShowTimeline] = useState(false);
  const [cart, setCart] = useState<Paper[]>([]);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [pinnedPaper, setPinnedPaper] = useState<{ key: string; position: number } | null>(null);
  const [issueDialogType, setIssueDialogType] = useState<'feature' | 'bug' | 'chitchat' | null>(null);
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [searchCount, setSearchCount] = useState<number | null>(null);
  const visitFetched = useRef(false);
  const searchFetched = useRef(false);

  useEffect(() => {
    if (visitFetched.current) return;
    visitFetched.current = true;
    fetch('https://abacus.jasoncameron.dev/hit/x2x5-top-find/visits')
      .then((res) => res.json())
      .then((data) => setVisitCount(data.value))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchFetched.current) return;
    searchFetched.current = true;
    fetch('https://abacus.jasoncameron.dev/get/x2x5-top-find/searches')
      .then((res) => res.json())
      .then((data) => setSearchCount(data.value ?? 0))
      .catch(() => {});
  }, []);

  const incrementSearchCount = useCallback(() => {
    fetch('https://abacus.jasoncameron.dev/hit/x2x5-top-find/searches')
      .then((res) => res.json())
      .then((data) => setSearchCount(data.value))
      .catch(() => {});
  }, []);

  const { papers: loadedPapers, loading: papersLoading, error: papersError } = usePapers(
    selectedConfs,
    yearRange,
    manifest
  );

  const filteredPapers = useMemo(() => {
    return filterPapers(loadedPapers, searchValue, yearRange, selectedConfs);
  }, [loadedPapers, searchValue, yearRange, selectedConfs]);

  const shuffledPapers = useMemo(() => {
    const result = shuffle(filteredPapers);
    if (pinnedPaper) {
      const idx = result.findIndex((p) => getPaperKey(p) === pinnedPaper.key);
      if (idx !== -1) {
        const [paper] = result.splice(idx, 1);
        const insertAt = Math.min(pinnedPaper.position, result.length);
        result.splice(insertAt, 0, paper);
      }
    }
    return result;
  }, [filteredPapers, pinnedPaper]);

  const luckyPaper = useMemo(() => {
    if (filteredPapers.length === 0) return null;
    const idx = Math.floor(Math.random() * filteredPapers.length);
    return filteredPapers[idx];
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

  const handleToggleCart = useCallback((paper: Paper) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.title === paper.title && p.conference === paper.conference && p.year === paper.year);
      if (idx !== -1) {
        return prev.filter((_, i) => i !== idx);
      }
      return [...prev, paper];
    });
  }, []);

  const handleRemoveFromCart = useCallback((idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleCopyCart = useCallback(async () => {
    const text = cart.map((p) => `${p.conference.toUpperCase()} ${p.year} ${p.title}`).join('\n');
    try { await navigator.clipboard.writeText(text); showToast(`Copied ${cart.length} titles`); } catch {}
  }, [cart, showToast]);

  const handleClearCart = useCallback(() => setCart([]), []);

  const handleWordClick = useCallback((word: string, _paper: Paper, globalIdx: number) => {
    setSearchValue((prev) => {
      const words = prev ? prev.trim().split(/\s+/) : [];
      const lower = word.toLowerCase();
      const idx = words.findIndex((w) => w.toLowerCase() === lower);
      if (idx !== -1) {
        words.splice(idx, 1);
        return words.join(' ');
      }
      return prev ? prev + ' ' + word : word;
    });
    setPinnedPaper({ key: getPaperKey(_paper), position: globalIdx });
    incrementSearchCount();
  }, [incrementSearchCount]);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
      <Header
        searchValue={searchValue}
        onSearchChange={(value) => {
          setSearchValue(value);
          setPinnedPaper(null);
        }}
        totalCount={filteredPapers.length}
        luckyPaper={luckyPaper}
        manifest={manifest}
        yearRange={yearRange}
        onYearChange={handleYearChange}
      />

      {showTimeline && <Timeline />}

      <main className="max-w-[1560px] mx-auto px-4 pt-2 pb-0 grid grid-cols-1 lg:grid-cols-[216px_minmax(0,1fr)_264px] lg:grid-rows-1 gap-4 lg:items-start">
        <Sidebar
          manifest={manifest}
          papers={filteredPapers}
          selectedConfs={selectedConfs}
          onToggleConf={handleToggleConf}
        />

        <section className="space-y-3 min-w-0 min-h-[calc(100vh-5rem)]">
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
            <PapersTable papers={shuffledPapers} pageSize={pageSize} searchTrigger={searchValue} onShowToast={showToast} cart={cart} onToggleCart={handleToggleCart} onWordClick={handleWordClick} />
          )}
        </section>

        <RightSidebar
          showTimeline={showTimeline}
          onToggleTimeline={() => setShowTimeline((v) => !v)}
          paperCount={filteredPapers.length}
          tableReady={!combinedLoading && !combinedError}
          cart={cart}
          onRemoveFromCart={handleRemoveFromCart}
          onCopyCart={handleCopyCart}
          onClearCart={handleClearCart}
          onShowToast={showToast}
        />
      </main>

      <footer className="max-w-[1560px] mx-auto mt-4 px-4 py-2 text-xs text-zinc-400 dark:text-zinc-500">
        <div className="pt-2 grid grid-cols-3 items-center">
          <div className="flex flex-col gap-0.5">
            <span>当前访问量: {visitCount != null ? visitCount.toLocaleString() : '···'}</span>
            <span>搜索次数: {searchCount != null ? searchCount.toLocaleString() : '···'}</span>
          </div>
          <span className="text-center">
            <a href="about.html" className="hover:text-indigo-500">淘顶网 · 淘点顶会</a>
          </span>
          <span className="text-right space-x-1.5">
            <button onClick={() => setIssueDialogType('feature')} className="hover:text-emerald-600 text-emerald-500">加个新功能</button>
            <button onClick={() => setIssueDialogType('bug')} className="hover:text-red-600 text-red-500">发现 Bug！</button>
            <button onClick={() => setIssueDialogType('chitchat')} className="hover:text-indigo-500 text-indigo-400">说点没用的</button>
          </span>
        </div>
      </footer>

      <IssueDialog
        key={issueDialogType}
        type={issueDialogType}
        onClose={() => setIssueDialogType(null)}
      />
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
