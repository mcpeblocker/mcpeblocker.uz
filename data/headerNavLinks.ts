type NavLink = { href: string; title: string; match?: string[] } // match: other paths it owns

// "About" is a section: its tabs (components/AboutTabs.tsx) keep their own URLs.
export const aboutTabs = [
  { href: '/about', title: 'About' },
  { href: '/cv', title: 'CV' },
  { href: '/activities', title: 'Activities' },
  { href: '/uses', title: 'Uses' },
]

const headerNavLinks: NavLink[] = [
  { href: '/blog', title: 'Blog' },
  { href: '/gallery', title: 'Gallery' },
  { href: '/projects', title: 'Projects' },
  { href: '/about', title: 'About', match: aboutTabs.map((t) => t.href) },
]

export const isActiveLink = (link: NavLink, pathname: string) =>
  [link.href, ...(link.match ?? [])].some((p) => pathname === p || pathname.startsWith(`${p}/`))

export default headerNavLinks
