import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  getUpcomingConferenceDeadlines,
  type ConferenceDeadline,
} from "@/lib/deadlines";

const FALLBACK_DEADLINES: ConferenceDeadline[] = [
  { label: "ICLR", target: "2026-09-26T19:59:59+08:00" },
];

function getCountdownParts(target: string, nowMs: number) {
  const totalSeconds = Math.floor(
    Math.max(0, new Date(target).getTime() - nowMs) / 1000,
  );
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function CountdownText({
  deadline,
  nowMs,
  compact = false,
}: {
  deadline: ConferenceDeadline;
  nowMs: number;
  compact?: boolean;
}) {
  const countdown = getCountdownParts(deadline.target, nowMs);
  const numberClass = compact
    ? "text-amber-600 dark:text-amber-400"
    : "text-zinc-900 dark:text-zinc-50";

  return (
    <span className="inline-flex items-baseline gap-1 whitespace-nowrap tabular-nums">
      <span className="font-semibold text-pink-500">{deadline.label}</span>
      <span className="text-zinc-400">remains</span>
      <span className={numberClass}>{countdown.days}</span>
      <span className="text-zinc-400">D</span>
      <span className={numberClass}>
        {String(countdown.hours).padStart(2, "0")}
      </span>
      <span className="text-zinc-400">H</span>
      <span className={numberClass}>
        {String(countdown.minutes).padStart(2, "0")}
      </span>
      <span className="text-zinc-400">M</span>
      <span className={numberClass}>
        {String(countdown.seconds).padStart(2, "0")}
      </span>
      <span className="text-zinc-400">s</span>
    </span>
  );
}

function DeadlineDetails({ deadline }: { deadline: ConferenceDeadline }) {
  const date = new Date(deadline.target);
  const formattedParts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    formattedParts.find((part) => part.type === type)?.value ?? "";
  const parts = `${value("year")}年${value("month")}月${value("day")}日 ${value("hour")}:${value("minute")}:${value("second")}`;

  return (
    <>
      <div className="text-center text-sm tabular-nums">
        <div className="font-semibold text-pink-500">{deadline.label}</div>
        <div className="mt-1 whitespace-nowrap text-zinc-600 dark:text-zinc-300">
          {parts}
        </div>
        <div className="mt-0.5 text-xs text-zinc-400">UTC+8</div>
      </div>
      <a
        href="https://ccfddl.com"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex w-full items-center justify-center rounded-md bg-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900"
      >
        CCF-DDL
      </a>
    </>
  );
}

export default function DeadlineCountdown({ compact = false }: { compact?: boolean }) {
  const [deadlines, setDeadlines] = useState(FALLBACK_DEADLINES);
  const [expanded, setExpanded] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    void getUpcomingConferenceDeadlines().then((items) => {
      if (items.length > 0) setDeadlines(items);
    });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const activeDeadlines = useMemo(
    () => deadlines.filter((item) => new Date(item.target).getTime() > nowMs),
    [deadlines, nowMs],
  );
  const current = activeDeadlines[0] ?? FALLBACK_DEADLINES[0];

  const toggle = (
    <button
      onClick={() => setExpanded((value) => !value)}
      aria-expanded={expanded}
      aria-label="Show next conference deadline"
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
    >
      <ChevronDown
        className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
      />
    </button>
  );

  if (compact) {
    return (
      <div className="relative flex min-w-0 items-center gap-1 text-sm">
        <CountdownText deadline={current} nowMs={nowMs} compact />
        {toggle}
        {expanded && (
          <div className="absolute left-0 top-full z-50 mt-1 w-max max-w-[calc(100vw-2rem)] rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <DeadlineDetails deadline={current} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative rounded-lg border border-zinc-200 bg-gradient-to-br from-white to-orange-50/70 p-3 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-orange-950/20">
      <div className="flex items-center justify-center gap-1 text-sm">
        <CountdownText deadline={current} nowMs={nowMs} />
        {toggle}
      </div>
      {expanded && (
        <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-700">
          <DeadlineDetails deadline={current} />
        </div>
      )}
    </div>
  );
}
