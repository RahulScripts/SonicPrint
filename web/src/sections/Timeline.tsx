import * as React from "react"
import {
  CalendarCheck2Icon,
  ClockIcon,
  FlameIcon,
  TrendingUpIcon,
  ZapIcon,
} from "lucide-react"
import { useData } from "@/context/useData"
import {
  formatDateFull,
  formatHourLabel,
  formatNumber,
} from "@/lib/format"
import { StatCard } from "@/components/shared/StatCard"
import { ActivityTimeline } from "@/components/charts/ActivityTimeline"
import { CalendarHeatmap } from "@/components/charts/CalendarHeatmap"
import { HourlyDistribution } from "@/components/charts/HourlyDistribution"
import { DayOfWeekChart } from "@/components/charts/DayOfWeekChart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function Timeline() {
  const { analytics } = useData()

  const topPeakDays = React.useMemo(() => {
    if (!analytics) return []
    return [...analytics.activity_trends.daily]
      .sort((a, b) => b.hours - a.hours || b.playCount - a.playCount)
      .slice(0, 6)
  }, [analytics])

  if (!analytics) return null

  const { streaks, temporal, activity_trends, scores_and_profile } = analytics
  const peakDayEntry = topPeakDays[0]

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="type-page-title">Listening Timeline</h1>
        <p className="type-body text-text-secondary">
          Chronological activity, daily consistency streaks, and circadian listening rhythms
        </p>
      </div>

      {/* Headline Timeline Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Longest Streak"
          value={`${streaks.longest_streak_days} days`}
          sublabel="Consecutive days with recorded playback"
          icon={FlameIcon}
          highlight
        />
        <StatCard
          label="Active Listening Days"
          value={formatNumber(streaks.total_active_days)}
          sublabel={`Current streak: ${streaks.current_streak_days} consecutive days`}
          icon={CalendarCheck2Icon}
        />
        <StatCard
          label="Peak Single Day"
          value={peakDayEntry ? `${formatNumber(peakDayEntry.hours, 2)} hrs` : "—"}
          sublabel={
            peakDayEntry
              ? `${formatDateFull(peakDayEntry.date)} (${formatNumber(peakDayEntry.playCount)} plays)`
              : "No active days"
          }
          icon={ZapIcon}
        />
        <StatCard
          label="Peak Circadian Window"
          value={formatHourLabel(temporal.peak_hour)}
          sublabel={`${scores_and_profile.night_owl_percentage}% of plays between 10 PM – 6 AM`}
          icon={ClockIcon}
        />
      </div>

      {/* Main Interactive Activity Chart */}
      <ActivityTimeline trends={activity_trends} />

      {/* Daily Consistency Heatmap */}
      <CalendarHeatmap heatmap={streaks.calendar_heatmap} />

      {/* Hourly & Day-of-Week Distributions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HourlyDistribution
          data={temporal.hourly_distribution}
          peakHour={temporal.peak_hour}
        />
        <DayOfWeekChart
          data={temporal.day_of_week_distribution}
          peakDay={temporal.peak_day}
        />
      </div>

      {/* High-Activity Spikes */}
      {topPeakDays.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUpIcon className="size-5 text-primary" />
              <div>
                <CardTitle className="type-section-title">
                  Periods of Unusually High Activity
                </CardTitle>
                <CardDescription>
                  The 6 highest-intensity listening days recorded in your dataset
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {topPeakDays.map((day, idx) => (
                <div
                  key={day.date}
                  className="flex flex-col justify-between gap-2 rounded-lg bg-card p-4 ring-1 ring-white/[0.05]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-foreground">
                      {formatDateFull(day.date)}
                    </span>
                    <Badge
                      variant={idx === 0 ? "default" : "secondary"}
                      className={
                        idx === 0
                          ? "bg-primary text-primary-foreground"
                          : "bg-panel text-text-secondary"
                      }
                    >
                      #{idx + 1} Peak Day
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-2xl font-bold text-primary">
                      {formatNumber(day.hours, 2)} hrs
                    </span>
                    <span className="type-mono text-xs text-text-secondary">
                      ({formatNumber(day.playCount)} plays)
                    </span>
                  </div>
                  <div className="type-caption text-text-tertiary">
                    {formatNumber(day.uniqueTracks)} unique tracks across{" "}
                    {formatNumber(day.uniqueArtists)} artists
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
