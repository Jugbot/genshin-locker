import { styled } from '../stitches.config'

import { Box } from './Box'

const StackVertical = styled(Box, {
  display: 'flex',
  flexDirection: 'column',
  gap: '$space2',
})
const StackHorizontal = styled(Box, {
  display: 'flex',
  flexDirection: 'row',
  gap: '$space2',
  alignItems: 'center',
})

export const Stack = {
  Horizontal: StackHorizontal,
  Vertical: StackVertical,
}
