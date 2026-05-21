import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';

interface IssueDialogProps {
  type: 'feature' | 'bug' | 'chitchat' | null;
  onClose: () => void;
}

const CONFIG_BASE = {
  feature: {
    template: 'feature_request.md',
    labels: 'enhancement',
    accent: 'emerald',
    accentBg: 'bg-emerald-600',
    accentBgHover: 'hover:bg-emerald-700',
    ringColor: 'focus:ring-emerald-500',
  },
  bug: {
    template: 'bug_report.md',
    labels: 'bug',
    accent: 'red',
    accentBg: 'bg-red-600',
    accentBgHover: 'hover:bg-red-700',
    ringColor: 'focus:ring-red-500',
  },
  chitchat: {
    template: '',
    labels: '',
    accent: 'indigo',
    accentBg: 'bg-indigo-600',
    accentBgHover: 'hover:bg-indigo-700',
    ringColor: 'focus:ring-indigo-500',
  },
};

export default function IssueDialog({ type, onClose }: IssueDialogProps) {
  const { t } = useAppContext();
  const config = type ? CONFIG_BASE[type] : null;
  const titles = type === 'feature' ? t.issueDialog.featureTitles : type === 'bug' ? t.issueDialog.bugTitles : type === 'chitchat' ? t.issueDialog.chitchatTitles : [];
  const placeholder = type === 'feature' ? t.issueDialog.featurePlaceholder : type === 'bug' ? t.issueDialog.bugPlaceholder : type === 'chitchat' ? t.issueDialog.chitchatPlaceholder : '';
  const [title, setTitle] = useState(titles[0] || '');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (type) {
      const nextTitles = type === 'feature' ? t.issueDialog.featureTitles : type === 'bug' ? t.issueDialog.bugTitles : t.issueDialog.chitchatTitles;
      setTitle(nextTitles[0] || '');
    }
  }, [type, t.issueDialog]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (type) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [type, onClose]);

  if (!type || !config) return null;

  const handleSubmit = () => {
    if (type === 'chitchat') {
      const url = `https://github.com/x2x5/find/discussions/new?category=general&title=${encodeURIComponent(title)}&body=${encodeURIComponent(description)}`;
      window.open(url, '_blank');
    } else {
      const url = `https://github.com/x2x5/find/issues/new?template=${config.template}&labels=${config.labels}&title=${encodeURIComponent(title)}&body=${encodeURIComponent(description)}`;
      window.open(url, '_blank');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/[0.02] pointer-events-none">
      <div className="fixed bottom-12 right-4 z-[101] w-80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl shadow-xl border border-zinc-200/80 dark:border-zinc-700/80 pointer-events-auto">
        <div className="p-4 pt-3 space-y-3">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={placeholder}
            rows={5}
            className={`w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 ${config.ringColor} resize-none`}
          />
          <div className="flex flex-wrap gap-1.5">
            {titles.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTitle(item)}
                className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-colors ${
                  title === item
                    ? config.accent === 'emerald'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : config.accent === 'indigo'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-red-600 text-white border-red-600'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-zinc-200 dark:border-zinc-700">
          <button onClick={onClose} className="px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">{t.issueDialog.cancel}</button>
            <button onClick={handleSubmit} className={`px-3 py-1.5 text-xs font-medium rounded-lg text-white ${config.accentBg} ${config.accentBgHover}`}>
              {type === 'chitchat' ? t.issueDialog.submitChat : t.issueDialog.submitIssue}
            </button>
        </div>
      </div>
    </div>
  );
}
