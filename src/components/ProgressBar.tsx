import * as Progress from '@radix-ui/react-progress'
import { ComponentProps } from 'react'

import { styled } from '../stitches.config'

const Root = styled(Progress.Root, {
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: '$bgActionPrimary',
  borderRadius: '$radius1',
  height: '$size4',
})

const Indicator = styled(Progress.Indicator, {
  backgroundColor: '$textPrimary',
  width: '100%',
  height: '100%',
  transition: 'transform 660ms cubic-bezier(0.65, 0, 0.35, 1)',
})

export const ProgressBar = (args: ComponentProps<typeof Root>) => {
  const { max = 100, value = 0 } = args

  return (
    <Root {...args}>
      <Indicator style={{ transform: `translateX(-${max - (value ?? 0)}%)` }} />
    </Root>
  )
}
