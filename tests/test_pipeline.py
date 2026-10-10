"""
Pipeline tests for Soundprint:
- Invariant verification: original = retained + excluded
- Source data immutability verification
- Repeatability of filtering
- Derived files parse correctly and contain only identifiable records
"""

import json
import os
import shutil
import tempfile
import pytest

from soundprint.pipeline import SoundprintPipeline, calculate_sha256, load_cleaned_history
from soundprint.cleaner import is_identifiable_record


class TestSoundprintPipeline:
    def test_pipeline_on_real_spotify_data(self):
        pipeline = SoundprintPipeline(source_dir="SpotifyData", derived_dir="derived_data")
        result = pipeline.run()

        assert result.all_validations_passed is True
        assert len(result.files) == 3

        # Validate each file
        for f in result.files:
            assert f.validation_passed is True
            assert f.original_count == f.retained_count + f.excluded_count
            assert f.original_duration_ms == f.retained_duration_ms + f.excluded_duration_ms
            assert f.sha256_before == f.sha256_after, f"Source file {f.source_filename} was modified!"
            assert os.path.exists(f.target_filepath)

            # Verify target file parses and has valid JSON
            with open(f.target_filepath, "r", encoding="utf-8") as fp:
                data = json.load(fp)
            assert len(data) == f.retained_count
            for record in data:
                assert is_identifiable_record(record) is True

        # Validate totals
        assert result.total_original_count == result.total_retained_count + result.total_excluded_count
        assert result.total_original_duration_ms == result.total_retained_duration_ms + result.total_excluded_duration_ms
        assert result.total_original_count == 21884
        assert result.total_retained_count == 19063
        assert result.total_excluded_count == 2821
        assert result.unique_artists_count == 2108
        assert result.unique_tracks_count == 5388

    def test_pipeline_preserves_source_files_byte_for_byte(self):
        source_files = [
            "SpotifyData/StreamingHistory_music_0.json",
            "SpotifyData/StreamingHistory_music_1.json",
            "SpotifyData/StreamingHistory_music_2.json",
        ]
        hashes_before = {fn: calculate_sha256(fn) for fn in source_files}

        with tempfile.TemporaryDirectory() as tmp_dir:
            pipeline = SoundprintPipeline(source_dir="SpotifyData", derived_dir=tmp_dir)
            pipeline.run()

            hashes_after = {fn: calculate_sha256(fn) for fn in source_files}
            assert hashes_before == hashes_after

    def test_pipeline_handles_copy_suffix_aliases(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            pipeline = SoundprintPipeline(
                source_dir="SpotifyData",
                derived_dir=tmp_dir,
                target_files=[
                    "StreamingHistory_music_0(1).json",
                    "StreamingHistory_music_1(3).json",
                    "StreamingHistory_music_2(3).json",
                ],
            )
            result = pipeline.run()
            assert result.all_validations_passed is True
            assert result.total_original_count == 21884
            assert result.total_retained_count == 19063

    def test_repeatable_filtering(self):
        with tempfile.TemporaryDirectory() as tmp_dir1, tempfile.TemporaryDirectory() as tmp_dir2:
            p1 = SoundprintPipeline(source_dir="SpotifyData", derived_dir=tmp_dir1)
            r1 = p1.run()

            p2 = SoundprintPipeline(source_dir="SpotifyData", derived_dir=tmp_dir2)
            r2 = p2.run()

            assert r1.total_retained_count == r2.total_retained_count
            assert r1.total_excluded_count == r2.total_excluded_count
            assert r1.total_retained_duration_ms == r2.total_retained_duration_ms

            # File content byte-for-byte check
            for fn in ["StreamingHistory_music_0.json", "StreamingHistory_music_1.json", "StreamingHistory_music_2.json"]:
                path1 = os.path.join(tmp_dir1, fn)
                path2 = os.path.join(tmp_dir2, fn)
                assert calculate_sha256(path1) == calculate_sha256(path2)
