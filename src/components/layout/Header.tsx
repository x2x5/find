import { Sun, Moon } from "lucide-react";
import SearchBar from "@/components/features/SearchBar";
import DeadlineCountdown from "@/components/features/DeadlineCountdown";
import { useAppContext } from "@/context/AppContext";

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onGenerateWordCloud: () => void;
  canGenerateWordCloud: boolean;
  compact?: boolean;
}

export default function Header(props: HeaderProps) {
  const {
    searchValue,
    onSearchChange,
    onGenerateWordCloud,
    canGenerateWordCloud,
    compact,
  } = props;
  const { theme, toggleTheme, language, toggleLanguage } = useAppContext();

  return (
    <header className="sticky top-0 z-50 pt-2 sm:pt-0">
      <div className="max-w-[1560px] mx-auto px-4">
        <div className="flex items-center gap-3 bg-transparent py-1 md:gap-4 md:py-1 lg:grid lg:grid-cols-[260px_minmax(0,1fr)_216px] lg:gap-4 lg:bg-white lg:dark:bg-zinc-900 lg:py-1 lg:border lg:border-zinc-200 lg:dark:border-zinc-800 lg:rounded-lg lg:shadow-sm">
          <div className="hidden lg:flex items-center min-w-0">
            <DeadlineCountdown compact />
          </div>
          <div
            className={`flex min-w-0 flex-1 items-center gap-2 lg:ml-6 ${compact ? "hidden lg:flex" : ""}`}
          >
            <SearchBar
              value={searchValue}
              onChange={onSearchChange}
              onGenerateWordCloud={onGenerateWordCloud}
              canGenerateWordCloud={canGenerateWordCloud}
            />
          </div>
          <div className="hidden lg:flex items-center gap-2 shrink-0 lg:justify-end">
            <button
              onClick={toggleTheme}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-indigo-100 text-indigo-600 hover:bg-indigo-200 hover:text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 dark:hover:bg-indigo-900 dark:hover:text-indigo-300 active:scale-90 transition-all"
              title={theme === "dark" ? "浅色" : "深色"}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={toggleLanguage}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 text-emerald-600 hover:bg-emerald-200 hover:text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 dark:hover:bg-emerald-900 dark:hover:text-emerald-300 active:scale-90 transition-all text-sm font-bold mr-2"
              title={language === "zh" ? "English" : "中文"}
            >
              {language === "zh" ? "EN" : "中"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
