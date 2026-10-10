import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface InsightCardProps {
  title: string
  category?: string
  metric: string
  metricLabel?: string
  description: string
  evidence?: string
  icon: LucideIcon
  accent?: "green" | "blue" | "purple" | "yellow"
  children?: React.ReactNode
  className?: string
}

const ACCENT_STYLES: Record<
  NonNullable<InsightCardProps["accent"]>,
  { iconBg: string; metricText: string }
> = {
  green: {
    iconBg: "bg-primary/15 text-primary",
    metricText: "text-primary",
  },
  blue: {
    iconBg: "bg-info-blue/15 text-info-blue",
    metricText: "text-info-blue",
  },
  purple: {
    iconBg: "bg-accent-purple/15 text-accent-purple",
    metricText: "text-accent-purple",
  },
  yellow: {
    iconBg: "bg-highlight-yellow/15 text-highlight-yellow",
    metricText: "text-highlight-yellow",
  },
}

export function InsightCard({
  title,
  category,
  metric,
  metricLabel,
  description,
  evidence,
  icon: Icon,
  accent = "green",
  children,
  className,
}: InsightCardProps) {
  const styles = ACCENT_STYLES[accent]

  return (
    <Card className={cn("justify-between", className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-md",
              styles.iconBg
            )}
          >
            <Icon className="size-4" />
          </div>
          <div className="flex flex-col">
            <CardTitle className="type-card-title">{title}</CardTitle>
          </div>
        </div>
        {category && (
          <CardAction>
            <Badge variant="secondary" className="bg-panel text-text-secondary">
              {category}
            </Badge>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "font-mono text-2xl font-bold tracking-tight sm:text-3xl",
              styles.metricText
            )}
          >
            {metric}
          </span>
          {metricLabel && (
            <span className="type-body-sm text-text-secondary">
              {metricLabel}
            </span>
          )}
        </div>
        <CardDescription className="type-body text-text-secondary">
          {description}
        </CardDescription>
        {children}
      </CardContent>

      {evidence && (
        <CardFooter className="border-t border-white/[0.05] bg-surface-strong/60 py-2.5">
          <span className="type-mono text-xs text-text-tertiary">{evidence}</span>
        </CardFooter>
      )}
    </Card>
  )
}
