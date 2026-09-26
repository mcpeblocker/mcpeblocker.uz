// Education and work history (from the 2026 CV). `org` is an entity id in
// data/entities.ts, so each entry links to that organization's /at/ page.

export type CvEntry = {
  id: string // anchor on /cv; activities reference entries by it (Activity.cv)
  title: string
  org: string
  location: string
  start: string // 'YYYY-MM'
  end?: string // 'YYYY-MM'; omitted = present
  details?: string // one line: courses, languages, grades
  points?: string[] // achievements
  skills?: string[]
}

export const education: CvEntry[] = [
  {
    id: 'epfl-exchange',
    title: 'Exchange semester',
    org: 'epfl',
    location: 'Lausanne, Switzerland',
    start: '2026-08',
    end: '2027-01',
    details:
      'Quantum Computing, Software Enterprise, Hydrology, Machine Learning; French (A1); running, hiking.',
  },
  {
    id: 'kaist-bs',
    title: 'B.S. in Computer Science & Electrical Engineering',
    org: 'kaist',
    location: 'Daejeon, South Korea',
    start: '2023-08',
    details:
      'Quantum Information/Software, Computer Systems, Entrepreneurship; Korean (A2); community development.',
  },
  {
    id: 'psk-a-levels',
    title: 'Cambridge International A Levels',
    org: 'psk',
    location: 'Khiva, Uzbekistan',
    start: '2019-09',
    end: '2023-05',
    details: 'Computer Science (A*), Mathematics (A*), Physics (A).',
  },
]

export const experience: CvEntry[] = [
  {
    id: 'onsquare-2026',
    title: 'Systems Engineer Intern',
    org: 'onsquare',
    location: 'Seoul, South Korea',
    start: '2026-06',
    end: '2026-08',
    points: [
      'Analyzed ongoing software project development; identified and reduced memory leaks by 70%.',
      'Implemented a TDD approach for automated verification of changes and for autonomy of AI agents.',
    ],
  },
  {
    id: 'cstl-research-intern',
    title: 'Research Intern',
    org: 'cstl',
    location: 'Daejeon, South Korea',
    start: '2025-12',
    end: '2026-06',
    points: [
      'Enhanced AI agents with cognitive architectures for proactive moderation in social networks.',
      'Built a monitoring platform for AI agent simulation.',
    ],
    skills: ['CoALA', 'LLM', 'Node.js', 'React', 'SQLite'],
  },
  {
    id: 'teambl-software-engineer',
    title: 'Software Engineer',
    org: 'teambl',
    location: 'Remote, South Korea',
    start: '2025-01',
    end: '2026-01',
    points: [
      'Published the mobile app of the platform to the App Store and Google Play within a month.',
      'Implemented real-time messaging with WebSockets.',
      'Implemented client-side caching based on UX complaints, improving Speed Index.',
      'Maintained and integrated new backend & infrastructure features via a TDD approach.',
    ],
    skills: ['Django', 'React Native', 'Expo', 'Socket.IO', 'ASGI', 'Redux', 'RTK Query', 'pytest'],
  },
  {
    id: 'onsquare-2024',
    title: 'Software Engineer Intern',
    org: 'onsquare',
    location: 'Seoul, South Korea',
    start: '2024-06',
    end: '2024-08',
    points: ["Implemented conditional types in the platform's custom type system."],
    skills: ['TypeScript', 'redom'],
  },
]
