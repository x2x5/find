import { useMemo, useState, useEffect, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";

const RAW_DATA = [
  { deadline: "01-19", result: "04-29", conference: "IJCAI" },
  { deadline: "01-28", result: "04-30", conference: "ICML" },
  { deadline: "03-05", result: "06-17", conference: "ECCV" },
  { deadline: "03-07", result: "06-25", conference: "ICCV" },
  { deadline: "04-01", result: "07-07", conference: "MM" },
  { deadline: "05-06", result: "09-24", conference: "NeurIPS" },
  { deadline: "08-15", result: "12-09", conference: "AAAI" },
  { deadline: "10-01", result: "01-22", conference: "ICLR" },
  { deadline: "11-15", result: "02-26", conference: "CVPR" },
];

interface TimelineEvent {
  conference: string;
  date: string;
  label: string;
  type: "deadline" | "result";
  monthDay: number;
  fullDate: Date;
}

interface TimelineItem {
  kind: "event" | "today";
  event?: TimelineEvent;
}

function parseMd(md: string): number {
  return parseInt(md.slice(0, 2), 10) * 100 + parseInt(md.slice(3, 5), 10);
}

export default function VerticalTimeline() {
  const { t } = useAppContext();
  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const [showLightbox, setShowLightbox] = useState(false);

  const closeLightbox = useCallback(() => setShowLightbox(false), []);

  useEffect(() => {
    if (!showLightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowLightbox(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showLightbox]);

  const events = useMemo(() => {
    const all: TimelineEvent[] = [];
    for (const item of RAW_DATA) {
      const dDate = new Date(`${currentYear}-${item.deadline}T00:00:00`);
      const dlParts = item.deadline.split("-");
      all.push({
        conference: item.conference,
        date: `${parseInt(dlParts[0])}/${parseInt(dlParts[1])}`,
        label: t.timeline.deadline,
        type: "deadline",
        monthDay: parseMd(item.deadline),
        fullDate: dDate,
      });
      const rMd = parseMd(item.result);
      const rYear = rMd <= 229 ? currentYear + 1 : currentYear;
      const rDate = new Date(`${rYear}-${item.result}T00:00:00`);
      const rsParts = item.result.split("-");
      all.push({
        conference: item.conference,
        date: `${parseInt(rsParts[0])}/${parseInt(rsParts[1])}`,
        label: t.timeline.result,
        type: "result",
        monthDay: rMd,
        fullDate: rDate,
      });
    }
    return all.sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
  }, [currentYear, t.timeline]);

  const items = useMemo(() => {
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const all: TimelineItem[] = events.map((ev) => ({
      kind: "event",
      event: ev,
    }));
    // Insert today marker in correct chronological position on the left (deadline) column
    const insertIdx = all.findIndex(
      (item) => item.event!.fullDate.getTime() > todayDate.getTime(),
    );
    const todayItem: TimelineItem = { kind: "today" };
    if (insertIdx === -1) {
      all.push(todayItem);
    } else {
      all.splice(insertIdx, 0, todayItem);
    }
    return all;
  }, [events, today]);

  const dotColor = (type: "deadline" | "result") =>
    type === "deadline" ? "bg-rose-500" : "bg-emerald-500";
  const textColor = (type: "deadline" | "result") =>
    type === "deadline"
      ? "text-rose-600 dark:text-rose-300"
      : "text-emerald-600 dark:text-emerald-300";
  return (
    <div className="relative">
      {/* Logo */}
      <div
        className="-mx-4 -mt-4 mb-4 cursor-pointer"
        onClick={() => setShowLightbox(true)}
      >
        <img
          src={`${import.meta.env.BASE_URL}icon.webp`}
          alt="淘顶网"
          className="w-full h-auto block rounded-t-lg"
        />
      </div>

      <div className="relative">
        {/* Center axis line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-zinc-200 dark:bg-zinc-700" />

        {/* Column headers */}
        <div className="relative flex items-start mb-4 text-[11px] font-semibold uppercase tracking-wider">
          <div className="flex-1 pr-4 text-right text-rose-500">
            {t.timeline.deadline}
          </div>
          <div className="shrink-0 w-2.5" />
          <div className="flex-1 pl-4 text-left text-emerald-500">
            {t.timeline.result}
          </div>
        </div>

        {items.map((item, i) => {
          if (item.kind === "today") {
            return (
              <div
                key={`today-${i}`}
                className="relative flex items-center mb-2 text-xs"
              >
                <div className="flex-1 pr-4 text-right">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-300">
                    {t.timeline.today}
                  </span>
                </div>
                <div className="relative z-10 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white dark:border-zinc-900 shrink-0" />
                <div className="flex-1 pl-4 text-left text-zinc-400">
                  {today.getMonth() + 1}/{today.getDate()}
                </div>
              </div>
            );
          }

          const ev = item.event!;
          const isPast =
            ev.fullDate.getTime() <
            new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate(),
            ).getTime();
          const isLeft = ev.type === "deadline";

          return (
            <div
              key={`${ev.conference}-${ev.type}-${i}`}
              className="relative flex items-center mb-2 text-xs"
            >
              {/* Left side */}
              <div className="flex-1 pr-4">
                {isLeft ? (
                  <div className={`text-right ${isPast ? "opacity-40" : ""}`}>
                    <span className={`font-semibold ${textColor(ev.type)}`}>
                      {ev.conference}
                    </span>
                  </div>
                ) : (
                  <div className={`text-right ${isPast ? "opacity-40" : ""}`}>
                    <span className="text-zinc-400">{ev.date}</span>
                  </div>
                )}
              </div>

              {/* Center dot */}
              <div
                className={`relative z-10 w-2 h-2 rounded-full ${dotColor(ev.type)} border-2 border-white dark:border-zinc-900 shrink-0`}
              />

              {/* Right side */}
              <div className="flex-1 pl-4">
                {isLeft ? (
                  <div className={`text-left ${isPast ? "opacity-40" : ""}`}>
                    <span className="text-zinc-400">{ev.date}</span>
                  </div>
                ) : (
                  <div className={`text-left ${isPast ? "opacity-40" : ""}`}>
                    <span className={`font-semibold ${textColor(ev.type)}`}>
                      {ev.conference}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 text-[10px] text-zinc-400 dark:text-zinc-500 text-center leading-tight">
        {t.timeline.disclaimer}
      </div>

      {showLightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center cursor-pointer"
          onClick={closeLightbox}
        >
          <img
            src={`${import.meta.env.BASE_URL}icon.webp`}
            alt="淘顶网"
            className="max-w-[80vw] max-h-[80vh] w-auto h-auto object-contain"
          />
        </div>
      )}
    </div>
  );
}
