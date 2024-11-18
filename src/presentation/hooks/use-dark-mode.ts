import { useContext } from 'react'

import { DarkModeContext } from '@/presentation/contexts/dark-mode-context'

export const useDarkMode = () => {
  return useContext(DarkModeContext)
}
