import { useState, useRef, useCallback } from 'react';

const repoCache = new Map<string, { stars: number; url: string } | null>();

const HEADERS = { Accept: 'application/vnd.github.v3+json' };

function getRemaining(headers: Headers): number {
  const v = headers.get('x-ratelimit-remaining');
  return v ? parseInt(v, 10) : -1;
}

function getReset(headers: Headers): number {
  const v = headers.get('x-ratelimit-reset');
  return v ? parseInt(v, 10) : 0;
}

async function searchGitHub(title: string, token: string): Promise<{ stars: number; url: string; reset?: number; remaining?: number } | null> {
  const headers: Record<string, string> = { ...HEADERS };
  if (token) headers.Authorization = `Bearer ${token}`;

  const words = title.split(/\s+/).slice(0, 4).join(' ');
  const queries = [
    `"${title}" in:name,in:description,in:topics,in:readme`,
    words,
  ];

  for (const q of queries) {
    const params = new URLSearchParams({ q, sort: 'stars', per_page: '1' });
    try {
      const res = await fetch(`https://api.github.com/search/repositories?${params}`, { headers });
      const remaining = getRemaining(res.headers);
      const reset = getReset(res.headers);
      if (res.status === 401) return { stars: -2, url: '', remaining: -2 };
      if (remaining === 0 || res.status === 403 || res.status === 429) {
        return { stars: -1, url: '', reset, remaining };
      }
      if (!res.ok) continue;
      const data = await res.json();
      const item = data?.items?.[0];
      if (item) return { stars: item.stargazers_count ?? 0, url: item.html_url, remaining };
    } catch {
      continue;
    }
  }
  return null;
}

export function useCitationCount(token: string) {
  const [repos, setRepos] = useState<Record<string, { stars: number; url: string } | null>>({});
  const [fetching, setFetching] = useState(false);
  const fetchingRef = useRef(false);
  const prevToken = useRef(token);

  if (token !== prevToken.current) {
    prevToken.current = token;
    repoCache.clear();
  }

  const fetchBatch = useCallback(async (papers: { key: string; title: string }[]): Promise<{ found: number; total: number; limited: boolean; reset?: number; badToken?: boolean; remaining?: number }> => {
    if (fetchingRef.current) return { found: 0, total: 0, limited: false };
    fetchingRef.current = true;
    setFetching(true);

    try {
      const uncached = papers.filter((p) => !repoCache.has(p.key));

      if (uncached.length === 0) {
        const update: Record<string, { stars: number; url: string } | null> = {};
        for (const p of papers) {
          const c = repoCache.get(p.key);
          if (c !== undefined) update[p.key] = c;
        }
        if (Object.keys(update).length) setRepos((prev) => ({ ...prev, ...update }));
        const found = Object.values(update).filter(Boolean).length;
        return { found, total: papers.length, limited: false };
      }

      const results = await Promise.allSettled(
        uncached.map(async (p) => {
          const repo = await searchGitHub(p.title, token);
          return { key: p.key, repo };
        })
      );

      let limited = false;
      let badToken = false;
      let reset = 0;
      let remaining = -1;
      const update: Record<string, { stars: number; url: string } | null> = {};
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value) {
          if (r.value.repo && r.value.repo.stars === -2) {
            badToken = true;
            continue;
          }
          if (r.value.repo && r.value.repo.stars === -1) {
            limited = true;
            if (r.value.repo.reset) reset = Math.max(reset, r.value.repo.reset);
            if (r.value.repo.remaining !== undefined) remaining = r.value.repo.remaining;
            continue;
          }
          repoCache.set(r.value.key, r.value.repo);
          if (r.value.repo) update[r.value.key] = r.value.repo;
        }
      }
      if (Object.keys(update).length) setRepos((prev) => ({ ...prev, ...update }));
      const found = Object.keys(update).length;
      return { found, total: papers.length, limited, reset, badToken, remaining };
    } finally {
      fetchingRef.current = false;
      setFetching(false);
    }
  }, [token]);

  return { citations: repos, fetchBatch, fetching };
}
