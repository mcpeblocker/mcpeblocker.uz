import { clientIp, rateLimiter } from '@/lib/rateLimit'
import type { NextApiRequest, NextApiResponse } from 'next'

// Adds an email to the Mailchimp audience as "pending": Mailchimp sends a
// confirmation email and only confirmed addresses get newsletters (double
// opt-in), so nobody can sign someone else up.
const rateLimited = rateLimiter(3, 60 * 60_000) // 3 attempts per hour per visitor
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { email, website } = req.body ?? {}
  const address = typeof email === 'string' ? email.trim().toLowerCase() : ''

  if (website) return res.status(400).json({ error: 'Rejected' }) // honeypot
  if (!EMAIL.test(address) || address.length > 254)
    return res.status(400).json({ error: 'That email address looks off.' })
  if (rateLimited(clientIp(req.headers)))
    return res.status(429).json({ error: 'Too many attempts, try again later.' })

  const {
    MAILCHIMP_API_KEY: key,
    MAILCHIMP_API_SERVER: server,
    MAILCHIMP_AUDIENCE_ID: list,
  } = process.env
  if (!key || !server || !list) {
    console.error('subscribe: Mailchimp env vars are missing')
    return res.status(503).json({ error: 'Subscriptions are unavailable right now.' })
  }

  try {
    const mc = await fetch(`https://${server}.api.mailchimp.com/3.0/lists/${list}/members`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${key}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email_address: address, status: 'pending' }),
    })
    if (mc.ok) return res.status(201).json({ message: 'Almost done: check your inbox to confirm.' })

    const err = await mc.json()
    if (err.title === 'Member Exists')
      return res.status(200).json({ message: "You're already on the list. Thanks!" })
    if (err.title === 'Invalid Resource' || err.title === 'Forgotten Email Not Subscribed')
      return res.status(400).json({ error: 'Mailchimp rejected that address.' })
    throw new Error(`${mc.status} ${err.title}: ${err.detail}`)
  } catch (e) {
    console.error('subscribe:', e)
    return res.status(502).json({ error: 'Could not subscribe you right now.' })
  }
}
