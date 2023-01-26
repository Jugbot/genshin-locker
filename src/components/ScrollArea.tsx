import * as RadixScrollArea from '@radix-ui/react-scroll-area'
import React, { ComponentProps } from 'react'

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
  padding: '2px',
  transition: 'background 160ms ease-out',
  backgroundColor: '$sand3',
  opacity: 0.7,

  '&:hover': {
    backgroundColor: '$sand3',
    opacity: 0.9,
  },
  "&[data-orientation='vertical']": {
    width: '$scrollbarSize',
  },
  "&[data-orientation='horizontal']": {
    flexDirection: 'column',
    height: '$scrollbarSize',
  },
})

const ScrollAreaThumb = styled(RadixScrollArea.ScrollAreaThumb, {
  flex: 1,
  backgroundColor: '$sand9',
  borderRadius: '$radius1',
  position: 'relative',
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

export const StandardScrollArea = ({
  children,
  ...props
}: ComponentProps<typeof ScrollArea.Root>) => {
  return (
    <ScrollArea.Root {...props}>
      <ScrollArea.Viewport>{children}</ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
      <ScrollArea.Scrollbar orientation="horizontal">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner />
    </ScrollArea.Root>
  )
}
