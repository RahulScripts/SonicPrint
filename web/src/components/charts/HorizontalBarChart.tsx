import * as React from "react"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"

export interface HorizontalBarItem {
  id: string
  rank: number
  label: string
  sublabel?: string
  value: number
  formattedValue: string
  secondaryLabel?: string
  secondaryValue?: string
}

const chartConfig = {
  value: {
    label: "Value",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

interface HorizontalBarChartProps {
  items: HorizontalBarItem[]
  maxItems?: number
  unit?: string
}

export function HorizontalBarChart({
  items,
  maxItems = 20,
  unit = "",
}: HorizontalBarChartProps) {
  const slice = React.useMemo(
    () => items.slice(0, maxItems),
    [items, maxItems]
  )

  if (slice.length === 0) {
    return null
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto w-full"
      style={{ height: `${Math.max(320, slice.length * 32)}px` }}
    >
      <BarChart
        data={slice}
        layout="vertical"
        margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
      >
        <CartesianGrid
          horizontal={false}
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.06)"
        />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tickFormatter={(val) => `${val}${unit}`}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={185}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val: string) =>
            val.length > 24 ? `${val.slice(0, 23)}…` : val
          }
        />
        <ChartTooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const item = payload[0].payload as HorizontalBarItem
            return (
              <div className="flex flex-col gap-1 rounded-md border border-white/10 bg-popover px-3 py-2 text-xs text-popover-foreground shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-primary font-bold">
                    #{item.rank}
                  </span>
                  <span className="font-bold text-foreground">{item.label}</span>
                </div>
                {item.sublabel && (
                  <span className="text-text-secondary">{item.sublabel}</span>
                )}
                <div className="mt-1 flex items-center justify-between gap-6 border-t border-white/10 pt-1">
                  <span className="text-text-secondary">Primary metric</span>
                  <span className="font-mono font-bold text-primary">
                    {item.formattedValue}
                  </span>
                </div>
                {item.secondaryLabel && item.secondaryValue && (
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-text-secondary">
                      {item.secondaryLabel}
                    </span>
                    <span className="font-mono text-foreground">
                      {item.secondaryValue}
                    </span>
                  </div>
                )}
              </div>
            )
          }}
        />
        <Bar
          dataKey="value"
          radius={[0, 4, 4, 0]}
          isAnimationActive={false}
        >
          {slice.map((entry, idx) => (
            <Cell
              key={entry.id}
              fill={
                idx === 0
                  ? "var(--chart-1)"
                  : idx < 3
                    ? "rgba(30, 215, 96, 0.75)"
                    : "rgba(30, 215, 96, 0.4)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
