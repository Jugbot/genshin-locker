import type { ElectronHandler } from './preload'

interface RendererWindow extends Window {
  electron: ElectronHandler
}

declare let window: RendererWindow

export const api = window.electron
