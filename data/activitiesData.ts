export type ActivityCategory =
  | 'academic'
  | 'quantum'
  | 'entrepreneurship'
  | 'research'
  | 'agriculture'
  | 'software'
  | 'course'
  | 'certification'

export const activityCategories: { key: ActivityCategory; label: string }[] = [
  { key: 'academic', label: 'Academic' },
  { key: 'quantum', label: 'Quantum' },
  { key: 'entrepreneurship', label: 'Entrepreneurship' },
  { key: 'research', label: 'Research' },
  { key: 'agriculture', label: 'Agriculture' },
  { key: 'software', label: 'Software Development' },
  { key: 'course', label: 'Course Projects' },
  { key: 'certification', label: 'Certifications' },
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
    upcoming: true,
    href: 'https://www.epfl.ch',
  },
  {
    title: 'Intensive French Language Program at EPFL',
    category: 'academic',
    tags: ['french', 'language', 'epfl'],
    start: '2026-08',
    upcoming: true,
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
    upcoming: true,
  },
  {
    title: 'QVolution Hackathon',
    category: 'quantum',
    tags: ['quantum-computing', 'quantum-information', 'hackathon'],
    start: '2026-02',
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
  },

  // Entrepreneurship
  {
    title: 'MIT Global Startup Workshop',
    description: 'Optimizing swarm robot routing in warehouses via a quantum-inspired algorithm',
    category: 'entrepreneurship',
    tags: ['entrepreneurship', 'startup', 'quantum-computing', 'optimization'],
    sdgs: [9, 12],
    start: '2026-03',
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
    description: 'GuardianAngel — proactive solution for workplace harassment',
    category: 'entrepreneurship',
    tags: ['entrepreneurship', 'startup'],
    sdgs: [5, 8],
    start: '2025-06',
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
]

export default activitiesData
