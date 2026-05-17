import Distributions from '@/components/features/Distributions';
import type { Manifest, Paper } from '@/types';

interface SidebarProps {
  manifest: Manifest | null;
  papers: Paper[];
  selectedConfs: Set<string>;
  onToggleConf: (conf: string) => void;
}

export default function Sidebar({
  manifest: _manifest,
  papers,
  selectedConfs,
  onToggleConf,
}: SidebarProps) {
  return (
    <aside className="space-y-4">
      <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <Distributions
          papers={papers}
          selectedConfs={selectedConfs}
          onToggleConf={onToggleConf}
        />
      </div>
    </aside>
  );
}
