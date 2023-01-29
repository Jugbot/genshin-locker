import { globalCss } from './stitches.config'

const scrollbarCss = {
  '::-webkit-scrollbar': {
    width: '$size4',
  },

  '::-webkit-scrollbar-thumb': {
    boxShadow: 'inset 0 0 0 999px $colors$layoutHandle',
    border: 'solid $space$space1 transparent',
    borderRadius: '$radiusMax',
  },

  '::-webkit-scrollbar-thumb:hover': {
    boxShadow: 'inset 0 0 0 999px $colors$layoutHandleHover',
  },

  '::-webkit-scrollbar-thumb:active': {
    boxShadow: 'inset 0 0 0 999px $colors$layoutHandlePressed',
  },

  '::-webkit-scrollbar-button': {
    display: 'none',
  },
} as const

export const loadGlobalStyles = globalCss(scrollbarCss)
