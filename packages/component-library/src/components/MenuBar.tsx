import { styled } from '@gl/theme'
import * as RadixMenuBar from '@radix-ui/react-menubar'

const MenuBarRoot = styled(RadixMenuBar.Root, {
  '-webkit-app-region': 'drag',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '$menubarBackground',
  color: '$menubarColor',
  px: '$space3',
  width: '100%',
})

export const MenuBar = {
  Root: MenuBarRoot,
}
