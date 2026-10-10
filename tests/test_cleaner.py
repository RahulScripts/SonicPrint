"""
Unit tests for soundprint.cleaner:
- Missing fields
- Blank and whitespace-only values
- Null/None values
- Case variations
- Playback duration edge cases (0 ms, short durations)
- Normal identifiable records
- Repeatable filtering
"""

import pytest
from soundprint.cleaner import (
    evaluate_record,
    filter_records,
    is_identifiable_record,
    is_unidentifiable_artist,
    is_unidentifiable_track,
)


class TestUnidentifiableArtist:
    def test_null_or_none(self):
        assert is_unidentifiable_artist(None) is True

    def test_empty_string(self):
        assert is_unidentifiable_artist("") is True

    def test_whitespace_only(self):
        assert is_unidentifiable_artist("   ") is True
        assert is_unidentifiable_artist("\t\n\r") is True

    def test_exact_unknown_artist(self):
        assert is_unidentifiable_artist("Unknown Artist") is True

    def test_case_variations(self):
        assert is_unidentifiable_artist("unknown artist") is True
        assert is_unidentifiable_artist("UNKNOWN ARTIST") is True
        assert is_unidentifiable_artist("UnKnOwN aRtIsT") is True

    def test_whitespace_with_case_variations(self):
        assert is_unidentifiable_artist("  Unknown Artist  ") is True
        assert is_unidentifiable_artist("\tUNKNOWN ARTIST\n") is True

    def test_valid_artist(self):
        assert is_unidentifiable_artist("Radiohead") is False
        assert is_unidentifiable_artist("稲葉曇") is False
        assert is_unidentifiable_artist("The Unknowns") is False  # Substring should not match
        assert is_unidentifiable_artist("Artist Unknown") is False


class TestUnidentifiableTrack:
    def test_null_or_none(self):
        assert is_unidentifiable_track(None) is True

    def test_empty_string(self):
        assert is_unidentifiable_track("") is True

    def test_whitespace_only(self):
        assert is_unidentifiable_track("   ") is True
        assert is_unidentifiable_track("\t\n") is True

    def test_exact_unknown_track(self):
        assert is_unidentifiable_track("Unknown Track") is True

    def test_case_variations(self):
        assert is_unidentifiable_track("unknown track") is True
        assert is_unidentifiable_track("UNKNOWN TRACK") is True
        assert is_unidentifiable_track("uNkNoWn TrAcK") is True

    def test_whitespace_with_case_variations(self):
        assert is_unidentifiable_track("  Unknown Track  ") is True
        assert is_unidentifiable_track("   unknown track \t") is True

    def test_valid_track(self):
        assert is_unidentifiable_track("Paranoid Android") is False
        assert is_unidentifiable_track("ハルノ寂寞") is False
        assert is_unidentifiable_track("Track 1") is False


class TestEvaluateRecord:
    def test_missing_artist_name_key(self):
        rec = {"trackName": "Song", "msPlayed": 1000}
        identifiable, reason = evaluate_record(rec)
        assert identifiable is False
        assert reason == "missing_artist_name"

    def test_missing_track_name_key(self):
        rec = {"artistName": "Artist", "msPlayed": 1000}
        identifiable, reason = evaluate_record(rec)
        assert identifiable is False
        assert reason == "missing_track_name"

    def test_both_keys_missing(self):
        rec = {"endTime": "2026-01-01 12:00", "msPlayed": 1000}
        identifiable, reason = evaluate_record(rec)
        assert identifiable is False

    def test_null_fields(self):
        rec1 = {"artistName": None, "trackName": "Song", "msPlayed": 1000}
        rec2 = {"artistName": "Artist", "trackName": None, "msPlayed": 1000}
        assert evaluate_record(rec1)[0] is False
        assert evaluate_record(rec2)[0] is False

    def test_blank_values(self):
        rec1 = {"artistName": "  ", "trackName": "Song", "msPlayed": 1000}
        rec2 = {"artistName": "Artist", "trackName": "", "msPlayed": 1000}
        assert evaluate_record(rec1)[0] is False
        assert evaluate_record(rec2)[0] is False

    def test_case_variation_exclusions(self):
        cases = [
            {"artistName": "unknown artist", "trackName": "Song", "msPlayed": 5000},
            {"artistName": "UNKNOWN ARTIST", "trackName": "Song", "msPlayed": 5000},
            {"artistName": "Artist", "trackName": "unknown track", "msPlayed": 5000},
            {"artistName": "Artist", "trackName": "  UNKNOWN TRACK  ", "msPlayed": 5000},
            {"artistName": " Unknown Artist ", "trackName": " Unknown Track ", "msPlayed": 5000},
        ]
        for c in cases:
            assert is_identifiable_record(c) is False

    def test_zero_and_short_duration_preserved(self):
        rec_zero = {
            "endTime": "2026-05-01 10:00",
            "artistName": "Daft Punk",
            "trackName": "One More Time",
            "msPlayed": 0,
        }
        rec_short = {
            "endTime": "2026-05-01 10:01",
            "artistName": "Daft Punk",
            "trackName": "One More Time",
            "msPlayed": 120,
        }
        assert is_identifiable_record(rec_zero) is True
        assert is_identifiable_record(rec_short) is True

    def test_normal_identifiable_record_fields_preserved(self):
        orig = {
            "endTime": "2026-08-20 15:30",
            "artistName": "Within Temptation",
            "trackName": "Angels",
            "msPlayed": 158375,
            "customField": "extra_value",
        }
        retained, excluded = filter_records([orig])
        assert len(retained) == 1
        assert len(excluded) == 0
        assert retained[0] == orig

    def test_redundant_loop_excluded(self):
        loop_rec_22 = {
            "endTime": "2026-08-22 22:53",
            "artistName": "稲葉曇",
            "trackName": "ハルノ寂寞",
            "msPlayed": 188333,
        }
        loop_rec_23 = {
            "endTime": "2026-08-23 09:22",
            "artistName": "稲葉曇",
            "trackName": "ハルノ寂寞",
            "msPlayed": 60005,
        }
        other_day_rec = {
            "endTime": "2026-08-21 00:05",
            "artistName": "稲葉曇",
            "trackName": "ハルノ寂寞",
            "msPlayed": 188333,
        }
        assert evaluate_record(loop_rec_22) == (False, "redundant_loop_entry")
        assert evaluate_record(loop_rec_23) == (False, "redundant_loop_entry")
        assert evaluate_record(other_day_rec) == (True, None)


class TestRepeatableFiltering:
    def test_filter_deterministic(self):
        sample = [
            {"artistName": "Radiohead", "trackName": "Creep", "msPlayed": 200000},
            {"artistName": "Unknown Artist", "trackName": "Unknown Track", "msPlayed": 50000},
            {"artistName": "Björk", "trackName": "Hyperballad", "msPlayed": 0},
            {"artistName": "  ", "trackName": "Song", "msPlayed": 1000},
            {"artistName": "Mili", "trackName": "UNKNOWN TRACK", "msPlayed": 180000},
        ]

        run1_ret, run1_excl = filter_records(sample)
        run2_ret, run2_excl = filter_records(sample)

        assert run1_ret == run2_ret
        assert run1_excl == run2_excl
        assert len(run1_ret) == 2  # Radiohead and Bjork
        assert len(run1_excl) == 3
        assert len(sample) == len(run1_ret) + len(run1_excl)
