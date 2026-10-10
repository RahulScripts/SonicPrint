import { format, parseISO, isValid } from "date-fns"

/**
 * Formats milliseconds into human-readable duration.
 * Examples:
 * - 3600000 -> "1h 0m"
 * - 187723 -> "3m 8s"
 * - 15000 -> "15s"
 * - 0 -> "< 1s"
 */
export function formatDuration(ms: number): string {
  if (!ms || ms <= 0) return "< 1s"
  const totalSeconds = Math.round(ms / 1000)
  if (totalSeconds === 0) return "< 1s"

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours.toLocaleString()}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}

/**
 * Formats milliseconds into a compact mm:ss string for track durations.
 */
export function formatTrackDuration(ms: number): string {
  if (!ms || ms <= 0) return "0:00"
  const totalSeconds = Math.round(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

/**
 * Formats numbers with locale thousand separators.
 */
export function formatNumber(n: number, decimals = 0): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Formats hours nicely with unit.
 */
export function formatHours(h: number, decimals = 1): string {
  return `${formatNumber(h, decimals)} hrs`
}

/**
 * Formats large numbers compactly for chart axes (e.g., 19.3K).
 */
export function formatCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`
  }
  if (Math.abs(n) >= 1_000) {
    return `${(n / 1_000).toFixed(1)}K`
  }
  return n.toString()
}

/**
 * Parses a "YYYY-MM-DD" or "YYYY-MM-DD HH:MM" string safely.
 */
export function parseRecordDate(str: string): Date | null {
  if (!str) return null
  const normalized = str.includes(" ") ? str.replace(" ", "T") : str
  const dt = parseISO(normalized)
  return isValid(dt) ? dt : null
}

/**
 * Formats a date string ("YYYY-MM-DD" or "YYYY-MM-DD HH:MM") as "Oct 5, 2026".
 */
export function formatDate(str: string | null | undefined): string {
  if (!str) return "—"
  const dt = parseRecordDate(str)
  if (!dt) return str
  return format(dt, "MMM d, yyyy")
}

/**
 * Formats a date string as "Oct 5" for compact chart axes.
 */
export function formatDateShort(str: string | null | undefined): string {
  if (!str) return ""
  const dt = parseRecordDate(str)
  if (!dt) return str
  return format(dt, "MMM d")
}

/**
 * Formats a date string as "October 5, 2026" for tooltips.
 */
export function formatDateFull(str: string | null | undefined): string {
  if (!str) return "—"
  const dt = parseRecordDate(str)
  if (!dt) return str
  return format(dt, "MMMM d, yyyy")
}

/**
 * Formats a full timestamp ("YYYY-MM-DD HH:MM") as "Oct 5, 2026 · 12:02 AM".
 */
export function formatDateTime(str: string | null | undefined): string {
  if (!str) return "—"
  const dt = parseRecordDate(str)
  if (!dt) return str
  return format(dt, "MMM d, yyyy · h:mm a")
}

/**
 * Formats a 24-hour integer (0-23) as "2 AM", "12 PM", etc.
 */
export function formatHourLabel(hour: number): string {
  const h = ((hour % 24) + 24) % 24
  if (h === 0) return "12 AM"
  if (h === 12) return "12 PM"
  return h < 12 ? `${h} AM` : `${h - 12} PM`
}

/**
 * Formats a "YYYY-MM" month string as "Oct 2025".
 */
export function formatMonthLabel(monthStr: string): string {
  if (!monthStr || monthStr.length < 7) return monthStr
  const dt = parseISO(`${monthStr}-01`)
  return isValid(dt) ? format(dt, "MMM yyyy") : monthStr
}
