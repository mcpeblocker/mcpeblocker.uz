import { Activity, ActivityDuration } from '@/data/activitiesData'

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

type ParsedDate = { year: number; month: number | null }

const parseDate = (s?: string): ParsedDate | null => {
  if (!s) return null
  const [yearPart, monthPart] = s.split('-')
  const year = Number(yearPart)
  if (Number.isNaN(year)) return null
  const month = monthPart ? Number(monthPart) : null
  return { year, month: month && !Number.isNaN(month) ? month : null }
}

/** 'YYYY-MM' / 'YYYY' → absolute month index (year * 12 + month), for sorting/spans. */
export const parseMonth = (s?: string): number | null => {
  const parsed = parseDate(s)
  if (!parsed) return null
  return parsed.year * 12 + (parsed.month ? parsed.month - 1 : 0)
}

/** Every calendar year the activity spans. Undated items → []. */
export const activityYears = (a: Activity): number[] => {
  const start = parseDate(a.start)
  if (!start) return []
  const endYear = a.ongoing ? new Date().getFullYear() : parseDate(a.end)?.year ?? start.year
  const years: number[] = []
  for (let y = start.year; y <= endYear; y++) years.push(y)
  return years
}

/** Duration bucket derived from the span between start and end. */
export const activityDuration = (a: Activity): ActivityDuration => {
  if (a.ongoing) return 'long'
  const start = parseMonth(a.start)
  const end = parseMonth(a.end)
  if (start === null) return 'one-time'
  if (end === null) return 'one-time'
  const span = end - start
  if (span <= 0) return 'one-time'
  if (span < 6) return 'short'
  return 'long'
}

const formatMonthYear = (parsed: ParsedDate): string =>
  parsed.month ? `${MONTH_LABELS[parsed.month - 1]} ${parsed.year}` : `${parsed.year}`

/** Human-readable period label, e.g. "Sep 2026 – Jan 2027", "Oct – Nov 2025", "2023 – Present". */
export const formatPeriod = (a: Activity): string => {
  const start = parseDate(a.start)
  if (!start) return 'Ongoing'
  const startLabel = formatMonthYear(start)

  if (a.ongoing) return `${startLabel} – Present`

  const end = parseDate(a.end)
  if (!end) return startLabel

  // Same year with both months known → collapse the year: "Oct – Nov 2025".
  if (start.year === end.year && start.month && end.month) {
    return `${MONTH_LABELS[start.month - 1]} – ${MONTH_LABELS[end.month - 1]} ${end.year}`
  }
  return `${startLabel} – ${formatMonthYear(end)}`
}

/** Sort ongoing first, then by start month descending (newest/upcoming first); undated items sink to the bottom. */
export const sortActivities = (list: Activity[]): Activity[] =>
  [...list].sort((a, b) => {
    if (a.ongoing !== b.ongoing) return a.ongoing ? -1 : 1
    const am = parseMonth(a.start)
    const bm = parseMonth(b.start)
    if (am === null && bm === null) return 0
    if (am === null) return 1
    if (bm === null) return -1
    return bm - am
  })
