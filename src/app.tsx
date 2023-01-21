import { PlayIcon } from '@radix-ui/react-icons'
import { createRoot } from 'react-dom/client'

import {
  Box,
  Button,
  ButtonIcon,
  Heading,
  ProgressBar,
  Separator,
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
        padding: '$space2 $space6',
      }}
    >
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
      <Box css={{ bottom: 0, width: '100%' }}>
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
  )
}

const container = document.getElementById('app') as HTMLElement
const root = createRoot(container)
root.render(<App />)
