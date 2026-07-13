import { PageSEO } from '@/components/SEO'
import { useViewMode } from '@/components/ViewMode'
import activitiesData, { activityCategories } from '@/data/activitiesData'
import projectsData, { projectCategories } from '@/data/projectsData'
import siteMetadata from '@/data/siteMetadata'
import { formatPeriod, sortActivities } from '@/lib/utils/activities'
import { sortedBlogPost } from '@/lib/utils/contentlayer'
import { allAuthors, allBlogs } from 'contentlayer/generated'
import { useMDXComponent } from 'next-contentlayer/hooks'
import Link from 'next/link'
import { AnchorHTMLAttributes, ReactNode } from 'react'

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

// Plain, academic-style anchor used for links inside the rendered biography MDX.
const PlainAnchor = ({ href = '', children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const isInternal = href.startsWith('/') || href.startsWith('#')
  if (isInternal) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  )
}

const mdxComponents = { a: PlainAnchor }

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="mt-12">
    <h2 className="mb-6 border-b border-gray-200 pb-2 font-serif text-lg font-semibold uppercase tracking-wide text-gray-900">
      {title}
    </h2>
    {children}
  </section>
)

export default function SimpleView() {
  const { setMode } = useViewMode()
  const author = allAuthors.find((p) => p.slug === 'default')
  const posts = sortedBlogPost([...allBlogs])
  const archivedCount = allBlogs.filter((p) => p.archived === true && p.draft === false).length
  const Bio = useMDXComponent(author?.body.code || '')

  const contactLinks = [
    { label: 'Email', href: `mailto:${siteMetadata.email}` },
    { label: 'GitHub', href: siteMetadata.github },
    { label: 'LinkedIn', href: siteMetadata.linkedin },
    { label: 'Twitter', href: siteMetadata.twitter },
  ]

  return (
    <>
      <PageSEO title={`${siteMetadata.author} — Simple`} description={siteMetadata.description} />
      <div className="min-h-screen bg-white text-gray-800">
        <div className="mx-auto max-w-3xl px-6 py-12 font-sans">
          <div className="mb-10 text-sm">
            <button onClick={() => setMode('default')} className="text-sky-700 hover:underline">
              &larr; Switch to the default view
            </button>
          </div>

          {/* Header */}
          <header className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {author?.avatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={author.avatar}
                alt={author.name}
                className="h-32 w-32 shrink-0 rounded-full object-cover grayscale"
              />
            )}
            <div>
              <h1 className="font-serif text-3xl font-bold text-gray-900">
                {author?.name || siteMetadata.author}
              </h1>
              {author?.occupation && (
                <p className="mt-1 text-gray-600">
                  {author.occupation}
                  {author.company ? ` · ${author.company}` : ''}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {contactLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-700 hover:underline"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </header>

          {/* Biography + timeline (rendered from data/authors/default.mdx) */}
          {author && (
            <Section title="About">
              <div className="prose prose-slate max-w-none prose-a:font-normal prose-a:text-sky-700 prose-a:no-underline hover:prose-a:underline">
                <Bio components={mdxComponents} />
              </div>
            </Section>
          )}

          {/* Activities, grouped by category (CV-style, no filters) */}
          <Section title="Activities">
            <div className="space-y-10">
              {activityCategories.map(({ key, label }) => {
                const items = sortActivities(activitiesData.filter((a) => a.category === key))
                if (items.length === 0) return null
                return (
                  <div key={key}>
                    <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                      {label}
                    </h3>
                    <ol className="space-y-4">
                      {items.map((activity) => (
                        <li
                          key={`${activity.title}-${activity.start ?? ''}-${
                            activity.description ?? ''
                          }`}
                          className="flex flex-col gap-1 sm:flex-row sm:gap-6"
                        >
                          <span className="shrink-0 text-sm text-gray-500 sm:w-36 sm:pt-0.5">
                            {formatPeriod(activity)}
                          </span>
                          <div>
                            {activity.href ? (
                              <a
                                href={activity.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-gray-900 hover:text-sky-700"
                              >
                                {activity.title}
                              </a>
                            ) : (
                              <span className="font-medium text-gray-900">{activity.title}</span>
                            )}
                            {activity.description && (
                              <p className="mt-0.5 text-sm text-gray-600">{activity.description}</p>
                            )}
                            {activity.sdgs && activity.sdgs.length > 0 && (
                              <p className="mt-1 text-xs text-gray-500">
                                {activity.sdgs.map((n) => `SDG ${n}`).join(' · ')}
                              </p>
                            )}
                            {activity.tags.length > 0 && (
                              <p className="mt-1 text-xs text-gray-400">
                                {activity.tags.join(' · ')}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )
              })}
            </div>
          </Section>

          {/* Projects, grouped by category */}
          <Section title="Projects">
            <div className="space-y-10">
              {projectCategories.map(({ key, label }) => {
                const items = projectsData.filter((p) => p.category === key)
                if (items.length === 0) return null
                return (
                  <div key={key}>
                    <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                      {label}
                    </h3>
                    <div className="space-y-8">
                      {items.map((project) => (
                        <div key={project.title} className="flex flex-col gap-4 sm:flex-row">
                          {project.imgSrc && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={project.imgSrc}
                              alt={project.title}
                              className="h-28 w-full shrink-0 rounded border border-gray-200 object-cover sm:w-44"
                            />
                          )}
                          <div>
                            {project.href ? (
                              <a
                                href={project.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-gray-900 hover:text-sky-700"
                              >
                                {project.title}
                              </a>
                            ) : (
                              <span className="font-medium text-gray-900">{project.title}</span>
                            )}
                            <p className="mt-1 text-sm text-gray-600">{project.description}</p>
                            {project.tag.length > 0 && (
                              <p className="mt-2 text-xs text-gray-400">
                                {project.tag.join(' · ')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>

          {/* Writing */}
          <Section title="Writing">
            <ol className="space-y-6">
              {posts.map((post) => (
                <li key={post.slug} className="flex flex-col gap-1 sm:flex-row sm:gap-6">
                  <time
                    dateTime={post.date}
                    className="shrink-0 text-sm text-gray-500 sm:w-36 sm:pt-0.5"
                  >
                    {formatDate(post.date)}
                  </time>
                  <div>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="font-medium text-gray-900 hover:text-sky-700"
                    >
                      {post.title}
                    </Link>
                    {post.summary && <p className="mt-1 text-sm text-gray-600">{post.summary}</p>}
                  </div>
                </li>
              ))}
            </ol>
            {archivedCount > 0 && (
              <p className="mt-6 text-sm">
                <Link href="/blog/archive" className="text-sky-700 hover:underline">
                  Older posts in the archive ({archivedCount}) &rarr;
                </Link>
              </p>
            )}
          </Section>

          <footer className="mt-16 border-t border-gray-200 pt-6 text-sm text-gray-500">
            © {new Date().getFullYear()} {siteMetadata.author} ·{' '}
            <button onClick={() => setMode('default')} className="text-sky-700 hover:underline">
              default view
            </button>
          </footer>
        </div>
      </div>
    </>
  )
}
