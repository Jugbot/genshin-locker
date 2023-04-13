import { styled } from '@gl/theme'

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
})
