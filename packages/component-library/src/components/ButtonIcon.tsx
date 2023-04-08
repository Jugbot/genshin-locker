import { styled } from '@gl/theme'

import { ButtonBase } from './ButtonBase'

export const ButtonIcon = styled(ButtonBase, {
  borderRadius: '$radiusMax',

  variants: {
    size: {
      small: {
        width: '$size8',
        height: '$size8',
        padding: '$space1',
        fontSize: '$fontSize2',
      },
      medium: {
        width: '$size10',
        height: '$size10',
        padding: '$space1',
        fontSize: '$fontSize3',
      },
      large: {
        width: '$size11',
        height: '$size11',
        padding: '$space1',
        fontSize: '$fontSize4',
      },
    },
  },
  defaultVariants: {
    size: 'medium',
  },
})
