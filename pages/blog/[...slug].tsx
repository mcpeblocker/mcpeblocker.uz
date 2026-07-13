import LayoutWrapper from '@/components/LayoutWrapper'
import { MDXLayoutRenderer } from '@/components/MDXComponents'
import PageTitle from '@/components/PageTitle'
import ScrollProgressBar from '@/components/ScrollProgressBar'
import { coreContent, sortedBlogPost } from '@/lib/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { InferGetStaticPropsType } from 'next'

const DEFAULT_LAYOUT = 'PostLayout'

export async function getStaticPaths() {
  // Archived posts are excluded from listings but stay reachable at their URL.
  const posts = allBlogs.filter((p) => p.draft === false)
  return {
    paths: posts.map((p) => ({ params: { slug: p.slug.split('/') } })),
    fallback: false,
  }
}

export const getStaticProps = async ({ params }: any) => {
  const slug = (params.slug as string[]).join('/')
  const sortedPosts = sortedBlogPost(allBlogs)
  const postIndex = sortedPosts.findIndex((p) => p.slug === slug)
  // TODO: Refactor this extraction of coreContent
  const prevContent = (postIndex >= 0 && sortedPosts[postIndex + 1]) || null
  const prev = prevContent ? coreContent(prevContent) : null
  const nextContent = (postIndex >= 0 && sortedPosts[postIndex - 1]) || null
  const next = nextContent ? coreContent(nextContent) : null
  const post = allBlogs.find((p) => p.slug === slug)
  const author = post?.author || ['default']

  return {
    props: {
      post,
      author,
      prev,
      next,
    },
  }
}

export default function Blog({
  post,
  author,
  prev,
  next,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <ScrollProgressBar />
      <LayoutWrapper>
        {post && 'draft' in post && post.draft !== true ? (
          <MDXLayoutRenderer
            layout={post.layout || DEFAULT_LAYOUT}
            toc={post.toc}
            content={post}
            authorDetails={author}
            prev={prev}
            next={next}
          />
        ) : (
          <div className="mt-24 text-center">
            <PageTitle>
              Under Construction{' '}
              <span role="img" aria-label="roadwork sign">
                🚧
              </span>
            </PageTitle>
          </div>
        )}
      </LayoutWrapper>
    </>
  )
}
