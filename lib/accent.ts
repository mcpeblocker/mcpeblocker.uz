import type { CSSProperties } from 'react'

// Each post's accent comes from its first tag: the same tag always maps to the
// same palette, so a new tag gets a colour automatically. Tailwind's `primary`
// reads these as CSS variables, so setting them on a wrapper recolours that
// subtree (see tailwind.config.js).
// prettier-ignore
export const PALETTES: Record<string, string[]> = {
  //          100        200        300        400        500        600        700        800        900
  terracotta: ['#f9e3d8', '#f2c4ae', '#e9a07f', '#df7d52', '#c8612f', '#a94d22', '#8a3d1b', '#6b2f16', '#4f2311'],
  sage:       ['#e7eddb', '#cfdbb6', '#b2c58a', '#95ad62', '#778f45', '#5f7336', '#4a5a2b', '#384421', '#283018'],
  teal:       ['#d6ecea', '#aed8d3', '#7fbfb8', '#52a49c', '#34877f', '#296c66', '#215652', '#1a4340', '#12302e'],
  ochre:      ['#f7ecd2', '#eed7a3', '#e3bd6c', '#d6a33f', '#b8862a', '#936a20', '#72521a', '#553d14', '#3b2a0e'],
  rose:       ['#f5e1e7', '#e9c0cd', '#d99aae', '#c77590', '#a85674', '#88435d', '#6b3449', '#512837', '#3a1c27'],
  blue:       ['#dde7f1', '#bcd0e4', '#93b3d2', '#6b95bf', '#4f79a5', '#3f6189', '#324d6d', '#263b53', '#1b2a3b'],
  plum:       ['#eee0f0', '#dcc0e0', '#c49acb', '#aa76b3', '#8e5a98', '#73477c', '#5a3861', '#432a48', '#2f1e33'],
}
const NAMES = Object.keys(PALETTES)
export const DEFAULT_ACCENT = 'terracotta' // pages that aren't a post

// FNV-1a: stable across builds and browsers, spreads similar names apart.
const hash = (s: string) => {
  let h = 0x811c9dc5
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 0x01000193) >>> 0
  return h
}
const norm = (tag: string) =>
  tag
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')

// Hand-picked colours for existing categories; any other tag falls back to the hash.
const PINNED: Record<string, string> = {
  'quantum-computing': 'teal',
  'short-story': 'rose',
  poem: 'plum',
  mystery: 'blue',
  philosophy: 'ochre',
  'bot-development': 'terracotta',
  optimization: 'sage',
  autentication: 'blue',
}

export const accentFor = (tags?: string[] | null) => {
  if (!tags?.[0]) return DEFAULT_ACCENT
  const key = norm(tags[0])
  return PINNED[key] ?? NAMES[hash(key) % NAMES.length]
}

const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(' ')

export const accentStyle = (tags?: string[] | null): CSSProperties =>
  Object.fromEntries(
    PALETTES[accentFor(tags)].map((hex, i) => [`--accent-${(i + 1) * 100}`, channels(hex)])
  ) as CSSProperties
