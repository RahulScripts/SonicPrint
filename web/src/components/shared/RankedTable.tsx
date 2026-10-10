import * as React from "react"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"
import { cn } from "cn"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export interface RankedTableColumn<T> {
  key: string
  header: string
  sortable?: boolean
  align?: "left" | "right" | "center"
  sortValue?: (row: T) => number | string
  render: (row: T, index: number) => React.ReactNode
  className?: string
}

interface RankedTableProps<T> {
  data: T[]
  columns: RankedTableColumn<T>[]
  searchPlaceholder?: string
  searchFilter?: (row: T, query: string) => boolean
  defaultSortKey?: string
  defaultSortDir?: "asc" | "desc"
  maxRows?: number
  rowKey: (row: T, index: number) => string
  emptyTitle?: string
  emptyDescription?: string
}

export function RankedTable<T>({
  data,
  columns,
  searchPlaceholder = "Search...",
  searchFilter,
  defaultSortKey,
  defaultSortDir = "asc",
  maxRows = 50,
  rowKey,
  emptyTitle = "No matching records",
  emptyDescription = "Try adjusting your search query or global date filter.",
}: RankedTableProps<T>) {
  const [searchInput, setSearchInput] = React.useState("")
  const [debouncedQuery, setDebouncedQuery] = React.useState("")
  const [sortKey, setSortKey] = React.useState<string | undefined>(defaultSortKey)
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">(defaultSortDir)
  const [limit, setLimit] = React.useState<number>(maxRows)

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchInput.trim().toLowerCase())
    }, 180)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  // Reset limit when search changes
  React.useEffect(() => {
    setLimit(maxRows)
  }, [debouncedQuery, maxRows])

  const filteredAndSorted = React.useMemo(() => {
    let list = data
    if (debouncedQuery && searchFilter) {
      list = list.filter((item) => searchFilter(item, debouncedQuery))
    }

    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey)
      if (col && col.sortValue) {
        const getVal = col.sortValue
        list = [...list].sort((a, b) => {
          const va = getVal(a)
          const vb = getVal(b)
          if (typeof va === "number" && typeof vb === "number") {
            return sortDir === "asc" ? va - vb : vb - va
          }
          return sortDir === "asc"
            ? String(va).localeCompare(String(vb))
            : String(vb).localeCompare(String(va))
        })
      }
    }

    return list
  }, [data, debouncedQuery, searchFilter, sortKey, sortDir, columns])

  const visibleRows = React.useMemo(
    () => filteredAndSorted.slice(0, limit),
    [filteredAndSorted, limit]
  )

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {searchFilter && (
          <div className="relative w-full sm:max-w-sm">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 pr-8"
              aria-label={searchPlaceholder}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <XIcon className="size-3.5" />
              </button>
            )}
          </div>
        )}
        <div className="type-mono text-xs text-muted-foreground">
          Showing {visibleRows.length.toLocaleString()} of{" "}
          {filteredAndSorted.length.toLocaleString()}{" "}
          {debouncedQuery ? `(filtered from ${data.length.toLocaleString()})` : "items"}
        </div>
      </div>

      {visibleRows.length === 0 ? (
        <Empty className="border border-white/[0.06] bg-surface/50 py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchIcon />
            </EmptyMedia>
            <EmptyTitle>{emptyTitle}</EmptyTitle>
            <EmptyDescription>{emptyDescription}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/[0.06] bg-surface">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                {columns.map((col) => {
                  const isSorted = sortKey === col.key
                  return (
                    <TableHead
                      key={col.key}
                      className={cn(
                        "type-label text-text-secondary select-none",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                        col.className
                      )}
                    >
                      {col.sortable ? (
                        <button
                          type="button"
                          onClick={() => handleSort(col.key)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-sm py-1 transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring outline-none",
                            isSorted && "text-primary"
                          )}
                        >
                          <span>{col.header}</span>
                          {isSorted ? (
                            sortDir === "asc" ? (
                              <ArrowUpIcon className="size-3.5" />
                            ) : (
                              <ArrowDownIcon className="size-3.5" />
                            )
                          ) : (
                            <ArrowUpDownIcon className="size-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        col.header
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.map((row, idx) => (
                <TableRow
                  key={rowKey(row, idx)}
                  className="border-white/[0.04] transition-colors hover:bg-card"
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                        col.className
                      )}
                    >
                      {col.render(row, idx)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {filteredAndSorted.length > limit && (
        <div className="flex justify-center pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLimit((prev) => prev + 50)}
          >
            Load More ({Math.min(50, filteredAndSorted.length - limit)} more of{" "}
            {(filteredAndSorted.length - limit).toLocaleString()} remaining)
          </Button>
        </div>
      )}
    </div>
  )
}
