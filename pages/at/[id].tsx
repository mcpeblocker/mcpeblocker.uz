import ActivityTitle from '@/components/ActivityTitle'
import Card from '@/components/Card'
import CvEntries from '@/components/CvEntries'
import LayoutWrapper from '@/components/LayoutWrapper'
import PostCard from '@/components/PostCard'
import { PageSEO } from '@/components/SEO'
import activitiesData from '@/data/activitiesData'
import { education, experience } from '@/data/cvData'
import entities from '@/data/entities'
import projectsData from '@/data/projectsData'
import siteMetadata from '@/data/siteMetadata'
import { formatPeriod, sortActivities } from '@/lib/utils/activities'
import { allCoreContent, sortedBlogPost } from '@/lib/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import { ReactNode } from 'react'

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: entities.map((e) => ({ params: { id: e.id } })),
  fallback: false,
})

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const entity = entities.find((e) => e.id === params?.id)
  if (!entity) return { notFound: true }
  // Posts that @mention this entity (see lib/mentions.ts).
  const posts = sortedBlogPost(allBlogs).filter((p) => (p.mentions as string[]).includes(entity.id))
  return { props: { id: entity.id, posts: allCoreContent(posts) } }
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="pb-10">
    <h2 className="mb-5 text-xl font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {title}
    </h2>
    {children}
  </section>
)

// Whole-word, case-insensitive: does this text refer to the entity?
const refersTo = (text: string, names: string[]) =>
  names.some((n) =>
    new RegExp(`(^|[^\\w])${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\w])`, 'i').test(text)
  )

export default function EntityPage({ id, posts }: InferGetStaticPropsType<typeof getStaticProps>) {
  const entity = entities.find((e) => e.id === id)
  if (!entity) return null
  const names = [entity.name, ...(entity.aliases ?? [])]
  const cv = [...education, ...experience].filter((c) => c.org === entity.id)
  const project = projectsData.find((p) => p.title === entity.project)
  const activities = sortActivities(
    activitiesData.filter((a) => refersTo(`${a.title} ${a.description ?? ''}`, names))
  )

  return (
    <LayoutWrapper>
      <PageSEO
        title={`${entity.name} - ${siteMetadata.author}`}
        description={entity.description ?? entity.name}
      />
      <div className="pt-6 pb-10 space-y-3">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary-700 dark:text-primary-300">
          {entity.kind}
        </p>
        <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14">
          {entity.name}
        </h1>
        {entity.description && (
          <p className="text-lg leading-7 text-gray-600 dark:text-gray-400">{entity.description}</p>
        )}
        {entity.href && (
          <a
            href={entity.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-primary-700 hover:underline dark:text-primary-300"
          >
            {entity.href.replace(/^https?:\/\//, '').replace(/\/$/, '')} ↗
          </a>
        )}
      </div>

      {cv.length > 0 && (
        <Section title="Education & work">
          <CvEntries entries={cv} />
        </Section>
      )}
      {project && (
        <Section title="Project">
          <div className="-m-2 flex flex-wrap">
            <Card
              title={project.title}
              description={project.description}
              imgSrc={project.imgSrc}
              href={project.href}
              links={project.links}
            />
          </div>
        </Section>
      )}
      {activities.length > 0 && (
        <Section title="Activities">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {activities.map((a) => (
              <li key={a.title + a.start} className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-6">
                <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400 sm:w-40">
                  {formatPeriod(a)}
                </span>
                <ActivityTitle
                  activity={a}
                  className="text-gray-900 dark:text-gray-100"
                  linkClassName="hover:underline"
                />
              </li>
            ))}
          </ul>
        </Section>
      )}
      {posts.length > 0 && (
        <Section title="Mentioned in">
          <PostCard posts={posts} />
        </Section>
      )}
      {!cv.length && !project && !activities.length && !posts.length && (
        <p className="pb-16 text-gray-500">Nothing on this site references {entity.name} yet.</p>
      )}
    </LayoutWrapper>
  )
}
