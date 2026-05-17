import { useMemo } from 'react';

const RAW_DATA = [
  { deadline: '01-19', result: '04-29', conference: 'IJCAI' },
  { deadline: '01-28', result: '04-30', conference: 'ICML' },
  { deadline: '03-05', result: '06-17', conference: 'ECCV' },
  { deadline: '03-07', result: '06-25', conference: 'ICCV' },
  { deadline: '04-01', result: '07-07', conference: 'MM' },
  { deadline: '05-06', result: '09-24', conference: 'NeurIPS' },
  { deadline: '08-15', result: '12-09', conference: 'AAAI' },
  { deadline: '10-01', result: '01-22', conference: 'ICLR' },
  { deadline: '11-15', result: '02-26', conference: 'CVPR' },
];

const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '次年1月', '次年2月'];

const HEIGHTS = [24, 36, 48];

interface PlacedEvent {
  label: string;
  date: string;
  type: 'deadline' | 'result' | 'today';
  position: number; // % from left
  height: number;   // px
}

function parseDate(mmdd: string): { m: number; d: number } {
  return { m: parseInt(mmdd.slice(0, 2), 10), d: parseInt(mmdd.slice(3, 5), 10) };
}

export default function Timeline() {
  const today = useMemo(() => new Date(), []);

  const placedEvents = useMemo<PlacedEvent[]>(() => {
    const all: { monthIdx: number; label: string; date: string; type: 'deadline' | 'result' | 'today' }[] = [];

    for (const item of RAW_DATA) {
      // deadline: same year, month 0-11
      const dl = parseDate(item.deadline);
      all.push({ monthIdx: dl.m - 1, label: item.conference, date: `${dl.m}/${dl.d}`, type: 'deadline' });

      // result: month <= 2 → next year (indices 12-13)
      const rs = parseDate(item.result);
      all.push({ monthIdx: rs.m <= 2 ? rs.m - 1 + 12 : rs.m - 1, label: item.conference, date: `${rs.m}/${rs.d}`, type: 'result' });
    }

    // Today marker (above line, like result)
    const tm = today.getMonth();
    all.push({ monthIdx: tm, label: '今天', date: `${tm + 1}/${today.getDate()}`, type: 'today' });

    // Group by month
    const byMonth = new Map<number, typeof all>();
    for (const ev of all) {
      if (!byMonth.has(ev.monthIdx)) byMonth.set(ev.monthIdx, []);
      byMonth.get(ev.monthIdx)!.push(ev);
    }

    const monthWidth = 100 / MONTH_LABELS.length;
    const result: PlacedEvent[] = [];

    for (let m = 0; m < MONTH_LABELS.length; m++) {
      const events = byMonth.get(m) || [];
      const count = events.length;
      if (count === 0) continue;

      for (let i = 0; i < count; i++) {
        const innerPct = ((i + 1) / (count + 1)) * 100;
        result.push({
          ...events[i],
          position: m * monthWidth + monthWidth * (innerPct / 100),
          height: HEIGHTS[i % HEIGHTS.length],
        });
      }
    }

    return result;
  }, [today]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-3">
      <div className="relative h-[170px]">
        {/* 月份标签 — 每个在月份的左端点 */}
        {MONTH_LABELS.map((label, i) => (
          <div
            key={i}
            className={`absolute text-[10px] font-medium leading-none ${
              i >= 12 ? 'text-indigo-400 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500'
            }`}
            style={{ left: `${(i / 14) * 100}%`, top: '66px', transform: 'translateX(6px)' }}
          >
            {label}
          </div>
        ))}

        {/* 横线 */}
        <div className="absolute top-[80px] left-0 right-0 h-[2px] bg-zinc-300 dark:bg-zinc-600">
          {/* 刻度 */}
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-[-4px] w-px h-[10px] bg-zinc-400 dark:bg-zinc-500"
              style={{ left: `${(i / 14) * 100}%` }}
            />
          ))}
          {/* 右端箭头 */}
          <div className="absolute top-[-5px] right-[-10px] w-0 h-0 border-t-[6px] border-t-transparent border-l-[8px] border-l-zinc-300 dark:border-l-zinc-600 border-b-[6px] border-b-transparent" />
        </div>

        {/* 事件 */}
        {placedEvents.map((ev, i) => {
          const isAbove = ev.type === 'result' || ev.type === 'today';

          const dotColor = ev.type === 'deadline' ? 'bg-rose-500' : ev.type === 'result' ? 'bg-emerald-500' : 'bg-indigo-500';
          const lineColor = ev.type === 'deadline' ? 'bg-rose-300 dark:bg-rose-700/60' : ev.type === 'result' ? 'bg-emerald-300 dark:bg-emerald-700/60' : 'bg-indigo-300 dark:bg-indigo-700/60';
          const textColor = ev.type === 'deadline' ? 'text-rose-600 dark:text-rose-300' : ev.type === 'result' ? 'text-emerald-600 dark:text-emerald-300' : 'text-indigo-600 dark:text-indigo-300';
          const lineWidth = ev.type === 'today' ? 'w-[2px]' : 'w-px';

          return (
            <div
              key={i}
              className={`absolute flex flex-col items-center ${isAbove ? 'flex-col-reverse bottom-[80px]' : 'top-[80px]'}`}
              style={{ left: `${ev.position}%`, transform: 'translateX(-50%)' }}
            >
              {/* 圆点（统一大小，中心在横线） */}
              <div className={`w-2 h-2 rounded-full ${dotColor} border-2 border-white dark:border-zinc-900 flex-shrink-0 ${isAbove ? '-mb-1' : '-mt-1'}`} />

              {/* 竖线 */}
              <div className={`${lineWidth} ${lineColor} flex-shrink-0`} style={{ height: `${ev.height}px` }} />

              {/* 文字 */}
              {isAbove ? (
                // 横线上方：日期 → 会议名
                <div className={`text-center leading-tight whitespace-nowrap ${textColor}`}>
                  <div className="text-[10px] font-normal opacity-70">{ev.date}</div>
                  <div className="text-[11px] font-semibold">{ev.label}</div>
                </div>
              ) : (
                // 横线下方：会议名 → 日期
                <div className={`text-center leading-tight whitespace-nowrap ${textColor}`}>
                  <div className="text-[11px] font-semibold">{ev.label}</div>
                  <div className="text-[10px] font-normal opacity-70">{ev.date}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
