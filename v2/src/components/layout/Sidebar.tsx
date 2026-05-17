import FieldFilter from '@/components/features/FieldFilter';
import type { Manifest } from '@/types';

interface SidebarProps {
  manifest: Manifest | null;
  selectedConfs: Set<string>;
  onToggleConf: (conf: string) => void;
}

export default function Sidebar({
  manifest: _manifest,
  selectedConfs,
  onToggleConf,
}: SidebarProps) {
  return (
    <aside className="space-y-4">
      <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <FieldFilter
          selectedConfs={selectedConfs}
          onToggleConf={onToggleConf}
        />
      </div>
    </aside>
  );
}
