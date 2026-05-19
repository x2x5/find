import { useEffect, useRef, useState } from 'react';
import Cart from '@/components/features/Cart';
import DeadlineCountdown from '@/components/features/DeadlineCountdown';
import { useAppContext } from '@/context/AppContext';
import type { Paper } from '@/types';

interface RightSidebarProps {
  paperCount: number;
  tableReady: boolean;
  cart: Paper[];
  onRemoveFromCart: (idx: number) => void;
  onCopyCart: () => void;
  onClearCart: () => void;
  onShowToast: (msg: string) => void;
}

export default function RightSidebar({
  paperCount,
  tableReady,
  cart,
  onRemoveFromCart,
  onCopyCart,
  onClearCart,
  onShowToast,
}: RightSidebarProps) {
  const { t } = useAppContext();
  const countdownRef = useRef<HTMLDivElement | null>(null);
  const [cartHeight, setCartHeight] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const measure = (force = false) => {
      if (window.innerWidth < 1024) {
        setCartHeight(null);
        return;
      }

      const table = document.querySelector('[data-papers-table]') as HTMLElement | null;
      const countdown = countdownRef.current;
      if (!table || !countdown) {
        if (force) {
          setCartHeight(null);
        }
        return;
      }

      const gap = 12;
      const nextHeight = Math.max(
        Math.round(table.getBoundingClientRect().height - countdown.getBoundingClientRect().height - gap),
        160
      );
      setCartHeight((prev) => {
        if (force || prev == null) return nextHeight;
        return Math.max(prev, nextHeight);
      });
    };

    const tryMeasureUntilReady = (attempt = 0) => {
      if (cancelled) return;
      const table = document.querySelector('[data-papers-table]') as HTMLElement | null;
      if (table && countdownRef.current) {
        measure(attempt === 0);
        return;
      }
      if (attempt < 10) {
        window.requestAnimationFrame(() => tryMeasureUntilReady(attempt + 1));
      }
    };

    const frame = window.requestAnimationFrame(() => tryMeasureUntilReady());
    const handleResize = () => measure(true);
    window.addEventListener('resize', handleResize);

    const table = document.querySelector('[data-papers-table]') as HTMLElement | null;
    const countdown = countdownRef.current;
    const observer = new ResizeObserver(() => measure());
    if (table) observer.observe(table);
    if (countdown) observer.observe(countdown);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [cart.length, paperCount, tableReady]);

  return (
    <aside className="lg:sticky lg:top-[3.5rem] self-start flex flex-col gap-3">
      <div ref={countdownRef} className="shrink-0">
        <DeadlineCountdown />
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
