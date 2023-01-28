import {
  IpcMainInvokeEvent,
  IpcRendererEvent,
  // eslint-disable-next-line no-restricted-imports
  ipcMain,
  // eslint-disable-next-line no-restricted-imports
  ipcRenderer,
} from 'electron'

import { MainAPI, RendererAPI } from './apiTypes'

export const rendererApi: RendererAPI = {
  invoke(channel, ...args) {
    return ipcRenderer.invoke(channel, ...args)
  },
  on(channel, listener) {
    const subscription = (
      _event: IpcRendererEvent,
      ...args: Parameters<typeof listener>
    ) => listener(...args)
    ipcRenderer.on(channel, subscription)

    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },
}

export const mainApi: MainAPI = {
  send(webContents, channel, ...args) {
    return webContents.send(channel, ...args)
  },
  handle(channel, listener) {
    const subscription = (
      _event: IpcMainInvokeEvent,
      ...args: Parameters<typeof listener>
    ): ReturnType<typeof listener> => listener(...args)
    ipcMain.handle(channel, subscription)

    return () => {
      ipcMain.removeListener(channel, subscription)
    }
  },
}
