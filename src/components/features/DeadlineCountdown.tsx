import { useEffect, useMemo, useState } from 'react';
import { Settings2 } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

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
    return { year: '26', month: '07', day: '28', hour: '19', minute: '59', second: '59' };
  }
  return {
    year: match[1].slice(2),
    month: match[2],
    day: match[3],
    hour: match[4],
    minute: match[5],
    second: match[6],
  };
}

function toIsoString(year: string, month: string, day: string, hour: string, minute: string, second: string) {
  return `20${year}-${month}-${day}T${hour}:${minute}:${second}+08:00`;
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

interface DeadlineCountdownProps {}

export default function DeadlineCountdown({}: DeadlineCountdownProps) {
  const { t } = useAppContext();
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [label, setLabel] = useState(DEFAULT_LABEL);
  const [editing, setEditing] = useState(false);
  const [labelEditing, setLabelEditing] = useState(false);
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
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <a
          href="https://ccfddl.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          {t.countdown.selfCheck}
        </a>
        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 text-center">
          {t.countdown.untilPrefix}{labelEditing ? (
            <input
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              onBlur={() => {
                setLabel(labelDraft.trim() || DEFAULT_LABEL);
                setLabelEditing(false);
                try { localStorage.setItem(LABEL_STORAGE_KEY, labelDraft.trim() || DEFAULT_LABEL); } catch {}
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setLabel(labelDraft.trim() || DEFAULT_LABEL);
                  setLabelEditing(false);
                  try { localStorage.setItem(LABEL_STORAGE_KEY, labelDraft.trim() || DEFAULT_LABEL); } catch {}
                }
                if (e.key === 'Escape') {
                  setLabelDraft(label);
                  setLabelEditing(false);
                }
              }}
              className="inline w-14 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-1 py-0 text-sm font-semibold text-pink-500 tabular-nums"
              autoFocus
            />
          ) : (
            <span
              onClick={() => { setLabelDraft(label); setLabelEditing(true); }}
              className="text-pink-500 text-sm font-semibold cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-950/30 rounded px-0.5"
            >
              {label}
            </span>
          )}<a href="https://ccfddl.com" target="_blank" rel="noopener noreferrer" className="hover:underline">{t.countdown.submit}</a>{t.countdown.untilSuffix}
        </span>
        <button
          onClick={() => setEditing((prev) => !prev)}
          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 hover:bg-amber-200 hover:text-amber-700 dark:hover:bg-amber-900 dark:hover:text-amber-300 active:scale-90 transition-all"
          title={editing ? t.common.collapse : t.common.settings}
        >
          <Settings2 className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-4 gap-1.5">
        <div className="rounded-lg border border-orange-100 dark:border-orange-900/40 bg-white/80 dark:bg-zinc-900/70 px-2 py-2 text-center">
          <div className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{countdown.days}</div>
          <div className="text-[10px] tracking-[0.18em] text-zinc-400">{t.countdown.day}</div>
        </div>
        <div className="rounded-lg border border-orange-100 dark:border-orange-900/40 bg-white/80 dark:bg-zinc-900/70 px-2 py-2 text-center">
          <div className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{String(countdown.hours).padStart(2, '0')}</div>
          <div className="text-[10px] tracking-[0.18em] text-zinc-400">{t.countdown.hour}</div>
        </div>
        <div className="rounded-lg border border-orange-100 dark:border-orange-900/40 bg-white/80 dark:bg-zinc-900/70 px-2 py-2 text-center">
          <div className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{String(countdown.minutes).padStart(2, '0')}</div>
          <div className="text-[10px] tracking-[0.18em] text-zinc-400">{t.countdown.minute}</div>
        </div>
        <div className="rounded-lg border border-orange-100 dark:border-orange-900/40 bg-white/80 dark:bg-zinc-900/70 px-2 py-2 text-center">
          <div className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{String(countdown.seconds).padStart(2, '0')}</div>
          <div className="text-[10px] tracking-[0.18em] text-zinc-400">{t.countdown.second}</div>
        </div>
      </div>

      {countdown.expired && (
        <div className="mt-2 text-[10px] text-zinc-400 tabular-nums">{t.countdown.expired}</div>
      )}

      {editing && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1">
              <input
                value={draft.year}
                onChange={(e) => setDraft((prev) => ({ ...prev, year: e.target.value.replace(/\D/g, '').slice(0, 2) }))}
                className="w-10 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-1.5 py-1 text-[10px] tabular-nums text-center"
                placeholder="26"
                inputMode="numeric"
              />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 w-4 text-center">{t.countdown.year}</span>
            </label>
            <label className="flex items-center gap-1">
              <input
                value={draft.month}
                onChange={(e) => setDraft((prev) => ({ ...prev, month: e.target.value.replace(/\D/g, '').slice(0, 2) }))}
                className="w-10 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-1.5 py-1 text-[10px] tabular-nums text-center"
                placeholder="07"
                inputMode="numeric"
              />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 w-4 text-center">{t.countdown.month}</span>
            </label>
            <label className="flex items-center gap-1">
              <input
                value={draft.day}
                onChange={(e) => setDraft((prev) => ({ ...prev, day: e.target.value.replace(/\D/g, '').slice(0, 2) }))}
                className="w-10 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-1.5 py-1 text-[10px] tabular-nums text-center"
                placeholder="28"
                inputMode="numeric"
              />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 w-4 text-center">{t.countdown.dayLabel}</span>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1">
              <input
                value={draft.hour}
                onChange={(e) => setDraft((prev) => ({ ...prev, hour: e.target.value.replace(/\D/g, '').slice(0, 2) }))}
                className="w-10 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-1.5 py-1 text-[10px] tabular-nums text-center"
                placeholder="19"
                inputMode="numeric"
              />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 w-4 text-center">{t.countdown.hourLabel}</span>
            </label>
            <label className="flex items-center gap-1">
              <input
                value={draft.minute}
                onChange={(e) => setDraft((prev) => ({ ...prev, minute: e.target.value.replace(/\D/g, '').slice(0, 2) }))}
                className="w-10 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-1.5 py-1 text-[10px] tabular-nums text-center"
                placeholder="59"
                inputMode="numeric"
              />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 w-4 text-center">{t.countdown.minuteLabel}</span>
            </label>
            <label className="flex items-center gap-1">
              <input
                value={draft.second}
                onChange={(e) => setDraft((prev) => ({ ...prev, second: e.target.value.replace(/\D/g, '').slice(0, 2) }))}
                className="w-10 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-1.5 py-1 text-[10px] tabular-nums text-center"
                placeholder="59"
                inputMode="numeric"
              />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 w-4 text-center">{t.countdown.secondLabel}</span>
            </label>
          </div>
          <button
            onClick={handleSave}
            className="w-full rounded-md bg-indigo-100 dark:bg-indigo-950 px-2 py-1 text-[10px] text-indigo-700 dark:text-indigo-300"
          >
            {t.common.saveLocal}
          </button>
        </div>
      )}
    </div>
  );
}
