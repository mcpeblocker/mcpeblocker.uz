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
    description: `Here is`,
    title: `what I've been up to`,
    image: {
      src: '/static/images/aphex-apps.png',
      width: 600,
      height: 770,
    },
  },
  {
    description: 'I helped build',
    title: 'shashka.uz',
    image: {
      src: '/static/images/project/shashka.png',
      width: 700,
      height: 380,
    },
  },
]
