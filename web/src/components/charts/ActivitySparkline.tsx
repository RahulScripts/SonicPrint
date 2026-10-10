import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import type { DailyActivity } from "@/types/analytics"
import { formatDateFull, formatDateShort, formatNumber } from "@/lib/format"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  hours: {
    label: "Listening Hours",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

interface ActivitySparklineProps {
  data: DailyActivity[]
}

export function ActivitySparkline({ data }: ActivitySparklineProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-36 items-center justify-center text-xs text-muted-foreground">
        No daily activity in selected date range.
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-44 w-full">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="sparklineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-hours)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-hours)" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={36}
          tickFormatter={(val) => formatDateShort(String(val))}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={36}
          tickFormatter={(val) => `${val}h`}
        />
        <ChartTooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const item = payload[0].payload as DailyActivity
            return (
              <div className="flex flex-col gap-1 rounded-md border border-white/10 bg-popover px-3 py-2 text-xs text-popover-foreground shadow-xl">
                <span className="font-bold text-foreground">
                  {formatDateFull(item.date)}
                </span>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-text-secondary">Listening time</span>
                  <span className="font-mono font-bold text-primary">
                    {formatNumber(item.hours, 2)} hrs
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-text-secondary">Recorded plays</span>
                  <span className="font-mono text-foreground">
                    {formatNumber(item.playCount)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-text-secondary">Unique tracks</span>
                  <span className="font-mono text-foreground">
                    {formatNumber(item.uniqueTracks)}
                  </span>
                </div>
              </div>
            )
          }}
        />
        <Area
          type="monotone"
          dataKey="hours"
          stroke="var(--color-hours)"
          strokeWidth={2}
          fill="url(#sparklineFill)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  )
}
