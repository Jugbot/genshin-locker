import { styled } from '@gl/theme'
import {
  PanelGroup,
  PanelResizeHandle,
  Panel as PanelItem,
} from 'react-resizable-panels'

const PanelRoot = styled(PanelGroup, {})
const PanelHandle = styled(PanelResizeHandle, {
  position: 'relative',
  minWidth: '$size2',
  minHeight: '$size2',
  userSelect: 'none',
  outline: 'none',

  // The grip is only visual; the whole handle stays draggable
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '$radiusMax',
    backgroundColor: '$layoutHandle',
    transition: 'background-color 120ms ease-out',
  },
  '&:hover::after, &[data-resize-handle-active]::after': {
    backgroundColor: '$layoutHandleHover',
  },
  '&[data-resize-handle-active]::after': {
    backgroundColor: '$layoutHandlePressed',
  },

  '&[data-panel-group-direction="vertical"]': {
    cursor: 'ns-resize',
    '&::after': { width: '$size10', height: '$size1' },
  },

  '&[data-panel-group-direction="horizontal"]': {
    cursor: 'ew-resize',
    '&::after': { width: '$size1', height: '$size10' },
  },
})
const PanelPane = styled(PanelItem, {
  display: 'flex',
  gap: '$space2',
  // Room for focus rings, since panels force `overflow: hidden`
  padding: '$space1',
})

export const Panel = {
  Root: PanelRoot,
  Handle: PanelHandle,
  Pane: PanelPane,
}
