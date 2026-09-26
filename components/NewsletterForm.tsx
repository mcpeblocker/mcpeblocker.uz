import { FormEvent, useState } from 'react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot: humans never see it
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null)
  const [sending, setSending] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSending(true)
    setStatus(null)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not subscribe you right now.')
      setStatus({ ok: true, msg: data.message })
      setEmail('')
    } catch (err) {
      setStatus({ ok: false, msg: (err as Error).message })
    } finally {
      setSending(false)
    }
  }

  return (
    <section
      aria-labelledby="newsletter-title"
      className="not-prose my-10 rounded-xl border border-gray-200 p-5 dark:border-gray-700 sm:p-6"
    >
      <h2
        id="newsletter-title"
        className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100"
      >
        Get new posts by email
      </h2>
      <p className="mt-1 text-gray-600 dark:text-gray-400">
        An email when something new is up. No spam, unsubscribe anytime.
      </p>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">Email address</span>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-base text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:text-gray-100"
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
        <button
          type="submit"
          disabled={sending}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-50"
        >
          {sending ? 'Subscribing…' : 'Subscribe'}
        </button>
      </form>
      {status && (
        <p
          role="status"
          className={`mt-2 text-sm ${
            status.ok ? 'text-gray-600 dark:text-gray-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {status.msg}
        </p>
      )}
    </section>
  )
}
