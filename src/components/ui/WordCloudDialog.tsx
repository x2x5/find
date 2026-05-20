import { useEffect, useMemo, useRef, useState } from 'react';
import type { Paper } from '@/types';

interface WordCloudDialogProps {
  open: boolean;
  papers: Paper[];
  onClose: () => void;
}

const STOP_WORDS = new Set([
  'a','an','and','are','as','at','be','by','for','from','how','in','into','is','it','of','on','or','our','that','the','their','this','to','toward','towards','using','use','via','with','without','within','over','under','new','based','learning','model','models','network','networks','data','training','efficient','general','paper','papers','study','analysis','method','methods','approach','approaches','benchmark','benchmarks','foundation','foundations','through','your','you','all','one','two','three','can','large','language','vision','image','images','video','videos','text','llm','llms','diffusion','transformer','transformers'
]);

type Box = { left: number; top: number; right: number; bottom: number };

function buildWords(papers: Paper[], hiddenWords: Set<string>) {
  const counts = new Map<string, number>();
  for (const paper of papers) {
    const words = paper.title.match(/[A-Za-z0-9]+|[\u4e00-\u9fff]+/g) || [];
    for (const raw of words) {
      const word = raw.toLowerCase();
      if (hiddenWords.has(word)) continue;
      if (STOP_WORDS.has(word)) continue;
      if (/^\d+$/.test(word)) continue;
      if (/^[a-z]$/.test(word)) continue;
      if (/^[a-z]{2}$/.test(word)) continue;
      counts.set(word, (counts.get(word) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, 50);
}

function hashWord(word: string) {
  let hash = 0;
  for (let i = 0; i < word.length; i += 1) {
    hash = (hash * 31 + word.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function styleFor(word: string, count: number, maxCount: number) {
  const ratio = maxCount > 1 ? (count - 1) / (maxCount - 1) : 0.5;
  const size = 14 + ratio * 26;
  const hash = hashWord(word);
  const hue = hash % 360;
  const saturation = 68 + (hash % 18);
  const lightness = 54 - ratio * 18 - (hash % 6);
  const alpha = 0.82 + ratio * 0.14;
  return {
    fontSize: size,
    weight: Math.round(560 + ratio * 220),
    color: `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`,
  };
}

function intersects(a: Box, b: Box) {
  const gap = 8;
  return !(
    a.right + gap < b.left ||
    a.left - gap > b.right ||
    a.bottom + gap < b.top ||
    a.top - gap > b.bottom
  );
}

export default function WordCloudDialog({ open, papers, onClose }: WordCloudDialogProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [hiddenWords, setHiddenWords] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) setHiddenWords(new Set());
  }, [open, papers]);

  const words = useMemo(() => buildWords(papers, hiddenWords), [papers, hiddenWords]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !rootRef.current || words.length === 0) return;

    const root = rootRef.current;
    const place = () => {
      if (!root) return;
      root.innerHTML = '';
      const width = root.clientWidth;
      const height = root.clientHeight;
      const centerX = width / 2;
      const centerY = height / 2;
      const placed: Box[] = [];
      const maxCount = words[0] ? words[0].count : 1;

      words.forEach((item, index) => {
        const el = document.createElement('button');
        const style = styleFor(item.word, item.count, maxCount);
        el.className = 'absolute left-1/2 top-1/2 whitespace-nowrap select-none bg-transparent border-0 p-0 leading-none transition-transform duration-150 hover:scale-[1.04] hover:opacity-90 cursor-pointer';
        el.textContent = item.word;
        el.style.fontSize = `${style.fontSize}px`;
        el.style.fontWeight = `${style.weight}`;
        el.style.color = style.color;
        el.style.fontFamily = 'inherit';
        root.appendChild(el);

        const rect = el.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        let angle = index === 0 ? 0 : Math.random() * Math.PI * 2;
        let radius = index === 0 ? 0 : 8;
        let x = centerX;
        let y = centerY;
        let box: Box | null = null;
        const edgePaddingX = 18;
        const edgePaddingY = 12;

        for (let step = 0; step < 2400; step++) {
          if (index !== 0) {
            x = centerX + Math.cos(angle) * radius;
            y = centerY + Math.sin(angle) * radius;
            angle += 0.32;
            radius += 0.32;
          }
          box = {
            left: x - w / 2,
            top: y - h / 2,
            right: x + w / 2,
            bottom: y + h / 2,
          };

          if (box.left < edgePaddingX || box.top < edgePaddingY || box.right > width - edgePaddingX || box.bottom > height - edgePaddingY) {
            continue;
          }

          let collided = false;
          for (const prev of placed) {
            if (intersects(box, prev)) {
              collided = true;
              break;
            }
          }
          if (!collided) break;
        }

        if (!box) {
          el.remove();
          return;
        }

        placed.push(box);
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.transform = 'translate(-50%, -50%)';
        el.addEventListener('click', () => {
          setHiddenWords((prev) => {
            const next = new Set(prev);
            next.add(item.word);
            return next;
          });
        });
      });
    };

    const raf = window.requestAnimationFrame(place);
    window.addEventListener('resize', place);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', place);
    };
  }, [open, words]);

  if (!open) return null;

  const emptyText = papers.length === 0
    ? '没有可生成的词云数据。可以回主页换个筛选条件再试。'
    : '没有可生成的词云数据。可以点外围空白关闭后换个筛选条件再试。';

  return (
    <div className="fixed inset-0 z-[120] bg-black/35 backdrop-blur-[2px]">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-[121] mx-auto mt-[6vh] flex h-[82vh] w-[min(860px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[24px] border border-zinc-300 bg-gradient-to-b from-zinc-50 via-white to-stone-100 shadow-2xl shadow-black/20 dark:border-zinc-700 dark:bg-gradient-to-b dark:from-zinc-900 dark:via-zinc-950 dark:to-stone-950">
        <div className="pointer-events-none flex items-start justify-between border-b border-zinc-200/80 px-5 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
          <div className="max-w-[45%] leading-6" />
          <div className="absolute left-1/2 top-3.5 -translate-x-1/2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            显示前 {words.length} 个高频词
          </div>
          <div className="max-w-[35%] text-right leading-6">
            点击词语可从当前词云中移除
          </div>
        </div>
        <div className="relative min-h-0 flex-1">
          {words.length > 0 ? (
            <div ref={rootRef} className="absolute inset-0" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center px-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {emptyText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
