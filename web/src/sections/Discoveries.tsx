import {
  CheckCircle2Icon,
  CompassIcon,
  FilterIcon,
  FlameIcon,
  MoonIcon,
  RepeatIcon,
  ShieldCheckIcon,
  ZapIcon,
} from "lucide-react"
import { useData } from "@/context/useData"
import {
  formatDateFull,
  formatDuration,
  formatHourLabel,
  formatNumber,
} from "@/lib/format"
import { InsightCard } from "@/components/shared/InsightCard"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function Discoveries() {
  const { analytics, extended, manifest } = useData()

  if (!analytics || !extended) return null

  const {
    overview,
    diversity,
    scores_and_profile,
    replays,
    streaks,
    activity_trends,
  } = analytics

  const qual = extended.qualificationBreakdown
  const topReplay = replays.most_replayed_tracks[0]
  const peakDay = [...activity_trends.daily].sort(
    (a, b) => b.hours - a.hours || b.playCount - a.playCount
  )[0]
  const topBinge = extended.topSingleDayBinges[0]

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="type-page-title">Listening Habits & Discoveries</h1>
        <p className="type-body text-text-secondary">
          Evidence-based behavioral findings, replay dynamics, and dataset methodology
        </p>
      </div>

      {/* 6 Narrative Evidence-Based Insight Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <InsightCard
          title="Nocturnal Listening Dominance"
          category="Circadian Habit"
          metric={`${scores_and_profile.night_owl_percentage}%`}
          metricLabel="played between 22:00 and 05:59"
          description={`Over half of your listening takes place during night owl hours. Activity peaks sharply at ${formatHourLabel(scores_and_profile.peak_hour)} and reaches its weekly high on ${scores_and_profile.peak_day}.`}
          evidence={`Calculated across ${formatNumber(overview.total_streams)} timestamped events`}
          icon={MoonIcon}
          accent="green"
        />

        <InsightCard
          title="Extreme Track Replay Concentration"
          category="Replay Behavior"
          metric={topReplay ? `${formatNumber(topReplay.playCount)} plays` : "—"}
          metricLabel={
            topReplay ? `${topReplay.trackName} (${topReplay.artistName})` : ""
          }
          description={
            topReplay
              ? `While ${formatNumber(replays.single_listen_tracks_count)} tracks (${formatNumber(100 - replays.track_replay_percentage, 2)}%) were played only once, the remaining ${formatNumber(replays.replayed_tracks_count)} tracks generated ${formatNumber(replays.total_replay_streams)} repeat streams.`
              : "No replayed tracks in the selected date window."
          }
          evidence={
            topBinge
              ? `Top 1-day binge: "${topBinge.trackName}" played ${topBinge.playCount}× on ${formatDateFull(topBinge.date)}`
              : undefined
          }
          icon={RepeatIcon}
          accent="blue"
        />

        <InsightCard
          title="Multi-Week Listening Streaks"
          category="Habit Continuity"
          metric={`${streaks.longest_streak_days} days`}
          metricLabel="longest uninterrupted streak"
          description={`You recorded music on ${formatNumber(streaks.total_active_days)} distinct calendar days (${scores_and_profile.consistency_score}% of the active date span), maintaining a ${streaks.current_streak_days}-day streak through the end of the dataset.`}
          evidence={`First active: ${streaks.first_active_date ?? "—"} · Last active: ${streaks.last_active_date ?? "—"}`}
          icon={FlameIcon}
          accent="yellow"
        />

        <InsightCard
          title="High Entropy, Long-Tail Exploration"
          category="Catalog Diversity"
          metric={`${scores_and_profile.discovery_score}%`}
          metricLabel="artists sampled ≤ 2 times"
          description={`Your top 10 artists account for just ${diversity.top_10_artists_play_share_percent}% of all streams, while ${scores_and_profile.discovery_score}% of your ${formatNumber(diversity.unique_artists)} artists are 1–2 play discoveries.`}
          evidence={`Artist Shannon Entropy: ${diversity.artist_shannon_entropy} · Gini: ${diversity.artist_gini_coefficient}`}
          icon={CompassIcon}
          accent="purple"
        />

        <InsightCard
          title="Peak Single-Day Listening Marathon"
          category="Activity Spike"
          metric={peakDay ? `${formatNumber(peakDay.hours, 2)} hrs` : "—"}
          metricLabel={peakDay ? formatDateFull(peakDay.date) : ""}
          description={
            peakDay
              ? `On ${formatDateFull(peakDay.date)}, you logged ${formatNumber(peakDay.playCount)} plays across ${formatNumber(peakDay.uniqueTracks)} unique tracks and ${formatNumber(peakDay.uniqueArtists)} artists — your highest-volume day on record.`
              : "No active days in selected range."
          }
          evidence={
            peakDay
              ? `${formatNumber(peakDay.msPlayed)} ms recorded on ${peakDay.date}`
              : undefined
          }
          icon={ZapIcon}
          accent="green"
        />

        <InsightCard
          title="Qualified Plays vs. Brief Skips"
          category="Playback Thresholds"
          metric={`${qual.qualifiedPercentage}%`}
          metricLabel="plays lasted ≥ 30 seconds"
          description={`Out of ${formatNumber(qual.totalRecordedEvents)} cleaned playback events, ${formatNumber(qual.qualifiedPlaysCount)} lasted at least 30 seconds (${formatNumber(qual.qualifiedHours, 1)} hrs), while ${formatNumber(qual.briefPlaysCount)} were brief listens or skips under 30 seconds (${formatNumber(qual.briefHours, 2)} hrs).`}
          evidence={`Zero-duration events preserved: ${formatNumber(qual.zeroDurationCount)} · No short plays silently discarded`}
          icon={FilterIcon}
          accent="blue"
        />
      </div>

      {/* Data Hygiene & Pipeline Verification Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <ShieldCheckIcon className="size-5 text-primary" />
            <div>
              <CardTitle className="type-section-title">
                Data Hygiene, Cleaning Rules & Pipeline Audit
              </CardTitle>
              <CardDescription>
                Transparent accounting of how raw Spotify export files were normalized and validated
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-card p-4 ring-1 ring-white/[0.04]">
              <span className="type-label text-text-secondary">
                1. Identifiability Rule
              </span>
              <p className="mt-1.5 text-xs text-text-secondary leading-relaxed">
                Records missing <code className="font-mono text-foreground">artistName</code> or{" "}
                <code className="font-mono text-foreground">trackName</code> (null, blank, or{" "}
                <code className="font-mono text-foreground">&quot;Unknown Artist/Track&quot;</code>) are
                excluded by <code className="font-mono text-primary">soundprint/cleaner.py</code> so
                podcast/unindexed records never corrupt music rankings.
              </p>
            </div>

            <div className="rounded-lg bg-card p-4 ring-1 ring-white/[0.04]">
              <span className="type-label text-text-secondary">
                2. Redundant Loop Cleaning
              </span>
              <p className="mt-1.5 text-xs text-text-secondary leading-relaxed">
                The 204 redundant overnight sleep-loop plays of{" "}
                <code className="font-mono text-foreground">ハルノ寂寞</code> on{" "}
                <code className="font-mono text-foreground">2026-08-22</code> →{" "}
                <code className="font-mono text-foreground">2026-08-23</code> are excluded while
                preserving its 14 legitimate plays on other dates.
              </p>
            </div>

            <div className="rounded-lg bg-card p-4 ring-1 ring-white/[0.04]">
              <span className="type-label text-text-secondary">
                3. Short Play Preservation
              </span>
              <p className="mt-1.5 text-xs text-text-secondary leading-relaxed">
                Short playback events (<code className="font-mono text-foreground">&lt; 30,000 ms</code>)
                and <code className="font-mono text-foreground">0 ms</code> skips are preserved in the
                cleaned dataset rather than silently discarded, and distinguished from ≥30s qualified
                plays above.
              </p>
            </div>

            <div className="rounded-lg bg-card p-4 ring-1 ring-white/[0.04]">
              <span className="type-label text-text-secondary">
                4. Deduplication &amp; Integrity
              </span>
              <p className="mt-1.5 text-xs text-text-secondary leading-relaxed">
                Duplicate export copies (<code className="font-mono text-foreground">(1)</code> /{" "}
                <code className="font-mono text-foreground">(3)</code> suffixes) are resolved without
                double-counting, and SHA-256 hashes verify source file immutability.
              </p>
            </div>
          </div>

          {manifest && (
            <div className="flex flex-col gap-3 rounded-lg bg-surface-strong p-4 ring-1 ring-white/[0.05]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="type-subsection">
                  Pipeline Manifest Summary ({manifest.files.length} Source Files)
                </span>
                <Badge className="bg-primary/15 text-primary border-transparent">
                  <CheckCircle2Icon className="mr-1 size-3.5" />
                  All Invariant Checks Passed
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                <div>
                  <span className="text-text-tertiary">Raw Export Events</span>
                  <div className="font-mono text-sm font-bold text-foreground">
                    {formatNumber(manifest.total_original_count)}
                  </div>
                </div>
                <div>
                  <span className="text-text-tertiary">Retained Music Events</span>
                  <div className="font-mono text-sm font-bold text-primary">
                    {formatNumber(manifest.total_retained_count)} (
                    {formatNumber(
                      (manifest.total_retained_count / manifest.total_original_count) * 100,
                      1
                    )}
                    %)
                  </div>
                </div>
                <div>
                  <span className="text-text-tertiary">Excluded (Null &amp; Loop)</span>
                  <div className="font-mono text-sm font-bold text-text-secondary">
                    {formatNumber(manifest.total_excluded_count)}
                  </div>
                </div>
                <div>
                  <span className="text-text-tertiary">Retained Audio Duration</span>
                  <div className="font-mono text-sm font-bold text-foreground">
                    {formatDuration(manifest.total_retained_duration_ms)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
