import { createRoot } from 'react-dom/client'

const App: React.FC = () => {
  return <h2>Hello from React!</h2>
}

const container = document.getElementById('app')
const root = createRoot(container)
root.render(<App />)
