import { useMemo } from 'react';

interface TimelineEvent {
  conference: string;
  dateText: string;
  type: 'deadline' | 'result' | 'today';
}

interface TimelineMonth {
  label: string;
  events: TimelineEvent[];
}

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

function getMonthLabel(monthDay: string): string {
  const month = parseInt(monthDay.slice(0, 2), 10);
  const day = parseInt(monthDay.slice(3, 5), 10);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[month - 1]} ${day}`;
}

function getYearForDate(monthDay: string, baseYear: number): number {
  const month = parseInt(monthDay.slice(0, 2), 10);
  return month <= 2 ? baseYear + 1 : baseYear;
}

export default function Timeline() {
  const today = useMemo(() => new Date(), []);
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();
  const todayYear = today.getFullYear();

  const months = useMemo<TimelineMonth[]>(() => {
    const eventsByMonth = new Map<string, TimelineEvent[]>();

    for (const item of RAW_DATA) {
      const dlMonth = item.deadline.slice(0, 2);
      const rsMonth = item.result.slice(0, 2);

      const dlKey = `${getYearForDate(item.deadline, todayYear)}-${dlMonth}`;
      const rsKey = `${getYearForDate(item.result, todayYear)}-${rsMonth}`;

      if (!eventsByMonth.has(dlKey)) eventsByMonth.set(dlKey, []);
      if (!eventsByMonth.has(rsKey)) eventsByMonth.set(rsKey, []);

      eventsByMonth.get(dlKey)!.push({
        conference: item.conference,
        dateText: item.deadline,
        type: 'deadline',
      });
      eventsByMonth.get(rsKey)!.push({
        conference: item.conference,
        dateText: item.result,
        type: 'result',
      });
    }

    // Add today marker
    const todayKey = `${todayYear}-${String(todayMonth).padStart(2, '0')}`;
    if (!eventsByMonth.has(todayKey)) eventsByMonth.set(todayKey, []);
    eventsByMonth.get(todayKey)!.push({
      conference: 'Today',
      dateText: `${String(todayMonth).padStart(2, '0')}-${String(todayDay).padStart(2, '0')}`,
      type: 'today',
    });

    const sortedKeys = Array.from(eventsByMonth.keys()).sort();
    return sortedKeys.map((key) => {
      const [year, month] = key.split('-');
      const monthNum = parseInt(month, 10);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        label: `${monthNames[monthNum - 1]} ${year}`,
        events: eventsByMonth.get(key)!.sort((a, b) => {
          const aDay = parseInt(a.dateText.slice(3, 5), 10);
          const bDay = parseInt(b.dateText.slice(3, 5), 10);
          return aDay - bDay;
        }),
      };
    });
  }, [todayDay, todayMonth, todayYear]);

  const typeColors: Record<string, { dot: string; text: string; bg: string }> = {
    deadline: { dot: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/30' },
    result: { dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    today: { dot: 'bg-indigo-500', text: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
  };

  return (
    <div className="space-y-4">
      {months.map((month) => (
        <div key={month.label} className="relative">
          {/* Month label */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            <span className="text-xs font-medium text-zinc-500">{month.label}</span>
          </div>

          {/* Events */}
          <div className="space-y-1 pl-3.5">
            {month.events.map((event, i) => {
              const colors = typeColors[event.type];
              return (
                <div
                  key={`${event.conference}-${i}`}
                  className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${colors.bg} ${colors.text}`}
                  title={`${event.conference} — ${event.type === 'deadline' ? 'Submission' : event.type === 'result' ? 'Acceptance' : 'Today'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} shrink-0`} />
                  <span className="font-medium">{event.conference}</span>
                  <span className="ml-auto text-zinc-500 text-[10px] tabular-nums">
                    {getMonthLabel(event.dateText)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
