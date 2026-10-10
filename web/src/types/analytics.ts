export interface ListeningRecord {
  endTime: string // "YYYY-MM-DD HH:MM"
  artistName: string
  trackName: string
  msPlayed: number
}

export interface OverviewStats {
  total_ms: number
  total_seconds: number
  total_minutes: number
  total_hours: number
  total_days: number
  total_streams: number
}

export interface DiversityMetrics {
  total_streams: number
  unique_artists: number
  unique_tracks: number
  artist_diversity_ratio: number
  track_diversity_ratio: number
  artist_shannon_entropy: number
  track_shannon_entropy: number
  artist_gini_coefficient: number
  top_10_artists_play_share_percent: number
}

export interface ListenerProfile {
  night_owl_percentage: number
  discovery_score: number
  consistency_score: number
  primary_archetypes: string[]
  peak_hour: number
  peak_day: string
}

export interface ReplayedTrack {
  rank: number
  artistName: string
  trackName: string
  playCount: number
  replayCount: number
  msPlayed: number
  hours: number
}

export interface ReplayMetrics {
  total_unique_tracks: number
  replayed_tracks_count: number
  single_listen_tracks_count: number
  total_replay_streams: number
  track_replay_percentage: number
  most_replayed_tracks: ReplayedTrack[]
}

export interface HeatmapDay {
  playCount: number
  msPlayed: number
  hours: number
}

export interface StreakMetrics {
  total_active_days: number
  longest_streak_days: number
  current_streak_days: number
  first_active_date: string | null
  last_active_date: string | null
  calendar_heatmap: Record<string, HeatmapDay>
}

export interface RankedTrack {
  rank: number
  artistName: string
  trackName: string
  playCount: number
  msPlayed: number
  hours: number
}

export interface RankedArtist {
  rank: number
  artistName: string
  playCount: number
  msPlayed: number
  hours: number
  uniqueTracks: number
}

export interface TopMusic {
  top_tracks_by_plays: RankedTrack[]
  top_tracks_by_duration: RankedTrack[]
  top_artists_by_plays: RankedArtist[]
  top_artists_by_duration: RankedArtist[]
}

export interface HourlyDistributionItem {
  hour: number
  label: string
  playCount: number
  msPlayed: number
  hours: number
  percentage: number
}

export interface DayOfWeekDistributionItem {
  dayIndex: number
  dayName: string
  playCount: number
  msPlayed: number
  hours: number
  percentage: number
}

export interface TemporalPatterns {
  peak_hour: number
  peak_day: string
  hourly_distribution: HourlyDistributionItem[]
  day_of_week_distribution: DayOfWeekDistributionItem[]
}

export interface DailyActivity {
  date: string
  msPlayed: number
  hours: number
  playCount: number
  uniqueTracks: number
  uniqueArtists: number
}

export interface WeeklyActivity {
  isoWeek: string
  msPlayed: number
  hours: number
  playCount: number
}

export interface MonthlyActivity {
  month: string
  msPlayed: number
  hours: number
  playCount: number
}

export interface ActivityTrends {
  daily: DailyActivity[]
  weekly: WeeklyActivity[]
  monthly: MonthlyActivity[]
}

export interface AnalyticsSummary {
  overview: OverviewStats
  diversity: DiversityMetrics
  scores_and_profile: ListenerProfile
  replays: ReplayMetrics
  streaks: StreakMetrics
  top_music: TopMusic
  temporal: TemporalPatterns
  activity_trends: ActivityTrends
}

export interface PipelineFileManifest {
  source_filename: string
  source_filepath: string
  target_filepath: string
  sha256_before: string
  sha256_after: string
  original_count: number
  retained_count: number
  excluded_count: number
  original_duration_ms: number
  retained_duration_ms: number
  excluded_duration_ms: number
  validation_passed: boolean
}

export interface PipelineManifest {
  files: PipelineFileManifest[]
  total_original_count: number
  total_retained_count: number
  total_excluded_count: number
  total_original_duration_ms: number
  total_retained_duration_ms: number
  total_excluded_duration_ms: number
  unique_artists_count: number
  unique_tracks_count: number
  all_validations_passed: boolean
  derived_dir: string
}

export interface DateRange {
  from: Date | undefined
  to: Date | undefined
}
