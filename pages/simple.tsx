import { useViewMode } from '@/components/ViewMode'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Simple() {
  const { setMode } = useViewMode()
  const router = useRouter()

  useEffect(() => {
    setMode('simple')
    router.replace('/')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
