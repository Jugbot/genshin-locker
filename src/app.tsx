import { createRoot } from 'react-dom/client'

const App: React.FC = () => {
  return (
    <div style={{ display: 'flex' }}>
      <button onClick={() => setTimeout((window as any).actions.click, 2000)}>
        Click!
      </button>
      <button onClick={() => setTimeout((window as any).actions.drag, 2000)}>
        Drag!
      </button>
      <button onClick={() => setTimeout((window as any).actions.scroll, 2000)}>
        Scroll!
      </button>
    </div>
  )
}

const container = document.getElementById('app')
const root = createRoot(container)
root.render(<App />)
