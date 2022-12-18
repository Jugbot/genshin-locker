import { styled } from '../stitches.config'

export const Heading = styled('h1', {
  margin: '$space0',
  fontWeight: '$bold',
  fontVariantNumeric: 'tabular-nums',
  variants: {
    variant: {
      page: {
        fontFamily: '$display',
        fontSize: '$fontSize7',
        lineHeight: '$lineHeight2',
      },
      xl: {
        fontFamily: '$display',
        fontSize: '$fontSize6',
        lineHeight: '$lineHeight3',
      },
      lg: {
        fontFamily: '$display',
        fontSize: '$fontSize5',
        lineHeight: '$lineHeight4',
      },
      md: {
        fontFamily: '$body',
        fontSize: '$fontSize4',
        lineHeight: '$lineHeight5',
      },
      sm: {
        fontFamily: '$body',
        fontSize: '$fontSize3',
        lineHeight: '$lineHeight7',
      },
      subheading: {
        fontFamily: '$body',
        fontSize: '$fontSize1',
        lineHeight: '$lineHeight4',
        textTransform: 'uppercase',
        letterSpacing: '$letterSpacing1',
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
  },
  defaultVariants: {
    variant: 'page',
  },
})
