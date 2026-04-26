import { createContext, useContext } from 'react'
import useDarkMode from '../hooks/useDarkMode'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const themeApi = useDarkMode()

  return <ThemeContext.Provider value={themeApi}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider.')
  }

  return context
}
