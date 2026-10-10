import * as React from "react"
import { format, parseISO, subDays } from "date-fns"
import { CalendarIcon, RotateCcwIcon, XIcon } from "lucide-react"
import { useData } from "@/context/useData"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

export function DateRangeFilter() {
  const {
    dateRange,
    minDateStr,
    maxDateStr,
    isDateFiltered,
    setDateRange,
    resetDateRange,
    filteredHistory,
    history,
  } = useData()

  const minDate = React.useMemo(() => parseISO(minDateStr), [minDateStr])
  const maxDate = React.useMemo(() => parseISO(maxDateStr), [maxDateStr])

  const label = React.useMemo(() => {
    const start = dateRange.from
      ? format(dateRange.from, "MMM d, yyyy")
      : format(minDate, "MMM d, yyyy")
    const end = dateRange.to
      ? format(dateRange.to, "MMM d, yyyy")
      : format(maxDate, "MMM d, yyyy")
    return `${start} – ${end}`
  }, [dateRange.from, dateRange.to, minDate, maxDate])

  const applyPreset = (preset: "all" | "30d" | "90d" | "2025" | "2026") => {
    if (preset === "all") {
      resetDateRange()
      return
    }
    if (preset === "30d") {
      setDateRange({
        from: subDays(maxDate, 29),
        to: maxDate,
      })
      return
    }
    if (preset === "90d") {
      setDateRange({
        from: subDays(maxDate, 89),
        to: maxDate,
      })
      return
    }
    if (preset === "2025") {
      setDateRange({
        from: parseISO("2025-01-01"),
        to: parseISO("2025-12-31"),
      })
      return
    }
    if (preset === "2026") {
      setDateRange({
        from: parseISO("2026-01-01"),
        to: maxDate,
      })
    }
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={isDateFiltered ? "default" : "secondary"}
            size="sm"
            aria-label="Filter listening history by date range"
          >
            <CalendarIcon data-icon="inline-start" />
            <span className="whitespace-nowrap">{label}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto max-w-[95vw] p-4">
          <div className="flex flex-col gap-3">
            <PopoverHeader>
              <div className="flex items-center justify-between gap-4">
                <PopoverTitle className="type-subsection">
                  Global Date Filter
                </PopoverTitle>
                <div className="flex items-center gap-2">
                  <span className="type-mono text-muted-foreground">
                    {filteredHistory.length.toLocaleString()} /{" "}
                    {history.length.toLocaleString()} plays
                  </span>
                  {isDateFiltered && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={resetDateRange}
                    >
                      <RotateCcwIcon data-icon="inline-start" />
                      Reset
                    </Button>
                  )}
                </div>
              </div>
              <PopoverDescription className="type-body-sm">
                Filter all charts, rankings, and insights across SonicPrint.
              </PopoverDescription>
            </PopoverHeader>

            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                variant="outline"
                size="xs"
                onClick={() => applyPreset("all")}
              >
                Full Export
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => applyPreset("30d")}
              >
                Last 30 Days
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => applyPreset("90d")}
              >
                Last 90 Days
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => applyPreset("2025")}
              >
                Year 2025
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => applyPreset("2026")}
              >
                Year 2026
              </Button>
            </div>

            <Separator />

            <Calendar
              mode="range"
              defaultMonth={dateRange.from ?? minDate}
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => {
                setDateRange({
                  from: range?.from,
                  to: range?.to,
                })
              }}
              numberOfMonths={2}
              disabled={{ before: minDate, after: maxDate }}
            />
          </div>
        </PopoverContent>
      </Popover>

      {isDateFiltered && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={resetDateRange}
          aria-label="Reset date range filter"
          title="Reset to full date range"
        >
          <XIcon />
        </Button>
      )}
    </div>
  )
}
