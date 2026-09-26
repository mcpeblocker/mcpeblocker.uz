import siteMetadata from '@/data/siteMetadata'
import kebabCase from '@/lib/utils/kebabCase'
import Head from 'next/head'
import { ComponentType, useEffect, useRef, useState } from 'react'

// Private writing desk. Anyone can open /write, but nothing works without a
// GitHub token that can push to the repo, so publishing is effectively owner-only.
// Drafts (images included, as data URLs) live in localStorage only.

const REPO = 'mcpeblocker/mcpeblocker.uz'
const BRANCH = 'main'
const AUTHOR = 'Alisher Ortiqov'
const AUTHOR_URL = 'https://t.me/alisherortiqov'
const MAX_IMG_WIDTH = 1600
const TOKEN_KEY = 'write:token'
const DRAFTS_KEY = 'write:drafts'
const IMG_RE = /\(img:([\w-]+)\)/g
const TOC_BLOCK =
  '## Table of contents\n\n<TOCInline toc={props.toc} exclude="Table of contents" toHeading={2} indentDepth={2} />\n\n---\n\n'

type Draft = {
  id: string
  title: string
  slug: string
  date: string
  tags: string
  summary: string
  toc: boolean
  body: string
  images: Record<string, string>
  updated: number
  publishedAt?: number
}

const today = () => new Date().toISOString().slice(0, 10)
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
const newDraft = (): Draft => ({
  id: newId(),
  title: '',
  slug: '',
  date: today(),
  tags: '',
  summary: '',
  toc: false,
  body: '',
  images: {},
  updated: Date.now(),
})
const slugOf = (d: Draft) => kebabCase(d.slug || d.title)
const extOf = (dataUrl: string) => dataUrl.slice(11, dataUrl.indexOf(';')).split('+')[0]
const imgPath = (slug: string, id: string, dataUrl: string) =>
  `/static/images/blog/${slug}/${id}.${extOf(dataUrl)}`

// MDX treats `{` and `<` as code. Escape them in prose so casual writing can't
// break the build; fenced/inline code is left alone.
const escapeMdx = (md: string) =>
  md
    .split(/(```[\s\S]*?```|`[^`\n]*`)/)
    .map((part, i) =>
      i % 2 ? part : part.replace(/[{}]/g, '\\$&').replace(/<(?![A-Za-z/])/g, '&lt;')
    )
    .join('')

const buildBody = (d: Draft, src: (id: string) => string) =>
  (d.toc ? TOC_BLOCK : '') +
  escapeMdx(d.body).replace(IMG_RE, (m, id) => (d.images[id] ? `(${src(id)})` : m))

const buildFile = (d: Draft) => {
  const slug = slugOf(d)
  const tags = d.tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
  // JSON strings are valid YAML scalars, so quotes/colons in titles are safe.
  const fm = [
    `title: ${JSON.stringify(d.title.trim())}`,
    `date: '${d.date}'`,
    `tags: ${JSON.stringify(tags)}`,
    'draft: false',
    `author: '${AUTHOR}'`,
    `authorUrl: ${AUTHOR_URL}`,
    `summary: ${JSON.stringify(d.summary.trim())}`,
  ]
  return `---\n${fm.join('\n')}\n---\n\n${buildBody(d, (id) => imgPath(slug, id, d.images[id]))}\n`
}

async function compile(source: string) {
  const [{ evaluate }, runtime] = await Promise.all([
    import('@mdx-js/mdx'),
    import('react/jsx-runtime'),
  ])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = await evaluate(source, { ...(runtime as any) })
  return mod.default as ComponentType<Record<string, unknown>>
}

async function gh(token: string, path: string, init: RequestInit = {}) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  })
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${(await res.json()).message}`)
  return res.json()
}

// One atomic commit for the post and all its images (Git Data API).
async function commitFiles(
  token: string,
  files: { path: string; content: string; encoding: 'utf-8' | 'base64' }[],
  message: string,
  deletions: string[] = []
) {
  const post = (path: string, body: unknown) =>
    gh(token, path, { method: 'POST', body: JSON.stringify(body) })
  const ref = await gh(token, `/git/ref/heads/${BRANCH}`)
  const parent = await gh(token, `/git/commits/${ref.object.sha}`)
  const blobs = await Promise.all(
    files.map((f) => post('/git/blobs', { content: f.content, encoding: f.encoding }))
  )
  const tree = await post('/git/trees', {
    base_tree: parent.tree.sha,
    tree: [
      ...files.map((f, i) => ({ path: f.path, mode: '100644', type: 'blob', sha: blobs[i].sha })),
      // sha: null removes the path from base_tree
      ...deletions.map((path) => ({ path, mode: '100644', type: 'blob', sha: null })),
    ],
  })
  const commit = await post('/git/commits', { message, tree: tree.sha, parents: [ref.object.sha] })
  await gh(token, `/git/refs/heads/${BRANCH}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha }),
  })
  return commit.html_url as string
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

const load = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '') ?? fallback
  } catch {
    return fallback
  }
}

export default function Write() {
  const [token, setToken] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [id, setId] = useState('')
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [storageError, setStorageError] = useState(false)
  const [posts, setPosts] = useState<string[] | null>(null) // null = panel closed
  const [preview, setPreview] = useState<{
    Content?: ComponentType<Record<string, unknown>>
    error?: string
  }>({})
  const textRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setToken(load(TOKEN_KEY, ''))
    const saved = load<Record<string, Draft>>(DRAFTS_KEY, {})
    const latest = Object.values(saved).sort((a, b) => b.updated - a.updated)[0]
    const d = latest ?? newDraft()
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

  useEffect(() => {
    if (!d) return
    let live = true
    const t = setTimeout(() => {
      compile(previewSource)
        .then((Content) => live && setPreview({ Content }))
        .catch((e) => live && setPreview((p) => ({ ...p, error: String(e.message ?? e) })))
    }, 400)
    return () => {
      live = false
      clearTimeout(t)
    }
  }, [previewSource]) // eslint-disable-line react-hooks/exhaustive-deps

  if (token === null || !d) return null
  if (!token) return <Unlock onUnlock={setToken} />

  const update = (patch: Partial<Draft>) =>
    setDrafts((all) => ({ ...all, [id]: { ...all[id], ...patch, updated: Date.now() } }))

  const edit = (fn: (value: string, start: number, end: number) => [string, number, number]) => {
    const ta = textRef.current
    if (!ta) return
    const [value, s, e] = fn(ta.value, ta.selectionStart, ta.selectionEnd)
    update({ body: value })
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(s, e)
    })
  }
  const wrap = (before: string, after: string, placeholder: string) =>
    edit((v, s, e) => {
      const sel = v.slice(s, e) || placeholder
      const at = s + before.length
      return [v.slice(0, s) + before + sel + after + v.slice(e), at, at + sel.length]
    })
  const linePrefix = (prefix: string) =>
    edit((v, s, e) => {
      const lineStart = v.lastIndexOf('\n', s - 1) + 1
      return [
        v.slice(0, lineStart) + prefix + v.slice(lineStart),
        s + prefix.length,
        e + prefix.length,
      ]
    })

  const addImages = async (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith('image/'))
    if (!images.length) return
    setStatus('Processing images…')
    const entries = await Promise.all(images.map(async (f) => [newId(), await readImage(f)]))
    setDrafts((all) => ({
      ...all,
      [id]: { ...all[id], images: { ...all[id].images, ...Object.fromEntries(entries) } },
    }))
    edit((v, s, e) => {
      const md = entries.map(([imgId]) => `\n![](img:${imgId})\n`).join('')
      return [v.slice(0, s) + md + v.slice(e), s + md.length, s + md.length]
    })
    setStatus('')
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
      const existing = await fetch(
        `https://api.github.com/repos/${REPO}/contents/${filePath}?ref=${BRANCH}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (existing.ok && !confirm(`"${slug}" already exists on the site. Overwrite it?`)) return
      setStatus('Uploading…')
      const used = Array.from(new Set(Array.from(d.body.matchAll(IMG_RE), (m) => m[1])))
      const images = used
        .filter((imgId) => d.images[imgId])
        .map((imgId) => ({
          path: `public${imgPath(slug, imgId, d.images[imgId])}`,
          content: d.images[imgId].split(',')[1],
          encoding: 'base64' as const,
        }))
      const url = await commitFiles(
        token,
        [...images, { path: filePath, content: buildFile(d), encoding: 'utf-8' }],
        `${existing.ok ? 'upd' : 'blog'}: ${d.title.trim()}`
      )
      update({ publishedAt: Date.now() })
      setStatus(
        `Published. Live at ${siteMetadata.siteUrl}/blog/${slug} once Vercel deploys. ${url}`
      )
    } catch (e) {
      setStatus(`Failed: ${(e as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  const togglePosts = async () => {
    if (posts) return setPosts(null)
    try {
      const files: { name: string }[] = await gh(token, `/contents/data/blog?ref=${BRANCH}`)
      setPosts(files.filter((f) => f.name.endsWith('.mdx')).map((f) => f.name.slice(0, -4)))
    } catch (e) {
      setStatus(`Failed: ${(e as Error).message}`)
    }
  }

  const deletePost = async (slug: string) => {
    if (!confirm(`Delete "${slug}" from the live site? (Recoverable only via git history.)`)) return
    setBusy(true)
    try {
      setStatus(`Deleting ${slug}…`)
      const { tree } = await gh(token, `/git/trees/${BRANCH}?recursive=1`)
      const paths = (tree as { path: string; type: string }[])
        .filter((t) => t.type === 'blob')
        .map((t) => t.path)
        .filter(
          (p) => p === `data/blog/${slug}.mdx` || p.startsWith(`public/static/images/blog/${slug}/`)
        )
      const url = await commitFiles(token, [], `del: ${slug}`, paths)
      setPosts((all) => all?.filter((s) => s !== slug) ?? null)
      setStatus(`Deleted ${slug} (${paths.length} files). Gone once Vercel deploys. ${url}`)
    } catch (e) {
      setStatus(`Failed: ${(e as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  const sorted = Object.values(drafts).sort((a, b) => b.updated - a.updated)
  const field =
    'w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-base focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700'
  const btn =
    'rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'

  return (
    <>
      <Head>
        <title>Write</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-10 sm:px-6">
        <header className="sticky top-0 z-10 -mx-4 flex flex-wrap items-center gap-2 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-gray-800 dark:bg-black/90 sm:-mx-6 sm:px-6">
          <select
            aria-label="Drafts"
            className="min-w-0 max-w-[45vw] flex-1 rounded-md border-gray-200 bg-transparent py-1.5 text-sm dark:border-gray-700 sm:max-w-xs sm:flex-none"
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
            onClick={() => {
              const n = newDraft()
              setDrafts((all) => ({ ...all, [n.id]: n }))
              setId(n.id)
            }}
          >
            New
          </button>
          <button
            className={btn}
            onClick={() => {
              if (!confirm(`Delete draft "${d.title || 'Untitled'}"? This can't be undone.`)) return
              const { [id]: _removed, ...rest } = drafts // eslint-disable-line @typescript-eslint/no-unused-vars
              const next =
                Object.values(rest).sort((a, b) => b.updated - a.updated)[0] ?? newDraft()
              setDrafts({ ...rest, [next.id]: next })
              setId(next.id)
            }}
          >
            Delete
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button className={btn} onClick={togglePosts}>
              Posts
            </button>
            <button
              className={btn}
              onClick={() => {
                localStorage.removeItem(TOKEN_KEY)
                setToken('')
              }}
            >
              Lock
            </button>
            <button
              disabled={busy}
              onClick={publish}
              className="rounded-md bg-primary-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
            >
              {busy ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </header>

        {posts && (
          <ul className="mt-3 divide-y divide-gray-200 rounded-md border border-gray-200 text-sm dark:divide-gray-800 dark:border-gray-800">
            {posts.map((slug) => (
              <li key={slug} className="flex items-center gap-2 px-3 py-2">
                <a
                  href={`/blog/${slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="min-w-0 flex-1 truncate hover:underline"
                >
                  {slug}
                </a>
                <button
                  disabled={busy}
                  onClick={() => deletePost(slug)}
                  className="rounded-md px-2 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}

        {(status || storageError) && (
          <p className="mt-3 break-words rounded-md bg-gray-100 px-3 py-2 text-sm dark:bg-gray-900">
            {storageError &&
              'Browser storage is full; this draft is NOT being saved. Publish or delete old drafts. '}
            {status}
          </p>
        )}

        <input
          className="mt-6 w-full border-0 bg-transparent p-0 text-3xl font-extrabold tracking-tight placeholder-gray-300 focus:ring-0 dark:placeholder-gray-700 sm:text-4xl"
          placeholder="Title"
          value={d.title}
          onChange={(e) => update({ title: e.target.value })}
        />

        <details className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          <summary className="cursor-pointer select-none">
            /blog/{slugOf(d) || '…'} · {d.date}
            {d.tags && ` · ${d.tags}`}
          </summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
            <label className="flex items-center gap-2 self-end pb-2">
              <input
                type="checkbox"
                className="rounded"
                checked={d.toc}
                onChange={(e) => update({ toc: e.target.checked })}
              />
              Table of contents
            </label>
            <label className="sm:col-span-2">
              Summary
              <textarea
                rows={2}
                className={field}
                value={d.summary}
                onChange={(e) => update({ summary: e.target.value })}
              />
            </label>
          </div>
        </details>

        <div className="mt-4 flex items-center gap-1 border-b border-gray-200 pb-2 dark:border-gray-800">
          <div className="flex flex-wrap gap-1">
            <button className={btn} onClick={() => linePrefix('## ')} title="Heading">
              H
            </button>
            <button className={`${btn} font-bold`} onClick={() => wrap('**', '**', 'bold')}>
              B
            </button>
            <button className={`${btn} italic`} onClick={() => wrap('_', '_', 'italic')}>
              I
            </button>
            <button className={btn} onClick={() => wrap('[', '](https://)', 'link')}>
              Link
            </button>
            <button className={btn} onClick={() => linePrefix('> ')}>
              Quote
            </button>
            <button className={btn} onClick={() => wrap('\n```\n', '\n```\n', 'code')}>
              Code
            </button>
            <button className={btn} onClick={() => fileRef.current?.click()}>
              Image
            </button>
          </div>
          <div className="ml-auto flex rounded-md bg-gray-100 p-0.5 text-sm dark:bg-gray-900 lg:hidden">
            {(['write', 'preview'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded px-3 py-1 capitalize ${
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

        <div className="mt-4 grid flex-1 gap-8 lg:grid-cols-2">
          <textarea
            ref={textRef}
            className={`${
              tab === 'write' ? 'block' : 'hidden'
            } min-h-[60vh] w-full resize-none border-0 bg-transparent p-0 text-lg leading-relaxed focus:ring-0 lg:block`}
            placeholder="Write in Markdown. Paste or drop images anywhere."
            value={d.body}
            onChange={(e) => update({ body: e.target.value })}
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
          <div className={`${tab === 'preview' ? 'block' : 'hidden'} min-w-0 lg:block`}>
            {preview.error && (
              <pre className="mb-4 whitespace-pre-wrap rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                {preview.error}
              </pre>
            )}
            <article className="prose prose-lg max-w-none dark:prose-dark">
              {preview.Content && (
                <preview.Content
                  toc={[]}
                  components={{
                    TOCInline: () => <p className="italic text-gray-500">[Table of contents]</p>,
                  }}
                />
              )}
            </article>
          </div>
        </div>
      </div>
    </>
  )
}

function Unlock({ onUnlock }: { onUnlock: (token: string) => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const repo = await gh(value.trim(), '')
      if (!repo.permissions?.push) throw new Error('This token cannot push to the repo.')
      localStorage.setItem(TOKEN_KEY, JSON.stringify(value.trim()))
      onUnlock(value.trim())
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <>
      <Head>
        <title>Write</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <form onSubmit={submit} className="mx-auto mt-32 flex max-w-sm flex-col gap-3 px-4">
        <input
          type="password"
          autoComplete="current-password"
          placeholder="GitHub token"
          className="rounded-md border-gray-200 bg-transparent dark:border-gray-700"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button className="rounded-md bg-primary-500 py-2 font-semibold text-white">Unlock</button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </>
  )
}
