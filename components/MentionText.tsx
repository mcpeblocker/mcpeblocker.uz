import { findEntity, MENTION_RE } from '@/lib/mentions'
import Link from 'next/link'
import { Fragment, ReactNode } from 'react'

// Plain text with @mentions turned into links to /at/<id> (same rules as posts).
export default function MentionText({
  text,
  linkClassName = 'underline decoration-primary-500/60 underline-offset-2 hover:decoration-primary-500',
}: {
  text: string
  linkClassName?: string
}) {
  const parts: ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(MENTION_RE)) {
    const entity = findEntity(m[1])
    if (!entity || m.index === undefined) continue
    parts.push(text.slice(last, m.index))
    parts.push(
      <Link key={m.index} href={`/at/${entity.id}`} className={linkClassName}>
        {entity.name}
      </Link>
    )
    last = m.index + m[0].length
  }
  parts.push(text.slice(last))
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>{p}</Fragment>
      ))}
    </>
  )
}

export const hasMentions = (text: string) =>
  Array.from(text.matchAll(MENTION_RE)).some((m) => findEntity(m[1]))
