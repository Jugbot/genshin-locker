import { CSS, styled } from '@gl/theme'
import * as Progress from '@radix-ui/react-progress'
import { ComponentProps } from 'react'

import { Box } from './Box'
import { Text } from './Text'

const Root = styled(Progress.Root, {
  position: 'relative',
  overflow: 'hidden',
  flexGrow: 1,
  backgroundColor: '$bgActionSubdued',
  boxShadow: 'inset 0 0 0 1px $colors$borderSubtle',
  borderRadius: '$radiusMax',
  height: '$size2',
})

// Sized by width, not translateX: a translated bar leaves a sliver of color
// at 0%
const Indicator = styled(Progress.Indicator, {
  backgroundColor: '$bgActionPrimary',
  borderRadius: 'inherit',
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  transition: 'width 660ms cubic-bezier(0.65, 0, 0.35, 1)',
})

type ProgressBarProps = ComponentProps<typeof Root> & { css?: CSS }

export const ProgressBar = ({ css, ...args }: ProgressBarProps) => {
  const { max = 100, value = 0 } = args

  const clampedValue = Math.max(0, Math.min(value ?? 0, max))
  const percentComplete = max > 0 ? (clampedValue / max) * 100 : 0
  const showLabel = args.max !== undefined && args.value !== undefined

  return (
    <Box
      css={{
        display: 'flex',
        alignItems: 'center',
        gap: '$space3',
        minWidth: 0,
        ...css,
      }}
    >
      <Root {...args}>
        <Indicator style={{ width: `${percentComplete}%` }} />
      </Root>
      {showLabel && (
        <Text
          as="span"
          color="subdued"
          css={{ fontSize: '$fontSize2', whiteSpace: 'nowrap' }}
        >
          {value} / {max}
        </Text>
      )}
    </Box>
  )
}
