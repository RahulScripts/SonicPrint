"""
Soundprint Music Analytics Engine.
Calculates all music-related analytics strictly from the cleaned dataset.
"""

from collections import Counter, defaultdict
from datetime import datetime, timedelta
import math
from typing import Any, Dict, List, Optional, Tuple


class SoundprintAnalytics:
    """
    Computes music analytics from a collection of cleaned Spotify streaming records.
    Every record is guaranteed to be identifiable.
    """

    def __init__(self, records: List[Dict[str, Any]]):
        self.records = records

    @classmethod
    def from_cleaned_dataset(cls, cleaned_records: List[Dict[str, Any]]) -> "SoundprintAnalytics":
        """Instantiate analytics engine from the cleaned dataset."""
        return cls(cleaned_records)

    def total_listening_time(self) -> Dict[str, Any]:
        """Calculates total listening time in ms, seconds, minutes, hours, and days."""
        total_ms = sum(r.get("msPlayed", 0) for r in self.records)
        seconds = total_ms / 1000.0
        minutes = seconds / 60.0
        hours = minutes / 60.0
        days = hours / 24.0

        return {
            "total_ms": total_ms,
            "total_seconds": round(seconds, 2),
            "total_minutes": round(minutes, 2),
            "total_hours": round(hours, 2),
            "total_days": round(days, 2),
            "total_streams": len(self.records),
        }

    def activity_trends(self) -> Dict[str, Any]:
        """Calculates daily, weekly, and monthly listening activity."""
        daily_map = defaultdict(lambda: {"msPlayed": 0, "playCount": 0, "tracks": set(), "artists": set()})
        weekly_map = defaultdict(lambda: {"msPlayed": 0, "playCount": 0})
        monthly_map = defaultdict(lambda: {"msPlayed": 0, "playCount": 0})

        for r in self.records:
            end_time = r.get("endTime", "")
            if not end_time or len(end_time) < 10:
                continue
            date_str = end_time[:10]  # YYYY-MM-DD
            month_str = end_time[:7]  # YYYY-MM
            ms = r.get("msPlayed", 0)
            artist = r.get("artistName", "")
            track = r.get("trackName", "")

            # Daily
            daily_map[date_str]["msPlayed"] += ms
            daily_map[date_str]["playCount"] += 1
            daily_map[date_str]["tracks"].add((artist, track))
            daily_map[date_str]["artists"].add(artist)

            # Weekly
            try:
                dt = datetime.strptime(date_str, "%Y-%m-%d")
                year, week, _ = dt.isocalendar()
                week_str = f"{year}-W{week:02d}"
                weekly_map[week_str]["msPlayed"] += ms
                weekly_map[week_str]["playCount"] += 1
            except ValueError:
                pass

            # Monthly
            monthly_map[month_str]["msPlayed"] += ms
            monthly_map[month_str]["playCount"] += 1

        daily_list = [
            {
                "date": d,
                "msPlayed": data["msPlayed"],
                "hours": round(data["msPlayed"] / 3600000.0, 2),
                "playCount": data["playCount"],
                "uniqueTracks": len(data["tracks"]),
                "uniqueArtists": len(data["artists"]),
            }
            for d, data in sorted(daily_map.items())
        ]

        weekly_list = [
            {
                "isoWeek": w,
                "msPlayed": data["msPlayed"],
                "hours": round(data["msPlayed"] / 3600000.0, 2),
                "playCount": data["playCount"],
            }
            for w, data in sorted(weekly_map.items())
        ]

        monthly_list = [
            {
                "month": m,
                "msPlayed": data["msPlayed"],
                "hours": round(data["msPlayed"] / 3600000.0, 2),
                "playCount": data["playCount"],
            }
            for m, data in sorted(monthly_map.items())
        ]

        return {
            "daily": daily_list,
            "weekly": weekly_list,
            "monthly": monthly_list,
        }

    def top_tracks_and_artists(self, limit: int = 50) -> Dict[str, Any]:
        """Calculates top tracks and artists ranked by play count and listening duration."""
        track_plays = Counter()
        track_durations = defaultdict(int)
        artist_plays = Counter()
        artist_durations = defaultdict(int)
        artist_tracks = defaultdict(set)

        for r in self.records:
            artist = r.get("artistName", "").strip()
            track = r.get("trackName", "").strip()
            ms = r.get("msPlayed", 0)

            key = (artist, track)
            track_plays[key] += 1
            track_durations[key] += ms

            artist_plays[artist] += 1
            artist_durations[artist] += ms
            artist_tracks[artist].add(track)

        # Top tracks by play count
        top_tracks_by_plays = []
        for rank, ((artist, track), count) in enumerate(track_plays.most_common(limit), start=1):
            ms = track_durations[(artist, track)]
            top_tracks_by_plays.append({
                "rank": rank,
                "artistName": artist,
                "trackName": track,
                "playCount": count,
                "msPlayed": ms,
                "hours": round(ms / 3600000.0, 2),
            })

        # Top tracks by duration
        sorted_tracks_by_dur = sorted(track_durations.items(), key=lambda x: x[1], reverse=True)[:limit]
        top_tracks_by_duration = []
        for rank, ((artist, track), ms) in enumerate(sorted_tracks_by_dur, start=1):
            top_tracks_by_duration.append({
                "rank": rank,
                "artistName": artist,
                "trackName": track,
                "msPlayed": ms,
                "hours": round(ms / 3600000.0, 2),
                "playCount": track_plays[(artist, track)],
            })

        # Top artists by play count
        top_artists_by_plays = []
        for rank, (artist, count) in enumerate(artist_plays.most_common(limit), start=1):
            ms = artist_durations[artist]
            top_artists_by_plays.append({
                "rank": rank,
                "artistName": artist,
                "playCount": count,
                "msPlayed": ms,
                "hours": round(ms / 3600000.0, 2),
                "uniqueTracks": len(artist_tracks[artist]),
            })

        # Top artists by duration
        sorted_artists_by_dur = sorted(artist_durations.items(), key=lambda x: x[1], reverse=True)[:limit]
        top_artists_by_duration = []
        for rank, (artist, ms) in enumerate(sorted_artists_by_dur, start=1):
            top_artists_by_duration.append({
                "rank": rank,
                "artistName": artist,
                "msPlayed": ms,
                "hours": round(ms / 3600000.0, 2),
                "playCount": artist_plays[artist],
                "uniqueTracks": len(artist_tracks[artist]),
            })

        return {
            "top_tracks_by_plays": top_tracks_by_plays,
            "top_tracks_by_duration": top_tracks_by_duration,
            "top_artists_by_plays": top_artists_by_plays,
            "top_artists_by_duration": top_artists_by_duration,
        }

    def replay_metrics(self, limit: int = 50) -> Dict[str, Any]:
        """Calculates replay counts and most-replayed tracks."""
        track_plays = Counter()
        track_durations = defaultdict(int)

        for r in self.records:
            artist = r.get("artistName", "").strip()
            track = r.get("trackName", "").strip()
            key = (artist, track)
            track_plays[key] += 1
            track_durations[key] += r.get("msPlayed", 0)

        total_unique_tracks = len(track_plays)
        replayed_tracks = {k: v for k, v in track_plays.items() if v > 1}
        replayed_tracks_count = len(replayed_tracks)
        single_listen_tracks_count = total_unique_tracks - replayed_tracks_count

        total_replay_streams = sum(v - 1 for v in replayed_tracks.values())
        replay_rate = (replayed_tracks_count / total_unique_tracks * 100.0) if total_unique_tracks else 0.0

        most_replayed = []
        for rank, ((artist, track), count) in enumerate(
            sorted(replayed_tracks.items(), key=lambda x: x[1], reverse=True)[:limit],
            start=1,
        ):
            most_replayed.append({
                "rank": rank,
                "artistName": artist,
                "trackName": track,
                "playCount": count,
                "replayCount": count - 1,
                "msPlayed": track_durations[(artist, track)],
                "hours": round(track_durations[(artist, track)] / 3600000.0, 2),
            })

        return {
            "total_unique_tracks": total_unique_tracks,
            "replayed_tracks_count": replayed_tracks_count,
            "single_listen_tracks_count": single_listen_tracks_count,
            "total_replay_streams": total_replay_streams,
            "track_replay_percentage": round(replay_rate, 2),
            "most_replayed_tracks": most_replayed,
        }

    def streaks_and_calendar_heatmap(self) -> Dict[str, Any]:
        """Calculates listening streaks and calendar heatmap of daily listening activity."""
        daily_stats = defaultdict(lambda: {"playCount": 0, "msPlayed": 0})
        for r in self.records:
            end_time = r.get("endTime", "")
            if end_time and len(end_time) >= 10:
                d = end_time[:10]
                daily_stats[d]["playCount"] += 1
                daily_stats[d]["msPlayed"] += r.get("msPlayed", 0)

        active_dates = sorted([datetime.strptime(d, "%Y-%m-%d").date() for d in daily_stats.keys()])

        longest_streak = 0
        current_streak = 0
        temp_streak = 0
        prev_date = None

        for d in active_dates:
            if prev_date is None:
                temp_streak = 1
            elif d == prev_date + timedelta(days=1):
                temp_streak += 1
            else:
                temp_streak = 1
            longest_streak = max(longest_streak, temp_streak)
            prev_date = d

        # Current streak calculated up to the latest active day in the dataset
        if active_dates:
            current_streak = 1
            for i in range(len(active_dates) - 1, 0, -1):
                if active_dates[i] - active_dates[i - 1] == timedelta(days=1):
                    current_streak += 1
                else:
                    break

        heatmap = {
            d: {
                "playCount": data["playCount"],
                "msPlayed": data["msPlayed"],
                "hours": round(data["msPlayed"] / 3600000.0, 2),
            }
            for d, data in sorted(daily_stats.items())
        }

        return {
            "total_active_days": len(active_dates),
            "longest_streak_days": longest_streak,
            "current_streak_days": current_streak,
            "first_active_date": str(active_dates[0]) if active_dates else None,
            "last_active_date": str(active_dates[-1]) if active_dates else None,
            "calendar_heatmap": heatmap,
        }

    def temporal_patterns(self) -> Dict[str, Any]:
        """Calculates time-of-day (hourly) and day-of-week patterns."""
        hour_counts = [0] * 24
        hour_ms = [0] * 24

        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        dow_counts = [0] * 7
        dow_ms = [0] * 7

        total_plays = len(self.records)

        for r in self.records:
            end_time = r.get("endTime", "")
            if not end_time:
                continue
            ms = r.get("msPlayed", 0)
            try:
                dt = datetime.strptime(end_time, "%Y-%m-%d %H:%M")
                h = dt.hour
                hour_counts[h] += 1
                hour_ms[h] += ms

                d = dt.weekday()  # 0 = Monday
                dow_counts[d] += 1
                dow_ms[d] += ms
            except ValueError:
                pass

        hourly_dist = [
            {
                "hour": h,
                "label": f"{h:02d}:00 - {h:02d}:59",
                "playCount": hour_counts[h],
                "msPlayed": hour_ms[h],
                "hours": round(hour_ms[h] / 3600000.0, 2),
                "percentage": round(hour_counts[h] / total_plays * 100.0, 2) if total_plays else 0.0,
            }
            for h in range(24)
        ]

        dow_dist = [
            {
                "dayIndex": d,
                "dayName": day_names[d],
                "playCount": dow_counts[d],
                "msPlayed": dow_ms[d],
                "hours": round(dow_ms[d] / 3600000.0, 2),
                "percentage": round(dow_counts[d] / total_plays * 100.0, 2) if total_plays else 0.0,
            }
            for d in range(7)
        ]

        peak_hour = max(range(24), key=lambda h: hour_counts[h]) if total_plays else 0
        peak_day_idx = max(range(7), key=lambda d: dow_counts[d]) if total_plays else 0

        return {
            "peak_hour": peak_hour,
            "peak_day": day_names[peak_day_idx],
            "hourly_distribution": hourly_dist,
            "day_of_week_distribution": dow_dist,
        }

    def diversity_metrics(self) -> Dict[str, Any]:
        """Calculates artist and track diversity, Shannon entropy, Gini coefficient, and top shares."""
        total_plays = len(self.records)
        artist_counts = Counter()
        track_counts = Counter()
        artist_ms = defaultdict(int)

        for r in self.records:
            artist = r.get("artistName", "").strip()
            track = r.get("trackName", "").strip()
            ms = r.get("msPlayed", 0)

            artist_counts[artist] += 1
            track_counts[(artist, track)] += 1
            artist_ms[artist] += ms

        unique_artists = len(artist_counts)
        unique_tracks = len(track_counts)

        # Diversity ratios
        artist_diversity_ratio = round(unique_artists / total_plays, 4) if total_plays else 0.0
        track_diversity_ratio = round(unique_tracks / total_plays, 4) if total_plays else 0.0

        # Shannon entropy
        artist_entropy = 0.0
        for count in artist_counts.values():
            p = count / total_plays
            if p > 0:
                artist_entropy -= p * math.log(p)

        track_entropy = 0.0
        for count in track_counts.values():
            p = count / total_plays
            if p > 0:
                track_entropy -= p * math.log(p)

        # Gini coefficient of artist play counts
        sorted_counts = sorted(artist_counts.values())
        n = len(sorted_counts)
        if n > 0 and sum(sorted_counts) > 0:
            cumulative = 0
            for i, val in enumerate(sorted_counts, start=1):
                cumulative += i * val
            gini = (2.0 * cumulative) / (n * sum(sorted_counts)) - (n + 1.0) / n
        else:
            gini = 0.0

        # Top 10 artist concentration
        top_10_plays = sum(count for _, count in artist_counts.most_common(10))
        top_10_share_percent = round(top_10_plays / total_plays * 100.0, 2) if total_plays else 0.0

        return {
            "total_streams": total_plays,
            "unique_artists": unique_artists,
            "unique_tracks": unique_tracks,
            "artist_diversity_ratio": artist_diversity_ratio,
            "track_diversity_ratio": track_diversity_ratio,
            "artist_shannon_entropy": round(artist_entropy, 3),
            "track_shannon_entropy": round(track_entropy, 3),
            "artist_gini_coefficient": round(gini, 3),
            "top_10_artists_play_share_percent": top_10_share_percent,
        }

    def listening_scores_and_profile(self) -> Dict[str, Any]:
        """Calculates custom listening scores and profile characteristics."""
        temporal = self.temporal_patterns()
        diversity = self.diversity_metrics()
        streaks = self.streaks_and_calendar_heatmap()

        # Night owl listening: 22:00 to 05:59
        night_hours = {22, 23, 0, 1, 2, 3, 4, 5}
        night_plays = sum(
            item["playCount"] for item in temporal["hourly_distribution"] if item["hour"] in night_hours
        )
        total_plays = diversity["total_streams"]
        night_ratio = round(night_plays / total_plays * 100.0, 2) if total_plays else 0.0

        # Discovery score: percentage of artists played only once or twice
        artist_counts = Counter(r.get("artistName", "").strip() for r in self.records)
        casual_artists = sum(1 for c in artist_counts.values() if c <= 2)
        discovery_score = round(casual_artists / len(artist_counts) * 100.0, 2) if artist_counts else 0.0

        # Consistency score: active days / total days in span
        if streaks["first_active_date"] and streaks["last_active_date"]:
            d_start = datetime.strptime(streaks["first_active_date"], "%Y-%m-%d").date()
            d_end = datetime.strptime(streaks["last_active_date"], "%Y-%m-%d").date()
            span_days = max(1, (d_end - d_start).days + 1)
            consistency_score = round(streaks["total_active_days"] / span_days * 100.0, 2)
        else:
            consistency_score = 0.0

        profile_archetypes = []
        if night_ratio > 35.0:
            profile_archetypes.append("Nocturnal Listener")
        if discovery_score > 60.0:
            profile_archetypes.append("Eclectic Explorer")
        elif discovery_score < 30.0:
            profile_archetypes.append("Loyal Repeater")
        if diversity["artist_diversity_ratio"] > 0.15:
            profile_archetypes.append("Wide Spectrum")
        if streaks["longest_streak_days"] >= 14:
            profile_archetypes.append("Streak Master")

        return {
            "night_owl_percentage": night_ratio,
            "discovery_score": discovery_score,
            "consistency_score": consistency_score,
            "primary_archetypes": profile_archetypes,
            "peak_hour": temporal["peak_hour"],
            "peak_day": temporal["peak_day"],
        }

    def generate_full_report(self) -> Dict[str, Any]:
        """Aggregates all recalculated Soundprint music analytics into a complete summary."""
        return {
            "overview": self.total_listening_time(),
            "diversity": self.diversity_metrics(),
            "scores_and_profile": self.listening_scores_and_profile(),
            "replays": self.replay_metrics(limit=20),
            "streaks": self.streaks_and_calendar_heatmap(),
            "top_music": self.top_tracks_and_artists(limit=20),
            "temporal": self.temporal_patterns(),
            "activity_trends": self.activity_trends(),
        }
