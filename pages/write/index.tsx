import TOCInline from '@/components/TOCInline'
import {
  BRANCH,
  commitFiles,
  Draft,
  DRAFTS_KEY,
  gh,
  joinPost,
  load,
  newDraft,
  newId,
  REPO,
  TOC_BLOCK,
  Unlock,
  useToken,
  WriteHead,
} from '@/components/WriteKit'
import siteMetadata from '@/data/siteMetadata'
import entities, { Entity, handleOf } from '@/data/entities'
import { accentStyle } from '@/lib/accent'
import { remarkMentions } from '@/lib/mentions'
import kebabCase from '@/lib/utils/kebabCase'
import Link from 'next/link'
import { ComponentType, Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { IconType } from 'react-icons'
import {
  RiAddLine,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiArticleLine,
  RiBold,
  RiCodeBoxLine,
  RiCodeLine,
  RiDeleteBinLine,
  RiDoubleQuotesL,
  RiFileList2Line,
  RiH2,
  RiH3,
  RiImageAddLine,
  RiItalic,
  RiLink,
  RiListOrdered,
  RiListUnordered,
  RiLockLine,
  RiSendPlaneFill,
  RiSeparator,
} from 'react-icons/ri'
import rehypeSlug from 'rehype-slug'
import { Toc } from 'types/Toc'

const AUTHOR = 'Alisher Ortiqov'
const AUTHOR_URL = 'https://t.me/alisherortiqov'
const MAX_IMG_WIDTH = 1600
const IMG_RE = /\(img:([\w-]+)\)/g

const slugOf = (d: Draft) => kebabCase(d.slug || d.title)
const extOf = (dataUrl: string) => dataUrl.slice(11, dataUrl.indexOf(';')).split('+')[0]
const imgPath = (slug: string, id: string, dataUrl: string) =>
  `/static/images/blog/${slug}/${id}.${extOf(dataUrl)}`

// MDX treats `{` and `<` as code. Escape them in prose so casual writing can't
// break the build; code and the TOC line are left alone. Never adds lines, so
// preview line numbers stay equal to editor line numbers.
const escapeMdx = (md: string) =>
  md
    .split(/(```[\s\S]*?```|`[^`\n]*`|^<TOCInline[^\n]*\/>$)/m)
    .map((part, i) =>
      i % 2 ? part : part.replace(/[{}]/g, '\\$&').replace(/<(?![A-Za-z/])/g, '&lt;')
    )
    .join('')

// Drafts from before the TOC moved into the body carried a `toc` flag.
const migrate = (d: Draft): Draft =>
  d.toc ? { ...d, toc: undefined, body: TOC_BLOCK + d.body } : d

const buildBody = (d: Draft, src: (id: string) => string) =>
  (d.raw ? d.body : escapeMdx(d.body)).replace(IMG_RE, (m, id) =>
    d.images[id] ? `(${src(id)})` : m
  )

const localId = (src?: string) => src?.match(/^img:([\w-]+)$/)?.[1]
// Images the post actually shows, in order, once each: pasted ones as
// 'img:<id>' (only if their data still exists), others as their src. Code
// blocks don't count. Same rule the site uses for the default preview image.
const postImages = (d: Draft) =>
  Array.from(
    new Set(
      Array.from(
        d.body
          .replace(/```[\s\S]*?```/g, '')
          .matchAll(/!\[[^\]]*\]\(\s*<?([^)\s>]+)|<(?:img|Image)\b[^>]*?\bsrc=["']([^"']+)/g),
        (m) => m[1] ?? m[2]
      )
    )
  ).filter((src) => {
    const id = localId(src)
    return !id || d.images[id]
  })
// Drop pasted images the draft no longer references (deleted while drafting).
// Only run on load/publish, never mid-session, so Ctrl+Z can bring one back.
const pruneImages = (d: Draft): Draft => {
  const keep = new Set([
    ...Array.from(d.body.matchAll(IMG_RE), (m) => m[1]),
    localId(d.thumbnail) ?? '',
  ])
  const images = Object.fromEntries(Object.entries(d.images).filter(([k]) => keep.has(k)))
  return Object.keys(images).length === Object.keys(d.images).length ? d : { ...d, images }
}
// The site path an image ends up at ('' when a pasted image is missing).
const publishedSrc = (d: Draft, slug: string, src = '') => {
  const id = localId(src)
  if (!id) return src
  return d.images[id] ? imgPath(slug, id, d.images[id]) : ''
}

const buildFile = (d: Draft) => {
  const slug = slugOf(d)
  const base = d.fm ?? {
    title: '',
    date: '',
    tags: [],
    draft: false,
    author: AUTHOR,
    authorUrl: AUTHOR_URL,
  }
  // Spread keeps the original key order; untouched fields (archived, lastmod…) survive.
  const fm: Record<string, unknown> = {
    ...base,
    title: d.title.trim(),
    date: d.date,
    tags: d.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    summary: d.summary.trim(),
  }
  // No thumbnail = the site picks the first image in the post (or its banner).
  const thumbnail = publishedSrc(d, slug, d.thumbnail)
  if (thumbnail) fm.thumbnail = thumbnail
  else delete fm.thumbnail
  return joinPost(fm, `\n${buildBody(d, (id) => imgPath(slug, id, d.images[id]))}\n`)
}

type HNode = {
  type: string
  tagName?: string
  value?: string
  children?: HNode[]
  properties?: Record<string, unknown>
  position?: { start: { line: number } }
}
const BLOCKS = /^(p|h[1-6]|li|pre|blockquote|hr|table|tr|img|center)$/
const textOf = (n: HNode): string => n.value ?? (n.children ?? []).map(textOf).join('')

// Tags preview blocks with their source line (for scroll sync + caret highlight)
// and collects headings for the table of contents, exactly as rehype-slug ids them.
const rehypeLinesAndToc = (toc: Toc) => () => (tree: HNode) => {
  const walk = (node: HNode) => {
    for (const c of node.children ?? []) {
      if (c.type === 'element' && BLOCKS.test(c.tagName ?? '') && c.position) {
        c.properties = { ...c.properties, dataLine: c.position.start.line }
        const depth = Number(c.tagName?.match(/^h([1-6])$/)?.[1])
        if (depth) toc.push({ value: textOf(c), depth, url: `#${c.properties.id}` })
      }
      if (c.tagName !== 'pre') walk(c)
    }
  }
  walk(tree)
}

async function compile(source: string) {
  const [{ evaluate }, runtime] = await Promise.all([
    import('@mdx-js/mdx'),
    import('react/jsx-runtime'),
  ])
  const toc: Toc = []
  const mod = await evaluate(source, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(runtime as any),
    remarkPlugins: [remarkMentions], // @KAIST → link, same as the site build
    rehypePlugins: [rehypeSlug, rehypeLinesAndToc(toc)],
  })
  return { Content: mod.default as ComponentType<Record<string, unknown>>, toc }
}

async function readImage(file: File): Promise<string> {
  const asDataUrl = () =>
    new Promise<string>((resolve, reject) => {
      const r = new FileReader()
      r.onload = () => resolve(r.result as string)
      r.onerror = reject
      r.readAsDataURL(file)
    })
  if (/gif|svg/.test(file.type)) return asDataUrl() // keep animation / vectors
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, MAX_IMG_WIDTH / bmp.width)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  canvas.getContext('2d')?.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  const webp = canvas.toDataURL('image/webp', 0.85)
  // Safari can't encode webp and silently returns png; jpeg is far smaller.
  return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.85)
}

// Roughly what a markdown snippet renders to as text: drop images, link URLs,
// line prefixes and emphasis/code markers.
const plain = (md: string) =>
  md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s*(#{1,6}\s|>\s?|[-*+]\s|\d+\.\s)/gm, '')
    .replace(/[*_`[\]]/g, '')

// Find `needle` in the rendered text from `start` onwards (whitespace-insensitive),
// preferring a match near `near` characters in. Returns a DOM Range or null.
function findText(start: Element, needle: string, near: number): Range | null {
  const want = needle.replace(/\s+/g, ' ').trim()
  if (!want) return null
  const walker = document.createTreeWalker(start.closest('article') ?? start, NodeFilter.SHOW_TEXT)
  walker.currentNode = start
  let text = ''
  const at: [Node, number][] = [] // text[i] comes from node at offset
  for (
    let n = walker.nextNode();
    n && text.length < near + want.length + 2000;
    n = walker.nextNode()
  ) {
    const s = n.textContent ?? ''
    for (let i = 0; i < s.length; i++) {
      const ws = /\s/.test(s[i])
      if (ws && text.endsWith(' ')) continue
      text += ws ? ' ' : s[i]
      at.push([n, i])
    }
  }
  let i = text.indexOf(want, Math.max(0, near - 20))
  if (i < 0) i = text.indexOf(want)
  if (i < 0) return null
  const range = document.createRange()
  range.setStart(at[i][0], at[i][1])
  const [endNode, endOffset] = at[i + want.length - 1]
  range.setEnd(endNode, endOffset + 1)
  return range
}

// CSS Custom Highlight API: paints a range without touching React's DOM.
function paintSelection(range: Range | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { highlights } = CSS as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Highlight = (window as any).Highlight
  if (!highlights || !Highlight) return // older browsers: block highlight only
  if (range) highlights.set('write-selection', new Highlight(range))
  else highlights.delete('write-selection')
}

// @mention suggestions: handles starting with the query first, then names containing it.
const matchEntities = (query: string) => {
  const q = query.toLowerCase()
  const rank = (e: Entity) =>
    [e.name, e.id, ...(e.aliases ?? [])].some((h) =>
      h.toLowerCase().replace(/\s+/g, '').startsWith(q)
    )
      ? 0
      : e.name.toLowerCase().includes(q)
      ? 1
      : 2
  return entities
    .filter((e) => rank(e) < 2)
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, 8)
}

const previewComponents = {
  TOCInline,
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  Image: (p: Record<string, string>) => <img {...p} />,
}

export default function Write() {
  const { token, setToken, lock } = useToken()
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [id, setId] = useState('')
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [storageError, setStorageError] = useState(false)
  const [preview, setPreview] = useState<{
    Content?: ComponentType<Record<string, unknown>>
    toc?: Toc
    error?: string
  }>({})
  const textRef = useRef<HTMLTextAreaElement>(null)
  const mirrorRef = useRef<HTMLDivElement>(null)
  // @mention suggestions: `from` is where the '@' sits, `to` the caret.
  const [suggest, setSuggest] = useState<{
    from: number
    to: number
    items: Entity[]
    index: number
  } | null>(null)
  const [suggestPos, setSuggestPos] = useState({ top: 0, left: 0 })
  const caretRef = useRef<HTMLSpanElement>(null)
  const paneRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = load<Record<string, Draft>>(DRAFTS_KEY, {})
    for (const k in saved) saved[k] = pruneImages(migrate(saved[k]))
    const params = new URLSearchParams(location.search) // ?d=<draft id> | ?new
    const latest = Object.values(saved).sort((a, b) => b.updated - a.updated)[0]
    const d = saved[params.get('d') ?? ''] ?? (params.has('new') ? null : latest) ?? newDraft()
    setDrafts({ ...saved, [d.id]: d })
    setId(d.id)
  }, [])

  useEffect(() => {
    if (!id) return
    const t = setTimeout(() => {
      try {
        // Don't persist untouched empty drafts.
        const keep = Object.values(drafts).filter((d) => d.title || d.body)
        localStorage.setItem(
          DRAFTS_KEY,
          JSON.stringify(Object.fromEntries(keep.map((d) => [d.id, d])))
        )
        setStorageError(false)
      } catch {
        // ponytail: localStorage caps at ~5MB; move images to IndexedDB if this bites often.
        setStorageError(true)
      }
    }, 400)
    return () => clearTimeout(t)
  }, [drafts, id])

  const d = drafts[id]
  const previewSource = d ? buildBody(d, (imgId) => d.images[imgId]) : ''

  // Split view on desktop; on phones the preview is a tab and only compiles
  // while open, so typing isn't slowed by MDX compiles.
  const [wide, setWide] = useState(false)
  useEffect(() => {
    const mq = matchMedia('(min-width: 1024px)')
    const onChange = () => setWide(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  const showPreview = wide || tab === 'preview'

  useEffect(() => {
    if (!d || !showPreview) return
    let live = true
    const t = setTimeout(() => {
      compile(previewSource)
        .then((res) => live && setPreview(res))
        .catch((e) => live && setPreview((p) => ({ ...p, error: String(e.message ?? e) })))
    }, 300)
    return () => {
      live = false
      clearTimeout(t)
    }
  }, [previewSource, showPreview]) // eslint-disable-line react-hooks/exhaustive-deps

  // Put the @mention popup just under the caret. The mirror renders a marker
  // at the caret while suggestions are open; its offset is the caret position.
  useLayoutEffect(() => {
    const ta = textRef.current
    const mirror = mirrorRef.current
    const caret = caretRef.current
    if (!suggest || !ta || !mirror || !caret) return
    if (wide) mirror.style.width = `${ta.clientWidth}px`
    const lineHeight = parseFloat(getComputedStyle(ta).lineHeight) || 28
    setSuggestPos({
      top: caret.offsetTop + lineHeight - (wide ? ta.scrollTop : 0),
      left: Math.max(0, Math.min(caret.offsetLeft, ta.clientWidth - 272)),
    })
  }, [suggest, wide])

  // Re-highlight once the preview re-renders with new content.
  useEffect(() => highlight(), [preview.Content]) // eslint-disable-line react-hooks/exhaustive-deps

  const blocks = () =>
    Array.from(paneRef.current?.querySelectorAll<HTMLElement>('[data-line]') ?? [])

  // Mark the preview block that holds the caret (blocks are in source order, so
  // the last one starting at or before the caret line is the innermost match),
  // and paint the selected text itself. Never scrolls: scroll sync keeps the
  // panes aligned, and scrolling here made the preview jump while selecting.
  function highlight() {
    const ta = textRef.current
    const pane = paneRef.current
    if (!ta || !pane) return
    const { value, selectionStart: s, selectionEnd: e } = ta
    const line = value.slice(0, s).split('\n').length
    let active: HTMLElement | undefined
    for (const el of blocks()) {
      if (Number(el.dataset.line) > line) break
      active = el
    }
    pane.querySelectorAll('[data-active]').forEach((el) => el.removeAttribute('data-active'))
    active?.setAttribute('data-active', '')
    if (!active || e === s) return paintSelection(null)
    // source index where the active block starts, to search near the same offset
    const blockStart = value.split('\n', Number(active.dataset.line) - 1).join('\n').length
    paintSelection(
      findText(active, plain(value.slice(s, e)), plain(value.slice(blockStart, s)).length)
    )
  }

  // Scroll the preview so the block at the top of the editor is at the top of
  // the preview: map editor y -> preview y through (line top, block top) anchors.
  // The hidden mirror wraps text exactly like the textarea to find line tops.
  function syncScroll() {
    const ta = textRef.current
    const pane = paneRef.current
    const mirror = mirrorRef.current
    if (!ta || !pane || !mirror || !wide) return
    mirror.style.width = `${ta.clientWidth}px`
    const paneTop = pane.getBoundingClientRect().top - pane.scrollTop
    const pts: [number, number][] = [[0, 0]]
    for (const el of blocks()) {
      const lineEl = mirror.children[Number(el.dataset.line) - 1] as HTMLElement | undefined
      if (lineEl) pts.push([lineEl.offsetTop, el.getBoundingClientRect().top - paneTop])
    }
    pts.push([ta.scrollHeight - ta.clientHeight, pane.scrollHeight - pane.clientHeight])
    pts.sort((a, b) => a[0] - b[0])
    const y = ta.scrollTop
    const i = Math.max(
      1,
      pts.findIndex(([x]) => x > y)
    )
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i] ?? pts[i - 1]
    pane.scrollTop = x1 > x0 ? y0 + ((y - x0) / (x1 - x0)) * (y1 - y0) : y0
  }

  if (token === null || !d) return null
  if (!token) return <Unlock onUnlock={setToken} />

  const update = (patch: Partial<Draft>) =>
    setDrafts((all) => ({ ...all, [id]: { ...all[id], ...patch, updated: Date.now() } }))

  // Replace [from, to) with text, then select [selFrom, selTo). Goes through
  // execCommand so the browser's own undo stack (Ctrl+Z) records it; assigning
  // .value would wipe that history.
  const replace = (from: number, to: number, text: string, selFrom: number, selTo: number) => {
    const ta = textRef.current
    if (!ta) return
    ta.focus()
    ta.setSelectionRange(from, to)
    const ok = text
      ? document.execCommand('insertText', false, text)
      : from === to || document.execCommand('delete')
    if (!ok) {
      ta.setRangeText(text, from, to)
      update({ body: ta.value })
    }
    ta.setSelectionRange(selFrom, selTo)
  }
  const selection = () => {
    const ta = textRef.current
    return ta ? { v: ta.value, s: ta.selectionStart, e: ta.selectionEnd } : null
  }
  // Toggle: markers around (or inside) the selection are removed, else added.
  const wrap = (before: string, after: string, placeholder: string) => {
    const cur = selection()
    if (!cur) return
    const { v, s, e } = cur
    const sel = v.slice(s, e)
    if (v.slice(s - before.length, s) === before && v.slice(e, e + after.length) === after)
      return replace(s - before.length, e + after.length, sel, s - before.length, e - before.length)
    if (
      sel.length >= before.length + after.length &&
      sel.startsWith(before) &&
      sel.endsWith(after)
    ) {
      const inner = sel.slice(before.length, sel.length - after.length)
      return replace(s, e, inner, s, s + inner.length)
    }
    const text = sel || placeholder
    replace(s, e, before + text + after, s + before.length, s + before.length + text.length)
  }
  // Bold (**) and italic (*) share a character, so count the run of stars:
  // italic is on when the run is odd (*x*, ***x***), bold when it's 2+.
  const stars = (n: 1 | 2, placeholder: string) => {
    const cur = selection()
    if (!cur) return
    const { v, s, e } = cur
    const sel = v.slice(s, e)
    const on = (run: number) => (n === 1 ? run % 2 === 1 : run >= 2)
    const lead = (t: string) => t.length - t.replace(/^\*+/, '').length
    const trail = (t: string) => t.length - t.replace(/\*+$/, '').length
    const around = Math.min(trail(v.slice(0, s)), lead(v.slice(e)))
    if (on(around)) return replace(s - n, e + n, sel, s - n, e - n)
    const inside = Math.min(lead(sel), trail(sel))
    if (sel.length > 2 * n && on(inside)) {
      const inner = sel.slice(n, sel.length - n)
      return replace(s, e, inner, s, s + inner.length)
    }
    const mark = '*'.repeat(n)
    const text = sel || placeholder
    replace(s, e, mark + text + mark, s + n, s + n + text.length)
  }
  // Toggle a line prefix; a different heading/list/quote prefix is swapped out.
  const linePrefix = (prefix: string) => {
    const cur = selection()
    if (!cur) return
    const { v, s, e } = cur
    const start = v.lastIndexOf('\n', s - 1) + 1
    const existing = v.slice(start).match(/^(#{1,6} |> |- |\d+\. )/)?.[0] ?? ''
    const next = existing === prefix ? '' : prefix
    const shift = next.length - existing.length
    replace(
      start,
      start + existing.length,
      next,
      Math.max(start, s + shift),
      Math.max(start, e + shift)
    )
  }
  const insert = (text: string) => {
    const cur = selection()
    if (cur) replace(cur.s, cur.e, text, cur.s + text.length, cur.s + text.length)
  }

  // Open/refresh @mention suggestions when the caret sits right after "@query".
  const updateSuggest = () => {
    const ta = textRef.current
    if (!ta || ta.selectionStart !== ta.selectionEnd) return setSuggest(null)
    const to = ta.selectionStart
    const m = ta.value.slice(Math.max(0, to - 40), to).match(/(?<![\w@.])@(\w*)$/)
    const items = m ? matchEntities(m[1]) : []
    setSuggest(m && items.length ? { from: to - m[0].length, to, items, index: 0 } : null)
  }
  const acceptSuggestion = (entity: Entity) => {
    if (!suggest) return
    const text = `@${handleOf(entity)} `
    const at = suggest.from + text.length
    replace(suggest.from, suggest.to, text, at, at)
    setSuggest(null)
  }
  const history = (cmd: 'undo' | 'redo') => {
    textRef.current?.focus()
    document.execCommand(cmd)
  }

  const addImages = async (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith('image/'))
    if (!images.length) return
    setStatus('Processing images…')
    const entries = await Promise.all(images.map(async (f) => [newId(), await readImage(f)]))
    setDrafts((all) => ({
      ...all,
      [id]: { ...all[id], images: { ...all[id].images, ...Object.fromEntries(entries) } },
    }))
    insert(entries.map(([imgId]) => `\n![](img:${imgId})\n`).join(''))
    setStatus('')
  }

  // Link-preview choices: the images the post shows, plus an uploaded pick.
  // The first image is the automatic default, so it doubles as "auto".
  const shown = postImages(d)
  const auto = shown[0] ?? siteMetadata.socialBanner
  const thumbOptions = Array.from(new Set([auto, ...shown, d.thumbnail || auto]))
  const chosen = d.thumbnail || auto
  const displaySrc = (src: string) => {
    const imgId = localId(src)
    return imgId ? d.images[imgId] : src
  }
  const uploadThumbnail = async (file?: File) => {
    if (!file?.type.startsWith('image/')) return
    const imgId = newId()
    const data = await readImage(file)
    setDrafts((all) => ({
      ...all,
      [id]: {
        ...all[id],
        images: { ...all[id].images, [imgId]: data },
        thumbnail: `img:${imgId}`,
        updated: Date.now(),
      },
    }))
  }

  const publish = async () => {
    const slug = slugOf(d)
    if (!d.title.trim() || !slug) return setStatus('Add a title first.')
    if (preview.error) return setStatus('Fix the preview error first.')
    setBusy(true)
    try {
      setStatus('Checking…')
      await compile(previewSource) // the preview may be stale; never ship a broken build
      const filePath = `data/blog/${slug}.mdx`
      const isUpdate = d.origSlug === slug
      if (!isUpdate) {
        const existing = await fetch(
          `https://api.github.com/repos/${REPO}/contents/${filePath}?ref=${BRANCH}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (existing.ok && !confirm(`"${slug}" already exists on the site. Overwrite it?`)) return
      }
      setStatus('Uploading…')
      const thumbId = localId(d.thumbnail)
      const used = Array.from(
        new Set([
          ...Array.from(d.body.matchAll(IMG_RE), (m) => m[1]),
          ...(thumbId ? [thumbId] : []),
        ])
      )
      const images = used
        .filter((imgId) => d.images[imgId])
        .map((imgId) => ({
          path: `public${imgPath(slug, imgId, d.images[imgId])}`,
          content: d.images[imgId].split(',')[1],
          encoding: 'base64' as const,
        }))
      const content = buildFile(d)
      // Files in this post's image folders that the new version no longer
      // references (removed images, a replaced thumbnail) go in the same commit.
      const folders = [slug, d.origSlug].map((s) => s && `public/static/images/blog/${s}/`)
      const { tree, truncated } = await gh(token, `/git/trees/${BRANCH}?recursive=1`)
      const stale = truncated // incomplete listing: don't guess, delete nothing
        ? []
        : (tree as { path: string; type: string }[])
            .filter((t) => t.type === 'blob' && folders.some((f) => f && t.path.startsWith(f)))
            .map((t) => t.path)
            .filter((p) => !content.includes(p.slice('public'.length)))
      const url = await commitFiles(
        token,
        [...images, { path: filePath, content, encoding: 'utf-8' }],
        `${d.origSlug ? 'upd' : 'blog'}: ${d.title.trim()}`,
        [
          ...stale,
          // slug changed while editing: the old file goes in the same commit
          ...(d.origSlug && !isUpdate ? [`data/blog/${d.origSlug}.mdx`] : []),
        ]
      )
      setDrafts((all) => ({
        ...all,
        [id]: pruneImages({ ...all[id], publishedAt: Date.now(), origSlug: slug }),
      }))
      setStatus(
        `Published${stale.length ? `, removed ${stale.length} unused image(s)` : ''}. ` +
          `Live at ${siteMetadata.siteUrl}/blog/${slug} once Vercel deploys. ${url}`
      )
    } catch (e) {
      setStatus(`Failed: ${(e as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  const tools: [IconType, string, () => void][][] = [
    [
      [RiArrowGoBackLine, 'Undo (Ctrl+Z)', () => history('undo')],
      [RiArrowGoForwardLine, 'Redo (Ctrl+Shift+Z)', () => history('redo')],
    ],
    [
      [RiH2, 'Heading', () => linePrefix('## ')],
      [RiH3, 'Subheading', () => linePrefix('### ')],
    ],
    [
      [RiBold, 'Bold (Ctrl+B)', () => stars(2, 'bold')],
      [RiItalic, 'Italic (Ctrl+I)', () => stars(1, 'italic')],
      [RiCodeLine, 'Inline code', () => wrap('`', '`', 'code')],
      [RiLink, 'Link (Ctrl+K)', () => wrap('[', '](https://)', 'link')],
    ],
    [
      [RiDoubleQuotesL, 'Quote', () => linePrefix('> ')],
      [RiListUnordered, 'Bulleted list', () => linePrefix('- ')],
      [RiListOrdered, 'Numbered list', () => linePrefix('1. ')],
      [RiCodeBoxLine, 'Code block', () => wrap('\n```\n', '\n```\n', 'code')],
      [RiSeparator, 'Divider', () => insert('\n\n---\n\n')],
    ],
    [
      [RiImageAddLine, 'Image', () => fileRef.current?.click()],
      [RiFileList2Line, 'Table of contents', () => insert(TOC_BLOCK)],
    ],
  ]
  const shortcuts: Record<string, () => void> = {
    b: tools[2][0][2],
    i: tools[2][1][2],
    k: tools[2][3][2],
  }

  const sorted = Object.values(drafts).sort((a, b) => b.updated - a.updated)
  const field =
    'w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-base focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700'
  const btn =
    'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
  const editorText = 'text-lg leading-relaxed whitespace-pre-wrap break-words'

  return (
    <>
      <WriteHead title="Write" />
      <style>{`
        .write-preview [data-active] {
          background: rgb(var(--accent-500) / 0.1);
          box-shadow: 0 0 0 0.5rem rgb(var(--accent-500) / 0.1);
          border-radius: 0.2rem;
        }
        ::highlight(write-selection) {
          background-color: rgb(var(--accent-500) / 0.55);
          color: #fff;
        }
        .write-preview [data-line] { transition: background 0.15s, box-shadow 0.15s; }
      `}</style>
      {/* Desktop: fixed-height shell, each pane scrolls on its own so they can be
          synced. Phone: a normal scrolling page with a growing textarea. */}
      <div className="mx-auto flex max-w-7xl flex-col px-4 sm:px-6 lg:h-[100dvh]">
        <header className="-mx-4 flex shrink-0 flex-wrap items-center gap-1 border-b border-gray-200 px-4 py-2.5 dark:border-gray-800 sm:-mx-6 sm:px-6">
          <select
            aria-label="Drafts"
            className="mr-1 min-w-0 flex-1 rounded-lg border-gray-200 bg-transparent py-1.5 text-base dark:border-gray-700 sm:max-w-xs sm:flex-none sm:text-sm"
            value={id}
            onChange={(e) => setId(e.target.value)}
          >
            {sorted.map((x) => (
              <option key={x.id} value={x.id} className="text-black">
                {(x.title || 'Untitled') + (x.publishedAt ? ' ✓' : '')}
              </option>
            ))}
          </select>
          <button
            className={btn}
            title="New draft"
            onClick={() => {
              const n = newDraft()
              setDrafts((all) => ({ ...all, [n.id]: n }))
              setId(n.id)
            }}
          >
            <RiAddLine size={18} />
            <span className="hidden sm:inline">New</span>
          </button>
          <button
            className={btn}
            title="Delete draft"
            onClick={() => {
              if (!confirm(`Delete draft "${d.title || 'Untitled'}"? This can't be undone.`)) return
              const { [id]: _removed, ...rest } = drafts // eslint-disable-line @typescript-eslint/no-unused-vars
              const next =
                Object.values(rest).sort((a, b) => b.updated - a.updated)[0] ?? newDraft()
              setDrafts({ ...rest, [next.id]: next })
              setId(next.id)
            }}
          >
            <RiDeleteBinLine size={18} />
            <span className="hidden sm:inline">Discard</span>
          </button>
          <div className="ml-auto flex items-center gap-1">
            <Link href="/write/posts" className={btn} title="Manage posts">
              <RiArticleLine size={18} />
              <span className="hidden sm:inline">Posts</span>
            </Link>
            <button className={btn} onClick={lock} title="Forget token on this device">
              <RiLockLine size={18} />
              <span className="hidden sm:inline">Lock</span>
            </button>
            <button
              disabled={busy}
              onClick={publish}
              className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600 active:scale-95 disabled:opacity-50"
            >
              <RiSendPlaneFill size={16} />
              {busy ? 'Publishing…' : d.origSlug ? 'Update' : 'Publish'}
            </button>
          </div>
        </header>

        <div className="shrink-0">
          {(status || storageError) && (
            <p className="mt-3 break-words rounded-md bg-gray-100 px-3 py-2 text-sm dark:bg-gray-900">
              {storageError &&
                'Browser storage is full; this draft is NOT being saved. Publish or delete old drafts. '}
              {status}
            </p>
          )}

          <input
            className="mt-5 w-full border-0 bg-transparent p-0 text-3xl font-extrabold tracking-tight placeholder-gray-300 focus:ring-0 dark:placeholder-gray-700 sm:text-4xl"
            placeholder="Title"
            value={d.title}
            onChange={(e) => update({ title: e.target.value })}
          />

          <details className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <summary className="cursor-pointer select-none">
              /blog/{slugOf(d) || '…'} · {d.date}
              {d.tags && ` · ${d.tags}`}
              {d.origSlug && ' · editing live post'}
            </summary>
            {d.raw && (
              <p className="mt-2 text-xs">
                This is the post&apos;s MDX source: {'{'} and &lt; are not escaped, so use them as
                MDX.
              </p>
            )}
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label>
                Slug
                <input
                  className={field}
                  placeholder={kebabCase(d.title)}
                  value={d.slug}
                  onChange={(e) => update({ slug: e.target.value })}
                />
              </label>
              <label>
                Date
                <input
                  type="date"
                  className={field}
                  value={d.date}
                  onChange={(e) => update({ date: e.target.value })}
                />
              </label>
              <label>
                Tags (comma separated)
                <input
                  className={field}
                  value={d.tags}
                  onChange={(e) => update({ tags: e.target.value })}
                />
              </label>
              <label className="sm:col-span-3">
                Summary
                <textarea
                  rows={2}
                  className={field}
                  value={d.summary}
                  onChange={(e) => update({ summary: e.target.value })}
                />
              </label>
              <div className="sm:col-span-3">
                Link preview image
                <div className="mt-1 flex gap-2 overflow-x-auto pb-1">
                  {thumbOptions.map((src) => (
                    <button
                      key={src}
                      type="button"
                      title={src === auto ? 'Default: first image in the post' : 'Use this image'}
                      // picking the default stores nothing, so it follows the post
                      onClick={() => update({ thumbnail: src === auto ? '' : src })}
                      className={`relative h-16 w-28 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                        chosen === src
                          ? 'border-primary-500'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={displaySrc(src)} alt="" className="h-full w-full object-cover" />
                      {src === auto && (
                        <span className="absolute inset-x-0 bottom-0 bg-black/60 text-center text-xs text-white">
                          Default
                        </span>
                      )}
                    </button>
                  ))}
                  <label className="grid h-16 w-28 shrink-0 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-gray-300 text-xs hover:border-primary-500 dark:border-gray-700">
                    <span className="flex flex-col items-center gap-0.5">
                      <RiImageAddLine size={18} />
                      Upload
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        uploadThumbnail(e.target.files?.[0])
                        e.target.value = ''
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </details>
        </div>

        {/* Sticky on phones so formatting stays reachable while typing. */}
        <div className="sticky top-0 z-10 -mx-4 mt-3 flex shrink-0 items-center gap-2 border-b border-gray-200 bg-white/95 px-4 py-2 backdrop-blur dark:border-gray-800 dark:bg-black/95 sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:pb-3 lg:pt-0 lg:backdrop-blur-none">
          <div
            className="flex min-w-0 items-center overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-1 shadow-sm dark:border-gray-800 dark:bg-gray-900/60"
            style={{ scrollbarWidth: 'none' }}
          >
            {tools.map((group, gi) => (
              <Fragment key={gi}>
                {gi > 0 && <span className="mx-1 h-5 w-px shrink-0 bg-gray-200 dark:bg-gray-700" />}
                {group.map(([Icon, label, action]) => (
                  <button
                    key={label}
                    type="button"
                    title={label}
                    aria-label={label}
                    // keep the textarea's selection when clicking a tool
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={action}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-gray-500 transition hover:bg-white hover:text-primary-500 hover:shadow-sm active:scale-90 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                  >
                    <Icon size={18} />
                  </button>
                ))}
              </Fragment>
            ))}
          </div>
          <div className="ml-auto flex shrink-0 rounded-lg bg-gray-100 p-0.5 text-sm dark:bg-gray-900 lg:hidden">
            {(['write', 'preview'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-md px-3 py-1 capitalize ${
                  tab === t ? 'bg-white shadow dark:bg-gray-700' : 'text-gray-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              addImages(Array.from(e.target.files ?? []))
              e.target.value = ''
            }}
          />
        </div>

        <div className="grid gap-10 pb-16 pt-4 lg:min-h-0 lg:flex-1 lg:grid-cols-2 lg:pb-0">
          {/* Phone: textarea and mirror share one grid cell, so the invisible
              mirror sizes the cell and the textarea grows with the text.
              Desktop: the mirror is lifted out and only measures line tops. */}
          <div
            className={`${
              tab === 'write' ? 'grid' : 'hidden'
            } relative min-h-[60vh] lg:block lg:min-h-0 lg:overflow-hidden`}
          >
            <textarea
              ref={textRef}
              className={`${editorText} w-full resize-none overflow-hidden border-0 bg-transparent p-0 [grid-area:1/1] focus:ring-0 lg:h-full lg:overflow-y-auto lg:pb-[40vh]`}
              placeholder="Write in Markdown. Paste or drop images anywhere."
              value={d.body}
              onChange={(e) => {
                update({ body: e.target.value })
                updateSuggest()
              }}
              onSelect={() => {
                highlight()
                updateSuggest()
              }}
              onBlur={() => setSuggest(null)}
              onScroll={(e) => {
                // phone: the textarea grows instead of scrolling; undo the brief
                // inner scroll a new line causes before the mirror catches up
                if (!wide) e.currentTarget.scrollTop = 0
                else syncScroll()
              }}
              onKeyDown={(e) => {
                if (suggest) {
                  const n = suggest.items.length
                  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault()
                    const step = e.key === 'ArrowDown' ? 1 : -1
                    return setSuggest({ ...suggest, index: (suggest.index + step + n) % n })
                  }
                  if (e.key === 'Enter' || e.key === 'Tab') {
                    e.preventDefault()
                    return acceptSuggestion(suggest.items[suggest.index])
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    return setSuggest(null)
                  }
                }
                const action = (e.ctrlKey || e.metaKey) && shortcuts[e.key.toLowerCase()]
                if (!action) return
                e.preventDefault()
                action()
              }}
              onPaste={(e) => {
                const files = Array.from(e.clipboardData.files)
                if (files.some((f) => f.type.startsWith('image/'))) {
                  e.preventDefault()
                  addImages(files)
                }
              }}
              onDrop={(e) => {
                if (!e.dataTransfer.files.length) return
                e.preventDefault()
                addImages(Array.from(e.dataTransfer.files))
              }}
            />
            <div
              ref={mirrorRef}
              aria-hidden
              className={`${editorText} pointer-events-none invisible [grid-area:1/1] lg:absolute lg:left-0 lg:top-0`}
            >
              {d.body.split('\n').map((l, i, lines) => {
                // while suggesting, mark the caret so the popup can sit under it
                const lineStart = lines.slice(0, i).join('\n').length + (i ? 1 : 0)
                const col = suggest ? suggest.to - lineStart : -1
                return col >= 0 && col <= l.length ? (
                  <div key={i}>
                    {l.slice(0, col)}
                    <span ref={caretRef} />
                    {l.slice(col) || '\u00a0'}
                  </div>
                ) : (
                  <div key={i}>{l || '\u00a0'}</div>
                )
              })}
              <div>{'\u00a0'}</div>
            </div>
            {suggest && (
              <ul
                role="listbox"
                aria-label="Mention suggestions"
                className="absolute z-20 w-64 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-800"
                style={suggestPos}
              >
                {suggest.items.map((entity, i) => (
                  <li key={entity.id} role="option" aria-selected={i === suggest.index}>
                    <button
                      type="button"
                      // keep focus (and the caret) in the textarea
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => acceptSuggestion(entity)}
                      className={`flex w-full items-baseline justify-between gap-2 px-3 py-1.5 text-left ${
                        i === suggest.index ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                    >
                      <span className="truncate">
                        <span className="font-semibold">@{handleOf(entity)}</span>
                        {entity.name !== handleOf(entity) && (
                          <span className="ml-1.5 text-gray-500">{entity.name}</span>
                        )}
                      </span>
                      <span className="shrink-0 text-xs text-gray-400">{entity.kind}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div
            ref={paneRef}
            // same accent the published post will get (from its first tag)
            style={accentStyle(d.tags.split(',').map((t) => t.trim()))}
            className={`${
              tab === 'preview' ? 'block' : 'hidden'
            } write-preview min-w-0 lg:block lg:min-h-0 lg:overflow-y-auto lg:pb-[40vh] lg:pr-3`}
          >
            {preview.error && (
              <pre className="mb-4 whitespace-pre-wrap rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                {preview.error}
              </pre>
            )}
            <article className="prose prose-lg max-w-none dark:prose-dark">
              {preview.Content && (
                <preview.Content toc={preview.toc} components={previewComponents} />
              )}
            </article>
          </div>
        </div>
      </div>
    </>
  )
}
