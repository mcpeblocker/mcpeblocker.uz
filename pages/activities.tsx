import LayoutWrapper from '@/components/LayoutWrapper'
import { PageSEO } from '@/components/SEO'
import activitiesData, {
  Activity,
  activityCategories,
  activityDurations,
  sdgGoals,
} from '@/data/activitiesData'
import siteMetadata from '@/data/siteMetadata'
import {
  activityDuration,
  activityYears,
  formatPeriod,
  sortActivities,
} from '@/lib/utils/activities'
import classNames from 'classnames'
import { useMemo, useState } from 'react'

const categoryLabels = Object.fromEntries(
  activityCategories.map((c) => [c.key, c.label])
) as Record<string, string>

// Distinct filter values, derived once from the data so new entries need no bookkeeping.
const allYears = Array.from(new Set(activitiesData.flatMap((a) => activityYears(a)))).sort(
  (a, b) => b - a
)

const allTags = Array.from(new Set(activitiesData.flatMap((a) => a.tags))).sort()

type Toggle = (value: string) => void

const Chip = ({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className={classNames(
      'rounded-full border px-3 py-1 text-xs font-medium tracking-wide transition-colors',
      active
        ? 'border-primary-500 bg-primary-500 text-white'
        : 'border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
    )}
  >
    {label}
  </button>
)

const FilterGroup = ({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string
  options: { value: string; label: string }[]
  selected: Set<string>
  onToggle: Toggle
}) => (
  <div className="py-2">
    <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
      {title}
    </h3>
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip
          key={o.value}
          label={o.label}
          active={selected.has(o.value)}
          onClick={() => onToggle(o.value)}
        />
      ))}
    </div>
  </div>
)

export default function Activities() {
  const [categories, setCategories] = useState<Set<string>>(new Set())
  const [years, setYears] = useState<Set<string>>(new Set())
  const [durations, setDurations] = useState<Set<string>>(new Set())
  const [tags, setTags] = useState<Set<string>>(new Set())

  const toggle =
    (setter: (updater: (prev: Set<string>) => Set<string>) => void) => (value: string) =>
      setter((prev) => {
        const next = new Set(prev)
        if (next.has(value)) next.delete(value)
        else next.add(value)
        return next
      })

  const clearAll = () => {
    setCategories(new Set())
    setYears(new Set())
    setDurations(new Set())
    setTags(new Set())
  }

  const hasFilters = categories.size > 0 || years.size > 0 || durations.size > 0 || tags.size > 0

  const results = useMemo(() => {
    const filtered = activitiesData.filter((a) => {
      if (categories.size > 0 && !categories.has(a.category)) return false
      if (durations.size > 0 && !durations.has(activityDuration(a))) return false
      if (years.size > 0 && !activityYears(a).some((y) => years.has(String(y)))) return false
      if (tags.size > 0 && !a.tags.some((t) => tags.has(t))) return false
      return true
    })
    return sortActivities(filtered)
  }, [categories, years, durations, tags])

  return (
    <LayoutWrapper>
      <PageSEO
        title={`Activities - ${siteMetadata.author}`}
        description="Academic, research, quantum, entrepreneurship and software activities timeline"
      />
      <div>
        <div className="space-y-2 pt-6 pb-6 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14">
            Activities
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            What I've managed to blend so far:
          </p>
        </div>

        {/* Filter bar */}
        <div className="mb-8 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <FilterGroup
            title="Category"
            options={activityCategories.map((c) => ({ value: c.key, label: c.label }))}
            selected={categories}
            onToggle={toggle(setCategories)}
          />
          <details className="group">
            <summary className="cursor-pointer select-none py-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
              Advanced filters
              {years.size + durations.size + tags.size > 0 && (
                <span className="ml-1 text-primary-500">
                  ({years.size + durations.size + tags.size})
                </span>
              )}
            </summary>
            <FilterGroup
              title="Year"
              options={allYears.map((y) => ({ value: String(y), label: String(y) }))}
              selected={years}
              onToggle={toggle(setYears)}
            />
            <FilterGroup
              title="Duration"
              options={activityDurations.map((d) => ({ value: d.key, label: d.label }))}
              selected={durations}
              onToggle={toggle(setDurations)}
            />
            <FilterGroup
              title="Tag"
              options={allTags.map((t) => ({ value: t, label: t }))}
              selected={tags}
              onToggle={toggle(setTags)}
            />
          </details>
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {results.length} {results.length === 1 ? 'activity' : 'activities'}
            </span>
            {hasFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="text-sm font-medium text-primary-500 hover:text-primary-600"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {results.length === 0 ? (
          <p className="py-12 text-center text-gray-500 dark:text-gray-400">
            No activities match the selected filters.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {results.map((a) => (
              <ActivityRow
                key={`${a.title}-${a.start ?? ''}-${a.description ?? ''}`}
                activity={a}
                activeTags={tags}
                onTagClick={toggle(setTags)}
              />
            ))}
          </ul>
        )}
      </div>
    </LayoutWrapper>
  )
}

const SdgBadges = ({ sdgs }: { sdgs: number[] }) => (
  <div className="mt-2 flex flex-wrap gap-1.5">
    {sdgs.map((n) => {
      const goal = sdgGoals[n]
      if (!goal) return null
      return (
        <span
          key={n}
          title={`SDG ${n}: ${goal.label}`}
          style={{ backgroundColor: goal.color }}
          className="rounded px-1.5 py-0.5 text-xs font-semibold text-white"
        >
          SDG {n}
        </span>
      )
    })}
  </div>
)

const ActivityRow = ({
  activity,
  activeTags,
  onTagClick,
}: {
  activity: Activity
  activeTags: Set<string>
  onTagClick: Toggle
}) => (
  <li className="flex flex-col gap-2 py-5 sm:flex-row sm:gap-6">
    <div className="shrink-0 sm:w-44 sm:pt-0.5">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {formatPeriod(activity)}
      </p>
      {activity.upcoming && (
        <span className="mt-1 inline-block rounded bg-primary-100 px-1.5 py-0.5 text-xs font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-200">
          Upcoming
        </span>
      )}
    </div>
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {activity.href ? (
          <a
            href={activity.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-900 hover:text-primary-500 dark:text-gray-100"
          >
            {activity.title}
          </a>
        ) : (
          <span className="font-semibold text-gray-900 dark:text-gray-100">{activity.title}</span>
        )}
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
          {categoryLabels[activity.category]}
        </span>
      </div>
      {activity.description && (
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{activity.description}</p>
      )}
      {activity.sdgs && activity.sdgs.length > 0 && <SdgBadges sdgs={activity.sdgs} />}
      {activity.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {activity.tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTagClick(t)}
              className={classNames(
                'rounded px-1.5 py-0.5 text-xs transition-colors',
                activeTags.has(t)
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  </li>
)
