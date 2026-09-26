import siteMetadata from '@/data/siteMetadata'
import Link from 'next/link'
import { AiFillLinkedin } from 'react-icons/ai'
import { FaGithub, FaSpotify, FaSteam, FaTwitter } from 'react-icons/fa'
import NowPlaying from './NowPlaying'
import { useViewMode } from './ViewMode'

export default function Footer() {
  const { setMode } = useViewMode()
  return (
    <footer>
      <div className="flex flex-col space-y-6 justify-start py-10 mb-0 space-x-0 text-md text-gray-500 dark:text-gray-400">
        <NowPlaying />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
          <ul className="flex space-x-2">
            <li>{`© ${new Date().getFullYear()}`}</li>
            <li>{` • `}</li>
            <li>
              <Link href="/" legacyBehavior>
                {siteMetadata.title}
              </Link>
            </li>
            <li>{` • `}</li>
            <li>
              <button
                type="button"
                onClick={() => setMode('simple')}
                className="underline-offset-4 hover:text-gray-900 hover:underline dark:hover:text-gray-100"
              >
                Simple view
              </button>
            </li>
          </ul>
          <ul className="flex space-x-5 items-center cursor-pointer">
            <li>
              <a
                href={siteMetadata.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="linkedin"
              >
                <AiFillLinkedin size={20} />
              </a>
            </li>
            <li>
              <a href={siteMetadata.github} target="_blank" rel="noreferrer" aria-label="github">
                <FaGithub size={20} />
              </a>
            </li>
            <li>
              <a href={siteMetadata.twitter} target="_blank" rel="noreferrer" aria-label="twitter">
                <FaTwitter size={20} />
              </a>
            </li>
            <li>
              <a href={siteMetadata.spotify} target="_blank" rel="noreferrer" aria-label="spotify">
                <FaSpotify size={20} />
              </a>
            </li>
            <li>
              <a href={siteMetadata.steam} target="_blank" rel="noreferrer" aria-label="steam">
                <FaSteam size={20} />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
