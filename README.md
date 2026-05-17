# README for AI | [README for Human](https://x2x5.github.io/find/about.html)

## Project: 淘顶网

A React-based single-page application for browsing and searching AI conference paper titles across 9 top venues (NeurIPS, ICML, ICLR, CVPR, ECCV, ICCV, AAAI, MM, IJCAI).

### Architecture

- **Framework**: React 18 + TypeScript, built with Vite 6
- **Styling**: Tailwind CSS 3.4 with dark mode (`class` strategy)
- **Icons**: Lucide React
- **Entry**: `src/main.tsx` → `src/App.tsx`
- **Data flow**: JSON manifest + per-conference paper files → `useManifest` + `usePapers` hooks → `AppContext` state → component tree
- **Routing**: None (single page). All navigation via state.
- **i18n**: `src/i18n/zh.ts` and `en.ts`, consumed via `useAppContext().t`

### Key Components

| Component | Path | Purpose |
|-----------|------|---------|
| App | `src/App.tsx` | Root layout, state management, data wiring |
| Header | `src/components/layout/Header.tsx` | Year selector, search bar, lucky paper, controls |
| Sidebar | `src/components/layout/Sidebar.tsx` | Field filter + distributions + cart |
| PapersTable | `src/components/features/PapersTable.tsx` | Paginated paper list with highlight |
| Distributions | `src/components/features/Distributions.tsx` | Bar charts by conference and year |
| Timeline | `src/components/features/Timeline.tsx` | Conference deadline/result timeline |
| Cart | `src/components/features/Cart.tsx` | Shopping cart for paper collection |
| FieldFilter | `src/components/features/FieldFilter.tsx` | Conference checkboxes (legacy, now merged into Distributions) |

### State Architecture

State lives in `App.tsx` (via `useState`) and flows down as props:

- `selectedConfs: Set<string>` — active conference filters (default: ICML/ICLR/NeurIPS/CVPR/ECCV/ICCV)
- `yearRange: [number, number]` — year filter range
- `searchValue: string` — real-time search query text
- `pageSize: number` — items per page (10/50/100)
- `showTimeline: boolean` — timeline visibility toggle
- `cart: Paper[]` — cart items
- `toast: { message, visible }` — toast notification state

Derived state (via `useMemo`):
- `filteredPapers` — `filterPapers(loadedPapers, searchValue, yearRange, selectedConfs)`
- `shuffledPapers` — Fisher-Yates shuffle of `filteredPapers`
- `luckyPaper` — random pick from `filteredPapers`

### Build & Deploy

```bash
cd v2
npm install
npm run dev      # dev server at localhost:5173
npm run build    # production build to dist/
```

Deploy `v2/dist/` to any static host (GitHub Pages, Vercel, Netlify).

### Data Pipeline

Raw paper titles live in `papers/<conference>/<year>.txt` (one title per line).

Generate JSON data:
```bash
cd v2/scripts
npx tsx gen-data.ts
```

This produces `v2/public/manifest.json` and per-conference JSON files in `v2/public/data/`.

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

`v2/src/lib/search.ts` — keyword splitting, camelCase expansion, case-insensitive regex matching.

### About Page

A standalone HTML page served at `/about.html` (or `https://x2x5.github.io/find/about`). Linked from the app header via "关于/About" button and from this README.
