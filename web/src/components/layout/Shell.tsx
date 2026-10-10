import * as React from "react"
import { AlertCircleIcon } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { useData } from "@/context/useData"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function Shell({ children }: { children: React.ReactNode }) {
  const {
    isLoading,
    error,
    isDateFiltered,
    filteredHistory,
    history,
    resetDateRange,
  } = useData()

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      {isDateFiltered && !isLoading && !error && (
        <div className="border-b border-primary/20 bg-primary/10 px-4 py-1.5 text-xs">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 lg:px-4">
            <span className="font-medium text-foreground">
              Showing date-filtered view:{" "}
              <strong className="font-mono text-primary">
                {filteredHistory.length.toLocaleString()}
              </strong>{" "}
              of {history.length.toLocaleString()} cleaned listening records
            </span>
            <button
              type="button"
              onClick={resetDateRange}
              className="font-bold text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring rounded-sm outline-none"
            >
              Reset filter
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-6 lg:px-8 lg:py-8">
        {isLoading ? (
          <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading listening analytics">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-72" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <Skeleton className="h-3.5 w-24" />
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Unable to Load Spotify Export Data</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          children
        )}
      </main>

      <footer className="mt-auto border-t border-white/[0.06] bg-surface-strong py-6 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 sm:flex-row sm:items-center lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">SonicPrint</span>
            <span>·</span>
            <span>Local-first personal Spotify listening analytics</span>
          </div>
          <div className="font-mono text-[11px] text-text-tertiary">
            100% browser-side · Zero external requests or tracking
          </div>
        </div>
      </footer>
    </div>
  )
}
