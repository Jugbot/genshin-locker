import * as Progress from '@radix-ui/react-progress'
import { ComponentProps } from 'react'

import { styled } from '../stitches.config'

import { Box } from './Box'
import { Heading } from './Heading'

const Root = styled(Progress.Root, {
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: '$bgActionPrimary',
  borderRadius: '$radius1',
  height: '$size4',
})

const Indicator = styled(Progress.Indicator, {
  backgroundColor: '$textPrimary',
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  transition: 'transform 660ms cubic-bezier(0.65, 0, 0.35, 1)',
})

export const ProgressBar = (args: ComponentProps<typeof Root>) => {
  const { max = 100, value = 0 } = args

  const clampedValue = Math.max(0, Math.min(value ?? 0, max))
  const percentRemaining = ((max - clampedValue) / max) * 100
  const showLabel = args.max !== undefined && args.value !== undefined

  return (
    <Root {...args}>
      <Indicator style={{ transform: `translateX(-${percentRemaining}%)` }} />
      <Heading
        as="div"
        variant="subheading"
        css={{
          visibility: showLabel ? 'visible' : 'hidden',
          color: '$textPrimary',
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mixBlendMode: 'difference',
        }}
      >
        <Box as="span" css={{ flex: '1 0 0', textAlign: 'right' }}>
          {value}
        </Box>
        &nbsp;/&nbsp;
        <Box as="span" css={{ flex: '1 0 0', textAlign: 'left' }}>
          {max}
        </Box>
      </Heading>
    </Root>
  )
}
