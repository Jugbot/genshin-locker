import { styled } from '@gl/theme'

export const ButtonBase = styled('button', {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  verticalAlign: 'middle',
  justifyContent: 'center',
  textAlign: 'center',
  gap: '$space1',
  cursor: 'pointer',
  userSelect: 'none',
  fontWeight: '$bold',
  lineHeight: '$lineHeight7',
  borderStyle: 'solid',
  borderWidth: 0,
  outline: 'none',
  backgroundColor: 'transparent',
  appearance: 'none',
  textDecoration: 'none',
  textTransform: 'capitalize',
  focusVisible: '$focus',

  '&:disabled': {
    cursor: 'not-allowed',
  },

  variants: {
    variant: {
      primary: {
        color: '$textActionPrimary',
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
        color: '$textActionSubdued',
        backgroundColor: '$bgActionSubdued',
        borderColor: '$bgActionSubdued',
        '&:hover:not([disabled]):not(:active)': {
          backgroundColor: '$bgActionSubduedHover',
          borderColor: '$bgActionSubduedHover',
        },
        '&:active:not([disabled])': {
          backgroundColor: '$bgActionSubduedPressed',
          borderColor: '$bgActionSubduedPressed',
        },
      },
      transparent: {
        color: '$textActionTransparent',
        backgroundColor: '$bgActionTransparent',
        borderColor: '$bgActionTransparent',
        '&:hover:not([disabled]):not(:active)': {
          backgroundColor: '$bgActionTransparentHover',
          borderColor: '$bgActionTransparentHover',
        },
        '&:active:not([disabled])': {
          backgroundColor: '$bgActionTransparentPressed',
          borderColor: '$bgActionTransparentPressed',
        },
      },
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
})
