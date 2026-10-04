import {
  BRANCH,
  commitFiles,
  newId,
  REPO,
  Unlock,
  useToken,
  WriteHead,
} from '@/components/WriteKit'
import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import {
  RiArrowLeftLine,
  RiDeleteBinLine,
  RiEditLine,
  RiExternalLinkLine,
  RiLockLine,
  RiSendPlaneFill,
} from 'react-icons/ri'
import { Quote } from 'types/Quote'

// All quotes live in one JSON file; every save commits the whole file.
const FILE = 'data/quotes.json'
const KINDS = ['Book', 'Song', 'Movie', 'Show', 'Poem', 'Speech', 'Game', 'Person']
const empty = (): Quote => ({ id: newId(), text: '', author: '', source: '', kind: '' })

// no-store: GitHub lets browsers cache API responses for 60s, and a stale read
// before a save would drop the quote saved just before it.
async function fetchQuotes(token: string): Promise<Quote[]> {
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}?ref=${BRANCH}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.raw' },
    cache: 'no-store',
  })
  if (res.status === 404) return []
  if (!res.ok) throw new Error(`GitHub ${res.status}`)
  return res.json()
}

export default function WriteQuotes() {
  const { token, setToken, lock } = useToken()
  const [quotes, setQuotes] = useState<Quote[] | null>(null)
  const [form, setForm] = useState<Quote>(empty)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!token) return
    fetchQuotes(token)
      .then(setQuotes)
      .catch((e) => setStatus(`Failed to load quotes: ${e.message}`))
  }, [token])

  if (token === null) return null
  if (!token) return <Unlock onUnlock={setToken} />

  // Apply the change to the latest file, so edits from another device survive.
  const save = async (change: (all: Quote[]) => Quote[], message: string) => {
    setBusy(true)
    try {
      setStatus('Saving…')
      const next = change(await fetchQuotes(token))
      const url = await commitFiles(
        token,
        [{ path: FILE, content: `${JSON.stringify(next, null, 2)}\n`, encoding: 'utf-8' }],
        message
      )
      setQuotes(next)
      setStatus(`Saved. Live once Vercel deploys. ${url}`)
      return true
    } catch (e) {
      setStatus(`Failed: ${(e as Error).message}`)
      return false
    } finally {
      setBusy(false)
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const q: Quote = {
      id: form.id,
      text: form.text.trim(),
      author: form.author.trim(),
      source: form.source.trim(),
      kind: form.kind.trim().toLowerCase(),
    }
    const editing = quotes?.some((x) => x.id === q.id)
    const ok = await save(
      (all) =>
        all.some((x) => x.id === q.id) ? all.map((x) => (x.id === q.id ? q : x)) : [q, ...all],
      `${editing ? 'upd quote' : 'quote'}: ${q.author}`
    )
    if (ok) setForm(empty())
  }

  const remove = (q: Quote) => {
    if (!confirm(`Delete the quote by ${q.author}?`)) return
    save((all) => all.filter((x) => x.id !== q.id), `del quote: ${q.author}`)
    if (form.id === q.id) setForm(empty())
  }

  const editing = quotes?.some((x) => x.id === form.id)
  const field =
    'mt-1 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-base focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700'
  const btn =
    'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
      <WriteHead title="Quotes" />
      <header className="sticky top-0 z-10 -mx-4 flex items-center gap-2 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-gray-800 dark:bg-black/90 sm:-mx-6 sm:px-6">
        <Link href="/write" className={btn}>
          <RiArrowLeftLine size={18} /> Editor
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <a href="/quotes" target="_blank" rel="noreferrer" className={btn}>
            <RiExternalLinkLine size={18} />
            <span className="hidden sm:inline">View</span>
          </a>
          <button className={btn} onClick={lock} title="Forget token on this device">
            <RiLockLine size={18} />
            <span className="hidden sm:inline">Lock</span>
          </button>
        </div>
      </header>

      <h1 className="mt-8 text-3xl font-extrabold tracking-tight sm:text-4xl">Quotes</h1>

      <form onSubmit={submit} className="mt-6 grid gap-3 sm:grid-cols-3">
        <label className="sm:col-span-3">
          Quote
          <textarea
            required
            rows={4}
            className={field}
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
          />
        </label>
        <label>
          Author
          <input
            required
            className={field}
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
          />
        </label>
        <label>
          Source (title)
          <input
            className={field}
            placeholder="Optional"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
          />
        </label>
        <label>
          Kind
          <input
            list="quote-kinds"
            className={field}
            placeholder="Book, song, movie…"
            value={form.kind}
            onChange={(e) => setForm({ ...form, kind: e.target.value })}
          />
          <datalist id="quote-kinds">
            {KINDS.map((k) => (
              <option key={k} value={k} />
            ))}
          </datalist>
        </label>
        <div className="flex items-center gap-2 sm:col-span-3">
          <button
            disabled={busy || !quotes}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600 active:scale-95 disabled:opacity-50"
          >
            <RiSendPlaneFill size={16} />
            {busy ? 'Saving…' : editing ? 'Update quote' : 'Publish quote'}
          </button>
          {(editing || form.text) && (
            <button type="button" className={btn} onClick={() => setForm(empty())}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {status && (
        <p className="mt-4 break-words rounded-md bg-gray-100 px-3 py-2 text-sm dark:bg-gray-900">
          {status}
        </p>
      )}

      {!quotes ? (
        !status && <p className="mt-8 text-gray-500">Loading quotes…</p>
      ) : (
        <ul className="mt-6 divide-y divide-gray-200 dark:divide-gray-800">
          {quotes.map((q) => (
            <li key={q.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-line text-gray-900 dark:text-gray-100">{q.text}</p>
                <p className="mt-1 text-sm text-gray-500">
                  — {q.author}
                  {q.source && `, ${q.source}`}
                  {q.kind && ` (${q.kind})`}
                </p>
              </div>
              <div className="-ml-2.5 flex gap-0.5 sm:ml-0">
                <button className={btn} disabled={busy} onClick={() => setForm(q)}>
                  <RiEditLine size={17} /> Edit
                </button>
                <button
                  disabled={busy}
                  onClick={() => remove(q)}
                  className={`${btn} !text-red-600 hover:!bg-red-50 dark:hover:!bg-red-950`}
                >
                  <RiDeleteBinLine size={17} /> Delete
                </button>
              </div>
            </li>
          ))}
          {!quotes.length && <p className="py-8 text-gray-500">No quotes yet.</p>}
        </ul>
      )}
    </div>
  )
}
