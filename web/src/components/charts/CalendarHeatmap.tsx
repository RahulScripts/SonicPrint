import * as React from "react"
import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfWeek,
} from "date-fns"
import type { HeatmapDay } from "@/types/analytics"
import { formatDateFull, formatNumber } from "@/lib/format"
import { cn } from "cn"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CalendarHeatmapProps {
  heatmap: Record<string, HeatmapDay>
}

interface DayCell {
  dateStr: string
  date: Date
  hours: number
  playCount: number
  inRange: boolean
}

function getIntensityClass(hours: number): string {
  if (hours <= 0) return "bg-surface-strong ring-1 ring-white/[0.04]"
  if (hours < 1.5) return "bg-primary/25"
  if (hours < 4) return "bg-primary/55"
  if (hours < 7) return "bg-primary/80"
  return "bg-primary"
}

export function CalendarHeatmap({ heatmap }: CalendarHeatmapProps) {
  const activeDates = React.useMemo(
    () => Object.keys(heatmap).sort(),
    [heatmap]
  )

  const { weeks, monthLabels } = React.useMemo(() => {
    if (activeDates.length === 0) {
      return { weeks: [] as DayCell[][], monthLabels: [] as { col: number; label: string }[] }
    }

    // Notice 2024-12-31 is a single outlier play before regular Oct 2025 – Oct 2026 activity.
    // If there is a >180 day gap after the very first date, start the contiguous visual grid
    // from the second active date so the grid isn't mostly blank, while noting the earliest date.
    let startStr = activeDates[0]
    if (activeDates.length > 1) {
      const d0 = parseISO(activeDates[0])
      const d1 = parseISO(activeDates[1])
      if (differenceInCalendarDays(d1, d0) > 120) {
        startStr = activeDates[1]
      }
    }
    const endStr = activeDates[activeDates.length - 1]

    const firstDate = parseISO(startStr)
    const lastDate = parseISO(endStr)
    const gridStart = startOfWeek(firstDate, { weekStartsOn: 1 }) // Monday

    const totalDays = differenceInCalendarDays(lastDate, gridStart) + 1
    const totalWeeks = Math.ceil(totalDays / 7)

    const weeksArr: DayCell[][] = []
    const monthsArr: { col: number; label: string }[] = []
    let lastMonth = ""

    for (let w = 0; w < totalWeeks; w++) {
      const weekCells: DayCell[] = []
      for (let d = 0; d < 7; d++) {
        const current = addDays(gridStart, w * 7 + d)
        const dateStr = format(current, "yyyy-MM-dd")
        const monthTag = format(current, "MMM yyyy")

        if (d === 0 && monthTag !== lastMonth) {
          monthsArr.push({ col: w, label: format(current, "MMM ''yy") })
          lastMonth = monthTag
        }

        const stat = heatmap[dateStr]
        const inRange = dateStr >= startStr && dateStr <= endStr
        weekCells.push({
          dateStr,
          date: current,
          hours: stat?.hours ?? 0,
          playCount: stat?.playCount ?? 0,
          inRange,
        })
      }
      weeksArr.push(weekCells)
    }

    return { weeks: weeksArr, monthLabels: monthsArr }
  }, [activeDates, heatmap])

  if (weeks.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="type-section-title">
              Daily Listening Consistency Map
            </CardTitle>
            <CardDescription>
              Each square represents a calendar day — brighter green indicates longer listening sessions
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Less</span>
            <span className="size-3 rounded-[3px] bg-surface-strong ring-1 ring-white/[0.06]" />
            <span className="size-3 rounded-[3px] bg-primary/25" />
            <span className="size-3 rounded-[3px] bg-primary/55" />
            <span className="size-3 rounded-[3px] bg-primary/80" />
            <span className="size-3 rounded-[3px] bg-primary" />
            <span>More (7h+)</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto pb-2">
          <div className="inline-flex flex-col gap-2 min-w-max">
            <div className="flex items-start gap-2">
              {/* Day of week labels */}
              <div className="grid grid-rows-7 gap-1.5 pr-1 text-[11px] text-text-tertiary">
                <span className="h-3.5 leading-3.5">Mon</span>
                <span className="h-3.5 leading-3.5" />
                <span className="h-3.5 leading-3.5">Wed</span>
                <span className="h-3.5 leading-3.5" />
                <span className="h-3.5 leading-3.5">Fri</span>
                <span className="h-3.5 leading-3.5" />
                <span className="h-3.5 leading-3.5">Sun</span>
              </div>

              {/* Weeks columns */}
              <div className="flex gap-1.5">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="grid grid-rows-7 gap-1.5">
                    {week.map((cell) => {
                      if (!cell.inRange) {
                        return (
                          <div
                            key={cell.dateStr}
                            className="size-3.5 rounded-[3px] opacity-0"
                          />
                        )
                      }
                      return (
                        <Tooltip key={cell.dateStr}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              aria-label={`${formatDateFull(cell.dateStr)}: ${cell.playCount} plays, ${cell.hours} hours`}
                              className={cn(
                                "size-3.5 rounded-[3px] transition-transform hover:scale-125 focus-visible:ring-2 focus-visible:ring-ring outline-none",
                                getIntensityClass(cell.hours)
                              )}
                            />
                          </TooltipTrigger>
                          <TooltipContent className="bg-popover text-popover-foreground border border-white/10">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold">
                                {formatDateFull(cell.dateStr)}
                              </span>
                              {cell.playCount > 0 ? (
                                <span className="font-mono text-xs text-primary">
                                  {formatNumber(cell.playCount)} plays ·{" "}
                                  {formatNumber(cell.hours, 2)} hrs
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  No recorded listening
                                </span>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Month labels row */}
            <div className="relative h-5 pl-9 text-[11px] text-text-secondary">
              {monthLabels.map((m, idx) => {
                // Avoid overlapping labels if two months start within 3 columns
                const prevCol = idx > 0 ? monthLabels[idx - 1].col : -10
                if (m.col - prevCol < 3) return null
                return (
                  <span
                    key={`${m.label}-${m.col}`}
                    className="absolute top-0 whitespace-nowrap"
                    style={{ left: `${36 + m.col * 20}px` }}
                  >
                    {m.label}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
