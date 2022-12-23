import * as RadixSeparator from '@radix-ui/react-separator'
import { styled } from '../stitches.config'

export const Separator = styled(RadixSeparator.Root, {
  backgroundColor: '$textDefault',
  "&[data-orientation='vertical']": {
    mx: '$space2',
    height: '100%',
    width: '$borderWidths$borderWidth1',
  },
  "&[data-orientation='horizontal']": {
    my: '$space2',
    width: '100%',
    height: '$borderWidths$borderWidth1',
  },
})
