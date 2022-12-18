import { createRoot } from 'react-dom/client'
import { Box, Button, Heading, Separator, Text } from './components'
import { FaceIcon, ImageIcon, SunIcon } from '@radix-ui/react-icons'

const App: React.FC = () => {
  return (
    <Box
      css={{ backgroundColor: '$appBackground', position: 'fixed', inset: 0, color: '$textDefault' }}
    >
      <Button onClick={window.actions.routine}>Routine</Button>
      <Button><SunIcon/></Button>
      <Separator />
      <Heading>Heading</Heading>
      <Text>Text</Text>
    </Box>
  )
}

const container = document.getElementById('app') as HTMLElement
const root = createRoot(container)
root.render(<App />)
