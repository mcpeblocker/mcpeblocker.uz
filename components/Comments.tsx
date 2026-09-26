import siteMetadata from '@/data/siteMetadata'
import { FormEvent, useEffect, useRef, useState } from 'react'

type Comment = { id: string; name: string; isAuthor: boolean; text: string; createdAt: string }

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const NAME_KEY = 'comment-name'

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      reset: (id?: string) => void
    }
  }
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(siteMetadata.locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

export default function Comments({ slug }: { slug: string }) {
  const rootRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const [comments, setComments] = useState<Comment[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [website, setWebsite] = useState('') // honeypot: humans never see it
  const [status, setStatus] = useState<{ kind: 'error' | 'ok'; msg: string } | null>(null)
  const [sending, setSending] = useState(false)
  const shownAt = useRef(Date.now())
  const captchaRef = useRef<HTMLDivElement>(null)
  const captchaId = useRef<string>()
  // Turnstile token; submitting without one always fails the spam check.
  const [token, setToken] = useState('')
  const [captchaError, setCaptchaError] = useState(false)

  // Only talk to the API once the section is about to scroll into view.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), {
      rootMargin: '400px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    shownAt.current = Date.now()
    try {
      setName(localStorage.getItem(NAME_KEY) ?? '')
    } catch {
      // storage blocked: fine, the name just isn't remembered
    }
    fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setComments(d.comments))
      .catch(() => setLoadError(true))

    // Cloudflare Turnstile: invisible unless it needs to ask something.
    if (!SITE_KEY) return
    const render = () => {
      if (!captchaRef.current || !window.turnstile || captchaId.current) return
      captchaId.current = window.turnstile.render(captchaRef.current, {
        sitekey: SITE_KEY,
        appearance: 'interaction-only',
        callback: (t: string) => (setToken(t), setCaptchaError(false)),
        'expired-callback': () => setToken(''),
        'error-callback': () => setCaptchaError(true),
      })
    }
    if (window.turnstile) return render()
    const s = document.createElement('script')
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    s.async = true
    s.onload = render
    document.head.appendChild(s)
  }, [visible, slug])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return setStatus({ kind: 'error', msg: 'Write something first.' })
    setSending(true)
    setStatus(null)
    try {
      localStorage.setItem(NAME_KEY, name)
    } catch {
      // storage blocked
    }
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name,
          text,
          website,
          elapsed: (Date.now() - shownAt.current) / 1000,
          turnstile: token,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not post your comment.')
      setComments((c) => [...(c ?? []), data.comment])
      setText('')
      setStatus({ kind: 'ok', msg: 'Thanks! Your comment is posted.' })
    } catch (err) {
      setStatus({ kind: 'error', msg: (err as Error).message })
    } finally {
      setSending(false)
      setToken('') // single-use; the widget issues a fresh one
      if (captchaId.current) window.turnstile?.reset(captchaId.current)
    }
  }

  const waitingForCheck = Boolean(SITE_KEY) && !token

  const field =
    'w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-base text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:text-gray-100'

  return (
    <section
      ref={rootRef}
      id="comment"
      aria-labelledby="comments-title"
      className="not-prose pt-10"
    >
      <h2
        id="comments-title"
        className="mb-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100"
      >
        Comments{comments && comments.length > 0 && ` (${comments.length})`}
      </h2>

      {loadError && (
        <p className="mb-6 text-gray-500">Comments couldn&apos;t be loaded right now.</p>
      )}
      {comments && comments.length === 0 && (
        <p className="mb-6 text-gray-500">No comments yet. Be the first!</p>
      )}
      {comments && comments.length > 0 && (
        <ol className="mb-10 space-y-6">
          {comments.map((c) => (
            <li key={c.id} className="border-l-2 border-gray-200 pl-4 dark:border-gray-700">
              <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {c.isAuthor ? siteMetadata.author : c.name}
                </span>
                {c.isAuthor && (
                  <span className="rounded border border-primary-500 px-1.5 text-xs font-semibold text-primary-700 dark:text-primary-300">
                    author
                  </span>
                )}
                <time dateTime={c.createdAt} className="text-gray-500 dark:text-gray-400">
                  {formatDate(c.createdAt)}
                </time>
              </p>
              <p className="mt-1 whitespace-pre-line text-gray-700 dark:text-gray-300">{c.text}</p>
            </li>
          ))}
        </ol>
      )}

      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="sr-only">Your name</span>
          <input
            className={`${field} sm:max-w-xs`}
            placeholder="Your name (optional)"
            maxLength={50}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </label>
        <label className="block">
          <span className="sr-only">Your comment</span>
          <textarea
            className={field}
            rows={4}
            maxLength={2000}
            placeholder="Say something…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
        </label>
        {/* Honeypot: hidden from people, irresistible to bots. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[9999px] h-px w-px opacity-0"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
        <div ref={captchaRef} />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={sending || waitingForCheck}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-50"
          >
            {sending ? 'Sending…' : waitingForCheck ? 'Checking you’re human…' : 'Post comment'}
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            No sign-in needed. Be kind.
          </span>
        </div>
        {captchaError && (
          <p role="status" className="text-sm text-red-600 dark:text-red-400">
            The spam check couldn&apos;t run. A content blocker may be stopping it; allow
            challenges.cloudflare.com and reload.
          </p>
        )}
        {status && (
          <p
            role="status"
            className={`text-sm ${
              status.kind === 'error'
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {status.msg}
          </p>
        )}
      </form>
    </section>
  )
}
