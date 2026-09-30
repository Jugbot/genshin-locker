import { styled } from '@gl/theme'

export const TextArea = styled('textarea', {
  padding: '$space3',
  borderRadius: '$radius2',

  border: '1px solid $borderSubtle',
  overflow: 'auto',
  outline: 'none',

  '-webkit-box-shadow': 'none',
  '-moz-box-shadow': 'none',
  'box-shadow': 'none',

  resize: 'none',
  backgroundColor: '$bgSecondary',
  color: '$textDefault',
  fontFamily: '$mono',
  fontSize: '$fontSize1',
  lineHeight: '$lineHeight7',

  '&::placeholder': {
    color: '$textFaint',
  },
})
