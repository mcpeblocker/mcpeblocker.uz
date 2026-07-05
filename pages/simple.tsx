import { PageSEO } from '@/components/SEO'
import projectsData from '@/data/projectsData'
import siteMetadata from '@/data/siteMetadata'
import { allCoreContent, sortedBlogPost } from '@/lib/utils/contentlayer'
import { allAuthors, allBlogs } from 'contentlayer/generated'
import { InferGetStaticPropsType } from 'next'
import { useMDXComponent } from 'next-contentlayer/hooks'
import Link from 'next/link'
import { AnchorHTMLAttributes, ReactNode } from 'react'

export const getStaticProps = async () => {
  const author = allAuthors.find((p) => p.slug === 'default') || null
  const posts = allCoreContent(sortedBlogPost(allBlogs))
  return { props: { author, posts } }
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

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

export default function Simple({ author, posts }: InferGetStaticPropsType<typeof getStaticProps>) {
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
            <Link href="/" className="text-sky-700 hover:underline">
              &larr; Back to the interactive site
            </Link>
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

          {/* Projects */}
          <Section title="Projects">
            <div className="space-y-8">
              {projectsData.map((project) => (
                <div key={project.title} className="flex flex-col gap-4 sm:flex-row">
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.imgSrc}
                      alt={project.title}
                      className="h-28 w-full rounded border border-gray-200 object-cover sm:w-44"
                    />
                  </a>
                  <div>
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-gray-900 hover:text-sky-700"
                    >
                      {project.title}
                    </a>
                    <p className="mt-1 text-sm text-gray-600">{project.description}</p>
                    {project.tag?.length > 0 && (
                      <p className="mt-2 text-xs text-gray-400">{project.tag.join(' · ')}</p>
                    )}
                  </div>
                </div>
              ))}
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
          </Section>

          <footer className="mt-16 border-t border-gray-200 pt-6 text-sm text-gray-500">
            © {new Date().getFullYear()} {siteMetadata.author} ·{' '}
            <Link href="/" className="text-sky-700 hover:underline">
              interactive version
            </Link>
          </footer>
        </div>
      </div>
    </>
  )
}
