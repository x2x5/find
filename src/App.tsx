import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { SlidersHorizontal, ScrollText, Settings, Sun, Moon, CalendarDays, ArrowUp, Lightbulb, Bug, ChevronRight, Info } from 'lucide-react';
import type { Paper } from '@/types';
import { AppProvider, useAppContext } from './context/AppContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import RightSidebar from './components/layout/RightSidebar';
import Timeline from './components/features/Timeline';
import VerticalTimeline from './components/features/VerticalTimeline';
import PapersTable from './components/features/PapersTable';
import Toast from './components/ui/Toast';
import IssueDialog from './components/ui/IssueDialog';
import WordCloudDialog from './components/ui/WordCloudDialog';
import DeadlineCountdown from './components/features/DeadlineCountdown';
import GitHubTokenSettings from './components/features/GitHubTokenSettings';
import { Skeleton } from './components/ui/Skeleton';
import { useManifest } from './hooks/useManifest';
import { usePapers } from './hooks/usePapers';
import { getPaperKey } from './lib/utils';
import { filterPapers } from './lib/search';
import { shuffle } from './lib/shuffle';

function AppContent() {
  const { t, theme, toggleTheme, language, toggleLanguage } = useAppContext();
  const { manifest, loading: manifestLoading, error: manifestError } = useManifest();
  const defaultYear = new Date().getFullYear();
  const githubTokenStorageKey = 'github_token';
  const returnMobileTabStorageKey = 'return_to_mobile_tab';

  const [selectedConfs, setSelectedConfs] = useState<Set<string>>(
    () => new Set(['nips', 'icml', 'iclr', 'cvpr', 'eccv', 'iccv'])
  );
  const [yearRange, setYearRange] = useState<[number, number]>([defaultYear - 2, defaultYear]);
  const [searchValue, setSearchValue] = useState('');
  const [pageSize, setPageSize] = useState(() => {
    try {
      const stored = localStorage.getItem('page_size');
      if (stored) return parseInt(stored, 10);
    } catch {}
    return 10;
  });
  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    try { localStorage.setItem('page_size', String(size)); } catch {}
  }, []);
  const [showTimeline, setShowTimeline] = useState(false);
  const [cart, setCart] = useState<Paper[]>([]);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [pinnedPaper, setPinnedPaper] = useState<{ key: string; position: number } | null>(null);
  const [issueDialogType, setIssueDialogType] = useState<'feature' | 'bug' | 'chitchat' | null>(null);
  const [mobileTab, setMobileTab] = useState<'papers' | 'filter' | 'timeline' | 'settings'>('papers');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showWordCloud, setShowWordCloud] = useState(false);
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [searchCount, setSearchCount] = useState<number | null>(null);
  const [githubToken, setGithubToken] = useState('');
  const [githubTokenDraft, setGithubTokenDraft] = useState('');
  const [showGithubTokenInput, setShowGithubTokenInput] = useState(false);
  const visitFetched = useRef(false);
  const searchFetched = useRef(false);
  const prevShuffleKeyRef = useRef('');
  const prevShuffledRef = useRef<Paper[]>([]);
  const mobileTabFromHash = useCallback((hash: string) => {
    const tab = hash.replace(/^#/, '');
    if (tab === 'papers' || tab === 'filter' || tab === 'timeline' || tab === 'settings') {
      return tab;
    }
    return null;
  }, []);

  useEffect(() => {
    if (visitFetched.current) return;
    visitFetched.current = true;
    fetch('https://abacus.jasoncameron.dev/hit/x2x5-top-find/visits')
      .then((res) => res.json())
      .then((data) => setVisitCount(data.value))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(githubTokenStorageKey) || '';
    setGithubToken(saved);
    setGithubTokenDraft(saved);
  }, []);

  useEffect(() => {
    const returnTab = localStorage.getItem(returnMobileTabStorageKey);
    if (returnTab === 'settings') {
      setMobileTab('settings');
      localStorage.removeItem(returnMobileTabStorageKey);
    }
  }, []);

  useEffect(() => {
    const applyHash = () => {
      const nextTab = mobileTabFromHash(window.location.hash);
      if (nextTab) setMobileTab(nextTab);
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, [mobileTabFromHash]);

  useEffect(() => {
    const nextHash = `#${mobileTab}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash);
    }
  }, [mobileTab]);

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

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
    const key = filteredPapers.map(getPaperKey).join(',');
    if (key === prevShuffleKeyRef.current && prevShuffledRef.current.length > 0) {
      return prevShuffledRef.current;
    }
    prevShuffleKeyRef.current = key;
    const result = shuffle(filteredPapers);
    if (pinnedPaper) {
      const idx = result.findIndex((p) => getPaperKey(p) === pinnedPaper.key);
      if (idx !== -1) {
        const [paper] = result.splice(idx, 1);
        const insertAt = Math.min(pinnedPaper.position, result.length);
        result.splice(insertAt, 0, paper);
      }
    }
    prevShuffledRef.current = result;
    return result;
  }, [filteredPapers, pinnedPaper]);

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

  const handleSaveGithubToken = useCallback(() => {
    const next = githubTokenDraft.trim();
    localStorage.setItem(githubTokenStorageKey, next);
    setGithubToken(next);
    setShowGithubTokenInput(false);
    showToast(next ? t.cart.tokenSaved : t.cart.tokenCleared);
  }, [githubTokenDraft, showToast, t.cart]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
      <Header
        searchValue={searchValue}
        onSearchChange={(value) => {
          setSearchValue(value);
          setPinnedPaper(null);
        }}
        onGenerateWordCloud={() => setShowWordCloud(true)}
        canGenerateWordCloud={shuffledPapers.length > 0}
        showTimeline={showTimeline}
        onToggleTimeline={() => setShowTimeline((v) => !v)}
        githubToken={githubToken}
        githubTokenDraft={githubTokenDraft}
        showGithubTokenInput={showGithubTokenInput}
        onToggleGithubTokenInput={() => setShowGithubTokenInput((prev) => !prev)}
        onGithubTokenDraftChange={setGithubTokenDraft}
        onSaveGithubToken={handleSaveGithubToken}
        compact={mobileTab === 'timeline' || mobileTab === 'settings'}
      />

      {showTimeline && <Timeline />}

      <main className="max-w-[1560px] mx-auto px-4 pt-2 pb-0 hidden lg:grid lg:grid-cols-[216px_minmax(0,1fr)_264px] lg:grid-rows-1 gap-4 lg:items-start">
        <Sidebar
          manifest={manifest}
          papers={filteredPapers}
          selectedConfs={selectedConfs}
          onToggleConf={handleToggleConf}
          yearRange={yearRange}
          onYearChange={handleYearChange}
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
            <PapersTable papers={shuffledPapers} pageSize={pageSize} onPageSizeChange={handlePageSizeChange} searchTrigger={searchValue} onShowToast={showToast} cart={cart} onToggleCart={handleToggleCart} onWordClick={handleWordClick} />
          )}
        </section>

        <RightSidebar
          paperCount={filteredPapers.length}
          tableReady={!combinedLoading && !combinedError}
          cart={cart}
          onRemoveFromCart={handleRemoveFromCart}
          onCopyCart={handleCopyCart}
          onClearCart={handleClearCart}
          onShowToast={showToast}
          githubToken={githubToken}
        />
      </main>

      {/* 移动端布局 */}
      <div className="lg:hidden">
        <div className="px-4 pt-2 pb-20">
          {mobileTab === 'filter' && (
            <div className="space-y-3">
              <Sidebar
                manifest={manifest}
                papers={filteredPapers}
                selectedConfs={selectedConfs}
                onToggleConf={handleToggleConf}
                yearRange={yearRange}
                onYearChange={handleYearChange}
              />
              <RightSidebar
                paperCount={filteredPapers.length}
                tableReady={!combinedLoading && !combinedError}
                cart={cart}
                onRemoveFromCart={handleRemoveFromCart}
                onCopyCart={handleCopyCart}
                onClearCart={handleClearCart}
                onShowToast={showToast}
                githubToken={githubToken}
                hideCountdown
              />
            </div>
          )}
          {mobileTab === 'papers' && (
            <section className="space-y-3 min-w-0 relative">
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
                <PapersTable papers={shuffledPapers} infiniteScroll searchTrigger={searchValue} onShowToast={showToast} cart={cart} onToggleCart={handleToggleCart} onWordClick={handleWordClick} />
              )}
            </section>
          )}
          {mobileTab === 'timeline' && (
            <div className="space-y-3">
              <DeadlineCountdown />
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
                <VerticalTimeline />
              </div>
            </div>
          )}
          {mobileTab === 'settings' && (
            <div className="space-y-3">
              {/* 主题 */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                <span className="flex-1 text-left text-zinc-700 dark:text-zinc-200">{t.theme.light} / {t.theme.dark}</span>
                <span className="text-xs text-zinc-400">{theme === 'dark' ? t.theme.dark : t.theme.light}</span>
                <ChevronRight className="w-4 h-4 text-zinc-300" />
              </button>

              {/* 语言 */}
              <button
                onClick={toggleLanguage}
                className="w-full flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm"
              >
                <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-emerald-500">A</span>
                <span className="flex-1 text-left text-zinc-700 dark:text-zinc-200">{t.language.label}</span>
                <span className="text-xs text-zinc-400">{language === 'zh' ? '中文' : 'English'}</span>
                <ChevronRight className="w-4 h-4 text-zinc-300" />
              </button>

              <GitHubTokenSettings
                token={githubToken}
                tokenDraft={githubTokenDraft}
                showTokenInput={showGithubTokenInput}
                onToggleInput={() => setShowGithubTokenInput((prev) => !prev)}
                onDraftChange={setGithubTokenDraft}
                onSave={handleSaveGithubToken}
              />

              {/* 反馈区 */}
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <button
                  onClick={() => setIssueDialogType('feature')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm border-b border-zinc-100 dark:border-zinc-800"
                >
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <span className="flex-1 text-left text-zinc-700 dark:text-zinc-200">{t.footer.featureRequest}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-300" />
                </button>
                <button
                  onClick={() => setIssueDialogType('bug')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm border-b border-zinc-100 dark:border-zinc-800"
                >
                  <Bug className="w-5 h-5 text-red-500" />
                  <span className="flex-1 text-left text-zinc-700 dark:text-zinc-200">{t.footer.bugReport}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-300" />
                </button>
              </div>

              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <div className="px-4 py-4 flex justify-center border-b border-zinc-100 dark:border-zinc-800">
                  <img
                    src={`${import.meta.env.BASE_URL}icon.webp`}
                    alt="淘顶网"
                    className="h-16 w-auto object-contain"
                  />
                </div>
                <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400">{t.footer.totalVisits}</span>
                    <span className="font-semibold tabular-nums text-zinc-700 dark:text-zinc-200">{visitCount != null ? visitCount.toLocaleString() : '···'}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400">{t.footer.totalSearches}</span>
                    <span className="font-semibold tabular-nums text-zinc-700 dark:text-zinc-200">{searchCount != null ? searchCount.toLocaleString() : '···'}</span>
                  </div>
                </div>
                <a
                  href="about.html"
                  onClick={() => localStorage.setItem(returnMobileTabStorageKey, 'settings')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm"
                >
                  <Info className="w-5 h-5 text-indigo-500" />
                  <span className="flex-1 text-left text-zinc-700 dark:text-zinc-200">{t.language.about}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-300" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* 回到顶部悬浮按钮 */}
        {showBackToTop && mobileTab === 'papers' && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-20 right-4 z-40 w-10 h-10 rounded-full bg-indigo-500 text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        {/* 底部 Tab 栏 */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center h-14">
            <button
              onClick={() => setMobileTab('papers')}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full text-xs transition-colors ${
                mobileTab === 'papers'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              <ScrollText className="w-5 h-5" />
              <span>{t.mobileTab.papers}</span>
            </button>
            <button
              onClick={() => setMobileTab('filter')}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full text-xs transition-colors ${
                mobileTab === 'filter'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>{t.mobileTab.filter}</span>
            </button>
            <button
              onClick={() => setMobileTab('timeline')}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full text-xs transition-colors ${
                mobileTab === 'timeline'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              <CalendarDays className="w-5 h-5" />
              <span>{t.sidebar.timeline}</span>
            </button>
            <button
              onClick={() => setMobileTab('settings')}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full text-xs transition-colors ${
                mobileTab === 'settings'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>{t.mobileTab.settings || '设置'}</span>
            </button>
          </div>
        </div>
      </div>

      <footer className="hidden lg:block max-w-[1560px] mx-auto mt-4 px-4 py-2 text-xs text-zinc-400 dark:text-zinc-500">
        <div className="pt-2 grid grid-cols-3 items-center">
          <div className="flex flex-col gap-0.5">
            <span>{t.footer.totalVisits}: {visitCount != null ? visitCount.toLocaleString() : '···'}</span>
            <span>{t.footer.totalSearches}: {searchCount != null ? searchCount.toLocaleString() : '···'}</span>
          </div>
          <span className="text-center">
            <a href="about.html" className="hover:text-indigo-500">{t.footer.slogan}</a>
          </span>
          <span className="text-right space-x-1.5">
            <button onClick={() => setIssueDialogType('feature')} className="hover:text-emerald-600 text-emerald-500">{t.footer.featureRequest}</button>
            <button onClick={() => setIssueDialogType('bug')} className="hover:text-red-600 text-red-500">{t.footer.bugReport}</button>
          </span>
        </div>
      </footer>

      <IssueDialog
        key={issueDialogType}
        type={issueDialogType}
        onClose={() => setIssueDialogType(null)}
      />
      <WordCloudDialog
        open={showWordCloud}
        papers={shuffledPapers}
        excludedQuery={searchValue}
        onClose={() => setShowWordCloud(false)}
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
