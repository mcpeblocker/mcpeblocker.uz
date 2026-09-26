import { accentStyle } from '@/lib/accent'
import Document, { Head, Html, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" style={accentStyle()}>
        <Head>
          <link rel="apple-touch-icon" sizes="76x76" href="/static/favicons/favicon.ico" />
          <link rel="icon" type="image/png" sizes="32x32" href="/static/favicons/favicon.ico" />
          <link rel="icon" type="image/png" sizes="16x16" href="/static/favicons/favicon.ico" />
          <meta name="msapplication-TileColor" content="#f5efe3" />
          <meta name="theme-color" content="#f5efe3" />
          <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
        </Head>
        <body className="antialiased text-black bg-white dark:bg-black dark:text-white">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
