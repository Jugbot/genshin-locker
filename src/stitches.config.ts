import { createStitches } from '@stitches/react'
import themeDefault from './stitches/theme'
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
