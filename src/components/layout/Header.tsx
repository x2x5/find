import { useState, useRef, useEffect } from 'react';
import { Settings, Sun, Moon, PanelTopClose, PanelTopOpen } from 'lucide-react';
import SearchBar from '@/components/features/SearchBar';
import { useAppContext } from '@/context/AppContext';

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onGenerateWordCloud: () => void;
  canGenerateWordCloud: boolean;
  showTimeline: boolean;
  onToggleTimeline: () => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
}

export default function Header(props: HeaderProps) {
  const { searchValue, onSearchChange, onGenerateWordCloud, canGenerateWordCloud, showTimeline, onToggleTimeline, pageSize, onPageSizeChange } = props;
  const { theme, toggleTheme, language, toggleLanguage, t } = useAppContext();
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

  return (
    <header className="sticky top-0 z-50">
      <div className="max-w-[1560px] mx-auto px-4">
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-1 py-1 md:gap-4 md:py-1 lg:grid lg:grid-cols-[216px_minmax(0,1fr)_264px] lg:gap-4 lg:py-1">
          <a
            href="/"
            className="shrink-0 flex items-center"
            aria-label="淘顶网"
          >
            <img
              src={`${import.meta.env.BASE_URL}icon.webp`}
              alt="淘顶网"
              className="h-12 w-auto object-contain md:h-14"
            />
          </a>
          <div className="flex min-w-0 flex-1 items-center gap-2 lg:flex">
            <SearchBar
              value={searchValue}
              onChange={onSearchChange}
              onGenerateWordCloud={onGenerateWordCloud}
              canGenerateWordCloud={canGenerateWordCloud}
            />
            <button
              onClick={onToggleTimeline}
              className="shrink-0 p-2 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:hover:text-emerald-200"
              title={t.sidebar.timeline}
            >
              {showTimeline ? <PanelTopClose className="w-5 h-5" /> : <PanelTopOpen className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex items-center gap-2 shrink-0 lg:justify-end">
            <div className="relative" ref={settingsRef}>
              <button onClick={() => setSettingsOpen(!settingsOpen)} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-indigo-100 text-indigo-600 hover:bg-indigo-200 hover:text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 dark:hover:bg-indigo-900 dark:hover:text-indigo-300 active:scale-90 transition-all">
                <Settings className="w-5 h-5" />
              </button>
              {settingsOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-4 space-y-4 z-50">
                  <div className="border-t-0 flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{t.theme.light} / {t.theme.dark}</span>
                    <button onClick={toggleTheme} className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700">
                      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{t.language.label}</span>
                    <button onClick={toggleLanguage} className="text-sm px-3 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-medium">
                      {language === 'zh' ? 'EN' : '中'}
                    </button>
                  </div>
                  {onPageSizeChange && (
                    <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{t.common.perPage}</span>
                      <div className="flex items-center gap-1">
                        {[10, 50, 100].map((size) => (
                          <button
                            key={size}
                            onClick={() => onPageSizeChange(size)}
                            className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${
                              pageSize === size
                                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
