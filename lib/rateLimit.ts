// ponytail: per-server-instance memory, so a determined spammer can spread across
// instances; it only blunts floods. Move to a shared store if abuse shows up.
export const rateLimiter = (max: number, windowMs: number) => {
  const hits = new Map<string, number[]>()
  return (key: string) => {
    const now = Date.now()
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
    hits.set(key, [...recent, now])
    return recent.length >= max // true = over the limit
  }
}

export const clientIp = (headers: Record<string, string | string[] | undefined>) =>
  String(headers['x-forwarded-for'] ?? '')
    .split(',')[0]
    .trim() || 'unknown'
