import { styled } from '../stitches.config'

export const TextArea = styled('textarea', {
  padding: '$space2',
  borderRadius: '$radius1',

  border: 'none',
  overflow: 'auto',
  outline: 'none',

  '-webkit-box-shadow': 'none',
  '-moz-box-shadow': 'none',
  'box-shadow': 'none',

  resize: 'none',
  backgroundColor: '$bgSecondary',
  color: '$textDefault',

  '&::-webkit-scrollbar': {
    width: '$size3',
  },

  '&::-webkit-scrollbar-thumb': {
    boxShadow: 'inset 0 0 0 999px $colors$sand8',
    border: 'solid 2px transparent',
    borderRadius: '$radiusMax',
  },

  '&::-webkit-scrollbar-thumb:hover': {
    boxShadow: 'inset 0 0 0 999px $colors$sand9',
  },

  '&::-webkit-scrollbar-button': {
    display: 'none',
  },
})
