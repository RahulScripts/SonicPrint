# SonicPrint — Personal Music Listening Analytics

**SonicPrint** is a privacy-first, local-only personal music analytics application that transforms a raw Spotify Extended/Account Data export into an interactive visual footprint of your listening habits.

---

## Project Structure

```text
SonicPrint/
├── soundprint/              # Python data-cleaning & analytics pipeline
│   ├── cleaner.py           # Deterministic filtering of unidentifiable & redundant loop records
│   ├── analytics.py         # 8-module analytics calculator (streaks, entropy, temporal, replays)
│   ├── pipeline.py          # SHA-256 verified ingestion, invariant checks, manifest output
│   ├── spotify_snapshots.py # Read-only isolation for Spotify-provided snapshots
│   └── cli.py               # CLI entry point
├── tests/                   # Pytest suite (41 unit & pipeline tests)
├── web/                     # React 19 + TypeScript + Vite + Tailwind v4 + shadcn/ui frontend
│   ├── src/
│   │   ├── components/      # Themed shadcn/ui primitives, Recharts visualizations, layout shell
│   │   ├── context/         # DataProvider & global date range filter state
│   │   ├── lib/             # Client-side analytics recalculation engine & formatters
│   │   ├── sections/        # Overview, Timeline, TrackAnalysis, ArtistAnalysis, Discoveries, HistoryExplorer
│   │   └── types/           # TypeScript interfaces
├── DESIGN.md                # Spotify-inspired dark-first design system specification
├── designSysIntegration.md  # Design system + shadcn/ui integration guide
└── masterPrompt.md          # Project specification
```

---

## Quick Start

### 1. Run the Python Data Pipeline

Place your raw Spotify export files (`StreamingHistory_music_*.json`) inside `SpotifyData/`, then run:

```bash
python -m soundprint.cli
```

Copy the generated files from `derived_data/` into `web/public/data/`:

```powershell
New-Item -ItemType Directory -Force -Path "web/public/data"
Copy-Item "derived_data/analytics_summary.json" "web/public/data/analytics_summary.json" -Force
Copy-Item "derived_data/StreamingHistory_music_cleaned_all.json" "web/public/data/cleaned_all.json" -Force
Copy-Item "derived_data/pipeline_manifest.json" "web/public/data/pipeline_manifest.json" -Force
```

### 2. Launch the Frontend

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## How to get your Spotify data?

Go to your Spotify account's ["account privacy" page](https://www.spotify.com/us/account/privacy/), and request your data from Spotify.

Spotify takes about 7-10 days to get your data and send it to you. 
    
---

## Privacy & Data Handling

- **Zero External Transmission**: All processing and rendering happen locally. No external APIs or tracking scripts are used.
