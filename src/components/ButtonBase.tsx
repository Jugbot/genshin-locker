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
        color: '$textPrimary',
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
    },
    disabledVisually: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      variant: 'primary',
      disabledVisually: true,
      css: {
        color: '$textDisabled',
        backgroundColor: '$bgActionPrimaryDisabled',
        borderColor: '$bgActionPrimaryDisabled',
      },
    },
  ],
  defaultVariants: {
    disabledVisually: false,
    variant: 'primary',
  },
})
