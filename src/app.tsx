import { createRoot } from 'react-dom/client'
import { Box, Button } from './components'

const App: React.FC = () => {
  return (
    <Box
      css={{ backgroundColor: '$appBackground', position: 'fixed', inset: 0 }}
    >
      <Button onClick={window.actions.routine}>Routine</Button>
    </Box>
  )
}

const container = document.getElementById('app') as HTMLElement
const root = createRoot(container)
root.render(<App />)
