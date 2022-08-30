const siteMetadata = {
  title: 'Alisher Ortiqov',
  author: 'Alisher Ortiqov',
  headerTitle: 'mcpeblocker',
  description: 'Software Engineer',
  language: 'en-us',
  theme: 'dark', // system, dark or light
  siteUrl: 'https://mcpeblocker.uz',
  siteRepo: 'https://github.com/mcpeblocker/mcpeblocker.uz',
  siteLogo: '/static/images/logo.png',
  image: '/static/images/avatar.png',
  socialBanner: '/static/images/twitter-card.png',
  email: 'mcpeblocker@gmail.com',
  github: 'https://github.com/mcpeblocker',
  twitter: 'https://twitter.com/mcpeblocker',
  facebook: 'https://facebook.com/mcpeblocker',
  linkedin: 'https://www.linkedin.com/in/mcpeblocker/',
  spotify: 'https://open.spotify.com/user/iggjeuwirhey7ic6gdnkbxdh5?si=99110914d4f94c01',
  steam: 'https://steamcommunity.com/id/mcpeblocker/',
  locale: 'en-US',
  comment: {
    provider: 'giscus',
    giscusConfig: {
      repo: process.env.NEXT_PUBLIC_GISCUS_REPO || '',
      repositoryId: process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID || '',
      category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY || '',
      categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || '',
      mapping: 'pathname',
      reactions: '1',
      metadata: '0',
      theme: 'light',
      darkTheme: 'transparent_dark',
      themeURL: '',
    },
  },
}

module.exports = siteMetadata
