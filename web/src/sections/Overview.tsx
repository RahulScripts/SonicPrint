import { Link } from "react-router-dom"
import {
  ActivityIcon,
  ArrowRightIcon,
  CalendarCheck2Icon,
  CompassIcon,
  Disc3Icon,
  FlameIcon,
  HeadphonesIcon,
  HistoryIcon,
  MicVocalIcon,
  MoonIcon,
  RepeatIcon,
  SparklesIcon,
} from "lucide-react"
import { useData } from "@/context/useData"
import {
  formatDate,
  formatDuration,
  formatHourLabel,
  formatNumber,
} from "@/lib/format"
import { StatCard } from "@/components/shared/StatCard"
import { InsightCard } from "@/components/shared/InsightCard"
import { ActivitySparkline } from "@/components/charts/ActivitySparkline"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function Overview() {
  const { analytics, extended, manifest } = useData()

  if (!analytics || !extended) return null

  const {
    overview,
    diversity,
    scores_and_profile,
    replays,
    streaks,
    top_music,
    activity_trends,
  } = analytics

  const activeDays = Math.max(1, streaks.total_active_days)
  const avgDailyHours = overview.total_hours / activeDays
  const avgDailyPlays = overview.total_streams / activeDays

  const topTrack = top_music.top_tracks_by_plays[0]
  const topArtist = top_music.top_artists_by_plays[0]
  const qual = extended.qualificationBreakdown

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-card to-surface p-6 ring-1 ring-white/[0.08] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">
                Digital Musical Footprint
              </Badge>
              <span className="type-mono text-xs text-text-secondary">
                {formatDate(streaks.first_active_date)} –{" "}
                {formatDate(streaks.last_active_date)}
              </span>
            </div>

            <h1 className="type-hero text-foreground">
              {formatNumber(overview.total_hours, 1)}{" "}
              <span className="text-primary">hours</span> of music
            </h1>

            <p className="type-body-lg max-w-2xl text-text-secondary">
              Across{" "}
              <strong className="font-mono text-foreground">
                {formatNumber(overview.total_streams)}
              </strong>{" "}
              identifiable streams ({formatNumber(overview.total_days, 1)}{" "}
              continuous days of audio), spanning{" "}
              <strong className="font-mono text-foreground">
                {formatNumber(diversity.unique_tracks)}
              </strong>{" "}
              tracks and{" "}
              <strong className="font-mono text-foreground">
                {formatNumber(diversity.unique_artists)}
              </strong>{" "}
              artists.
            </p>

            {scores_and_profile.primary_archetypes.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {scores_and_profile.primary_archetypes.map((arch) => (
                  <Badge
                    key={arch}
                    variant="secondary"
                    className="bg-panel text-foreground border border-white/10"
                  >
                    <SparklesIcon className="mr-1 size-3 text-primary" />
                    {arch}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button asChild size="lg">
              <Link to="/timeline">
                <ActivityIcon data-icon="inline-start" />
                Explore Timeline
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/history">
                <HistoryIcon data-icon="inline-start" />
                Browse Records
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 4 Headline Metrics */}
      <section
        aria-label="Key listening metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          label="Recorded Streams"
          value={formatNumber(overview.total_streams)}
          sublabel={`${formatNumber(qual.qualifiedPlaysCount)} qualified plays (≥30s) · ${qual.qualifiedPercentage}%`}
          icon={HeadphonesIcon}
          highlight
        />
        <StatCard
          label="Unique Tracks"
          value={formatNumber(diversity.unique_tracks)}
          sublabel={`${formatNumber(replays.replayed_tracks_count)} replayed (${replays.track_replay_percentage}%)`}
          icon={Disc3Icon}
        />
        <StatCard
          label="Unique Artists"
          value={formatNumber(diversity.unique_artists)}
          sublabel={`Top 10 account for ${diversity.top_10_artists_play_share_percent}% of plays`}
          icon={MicVocalIcon}
        />
        <StatCard
          label="Daily Average"
          value={`${formatNumber(avgDailyHours, 1)} hrs`}
          sublabel={`${formatNumber(avgDailyPlays, 0)} plays/day across ${formatNumber(streaks.total_active_days)} active days`}
          icon={CalendarCheck2Icon}
        />
      </section>

      {/* Top Track & Top Artist Highlight Row */}
      {topTrack && topArtist && (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="bg-card ring-1 ring-primary/25">
            <CardHeader>
              <div>
                <span className="type-label text-primary">#1 Most-Played Track</span>
                <CardTitle className="mt-1 text-xl font-bold text-foreground">
                  {topTrack.trackName}
                </CardTitle>
                <CardDescription className="text-text-secondary">
                  by {topTrack.artistName}
                </CardDescription>
              </div>
              <CardAction>
                <Button asChild variant="ghost" size="xs">
                  <Link to="/tracks">
                    All Tracks
                    <ArrowRightIcon data-icon="inline-end" />
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-6 pt-1">
              <div>
                <div className="font-mono text-2xl font-bold text-primary">
                  {formatNumber(topTrack.playCount)} plays
                </div>
                <div className="type-caption text-text-tertiary">
                  {formatNumber(topTrack.playCount - 1)} repeat listens
                </div>
              </div>
              <div>
                <div className="font-mono text-2xl font-bold text-foreground">
                  {formatNumber(topTrack.hours, 2)} hrs
                </div>
                <div className="type-caption text-text-tertiary">
                  {formatDuration(topTrack.msPlayed)} total listening time
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <div>
                <span className="type-label text-primary">#1 Most-Played Artist</span>
                <CardTitle className="mt-1 text-xl font-bold text-foreground">
                  {topArtist.artistName}
                </CardTitle>
                <CardDescription className="text-text-secondary">
                  {formatNumber(topArtist.uniqueTracks)} distinct tracks in rotation
                </CardDescription>
              </div>
              <CardAction>
                <Button asChild variant="ghost" size="xs">
                  <Link to="/artists">
                    All Artists
                    <ArrowRightIcon data-icon="inline-end" />
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-6 pt-1">
              <div>
                <div className="font-mono text-2xl font-bold text-primary">
                  {formatNumber(topArtist.playCount)} plays
                </div>
                <div className="type-caption text-text-tertiary">
                  {formatNumber(
                    (topArtist.playCount / Math.max(1, overview.total_streams)) * 100,
                    2
                  )}
                  % of total streams
                </div>
              </div>
              <div>
                <div className="font-mono text-2xl font-bold text-foreground">
                  {formatNumber(topArtist.hours, 2)} hrs
                </div>
                <div className="type-caption text-text-tertiary">
                  {formatDuration(topArtist.msPlayed)} total listening time
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Mini Listening Activity Sparkline */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="type-section-title">
              Listening Activity Pulse
            </CardTitle>
            <CardDescription>
              Daily listening hours across{" "}
              {formatNumber(activity_trends.daily.length)} active dates
            </CardDescription>
          </div>
          <CardAction>
            <Button asChild variant="secondary" size="sm">
              <Link to="/timeline">
                Full Timeline
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ActivitySparkline data={activity_trends.daily} />
        </CardContent>
      </Card>

      {/* Curated Evidence-Based Findings */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="type-section-title">Evidence-Based Highlights</h2>
            <p className="type-body text-text-secondary">
              Key behavioral patterns verified directly from your timestamped play records
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/discoveries">
              All Discoveries
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InsightCard
            title="Nocturnal Listener"
            category="Time of Day"
            metric={`${scores_and_profile.night_owl_percentage}%`}
            metricLabel="between 10 PM and 6 AM"
            description={`More than half of all your recorded streams happen late at night. Your single most active hour is ${formatHourLabel(scores_and_profile.peak_hour)}, and ${scores_and_profile.peak_day} is your highest-volume day of the week.`}
            evidence={`Peak hour: ${formatHourLabel(scores_and_profile.peak_hour)} · Peak day: ${scores_and_profile.peak_day}`}
            icon={MoonIcon}
            accent="green"
          />

          <InsightCard
            title="Obsessive Replay Behavior"
            category="Track Loyalty"
            metric={topTrack ? `${formatNumber(topTrack.playCount)}×` : "—"}
            metricLabel={topTrack ? `${topTrack.trackName}` : ""}
            description={
              topTrack
                ? `Your #1 track "${topTrack.trackName}" by ${topTrack.artistName} was replayed ${formatNumber(topTrack.playCount - 1)} times for ${formatNumber(topTrack.hours, 2)} hours. Across your library, ${replays.track_replay_percentage}% of tracks account for ${formatNumber(replays.total_replay_streams)} repeat streams.`
                : "No replay data in current filter."
            }
            evidence={`${formatNumber(replays.replayed_tracks_count)} replayed tracks vs ${formatNumber(replays.single_listen_tracks_count)} single-listen tracks`}
            icon={RepeatIcon}
            accent="blue"
          />

          <InsightCard
            title="Streak Master"
            category="Consistency"
            metric={`${streaks.longest_streak_days} days`}
            metricLabel="longest consecutive streak"
            description={`You logged music on ${formatNumber(streaks.total_active_days)} distinct calendar days (${scores_and_profile.consistency_score}% span consistency), finishing the export window on an active ${streaks.current_streak_days}-day streak.`}
            evidence={`Active days: ${streaks.total_active_days} · Current streak: ${streaks.current_streak_days} days`}
            icon={FlameIcon}
            accent="yellow"
          />

          <InsightCard
            title="Eclectic Explorer"
            category="Catalog Breadth"
            metric={`${scores_and_profile.discovery_score}%`}
            metricLabel="casual discovery rate"
            description={`${scores_and_profile.discovery_score}% of the ${formatNumber(diversity.unique_artists)} artists in your history were sampled once or twice, yielding a high artist Shannon entropy of ${diversity.artist_shannon_entropy}.`}
            evidence={`Artist entropy: ${diversity.artist_shannon_entropy} · Track entropy: ${diversity.track_shannon_entropy}${manifest ? ` · Cleaned ${formatNumber(manifest.total_retained_count)}/${formatNumber(manifest.total_original_count)} raw events` : ""}`}
            icon={CompassIcon}
            accent="purple"
          />
        </div>
      </section>
    </div>
  )
}
