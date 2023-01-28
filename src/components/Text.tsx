import { styled } from '../stitches.config'

export const Text = styled('p', {
  fontFamily: '$body',
  fontVariantNumeric: 'tabular-nums',
  margin: 0,

  variants: {
    variant: {
      body: {
        fontSize: '$fontSize3',
        letterSpacing: '$letterSpacing0',
        lineHeight: '$lineHeight7',
      },
    },
    color: {
      default: { color: '$textDefault' },
      subdued: { color: '$textSubdued' },
      inverted: { color: '$textInverted' },
      success: { color: '$textSuccess' },
      warning: { color: '$textWarning' },
      critical: { color: '$textCritical' },
      info: { color: '$textInformational' },
    },
    verticalAlignment: {
      default: {},
      center: { display: 'flex', alignItems: 'center' },
    },
  },
  defaultVariants: {
    variant: 'body',
    color: 'default',
    verticalAlignment: 'default'
  },
})
