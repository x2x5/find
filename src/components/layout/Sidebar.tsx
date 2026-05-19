import { useEffect, useRef, useState } from 'react';
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
  onShowToast: (msg: string) => void;
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
  onShowToast,
}: SidebarProps) {
  const { t } = useAppContext();
  const distributionsRef = useRef<HTMLDivElement | null>(null);
  const [cartHeight, setCartHeight] = useState<number | null>(null);

  useEffect(() => {
    const measure = () => {
      if (window.innerWidth < 1024) {
        setCartHeight(null);
        return;
      }

      const table = document.querySelector('[data-papers-table]') as HTMLElement | null;
      const distributions = distributionsRef.current;
      if (!table || !distributions) {
        setCartHeight(null);
        return;
      }

      const gap = 8;
      const nextHeight = Math.max(
        Math.round(table.getBoundingClientRect().height - distributions.getBoundingClientRect().height - gap),
        160
      );
      setCartHeight(nextHeight);
    };

    const frame = window.requestAnimationFrame(measure);
    window.addEventListener('resize', measure);

    const table = document.querySelector('[data-papers-table]') as HTMLElement | null;
    const distributions = distributionsRef.current;
    const observer = new ResizeObserver(measure);
    if (table) observer.observe(table);
    if (distributions) observer.observe(distributions);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', measure);
      observer.disconnect();
    };
  }, [papers, cart.length]);

  return (
    <aside className="lg:sticky lg:top-[3.5rem] self-start flex flex-col gap-2">
      <div ref={distributionsRef} className="shrink-0 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <Distributions
          papers={papers}
          selectedConfs={selectedConfs}
          onToggleConf={onToggleConf}
        />
      </div>
      <div className="min-h-0 lg:overflow-hidden" style={cartHeight ? { height: `${cartHeight}px` } : undefined}>
        <Cart
          items={cart}
          onRemove={onRemoveFromCart}
          onCopy={onCopyCart}
          onClear={onClearCart}
          onShowToast={onShowToast}
          t={t.cart}
        />
      </div>
    </aside>
  );
}
