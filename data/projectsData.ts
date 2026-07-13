export type ProjectCategory =
  | 'research'
  | 'quantum'
  | 'startup'
  | 'app'
  | 'web'
  | 'game'
  | 'device'
  | '3d'
  | 'open-source'

export const projectCategories: { key: ProjectCategory; label: string }[] = [
  { key: 'research', label: 'Research' },
  { key: 'quantum', label: 'Quantum' },
  { key: 'startup', label: 'Startups' },
  { key: 'app', label: 'Mobile Apps' },
  { key: 'web', label: 'Web' },
  { key: 'game', label: 'Games' },
  { key: 'device', label: 'Devices & Hardware' },
  { key: '3d', label: '3D Art' },
  { key: 'open-source', label: 'Open Source' },
]

export type Project = {
  title: string
  description: string
  category: ProjectCategory
  tag: string[]
  imgSrc?: string
  href?: string
}

const projectsData: Project[] = [
  // Not yet publicized.
  // {
  //   title: 'Whodunit Lab',
  //   description: `An instrumented mystery-reading platform for HCI research on trust dynamics. Read classic detective fiction checkpoint by checkpoint, log per-character suspicion and trust, and get a post-mortem of how your beliefs evolved against the ground truth.`,
  //   category: 'research',
  //   tag: ['typescript', 'nextjs', 'sqlite', 'hci', 'llm'],
  //   href: 'https://whodunnit.mcpeblocker.uz',
  // },
  {
    title: 'QAOA for Greenhouse Climate Control',
    description: `Ongoing research study: can the Quantum Approximate Optimization Algorithm serve as the combinatorial solver inside a receding-horizon greenhouse climate controller? QUBO-based scheduling benchmarked against exact and simulated-annealing baselines on real weather data, including hardware-representative noise.`,
    category: 'quantum',
    tag: ['python', 'qiskit', 'qaoa', 'qubo', 'mpc'],
  },
  {
    title: 'QAOA for Rotational Irrigation Scheduling',
    description: `Ongoing research study on moisture-memory coupling in rotational irrigation: a QUBO formulation of the scheduling problem solved with QAOA, benchmarked against classical baselines for precision agriculture.`,
    category: 'quantum',
    tag: ['python', 'qiskit', 'qaoa', 'qubo', 'agriculture'],
  },
  {
    title: 'teambl',
    description: `Trust Based Project Social Network. Focusing on conneting university students with alumni and professionals from various fields to share experiences, advice, and opportunities.`,
    category: 'startup',
    imgSrc: '/static/images/project/teambl-logo.webp',
    tag: ['typescript', 'react-native', 'nextjs', 'python', 'django'],
    href: 'https://play.google.com/store/apps/details?id=com.teambl.teambl&hl=en',
  },
  // Not yet publicized.
  // {
  //   title: 'TezQur',
  //   description: `E-commerce platform for building materials in Uzbekistan — nested product catalog, ordering and delivery-driver management, shipped as a monorepo with web, mobile, landing and admin apps.`,
  //   category: 'startup',
  //   imgSrc: '/static/images/project/tezqur.png',
  //   tag: ['typescript', 'nestjs', 'nextjs', 'react-native', 'postgresql'],
  //   href: 'https://tezqur.uz',
  // },
  {
    title: 'Guardian Angel',
    description: `An AI-powered anti-harassment system for companies designed to detect workplace harassment in real-time using speech recognition and machine learning technologies. GESS 2025 Program Finalist.`,
    category: 'startup',
    imgSrc: '/static/images/project/guardian-angel.png',
    tag: ['python', 'flask', 'whisper', 'vosk', 'react-native', 'kotlin'],
    href: 'https://kgep.kaist.ac.kr/boards/view/board_gess_gallery_en/538',
  },
  // Not yet publicized.
  // {
  //   title: 'Noti Budget',
  //   description: `Android app that turns your banks' notifications into a personal budget — it learns each bank's alert format from a single confirmation, keeps a rolling weekly allowance, and shows a home-screen widget. Fully offline; Play Store release upcoming.`,
  //   category: 'app',
  //   tag: ['kotlin', 'jetpack-compose', 'android'],
  // },
  {
    title: 'BookSwap',
    description: `ebay for books. A platform to facilitate book exchanges among users, promoting reading and sustainability. University course project.`,
    category: 'app',
    imgSrc: '/static/images/project/bookswap.png',
    tag: ['typescript', 'react-native', 'nodejs', 'express', 'aws', 'socket.io', 'mongodb'],
    href: 'https://github.com/mcpeblocker/bookswap-backend/blob/main/README.md',
  },
  // Not yet publicized.
  // {
  //   title: 'Gleamo',
  //   description: `Explore cities like never before — AI-guided missions and interactive adventures that turn any city into a playground.`,
  //   category: 'web',
  //   imgSrc: '/static/images/project/gleamo.png',
  //   tag: ['typescript', 'nextjs', 'ai'],
  //   href: 'https://gleamo.app',
  // },
  // Not yet publicized.
  // {
  //   title: '9rip-fit (Granny Fit)',
  //   description: `A web service for quick physical-fitness self-tests — grip strength and mobility checks that estimate your fitness age, built to screen sarcopenia risk for the elderly.`,
  //   category: 'web',
  //   imgSrc: '/static/images/project/9rip-fit.png',
  //   tag: ['javascript', 'nextjs', 'tailwindcss', 'health'],
  // },
  {
    title: 'Korea 101',
    description: `A comprehensive guidebook for newcomers to Korea, covering essential topics such as accommodation, transportation, cultural norms, and practical tips to help them navigate their new environment with ease. Course project.`,
    category: 'web',
    imgSrc: '/static/images/project/korea101.png',
    tag: ['typescript', 'reactjs', 'nextjs', 'tailwindcss'],
    href: 'https://guidebook.mcpeblocker.uz/',
  },
  // currently inactive.
  // {
  //   title: 'Pockets',
  //   description: `Make it extremely easy for willing people to share expenses transparently and settle them.`,
  //   category: 'web',
  //   imgSrc: '/static/images/project/pockets.png',
  //   tag: ['typescript', 'nextjs', 'tailwindcss', 'supabase'],
  //   href: 'https://pockets.uz',
  // },
  {
    title: 'shashka-uz',
    description: `A beloved online multiplayer game project in which I applied my tech skills each time I learned something new - e.g. React, Node.js, Socket.io, and more.`,
    category: 'game',
    imgSrc: '/static/images/project/shashka.png',
    tag: ['javascript', 'css', 'reactjs', 'nodejs', 'socket.io'],
    href: 'https://shashka.uz',
  },
  {
    title: 'Hello KAISTian',
    description: `An interactive greeter device built on a Raspberry Pi as the team project for KAIST's Introduction to Electronics Design Lab (EE305) course.`,
    category: 'device',
    tag: ['raspberry-pi', 'python', 'electronics'],
  },
  {
    title: 'Sci-Fi Helmet',
    description: `A stylized sci-fi helmet 3D model I modeled and rendered, published on CGTrader.`,
    category: '3d',
    imgSrc: '/static/images/project/scifi-helmet.webp',
    tag: ['3d-modeling'],
    href: 'https://www.cgtrader.com/3d-models/military/armor/sci-fi-helmet-56d22d6d-6e16-451c-a6eb-953205b9e77e',
  },
  {
    title: 'IMB (I Make Bot)',
    description: `A lightweight language compiler and runtime for deploying chatbots for several platforms at once.`,
    category: 'open-source',
    imgSrc: '/static/images/project/imb.png',
    tag: ['rust', 'typescript', 'programming-language', 'chatbot'],
    href: 'https://imb.mcpeblocker.uz',
  },
  {
    title: 'telegraf-pagination',
    description: `An open-source pagination library for Telegraf framework that simplifies the process of creating paginated content in Telegram bots.`,
    category: 'open-source',
    imgSrc: '/static/images/project/telegraf-pagination.png',
    tag: ['typescript', 'nodejs', 'telegraf'],
    href: 'https://npmjs.com/package/telegraf-pagination',
  },
]

export default projectsData
