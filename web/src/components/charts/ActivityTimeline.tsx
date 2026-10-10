import * as React from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import { ActivityIcon } from "lucide-react"
import type { ActivityTrends } from "@/types/analytics"
import {
  formatDateFull,
  formatDateShort,
  formatMonthLabel,
  formatNumber,
} from "@/lib/format"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

const chartConfig = {
  hours: {
    label: "Listening Hours",
    color: "var(--chart-1)",
  },
  playCount: {
    label: "Streams",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

type Granularity = "daily" | "weekly" | "monthly"

interface TimelinePoint {
  key: string
  axisLabel: string
  tooltipTitle: string
  hours: number
  playCount: number
  extra: string | null
}

interface ActivityTimelineProps {
  trends: ActivityTrends
}

export function ActivityTimeline({ trends }: ActivityTimelineProps) {
  const [granularity, setGranularity] = React.useState<Granularity>("daily")

  const chartData = React.useMemo<TimelinePoint[]>(() => {
    if (granularity === "daily") {
      return trends.daily.map((d) => ({
        key: d.date,
        axisLabel: formatDateShort(d.date),
        tooltipTitle: formatDateFull(d.date),
        hours: d.hours,
        playCount: d.playCount,
        extra: `${formatNumber(d.uniqueTracks)} unique tracks · ${formatNumber(d.uniqueArtists)} artists`,
      }))
    }
    if (granularity === "weekly") {
      return trends.weekly.map((w) => ({
        key: w.isoWeek,
        axisLabel: w.isoWeek,
        tooltipTitle: `ISO Week ${w.isoWeek}`,
        hours: w.hours,
        playCount: w.playCount,
        extra: null,
      }))
    }
    return trends.monthly.map((m) => ({
      key: m.month,
      axisLabel: formatMonthLabel(m.month),
      tooltipTitle: formatMonthLabel(m.month),
      hours: m.hours,
      playCount: m.playCount,
      extra: null,
    }))
  }, [granularity, trends])

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="type-section-title">
            Listening Activity Over Time
          </CardTitle>
          <CardDescription>
            Chronological listening duration and stream volume across your history
          </CardDescription>
        </div>
        <CardAction>
          <Tabs
            value={granularity}
            onValueChange={(val) => setGranularity(val as Granularity)}
          >
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardAction>
      </CardHeader>

      <CardContent>
        {chartData.length === 0 ? (
          <Empty className="py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ActivityIcon />
              </EmptyMedia>
              <EmptyTitle>No timeline activity</EmptyTitle>
              <EmptyDescription>
                No listening records fall within the selected date range.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : granularity === "daily" ? (
          <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="timelineFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-hours)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-hours)"
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
              />
              <XAxis
                dataKey="axisLabel"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={42}
                tickFormatter={(val) => `${val}h`}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const item = payload[0].payload as (typeof chartData)[number]
                  return (
                    <div className="flex flex-col gap-1.5 rounded-md border border-white/10 bg-popover px-3 py-2.5 text-xs text-popover-foreground shadow-xl">
                      <span className="font-bold text-foreground">
                        {item.tooltipTitle}
                      </span>
                      <div className="flex items-center justify-between gap-6">
                        <span className="text-text-secondary">Listening time</span>
                        <span className="font-mono font-bold text-primary">
                          {formatNumber(item.hours, 2)} hrs
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-6">
                        <span className="text-text-secondary">Recorded plays</span>
                        <span className="font-mono text-foreground">
                          {formatNumber(item.playCount)} plays
                        </span>
                      </div>
                      {item.extra && (
                        <div className="border-t border-white/10 pt-1 text-[11px] text-text-tertiary">
                          {item.extra}
                        </div>
                      )}
                    </div>
                  )
                }}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="var(--color-hours)"
                strokeWidth={2}
                fill="url(#timelineFill)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
              />
              <XAxis
                dataKey="axisLabel"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={46}
                tickFormatter={(val) => `${val}h`}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const item = payload[0].payload as (typeof chartData)[number]
                  return (
                    <div className="flex flex-col gap-1.5 rounded-md border border-white/10 bg-popover px-3 py-2.5 text-xs text-popover-foreground shadow-xl">
                      <span className="font-bold text-foreground">
                        {item.tooltipTitle}
                      </span>
                      <div className="flex items-center justify-between gap-6">
                        <span className="text-text-secondary">Listening time</span>
                        <span className="font-mono font-bold text-primary">
                          {formatNumber(item.hours, 2)} hrs
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-6">
                        <span className="text-text-secondary">Recorded plays</span>
                        <span className="font-mono text-foreground">
                          {formatNumber(item.playCount)} plays
                        </span>
                      </div>
                    </div>
                  )
                }}
              />
              <Bar
                dataKey="hours"
                fill="var(--color-hours)"
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
