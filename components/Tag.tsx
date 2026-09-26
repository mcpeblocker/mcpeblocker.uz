import kebabCase from '@/lib/utils/kebabCase'
import Link from 'next/link'

interface Props {
  text: string
  accent?: boolean // the category tag: drawn in the post's accent colour
}

const Tag = ({ text, accent = false }: Props) => {
  return (
    <Link
      href={`/tags/${kebabCase(text)}`}
      className={`rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide duration-300 ${
        accent
          ? 'border-primary-500 text-primary-700 dark:text-primary-300'
          : 'border-gray-300 text-gray-600 hover:border-primary-500 hover:text-primary-600 dark:border-gray-700 dark:text-gray-400 dark:hover:text-primary-300'
      }`}
    >
      {text.split(' ').join('-')}
    </Link>
  )
}

export default Tag
