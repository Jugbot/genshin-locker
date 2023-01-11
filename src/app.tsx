import { createRoot } from 'react-dom/client'
import { Box, Button, Heading, Separator, Text } from './components'
import { SunIcon } from '@radix-ui/react-icons'

const App: React.FC = () => {
  return (
    <Box
      css={{
        backgroundColor: '$appBackground',
        position: 'fixed',
        inset: 0,
        color: '$textDefault',
      }}
    >
      <Button
        size="large"
        onClick={window.actions.routine}
        css={{ mr: '$space1' }}
      >
        Routine
      </Button>
      <Button icon>
        <SunIcon />
      </Button>
      <Separator />
      <Heading>Heading</Heading>
      <Text>Text</Text>
    </Box>
  )
}

const container = document.getElementById('app') as HTMLElement
const root = createRoot(container)
root.render(<App />)
