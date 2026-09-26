import { ComputedFields, defineDocumentType, makeSource } from 'contentlayer/source-files'
import readingTime from 'reading-time'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypeSlug from 'rehype-slug'
import { mentionsIn, remarkMentions } from './lib/mentions'
import remarkCodeTitles from './lib/remark-code-title'
import { extractTocHeadings } from './lib/remark-toc-headings'

// Images a post shows, in order (markdown or <img>/<Image>; code blocks don't count).
const imagesIn = (markdown: string) =>
  Array.from(
    markdown
      .replace(/```[\s\S]*?```/g, '')
      .matchAll(/!\[([^\]]*)\]\(\s*<?([^)\s>]+)|<(?:img|Image)\b[^>]*?\bsrc=["']([^"']+)/g),
    (m) => ({ src: m[2] ?? m[3], alt: m[1] ?? '' })
  )

const computedFields: ComputedFields = {
  readingTime: { type: 'json', resolve: (doc) => readingTime(doc.body.raw) },
  slug: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath.replace(/^.+?(\/)/, ''),
  },
  toc: { type: 'string', resolve: (doc) => extractTocHeadings(doc.body.raw) },
  // Link-preview image: explicit thumbnail, else header image, else the first
  // image in the post (markdown or <img>/<Image>); '' falls back to the site banner.
  ogImage: {
    type: 'string',
    resolve: (doc) => doc.thumbnail || doc.images?.[0] || imagesIn(doc.body.raw)[0]?.src || '',
  },
  // For /gallery: every picture in the post body.
  gallery: { type: 'json', resolve: (doc) => imagesIn(doc.body.raw) },
  // Entity ids this post @mentions, for the backlinks on /at/<id>.
  mentions: { type: 'json', resolve: (doc) => mentionsIn(doc.body.raw) },
}

export const Blog = defineDocumentType(() => ({
  name: 'Blog',
  filePathPattern: 'blog/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    tags: { type: 'list', of: { type: 'string' } },
    lastmod: { type: 'date' },
    draft: { type: 'boolean' },
    archived: { type: 'boolean' },
    summary: { type: 'string' },
    images: { type: 'list', of: { type: 'string' } },
    thumbnail: { type: 'string' }, // link-preview image only; `images` is the post's header
    author: { type: 'string', required: true },
    authorUrl: { type: 'string' },
    layout: { type: 'string' },
    bibliography: { type: 'string' },
    canonicalUrl: { type: 'string' },
  },
  computedFields,
}))

export const Authors = defineDocumentType(() => ({
  name: 'Authors',
  filePathPattern: 'authors/**/*.mdx',
  contentType: 'mdx',
  fields: {
    name: { type: 'string', required: true },
    avatar: { type: 'string' },
    occupation: { type: 'string' },
    company: { type: 'string' },
    email: { type: 'string' },
    twitter: { type: 'string' },
    linkedin: { type: 'string' },
    github: { type: 'string' },
    layout: { type: 'string' },
  },
  computedFields,
}))

export default makeSource({
  contentDirPath: 'data',
  documentTypes: [Blog, Authors],
  mdx: {
    cwd: process.cwd(),
    remarkPlugins: [remarkCodeTitles, remarkMentions],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings, [rehypePrismPlus, { ignoreMissing: true }]],
  },
})
