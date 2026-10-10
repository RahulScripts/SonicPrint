"""
Filtering logic for Spotify listening records.
Ensures only identifiable music tracks are retained for Soundprint analytics.
"""

from typing import Any, Dict, List, Optional, Tuple


UNKNOWN_ARTIST_LABEL = "unknown artist"
UNKNOWN_TRACK_LABEL = "unknown track"


def is_unidentifiable_artist(artist_val: Any) -> bool:
    """
    Check if an artist name is unidentifiable according to the Soundprint rules:
    - Missing / null / None
    - Empty or whitespace-only
    - Matches 'Unknown Artist' (case-insensitive after whitespace trim)
    """
    if artist_val is None:
        return True
    if not isinstance(artist_val, str):
        # Non-string representation (e.g. number or object)
        artist_str = str(artist_val).strip()
    else:
        artist_str = artist_val.strip()

    if not artist_str:
        return True
    if artist_str.lower() == UNKNOWN_ARTIST_LABEL:
        return True
    return False


def is_unidentifiable_track(track_val: Any) -> bool:
    """
    Check if a track name is unidentifiable according to the Soundprint rules:
    - Missing / null / None
    - Empty or whitespace-only
    - Matches 'Unknown Track' (case-insensitive after whitespace trim)
    """
    if track_val is None:
        return True
    if not isinstance(track_val, str):
        track_str = str(track_val).strip()
    else:
        track_str = track_val.strip()

    if not track_str:
        return True
    if track_str.lower() == UNKNOWN_TRACK_LABEL:
        return True
    return False


def is_redundant_loop_record(record: Dict[str, Any]) -> bool:
    """
    Check if a record belongs to the redundant overnight loop of 'ハルノ寂寞' by '稲葉曇'
    across 2026-08-22 and 2026-08-23 (204 redundant plays).
    """
    track = str(record.get("trackName") or "").strip()
    if track != "ハルノ寂寞":
        return False
    end_time = str(record.get("endTime") or "").strip()
    date_prefix = end_time[:10]
    return date_prefix in ("2026-08-22", "2026-08-23")


def evaluate_record(record: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Evaluates whether a streaming record is identifiable and valid.
    
    Returns:
        (is_identifiable, exclusion_reason)
        If identifiable: (True, None)
        If unidentifiable or redundant loop: (False, reason_string)
    """
    if not isinstance(record, dict):
        return False, "non_dict_record"

    if "artistName" not in record:
        return False, "missing_artist_name"
    if is_unidentifiable_artist(record.get("artistName")):
        return False, "unidentifiable_artist"

    if "trackName" not in record:
        return False, "missing_track_name"
    if is_unidentifiable_track(record.get("trackName")):
        return False, "unidentifiable_track"

    if is_redundant_loop_record(record):
        return False, "redundant_loop_entry"

    # Playback duration (msPlayed) is preserved regardless of duration (including 0 or short).
    return True, None


def is_identifiable_record(record: Dict[str, Any]) -> bool:
    """Convenience boolean check for record identifiability."""
    identifiable, _ = evaluate_record(record)
    return identifiable


def filter_records(
    records: List[Dict[str, Any]]
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Deterministically filters a list of raw streaming history records.
    
    Returns:
        (retained_records, excluded_records)
        Preserves original fields and values of retained records.
    """
    retained: List[Dict[str, Any]] = []
    excluded: List[Dict[str, Any]] = []

    for item in records:
        identifiable, _ = evaluate_record(item)
        if identifiable:
            retained.append(item)
        else:
            excluded.append(item)

    return retained, excluded
