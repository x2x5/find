import { useEffect, useMemo, useState } from 'react';
import { Settings2 } from 'lucide-react';

const STORAGE_KEY = 'next_deadline_at';
const LABEL_STORAGE_KEY = 'next_deadline_label';
const DEFAULT_TARGET = '2026-07-28T19:59:59+08:00';
const DEFAULT_LABEL = 'AAAI';

interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function readStoredTarget() {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_TARGET;
  } catch {
    return DEFAULT_TARGET;
  }
}

function formatForInputs(iso: string) {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
  if (!match) {
    return { year: '2026', month: '07', day: '28', hour: '19', minute: '59', second: '59' };
  }
  return {
    year: match[1],
    month: match[2],
    day: match[3],
    hour: match[4],
    minute: match[5],
    second: match[6],
  };
}

function toIsoString(year: string, month: string, day: string, hour: string, minute: string, second: string) {
  return `${year}-${month}-${day}T${hour}:${minute}:${second}+08:00`;
}

function getCountdownParts(target: string, nowMs: number): CountdownParts {
  const diff = new Date(target).getTime() - nowMs;
  if (!Number.isFinite(diff) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, expired: false };
}

export default function DeadlineCountdown() {
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [label, setLabel] = useState(DEFAULT_LABEL);
  const [editing, setEditing] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [draft, setDraft] = useState(() => formatForInputs(DEFAULT_TARGET));
  const [labelDraft, setLabelDraft] = useState(DEFAULT_LABEL);

  useEffect(() => {
    const stored = readStoredTarget();
    let storedLabel = DEFAULT_LABEL;
    try {
      storedLabel = localStorage.getItem(LABEL_STORAGE_KEY) || DEFAULT_LABEL;
    } catch {
      // ignore
    }
    setTarget(stored);
    setLabel(storedLabel);
    setDraft(formatForInputs(stored));
    setLabelDraft(storedLabel);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const countdown = useMemo(() => getCountdownParts(target, nowMs), [target, nowMs]);

  const handleSave = () => {
    const next = toIsoString(draft.year, draft.month, draft.day, draft.hour, draft.minute, draft.second);
    const nextLabel = labelDraft.trim() || DEFAULT_LABEL;
    try {
      localStorage.setItem(STORAGE_KEY, next);
      localStorage.setItem(LABEL_STORAGE_KEY, nextLabel);
    } catch {
      // ignore
    }
    setTarget(next);
    setLabel(nextLabel);
    setEditing(false);
  };

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-white to-orange-50/70 dark:from-zinc-900 dark:to-orange-950/20 p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          距 {label} 投稿还有
        </span>
        <button
          onClick={() => setEditing((prev) => !prev)}
          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/80 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-100"
          title={editing ? '收起' : '设置'}
        >
          <Settings2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-4 gap-1.5">
        <div className="rounded-lg border border-orange-100 dark:border-orange-900/40 bg-white/80 dark:bg-zinc-900/70 px-2 py-2 text-center">
          <div className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{countdown.days}</div>
          <div className="text-[10px] tracking-[0.18em] text-zinc-400">DAY</div>
        </div>
        <div className="rounded-lg border border-orange-100 dark:border-orange-900/40 bg-white/80 dark:bg-zinc-900/70 px-2 py-2 text-center">
          <div className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{String(countdown.hours).padStart(2, '0')}</div>
          <div className="text-[10px] tracking-[0.18em] text-zinc-400">HRS</div>
        </div>
        <div className="rounded-lg border border-orange-100 dark:border-orange-900/40 bg-white/80 dark:bg-zinc-900/70 px-2 py-2 text-center">
          <div className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{String(countdown.minutes).padStart(2, '0')}</div>
          <div className="text-[10px] tracking-[0.18em] text-zinc-400">MIN</div>
        </div>
        <div className="rounded-lg border border-orange-100 dark:border-orange-900/40 bg-white/80 dark:bg-zinc-900/70 px-2 py-2 text-center">
          <div className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{String(countdown.seconds).padStart(2, '0')}</div>
          <div className="text-[10px] tracking-[0.18em] text-zinc-400">SEC</div>
        </div>
      </div>

      {countdown.expired && (
        <div className="mt-2 text-[10px] text-zinc-400 tabular-nums">
          已截止
        </div>
      )}

      {editing && (
        <div className="mt-2 space-y-2">
          <label className="block space-y-1">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">会议名称</span>
            <input
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-[10px]"
              placeholder="例如 AAAI"
            />
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            <label className="block space-y-1">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">年</span>
              <input
                value={draft.year}
                onChange={(e) => setDraft((prev) => ({ ...prev, year: e.target.value }))}
                className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-[10px] tabular-nums"
                placeholder="2026"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">月</span>
              <input
                value={draft.month}
                onChange={(e) => setDraft((prev) => ({ ...prev, month: e.target.value }))}
                className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-[10px] tabular-nums"
                placeholder="07"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">日</span>
              <input
                value={draft.day}
                onChange={(e) => setDraft((prev) => ({ ...prev, day: e.target.value }))}
                className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-[10px] tabular-nums"
                placeholder="28"
              />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <label className="block space-y-1">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">时</span>
              <input
                value={draft.hour}
                onChange={(e) => setDraft((prev) => ({ ...prev, hour: e.target.value }))}
                className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-[10px] tabular-nums"
                placeholder="19"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">分</span>
              <input
                value={draft.minute}
                onChange={(e) => setDraft((prev) => ({ ...prev, minute: e.target.value }))}
                className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-[10px] tabular-nums"
                placeholder="59"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">秒</span>
              <input
                value={draft.second}
                onChange={(e) => setDraft((prev) => ({ ...prev, second: e.target.value }))}
                className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-[10px] tabular-nums"
                placeholder="59"
              />
            </label>
          </div>
          <button
            onClick={handleSave}
            className="w-full rounded-md bg-indigo-100 dark:bg-indigo-950 px-2 py-1 text-[10px] text-indigo-700 dark:text-indigo-300"
          >
            保存到本地
          </button>
        </div>
      )}
    </div>
  );
}
