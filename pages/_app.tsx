import '@/css/prism.css'
import '@/css/tailwind.css'
import '@fontsource/mukta'

import LogRocket from '@/components/Logrocket'
import ProgressBar from '@/components/ProgressBar'
import { ScrollObserver } from '@/components/ScrollObserver'
import { useViewMode, ViewModeProvider } from '@/components/ViewMode'
import siteMetadata from '@/data/siteMetadata'
import { AnimatePresence } from 'framer-motion'
import { ThemeProvider } from 'next-themes'
import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'

// Client-only chunk: simple mode is a client preference, and this keeps the
// contentlayer data it imports out of the shared bundle.
const SimpleView = dynamic(() => import('@/components/SimpleView'), { ssr: false })

function ModeAwarePage({ Component, pageProps }: Pick<AppProps, 'Component' | 'pageProps'>) {
  const { mode } = useViewMode()
  const router = useRouter()
  // Individual posts stay readable in simple mode; every other page collapses
  // into the single academic-style view.
  const isPostPage = router.pathname === '/blog/[...slug]'

  if (mode === 'simple' && !isPostPage) return <SimpleView />
  return <Component {...pageProps} />
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme={siteMetadata.theme}>
      <Head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </Head>
      <ViewModeProvider>
        <AnimatePresence exitBeforeEnter initial={false}>
          <ScrollObserver>
            <LogRocket />
            <ProgressBar />
            <ModeAwarePage Component={Component} pageProps={pageProps} />
          </ScrollObserver>
        </AnimatePresence>
      </ViewModeProvider>
    </ThemeProvider>
  )
}
