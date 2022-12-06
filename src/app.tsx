import { createRoot } from 'react-dom/client'

const App: React.FC = () => {
  return (
    <div>
      <button onClick={() => setTimeout((window as any).actions.click, 2000)}>
        Click!
      </button>
      <button onClick={() => setTimeout((window as any).actions.drag, 2000)}>
        Drag!
      </button>
    </div>
  )
}

const container = document.getElementById('app')
const root = createRoot(container)
root.render(<App />)
