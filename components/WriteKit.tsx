import yaml from 'js-yaml'
import Head from 'next/head'
import { FormEvent, useEffect, useState } from 'react'

// Shared bits of the private /write pages. Anyone can open them, but nothing
// works without a GitHub token that can push to the repo, so they're owner-only.
// Drafts (images included, as data URLs) live in localStorage only.

export const REPO = 'mcpeblocker/mcpeblocker.uz'
export const BRANCH = 'main'
export const DRAFTS_KEY = 'write:drafts'
const TOKEN_KEY = 'write:token'
export const TOC_BLOCK =
  '## Table of contents\n\n<TOCInline toc={props.toc} exclude="Table of contents" toHeading={2} indentDepth={2} />\n\n---\n\n'

export type Draft = {
  id: string
  title: string
  slug: string
  date: string
  tags: string
  summary: string
  toc?: boolean // legacy: TOC now lives in the body as TOC_BLOCK
  body: string
  images: Record<string, string>
  updated: number
  publishedAt?: number
  origSlug?: string // set once the post exists in the repo; publishing then updates it
  raw?: boolean // body is hand-written MDX from the repo: don't escape it
  fm?: Record<string, unknown> // original frontmatter, so unedited fields survive
  thumbnail?: string // link-preview image: '' = auto (first image), 'img:<id>' or a site path
}

export const today = () => new Date().toISOString().slice(0, 10)
export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
export const newDraft = (): Draft => ({
  id: newId(),
  title: '',
  slug: '',
  date: today(),
  tags: '',
  summary: '',
  body: '',
  images: {},
  updated: Date.now(),
})

// A post file is `---\n<yaml>\n---\n<mdx>`. JSON schema keeps dates as strings.
export function splitPost(text: string) {
  const m = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!m) throw new Error('No frontmatter')
  return {
    fm: yaml.load(m[1], { schema: yaml.JSON_SCHEMA }) as Record<string, unknown>,
    body: m[2],
  }
}
export const joinPost = (fm: Record<string, unknown>, body: string) =>
  `---\n${yaml.dump(fm, { lineWidth: -1, flowLevel: 1 })}---\n${body}`

export const load = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '') ?? fallback
  } catch {
    return fallback
  }
}

export async function gh(token: string, path: string, init: RequestInit = {}) {
  const url = path.startsWith('/graphql')
    ? 'https://api.github.com/graphql'
    : `https://api.github.com/repos/${REPO}${path}`
  const res = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  })
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${(await res.json()).message}`)
  return res.json()
}

// One atomic commit for the post and all its images (Git Data API).
export async function commitFiles(
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

export function useToken() {
  const [token, setToken] = useState<string | null>(null) // null = not read yet
  useEffect(() => setToken(load(TOKEN_KEY, '')), [])
  const lock = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken('')
  }
  return { token, setToken, lock }
}

export function WriteHead({ title }: { title: string }) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="robots" content="noindex, nofollow" />
    </Head>
  )
}

export function Unlock({ onUnlock }: { onUnlock: (token: string) => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
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
    <form onSubmit={submit} className="mx-auto mt-32 flex max-w-sm flex-col gap-3 px-4">
      <WriteHead title="Write" />
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
  )
}
