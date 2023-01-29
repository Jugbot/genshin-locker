import { styled } from '../stitches.config'

export const ButtonBase = styled('button', {
  fontWeight: '$bold',
  lineHeight: '$lineHeight7',
  borderStyle: 'solid',
  borderWidth: '$borderWidth1',
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  verticalAlign: 'middle',
  justifyContent: 'center',
  textAlign: 'center',
  cursor: 'pointer',
  outline: 'none',
  userSelect: 'none',
  backgroundColor: 'transparent',
  appearance: 'none',
  textDecoration: 'none',

  focusVisible: '$focus',

  '&:disabled': {
    cursor: 'not-allowed',
  },

  variants: {
    variant: {
      primary: {
        color: '$textInverted',
        backgroundColor: '$bgActionPrimary',
        borderColor: '$bgActionPrimary',
        '&:hover:not([disabled]):not(:active)': {
          backgroundColor: '$bgActionPrimaryHover',
          borderColor: '$bgActionPrimaryHover',
        },
        '&:active:not([disabled])': {
          backgroundColor: '$bgActionPrimaryPressed',
          borderColor: '$bgActionPrimaryPressed',
        },
      },
      subdued: {
        color: '$textDefault',
        backgroundColor: '$bgSubduedPrimary',
        borderColor: '$bgSubduedPrimary',
        '&:hover:not([disabled]):not(:active)': {
          backgroundColor: '$bgSubduedPrimaryHover',
          borderColor: '$bgSubduedPrimaryHover',
        },
        '&:active:not([disabled])': {
          backgroundColor: '$bgSubduedPrimaryPressed',
          borderColor: '$bgSubduedPrimaryPressed',
        },
      },
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
})
