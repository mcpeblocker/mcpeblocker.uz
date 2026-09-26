export type ActivityCategory =
  | 'academic'
  | 'quantum'
  | 'entrepreneurship'
  | 'research'
  | 'agriculture'
  | 'software'
  | 'course'
  | 'certification'
  | 'personal'
  | 'learning'

export const activityCategories: { key: ActivityCategory; label: string }[] = [
  { key: 'academic', label: 'Academic' },
  { key: 'quantum', label: 'Quantum' },
  { key: 'entrepreneurship', label: 'Entrepreneurship' },
  { key: 'research', label: 'Research' },
  { key: 'agriculture', label: 'Agriculture' },
  { key: 'software', label: 'Software Development' },
  { key: 'course', label: 'Course Projects' },
  { key: 'certification', label: 'Certifications' },
  { key: 'personal', label: 'Personal' },
  { key: 'learning', label: 'Self-learning' },
]

export type ActivityDuration = 'one-time' | 'short' | 'long'

export const activityDurations: { key: ActivityDuration; label: string }[] = [
  { key: 'one-time', label: 'One-time' },
  { key: 'short', label: 'Short-term' },
  { key: 'long', label: 'Long-term' },
]

/**
 * UN Sustainable Development Goals — number → { label, color }.
 * Colors are the official UN goal colors, used for the SDG badges.
 */
export const sdgGoals: Record<number, { label: string; color: string }> = {
  1: { label: 'No Poverty', color: '#E5243B' },
  2: { label: 'Zero Hunger', color: '#DDA63A' },
  3: { label: 'Good Health and Well-being', color: '#4C9F38' },
  4: { label: 'Quality Education', color: '#C5192D' },
  5: { label: 'Gender Equality', color: '#FF3A21' },
  6: { label: 'Clean Water and Sanitation', color: '#26BDE2' },
  7: { label: 'Affordable and Clean Energy', color: '#FCC30B' },
  8: { label: 'Decent Work and Economic Growth', color: '#A21942' },
  9: { label: 'Industry, Innovation and Infrastructure', color: '#FD6925' },
  10: { label: 'Reduced Inequalities', color: '#DD1367' },
  11: { label: 'Sustainable Cities and Communities', color: '#FD9D24' },
  12: { label: 'Responsible Consumption and Production', color: '#BF8B2E' },
  13: { label: 'Climate Action', color: '#3F7E44' },
  14: { label: 'Life Below Water', color: '#0A97D9' },
  15: { label: 'Life on Land', color: '#56C02B' },
  16: { label: 'Peace, Justice and Strong Institutions', color: '#00689D' },
  17: { label: 'Partnerships for the Goals', color: '#19486A' },
}

/** Names shown on the About page timeline, one per year. */
export const yearNames: Record<number, string> = {
  2026: 'Exploration Year',
  2025: 'Double Year (Startup + Quantum Computing)',
  2024: 'Networking Year',
  2023: 'Next-step Year',
  2022: 'Open-source & Experience Year',
  2021: 'Full-stack Year',
  2020: 'Backend Year',
  2019: 'Baby steps Year',
}

export type Activity = {
  title: string
  description?: string // optional detail, e.g. the specific project built within a program
  category: ActivityCategory
  tags: string[]
  sdgs?: number[] // UN Sustainable Development Goal numbers (see sdgGoals)
  start?: string // 'YYYY-MM' or 'YYYY'; omit for undated software items
  end?: string // 'YYYY-MM' or 'YYYY'
  ongoing?: boolean // renders "– Present"
  upcoming?: boolean // future-dated ("will be …"); shows an "Upcoming" badge
  href?: string
}

const activitiesData: Activity[] = [
  // Academic
  {
    title: 'Exchange student at EPFL',
    category: 'academic',
    tags: ['exchange', 'epfl'],
    start: '2026-09',
    end: '2027-01',
    ongoing: true,
    href: 'https://www.epfl.ch',
  },
  {
    title: 'Intensive French Language Program at EPFL',
    category: 'academic',
    tags: ['french', 'language', 'epfl'],
    start: '2026-08',
  },
  {
    title: 'Korean Language Winter Camp at KAIST',
    category: 'academic',
    tags: ['korean', 'language', 'kaist'],
    start: '2025-01',
  },
  {
    title: 'Computer Science & Electrical Engineering double major at KAIST',
    category: 'academic',
    tags: ['computer-science', 'electrical-engineering', 'kaist'],
    start: '2023',
    ongoing: true,
  },

  // Quantum
  {
    title: 'Quantum Korea Conference 2026',
    category: 'quantum',
    tags: ['quantum-computing', 'quantum-information'],
    start: '2026-07',
  },
  {
    title: 'New York Abu Dhabi Hackathon',
    category: 'quantum',
    tags: ['quantum-computing', 'sdg', 'hackathon'],
    start: '2026-09',
    ongoing: true,
  },
  {
    title: 'QVolution Hackathon',
    description: 'Selected among the Top 5 winning teams for the Quandela Challenge',
    category: 'quantum',
    tags: ['quantum-computing', 'quantum-information', 'hackathon'],
    start: '2026-02',
    href: 'https://arxiv.org/abs/2603.10707',
  },
  {
    title: 'MIT iQuHack',
    category: 'quantum',
    tags: ['quantum-computing', 'quantum-information', 'hackathon'],
    start: '2026-01',
  },
  {
    title: 'KAIST-MIT Quantum Information Winter School 2026',
    category: 'quantum',
    tags: ['quantum-computing', 'quantum-information'],
    start: '2026-01',
    href: 'https://news.kaist.ac.kr/newsen/html/news/?mode=V&mng_no=57411',
  },
  {
    title: 'Yonsei & SKKU Qiskit Fall Fest 2025',
    category: 'quantum',
    tags: ['quantum-computing', 'qiskit'],
    start: '2025-10',
    end: '2025-11',
  },
  {
    title: 'IBM Qiskit Global Summer School 2025',
    category: 'quantum',
    tags: ['quantum-computing', 'qiskit'],
    start: '2025-07',
    href: 'https://www.ibm.com/quantum/blog/qiskit-summer-school-2025',
  },

  // Entrepreneurship
  {
    title: 'MIT Global Startup Workshop',
    description: 'Optimizing swarm robot routing in warehouses via a quantum-inspired algorithm',
    category: 'entrepreneurship',
    tags: ['entrepreneurship', 'startup', 'quantum-computing', 'optimization'],
    sdgs: [9, 12],
    start: '2026-03',
    href: 'https://gsw.mit.edu/',
  },
  {
    title: 'KAIST-Silicon Valley Global Entrepreneurship Summer School',
    description: 'Gleamo — gamified culture learning for expats in Korea',
    category: 'entrepreneurship',
    tags: ['entrepreneurship', 'startup'],
    sdgs: [4, 10],
    start: '2026-06',
  },
  {
    title: 'KAIST-Silicon Valley Global Entrepreneurship Summer School',
    description: 'Finalist with GuardianAngel — proactive solution for workplace harassment',
    category: 'entrepreneurship',
    tags: ['entrepreneurship', 'startup'],
    sdgs: [5, 8],
    start: '2025-06',
    href: 'https://kgep.kaist.ac.kr/pages/sub/sub_0201',
  },
  {
    title: 'KAIST Lean Startup Program',
    category: 'entrepreneurship',
    tags: ['entrepreneurship', 'startup'],
    start: '2024-06',
    end: '2024-11',
  },

  // Research
  {
    title: 'Collaborative Social Technologies Lab at KAIST',
    category: 'research',
    tags: ['research', 'cognitive-intelligence', 'ai-agents'],
    start: '2026-01',
    end: '2026-06',
  },

  // Agriculture
  {
    title: 'Moisture-Memory Coupling in Rotational Irrigation Scheduling',
    category: 'agriculture',
    tags: ['research', 'agriculture', 'optimization', 'quantum-computing'],
    sdgs: [2, 6, 12, 13],
    start: '2026-07',
  },
  {
    title:
      'PlantPulse: A low-cost Raspberry Pi and ultrasonic bio-acoustic system for real-time plant stress monitoring',
    category: 'agriculture',
    tags: ['research', 'agriculture', 'machine-learning', 'signal-processing'],
    sdgs: [2, 12, 15],
    start: '2026-07',
  },

  // Software Development
  {
    title: 'imake.bot — AI-powered no-code chatbot platform for small business owners',
    category: 'software',
    tags: ['fullstack', 'nextjs', 'nodejs', 'imb'],
    ongoing: true,
  },
  {
    title: 'imb — Domain Specific Language (DSL) for expressing business logic as a chatbot flow',
    category: 'software',
    tags: ['compiler', 'runtime', 'rust'],
    href: 'https://imb.mcpeblocker.uz',
    ongoing: true,
  },
  {
    title: 'Pockets — shared asset management platform for group activities',
    category: 'software',
    tags: ['fullstack', 'nextjs', 'supabase', 'tailwindcss'],
    start: '2026-02',
  },
  {
    title: 'Whodunnit — simulation of mystery novels for immersive reading experience',
    category: 'software',
    tags: ['fullstack', 'nextjs', 'tailwindcss', 'openai-api'],
    start: '2026-07',
    href: 'https://whodunnit.mcpeblocker.uz',
  },
  {
    title: 'shashka.uz — real-time online multiplayer platform for traditional board game',
    category: 'software',
    tags: ['fullstack', 'nextjs', 'nodejs', 'socket.io'],
    start: '2024-09',
    href: 'https://shashka.uz',
  },
  {
    title: 'telegraf-pagination — pagination interface plugin for Telegraf.js bots',
    category: 'software',
    tags: ['nodejs', 'telegraf.js', 'open-source'],
    start: '2022-09',
    href: 'https://npmjs.com/package/telegraf-pagination',
  },
  {
    title: 'Looina (startup) — browser-based operating system for custom user workflows',
    category: 'software',
    tags: ['web', 'typescript', 'redom', 'sass', 'startup'],
    start: '2024-06',
    end: '2024-08',
  },
  {
    title:
      'Teambl (startup) — trust-based networking platform for university students in South Korea',
    category: 'software',
    tags: ['fullstack', 'react-native', 'django', 'postgresql', 'aws', 'startup'],
    start: '2025-01',
    end: '2026-03',
    href: 'https://play.google.com/store/apps/details?id=com.teambl.teambl&hl=en',
  },

  // Course Projects
  {
    title: 'BookSwap — second-hand book exchange platform for university students',
    category: 'course',
    tags: [
      'intro-to-software-engineering',
      'fullstack',
      'react-native',
      'nodejs',
      'express',
      'mongodb',
    ],
    start: '2024-03',
    end: '2024-06',
    href: 'https://github.com/west-sea/bookswap-mobile',
  },
  {
    title: 'Hello KAISTian! — TinyML wake-word detection on Raspberry Pi microphone input',
    category: 'course',
    tags: ['intro-to-electronics-design-lab', 'tinyml', 'tensorflow-lite', 'raspberry-pi'],
    start: '2026-03',
    end: '2026-06',
  },

  // Certifications
  {
    title: 'TOPIK Level 2 — Korean Language Proficiency Test',
    category: 'certification',
    tags: ['korean', 'language'],
    start: '2026-01',
  },
  {
    title: 'TOEFL iBT 106/120 — English Language Proficiency Test',
    category: 'certification',
    tags: ['english', 'language'],
    start: '2026-01',
  },
  {
    title: 'IELTS 7.0/9.0 — English Language Proficiency Test',
    category: 'certification',
    tags: ['english', 'language'],
    start: '2022-09',
  },
  // Not yet acquired
  // {
  //   title: 'QWorld — QGold, QSilver, QBronze certificates',
  //   category: 'certification',
  //   tags: ['quantum-computing', 'qiskit'],
  //   start: '2026-07',
  // },
  {
    title: 'Quantum Business Foundations — IBM Quantum',
    category: 'certification',
    tags: ['quantum-computing', 'qiskit'],
    start: '2025-07',
  },
  // Not yet acquired
  // {
  //   title: 'Advanced Quantum Algorithms — IBM Quantum',
  //   category: 'certification',
  //   tags: ['quantum-computing', 'qiskit'],
  //   start: '2026-07',
  // },
  {
    title: 'QGSS 2025 Quantum Excellence Certificate',
    category: 'certification',
    tags: ['quantum-computing', 'qiskit'],
    start: '2025-07',
  },
  // --- New in 2026, and items carried over from the old About timeline ---

  // Academic
  {
    title: 'Learning French (A1) at EPFL',
    category: 'academic',
    tags: ['french', 'language', 'epfl'],
    start: '2026-09',
    ongoing: true,
  },
  {
    title: 'Hydrology for Engineers (ENV-221) at EPFL, taken out of curiosity',
    category: 'academic',
    tags: ['hydrology', 'epfl'],
    start: '2026-09',
    ongoing: true,
    href: 'https://edu.epfl.ch/coursebook/en/hydrology-for-engineers-ENV-221',
  },
  {
    title: 'Picked up Electrical Engineering as a double major at KAIST',
    category: 'academic',
    tags: ['electrical-engineering', 'kaist'],
    start: '2025',
  },
  {
    title: 'Basics of Quantum Information course by Prof. Joonwoo Bae',
    category: 'academic',
    tags: ['quantum-information', 'kaist'],
    start: '2025',
    href: 'https://ee.kaist.ac.kr/en/professor/16106/',
  },
  {
    title: 'Core computer science courses at KAIST',
    description:
      'Algorithms (MATHS!!!), Data Structures (Java), Programming Principles (F#), Programming Language (Scala), System Programming (C)',
    category: 'academic',
    tags: ['computer-science', 'kaist'],
    start: '2024',
  },
  {
    title: 'Graduated from the Presidential School in Khiva',
    category: 'academic',
    tags: ['high-school'],
    start: '2023-05',
    href: 'https://portal.piima.uz/en/schools/presidental-schools/4',
  },

  // Research
  {
    title: 'Joined @GenoRobotics at @EPFL to work on the @AcousticBiodiversity project',
    category: 'research',
    tags: ['biodiversity', 'tinyml', 'epfl'],
    sdgs: [15],
    start: '2026-09',
    ongoing: true,
  },

  // Quantum
  {
    title: 'Pivoted to quantum computing (out of boredom, I guess)',
    category: 'quantum',
    tags: ['quantum-computing'],
    start: '2025',
  },

  // Software Development
  {
    title: 'Systems Engineer Intern at OnSquare, Seoul',
    category: 'software',
    tags: ['internship', 'memory-leaks', 'tdd'],
    start: '2026-06',
    end: '2026-08',
  },
  {
    title: 'Summer internship at OnSquare, Seoul',
    category: 'software',
    tags: ['internship', 'typescript'],
    start: '2024-06',
    end: '2024-08',
  },
  {
    title: 'Deployed this website, mcpeblocker.uz',
    category: 'software',
    tags: ['nextjs', 'website'],
    start: '2023',
    href: '/',
  },
  {
    title: "Built shashka.uz's online multiplayer game platform and its API system",
    category: 'software',
    tags: ['fullstack', 'api'],
    start: '2023',
    href: 'https://api.shashka.uz/docs',
  },
  {
    title: 'Contributed to the online multiplayer game shashka.uz',
    category: 'software',
    tags: ['game', 'web'],
    start: '2022',
    href: 'https://shashka.uz',
  },
  {
    title:
      'Built an automated testing & monitoring system for driving schools (got a patent for it)',
    category: 'software',
    tags: ['fullstack', 'patent'],
    start: '2022',
  },

  // Personal
  {
    title: 'Half Marathon at the Lausanne Marathon 2026',
    category: 'personal',
    tags: ['running'],
    start: '2026-10',
    upcoming: true,
    href: 'https://en.lausanne-marathon.com/',
  },
  {
    title: 'Received so many rejections and put them on my Wall of Rejections',
    category: 'personal',
    tags: ['growth-mindset'],
    start: '2025',
    href: 'https://rejections.mcpeblocker.uz/profile/mcpeblocker?view=wall',
  },
  {
    title: 'Moved to South Korea for undergraduate studies at KAIST',
    category: 'personal',
    tags: ['kaist', 'korea'],
    start: '2023-08',
  },
  {
    title: 'Started freelancing during the pandemic',
    category: 'personal',
    tags: ['freelancing'],
    start: '2020',
  },
  {
    title: 'Met my mentor, the founder of eagles.uz',
    category: 'personal',
    tags: ['mentorship'],
    start: '2019',
    href: 'https://eagles.uz',
  },

  // Self-learning
  {
    title: 'Learned grammY',
    category: 'learning',
    tags: ['telegram-bots'],
    start: '2022',
    href: 'https://grammy.dev',
  },
  {
    title: 'Learned Next.js and created SEO-friendly websites',
    category: 'learning',
    tags: ['nextjs', 'seo'],
    start: '2022',
    href: 'https://nextjs.org/',
  },
  {
    title: 'Gained more experience with Material UI',
    category: 'learning',
    tags: ['ui'],
    start: '2022',
    href: 'https://mui.com/',
  },
  {
    title: 'Learned the basics of Ant Design',
    category: 'learning',
    tags: ['ui'],
    start: '2022',
    href: 'https://ant.design/',
  },
  {
    title: 'Learned the basics of Flutter',
    category: 'learning',
    tags: ['mobile'],
    start: '2022',
    href: 'https://flutter.dev/',
  },
  {
    title: 'Learned React, Redux, Tailwind CSS and some other UI libraries',
    category: 'learning',
    tags: ['react', 'frontend'],
    start: '2021',
    href: 'https://reactjs.org/',
  },
  {
    title: 'Learned TypeScript',
    category: 'learning',
    tags: ['typescript'],
    start: '2021',
    href: 'https://www.typescriptlang.org/',
  },
  {
    title: 'Learned Firebase: Cloud Firestore, Realtime Database, Authentication',
    category: 'learning',
    tags: ['firebase'],
    start: '2021',
    href: 'https://firebase.google.com',
  },
  {
    title: 'Learned real-time communication with Socket.IO',
    category: 'learning',
    tags: ['realtime'],
    start: '2021',
    href: 'https://socket.io',
  },
  {
    title: 'Learned Telegraf.js and made different Telegram bots with it',
    category: 'learning',
    tags: ['telegram-bots'],
    start: '2021',
    href: 'https://telegraf.js.org',
  },
  {
    title: 'Learned how to create custom npm packages',
    category: 'learning',
    tags: ['npm'],
    start: '2021',
  },
  {
    title: 'Learned NestJS',
    category: 'learning',
    tags: ['backend'],
    start: '2021',
    href: 'https://nestjs.com/',
  },
  {
    title: 'Learned TypeORM and Sequelize',
    category: 'learning',
    tags: ['orm'],
    start: '2021',
    href: 'https://typeorm.io/',
  },
  {
    title: 'Learned to produce API docs with Swagger',
    category: 'learning',
    tags: ['api'],
    start: '2021',
    href: 'https://swagger.io/',
  },
  {
    title: 'Worked with more databases: PostgreSQL and MySQL',
    category: 'learning',
    tags: ['databases'],
    start: '2021',
  },
  {
    title: 'Learned JavaScript',
    category: 'learning',
    tags: ['javascript'],
    start: '2020',
    href: 'https://www.javascript.com/',
  },
  {
    title: 'Learned Node.js and Express to build REST APIs',
    category: 'learning',
    tags: ['backend'],
    start: '2020',
    href: 'https://nodejs.org',
  },
  {
    title: 'Made use of MongoDB in my projects',
    category: 'learning',
    tags: ['databases'],
    start: '2020',
    href: 'https://www.mongodb.com/',
  },
  {
    title: 'Learned Git and version control platforms: GitHub, GitLab',
    category: 'learning',
    tags: ['git'],
    start: '2020',
    href: 'https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control',
  },
  {
    title: 'Learned the basics of web development: HTML, CSS',
    category: 'learning',
    tags: ['web'],
    start: '2019',
  },
  {
    title: 'Produced some pet projects to experience programming',
    category: 'learning',
    tags: ['web'],
    start: '2019',
  },
]

export default activitiesData
