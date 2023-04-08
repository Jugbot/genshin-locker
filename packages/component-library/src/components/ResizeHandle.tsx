import * as React from 'react'

import { styled } from '../stitches.config'

const ResizeBar = styled('div', {
  minWidth: '$size2',
  minHeight: '$size2',
  borderRadius: '$radiusMax',
  backgroundColor: '$bgSecondary',
  cursor: 'ns-resize',
  userSelect: 'none',
})

interface ResizeHandleProps extends React.ComponentProps<typeof ResizeBar> {
  orientation: 'vertical' | 'horizontal'
  onHandleDrag: (mouseDelta: number) => void
}

export const ResizeHandle = ({
  orientation,
  onHandleDrag,
  ...props
}: ResizeHandleProps) => {
  const { css, ...otherProps } = props

  const [drageState, setDragState] = React.useState(false)

  React.useEffect(() => {
    if (drageState) {
      document.body.style.cursor = 'grab'
    } else {
      document.body.style.cursor = ''
    }
  }, [drageState])

  React.useEffect(() => {
    if (!drageState) {
      return
    }

    function onMouseMove(e: MouseEvent) {
      onHandleDrag(orientation === 'horizontal' ? e.movementY : e.movementX)
    }
    function onMouseUp() {
      setDragState(false)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [drageState, onHandleDrag, orientation])

  return (
    <ResizeBar
      {...otherProps}
      css={{
        width: orientation === 'horizontal' ? '100%' : undefined,
        height: orientation === 'vertical' ? '100%' : undefined,
        ...css,
      }}
      onMouseDown={() => setDragState(true)}
    />
  )
}
