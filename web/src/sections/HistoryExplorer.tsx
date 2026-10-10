import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  HistoryIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"
import { useData } from "@/context/useData"
import {
  formatDateTime,
  formatNumber,
  formatTrackDuration,
} from "@/lib/format"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

type SortOption =
  | "date-desc"
  | "date-asc"
  | "duration-desc"
  | "duration-asc"
  | "track-asc"
  | "artist-asc"

type DurationFilter = "all" | "qualified" | "brief"

const PAGE_SIZE = 50

export function HistoryExplorer() {
  const { filteredHistory, history, isDateFiltered } = useData()

  const [searchInput, setSearchInput] = React.useState("")
  const [debouncedQuery, setDebouncedQuery] = React.useState("")
  const [sortBy, setSortBy] = React.useState<SortOption>("date-desc")
  const [durationFilter, setDurationFilter] =
    React.useState<DurationFilter>("all")
  const [page, setPage] = React.useState(1)

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchInput.trim().toLowerCase())
    }, 180)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setPage(1)
  }, [debouncedQuery, sortBy, durationFilter, filteredHistory])

  const processedRecords = React.useMemo(() => {
    let list = filteredHistory

    if (durationFilter === "qualified") {
      list = list.filter((r) => r.msPlayed >= 30_000)
    } else if (durationFilter === "brief") {
      list = list.filter((r) => r.msPlayed < 30_000)
    }

    if (debouncedQuery) {
      list = list.filter(
        (r) =>
          r.trackName.toLowerCase().includes(debouncedQuery) ||
          r.artistName.toLowerCase().includes(debouncedQuery) ||
          r.endTime.includes(debouncedQuery)
      )
    }

    const sorted = [...list]
    sorted.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return b.endTime.localeCompare(a.endTime)
        case "date-asc":
          return a.endTime.localeCompare(b.endTime)
        case "duration-desc":
          return b.msPlayed - a.msPlayed
        case "duration-asc":
          return a.msPlayed - b.msPlayed
        case "track-asc":
          return a.trackName.localeCompare(b.trackName)
        case "artist-asc":
          return a.artistName.localeCompare(b.artistName)
      }
    })

    return sorted
  }, [filteredHistory, durationFilter, debouncedQuery, sortBy])

  const totalPages = Math.max(1, Math.ceil(processedRecords.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const pageRecords = processedRecords.slice(
    startIndex,
    startIndex + PAGE_SIZE
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="type-page-title">Listening History Explorer</h1>
        <p className="type-body text-text-secondary">
          Browse, search, and filter all{" "}
          <span className="font-mono text-foreground">
            {formatNumber(history.length)}
          </span>{" "}
          individual timestamped playback records
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="type-card-title">
                Playback Event Log
              </CardTitle>
              <CardDescription>
                Showing{" "}
                {processedRecords.length === 0
                  ? "0"
                  : `${formatNumber(startIndex + 1)}–${formatNumber(
                      Math.min(startIndex + PAGE_SIZE, processedRecords.length)
                    )}`}{" "}
                of{" "}
                <strong className="font-mono text-foreground">
                  {formatNumber(processedRecords.length)}
                </strong>{" "}
                matching records
                {isDateFiltered || debouncedQuery || durationFilter !== "all"
                  ? ` (filtered from ${formatNumber(history.length)} total)`
                  : ""}
              </CardDescription>
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-64">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search track, artist, or YYYY-MM..."
                  className="pl-9 pr-8"
                  aria-label="Search listening history"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <XIcon className="size-3.5" />
                  </button>
                )}
              </div>

              <Select
                value={durationFilter}
                onValueChange={(v) => setDurationFilter(v as DurationFilter)}
              >
                <SelectTrigger
                  className="w-full sm:w-44 bg-panel border-white/10"
                  aria-label="Filter by play duration"
                >
                  <SelectValue placeholder="Duration filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Recorded Events</SelectItem>
                    <SelectItem value="qualified">
                      Qualified Plays (≥ 30s)
                    </SelectItem>
                    <SelectItem value="brief">
                      Brief / Skipped (&lt; 30s)
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as SortOption)}
              >
                <SelectTrigger
                  className="w-full sm:w-44 bg-panel border-white/10"
                  aria-label="Sort records"
                >
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="duration-desc">
                      Longest Duration
                    </SelectItem>
                    <SelectItem value="duration-asc">
                      Shortest Duration
                    </SelectItem>
                    <SelectItem value="track-asc">Track (A–Z)</SelectItem>
                    <SelectItem value="artist-asc">Artist (A–Z)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {pageRecords.length === 0 ? (
            <Empty className="border border-white/[0.06] bg-surface/50 py-14">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HistoryIcon />
                </EmptyMedia>
                <EmptyTitle>No listening records match your filters</EmptyTitle>
                <EmptyDescription>
                  Try clearing your search query, switching the duration filter, or resetting the global date range.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-white/[0.06] bg-surface">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="type-label text-text-secondary">
                      Timestamp (UTC/Local Export)
                    </TableHead>
                    <TableHead className="type-label text-text-secondary">
                      Track
                    </TableHead>
                    <TableHead className="type-label text-text-secondary">
                      Artist
                    </TableHead>
                    <TableHead className="type-label text-right text-text-secondary">
                      Duration
                    </TableHead>
                    <TableHead className="type-label hidden text-right text-text-secondary sm:table-cell">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRecords.map((rec, idx) => {
                    const isQualified = rec.msPlayed >= 30_000
                    return (
                      <TableRow
                        key={`${rec.endTime}-${rec.trackName}-${startIndex + idx}`}
                        className="border-white/[0.04] transition-colors hover:bg-card"
                      >
                        <TableCell className="font-mono text-xs whitespace-nowrap text-text-secondary">
                          {formatDateTime(rec.endTime)}
                        </TableCell>
                        <TableCell className="font-bold text-foreground">
                          {rec.trackName || "—"}
                        </TableCell>
                        <TableCell className="text-text-secondary">
                          {rec.artistName || "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-foreground">
                          {rec.msPlayed === 0
                            ? "0:00 (0 ms)"
                            : formatTrackDuration(rec.msPlayed)}
                        </TableCell>
                        <TableCell className="hidden text-right sm:table-cell">
                          <Badge
                            variant="secondary"
                            className={
                              isQualified
                                ? "bg-primary/15 text-primary border-transparent"
                                : "bg-panel text-text-tertiary border-transparent"
                            }
                          >
                            {isQualified ? "Qualified" : "Brief <30s"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Controls */}
          {processedRecords.length > PAGE_SIZE && (
            <div className="flex flex-col items-center justify-between gap-3 pt-2 sm:flex-row">
              <span className="type-mono text-xs text-muted-foreground">
                Page {formatNumber(safePage)} of {formatNumber(totalPages)}
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setPage(1)}
                  disabled={safePage <= 1}
                  aria-label="First page"
                >
                  <ChevronsLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                >
                  <ChevronLeftIcon data-icon="inline-start" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                >
                  Next
                  <ChevronRightIcon data-icon="inline-end" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setPage(totalPages)}
                  disabled={safePage >= totalPages}
                  aria-label="Last page"
                >
                  <ChevronsRightIcon />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
