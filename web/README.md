# SonicPrint — Personal Music Listening Analytics

**SonicPrint** is a local-first, privacy-preserving web application that visualizes and explores your personal Spotify listening history export.

## Prerequisites

- **Python 3.10+** (for the data cleaning and analytics pipeline in `soundprint/`)
- **Node.js 18+** and **npm** (for the React + TypeScript + Vite frontend in `web/`)

---

## 1. Data Pipeline Setup

Place your raw Spotify data export files (`StreamingHistory_music_*.json`) in `SpotifyData/` at the repository root, then run the Python pipeline:

```bash
python -m soundprint.cli
```

This cleans unidentifiable records, verifies SHA-256 immutability and count/duration invariants, and outputs:
- `derived_data/analytics_summary.json`
- `derived_data/StreamingHistory_music_cleaned_all.json`
- `derived_data/pipeline_manifest.json`

Copy the generated JSON files into `web/public/data/` so Vite can serve them locally:

```powershell
New-Item -ItemType Directory -Force -Path "web/public/data"
Copy-Item "derived_data/analytics_summary.json" "web/public/data/analytics_summary.json" -Force
Copy-Item "derived_data/StreamingHistory_music_cleaned_all.json" "web/public/data/cleaned_all.json" -Force
Copy-Item "derived_data/pipeline_manifest.json" "web/public/data/pipeline_manifest.json" -Force
```

---

## 2. Running the Web Application

```bash
cd web
npm install
npm run dev
```

Open the local URL displayed by Vite (typically `http://localhost:5173`).

### Production Build & Typecheck

```bash
cd web
npm run typecheck
npm run build
npm run preview
```

---

## 3. Architecture & Sections

- **`/overview`** — Headline metrics (933.9 hours, 19,267 streams, 5,388 tracks, 2,108 artists), top track/artist cards, daily activity pulse sparkline, and curated evidence-based findings.
- **`/timeline`** — Interactive daily/weekly/monthly listening timeline, GitHub-style daily consistency heatmap, 24-hour circadian distribution, day-of-week distribution, and top high-activity days.
- **`/tracks`** — Top 20 horizontal bar chart (by play count or duration), searchable and sortable full catalog table (all 5,388 tracks), monthly dominant tracks, and intense single-day track repeat binges.
- **`/artists`** — Top 20 horizontal bar chart, searchable full artist table (all 2,108 artists) with first recorded play and return span, diversity metrics (Shannon entropy, Gini coefficient, top-10 concentration), monthly dominant artists, and long-term return patterns.
- **`/discoveries`** — Narrative evidence-based insight cards and transparent pipeline methodology audit (`pipeline_manifest.json` summary, identifiability rules, and ≥30s qualified play breakdown).
- **`/history`** — Full listening history explorer across all 19,267 records with debounced search, duration threshold filter (`All`, `Qualified ≥ 30s`, `Brief < 30s`), multi-column sorting, and pagination.
- **Global Date Range Filter** — Located in the sticky header; dynamically recalculates all sections, charts, and rankings for any selected date window or preset.

---

## 4. Privacy & Security Notes

- **100% Local Processing**: All data parsing, filtering, and visualization run locally in your browser. Zero external API calls, third-party image fetches, or analytics trackers are used.
- **Version Control Exclusions**: `.gitignore` excludes `SpotifyData/`, `derived_data/`, and `web/public/data/` so personal listening history is never committed to Git.
- **Deployment Caution**: Do not deploy `web/public/data/` to a public static host without authentication/access controls, as static assets in `public/data/` would be readable by anyone with the URL.
