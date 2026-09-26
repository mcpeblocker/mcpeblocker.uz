import LayoutWrapper from '@/components/LayoutWrapper'
import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import { accentStyle } from '@/lib/accent'
import { sortedBlogPost } from '@/lib/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { InferGetStaticPropsType } from 'next'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

type Photo = { src: string; alt: string; slug: string; title: string; tags: string[] }

// Every picture inside a published post (drafts and archived posts excluded), newest first.
export const getStaticProps = async () => {
  const photos: Photo[] = sortedBlogPost(allBlogs).flatMap((p) =>
    (p.gallery as { src: string; alt: string }[]).map((img) => ({
      ...img,
      slug: p.slug,
      title: p.title,
      tags: p.tags ?? [],
    }))
  )
  return { props: { photos } }
}

export default function Gallery({ photos }: InferGetStaticPropsType<typeof getStaticProps>) {
  const [open, setOpen] = useState<number | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)),
    [photos.length]
  )

  useEffect(() => {
    if (open === null) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, step])

  const current = open === null ? null : photos[open]

  return (
    <LayoutWrapper>
      <PageSEO
        title={`Gallery - ${siteMetadata.author}`}
        description="Every picture from the blog, in one place."
      />
      <div className="pt-6 pb-8 space-y-2 md:space-y-5">
        <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14">
          Gallery
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          Every picture from the blog, in one place.
        </p>
      </div>

      {photos.length === 0 ? (
        <p className="pb-16 text-gray-500">No pictures yet.</p>
      ) : (
        <div className="columns-1 gap-4 pb-16 sm:columns-2 lg:columns-3">
          {photos.map((p, i) => (
            <button
              key={`${p.slug}-${p.src}`}
              type="button"
              onClick={() => setOpen(i)}
              style={accentStyle(p.tags)}
              className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src}
                alt={p.alt || `Picture from "${p.title}"`}
                loading="lazy"
                className="w-full transition duration-300 group-hover:scale-[1.03]"
              />
              <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-8 text-left text-sm font-medium text-white transition group-hover:translate-y-0 group-focus-visible:translate-y-0">
                {p.title}
              </span>
            </button>
          ))}
        </div>
      )}

      {current && (
        // Clicking the dark backdrop closes; keyboard users get Escape/arrows via
        // the document listener above, so these handlers need no key equivalent.
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Picture from "${current.title}"`}
          className="fixed inset-0 z-50 flex flex-col bg-black/90 text-white"
          onClick={(e) => e.target === e.currentTarget && setOpen(null)}
        >
          <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
            <span className="text-white/70">
              {(open ?? 0) + 1} / {photos.length}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(null)}
              className="rounded px-2 py-1 text-white/80 hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              ✕ Close
            </button>
          </div>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-12"
            onClick={(e) => e.target === e.currentTarget && setOpen(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.src}
              alt={current.alt || `Picture from "${current.title}"`}
              className="max-h-full max-w-full rounded object-contain"
            />
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous picture"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-3 text-3xl text-white/70 hover:bg-white/10 hover:text-white"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next picture"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-3 text-3xl text-white/70 hover:bg-white/10 hover:text-white"
                >
                  ›
                </button>
              </>
            )}
          </div>
          <p className="px-4 py-4 text-center text-sm">
            {current.alt && <span className="block text-white/80">{current.alt}</span>}
            From{' '}
            <Link href={`/blog/${current.slug}`} className="font-semibold underline">
              {current.title}
            </Link>
          </p>
        </div>
      )}
    </LayoutWrapper>
  )
}
