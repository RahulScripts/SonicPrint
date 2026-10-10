import * as React from "react"
import {
  CalendarIcon,
  Disc3Icon,
  FlameIcon,
  RepeatIcon,
  SparklesIcon,
} from "lucide-react"
import { useData } from "@/context/useData"
import type { RankedTrack } from "@/types/analytics"
import {
  formatDateFull,
  formatDuration,
  formatMonthLabel,
  formatNumber,
  formatTrackDuration,
} from "@/lib/format"
import { StatCard } from "@/components/shared/StatCard"
import {
  HorizontalBarChart,
  type HorizontalBarItem,
} from "@/components/charts/HorizontalBarChart"
import {
  RankedTable,
  type RankedTableColumn,
} from "@/components/shared/RankedTable"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export function TrackAnalysis() {
  const { analytics, extended } = useData()
  const [rankingMode, setRankingMode] = React.useState<"plays" | "duration">(
    "plays"
  )

  const chartItems = React.useMemo<HorizontalBarItem[]>(() => {
    if (!extended) return []
    const source =
      rankingMode === "plays"
        ? extended.allTracksByPlays.slice(0, 20)
        : extended.allTracksByDuration.slice(0, 20)

    return source.map((t) => ({
      id: `${t.artistName}-${t.trackName}`,
      rank: t.rank,
      label: t.trackName,
      sublabel: t.artistName,
      value: rankingMode === "plays" ? t.playCount : t.hours,
      formattedValue:
        rankingMode === "plays"
          ? `${formatNumber(t.playCount)} plays`
          : `${formatNumber(t.hours, 2)} hrs`,
      secondaryLabel:
        rankingMode === "plays" ? "Listening duration" : "Recorded plays",
      secondaryValue:
        rankingMode === "plays"
          ? `${formatNumber(t.hours, 2)} hrs`
          : `${formatNumber(t.playCount)} plays`,
    }))
  }, [extended, rankingMode])

  const columns = React.useMemo<RankedTableColumn<RankedTrack>[]>(
    () => [
      {
        key: "rank",
        header: "#",
        sortable: true,
        sortValue: (r) => r.rank,
        className: "w-14",
        render: (r) => (
          <Badge
            variant={r.rank <= 3 ? "default" : "secondary"}
            className={
              r.rank <= 3
                ? "bg-primary text-primary-foreground font-mono"
                : "bg-panel text-text-secondary font-mono"
            }
          >
            {r.rank}
          </Badge>
        ),
      },
      {
        key: "trackName",
        header: "Track",
        sortable: true,
        sortValue: (r) => r.trackName.toLowerCase(),
        render: (r) => (
          <div className="flex flex-col">
            <span className="font-bold text-foreground">{r.trackName}</span>
            <span className="text-xs text-text-secondary md:hidden">
              {r.artistName}
            </span>
          </div>
        ),
      },
      {
        key: "artistName",
        header: "Artist",
        sortable: true,
        sortValue: (r) => r.artistName.toLowerCase(),
        className: "hidden md:table-cell",
        render: (r) => (
          <span className="text-text-secondary">{r.artistName}</span>
        ),
      },
      {
        key: "playCount",
        header: "Plays",
        sortable: true,
        align: "right",
        sortValue: (r) => r.playCount,
        render: (r) => (
          <span className="font-mono font-bold text-primary">
            {formatNumber(r.playCount)}
          </span>
        ),
      },
      {
        key: "replays",
        header: "Replays",
        sortable: true,
        align: "right",
        sortValue: (r) => Math.max(0, r.playCount - 1),
        className: "hidden sm:table-cell",
        render: (r) => (
          <span className="font-mono text-text-secondary">
            {formatNumber(Math.max(0, r.playCount - 1))}
          </span>
        ),
      },
      {
        key: "hours",
        header: "Total Time",
        sortable: true,
        align: "right",
        sortValue: (r) => r.msPlayed,
        render: (r) => (
          <div className="flex flex-col items-end">
            <span className="font-mono font-medium text-foreground">
              {formatNumber(r.hours, 2)} hrs
            </span>
            <span className="type-caption text-text-tertiary">
              {formatDuration(r.msPlayed)}
            </span>
          </div>
        ),
      },
      {
        key: "avgPlay",
        header: "Avg / Play",
        sortable: true,
        align: "right",
        sortValue: (r) => (r.playCount > 0 ? r.msPlayed / r.playCount : 0),
        className: "hidden lg:table-cell",
        render: (r) => (
          <span className="font-mono text-xs text-text-secondary">
            {formatTrackDuration(
              r.playCount > 0 ? r.msPlayed / r.playCount : 0
            )}
          </span>
        ),
      },
    ],
    []
  )

  if (!analytics || !extended) return null

  const { replays, diversity } = analytics
  const tableData =
    rankingMode === "plays"
      ? extended.allTracksByPlays
      : extended.allTracksByDuration

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="type-page-title">Track Analysis</h1>
        <p className="type-body text-text-secondary">
          Individual song rankings, obsessive repeat binges, and monthly track dominance across{" "}
          {formatNumber(diversity.unique_tracks)} tracks
        </p>
      </div>

      {/* Headline Track & Replay Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Unique Tracks"
          value={formatNumber(replays.total_unique_tracks)}
          sublabel={`Track diversity ratio: ${diversity.track_diversity_ratio}`}
          icon={Disc3Icon}
        />
        <StatCard
          label="Replayed Tracks"
          value={formatNumber(replays.replayed_tracks_count)}
          sublabel={`${replays.track_replay_percentage}% of your catalog played 2+ times`}
          icon={RepeatIcon}
          highlight
        />
        <StatCard
          label="Repeat Streams"
          value={formatNumber(replays.total_replay_streams)}
          sublabel="Streams beyond the first listen of each song"
          icon={FlameIcon}
        />
        <StatCard
          label="Single-Listen Tracks"
          value={formatNumber(replays.single_listen_tracks_count)}
          sublabel="Sampled exactly once in your history"
          icon={SparklesIcon}
        />
      </div>

      <Tabs
        value={rankingMode}
        onValueChange={(v) => setRankingMode(v as "plays" | "duration")}
      >
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <TabsList>
            <TabsTrigger value="plays">Rank by Play Count</TabsTrigger>
            <TabsTrigger value="duration">Rank by Listening Time</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={rankingMode} className="mt-4 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="type-section-title">
                Top 20 Tracks by{" "}
                {rankingMode === "plays" ? "Play Count" : "Listening Duration"}
              </CardTitle>
              <CardDescription>
                {rankingMode === "plays"
                  ? "Most frequently streamed songs in your history"
                  : "Songs that occupied the greatest total hours of listening"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HorizontalBarChart
                items={chartItems}
                maxItems={20}
                unit={rankingMode === "plays" ? "" : "h"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="type-section-title">
                Complete Track Rankings ({formatNumber(tableData.length)} Tracks)
              </CardTitle>
              <CardDescription>
                Search any track or artist across your entire cleaned dataset and sort by any column
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RankedTable
                data={tableData}
                columns={columns}
                searchPlaceholder="Search track title or artist name..."
                searchFilter={(row, q) =>
                  row.trackName.toLowerCase().includes(q) ||
                  row.artistName.toLowerCase().includes(q)
                }
                defaultSortKey={rankingMode === "plays" ? "playCount" : "hours"}
                defaultSortDir="desc"
                maxRows={50}
                rowKey={(r) => `${r.artistName}-${r.trackName}`}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Monthly Dominant Tracks & Single-Day Repeat Binges */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-5 text-primary" />
              <div>
                <CardTitle className="type-card-title">
                  Tracks That Dominated Each Month
                </CardTitle>
                <CardDescription>
                  The single most-replayed song during each calendar month
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {extended.monthlyDominance.map((m) => (
              <div
                key={m.month}
                className="flex items-center justify-between gap-4 rounded-md bg-card px-3.5 py-2.5 ring-1 ring-white/[0.04]"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="type-label text-primary">
                    {formatMonthLabel(m.month)}
                  </span>
                  <span className="truncate font-bold text-foreground">
                    {m.topTrack.trackName}
                  </span>
                  <span className="truncate text-xs text-text-secondary">
                    {m.topTrack.artistName}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end">
                  <span className="font-mono text-sm font-bold text-foreground">
                    {formatNumber(m.topTrack.playCount)} plays
                  </span>
                  <span className="type-mono text-xs text-text-tertiary">
                    {formatNumber(m.topTrack.hours, 2)} hrs
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <RepeatIcon className="size-5 text-primary" />
              <div>
                <CardTitle className="type-card-title">
                  Intense Single-Day Track Binges
                </CardTitle>
                <CardDescription>
                  Highest single-day repeat sessions of an individual track
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {extended.topSingleDayBinges.slice(0, 12).map((b, idx) => (
              <div
                key={`${b.date}-${b.trackName}-${idx}`}
                className="flex items-center justify-between gap-4 rounded-md bg-card px-3.5 py-2.5 ring-1 ring-white/[0.04]"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="type-caption text-text-tertiary">
                    {formatDateFull(b.date)}
                  </span>
                  <span className="truncate font-bold text-foreground">
                    {b.trackName}
                  </span>
                  <span className="truncate text-xs text-text-secondary">
                    {b.artistName}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end">
                  <Badge className="bg-primary/15 text-primary font-mono border-transparent">
                    {formatNumber(b.playCount)}× in 1 day
                  </Badge>
                  <span className="type-mono mt-0.5 text-xs text-text-tertiary">
                    {formatNumber(b.hours, 2)} hrs
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
