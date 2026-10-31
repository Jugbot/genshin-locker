import { darkTheme, lightTheme } from '@gl/theme'
import * as React from 'react'

type Theme = 'light' | 'dark'
const themeClassMap = {
  dark: darkTheme.className,
  light: lightTheme.className,
}

export const useThemeClass = () => {
  const [theme, setTheme] = React.useState<Theme>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  )

  React.useEffect(() => {
    const listener = (event: MediaQueryListEvent) => {
      const newTheme = event.matches ? 'dark' : 'light'
      setTheme(newTheme)
    }
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', listener)
    return () => {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', listener)
    }
  })

  return themeClassMap[theme]
}

// useState that is restored from localStorage on the next launch
export const usePersistentState = <T>(
  key: string,
  initial: T,
  isValid: (value: unknown) => boolean = () => true
) => {
  const [value, setValue] = React.useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) {
        const parsed: unknown = JSON.parse(stored)
        if (isValid(parsed)) {
          return parsed as T
        }
      }
    } catch {
      // Fall back to the initial value
    }
    return initial
  })

  React.useEffect(() => {
    if (value === undefined) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }, [key, value])

  return [value, setValue] as const
}
