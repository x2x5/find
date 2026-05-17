import SearchBar from '@/components/features/SearchBar';

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
}

export default function Header({ searchValue, onSearchChange, onSearch }: HeaderProps) {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
          Top AI Papers
        </h1>
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          onSearch={onSearch}
        />
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span>Filters</span>
          <span>Theme</span>
        </div>
      </div>
    </header>
  );
}
