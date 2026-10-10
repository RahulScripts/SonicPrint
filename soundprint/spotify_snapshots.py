"""
Spotify-provided summaries handler.
Keeps Spotify-generated snapshots (Wrapped2025, SoundCapsule, etc.) strictly separate
from Soundprint's recalculated analytics and prevents rewriting or mixing.
"""

import json
import os
import re
from typing import Any, Dict, List, Optional


class SpotifySnapshotManager:
    """
    Manages Spotify export summaries and library files as read-only snapshots.
    Explicitly labels them and keeps them isolated from Soundprint recalculated metrics.
    """

    def __init__(self, data_dir: str = "SpotifyData"):
        self.data_dir = data_dir

    def _resolve_file(self, filename: str) -> Optional[str]:
        direct = os.path.join(self.data_dir, filename)
        if os.path.exists(direct):
            return direct

        # Try without (1) or (3) suffix
        base_match = re.match(r"([A-Za-z0-9_]+)(?:\(\d+\))?\.json", filename)
        if base_match:
            clean = f"{base_match.group(1)}.json"
            clean_path = os.path.join(self.data_dir, clean)
            if os.path.exists(clean_path):
                return clean_path

        return None

    def _load_snapshot(self, filename: str, display_title: str) -> Optional[Dict[str, Any]]:
        path = self._resolve_file(filename)
        if not path or not os.path.exists(path):
            return None

        with open(path, "r", encoding="utf-8") as f:
            content = json.load(f)

        return {
            "source_type": "Spotify-provided snapshot",
            "source_file": os.path.basename(path),
            "display_title": display_title,
            "is_soundprint_recalculated": False,
            "isolated": True,
            "data": content,
        }

    def get_wrapped_2025(self) -> Optional[Dict[str, Any]]:
        """Wrapped 2025 Spotify snapshot."""
        return self._load_snapshot("Wrapped2025.json", "Spotify Wrapped 2025 (Official Snapshot)")

    def get_sound_capsule(self) -> Optional[Dict[str, Any]]:
        """Your Sound Capsule Spotify snapshot."""
        return self._load_snapshot("YourSoundCapsule.json", "Spotify Sound Capsule (Official Snapshot)")

    def get_taste_profile(self) -> Optional[Dict[str, Any]]:
        """Spotify Inferred Taste Profile snapshot."""
        return self._load_snapshot("TasteProfile.json", "Spotify Inferred Taste Profile")

    def get_library(self) -> Optional[Dict[str, Any]]:
        """User Library (Saved tracks, albums, artists). Identifiable entries are preserved."""
        return self._load_snapshot("YourLibrary.json", "Spotify User Library")

    def get_playlists(self) -> Optional[Dict[str, Any]]:
        """User Playlists. Saved playlist entries are preserved intact."""
        return self._load_snapshot("Playlist1.json", "Spotify User Playlists")

    def get_all_snapshots_metadata(self) -> Dict[str, Any]:
        """Returns inventory of all available Spotify snapshots with isolation status."""
        snapshot_names = [
            ("Wrapped2025.json", "Wrapped 2025"),
            ("YourSoundCapsule.json", "Sound Capsule"),
            ("TasteProfile.json", "Taste Profile"),
            ("YourLibrary.json", "Your Library"),
            ("Playlist1.json", "Playlist 1"),
        ]

        inventory = {}
        for fn, title in snapshot_names:
            resolved = self._resolve_file(fn)
            exists = resolved is not None and os.path.exists(resolved)
            inventory[fn] = {
                "title": title,
                "found": exists,
                "path": resolved,
                "classification": "Spotify-provided snapshot",
                "mixed_into_soundprint_analytics": False,
                "read_only": True,
            }

        return inventory
