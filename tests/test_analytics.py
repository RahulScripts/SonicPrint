"""
Tests for Soundprint analytics engine:
- Total listening time recalculation
- Daily, weekly, and monthly trends
- Top tracks and artists ranking
- Replay metrics and most-replayed tracks
- Listening streaks and calendar heatmap
- Time-of-day and day-of-week distributions
- Diversity metrics (Shannon entropy, Gini, ratios)
- Custom scores and music profile
- Verification that no unidentifiable records contaminate analytics
"""

import pytest
from soundprint.analytics import SoundprintAnalytics
from soundprint.pipeline import SoundprintPipeline, load_cleaned_history


@pytest.fixture(scope="module")
def cleaned_records():
    pipeline = SoundprintPipeline(source_dir="SpotifyData", derived_dir="derived_data")
    pipeline.run()
    return load_cleaned_history(derived_dir="derived_data")


class TestSoundprintAnalytics:
    def test_total_listening_time(self, cleaned_records):
        analytics = SoundprintAnalytics(cleaned_records)
        totals = analytics.total_listening_time()

        assert totals["total_streams"] == 19063
        assert totals["total_ms"] == 3323709376
        assert totals["total_hours"] == round(3323709376 / 3600000.0, 2)
        assert totals["total_days"] > 0

    def test_top_entities_no_unidentifiable_tracks(self, cleaned_records):
        analytics = SoundprintAnalytics(cleaned_records)
        top_data = analytics.top_tracks_and_artists(limit=50)

        for track_item in top_data["top_tracks_by_plays"]:
            assert track_item["artistName"].lower() != "unknown artist"
            assert track_item["trackName"].lower() != "unknown track"
            assert track_item["playCount"] > 0

        for track_item in top_data["top_tracks_by_duration"]:
            assert track_item["artistName"].lower() != "unknown artist"
            assert track_item["trackName"].lower() != "unknown track"
            assert track_item["msPlayed"] > 0

        for artist_item in top_data["top_artists_by_plays"]:
            assert artist_item["artistName"].lower() != "unknown artist"
            assert artist_item["playCount"] > 0

        for artist_item in top_data["top_artists_by_duration"]:
            assert artist_item["artistName"].lower() != "unknown artist"
            assert artist_item["msPlayed"] > 0

    def test_activity_trends(self, cleaned_records):
        analytics = SoundprintAnalytics(cleaned_records)
        trends = analytics.activity_trends()

        assert len(trends["daily"]) > 0
        assert len(trends["weekly"]) > 0
        assert len(trends["monthly"]) > 0

        # Check daily structure and sorting
        prev_date = ""
        for day in trends["daily"]:
            assert day["date"] > prev_date
            assert day["playCount"] > 0
            assert day["msPlayed"] >= 0
            prev_date = day["date"]

    def test_replay_metrics(self, cleaned_records):
        analytics = SoundprintAnalytics(cleaned_records)
        replays = analytics.replay_metrics(limit=20)

        assert replays["total_unique_tracks"] == 5388
        assert replays["replayed_tracks_count"] > 0
        assert replays["single_listen_tracks_count"] > 0
        assert (
            replays["total_unique_tracks"]
            == replays["replayed_tracks_count"] + replays["single_listen_tracks_count"]
        )
        assert 0.0 <= replays["track_replay_percentage"] <= 100.0

        for m in replays["most_replayed_tracks"]:
            assert m["playCount"] >= 2
            assert m["replayCount"] == m["playCount"] - 1

    def test_streaks_and_heatmap(self, cleaned_records):
        analytics = SoundprintAnalytics(cleaned_records)
        streaks = analytics.streaks_and_calendar_heatmap()

        assert streaks["total_active_days"] > 0
        assert streaks["longest_streak_days"] >= 1
        assert streaks["current_streak_days"] >= 1
        assert len(streaks["calendar_heatmap"]) == streaks["total_active_days"]

    def test_temporal_patterns(self, cleaned_records):
        analytics = SoundprintAnalytics(cleaned_records)
        temporal = analytics.temporal_patterns()

        assert len(temporal["hourly_distribution"]) == 24
        assert len(temporal["day_of_week_distribution"]) == 7
        assert 0 <= temporal["peak_hour"] <= 23
        assert temporal["peak_day"] in [
            "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
        ]

        total_hourly_plays = sum(h["playCount"] for h in temporal["hourly_distribution"])
        assert total_hourly_plays == len(cleaned_records)

    def test_diversity_metrics(self, cleaned_records):
        analytics = SoundprintAnalytics(cleaned_records)
        div = analytics.diversity_metrics()

        assert div["total_streams"] == 19063
        assert div["unique_artists"] == 2108
        assert div["unique_tracks"] == 5388
        assert div["artist_shannon_entropy"] > 0.0
        assert div["track_shannon_entropy"] > 0.0
        assert 0.0 <= div["artist_gini_coefficient"] <= 1.0
        assert 0.0 <= div["top_10_artists_play_share_percent"] <= 100.0

    def test_scores_and_profile(self, cleaned_records):
        analytics = SoundprintAnalytics(cleaned_records)
        scores = analytics.listening_scores_and_profile()

        assert 0.0 <= scores["night_owl_percentage"] <= 100.0
        assert 0.0 <= scores["discovery_score"] <= 100.0
        assert 0.0 <= scores["consistency_score"] <= 100.0
        assert isinstance(scores["primary_archetypes"], list)
