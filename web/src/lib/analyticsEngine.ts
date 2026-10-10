import { getISOWeek, getISOWeekYear, parseISO, differenceInCalendarDays } from "date-fns"
import type {
  AnalyticsSummary,
  ListeningRecord,
  RankedArtist,
  RankedTrack,
  ReplayedTrack,
} from "@/types/analytics"

export interface MonthlyDominantItem {
  month: string
  topTrack: {
    trackName: string
    artistName: string
    playCount: number
    hours: number
  }
  topArtist: {
    artistName: string
    playCount: number
    hours: number
  }
  totalPlays: number
  totalHours: number
}

export interface ArtistHistoryPattern {
  artistName: string
  firstPlayDate: string
  lastPlayDate: string
  activeDaysCount: number
  activeMonthsCount: number
  spanDays: number
  playCount: number
  hours: number
}

export interface SingleDayBinge {
  date: string
  trackName: string
  artistName: string
  playCount: number
  hours: number
}

export interface PlaybackQualificationBreakdown {
  totalRecordedEvents: number
  qualifiedPlaysCount: number // >= 30,000 ms (Spotify's standard 30s monetization/chart threshold)
  briefPlaysCount: number // < 30,000 ms (skips / brief samples)
  zeroDurationCount: number // 0 ms events
  qualifiedPercentage: number
  qualifiedHours: number
  briefHours: number
}

export interface ExtendedInsights {
  allTracksByPlays: RankedTrack[]
  allTracksByDuration: RankedTrack[]
  allArtistsByPlays: RankedArtist[]
  allArtistsByDuration: RankedArtist[]
  monthlyDominance: MonthlyDominantItem[]
  artistPatterns: Record<string, ArtistHistoryPattern>
  topSingleDayBinges: SingleDayBinge[]
  qualificationBreakdown: PlaybackQualificationBreakdown
}

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

const NIGHT_HOURS = new Set([22, 23, 0, 1, 2, 3, 4, 5])

function round(val: number, decimals = 2): number {
  const factor = Math.pow(10, decimals)
  return Math.round(val * factor) / factor
}

/**
 * Recomputes the full AnalyticsSummary for any subset of ListeningRecord[],
 * matching soundprint/analytics.py 1-to-1 so global date filtering updates all views.
 */
export function computeAnalyticsSummary(
  records: ListeningRecord[],
  limit = 50
): AnalyticsSummary {
  const totalStreams = records.length
  let totalMs = 0

  const dailyMap = new Map<
    string,
    { msPlayed: number; playCount: number; tracks: Set<string>; artists: Set<string> }
  >()
  const weeklyMap = new Map<string, { msPlayed: number; playCount: number }>()
  const monthlyMap = new Map<string, { msPlayed: number; playCount: number }>()

  const trackPlays = new Map<string, { artist: string; track: string; count: number; ms: number }>()
  const artistPlays = new Map<
    string,
    { artist: string; count: number; ms: number; tracks: Set<string> }
  >()

  const hourCounts = new Array<number>(24).fill(0)
  const hourMs = new Array<number>(24).fill(0)
  const dowCounts = new Array<number>(7).fill(0)
  const dowMs = new Array<number>(7).fill(0)

  for (const r of records) {
    const ms = r.msPlayed || 0
    totalMs += ms

    const artist = (r.artistName || "").trim()
    const track = (r.trackName || "").trim()
    const trackKey = `${artist}\u0000${track}`

    // Track aggregation
    const tEntry = trackPlays.get(trackKey)
    if (tEntry) {
      tEntry.count += 1
      tEntry.ms += ms
    } else {
      trackPlays.set(trackKey, { artist, track, count: 1, ms })
    }

    // Artist aggregation
    const aEntry = artistPlays.get(artist)
    if (aEntry) {
      aEntry.count += 1
      aEntry.ms += ms
      aEntry.tracks.add(track)
    } else {
      artistPlays.set(artist, { artist, count: 1, ms, tracks: new Set([track]) })
    }

    const endTime = r.endTime || ""
    if (endTime.length >= 10) {
      const dateStr = endTime.slice(0, 10)
      const monthStr = endTime.slice(0, 7)

      // Daily
      let dEntry = dailyMap.get(dateStr)
      if (!dEntry) {
        dEntry = { msPlayed: 0, playCount: 0, tracks: new Set(), artists: new Set() }
        dailyMap.set(dateStr, dEntry)
      }
      dEntry.msPlayed += ms
      dEntry.playCount += 1
      dEntry.tracks.add(trackKey)
      dEntry.artists.add(artist)

      // Monthly
      let mEntry = monthlyMap.get(monthStr)
      if (!mEntry) {
        mEntry = { msPlayed: 0, playCount: 0 }
        monthlyMap.set(monthStr, mEntry)
      }
      mEntry.msPlayed += ms
      mEntry.playCount += 1

      // Weekly + Temporal
      const dt = parseISO(endTime.replace(" ", "T"))
      if (!Number.isNaN(dt.getTime())) {
        const isoYear = getISOWeekYear(dt)
        const isoWeek = getISOWeek(dt)
        const weekStr = `${isoYear}-W${String(isoWeek).padStart(2, "0")}`
        let wEntry = weeklyMap.get(weekStr)
        if (!wEntry) {
          wEntry = { msPlayed: 0, playCount: 0 }
          weeklyMap.set(weekStr, wEntry)
        }
        wEntry.msPlayed += ms
        wEntry.playCount += 1

        const hour = dt.getHours()
        hourCounts[hour] += 1
        hourMs[hour] += ms

        // JS getDay(): 0 = Sunday, convert to 0 = Monday
        const jsDay = dt.getDay()
        const mondayIdx = (jsDay + 6) % 7
        dowCounts[mondayIdx] += 1
        dowMs[mondayIdx] += ms
      }
    }
  }

  // 1. Overview
  const seconds = totalMs / 1000
  const minutes = seconds / 60
  const hours = minutes / 60
  const days = hours / 24

  const overview = {
    total_ms: totalMs,
    total_seconds: round(seconds, 2),
    total_minutes: round(minutes, 2),
    total_hours: round(hours, 2),
    total_days: round(days, 2),
    total_streams: totalStreams,
  }

  // 2. Activity Trends
  const sortedDates = Array.from(dailyMap.keys()).sort()
  const daily = sortedDates.map((date) => {
    const d = dailyMap.get(date)!
    return {
      date,
      msPlayed: d.msPlayed,
      hours: round(d.msPlayed / 3_600_000, 2),
      playCount: d.playCount,
      uniqueTracks: d.tracks.size,
      uniqueArtists: d.artists.size,
    }
  })

  const weekly = Array.from(weeklyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([isoWeek, d]) => ({
      isoWeek,
      msPlayed: d.msPlayed,
      hours: round(d.msPlayed / 3_600_000, 2),
      playCount: d.playCount,
    }))

  const monthly = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, d]) => ({
      month,
      msPlayed: d.msPlayed,
      hours: round(d.msPlayed / 3_600_000, 2),
      playCount: d.playCount,
    }))

  // 3. Top Tracks & Artists
  const allTracksArr = Array.from(trackPlays.values())
  const allArtistsArr = Array.from(artistPlays.values())

  const top_tracks_by_plays: RankedTrack[] = [...allTracksArr]
    .sort((a, b) => b.count - a.count || b.ms - a.ms)
    .slice(0, limit)
    .map((item, idx) => ({
      rank: idx + 1,
      artistName: item.artist,
      trackName: item.track,
      playCount: item.count,
      msPlayed: item.ms,
      hours: round(item.ms / 3_600_000, 2),
    }))

  const top_tracks_by_duration: RankedTrack[] = [...allTracksArr]
    .sort((a, b) => b.ms - a.ms || b.count - a.count)
    .slice(0, limit)
    .map((item, idx) => ({
      rank: idx + 1,
      artistName: item.artist,
      trackName: item.track,
      msPlayed: item.ms,
      hours: round(item.ms / 3_600_000, 2),
      playCount: item.count,
    }))

  const top_artists_by_plays: RankedArtist[] = [...allArtistsArr]
    .sort((a, b) => b.count - a.count || b.ms - a.ms)
    .slice(0, limit)
    .map((item, idx) => ({
      rank: idx + 1,
      artistName: item.artist,
      playCount: item.count,
      msPlayed: item.ms,
      hours: round(item.ms / 3_600_000, 2),
      uniqueTracks: item.tracks.size,
    }))

  const top_artists_by_duration: RankedArtist[] = [...allArtistsArr]
    .sort((a, b) => b.ms - a.ms || b.count - a.count)
    .slice(0, limit)
    .map((item, idx) => ({
      rank: idx + 1,
      artistName: item.artist,
      msPlayed: item.ms,
      hours: round(item.ms / 3_600_000, 2),
      playCount: item.count,
      uniqueTracks: item.tracks.size,
    }))

  // 4. Replays
  const totalUniqueTracks = allTracksArr.length
  const replayedTracksArr = allTracksArr.filter((t) => t.count > 1)
  const replayedTracksCount = replayedTracksArr.length
  const singleListenTracksCount = totalUniqueTracks - replayedTracksCount
  const totalReplayStreams = replayedTracksArr.reduce((acc, t) => acc + (t.count - 1), 0)
  const trackReplayPercentage =
    totalUniqueTracks > 0 ? round((replayedTracksCount / totalUniqueTracks) * 100, 2) : 0

  const most_replayed_tracks: ReplayedTrack[] = [...replayedTracksArr]
    .sort((a, b) => b.count - a.count || b.ms - a.ms)
    .slice(0, limit)
    .map((item, idx) => ({
      rank: idx + 1,
      artistName: item.artist,
      trackName: item.track,
      playCount: item.count,
      replayCount: item.count - 1,
      msPlayed: item.ms,
      hours: round(item.ms / 3_600_000, 2),
    }))

  // 5. Streaks & Calendar Heatmap
  let longestStreak = 0
  let currentStreak = 0
  let tempStreak = 0
  let prevDate: Date | null = null

  const activeDateObjects = sortedDates.map((d) => parseISO(d))
  for (const d of activeDateObjects) {
    if (!prevDate) {
      tempStreak = 1
    } else if (differenceInCalendarDays(d, prevDate) === 1) {
      tempStreak += 1
    } else {
      tempStreak = 1
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak
    prevDate = d
  }

  if (activeDateObjects.length > 0) {
    currentStreak = 1
    for (let i = activeDateObjects.length - 1; i > 0; i--) {
      if (differenceInCalendarDays(activeDateObjects[i], activeDateObjects[i - 1]) === 1) {
        currentStreak += 1
      } else {
        break
      }
    }
  }

  const calendar_heatmap: Record<string, { playCount: number; msPlayed: number; hours: number }> =
    {}
  for (const date of sortedDates) {
    const d = dailyMap.get(date)!
    calendar_heatmap[date] = {
      playCount: d.playCount,
      msPlayed: d.msPlayed,
      hours: round(d.msPlayed / 3_600_000, 2),
    }
  }

  const streaks = {
    total_active_days: sortedDates.length,
    longest_streak_days: longestStreak,
    current_streak_days: currentStreak,
    first_active_date: sortedDates[0] ?? null,
    last_active_date: sortedDates[sortedDates.length - 1] ?? null,
    calendar_heatmap,
  }

  // 6. Temporal
  const hourly_distribution = hourCounts.map((playCount, h) => ({
    hour: h,
    label: `${String(h).padStart(2, "0")}:00 - ${String(h).padStart(2, "0")}:59`,
    playCount,
    msPlayed: hourMs[h],
    hours: round(hourMs[h] / 3_600_000, 2),
    percentage: totalStreams > 0 ? round((playCount / totalStreams) * 100, 2) : 0,
  }))

  const day_of_week_distribution = dowCounts.map((playCount, d) => ({
    dayIndex: d,
    dayName: DAY_NAMES[d],
    playCount,
    msPlayed: dowMs[d],
    hours: round(dowMs[d] / 3_600_000, 2),
    percentage: totalStreams > 0 ? round((playCount / totalStreams) * 100, 2) : 0,
  }))

  let peakHour = 0
  for (let h = 1; h < 24; h++) {
    if (hourCounts[h] > hourCounts[peakHour]) peakHour = h
  }
  let peakDayIdx = 0
  for (let d = 1; d < 7; d++) {
    if (dowCounts[d] > dowCounts[peakDayIdx]) peakDayIdx = d
  }

  const temporal = {
    peak_hour: totalStreams > 0 ? peakHour : 0,
    peak_day: DAY_NAMES[totalStreams > 0 ? peakDayIdx : 0],
    hourly_distribution,
    day_of_week_distribution,
  }

  // 7. Diversity
  const uniqueArtists = allArtistsArr.length
  const uniqueTracks = allTracksArr.length
  const artistDiversityRatio = totalStreams > 0 ? round(uniqueArtists / totalStreams, 4) : 0
  const trackDiversityRatio = totalStreams > 0 ? round(uniqueTracks / totalStreams, 4) : 0

  let artistEntropy = 0
  if (totalStreams > 0) {
    for (const a of allArtistsArr) {
      const p = a.count / totalStreams
      if (p > 0) artistEntropy -= p * Math.log(p)
    }
  }

  let trackEntropy = 0
  if (totalStreams > 0) {
    for (const t of allTracksArr) {
      const p = t.count / totalStreams
      if (p > 0) trackEntropy -= p * Math.log(p)
    }
  }

  const sortedArtistCounts = allArtistsArr.map((a) => a.count).sort((a, b) => a - b)
  const n = sortedArtistCounts.length
  let gini = 0
  if (n > 0 && totalStreams > 0) {
    let cumulative = 0
    for (let i = 0; i < n; i++) {
      cumulative += (i + 1) * sortedArtistCounts[i]
    }
    gini = (2 * cumulative) / (n * totalStreams) - (n + 1) / n
  }

  const top10Plays = top_artists_by_plays
    .slice(0, 10)
    .reduce((acc, a) => acc + a.playCount, 0)
  const top10SharePercent = totalStreams > 0 ? round((top10Plays / totalStreams) * 100, 2) : 0

  const diversity = {
    total_streams: totalStreams,
    unique_artists: uniqueArtists,
    unique_tracks: uniqueTracks,
    artist_diversity_ratio: artistDiversityRatio,
    track_diversity_ratio: trackDiversityRatio,
    artist_shannon_entropy: round(artistEntropy, 3),
    track_shannon_entropy: round(trackEntropy, 3),
    artist_gini_coefficient: round(gini, 3),
    top_10_artists_play_share_percent: top10SharePercent,
  }

  // 8. Scores & Profile
  const nightPlays = hourly_distribution
    .filter((item) => NIGHT_HOURS.has(item.hour))
    .reduce((acc, item) => acc + item.playCount, 0)
  const nightOwlPercentage = totalStreams > 0 ? round((nightPlays / totalStreams) * 100, 2) : 0

  const casualArtists = allArtistsArr.filter((a) => a.count <= 2).length
  const discoveryScore = uniqueArtists > 0 ? round((casualArtists / uniqueArtists) * 100, 2) : 0

  let consistencyScore = 0
  if (streaks.first_active_date && streaks.last_active_date) {
    const dStart = parseISO(streaks.first_active_date)
    const dEnd = parseISO(streaks.last_active_date)
    const spanDays = Math.max(1, differenceInCalendarDays(dEnd, dStart) + 1)
    consistencyScore = round((streaks.total_active_days / spanDays) * 100, 2)
  }

  const primaryArchetypes: string[] = []
  if (nightOwlPercentage > 35) primaryArchetypes.push("Nocturnal Listener")
  if (discoveryScore > 60) {
    primaryArchetypes.push("Eclectic Explorer")
  } else if (discoveryScore < 30 && totalStreams > 0) {
    primaryArchetypes.push("Loyal Repeater")
  }
  if (artistDiversityRatio > 0.15) primaryArchetypes.push("Wide Spectrum")
  if (longestStreak >= 14) primaryArchetypes.push("Streak Master")

  const scores_and_profile = {
    night_owl_percentage: nightOwlPercentage,
    discovery_score: discoveryScore,
    consistency_score: consistencyScore,
    primary_archetypes: primaryArchetypes,
    peak_hour: temporal.peak_hour,
    peak_day: temporal.peak_day,
  }

  return {
    overview,
    diversity,
    scores_and_profile,
    replays: {
      total_unique_tracks: totalUniqueTracks,
      replayed_tracks_count: replayedTracksCount,
      single_listen_tracks_count: singleListenTracksCount,
      total_replay_streams: totalReplayStreams,
      track_replay_percentage: trackReplayPercentage,
      most_replayed_tracks,
    },
    streaks,
    top_music: {
      top_tracks_by_plays,
      top_tracks_by_duration,
      top_artists_by_plays,
      top_artists_by_duration,
    },
    temporal,
    activity_trends: {
      daily,
      weekly,
      monthly,
    },
  }
}

/**
 * Computes extended insights from listening records:
 * - Full ranked lists of all tracks & artists (supporting search across the entire catalog)
 * - Monthly dominant tracks and artists
 * - Artist first appearance and return spans
 * - Highest single-day track repeat binges
 * - Recorded events vs qualified plays (>= 30s) breakdown
 */
export function computeExtendedInsights(records: ListeningRecord[]): ExtendedInsights {
  const trackMap = new Map<string, { artist: string; track: string; count: number; ms: number }>()
  const artistMap = new Map<
    string,
    {
      artist: string
      count: number
      ms: number
      tracks: Set<string>
      firstDate: string
      lastDate: string
      days: Set<string>
      months: Set<string>
    }
  >()

  const monthTrackMap = new Map<
    string,
    Map<string, { trackName: string; artistName: string; count: number; ms: number }>
  >()
  const monthArtistMap = new Map<
    string,
    Map<string, { artistName: string; count: number; ms: number }>
  >()
  const monthTotals = new Map<string, { count: number; ms: number }>()

  const dayTrackBingeMap = new Map<
    string,
    { date: string; trackName: string; artistName: string; count: number; ms: number }
  >()

  let qualifiedPlaysCount = 0
  let briefPlaysCount = 0
  let zeroDurationCount = 0
  let qualifiedMs = 0
  let briefMs = 0

  for (const r of records) {
    const ms = r.msPlayed || 0
    const artist = (r.artistName || "").trim()
    const track = (r.trackName || "").trim()
    const trackKey = `${artist}\u0000${track}`
    const endTime = r.endTime || ""
    const dateStr = endTime.slice(0, 10)
    const monthStr = endTime.slice(0, 7)

    if (ms >= 30_000) {
      qualifiedPlaysCount += 1
      qualifiedMs += ms
    } else {
      briefPlaysCount += 1
      briefMs += ms
      if (ms === 0) zeroDurationCount += 1
    }

    // Track
    const t = trackMap.get(trackKey)
    if (t) {
      t.count += 1
      t.ms += ms
    } else {
      trackMap.set(trackKey, { artist, track, count: 1, ms })
    }

    // Artist
    const a = artistMap.get(artist)
    if (a) {
      a.count += 1
      a.ms += ms
      a.tracks.add(track)
      if (dateStr && dateStr < a.firstDate) a.firstDate = dateStr
      if (dateStr && dateStr > a.lastDate) a.lastDate = dateStr
      if (dateStr) a.days.add(dateStr)
      if (monthStr) a.months.add(monthStr)
    } else {
      artistMap.set(artist, {
        artist,
        count: 1,
        ms,
        tracks: new Set([track]),
        firstDate: dateStr,
        lastDate: dateStr,
        days: new Set(dateStr ? [dateStr] : []),
        months: new Set(monthStr ? [monthStr] : []),
      })
    }

    // Monthly dominance
    if (monthStr.length === 7) {
      let mTot = monthTotals.get(monthStr)
      if (!mTot) {
        mTot = { count: 0, ms: 0 }
        monthTotals.set(monthStr, mTot)
      }
      mTot.count += 1
      mTot.ms += ms

      let mTracks = monthTrackMap.get(monthStr)
      if (!mTracks) {
        mTracks = new Map()
        monthTrackMap.set(monthStr, mTracks)
      }
      const mt = mTracks.get(trackKey)
      if (mt) {
        mt.count += 1
        mt.ms += ms
      } else {
        mTracks.set(trackKey, { trackName: track, artistName: artist, count: 1, ms })
      }

      let mArtists = monthArtistMap.get(monthStr)
      if (!mArtists) {
        mArtists = new Map()
        monthArtistMap.set(monthStr, mArtists)
      }
      const ma = mArtists.get(artist)
      if (ma) {
        ma.count += 1
        ma.ms += ms
      } else {
        mArtists.set(artist, { artistName: artist, count: 1, ms })
      }
    }

    // Single-day track binge
    if (dateStr.length === 10) {
      const dayTrackKey = `${dateStr}\u0000${trackKey}`
      const dtb = dayTrackBingeMap.get(dayTrackKey)
      if (dtb) {
        dtb.count += 1
        dtb.ms += ms
      } else {
        dayTrackBingeMap.set(dayTrackKey, {
          date: dateStr,
          trackName: track,
          artistName: artist,
          count: 1,
          ms,
        })
      }
    }
  }

  const allTracksArr = Array.from(trackMap.values())
  const allArtistsArr = Array.from(artistMap.values())

  const allTracksByPlays: RankedTrack[] = [...allTracksArr]
    .sort((a, b) => b.count - a.count || b.ms - a.ms)
    .map((item, idx) => ({
      rank: idx + 1,
      artistName: item.artist,
      trackName: item.track,
      playCount: item.count,
      msPlayed: item.ms,
      hours: round(item.ms / 3_600_000, 2),
    }))

  const allTracksByDuration: RankedTrack[] = [...allTracksArr]
    .sort((a, b) => b.ms - a.ms || b.count - a.count)
    .map((item, idx) => ({
      rank: idx + 1,
      artistName: item.artist,
      trackName: item.track,
      msPlayed: item.ms,
      hours: round(item.ms / 3_600_000, 2),
      playCount: item.count,
    }))

  const allArtistsByPlays: RankedArtist[] = [...allArtistsArr]
    .sort((a, b) => b.count - a.count || b.ms - a.ms)
    .map((item, idx) => ({
      rank: idx + 1,
      artistName: item.artist,
      playCount: item.count,
      msPlayed: item.ms,
      hours: round(item.ms / 3_600_000, 2),
      uniqueTracks: item.tracks.size,
    }))

  const allArtistsByDuration: RankedArtist[] = [...allArtistsArr]
    .sort((a, b) => b.ms - a.ms || b.count - a.count)
    .map((item, idx) => ({
      rank: idx + 1,
      artistName: item.artist,
      msPlayed: item.ms,
      hours: round(item.ms / 3_600_000, 2),
      playCount: item.count,
      uniqueTracks: item.tracks.size,
    }))

  const monthlyDominance: MonthlyDominantItem[] = Array.from(monthTotals.keys())
    .sort()
    .map((month) => {
      const mTot = monthTotals.get(month)!
      const tracks = Array.from(monthTrackMap.get(month)?.values() ?? []).sort(
        (a, b) => b.count - a.count || b.ms - a.ms
      )
      const artists = Array.from(monthArtistMap.get(month)?.values() ?? []).sort(
        (a, b) => b.count - a.count || b.ms - a.ms
      )
      const topT = tracks[0] ?? { trackName: "—", artistName: "—", count: 0, ms: 0 }
      const topA = artists[0] ?? { artistName: "—", count: 0, ms: 0 }

      return {
        month,
        topTrack: {
          trackName: topT.trackName,
          artistName: topT.artistName,
          playCount: topT.count,
          hours: round(topT.ms / 3_600_000, 2),
        },
        topArtist: {
          artistName: topA.artistName,
          playCount: topA.count,
          hours: round(topA.ms / 3_600_000, 2),
        },
        totalPlays: mTot.count,
        totalHours: round(mTot.ms / 3_600_000, 2),
      }
    })

  const artistPatterns: Record<string, ArtistHistoryPattern> = {}
  for (const a of allArtistsArr) {
    let spanDays = 1
    if (a.firstDate && a.lastDate) {
      spanDays = Math.max(
        1,
        differenceInCalendarDays(parseISO(a.lastDate), parseISO(a.firstDate)) + 1
      )
    }
    artistPatterns[a.artist] = {
      artistName: a.artist,
      firstPlayDate: a.firstDate,
      lastPlayDate: a.lastDate,
      activeDaysCount: a.days.size,
      activeMonthsCount: a.months.size,
      spanDays,
      playCount: a.count,
      hours: round(a.ms / 3_600_000, 2),
    }
  }

  const topSingleDayBinges: SingleDayBinge[] = Array.from(dayTrackBingeMap.values())
    .filter((b) => b.count >= 3)
    .sort((a, b) => b.count - a.count || b.ms - a.ms)
    .slice(0, 15)
    .map((b) => ({
      date: b.date,
      trackName: b.trackName,
      artistName: b.artistName,
      playCount: b.count,
      hours: round(b.ms / 3_600_000, 2),
    }))

  const totalRecordedEvents = records.length
  const qualificationBreakdown: PlaybackQualificationBreakdown = {
    totalRecordedEvents,
    qualifiedPlaysCount,
    briefPlaysCount,
    zeroDurationCount,
    qualifiedPercentage:
      totalRecordedEvents > 0 ? round((qualifiedPlaysCount / totalRecordedEvents) * 100, 1) : 0,
    qualifiedHours: round(qualifiedMs / 3_600_000, 2),
    briefHours: round(briefMs / 3_600_000, 2),
  }

  return {
    allTracksByPlays,
    allTracksByDuration,
    allArtistsByPlays,
    allArtistsByDuration,
    monthlyDominance,
    artistPatterns,
    topSingleDayBinges,
    qualificationBreakdown,
  }
}
