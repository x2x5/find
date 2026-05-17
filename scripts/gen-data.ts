import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { cleanTitle } from './clean-title.js';

const PAPERS_DIR = path.resolve(process.cwd(), 'papers');
const OUTPUT_DIR = path.resolve(process.cwd(), 'public', 'data');

const CONFERENCE_META: Record<string, { name: string; field: 'CV' | 'AI' | 'ML' }> = {
  nips: { name: 'NeurIPS', field: 'ML' },
  icml: { name: 'ICML', field: 'ML' },
  iclr: { name: 'ICLR', field: 'ML' },
  cvpr: { name: 'CVPR', field: 'CV' },
  eccv: { name: 'ECCV', field: 'CV' },
  iccv: { name: 'ICCV', field: 'CV' },
  aaai: { name: 'AAAI', field: 'AI' },
  ijcai: { name: 'IJCAI', field: 'AI' },
  acmmm: { name: 'MM', field: 'AI' },
};

const CONFERENCE_ALIASES: Record<string, string> = {
  acmmm: 'mm',
};

function getAlias(name: string): string {
  return CONFERENCE_ALIASES[name] ?? name;
}

function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf-8').digest('hex').slice(0, 16);
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function readConferencePapers(_confName: string, confPath: string) {
  const raw: { year: string; title: string }[] = [];
  const entries = await fs.readdir(confPath, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.txt')) continue;
    const year = entry.name.replace('.txt', '');
    const filePath = path.join(confPath, entry.name);
    const content = await fs.readFile(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const title = line.trim();
      if (!title) continue;
      raw.push({ year, title: cleanTitle(title) });
    }
  }
  // Deduplicate by title, keep latest year
  const bestYear = new Map<string, { year: number; title: string }>();
  for (const item of raw) {
    const y = parseInt(item.year, 10);
    const existing = bestYear.get(item.title);
    if (!existing || y > existing.year) {
      bestYear.set(item.title, { year: y, title: item.title });
    }
  }
  // Build per-year arrays
  const byYear = new Map<string, string[]>();
  for (const [, v] of bestYear) {
    const yearStr = String(v.year);
    let arr = byYear.get(yearStr);
    if (!arr) {
      arr = [];
      byYear.set(yearStr, arr);
    }
    arr.push(v.title);
  }
  // Sort titles within each year
  for (const [, arr] of byYear) {
    arr.sort((a, b) => a.localeCompare(b));
  }
  return byYear;
}

async function main() {
  // Clean output directory
  try {
    await fs.rm(OUTPUT_DIR, { recursive: true });
  } catch {
    // ignore if not exists
  }
  await ensureDir(OUTPUT_DIR);

  const manifest = {
    version: new Date().toISOString(),
    conferences: {} as Record<string, {
      name: string;
      field: 'CV' | 'AI' | 'ML';
      years: Record<string, { file: string; hash: string; count: number }>;
    }>,
  };

  const papersEntries = await fs.readdir(PAPERS_DIR, { withFileTypes: true });
  for (const entry of papersEntries) {
    if (!entry.isDirectory()) continue;
    const confDir = entry.name;
    const confPath = path.join(PAPERS_DIR, confDir);
    const alias = getAlias(confDir);
    const meta = CONFERENCE_META[confDir];
    if (!meta) {
      console.warn(`Skipping unknown conference: ${confDir}`);
      continue;
    }

    const byYear = await readConferencePapers(confDir, confPath);
    if (byYear.size === 0) continue;

    const confOutputDir = path.join(OUTPUT_DIR, alias);
    await ensureDir(confOutputDir);

    const yearsMeta: Record<string, { file: string; hash: string; count: number }> = {};

    for (const [year, papers] of byYear) {
      const data = { conference: alias, year, papers };
      const jsonStr = JSON.stringify(data, null, 2);
      const fileName = `${year}.json`;
      const filePath = path.join(confOutputDir, fileName);
      await fs.writeFile(filePath, jsonStr, 'utf-8');

      yearsMeta[year] = {
        file: `data/${alias}/${fileName}`,
        hash: hashContent(jsonStr),
        count: papers.length,
      };
    }

    manifest.conferences[alias] = {
      name: meta.name,
      field: meta.field,
      years: yearsMeta,
    };

    console.log(`  ${alias}: ${Object.keys(yearsMeta).length} years, ${Object.values(yearsMeta).reduce((s, y) => s + y.count, 0)} papers`);
  }

  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

  const totalPapers = Object.values(manifest.conferences).reduce(
    (sum, c) => sum + Object.values(c.years).reduce((s, y) => s + y.count, 0),
    0
  );
  console.log(`\nDone! Total conferences: ${Object.keys(manifest.conferences).length}, total papers: ${totalPapers}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
