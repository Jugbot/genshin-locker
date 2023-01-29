import * as RadixScrollArea from '@radix-ui/react-scroll-area'

import { styled } from '../stitches.config'

const ScrollAreaRoot = styled(RadixScrollArea.Root, {
  borderRadius: '$radius1',
  padding: '$space2',
  boxSizing: 'border-box',
  overflow: 'hidden',
  backgroundColor: '$bgSecondary',
})

const ScrollAreaViewport = styled(RadixScrollArea.Viewport, {
  width: '100%',
  height: '100%',
  borderRadius: 'inherit',
})

const ScrollAreaScrollbar = styled(RadixScrollArea.ScrollAreaScrollbar, {
  display: 'flex',
  userSelect: 'none',
  touchAction: 'none',
  padding: '$space1',
  transition: 'background 160ms ease-out',
  backgroundColor: '$sandDarkA3',

  "&[data-orientation='vertical']": {
    width: '$size2',
  },
  "&[data-orientation='horizontal']": {
    flexDirection: 'column',
    height: '$size2',
  },
})

const ScrollAreaThumb = styled(RadixScrollArea.ScrollAreaThumb, {
  flex: 1,
  borderRadius: '$radius1',
  position: 'relative',
  backgroundColor: '$layoutHandle',

  '&:hover': {
    backgroundColor: '$layoutHandleHover',
  },
  '&:active': {
    backgroundColor: '$layoutHandlePressed',
  },
})

const ScrollAreaCorner = styled(RadixScrollArea.Corner, {
  backgroundColor: '$sand3',
  opacity: 0.7,
})

export const ScrollArea = {
  Root: ScrollAreaRoot,
  Viewport: ScrollAreaViewport,
  Scrollbar: ScrollAreaScrollbar,
  Thumb: ScrollAreaThumb,
  Corner: ScrollAreaCorner,
}
