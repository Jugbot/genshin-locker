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
  fontFamily: '$body',
  borderStyle: 'solid',
  borderWidth: '$borderWidth1',
  outline: 'none',
  backgroundColor: 'transparent',
  appearance: 'none',
  textDecoration: 'none',
  textTransform: 'capitalize',
  whiteSpace: 'nowrap',
  transition:
    'background-color 120ms ease-out, border-color 120ms ease-out, color 120ms ease-out',

  // Offset so the ring stays visible on accent-colored buttons
  '&:focus-visible': {
    outline: '2px solid $colors$focusRing',
    outlineOffset: '2px',
  },

  '&:disabled': {
    cursor: 'not-allowed',
    opacity: 0.5,
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
        borderColor: '$borderDefault',
        '&:hover:not([disabled]):not(:active)': {
          backgroundColor: '$bgActionSubduedHover',
          borderColor: '$borderHover',
        },
        '&:active:not([disabled])': {
          backgroundColor: '$bgActionSubduedPressed',
          borderColor: '$borderHover',
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
