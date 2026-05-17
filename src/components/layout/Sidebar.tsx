import Distributions from '@/components/features/Distributions';
import Cart from '@/components/features/Cart';
import { useAppContext } from '@/context/AppContext';
import type { Manifest, Paper } from '@/types';

interface SidebarProps {
  manifest: Manifest | null;
  papers: Paper[];
  selectedConfs: Set<string>;
  onToggleConf: (conf: string) => void;
  cart: Paper[];
  onRemoveFromCart: (idx: number) => void;
  onCopyCart: () => void;
  onClearCart: () => void;
}

export default function Sidebar({
  manifest: _manifest,
  papers,
  selectedConfs,
  onToggleConf,
  cart,
  onRemoveFromCart,
  onCopyCart,
  onClearCart,
}: SidebarProps) {
  const { t } = useAppContext();

  return (
    <aside className="space-y-4">
      <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <Distributions
          papers={papers}
          selectedConfs={selectedConfs}
          onToggleConf={onToggleConf}
        />
      </div>
      <Cart
        items={cart}
        onRemove={onRemoveFromCart}
        onCopy={onCopyCart}
        onClear={onClearCart}
        t={t.cart}
      />
    </aside>
  );
}
