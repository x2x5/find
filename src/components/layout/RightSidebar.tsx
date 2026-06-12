import VerticalTimeline from "@/components/features/VerticalTimeline";

interface RightSidebarProps {
  showTimeline: boolean;
}

export default function RightSidebar({ showTimeline }: RightSidebarProps) {
  return (
    <aside className="self-start flex flex-col gap-3">
      {showTimeline && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 overflow-hidden">
          <VerticalTimeline />
        </div>
      )}
    </aside>
  );
}
