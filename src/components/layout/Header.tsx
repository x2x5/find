import { useState, useRef, useEffect, useCallback } from 'react';
import { Settings, Sun, Moon, PanelTopClose, PanelTopOpen, Eye } from 'lucide-react';
import SearchBar from '@/components/features/SearchBar';
import { useAppContext } from '@/context/AppContext';
import { CONFERENCE_FIELDS } from '@/lib/conferences';
import type { Paper } from '@/types';

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  displayPaper: Paper | null;
  onTitleWordClick: (word: string) => void;
  showTimeline: boolean;
  onToggleTimeline: () => void;
}

const FIELD_TEXT_COLORS: Record<string, string> = {
  ML: 'text-violet-700 dark:text-violet-300',
  CV: 'text-blue-700 dark:text-blue-300',
  AI: 'text-emerald-700 dark:text-emerald-300',
};

function ClickableInlineTitle({
  title,
  onWordClick,
  colorClass,
}: {
  title: string;
  onWordClick: (word: string) => void;
  colorClass: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    const node = containerRef.current;
    if (!node || node.scrollWidth <= node.clientWidth) return;
    event.preventDefault();
    node.scrollLeft += event.deltaY + event.deltaX;
  }, []);

  const tokens = title.split(/(\s+)/).flatMap((token) => {
    if (!token.trim()) return [token];
    return token.split(/(-)/).filter(Boolean);
  });

  return (
    <div
      ref={containerRef}
      className="flex min-w-0 max-w-[26rem] overflow-x-auto overflow-y-hidden whitespace-nowrap py-0.5 pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:max-w-[58rem]"
      onWheel={handleWheel}
      title={title}
    >
      <span className={`inline-block min-w-max text-base font-semibold ${colorClass}`}>
        {tokens.map((token, index) => {
          if (!token.trim() || token === '-') {
            return <span key={index}>{token}</span>;
          }
          const cleanWord = token.replace(/[^a-zA-Z0-9一-鿿]/g, '');
          if (!cleanWord) {
            return <span key={index}>{token}</span>;
          }
          return (
            <span
              key={index}
              onClick={(event) => {
                event.stopPropagation();
                onWordClick(cleanWord);
              }}
              className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
            >
              {token}
            </span>
          );
        })}
      </span>
    </div>
  );
}

export default function Header(props: HeaderProps) {
  const { searchValue, onSearchChange, displayPaper, onTitleWordClick, showTimeline, onToggleTimeline } = props;
  const { theme, toggleTheme, language, toggleLanguage, t } = useAppContext();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const displayColorClass = displayPaper
    ? (FIELD_TEXT_COLORS[CONFERENCE_FIELDS[displayPaper.conference] || 'ML'] || FIELD_TEXT_COLORS.ML)
    : 'text-zinc-500 dark:text-zinc-300';

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
    <header className="sticky top-0 z-50 max-w-[1560px] mx-auto px-4">
      <div className="py-2 flex flex-col gap-2 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 md:flex-row md:items-center md:gap-4 md:py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            onClick={onToggleTimeline}
            className="shrink-0 p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:hover:text-emerald-200"
            title={t.sidebar.timeline}
          >
            {showTimeline ? <PanelTopClose className="w-4 h-4" /> : <PanelTopOpen className="w-4 h-4" />}
          </button>
          <SearchBar value={searchValue} onChange={onSearchChange} />
          {displayPaper && (
            <div className="flex min-w-0 flex-1 items-end gap-2 pr-2">
              <span className="shrink-0 text-amber-500 dark:text-amber-300">
                <Eye className="h-4 w-4" />
              </span>
              <ClickableInlineTitle title={displayPaper.title} onWordClick={onTitleWordClick} colorClass={displayColorClass} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
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
                  <span className="text-[10px] text-zinc-400">{t.language.label}</span>
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
