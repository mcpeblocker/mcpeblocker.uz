import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

export type ViewMode = 'default' | 'simple'

const STORAGE_KEY = 'view-mode'

const ViewModeContext = createContext<{
  mode: ViewMode
  setMode: (mode: ViewMode) => void
}>({ mode: 'default', setMode: () => undefined })

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ViewMode>('default')

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === 'simple') setModeState('simple')
  }, [])

  const setMode = (m: ViewMode) => {
    setModeState(m)
    localStorage.setItem(STORAGE_KEY, m)
  }

  return <ViewModeContext.Provider value={{ mode, setMode }}>{children}</ViewModeContext.Provider>
}

export const useViewMode = () => useContext(ViewModeContext)
