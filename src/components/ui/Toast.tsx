import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
}

export default function Toast({ message, visible, onClose }: ToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-zinc-900 text-white text-sm shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
      {message}
      <button
        onClick={onClose}
        className="p-0.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
