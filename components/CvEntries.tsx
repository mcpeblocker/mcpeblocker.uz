import entities from '@/data/entities'
import { CvEntry } from '@/data/cvData'
import { formatPeriod } from '@/lib/utils/activities'
import Link from 'next/link'

const nameOf = (id: string) => entities.find((e) => e.id === id)?.name ?? id

export default function CvEntries({ entries }: { entries: CvEntry[] }) {
  return (
    <ol className="space-y-9">
      {entries.map((e) => (
        <li
          key={`${e.org}-${e.title}-${e.start}`}
          className="grid gap-1 sm:grid-cols-[11rem_1fr] sm:gap-8"
        >
          <div className="text-sm text-gray-500 dark:text-gray-400 sm:pt-1">
            <p className="font-medium">{formatPeriod({ ...e, ongoing: !e.end })}</p>
            <p>{e.location}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold leading-snug text-gray-900 dark:text-gray-100">
              {e.title}
            </h3>
            <Link
              href={`/at/${e.org}`}
              className="font-medium text-primary-700 hover:underline dark:text-primary-300"
            >
              {nameOf(e.org)}
            </Link>
            {e.details && <p className="mt-2 text-gray-600 dark:text-gray-400">{e.details}</p>}
            {e.points && (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700 marker:text-gray-400 dark:text-gray-300">
                {e.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}
            {e.skills && (
              <p className="mt-2 flex flex-wrap gap-1.5">
                {e.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded border border-gray-300 px-1.5 py-0.5 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-400"
                  >
                    {s}
                  </span>
                ))}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
