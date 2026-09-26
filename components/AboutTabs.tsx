import { aboutTabs } from '@/data/headerNavLinks'
import Link from 'next/link'
import { useRouter } from 'next/router'

// Sub-navigation shared by the pages of the About section.
export default function AboutTabs() {
  const { pathname } = useRouter()
  return (
    <nav
      aria-label="About sections"
      className="flex gap-6 overflow-x-auto overflow-y-hidden border-b border-gray-200 pt-2 [scrollbar-width:none] dark:border-gray-700"
    >
      {aboutTabs.map((t) => {
        const active = pathname === t.href
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? 'page' : undefined}
            className={`shrink-0 border-b-2 pb-2 text-base font-semibold transition-colors ${
              active
                ? 'border-primary-500 text-gray-900 dark:text-gray-100'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            }`}
          >
            {t.title}
          </Link>
        )
      })}
    </nav>
  )
}
