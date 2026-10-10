import * as React from "react"
import { format, parseISO } from "date-fns"
import type {
  AnalyticsSummary,
  DateRange,
  ListeningRecord,
  PipelineManifest,
} from "@/types/analytics"
import {
  computeAnalyticsSummary,
  computeExtendedInsights,
  type ExtendedInsights,
} from "@/lib/analyticsEngine"

export interface DataContextValue {
  analytics: AnalyticsSummary | null
  rawAnalytics: AnalyticsSummary | null
  history: ListeningRecord[]
  filteredHistory: ListeningRecord[]
  extended: ExtendedInsights | null
  manifest: PipelineManifest | null
  isLoading: boolean
  error: string | null
  dateRange: DateRange
  minDateStr: string
  maxDateStr: string
  isDateFiltered: boolean
  setDateRange: (range: DateRange) => void
  resetDateRange: () => void
}

export const DataContext = React.createContext<DataContextValue | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [rawAnalytics, setRawAnalytics] = React.useState<AnalyticsSummary | null>(null)
  const [history, setHistory] = React.useState<ListeningRecord[]>([])
  const [manifest, setManifest] = React.useState<PipelineManifest | null>(null)
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)

  const [minDateStr, setMinDateStr] = React.useState<string>("2024-12-31")
  const [maxDateStr, setMaxDateStr] = React.useState<string>("2026-10-05")
  const [dateRange, setDateRangeState] = React.useState<DateRange>({
    from: undefined,
    to: undefined,
  })

  React.useEffect(() => {
    let cancelled = false

    async function loadAllData() {
      setIsLoading(true)
      setError(null)
      try {
        const [summaryRes, historyRes, manifestRes] = await Promise.all([
          fetch("/data/analytics_summary.json"),
          fetch("/data/cleaned_all.json"),
          fetch("/data/pipeline_manifest.json").catch(() => null),
        ])

        if (!summaryRes.ok) {
          throw new Error(
            `Failed to load analytics_summary.json (HTTP ${summaryRes.status}). Make sure the pipeline output is copied to web/public/data/.`
          )
        }
        if (!historyRes.ok) {
          throw new Error(
            `Failed to load cleaned_all.json (HTTP ${historyRes.status}). Make sure the cleaned history file is copied to web/public/data/.`
          )
        }

        const [summaryData, historyData] = await Promise.all([
          summaryRes.json() as Promise<AnalyticsSummary>,
          historyRes.json() as Promise<ListeningRecord[]>,
        ])

        const manifestData =
          manifestRes && manifestRes.ok
            ? ((await manifestRes.json()) as PipelineManifest)
            : null

        if (cancelled) return

        const firstDate = summaryData.streaks.first_active_date ?? "2024-12-31"
        const lastDate = summaryData.streaks.last_active_date ?? "2026-10-05"

        setRawAnalytics(summaryData)
        setHistory(historyData)
        setManifest(manifestData)
        setMinDateStr(firstDate)
        setMaxDateStr(lastDate)
        setDateRangeState({
          from: parseISO(firstDate),
          to: parseISO(lastDate),
        })
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load listening data.")
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadAllData()
    return () => {
      cancelled = true
    }
  }, [])

  const fromStr = React.useMemo(
    () => (dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : minDateStr),
    [dateRange.from, minDateStr]
  )
  const toStr = React.useMemo(
    () => (dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : maxDateStr),
    [dateRange.to, maxDateStr]
  )

  const isDateFiltered = React.useMemo(() => {
    return fromStr > minDateStr || toStr < maxDateStr
  }, [fromStr, toStr, minDateStr, maxDateStr])

  const filteredHistory = React.useMemo(() => {
    if (!isDateFiltered) return history
    return history.filter((r) => {
      const d = (r.endTime || "").slice(0, 10)
      return d >= fromStr && d <= toStr
    })
  }, [history, isDateFiltered, fromStr, toStr])

  const analytics = React.useMemo(() => {
    if (!rawAnalytics) return null
    if (!isDateFiltered) return rawAnalytics
    return computeAnalyticsSummary(filteredHistory, 50)
  }, [rawAnalytics, isDateFiltered, filteredHistory])

  const extended = React.useMemo(() => {
    if (history.length === 0 && !rawAnalytics) return null
    return computeExtendedInsights(filteredHistory)
  }, [filteredHistory, history.length, rawAnalytics])

  const setDateRange = React.useCallback((range: DateRange) => {
    setDateRangeState(range)
  }, [])

  const resetDateRange = React.useCallback(() => {
    setDateRangeState({
      from: parseISO(minDateStr),
      to: parseISO(maxDateStr),
    })
  }, [minDateStr, maxDateStr])

  const value = React.useMemo<DataContextValue>(
    () => ({
      analytics,
      rawAnalytics,
      history,
      filteredHistory,
      extended,
      manifest,
      isLoading,
      error,
      dateRange,
      minDateStr,
      maxDateStr,
      isDateFiltered,
      setDateRange,
      resetDateRange,
    }),
    [
      analytics,
      rawAnalytics,
      history,
      filteredHistory,
      extended,
      manifest,
      isLoading,
      error,
      dateRange,
      minDateStr,
      maxDateStr,
      isDateFiltered,
      setDateRange,
      resetDateRange,
    ]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
