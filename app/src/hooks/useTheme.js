import { useEffect, useState } from 'react'

const STORAGE_KEY = 'mfp-theme' // 'light' | 'dark' | absent = suit le système

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEY) || 'system')

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      root.removeAttribute('data-theme')
      localStorage.removeItem(STORAGE_KEY)
    } else {
      root.setAttribute('data-theme', theme)
      localStorage.setItem(STORAGE_KEY, theme)
    }
  }, [theme])

  function toggle() {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const currentlyDark = theme === 'dark' || (theme === 'system' && systemPrefersDark)
    setTheme(currentlyDark ? 'light' : 'dark')
  }

  return { theme, toggle }
}
