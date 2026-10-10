import { NavLink } from "react-router-dom"
import {
  ActivityIcon,
  CompassIcon,
  Disc3Icon,
  HistoryIcon,
  LayoutDashboardIcon,
  MicVocalIcon,
  SparklesIcon,
} from "lucide-react"
import { cn } from "cn"
import { DateRangeFilter } from "@/components/shared/DateRangeFilter"

const NAV_ITEMS = [
  { to: "/overview", label: "Overview", icon: LayoutDashboardIcon },
  { to: "/timeline", label: "Timeline", icon: ActivityIcon },
  { to: "/tracks", label: "Tracks", icon: Disc3Icon },
  { to: "/artists", label: "Artists", icon: MicVocalIcon },
  { to: "/discoveries", label: "Discoveries", icon: SparklesIcon },
  { to: "/history", label: "History", icon: HistoryIcon },
] as const

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-surface-strong/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:px-8">
        <div className="flex shrink-0 items-center justify-between gap-4">
          <NavLink
            to="/overview"
            className="flex shrink-0 items-center gap-2.5 rounded-md text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="SonicPrint Home"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CompassIcon className="size-4.5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight leading-none">
                SonicPrint
              </span>
              <span className="type-caption hidden xl:inline text-muted-foreground">
                Personal Listening Footprint
              </span>
            </div>
          </NavLink>

          <div className="lg:hidden">
            <DateRangeFilter />
          </div>
        </div>

        <nav
          aria-label="Primary sections"
          className="no-scrollbar flex items-center gap-1 overflow-x-auto lg:shrink-0 lg:overflow-visible"
        >
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring xl:px-3.5",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-text-secondary hover:bg-panel hover:text-foreground"
                )
              }
            >
              <Icon className="size-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="hidden shrink-0 lg:block">
          <DateRangeFilter />
        </div>
      </div>
    </header>
  )
}
