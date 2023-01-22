import { ImageIcon, PlayIcon } from '@radix-ui/react-icons'
import { createRoot } from 'react-dom/client'

import {
  Box,
  Button,
  ButtonIcon,
  Heading,
  MenuBar,
  ProgressBar,
  Separator,
  StandardScrollArea,
  Text,
  TextArea,
} from './components'

const App: React.FC = () => {
  return (
    <Box
      css={{
        backgroundColor: '$appBackground',
        position: 'fixed',
        inset: 0,
        color: '$textDefault',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <MenuBar.Root
        css={{
          width: 'env(titlebar-area-width)',
          height: 'env(titlebar-area-height)',
          boxSizing: 'border-box',
        }}
      >
        <ImageIcon />
      </MenuBar.Root>
      <Box
        css={{
          padding: '$space2 $space6',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <Box
          css={{
            flex: 1,
            display: 'flex',
            mb: '$space1',
            position: 'relative',
            minHeight: 0,
            maxHeight: '100%',
          }}
        >
          <Box css={{ flexGrow: 0, mr: '$space2' }}>
            <Button
              size="large"
              onClick={window.actions.routine}
              css={{ mr: '$space1' }}
            >
              Routine
            </Button>
            <Separator />
            <Heading>Heading</Heading>
            <Text>Text</Text>
          </Box>
          <StandardScrollArea
            css={{ flexGrow: 1, height: '100%' }}
          ></StandardScrollArea>
        </Box>
        <Box css={{ flex: 0, flexBasis: 'min-content' }}>
          <Box css={{ mb: '$space2', display: 'flex', alignItems: 'center' }}>
            <Text css={{ mr: '$space2' }}>Hi</Text>
            <ButtonIcon size="small" css={{ mr: '$space2' }}>
              <PlayIcon />
            </ButtonIcon>
            <ProgressBar value={65} max={70} css={{ flexGrow: 1 }} />
          </Box>
          <TextArea value="hello" rows={5} readOnly css={{ width: '100%' }} />
        </Box>
      </Box>
    </Box>
  )
}

const container = document.getElementById('app') as HTMLElement
const root = createRoot(container)
root.render(<App />)
