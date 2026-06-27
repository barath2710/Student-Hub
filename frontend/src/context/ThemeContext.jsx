import { createContext, useContext, useState, useEffect, useCallback } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'sh-theme'
const ThemeContext = createContext(null)

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch { /* localStorage unavailable */ }
  // Fall back to OS preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'dark'
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch { /* silently fail */ }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const t = getInitialTheme()
    // Apply immediately (before first render) to avoid flash
    if (typeof document !== 'undefined') applyTheme(t)
    return t
  })

  const setTheme = useCallback((t) => {
    applyTheme(t)
    setThemeState(t)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      return next
    })
  }, [])

  // Keep in sync with OS preference changes (only if user has no saved preference)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) {
          setTheme(e.matches ? 'dark' : 'light')
        }
      } catch { /* ignore */ }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [setTheme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}

export default ThemeContext
