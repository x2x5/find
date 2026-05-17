import { Sun, Moon } from 'lucide-react';
import SearchBar from '@/components/features/SearchBar';
import { useAppContext } from '@/context/AppContext';

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
}

export default function Header({ searchValue, onSearchChange, onSearch }: HeaderProps) {
  const { theme, toggleTheme, language, toggleLanguage, t } = useAppContext();

  return (
    <header className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
          {t.appTitle}
        </h1>
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          onSearch={onSearch}
        />
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            title={theme === 'dark' ? t.theme.light : t.theme.dark}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={toggleLanguage}
            className="px-2 py-1 text-xs font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            {language === 'zh' ? t.language.en : t.language.zh}
          </button>
        </div>
      </div>
    </header>
  );
}
