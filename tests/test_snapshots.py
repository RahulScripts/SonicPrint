"""
Tests for Spotify snapshot isolation and non-modification.
"""

import json
import os
import pytest
from soundprint.spotify_snapshots import SpotifySnapshotManager
from soundprint.pipeline import calculate_sha256


class TestSpotifySnapshots:
    def test_snapshots_isolated_and_labeled(self):
        mgr = SpotifySnapshotManager(data_dir="SpotifyData")
        meta = mgr.get_all_snapshots_metadata()

        for filename, info in meta.items():
            assert info["classification"] == "Spotify-provided snapshot"
            assert info["mixed_into_soundprint_analytics"] is False
            assert info["read_only"] is True

    def test_wrapped_snapshot_structure(self):
        mgr = SpotifySnapshotManager(data_dir="SpotifyData")
        wrapped = mgr.get_wrapped_2025()
        assert wrapped is not None
        assert wrapped["source_type"] == "Spotify-provided snapshot"
        assert wrapped["is_soundprint_recalculated"] is False
        assert "topArtists" in wrapped["data"]

    def test_sound_capsule_snapshot_structure(self):
        mgr = SpotifySnapshotManager(data_dir="SpotifyData")
        capsule = mgr.get_sound_capsule()
        assert capsule is not None
        assert capsule["source_type"] == "Spotify-provided snapshot"
        assert capsule["is_soundprint_recalculated"] is False
        assert "stats" in capsule["data"]

    def test_library_and_playlist_saved_tracks_preserved(self):
        mgr = SpotifySnapshotManager(data_dir="SpotifyData")
        lib = mgr.get_library()
        playlists = mgr.get_playlists()

        assert lib is not None
        assert len(lib["data"].get("tracks", [])) == 680

        assert playlists is not None
        assert len(playlists["data"].get("playlists", [])) == 24

    def test_snapshot_files_immutability(self):
        files = [
            "SpotifyData/Wrapped2025.json",
            "SpotifyData/YourSoundCapsule.json",
            "SpotifyData/TasteProfile.json",
            "SpotifyData/YourLibrary.json",
            "SpotifyData/Playlist1.json",
        ]
        hashes = {f: calculate_sha256(f) for f in files if os.path.exists(f)}
        # Read files through snapshot manager
        mgr = SpotifySnapshotManager(data_dir="SpotifyData")
        _ = mgr.get_wrapped_2025()
        _ = mgr.get_sound_capsule()
        _ = mgr.get_taste_profile()
        _ = mgr.get_library()
        _ = mgr.get_playlists()

        # Re-check hashes
        hashes_after = {f: calculate_sha256(f) for f in files if os.path.exists(f)}
        assert hashes == hashes_after
