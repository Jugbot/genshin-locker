import { createStitches } from '@stitches/react'

import themeDefault, { dark, light } from './stitches/theme'
import utils from './stitches/utils'

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config,
} = createStitches({
  theme: themeDefault,
  utils,
})

export const darkTheme = createTheme('dark', dark)
export const lightTheme = createTheme('light', light)
