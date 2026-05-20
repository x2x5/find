import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Undo2, Settings, Sun, Moon } from 'lucide-react';
import SearchBar from '@/components/features/SearchBar';
import { useAppContext } from '@/context/AppContext';
import type { Manifest, Paper } from '@/types';

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  totalCount: number;
  luckyPaper: Paper | null;
  manifest: Manifest | null;
  yearRange: [number, number];
  onYearChange: (range: [number, number]) => void;
}

function DraggableInlineTitle({ title }: { title: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({ active: false, startX: 0, startScrollLeft: 0, moved: false });
  const [dragging, setDragging] = useState(false);

  const handleWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    const node = containerRef.current;
    if (!node || node.scrollWidth <= node.clientWidth) return;
    event.preventDefault();
    node.scrollLeft += event.deltaY + event.deltaX;
  }, []);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const node = containerRef.current;
    if (!node || node.scrollWidth <= node.clientWidth) return;
    dragStateRef.current = {
      active: true,
      startX: event.clientX,
      startScrollLeft: node.scrollLeft,
      moved: false,
    };
    node.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const node = containerRef.current;
    const drag = dragStateRef.current;
    if (!node || !drag.active) return;
    const deltaX = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(deltaX) > 6) {
      drag.moved = true;
      setDragging(true);
    }
    if (!drag.moved) return;
    event.preventDefault();
    node.scrollLeft = drag.startScrollLeft - deltaX;
  }, []);

  const endDrag = useCallback((event?: React.PointerEvent<HTMLDivElement>) => {
    const node = containerRef.current;
    if (event && node?.hasPointerCapture(event.pointerId)) {
      node.releasePointerCapture(event.pointerId);
    }
    dragStateRef.current.active = false;
    dragStateRef.current.moved = false;
    setDragging(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`flex min-w-0 max-w-[15rem] overflow-x-auto overflow-y-hidden whitespace-nowrap py-0.5 pr-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:max-w-[35rem] ${dragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      title={title}
    >
      <span className="inline-block min-w-max text-base font-semibold text-amber-600 dark:text-amber-300">
        {title}
      </span>
    </div>
  );
}

export default function Header(props: HeaderProps) {
  const { searchValue, onSearchChange, totalCount, luckyPaper, manifest, yearRange, onYearChange } = props;
  const { theme, toggleTheme, language, toggleLanguage, t } = useAppContext();
  const [startYear, endYear] = yearRange;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    if (settingsOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [settingsOpen]);

  const { minYear, maxYear } = useMemo(() => {
    if (!manifest) return { minYear: 2000, maxYear: 2030 };
    const years = new Set<number>();
    for (const conf of Object.values(manifest.conferences)) {
      for (const y of Object.keys(conf.years)) {
        years.add(parseInt(y, 10));
      }
    }
    const arr = Array.from(years);
    return { minYear: Math.min(...arr), maxYear: Math.max(...arr) };
  }, [manifest]);

  const adjustStart = (delta: number) => {
    const next = startYear + delta;
    if (next < minYear || next > endYear) return;
    onYearChange([next, endYear]);
  };

  const adjustEnd = (delta: number) => {
    const next = endYear + delta;
    if (next < startYear || next > maxYear) return;
    onYearChange([startYear, next]);
  };

  const setRecent = () => {
    const recentStart = Math.max(minYear, maxYear - 1);
    onYearChange([recentStart, maxYear]);
  };

  return (
    <header className="sticky top-0 z-50 max-w-[1560px] mx-auto px-4">
      <div className="py-2 flex flex-col gap-2 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 md:flex-row md:items-center md:gap-4 md:py-3">
        <div className="flex items-center gap-2">
          <div className="flex items-end gap-1.5 shrink-0 w-[7.5rem]">
            <span className="text-[10px] font-semibold tracking-[0.22em] text-zinc-400 dark:text-zinc-500">
              FOUND
            </span>
            <span className="w-[6ch] text-center text-base font-semibold text-amber-600 dark:text-amber-300 tabular-nums leading-none">
              {totalCount}
            </span>
          </div>
          <SearchBar value={searchValue} onChange={onSearchChange} />
          {luckyPaper && (
            <div className="flex items-end gap-2 min-w-0">
              <span className="text-[10px] font-semibold tracking-[0.22em] text-zinc-400 dark:text-zinc-500 shrink-0">
                {t.subtitle}
              </span>
              {searchValue.trim() ? (
                <>
                  {(() => {
                    return (
                      <>
                        <DraggableInlineTitle title={luckyPaper.title} />
                      </>
                    );
                  })()}
                </>
              ) : null}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0 md:ml-auto">
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => adjustStart(-1)} disabled={startYear <= minYear} className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:hover:text-emerald-200 disabled:opacity-20">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium tabular-nums">{startYear}</span>
            <button onClick={() => adjustStart(1)} disabled={startYear >= endYear} className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:hover:text-emerald-200 disabled:opacity-20">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={setRecent} className="p-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-500 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 dark:text-amber-400 dark:hover:text-amber-200" title={t.sidebar.recent2y}>
              <Undo2 className="w-4 h-4" />
            </button>
            <button onClick={() => adjustEnd(-1)} disabled={endYear <= startYear} className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:hover:text-emerald-200 disabled:opacity-20">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium tabular-nums">{endYear}</span>
            <button onClick={() => adjustEnd(1)} disabled={endYear >= maxYear} className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:hover:text-emerald-200 disabled:opacity-20">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="relative" ref={settingsRef}>
            <button onClick={() => setSettingsOpen(!settingsOpen)} className="p-1.5 rounded-md bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700">
              <Settings className="w-4 h-4" />
            </button>
            {settingsOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-3 space-y-3 z-50">
                <div className="border-t-0 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400">{t.theme.light}/{t.theme.dark}</span>
                  <button onClick={toggleTheme} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
                    {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400">语言</span>
                  <button onClick={toggleLanguage} className="text-xs px-2 py-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
                    {language === 'zh' ? 'EN' : '中'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
