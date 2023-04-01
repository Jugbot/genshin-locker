import { darkTheme, lightTheme } from '@gl/component-library'
import React from 'react'


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
