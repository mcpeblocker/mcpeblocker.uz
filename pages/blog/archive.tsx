import LayoutWrapper from '@/components/LayoutWrapper'
import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { allCoreContent, archivedBlogPosts } from '@/lib/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import Link from 'next/link'
import { InferGetStaticPropsType } from 'next'

export const getStaticProps = async () => {
  const posts = allCoreContent(archivedBlogPosts(allBlogs))
  return { props: { posts } }
}

export default function Archive({ posts }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <LayoutWrapper>
      <PageSEO title={`Archive - ${siteMetadata.author}`} description={siteMetadata.description} />
      <ListLayout posts={posts} title="Archive" />
      <p className="py-4 text-sm text-gray-500 dark:text-gray-400">
        Older posts I keep around for the record.{' '}
        <Link href="/blog" className="underline-magical font-bold">
          Back to the blog &rarr;
        </Link>
      </p>
    </LayoutWrapper>
  )
}
