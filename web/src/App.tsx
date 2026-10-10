import * as React from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { DataProvider } from "@/context/DataProvider"
import { Shell } from "@/components/layout/Shell"

const Overview = React.lazy(() =>
  import("@/sections/Overview").then((m) => ({ default: m.Overview }))
)
const Timeline = React.lazy(() =>
  import("@/sections/Timeline").then((m) => ({ default: m.Timeline }))
)
const TrackAnalysis = React.lazy(() =>
  import("@/sections/TrackAnalysis").then((m) => ({ default: m.TrackAnalysis }))
)
const ArtistAnalysis = React.lazy(() =>
  import("@/sections/ArtistAnalysis").then((m) => ({
    default: m.ArtistAnalysis,
  }))
)
const Discoveries = React.lazy(() =>
  import("@/sections/Discoveries").then((m) => ({ default: m.Discoveries }))
)
const HistoryExplorer = React.lazy(() =>
  import("@/sections/HistoryExplorer").then((m) => ({
    default: m.HistoryExplorer,
  }))
)

function RouteFallback() {
  return (
    <div className="flex flex-col gap-4 py-4">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export function App() {
  return (
    <TooltipProvider delayDuration={120}>
      <DataProvider>
        <BrowserRouter>
          <Shell>
            <React.Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Navigate to="/overview" replace />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/timeline" element={<Timeline />} />
                <Route path="/tracks" element={<TrackAnalysis />} />
                <Route path="/artists" element={<ArtistAnalysis />} />
                <Route path="/discoveries" element={<Discoveries />} />
                <Route path="/history" element={<HistoryExplorer />} />
                <Route path="*" element={<Navigate to="/overview" replace />} />
              </Routes>
            </React.Suspense>
          </Shell>
        </BrowserRouter>
      </DataProvider>
    </TooltipProvider>
  )
}

export default App
