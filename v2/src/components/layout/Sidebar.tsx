import FieldFilter from '@/components/features/FieldFilter';
import YearStepper from '@/components/features/YearStepper';
import Timeline from '@/components/features/Timeline';
import { useAppContext } from '@/context/AppContext';
import type { Manifest } from '@/types';

interface SidebarProps {
  manifest: Manifest | null;
  selectedConfs: Set<string>;
  onToggleConf: (conf: string) => void;
  yearRange: [number, number];
  onYearChange: (range: [number, number]) => void;
}

export default function Sidebar({
  manifest,
  selectedConfs,
  onToggleConf,
  yearRange,
  onYearChange,
}: SidebarProps) {
  const { t } = useAppContext();

  return (
    <aside className="space-y-4">
      <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
          {t.sidebar.timeline}
        </h2>
        <Timeline />
      </div>

      <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
          {t.sidebar.filters}
        </h2>
        <FieldFilter
          manifest={manifest}
          selectedConfs={selectedConfs}
          onToggleConf={onToggleConf}
        />
        <div className="my-3 border-t border-zinc-200 dark:border-zinc-800" />
        <YearStepper
          manifest={manifest}
          yearRange={yearRange}
          onChange={onYearChange}
        />
      </div>
    </aside>
  );
}
