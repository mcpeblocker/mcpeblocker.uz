import siteMetadata from '@/data/siteMetadata'
import { addComment, getComments } from '@/lib/comments'
import { clientIp, rateLimiter } from '@/lib/rateLimit'
import { allBlogs } from 'contentlayer/generated'
import type { NextApiRequest, NextApiResponse } from 'next'

const MAX_TEXT = 2000
const MIN_SECONDS = 3 // humans take longer than this to write a comment

const rateLimited = rateLimiter(5, 10 * 60_000) // 5 comments per 10 minutes; Turnstile is the real gate

async function turnstileOk(token: unknown, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true // not configured (e.g. local dev): skip the check
  if (typeof token !== 'string' || !token) return false
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  })
  return (await res.json()).success === true
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const slug = String((req.method === 'GET' ? req.query.slug : req.body?.slug) ?? '')
  const post = allBlogs.find((p) => p.slug === slug && p.draft !== true)
  if (!post) return res.status(404).json({ error: 'Unknown post' })

  try {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300')
      return res.json({ comments: await getComments(post.slug, post.title) })
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const { name, text, website, elapsed, turnstile } = req.body ?? {}
    const ip = clientIp(req.headers)
    const body = typeof text === 'string' ? text.trim() : ''

    // Bots: honeypot field filled, or submitted faster than a human could type.
    if (website || Number(elapsed) < MIN_SECONDS) return res.status(400).json({ error: 'Rejected' })
    if (!body) return res.status(400).json({ error: 'Write something first.' })
    if (body.length > MAX_TEXT)
      return res.status(400).json({ error: `Keep it under ${MAX_TEXT} characters.` })
    if ((body.match(/https?:\/\//g) ?? []).length > 2)
      return res.status(400).json({ error: 'Too many links.' })
    if (rateLimited(ip))
      return res.status(429).json({ error: 'Too many comments, try again in a bit.' })
    if (!(await turnstileOk(turnstile, ip)))
      return res.status(400).json({ error: 'Spam check failed, please retry.' })

    const url = `${siteMetadata.siteUrl}/blog/${post.slug}`
    const comment = await addComment(
      { slug: post.slug, title: post.title, url },
      String(name ?? ''),
      body
    )
    return res.status(201).json({ comment })
  } catch (e) {
    console.error('comments:', e)
    return res.status(503).json({ error: 'Comments are unavailable right now.' })
  }
}
