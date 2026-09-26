// Things a post can @mention. `@KAIST` in a post becomes a link to /at/kaist,
// and /at/kaist lists everything on the site connected to it (CV entries,
// the project, activities, and every post that mentions it).
//
// Handles are matched case-insensitively: `id` plus any `aliases`.
// `project` is the title of the matching entry in projectsData, if any.

export type EntityKind = 'organization' | 'project'

export type Entity = {
  id: string // URL slug and default @handle
  name: string
  kind: EntityKind
  aliases?: string[]
  description?: string
  href?: string // official website
  project?: string
}

const entities: Entity[] = [
  // Organizations
  {
    id: 'kaist',
    name: 'KAIST',
    kind: 'organization',
    description:
      'Korea Advanced Institute of Science and Technology, Daejeon. B.S. in Computer Science & Electrical Engineering.',
    href: 'https://kaist.ac.kr/en/',
  },
  {
    id: 'epfl',
    name: 'EPFL',
    kind: 'organization',
    description: 'École Polytechnique Fédérale de Lausanne. Exchange semester, Autumn 2026.',
    href: 'https://www.epfl.ch',
  },
  {
    id: 'psk',
    name: 'Presidential School in Khiva',
    kind: 'organization',
    aliases: ['PresidentialSchool', 'Khiva'],
    description: 'High school in Khiva, Uzbekistan. Cambridge International A Levels.',
    href: 'https://portal.piima.uz/en/schools/presidental-schools/4',
  },
  {
    id: 'onsquare',
    name: 'OnSquare',
    kind: 'organization',
    description: 'Software company in Seoul, South Korea.',
    href: 'https://o-n2.com',
  },
  {
    id: 'cstl',
    name: 'Collaborative Social Technologies Lab',
    kind: 'organization',
    aliases: ['CSTLab'],
    description: 'HCI research lab at KAIST.',
    href: 'https://cstlab.org/',
  },
  {
    id: 'genorobotics',
    name: 'GenoRobotics',
    kind: 'organization',
    description:
      'EPFL MAKE project building a modular biodiversity monitoring system: remote sensing, local sensing and eDNA analysis for scientists and conservationists.',
    href: 'https://make.epfl.ch/projects/14/make-genorobotics-14',
  },
  {
    id: 'mit',
    name: 'MIT',
    kind: 'organization',
    description: 'Massachusetts Institute of Technology.',
    href: 'https://www.mit.edu',
  },
  {
    id: 'ibm',
    name: 'IBM Quantum',
    kind: 'organization',
    aliases: ['IBMQuantum'],
    href: 'https://www.ibm.com/quantum',
  },

  // Projects (and startups)
  {
    id: 'teambl',
    name: 'Teambl',
    kind: 'project',
    description: 'Trust-based networking platform for university students in South Korea.',
    href: 'https://teambl.net',
    project: 'teambl',
  },
  {
    id: 'looina',
    name: 'Looina',
    kind: 'project',
    description: 'Browser-based operating system for custom user workflows.',
  },
  { id: 'tezqur', name: 'TezQur', kind: 'project', href: 'https://tezqur.uz', project: 'TezQur' },
  {
    id: 'biodiversity',
    name: 'Acoustic Biodiversity Monitoring',
    kind: 'project',
    aliases: ['AcousticBiodiversity', 'BiodiversityMonitoring'],
    project: 'Acoustic Biodiversity Monitoring',
  },
  {
    id: 'amuflow',
    name: 'AmuFlow',
    kind: 'project',
    href: 'https://amuflow.org',
    project: 'AmuFlow',
  },
  { id: 'gleamo', name: 'Gleamo', kind: 'project', href: 'https://gleamo.app', project: 'Gleamo' },
  {
    id: 'guardianangel',
    name: 'Guardian Angel',
    kind: 'project',
    aliases: ['GuardianAngel'],
    project: 'Guardian Angel',
  },
  { id: 'bookswap', name: 'BookSwap', kind: 'project', project: 'BookSwap' },
  { id: 'korea101', name: 'Korea 101', kind: 'project', project: 'Korea 101' },
  {
    id: 'shashka',
    name: 'shashka.uz',
    kind: 'project',
    href: 'https://shashka.uz',
    project: 'shashka-uz',
  },
  {
    id: 'imb',
    name: 'IMB (I Make Bot)',
    kind: 'project',
    aliases: ['IMB'],
    href: 'https://imb.mcpeblocker.uz',
    project: 'IMB (I Make Bot)',
  },
]

/** The handle to insert for an entity: its name if it's typeable as a handle, else an alias or id. */
export const handleOf = (e: Entity) =>
  [e.name, ...(e.aliases ?? []), e.id].find((h) => /^[A-Za-z]\w*$/.test(h)) ?? e.id

export default entities
