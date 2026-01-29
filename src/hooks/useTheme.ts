// ============================================================================
// ### IMPORTS ###
// ============================================================================
import { useEffect, useSyncExternalStore } from 'react'

// ============================================================================
// ### TYPES ###
// ============================================================================
type Theme = 'light' | 'dark'

// ============================================================================
// ### CONSTANTS ###
// ============================================================================
const STORAGE_KEY = 'md-factory-theme'

// ============================================================================
// ### CUSTOM ###
// ============================================================================
function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY) as Theme | null
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
}

// External store for theme state
let currentTheme: Theme = getStoredTheme() ?? getSystemTheme()
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return currentTheme
}

function setTheme(theme: Theme) {
  currentTheme = theme
  localStorage.setItem(STORAGE_KEY, theme)
  applyTheme(theme)
  listeners.forEach((listener) => listener())
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => 'light')

  // Apply theme on mount and listen for system changes
  useEffect(() => {
    applyTheme(currentTheme)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      // Only auto-update if no stored preference
      if (!getStoredTheme()) {
        setTheme(getSystemTheme())
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return { theme, setTheme, toggleTheme }
}
