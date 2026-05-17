import { useEffect, useState, useRef } from 'react';
import type { Manifest, PaperData, Paper } from '@/types';

interface UsePapersResult {
  papers: Paper[];
  loading: boolean;
  error: Error | null;
}

const cache = new Map<string, PaperData>();

export function usePapers(
  selectedConfs: Set<string>,
  yearRange: [number, number],
  manifest: Manifest | null
): UsePapersResult {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const prevKeyRef = useRef('');

  useEffect(() => {
    if (!manifest) return;

    const [minYear, maxYear] = yearRange;
    const keys: string[] = [];
    const toFetch: { conf: string; year: string; meta: { file: string; hash: string } }[] = [];

    for (const conf of selectedConfs) {
      const confMeta = manifest.conferences[conf];
      if (!confMeta) continue;
      for (const [yearStr, yearMeta] of Object.entries(confMeta.years)) {
        const year = parseInt(yearStr, 10);
        if (year < minYear || year > maxYear) continue;
        const key = `${conf}/${yearStr}`;
        keys.push(key);
        if (!cache.has(key)) {
          toFetch.push({ conf, year: yearStr, meta: yearMeta });
        }
      }
    }

    const currentKey = keys.sort().join(',');
    if (currentKey === prevKeyRef.current && toFetch.length === 0) {
      // Already have everything in cache, just flatten
      const all: Paper[] = [];
      for (const key of keys) {
        const data = cache.get(key);
        if (!data) continue;
        for (const title of data.papers) {
          all.push({ conference: data.conference, year: data.year, title });
        }
      }
      setPapers(all);
      return;
    }
    prevKeyRef.current = currentKey;

    if (toFetch.length === 0) {
      const all: Paper[] = [];
      for (const key of keys) {
        const data = cache.get(key);
        if (!data) continue;
        for (const title of data.papers) {
          all.push({ conference: data.conference, year: data.year, title });
        }
      }
      setPapers(all);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all(
      toFetch.map(async ({ conf, year, meta }) => {
        const url = `${import.meta.env.BASE_URL}${meta.file}?v=${meta.hash}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${conf}/${year}`);
        const data: PaperData = await res.json();
        cache.set(`${conf}/${year}`, data);
        return data;
      })
    )
      .then(() => {
        const all: Paper[] = [];
        for (const key of keys) {
          const data = cache.get(key);
          if (!data) continue;
          for (const title of data.papers) {
            all.push({ conference: data.conference, year: data.year, title });
          }
        }
        setPapers(all);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      });
  }, [selectedConfs, yearRange, manifest]);

  return { papers, loading, error };
}
