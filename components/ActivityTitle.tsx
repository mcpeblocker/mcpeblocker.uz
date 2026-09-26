import MentionText, { hasMentions } from '@/components/MentionText'
import { Activity } from '@/data/activitiesData'

// An activity's title. Plain titles link to `href` as a whole; titles with
// @mentions link each mention to its /at/ page and put `href` on a small ↗.
export default function ActivityTitle({
  activity,
  className = '',
  linkClassName = '',
}: {
  activity: Pick<Activity, 'title' | 'href'>
  className?: string
  linkClassName?: string
}) {
  const { title, href } = activity
  const external = href && !href.startsWith('/')
  const linkProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  if (!hasMentions(title)) {
    return href ? (
      <a href={href} {...linkProps} className={`${className} ${linkClassName}`}>
        {title}
      </a>
    ) : (
      <span className={className}>{title}</span>
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
    </span>
  )
}
