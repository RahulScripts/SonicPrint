"""
Soundprint Data Pipeline - Ingests, filters, and generates the derived cleaned dataset.
Preserves original Spotify export source files without modification.
"""

from dataclasses import dataclass, asdict
import hashlib
import json
import os
import re
from typing import Any, Dict, List, Optional, Tuple

from soundprint.cleaner import filter_records, evaluate_record


def calculate_sha256(filepath: str) -> str:
    """Calculate SHA-256 hash of a file to verify immutability."""
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


@dataclass
class FileProcessingResult:
    source_filename: str
    source_filepath: str
    target_filepath: str
    sha256_before: str
    sha256_after: str
    original_count: int
    retained_count: int
    excluded_count: int
    original_duration_ms: int
    retained_duration_ms: int
    excluded_duration_ms: int
    validation_passed: bool


@dataclass
class PipelineResult:
    files: List[FileProcessingResult]
    total_original_count: int
    total_retained_count: int
    total_excluded_count: int
    total_original_duration_ms: int
    total_retained_duration_ms: int
    total_excluded_duration_ms: int
    unique_artists_count: int
    unique_tracks_count: int
    all_validations_passed: bool
    derived_dir: str


class SoundprintPipeline:
    """
    Orchestrates the ingestion, filtering, and saving of Spotify streaming history records.
    """

    def __init__(
        self,
        source_dir: str = "SpotifyData",
        derived_dir: str = "derived_data",
        target_files: Optional[List[str]] = None,
    ):
        self.source_dir = source_dir
        self.derived_dir = derived_dir
        self.target_files = target_files or [
            "StreamingHistory_music_0.json",
            "StreamingHistory_music_1.json",
            "StreamingHistory_music_2.json",
        ]

    def resolve_source_file(self, filename: str) -> str:
        """
        Resolves a filename in source_dir, handling optional (1)/(3) copy suffixes.
        """
        direct_path = os.path.join(self.source_dir, filename)
        if os.path.exists(direct_path):
            return direct_path

        # Try base name without copy suffix
        base_match = re.match(r"(StreamingHistory_music_\d+)(?:\(\d+\))?\.json", filename)
        if base_match:
            clean_name = f"{base_match.group(1)}.json"
            clean_path = os.path.join(self.source_dir, clean_name)
            if os.path.exists(clean_path):
                return clean_path

        # Look for any matching file in source_dir
        prefix = filename.split(".")[0].split("(")[0]
        if os.path.exists(self.source_dir):
            for candidate in os.listdir(self.source_dir):
                if candidate.startswith(prefix) and candidate.endswith(".json"):
                    return os.path.join(self.source_dir, candidate)

        raise FileNotFoundError(f"Could not resolve source file '{filename}' in '{self.source_dir}'")

    def run(self) -> PipelineResult:
        """
        Executes the filtering pipeline:
        1. Reads raw source history files.
        2. Filters out unidentifiable records.
        3. Validates invariants: orig == retained + excluded.
        4. Writes cleaned derived files to derived_dir.
        5. Verifies original source files were not modified.
        """
        os.makedirs(self.derived_dir, exist_ok=True)

        results: List[FileProcessingResult] = []
        all_retained: List[Dict[str, Any]] = []

        total_orig_count = 0
        total_ret_count = 0
        total_excl_count = 0
        total_orig_dur = 0
        total_ret_dur = 0
        total_excl_dur = 0
        all_validations_passed = True

        for fn in self.target_files:
            source_path = self.resolve_source_file(fn)
            sha_before = calculate_sha256(source_path)

            with open(source_path, "r", encoding="utf-8") as f:
                raw_records = json.load(f)

            orig_count = len(raw_records)
            orig_duration = sum(r.get("msPlayed", 0) for r in raw_records)

            retained, excluded = filter_records(raw_records)

            ret_count = len(retained)
            excl_count = len(excluded)
            ret_duration = sum(r.get("msPlayed", 0) for r in retained)
            excl_duration = sum(r.get("msPlayed", 0) for r in excluded)

            # Invariant checks
            count_check = (orig_count == ret_count + excl_count)
            duration_check = (orig_duration == ret_duration + excl_duration)

            target_name = os.path.basename(source_path)
            target_path = os.path.join(self.derived_dir, target_name)

            # Write cleaned records to derived directory
            with open(target_path, "w", encoding="utf-8") as f:
                json.dump(retained, f, ensure_ascii=False, indent=2)

            # Re-check source file hash to guarantee it was not altered or overwritten
            sha_after = calculate_sha256(source_path)
            immutability_check = (sha_before == sha_after)

            passed = count_check and duration_check and immutability_check
            if not passed:
                all_validations_passed = False

            results.append(
                FileProcessingResult(
                    source_filename=os.path.basename(source_path),
                    source_filepath=os.path.abspath(source_path),
                    target_filepath=os.path.abspath(target_path),
                    sha256_before=sha_before,
                    sha256_after=sha_after,
                    original_count=orig_count,
                    retained_count=ret_count,
                    excluded_count=excl_count,
                    original_duration_ms=orig_duration,
                    retained_duration_ms=ret_duration,
                    excluded_duration_ms=excl_duration,
                    validation_passed=passed,
                )
            )

            all_retained.extend(retained)
            total_orig_count += orig_count
            total_ret_count += ret_count
            total_excl_count += excl_count
            total_orig_dur += orig_duration
            total_ret_dur += ret_duration
            total_excl_dur += excl_duration

        # Also write a combined cleaned dataset for easy consumption by downstream components
        combined_path = os.path.join(self.derived_dir, "StreamingHistory_music_cleaned_all.json")
        with open(combined_path, "w", encoding="utf-8") as f:
            json.dump(all_retained, f, ensure_ascii=False, indent=2)

        unique_artists = {r["artistName"].strip() for r in all_retained if r.get("artistName")}
        unique_tracks = {
            (r["artistName"].strip(), r["trackName"].strip())
            for r in all_retained
            if r.get("artistName") and r.get("trackName")
        }

        pipeline_result = PipelineResult(
            files=results,
            total_original_count=total_orig_count,
            total_retained_count=total_ret_count,
            total_excluded_count=total_excl_count,
            total_original_duration_ms=total_orig_dur,
            total_retained_duration_ms=total_ret_dur,
            total_excluded_duration_ms=total_excl_dur,
            unique_artists_count=len(unique_artists),
            unique_tracks_count=len(unique_tracks),
            all_validations_passed=all_validations_passed,
            derived_dir=os.path.abspath(self.derived_dir),
        )

        # Save manifest
        manifest_path = os.path.join(self.derived_dir, "pipeline_manifest.json")
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(asdict(pipeline_result), f, ensure_ascii=False, indent=2)

        return pipeline_result


def load_cleaned_history(derived_dir: str = "derived_data") -> List[Dict[str, Any]]:
    """
    Standard loader for Soundprint analytics components.
    Guarantees only the cleaned derived dataset is consumed.
    """
    combined_path = os.path.join(derived_dir, "StreamingHistory_music_cleaned_all.json")
    if os.path.exists(combined_path):
        with open(combined_path, "r", encoding="utf-8") as f:
            return json.load(f)

    # Otherwise load all individual files in derived_dir
    cleaned_records = []
    for fn in sorted(os.listdir(derived_dir)):
        if fn.startswith("StreamingHistory_music_") and fn.endswith(".json") and fn != "StreamingHistory_music_cleaned_all.json":
            with open(os.path.join(derived_dir, fn), "r", encoding="utf-8") as f:
                cleaned_records.extend(json.load(f))
    return cleaned_records
