import {
  createStitches,
  defaultThemeMap,
  CSS as UntypedCSS,
} from '@stitches/react'

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
  themeMap: {
    ...defaultThemeMap,
    animation: 'animations',
  },
})

export type CSS = UntypedCSS<typeof config>

export const darkTheme = createTheme('dark', dark)
export const lightTheme = createTheme('light', light)
