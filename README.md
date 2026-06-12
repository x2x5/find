# README for AI | [README for Human](https://x2x5.github.io/find/about.html)

## Project: 找顶网

A React-based single-page application for browsing and searching AI conference paper titles across 9 top venues (NeurIPS, ICML, ICLR, CVPR, ECCV, ICCV, AAAI, MM, IJCAI).

### Architecture

- **Framework**: React 18 + TypeScript, built with Vite 6
- **Styling**: Tailwind CSS 3.4 with dark mode (`class` strategy)
- **Icons**: Lucide React + custom assets (papers.cool favicon)
- **Entry**: `src/main.tsx` → `src/App.tsx`
- **Data flow**: JSON manifest + per-conference paper files → `useManifest` + `usePapers` hooks → `AppContext` state → component tree
- **Routing**: None (single page). All navigation via state.
- **i18n**: `src/i18n/zh.ts` and `en.ts`, consumed via `useAppContext().t`

### Key Components

| Component | Path | Purpose |
|-----------|------|---------|
| App | `src/App.tsx` | Root layout, state management, data wiring |
| Header | `src/components/layout/Header.tsx` | Countdown, search bar, theme/language toggles |
| Sidebar | `src/components/layout/Sidebar.tsx` | Conference filter, year range, stats & feedback |
| RightSidebar | `src/components/layout/RightSidebar.tsx` | Vertical timeline with logo |
| PapersTable | `src/components/features/PapersTable.tsx` | Paginated paper list with copy, GitHub search, papers.cool links |
| VerticalTimeline | `src/components/features/VerticalTimeline.tsx` | Conference deadline/result vertical timeline with logo lightbox |
| DeadlineCountdown | `src/components/features/DeadlineCountdown.tsx` | Countdown timer with editable target |
| Distributions | `src/components/features/Distributions.tsx` | Bar charts by conference |
| YearDistribution | `src/components/features/YearDistribution.tsx` | Year distribution bar chart |

### State Architecture

State lives in `App.tsx` (via `useState`) and flows down as props:

- `selectedConfs: Set<string>` — active conference filters (default: ICML/ICLR/NeurIPS/CVPR/ECCV/ICCV)
- `yearRange: [number, number]` — year filter range
- `searchValue: string` — real-time search query text
- `pageSize: number` — items per page (10/50/100)
- `toast: { message, visible }` — toast notification state
- `githubToken: string` — GitHub API token for authenticated requests

Derived state (via `useMemo`):
- `filteredPapers` — `filterPapers(loadedPapers, searchValue, yearRange, selectedConfs)`
- `shuffledPapers` — Fisher-Yates shuffle of `filteredPapers`

### Build & Deploy

```bash
cd find
npm install
npm run dev      # dev server at localhost:5173/find/
npm run build    # production build to dist/
```

Deploy `dist/` to any static host (GitHub Pages, Vercel, Netlify).

### Data Pipeline

Raw paper titles live in `papers/<conference>/<year>.txt` (one title per line).

Generate JSON data:
```bash
cd find/scripts
npx tsx gen-data.ts
```

This produces `public/data/manifest.json` and per-conference JSON files in `public/data/`.

### Types

```typescript
interface Paper {
  conference: string;  // e.g., "cvpr"
  year: string;        // e.g., "2025"
  title: string;
}

interface Manifest {
  version: string;
  conferences: Record<string, ConferenceMeta>;
}
```

See `src/types/index.ts` for full type definitions.

### Conference Data

```typescript
// src/lib/conferences.ts
CONFERENCE_FIELDS: Record<string, 'CV' | 'AI' | 'ML'> // maps conf key to field
CONFERENCE_NAMES: Record<string, string>               // maps conf key to display name
```

9 conferences → 3 fields: ML (nips, icml, iclr), CV (cvpr, eccv, iccv), AI (aaai, mm, ijcai).

### Search Logic

`src/lib/search.ts` — keyword splitting, camelCase expansion, case-insensitive regex matching.

### Key Features

- **Vertical Timeline**: Conference deadlines and results displayed chronologically in left sidebar
- **GitHub Search**: One-click search for paper's GitHub repository
- **papers.cool Integration**: Direct link to search paper on papers.cool
- **Copy Title**: Quick copy paper title to clipboard
- **Countdown**: Customizable deadline countdown timer
- **Word Cloud**: Generate word cloud from search results
- **Dark Mode**: Full dark mode support
- **i18n**: Chinese and English interfaces

### About Page

A standalone HTML page served at `/about.html` (or `https://x2x5.github.io/find/about`). Linked from the app footer and from this README.
