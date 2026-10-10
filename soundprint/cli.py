"""
Soundprint CLI - Command line interface to execute the data pipeline and generate analytics reports.
"""

import argparse
import json
import os
import sys

from soundprint.pipeline import SoundprintPipeline, load_cleaned_history
from soundprint.analytics import SoundprintAnalytics
from soundprint.spotify_snapshots import SpotifySnapshotManager


def format_duration(ms: int) -> str:
    hours = ms / 3600000.0
    return f"{ms:,} ms ({hours:,.2f} hrs)"


def run_soundprint(source_dir: str = "SpotifyData", derived_dir: str = "derived_data") -> int:
    print("=" * 70)
    print(" SOUNDPRINT DATA PIPELINE - FILTER UNIDENTIFIABLE MUSIC RECORDS")
    print("=" * 70)

    # 1. Run Pipeline
    pipeline = SoundprintPipeline(source_dir=source_dir, derived_dir=derived_dir)
    res = pipeline.run()

    print(f"\nProcessing completed. Cleaned dataset saved to: {res.derived_dir}")
    print("\n--- PER-FILE BREAKDOWN ---")
    for f in res.files:
        status_sym = "[OK]" if f.validation_passed else "[FAIL]"
        print(f"\nFile: {f.source_filename} {status_sym}")
        print(f"  Original Records:  {f.original_count:,}")
        print(f"  Retained Records:  {f.retained_count:,}")
        print(f"  Excluded Records:  {f.excluded_count:,}")
        print(f"  Invariant Check:   {f.original_count} == {f.retained_count} + {f.excluded_count} -> {f.original_count == f.retained_count + f.excluded_count}")
        print(f"  Original Duration: {format_duration(f.original_duration_ms)}")
        print(f"  Retained Duration: {format_duration(f.retained_duration_ms)}")
        print(f"  Excluded Duration: {format_duration(f.excluded_duration_ms)}")
        print(f"  Source Unchanged:  {f.sha256_before == f.sha256_after} (SHA-256 verified)")

    print("\n--- AGGREGATE SUMMARY ---")
    print(f"Total Original Records:  {res.total_original_count:,}")
    print(f"Total Retained Records:  {res.total_retained_count:,}")
    print(f"Total Excluded Records:  {res.total_excluded_count:,}")
    print(f"Total Original Duration: {format_duration(res.total_original_duration_ms)}")
    print(f"Total Retained Duration: {format_duration(res.total_retained_duration_ms)}")
    print(f"Total Excluded Duration: {format_duration(res.total_excluded_duration_ms)}")
    print(f"Unique Identifiable Artists: {res.unique_artists_count:,}")
    print(f"Unique Identifiable Tracks:  {res.unique_tracks_count:,}")
    print(f"All Validations Passed:      {res.all_validations_passed}")

    # 2. Recalculate Soundprint Analytics from Cleaned Dataset
    print("\n--- RECALCULATING SOUNDPRINT ANALYTICS ---")
    cleaned_records = load_cleaned_history(derived_dir=derived_dir)
    analytics = SoundprintAnalytics.from_cleaned_dataset(cleaned_records)
    full_report = analytics.generate_full_report()

    report_path = os.path.join(derived_dir, "analytics_summary.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(full_report, f, ensure_ascii=False, indent=2)
    print(f"Recalculated analytics saved to: {report_path}")

    # 3. Inspect Spotify-provided snapshots
    print("\n--- SPOTIFY-PROVIDED SNAPSHOTS (ISOLATED & UNMODIFIED) ---")
    snapshot_mgr = SpotifySnapshotManager(data_dir=source_dir)
    snapshots = snapshot_mgr.get_all_snapshots_metadata()
    for name, meta in snapshots.items():
        found_str = "Found" if meta["found"] else "Not Found"
        print(f"  {name} ({meta['title']}): {found_str} | Classified as '{meta['classification']}' (Unmixed)")

    print("\n" + "=" * 70)
    print(" SOUNDPRINT PIPELINE EXECUTION SUCCESSFUL")
    print("=" * 70)
    return 0 if res.all_validations_passed else 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Soundprint Data Pipeline")
    parser.add_argument("--source-dir", default="SpotifyData", help="Source Spotify export directory")
    parser.add_argument("--derived-dir", default="derived_data", help="Target cleaned dataset directory")
    args = parser.parse_args()

    sys.exit(run_soundprint(source_dir=args.source_dir, derived_dir=args.derived_dir))
