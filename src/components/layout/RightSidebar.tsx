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
  githubToken: string;
  hideCountdown?: boolean;
}

export default function RightSidebar({
  cart,
  onRemoveFromCart,
  onCopyCart,
  onClearCart,
  onShowToast,
  githubToken,
  hideCountdown,
}: RightSidebarProps) {
  const { t } = useAppContext();

  return (
    <aside className="lg:sticky lg:top-[3.5rem] self-start flex flex-col gap-3">
      {!hideCountdown && (
        <div className="shrink-0">
          <DeadlineCountdown />
        </div>
      )}
      <div>
        <Cart
          items={cart}
          onRemove={onRemoveFromCart}
          onCopy={onCopyCart}
          onClear={onClearCart}
          onShowToast={onShowToast}
          githubToken={githubToken}
          t={t.cart}
        />
      </div>
    </aside>
  );
}
