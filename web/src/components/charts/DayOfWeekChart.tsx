import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import type { DayOfWeekDistributionItem } from "@/types/analytics"
import { formatNumber } from "@/lib/format"
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

interface DayOfWeekChartProps {
  data: DayOfWeekDistributionItem[]
  peakDay: string
}

export function DayOfWeekChart({ data, peakDay }: DayOfWeekChartProps) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="type-card-title">
            Day-of-Week Pattern
          </CardTitle>
          <CardDescription>
            Listening activity across Monday through Sunday
          </CardDescription>
        </div>
        <CardAction>
          <Badge className="bg-primary/15 text-primary border-transparent">
            Peak: {peakDay}
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
              dataKey="dayName"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(day) => String(day).slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(val) => formatNumber(Number(val))}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const item = payload[0].payload as DayOfWeekDistributionItem
                return (
                  <div className="flex flex-col gap-1 rounded-md border border-white/10 bg-popover px-3 py-2 text-xs text-popover-foreground shadow-xl">
                    <span className="font-bold text-foreground">
                      {item.dayName}
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
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.dayName}
                  fill={
                    entry.dayName === peakDay
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
