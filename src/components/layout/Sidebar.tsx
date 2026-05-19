import Distributions from '@/components/features/Distributions';
import YearDistribution from '@/components/features/YearDistribution';
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
    <aside className="lg:sticky lg:top-[3.5rem] self-start flex flex-col gap-3">
      <div className="shrink-0 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <Distributions
          papers={papers}
          selectedConfs={selectedConfs}
          onToggleConf={onToggleConf}
        />
      </div>
      <div className="shrink-0">
        <YearDistribution papers={papers} />
      </div>
    </aside>
  );
}
