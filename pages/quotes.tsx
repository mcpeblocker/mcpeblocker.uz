import LayoutWrapper from '@/components/LayoutWrapper'
import PageTitle from '@/components/PageTitle'
import { PageSEO } from '@/components/SEO'
import quotes from '@/data/quotes.json'
import siteMetadata from '@/data/siteMetadata'
import { Quote } from 'types/Quote'

// Written from /write/quotes, which commits data/quotes.json. Newest first.
export default function Quotes() {
  return (
    <LayoutWrapper>
      <PageSEO
        title={`Quotes - ${siteMetadata.author}`}
        description="Lines from books, songs, films and people that stayed with me."
      />
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <PageTitle>Quotes</PageTitle>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          Lines from books, songs, films and people that stayed with me.
        </p>
      </div>

      {quotes.length === 0 ? (
        <p className="pb-16 text-gray-500">No quotes yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200 pb-16 dark:divide-gray-800">
          {(quotes as Quote[]).map((q) => (
            <li key={q.id} className="py-8">
              <figure className="border-l-2 border-primary-500 pl-5">
                <blockquote className="whitespace-pre-line text-xl leading-relaxed text-gray-900 dark:text-gray-100">
                  {q.text}
                </blockquote>
                <figcaption className="mt-3 text-gray-500 dark:text-gray-400">
                  — {q.author}
                  {q.source && (
                    <>
                      , <cite>{q.source}</cite>
                    </>
                  )}
                  {q.kind && <span className="ml-2 text-sm uppercase tracking-wide">{q.kind}</span>}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      )}
    </LayoutWrapper>
  )
}
