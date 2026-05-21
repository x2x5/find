import { CONFERENCE_FIELDS, CONFERENCE_NAMES } from '@/lib/conferences';
import { useAppContext } from '@/context/AppContext';

interface FieldFilterProps {
  selectedConfs: Set<string>;
  onToggleConf: (conf: string) => void;
}

const FIELDS = [
  { key: 'ML', labelZh: '机器学习', labelEn: 'ML', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  { key: 'CV', labelZh: '计算机视觉', labelEn: 'CV', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  { key: 'AI', labelZh: '人工智能', labelEn: 'AI', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
] as const;

const ALL_CONFS = Object.keys(CONFERENCE_FIELDS);

export default function FieldFilter({ selectedConfs, onToggleConf }: FieldFilterProps) {
  const { language } = useAppContext();

  const toggleField = (confs: string[]) => {
    const allField = confs.every((c) => selectedConfs.has(c));
    confs.forEach((c) => {
      const isSelected = selectedConfs.has(c);
      if (allField) {
        if (isSelected) onToggleConf(c);
      } else {
        if (!isSelected) onToggleConf(c);
      }
    });
  };

  return (
    <div className="space-y-2.5">
      {FIELDS.map(({ key, labelZh, labelEn, color }) => {
        const confs = ALL_CONFS.filter((c) => CONFERENCE_FIELDS[c] === key);
        const fieldAll = confs.every((c) => selectedConfs.has(c));
        const fieldAny = confs.some((c) => selectedConfs.has(c));
        const label = language === 'en' ? labelEn : labelZh;

        return (
          <div key={key} className="flex items-center gap-1">
            <button
              onClick={() => toggleField(confs)}
              className={`shrink-0 inline-flex items-center justify-center h-6 px-2 rounded text-xs font-semibold transition-all ${color} ${
                !fieldAny ? 'opacity-30 grayscale' : fieldAll ? 'ring-1 ring-inset ring-black/10 dark:ring-white/10' : 'opacity-60'
              }`}
            >
              {language === 'en' ? label : label === '机器学习' ? <>机器<br />学习</> : label === '计算机视觉' ? <>计算机<br />视觉</> : label === '人工智能' ? <>人工<br />智能</> : label}
            </button>
            <div className="flex items-center gap-0">
              {confs.map((conf) => (
                <label
                  key={conf}
                  className="flex items-center gap-1 text-xs rounded hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer py-0.5 px-1 w-[4.5rem]"
                >
                  <input
                    type="checkbox"
                    checked={selectedConfs.has(conf)}
                    onChange={() => onToggleConf(conf)}
                    className="w-3 h-3 rounded border-zinc-300 dark:border-zinc-600 accent-indigo-600"
                  />
                  <span className="text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                    {CONFERENCE_NAMES[conf] || conf.toUpperCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
