import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import type { HourlyDistributionItem } from "@/types/analytics"
import { formatHourLabel, formatNumber } from "@/lib/format"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  playCount: {
    label: "Plays",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

interface HourlyDistributionProps {
  data: HourlyDistributionItem[]
  peakHour: number
}

export function HourlyDistribution({ data, peakHour }: HourlyDistributionProps) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="type-card-title">
            Hour-of-Day Rhythm
          </CardTitle>
          <CardDescription>
            Distribution of streams across the 24-hour clock
          </CardDescription>
        </div>
        <CardAction>
          <Badge className="bg-primary/15 text-primary border-transparent">
            Peak: {formatHourLabel(peakHour)}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-60 w-full">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
            />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={2}
              tickFormatter={(h) => formatHourLabel(Number(h))}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(val) => formatNumber(Number(val))}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const item = payload[0].payload as HourlyDistributionItem
                return (
                  <div className="flex flex-col gap-1 rounded-md border border-white/10 bg-popover px-3 py-2 text-xs text-popover-foreground shadow-xl">
                    <span className="font-bold text-foreground">
                      {formatHourLabel(item.hour)} ({item.label})
                    </span>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-text-secondary">Recorded plays</span>
                      <span className="font-mono font-bold text-primary">
                        {formatNumber(item.playCount)} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-text-secondary">Total duration</span>
                      <span className="font-mono text-foreground">
                        {formatNumber(item.hours, 2)} hrs
                      </span>
                    </div>
                  </div>
                )
              }}
            />
            <Bar
              dataKey="playCount"
              radius={[3, 3, 0, 0]}
              isAnimationActive={false}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.hour}
                  fill={
                    entry.hour === peakHour
                      ? "var(--chart-1)"
                      : "rgba(30, 215, 96, 0.35)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
