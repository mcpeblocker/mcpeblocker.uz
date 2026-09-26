import Link from 'next/link'
import MentionText, { hasMentions } from '@/components/MentionText'
import { Activity } from '@/data/activitiesData'
import kebabCase from '@/lib/utils/kebabCase'

const pill =
  'ml-2 inline-block rounded border border-gray-300 px-1.5 align-middle text-[0.65rem] font-semibold uppercase leading-4 tracking-wide text-gray-500 hover:border-primary-500 hover:text-primary-600 dark:border-gray-600 dark:text-gray-400 dark:hover:text-primary-400'

// Small links to the same thing listed on /cv and /projects.
const Refs = ({ cv, project }: Pick<Activity, 'cv' | 'project'>) => (
  <>
    {cv && (
      <Link href={`/cv#${cv}`} className={pill} title="See it on my CV">
        CV
      </Link>
    )}
    {project && (
      <Link href={`/projects#${kebabCase(project)}`} className={pill} title={`Project: ${project}`}>
        Project
      </Link>
    )}
  </>
)

// An activity's title. Plain titles link to `href` as a whole; titles with
// @mentions link each mention to its /at/ page and put `href` on a small ↗.
export default function ActivityTitle({
  activity,
  className = '',
  linkClassName = '',
}: {
  activity: Pick<Activity, 'title' | 'href' | 'cv' | 'project'>
  className?: string
  linkClassName?: string
}) {
  const { title, href } = activity
  const external = href && !href.startsWith('/')
  const linkProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  if (!hasMentions(title)) {
    return (
      <span>
        {href ? (
          <a href={href} {...linkProps} className={`${className} ${linkClassName}`}>
            {title}
          </a>
        ) : (
          <span className={className}>{title}</span>
        )}
        <Refs {...activity} />
      </span>
    )
  }
  return (
    <span className={className}>
      <MentionText text={title} />
      {href && (
        <a href={href} {...linkProps} aria-label="Open link" className={`ml-1 ${linkClassName}`}>
          ↗
        </a>
      )}
      <Refs {...activity} />
    </span>
  )
}
