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
    width: '$size4',
  },

  '&::-webkit-scrollbar-thumb': {
    boxShadow: 'inset 0 0 0 999px $colors$layoutHandle',
    border: 'solid $space$space1 transparent',
    borderRadius: '$radiusMax',
  },

  '&::-webkit-scrollbar-thumb:hover': {
    boxShadow: 'inset 0 0 0 999px $colors$layoutHandleHover',
  },

  '&::-webkit-scrollbar-thumb:active': {
    boxShadow: 'inset 0 0 0 999px $colors$layoutHandlePressed',
  },

  '&::-webkit-scrollbar-button': {
    display: 'none',
  },
})
