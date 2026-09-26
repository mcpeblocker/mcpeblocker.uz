import {
  BRANCH,
  commitFiles,
  Draft,
  DRAFTS_KEY,
  gh,
  joinPost,
  load,
  newDraft,
  REPO,
  splitPost,
  Unlock,
  useToken,
  WriteHead,
} from '@/components/WriteKit'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import {
  RiAddLine,
  RiArchiveLine,
  RiArrowLeftLine,
  RiDeleteBinLine,
  RiEditLine,
  RiExternalLinkLine,
  RiInboxUnarchiveLine,
  RiLockLine,
} from 'react-icons/ri'

type Post = { slug: string; text: string; draft?: Draft; error?: string }

// Parse a repo post into an editor draft. The body is kept as raw MDX.
function toDraft(slug: string, text: string): Draft {
  const { fm, body } = splitPost(text)
  const now = Date.now()
  return {
    ...newDraft(),
    title: String(fm.title ?? ''),
    slug,
    date: String(fm.date ?? '').slice(0, 10),
    tags: Array.isArray(fm.tags) ? fm.tags.join(', ') : '',
    summary: String(fm.summary ?? ''),
    thumbnail: typeof fm.thumbnail === 'string' ? fm.thumbnail : '',
    body: body.replace(/^\n+/, '').trimEnd(),
    raw: true,
    fm,
    origSlug: slug,
    updated: now,
    publishedAt: now, // in sync with the live version
  }
}

const QUERY = `query($owner: String!, $name: String!, $expr: String!) {
  repository(owner: $owner, name: $name) {
    object(expression: $expr) { ... on Tree { entries { name object { ... on Blob { text } } } } }
  }
}`

export default function Posts() {
  const { token, setToken, lock } = useToken()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!token) return
    const [owner, name] = REPO.split('/')
    // One GraphQL call fetches every post's source instead of N REST calls.
    gh(token, '/graphql', {
      method: 'POST',
      body: JSON.stringify({
        query: QUERY,
        variables: { owner, name, expr: `${BRANCH}:data/blog` },
      }),
    })
      .then(({ data, errors }) => {
        if (errors) throw new Error(errors[0].message)
        const entries: { name: string; object: { text: string } }[] = data.repository.object.entries
        setPosts(
          entries
            .filter((e) => e.name.endsWith('.mdx'))
            .map(({ name, object }) => {
              const slug = name.slice(0, -4)
              try {
                return { slug, text: object.text, draft: toDraft(slug, object.text) }
              } catch (e) {
                return { slug, text: object.text, error: (e as Error).message }
              }
            })
            .sort((a, b) => (b.draft?.date ?? '').localeCompare(a.draft?.date ?? ''))
        )
      })
      .catch((e) => setStatus(`Failed to load posts: ${e.message}`))
  }, [token])

  if (token === null) return null
  if (!token) return <Unlock onUnlock={setToken} />

  const edit = (post: Post) => {
    if (!post.draft) return
    const drafts = load<Record<string, Draft>>(DRAFTS_KEY, {})
    const local = Object.values(drafts).find((x) => x.origSlug === post.slug)
    const unpublished = local && local.updated - (local.publishedAt ?? 0) > 2000
    const draft =
      unpublished &&
      confirm(
        'You have unpublished edits of this post in this browser. Continue them?\n\nCancel discards them and loads the live version.'
      )
        ? local
        : { ...post.draft, id: local?.id ?? post.draft.id }
    try {
      localStorage.setItem(DRAFTS_KEY, JSON.stringify({ ...drafts, [draft.id]: draft }))
    } catch {
      return setStatus('Browser storage is full. Delete some drafts in the editor first.')
    }
    router.push(`/write?d=${draft.id}`)
  }

  const remove = async (slug: string) => {
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
      setPosts((all) => all?.filter((p) => p.slug !== slug) ?? null)
      setStatus(`Deleted ${slug} (${paths.length} files). Gone once Vercel deploys. ${url}`)
    } catch (e) {
      setStatus(`Failed: ${(e as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  // Only the frontmatter changes; the body is written back byte for byte.
  const toggleArchive = async (post: Post) => {
    const { fm, body } = splitPost(post.text)
    const archive = fm.archived !== true
    if (archive) fm.archived = true
    else delete fm.archived
    const text = joinPost(fm, body)
    setBusy(true)
    try {
      setStatus(`${archive ? 'Archiving' : 'Unarchiving'} ${post.slug}…`)
      const url = await commitFiles(
        token,
        [{ path: `data/blog/${post.slug}.mdx`, content: text, encoding: 'utf-8' }],
        `${archive ? 'archive' : 'unarchive'}: ${post.slug}`
      )
      setPosts(
        (all) =>
          all?.map((p) =>
            p.slug === post.slug ? { slug: p.slug, text, draft: toDraft(p.slug, text) } : p
          ) ?? null
      )
      // Keep local drafts of this post in step, or publishing one would undo this.
      const drafts = load<Record<string, Draft>>(DRAFTS_KEY, {})
      for (const x of Object.values(drafts)) {
        if (x.origSlug !== post.slug || !x.fm) continue
        if (archive) x.fm.archived = true
        else delete x.fm.archived
      }
      try {
        localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
      } catch {
        // storage full: that draft keeps its old flag
      }
      setStatus(
        `${archive ? 'Archived' : 'Unarchived'} ${post.slug}. Updates once Vercel deploys. ${url}`
      )
    } catch (e) {
      setStatus(`Failed: ${(e as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  const q = query.toLowerCase()
  const shown = posts?.filter((p) =>
    [p.slug, p.draft?.title, p.draft?.tags].some((s) => s?.toLowerCase().includes(q))
  )
  const btn =
    'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
      <WriteHead title="Posts" />
      <header className="sticky top-0 z-10 -mx-4 flex items-center gap-2 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-gray-800 dark:bg-black/90 sm:-mx-6 sm:px-6">
        <Link href="/write" className={btn}>
          <RiArrowLeftLine size={18} /> Editor
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <button className={btn} onClick={lock} title="Forget token on this device">
            <RiLockLine size={18} />
            <span className="hidden sm:inline">Lock</span>
          </button>
          <Link
            href="/write?new"
            className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600 active:scale-95"
          >
            <RiAddLine size={18} /> New post
          </Link>
        </div>
      </header>

      <div className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Posts</h1>
        {posts && <span className="text-gray-500">{posts.length}</span>}
        <input
          type="search"
          placeholder="Search title, slug or tag"
          className="w-full rounded-md border-gray-200 bg-transparent text-base dark:border-gray-700 sm:ml-auto sm:w-64"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {status && (
        <p className="mt-4 break-words rounded-md bg-gray-100 px-3 py-2 text-sm dark:bg-gray-900">
          {status}
        </p>
      )}

      {!shown ? (
        !status && <p className="mt-8 text-gray-500">Loading posts…</p>
      ) : (
        <ul className="mt-6 divide-y divide-gray-200 dark:divide-gray-800">
          {shown.map((p) => (
            <li key={p.slug} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900 dark:text-gray-100">
                  {p.draft?.title || p.slug}
                </p>
                <p className="mt-0.5 flex flex-wrap gap-x-2 text-sm text-gray-500">
                  {p.draft?.date && <span>{p.draft.date}</span>}
                  <span>/blog/{p.slug}</span>
                  {p.draft?.tags && <span>{p.draft.tags}</span>}
                  {p.draft?.fm?.archived === true && (
                    <span className="text-amber-600">archived</span>
                  )}
                  {p.draft?.fm?.draft === true && (
                    <span className="text-amber-600">hidden draft</span>
                  )}
                  {p.error && <span className="text-red-600">can&apos;t parse: {p.error}</span>}
                </p>
              </div>
              <div className="-ml-2.5 flex flex-wrap gap-0.5 sm:ml-0">
                <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className={btn}>
                  <RiExternalLinkLine size={17} /> View
                </a>
                <button className={btn} disabled={!p.draft} onClick={() => edit(p)}>
                  <RiEditLine size={17} /> Edit
                </button>
                <button
                  className={btn}
                  disabled={busy || !p.draft}
                  onClick={() => toggleArchive(p)}
                >
                  {p.draft?.fm?.archived === true ? (
                    <>
                      <RiInboxUnarchiveLine size={17} /> Unarchive
                    </>
                  ) : (
                    <>
                      <RiArchiveLine size={17} /> Archive
                    </>
                  )}
                </button>
                <button
                  disabled={busy}
                  onClick={() => remove(p.slug)}
                  className={`${btn} !text-red-600 hover:!bg-red-50 dark:hover:!bg-red-950`}
                >
                  <RiDeleteBinLine size={17} /> Delete
                </button>
              </div>
            </li>
          ))}
          {!shown.length && <p className="py-8 text-gray-500">No posts match.</p>}
        </ul>
      )}
    </div>
  )
}
