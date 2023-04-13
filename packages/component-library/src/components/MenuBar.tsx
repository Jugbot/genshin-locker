import { styled } from '@gl/theme'
import * as RadixMenuBar from '@radix-ui/react-menubar'

const MenuBarRoot = styled(RadixMenuBar.Root, {
  '-webkit-app-region': 'drag',
  display: 'flex',
  backgroundColor: '$menubarBackground',
  color: '$menubarColor',
  padding: '$space2',
  width: '100%',
})

export const MenuBar = {
  Root: MenuBarRoot,
}
