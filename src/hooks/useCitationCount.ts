import { useState, useRef, useCallback } from 'react';

export type RepoEntry =
  | { kind: 'found'; stars: number; url: string }
  | { kind: 'not_found' }
  | { kind: 'rate_limited' }
  | { kind: 'error' };

const repoCache = new Map<string, RepoEntry>();

const HEADERS = { Accept: 'application/vnd.github.v3+json' };
type SearchResult =
  | { kind: 'found'; stars: number; url: string; remaining?: number }
  | { kind: 'not_found' }
  | { kind: 'rate_limited'; reset?: number; remaining?: number }
  | { kind: 'bad_token'; remaining?: number }
  | { kind: 'error' };

function getRemaining(headers: Headers): number {
  const v = headers.get('x-ratelimit-remaining');
  return v ? parseInt(v, 10) : -1;
}

function getReset(headers: Headers): number {
  const v = headers.get('x-ratelimit-reset');
  return v ? parseInt(v, 10) : 0;
}

async function searchGitHub(title: string, token: string): Promise<SearchResult> {
  const headers: Record<string, string> = { ...HEADERS };
  if (token) headers.Authorization = `Bearer ${token}`;

  const words = title.split(/\s+/).slice(0, 4).join(' ');
  const queries = [
    `"${title}" in:name,in:description,in:topics,in:readme`,
    words,
  ];

  let hadError = false;
  for (const q of queries) {
    const params = new URLSearchParams({ q, sort: 'stars', per_page: '1' });
    try {
      const res = await fetch(`https://api.github.com/search/repositories?${params}`, { headers });
      const remaining = getRemaining(res.headers);
      const reset = getReset(res.headers);
      if (res.status === 401) return { kind: 'bad_token', remaining: -2 };
      if (remaining === 0 || res.status === 403 || res.status === 429) {
        return { kind: 'rate_limited', reset, remaining };
      }
      if (!res.ok) {
        hadError = true;
        continue;
      }
      const data = await res.json();
      const item = data?.items?.[0];
      if (item) return { kind: 'found', stars: item.stargazers_count ?? 0, url: item.html_url, remaining };
    } catch {
      hadError = true;
      continue;
    }
  }
  return hadError ? { kind: 'error' } : { kind: 'not_found' };
}

export function useCitationCount(token: string) {
  const [repos, setRepos] = useState<Record<string, RepoEntry>>({});
  const [fetching, setFetching] = useState(false);
  const fetchingRef = useRef(false);
  const prevToken = useRef(token);

  if (token !== prevToken.current) {
    prevToken.current = token;
    repoCache.clear();
  }

  const fetchBatch = useCallback(async (papers: { key: string; title: string }[]): Promise<{
    found: number;
    total: number;
    searched: number;
    unmatched: number;
    blocked: number;
    failed: number;
    limited: boolean;
    reset?: number;
    badToken?: boolean;
    remaining?: number;
  }> => {
    if (fetchingRef.current) return { found: 0, total: 0, searched: 0, unmatched: 0, blocked: 0, failed: 0, limited: false };
    fetchingRef.current = true;
    setFetching(true);

    try {
      const uncached = papers.filter((p) => {
        const cached = repoCache.get(p.key);
        return !cached || cached.kind === 'rate_limited' || cached.kind === 'error';
      });

      if (uncached.length === 0) {
        const update: Record<string, RepoEntry> = {};
        let found = 0;
        let unmatched = 0;
        for (const p of papers) {
          const c = repoCache.get(p.key);
          if (c) {
            update[p.key] = c;
            if (c.kind === 'found') found += 1;
            if (c.kind === 'not_found') unmatched += 1;
          }
        }
        if (Object.keys(update).length) setRepos((prev) => ({ ...prev, ...update }));
        return { found, total: papers.length, searched: papers.length, unmatched, blocked: 0, failed: 0, limited: false };
      }

      const results: { status: 'fulfilled'; value: { key: string; repo: SearchResult } }[] = [];
      let breakIndex = -1;
      for (let i = 0; i < uncached.length; i++) {
        const p = uncached[i];
        const repo = await searchGitHub(p.title, token);
        results.push({ status: 'fulfilled', value: { key: p.key, repo } });
        if (repo.kind === 'rate_limited' || repo.kind === 'bad_token') {
          breakIndex = i;
          break;
        }
        if (i < uncached.length - 1) {
          await new Promise((r) => setTimeout(r, 300));
        }
      }

      // Mark remaining unprocessed papers as rate_limited so UI shows ❓
      if (breakIndex !== -1) {
        for (let i = breakIndex + 1; i < uncached.length; i++) {
          results.push({ status: 'fulfilled', value: { key: uncached[i].key, repo: { kind: 'rate_limited' } as SearchResult } });
        }
      }

      let limited = false;
      let badToken = false;
      let reset = 0;
      let remaining = -1;
      const update: Record<string, RepoEntry> = {};
      let found = 0;
      let unmatched = 0;
      let blocked = 0;
      let failed = 0;
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value) {
          if (r.value.repo.kind === 'bad_token') {
            badToken = true;
            blocked += 1;
            continue;
          }
          if (r.value.repo.kind === 'rate_limited') {
            limited = true;
            blocked += 1;
            if (r.value.repo.reset) reset = Math.max(reset, r.value.repo.reset);
            if (r.value.repo.remaining !== undefined) remaining = r.value.repo.remaining;
            continue;
          }
          if (r.value.repo.kind === 'error') {
            const entry: RepoEntry = { kind: 'error' };
            repoCache.set(r.value.key, entry);
            update[r.value.key] = entry;
            failed += 1;
            continue;
          }
          if (r.value.repo.kind === 'found') {
            const entry: RepoEntry = { kind: 'found', stars: r.value.repo.stars, url: r.value.repo.url };
            repoCache.set(r.value.key, entry);
            update[r.value.key] = entry;
            found += 1;
            continue;
          }
          const entry: RepoEntry = { kind: 'not_found' };
          repoCache.set(r.value.key, entry);
          update[r.value.key] = entry;
          unmatched += 1;
        }
      }
      if (Object.keys(update).length) setRepos((prev) => ({ ...prev, ...update }));
      const cached = papers.length - uncached.length;
      const searched = cached + found + unmatched;
      return { found, total: papers.length, searched, unmatched, blocked, failed, limited, reset, badToken, remaining };
    } finally {
      fetchingRef.current = false;
      setFetching(false);
    }
  }, [token]);

  return { citations: repos, fetchBatch, fetching };
}
