import { styled } from '@gl/theme'

import { ButtonBase } from './ButtonBase'

export const Button = styled(ButtonBase, {
  borderRadius: '$radius1',

  variants: {
    size: {
      text: {
        py: '$space1',
        px: '$space2',
        borderRadius: 0,
        justifyContent: 'space-between',
      },
      small: {
        minHeight: '$size8',
        py: '$space1',
        px: '$space4',
        fontSize: '$fontSize2',
      },
      medium: {
        minHeight: '$size10',
        py: '$space1',
        px: '$space6',
        fontSize: '$fontSize3',
      },
      large: {
        minHeight: '$size11',
        py: '$space1',
        px: '$space6',
        fontSize: '$fontSize4',
      },
    },
  },
  defaultVariants: {
    size: 'medium',
  },
})
