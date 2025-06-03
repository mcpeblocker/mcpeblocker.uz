export type WorkTile = {
  title: string
  description: string
  image: {
    src: string
    width: number
    height: number
  }
}

export const workTiles: WorkTile[] = [
  {
    description: `Here is what I've been`,
    title: `experimenting with`,
    image: {
      src: '/static/images/bluescreen.avif',
      width: 1920,
      height: 1080,
    },
  },
  {
    description: "I'm regularly evolving my beloved",
    title: 'shashka-uz',
    image: {
      src: '/static/images/project/shashka.png',
      width: 700,
      height: 380,
    },
  },
  {
    description: "I'm learning within",
    title: 'the startup world',
    image: {
      src: '/static/images/project/guardian-angel.png',
      width: 700,
      height: 380,
    },
  },
  {
    description: "I'm contributing to",
    title: 'teambl',
    image: {
      src: '/static/images/project/teambl.webp',
      width: 500,
      height: 1024,
    },
  },
]
