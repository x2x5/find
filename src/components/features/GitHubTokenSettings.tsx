import { CircleHelp, KeyRound, Save } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

interface GitHubTokenSettingsProps {
  token: string;
  tokenDraft: string;
  showTokenInput: boolean;
  onToggleInput: () => void;
  onDraftChange: (value: string) => void;
  onSave: () => void;
  compact?: boolean;
}

export default function GitHubTokenSettings({
  token,
  tokenDraft,
  showTokenInput,
  onToggleInput,
  onDraftChange,
  onSave,
  compact = false,
}: GitHubTokenSettingsProps) {
  const { t } = useAppContext();

  const wrapperClass = compact
    ? 'space-y-2'
    : 'rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden';
  const rowClass = compact
    ? 'w-full flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-950/60 px-3 py-2.5 text-sm'
    : 'w-full flex items-center gap-3 px-4 py-3 text-sm border-b border-zinc-100 dark:border-zinc-800';

  return (
    <div className={wrapperClass}>
      {!compact && (
        <div className="px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-800">
          GitHub Token
        </div>
      )}

      {showTokenInput && (
        <div className={compact ? 'flex items-center gap-1.5' : 'px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5'}>
          <input
            type="password"
            value={tokenDraft}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder="GitHub token"
            className="flex-1 min-w-0 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1.5 text-xs text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400 outline-none focus:border-indigo-400"
          />
          <button
            onClick={onSave}
            title={t.cart.tooltipSaveToken}
            aria-label={t.cart.tooltipSaveToken}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
          >
            <Save className="h-4 w-4" />
          </button>
        </div>
      )}

      <a
        href="github-token.html"
        onClick={() => localStorage.setItem('return_to_mobile_tab', 'settings')}
        title={t.cart.tooltipGetToken}
        aria-label={t.cart.tooltipGetToken}
        className={rowClass}
      >
        <CircleHelp className="w-5 h-5 text-amber-500" />
        <span className="flex-1 text-left text-zinc-700 dark:text-zinc-200">{t.cart.tooltipGetToken}</span>
      </a>

      <button
        onClick={onToggleInput}
        title={token ? t.cart.tooltipTokenSet : t.cart.tooltipSetToken}
        aria-label={token ? t.cart.tooltipTokenSet : t.cart.tooltipSetToken}
        className={rowClass}
      >
        <KeyRound className={`w-5 h-5 ${token ? 'text-emerald-500' : 'text-zinc-400 dark:text-zinc-500'}`} />
        <span className="flex-1 text-left text-zinc-700 dark:text-zinc-200">
          {token ? t.cart.tooltipTokenSet : t.cart.tooltipSetToken}
        </span>
      </button>
    </div>
  );
}
