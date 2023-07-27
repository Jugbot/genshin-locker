import { styled } from '@gl/theme'
import {
  PanelGroup,
  PanelResizeHandle,
  Panel as PanelItem,
} from 'react-resizable-panels'

const PanelRoot = styled(PanelGroup, {})
const PanelHandle = styled(PanelResizeHandle, {
  minWidth: '$size2',
  minHeight: '$size2',
  borderRadius: '$radiusMax',
  backgroundColor: '$bgSecondary',
  cursor: 'ns-resize',
  userSelect: 'none',

  '&[data-panel-group-direction="vertical"]': {
    my: '$space2',
  },

  '&[data-panel-group-direction="horizontal"]': {
    mx: '$space2',
  },
})
const PanelPane = styled(PanelItem, {
  display: 'flex',
  gap: '$space2',
})

export const Panel = {
  Root: PanelRoot,
  Handle: PanelHandle,
  Pane: PanelPane,
}
