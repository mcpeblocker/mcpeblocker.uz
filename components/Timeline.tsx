import ActivityTitle from '@/components/ActivityTitle'
import activitiesData, { Activity, yearNames } from '@/data/activitiesData'
import { parseMonth } from '@/lib/utils/activities'

// Year-by-year view of the activity records (data/activitiesData.ts): each
// activity sits under the year it started. Used by the About page MDX.
const byYear = () => {
  const years = new Map<number, Activity[]>()
  for (const a of activitiesData) {
    const year = Number(a.start?.slice(0, 4))
    if (!year) continue // undated items have no place on a timeline
    years.set(year, [...(years.get(year) ?? []), a])
  }
  return Array.from(years.entries())
    .sort(([a], [b]) => b - a)
    .map(([year, items]) => ({
      year,
      items: items.sort((a, b) => (parseMonth(b.start) ?? 0) - (parseMonth(a.start) ?? 0)),
    }))
}

const Badge = ({ children }: { children: string }) => (
  <span className="ml-2 inline-block rounded border border-primary-500 px-1.5 align-middle text-xs font-semibold leading-5 text-primary-700 dark:text-primary-300">
    {children}
  </span>
)

export default function Timeline() {
  return (
    <div className="not-prose space-y-10">
      {byYear().map(({ year, items }) => (
        <section key={year}>
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {year}
            {yearNames[year] && (
              <span className="ml-3 text-base font-medium text-gray-500 dark:text-gray-400">
                {yearNames[year]}
              </span>
            )}
          </h3>
          <ul className="mt-3 space-y-2 border-l-2 border-gray-200 pl-5 dark:border-gray-700">
            {items.map((a) => (
              <li
                key={`${a.title}-${a.start}-${a.description ?? ''}`}
                className="text-gray-700 dark:text-gray-300"
              >
                <ActivityTitle
                  activity={a}
                  linkClassName="underline decoration-primary-500/60 underline-offset-2 hover:decoration-primary-500"
                />
                {a.ongoing && <Badge>ongoing</Badge>}
                {a.upcoming && <Badge>upcoming</Badge>}
                {a.description && (
                  <span className="block text-sm text-gray-500 dark:text-gray-400">
                    {a.description}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
