import * as React from "react"
import {
  BarChart3Icon,
  CalendarIcon,
  CompassIcon,
  HistoryIcon,
  MicVocalIcon,
  PercentIcon,
} from "lucide-react"
import { useData } from "@/context/useData"
import type { RankedArtist } from "@/types/analytics"
import {
  formatDate,
  formatDuration,
  formatMonthLabel,
  formatNumber,
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

export function ArtistAnalysis() {
  const { analytics, extended } = useData()
  const [rankingMode, setRankingMode] = React.useState<"plays" | "duration">(
    "plays"
  )

  const chartItems = React.useMemo<HorizontalBarItem[]>(() => {
    if (!extended) return []
    const source =
      rankingMode === "plays"
        ? extended.allArtistsByPlays.slice(0, 20)
        : extended.allArtistsByDuration.slice(0, 20)

    return source.map((a) => ({
      id: a.artistName,
      rank: a.rank,
      label: a.artistName,
      sublabel: `${formatNumber(a.uniqueTracks)} unique tracks`,
      value: rankingMode === "plays" ? a.playCount : a.hours,
      formattedValue:
        rankingMode === "plays"
          ? `${formatNumber(a.playCount)} plays`
          : `${formatNumber(a.hours, 2)} hrs`,
      secondaryLabel:
        rankingMode === "plays" ? "Listening duration" : "Recorded plays",
      secondaryValue:
        rankingMode === "plays"
          ? `${formatNumber(a.hours, 2)} hrs`
          : `${formatNumber(a.playCount)} plays`,
    }))
  }, [extended, rankingMode])

  const columns = React.useMemo<RankedTableColumn<RankedArtist>[]>(() => {
    const patterns = extended?.artistPatterns ?? {}
    return [
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
        key: "artistName",
        header: "Artist",
        sortable: true,
        sortValue: (r) => r.artistName.toLowerCase(),
        render: (r) => (
          <span className="font-bold text-foreground">{r.artistName}</span>
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
        key: "uniqueTracks",
        header: "Unique Tracks",
        sortable: true,
        align: "right",
        sortValue: (r) => r.uniqueTracks,
        className: "hidden sm:table-cell",
        render: (r) => (
          <span className="font-mono text-text-secondary">
            {formatNumber(r.uniqueTracks)}
          </span>
        ),
      },
      {
        key: "firstSeen",
        header: "First Recorded Play",
        sortable: true,
        sortValue: (r) => patterns[r.artistName]?.firstPlayDate ?? "",
        className: "hidden lg:table-cell",
        render: (r) => (
          <span className="font-mono text-xs text-text-secondary">
            {formatDate(patterns[r.artistName]?.firstPlayDate)}
          </span>
        ),
      },
      {
        key: "activeMonths",
        header: "Return Span",
        sortable: true,
        align: "right",
        sortValue: (r) => patterns[r.artistName]?.activeMonthsCount ?? 0,
        className: "hidden md:table-cell",
        render: (r) => {
          const p = patterns[r.artistName]
          if (!p) return "—"
          return (
            <div className="flex flex-col items-end">
              <span className="font-mono text-xs text-foreground">
                {p.activeMonthsCount} {p.activeMonthsCount === 1 ? "month" : "months"}
              </span>
              <span className="type-caption text-text-tertiary">
                {p.activeDaysCount} active days
              </span>
            </div>
          )
        },
      },
    ]
  }, [extended?.artistPatterns])

  if (!analytics || !extended) return null

  const { diversity } = analytics
  const tableData =
    rankingMode === "plays"
      ? extended.allArtistsByPlays
      : extended.allArtistsByDuration

  const mostConsistentArtists = Object.values(extended.artistPatterns)
    .sort(
      (a, b) =>
        b.activeMonthsCount - a.activeMonthsCount ||
        b.activeDaysCount - a.activeDaysCount
    )
    .slice(0, 10)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="type-page-title">Artist Analysis</h1>
        <p className="type-body text-text-secondary">
          Rankings, catalog concentration, monthly dominance, and long-term return patterns across{" "}
          {formatNumber(diversity.unique_artists)} artists
        </p>
      </div>

      {/* Artist Diversity & Concentration Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Unique Artists"
          value={formatNumber(diversity.unique_artists)}
          sublabel={`Artist diversity ratio: ${diversity.artist_diversity_ratio}`}
          icon={MicVocalIcon}
          highlight
        />
        <StatCard
          label="Top 10 Artist Share"
          value={`${diversity.top_10_artists_play_share_percent}%`}
          sublabel="Share of total plays from your top 10 artists"
          icon={PercentIcon}
        />
        <StatCard
          label="Shannon Entropy"
          value={formatNumber(diversity.artist_shannon_entropy, 3)}
          sublabel="Higher values indicate wider artist variety"
          icon={CompassIcon}
        />
        <StatCard
          label="Gini Coefficient"
          value={formatNumber(diversity.artist_gini_coefficient, 3)}
          sublabel="Inequality between heavily & lightly played artists"
          icon={BarChart3Icon}
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
                Top 20 Artists by{" "}
                {rankingMode === "plays" ? "Play Count" : "Listening Duration"}
              </CardTitle>
              <CardDescription>
                {rankingMode === "plays"
                  ? "Artists with the highest number of recorded streams"
                  : "Artists that commanded the most total listening hours"}
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
                Complete Artist Rankings ({formatNumber(tableData.length)} Artists)
              </CardTitle>
              <CardDescription>
                Includes first recorded appearance date, active return months, and catalog depth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RankedTable
                data={tableData}
                columns={columns}
                searchPlaceholder="Search artist name..."
                searchFilter={(row, q) =>
                  row.artistName.toLowerCase().includes(q)
                }
                defaultSortKey={rankingMode === "plays" ? "playCount" : "hours"}
                defaultSortDir="desc"
                maxRows={50}
                rowKey={(r) => r.artistName}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Monthly Dominant Artists & Long-Term Return Patterns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-5 text-primary" />
              <div>
                <CardTitle className="type-card-title">
                  Artists That Dominated Each Month
                </CardTitle>
                <CardDescription>
                  The #1 most-streamed artist for every calendar month
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
                    {m.topArtist.artistName}
                  </span>
                  <span className="type-caption text-text-tertiary">
                    {formatNumber(
                      (m.topArtist.playCount / Math.max(1, m.totalPlays)) * 100,
                      1
                    )}
                    % of month&apos;s {formatNumber(m.totalPlays)} plays
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end">
                  <span className="font-mono text-sm font-bold text-foreground">
                    {formatNumber(m.topArtist.playCount)} plays
                  </span>
                  <span className="type-mono text-xs text-text-tertiary">
                    {formatNumber(m.topArtist.hours, 2)} hrs
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HistoryIcon className="size-5 text-primary" />
              <div>
                <CardTitle className="type-card-title">
                  Artists You Repeatedly Return To
                </CardTitle>
                <CardDescription>
                  Ranked by number of distinct months and calendar days with active plays
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {mostConsistentArtists.map((p) => (
              <div
                key={p.artistName}
                className="flex items-center justify-between gap-4 rounded-md bg-card px-3.5 py-2.5 ring-1 ring-white/[0.04]"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-bold text-foreground">
                    {p.artistName}
                  </span>
                  <span className="type-caption text-text-secondary">
                    First seen {formatDate(p.firstPlayDate)} · Last seen{" "}
                    {formatDate(p.lastPlayDate)}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end">
                  <Badge className="bg-primary/15 text-primary font-mono border-transparent">
                    {p.activeMonthsCount} months · {p.activeDaysCount} days
                  </Badge>
                  <span className="type-mono mt-0.5 text-xs text-text-tertiary">
                    {formatNumber(p.playCount)} total plays
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
