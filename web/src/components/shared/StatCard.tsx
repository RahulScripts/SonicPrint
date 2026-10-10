import type { LucideIcon } from "lucide-react"
import { cn } from "cn"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface StatCardProps {
  label: string
  value: string
  sublabel?: string
  icon?: LucideIcon
  highlight?: boolean
  className?: string
}

export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  highlight = false,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        highlight && "ring-1 ring-primary/35 bg-card",
        className
      )}
    >
      <CardHeader className="pb-1">
        <CardTitle className="type-label text-text-secondary">{label}</CardTitle>
        {Icon && (
          <CardAction>
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-md",
                highlight
                  ? "bg-primary/15 text-primary"
                  : "bg-panel text-text-secondary"
              )}
            >
              <Icon className="size-4" />
            </div>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <div
          className={cn(
            "font-mono text-2xl font-bold tracking-tight sm:text-3xl",
            highlight ? "text-primary" : "text-foreground"
          )}
        >
          {value}
        </div>
        {sublabel && (
          <CardDescription className="type-body-sm text-text-tertiary">
            {sublabel}
          </CardDescription>
        )}
      </CardContent>
    </Card>
  )
}
