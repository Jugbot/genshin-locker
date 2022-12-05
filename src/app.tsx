import { createRoot } from 'react-dom/client'

const App: React.FC = () => {
  return (
    <div>
      <button onClick={actions.click}>Click!</button>
      <button onClick={actions.drag}>Drag!</button>
    </div>
  )
}

const container = document.getElementById('app')
const root = createRoot(container)
root.render(<App />)
