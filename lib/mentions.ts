import { Parent } from 'unist'
import { visit } from 'unist-util-visit'
import entities, { Entity } from '../data/entities'

const byHandle = new Map<string, Entity>()
for (const e of entities) {
  for (const h of [e.id, ...(e.aliases ?? [])]) byHandle.set(h.toLowerCase(), e)
}

// @Handle not preceded by a word char, '@' or '.', so emails (me@kaist.ac.kr)
// and '@@' stay plain text. Trailing punctuation isn't part of the handle.
export const MENTION_RE = /(?<![\w@.])@([A-Za-z]\w*)/g

export const findEntity = (handle: string) => byHandle.get(handle.toLowerCase())

/** Entity ids mentioned in a markdown body (code blocks and inline code don't count). */
export const mentionsIn = (markdown: string): string[] => {
  const prose = markdown.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')
  const ids = Array.from(prose.matchAll(MENTION_RE), (m) => findEntity(m[1])?.id)
  return Array.from(new Set(ids.filter((id): id is string => !!id)))
}

type TextNode = { type: 'text'; value: string }

/** Remark plugin: `@KAIST` → link to /at/kaist. Unknown handles stay as text. */
export function remarkMentions() {
  return (tree: Parent) =>
    visit(tree, 'text', (node: TextNode, index: number | null, parent: Parent | null) => {
      if (!parent || index === null || parent.type === 'link' || parent.type === 'linkReference')
        return
      const parts: unknown[] = []
      let last = 0
      for (const m of node.value.matchAll(MENTION_RE)) {
        const entity = findEntity(m[1])
        if (!entity || m.index === undefined) continue
        if (m.index > last) parts.push({ type: 'text', value: node.value.slice(last, m.index) })
        parts.push({
          type: 'link',
          url: `/at/${entity.id}`,
          title: entity.name,
          children: [{ type: 'text', value: m[1] }],
        })
        last = m.index + m[0].length
      }
      if (!parts.length) return
      if (last < node.value.length) parts.push({ type: 'text', value: node.value.slice(last) })
      parent.children.splice(index, 1, ...(parts as Parent['children']))
      return index + parts.length // continue after the inserted nodes
    })
}
