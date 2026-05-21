import { useCallback, useRef } from 'react';
import { Search, Sparkles, X } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onGenerateWordCloud: () => void;
  canGenerateWordCloud: boolean;
}

export default function SearchBar({ value, onChange, onGenerateWordCloud, canGenerateWordCloud }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useAppContext();

  const handleClear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  return (
    <div className="flex w-[30rem] max-w-full items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canGenerateWordCloud) {
              e.preventDefault();
              onGenerateWordCloud();
            }
          }}
          placeholder={t.search.placeholder}
          className="w-full pl-9 pr-8 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <button
        onClick={onGenerateWordCloud}
        disabled={!canGenerateWordCloud}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50/90 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-30 dark:border-amber-900/70 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900/80"
      >
        <Sparkles className="h-3.5 w-3.5" />
        {t.wordCloud.generate}
      </button>
    </div>
  );
}
