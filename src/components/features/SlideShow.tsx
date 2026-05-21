import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export interface SlideData {
  tag: { text: string; variant: 'what' | 'why' | 'how' };
  title: React.ReactNode;
  body: React.ReactNode;
  right: React.ReactNode;
  theme: string;
}

interface SlideShowProps {
  slides: SlideData[];
  backHref: string;
  backText?: string;
}

const tagStyles: Record<string, string> = {
  what: 'bg-indigo-50 text-indigo-600 border border-indigo-200/50 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700/30',
  why: 'bg-pink-50 text-pink-600 border border-pink-200/50 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700/30',
  how: 'bg-amber-50 text-amber-600 border border-amber-200/50 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/30',
};

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 500 : -500, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -500 : 500, opacity: 0 }),
};

export default function SlideShow({ slides, backHref, backText }: SlideShowProps) {
  const { t } = useAppContext();
  const finalBackText = backText ?? `← ${t.common.backToHome}`;
  const total = slides.length;
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [pageNumVisible, setPageNumVisible] = useState(false);
  const pageNumTimer = useRef<ReturnType<typeof setTimeout>>();
  const wheelTimer = useRef<ReturnType<typeof setTimeout>>();
  const touchStartX = useRef(0);

  const showPageNum = useCallback(() => {
    setPageNumVisible(true);
    clearTimeout(pageNumTimer.current);
    pageNumTimer.current = setTimeout(() => setPageNumVisible(false), 1600);
  }, []);

  const go = useCallback((i: number) => {
    if (animating || i === current || i < 0 || i >= total) return;
    setAnimating(true);
    setDirection(i > current ? 1 : -1);
    setCurrent(i);
    showPageNum();
    setTimeout(() => setAnimating(false), 560);
  }, [animating, current, total, showPageNum]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { go(current - 1); showPageNum(); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { go(current + 1); showPageNum(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [current, go, showPageNum]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      clearTimeout(wheelTimer.current);
      const d = Math.sign(e.deltaY);
      if (d > 0) { go(current + 1); showPageNum(); }
      else if (d < 0) { go(current - 1); showPageNum(); }
      wheelTimer.current = setTimeout(() => {}, 600);
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [current, go, showPageNum]);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => { touchStartX.current = e.changedTouches[0].screenX; };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].screenX - touchStartX.current;
      if (Math.abs(dx) > 40) {
        if (dx < 0) { go(current + 1); showPageNum(); }
        else { go(current - 1); showPageNum(); }
      }
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [current, go, showPageNum]);

  const slide = slides[current];

  return (
    <div className="fixed inset-0 flex flex-col bg-zinc-50 dark:bg-zinc-950 select-none">
      <div
        className="h-[3px] shrink-0 transition-all duration-500 ease-out"
        style={{
          width: `${((current + 1) / total) * 100}%`,
          background: 'linear-gradient(135deg, #6366f1, #a78bfa, #ec4899)',
          boxShadow: '0 1px 4px rgba(99,102,241,0.15)',
        }}
      />

      <div className="flex-1 flex items-center justify-center px-2 sm:px-8 py-4">
        <div className="relative w-full max-w-[1120px] h-full flex flex-col">
          <button
            onClick={() => { go(current - 1); showPageNum(); }}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full flex items-center justify-center shadow-lg backdrop-blur transition-all border text-lg cursor-pointer
              ${current === 0
                ? 'opacity-25 pointer-events-none'
                : 'hover:scale-105 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 hover:shadow-indigo-500/25'
              }
              bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700`}
            style={current > 0 ? {} : undefined}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => go(0)}
            className={`absolute -left-12 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center shadow-lg backdrop-blur transition-all border text-sm cursor-pointer font-mono
              ${current > 0 ? '' : 'hidden'}
              bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700
              hover:scale-105 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 hover:shadow-indigo-500/25`}
          >
            &laquo;
          </button>
          <button
            onClick={() => { go(current + 1); showPageNum(); }}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full flex items-center justify-center shadow-lg backdrop-blur transition-all border text-lg cursor-pointer
              ${current === total - 1
                ? 'opacity-25 pointer-events-none'
                : 'hover:scale-105 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 hover:shadow-indigo-500/25'
              }
              bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => go(total - 1)}
            className={`absolute -right-12 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center shadow-lg backdrop-blur transition-all border text-sm cursor-pointer font-mono
              ${current < total - 1 ? '' : 'hidden'}
              bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700
              hover:scale-105 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 hover:shadow-indigo-500/25`}
          >
            &raquo;
          </button>

          <div className="flex-1 mx-4 sm:mx-8 md:mx-12 overflow-hidden rounded-2xl">
            <div className="relative h-full">
              <div
                className={`absolute top-3 right-4 z-10 text-xs font-semibold tracking-wide text-white bg-black/50 backdrop-blur px-3 py-1 rounded-full transition-opacity duration-250 ${pageNumVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              >
                {current + 1} / {total}
              </div>

              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={current}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                  className="absolute inset-0 rounded-2xl border p-6 sm:p-10 md:p-14 shadow-xl flex flex-col md:flex-row gap-6 md:gap-10"
                  style={{
                    borderColor: 'var(--border, rgba(148,163,184,0.10))',
                    background: `linear-gradient(135deg, color-mix(in srgb, ${slide.theme} 7%, white) 0%, white 50%)`,
                  }}
                >
                  <div className="md:flex-[1.2] min-w-0 flex flex-col justify-center">
                    <span className={`inline-block text-xs font-bold tracking-wide px-3 py-1 rounded-full mb-3 ${tagStyles[slide.tag.variant]}`}>
                      {slide.tag.text}
                    </span>
                    <div className="text-xl sm:text-2xl md:text-[28px] font-bold leading-tight mb-3 md:mb-4">
                      {slide.title}
                    </div>
                    <div className="text-sm sm:text-base leading-relaxed text-zinc-500 dark:text-zinc-400 [&_strong]:text-zinc-800 dark:[&_strong]:text-zinc-200 [&_strong]:font-semibold [&_code]:bg-zinc-100 dark:[&_code]:bg-zinc-800 [&_code]:px-2 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ol]:ml-4 [&_ol]:mt-1 [&_li]:mb-1.5">
                      {slide.body}
                    </div>
                  </div>

                  <div className="md:flex-[0.8] min-w-0 flex items-center justify-center">
                    {slide.right}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-[48px] pb-2 max-w-[1200px] mx-auto w-full" style={{ paddingLeft: 'calc((100% - 1120px) / 2 + 48px)', paddingRight: 'calc((100% - 1120px) / 2 + 48px)' }}>
        <a
          href={backHref}
          className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400 font-medium px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-indigo-400 hover:text-indigo-500 transition-all whitespace-nowrap"
        >
          {finalBackText}
        </a>
        <div className="flex-1 flex justify-center">
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`rounded-full transition-all duration-300 p-0 border-none cursor-pointer
                  ${i === current
                    ? 'bg-indigo-500 w-[22px] h-[7px] rounded-[4px]'
                    : 'bg-zinc-300 dark:bg-zinc-600 w-[7px] h-[7px] hover:bg-zinc-400 dark:hover:bg-zinc-500'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
