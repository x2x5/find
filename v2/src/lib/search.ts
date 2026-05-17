import type { Paper } from '@/types';

function splitKeywords(query: string): string[] {
  return query
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function camelCaseToWords(s: string): string {
  // CrossView -> cross view
  return s.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
}

function buildPatterns(keywords: string[]): RegExp[] {
  return keywords.map((kw) => {
    const lower = kw.toLowerCase();
    // 驼峰拆词
    const expanded = camelCaseToWords(kw);
    if (expanded === lower) {
      return new RegExp(lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }
    const parts = expanded.split(/\s+/).filter(Boolean);
    return new RegExp(parts.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*'), 'i');
  });
}

export function filterPapers(
  papers: Paper[],
  keywords: string,
  yearRange: [number, number],
  selectedConfs: Set<string>
): Paper[] {
  const kws = splitKeywords(keywords);
  const patterns = buildPatterns(kws);
  const [minYear, maxYear] = yearRange;

  return papers.filter((paper) => {
    const year = parseInt(paper.year, 10);
    if (year < minYear || year > maxYear) return false;
    if (!selectedConfs.has(paper.conference)) return false;

    if (patterns.length === 0) return true;

    const text = `${paper.title} ${paper.conference} ${paper.year}`.toLowerCase();
    return patterns.every((re) => re.test(text));
  });
}
