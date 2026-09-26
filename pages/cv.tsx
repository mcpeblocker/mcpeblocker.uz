import AboutTabs from '@/components/AboutTabs'
import CvEntries from '@/components/CvEntries'
import LayoutWrapper from '@/components/LayoutWrapper'
import { PageSEO } from '@/components/SEO'
import { education, experience } from '@/data/cvData'
import siteMetadata from '@/data/siteMetadata'
import Link from 'next/link'

export default function Cv() {
  return (
    <LayoutWrapper>
      <AboutTabs />
      <PageSEO
        title={`CV - ${siteMetadata.author}`}
        description={`Education and work experience of ${siteMetadata.author}`}
      />
      <div className="pt-6 pb-8 space-y-2 md:space-y-5">
        <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14">
          CV
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          Education and work experience. Projects, awards and programs live on{' '}
          <Link href="/projects" className="underline-magical">
            Projects
          </Link>{' '}
          and{' '}
          <Link href="/activities" className="underline-magical">
            Activities
          </Link>
          .
        </p>
      </div>
      <section className="pb-10">
        <h2 className="mb-6 text-xl font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Education
        </h2>
        <CvEntries entries={education} />
      </section>
      <section className="pb-16">
        <h2 className="mb-6 text-xl font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Work experience
        </h2>
        <CvEntries entries={experience} />
      </section>
    </LayoutWrapper>
  )
}
