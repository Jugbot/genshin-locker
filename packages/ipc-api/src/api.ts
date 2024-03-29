import {
  IpcMainInvokeEvent,
  IpcRendererEvent,
  // eslint-disable-next-line no-restricted-imports
  ipcMain,
  // eslint-disable-next-line no-restricted-imports
  ipcRenderer,
} from 'electron'

import { MainAPI, RendererAPI } from '@gl/types'

export const rendererApi: RendererAPI = {
  invoke(channel, ...args) {
    return ipcRenderer.invoke(channel, ...args)
  },
  on(channel, listener) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
      listener(...(args as Parameters<typeof listener>))
    ipcRenderer.on(channel, subscription)

    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },
}

export const mainApi: MainAPI = {
  send(channel, ...args) {
    if (!this.webContents) {
      throw Error(`Message ${channel} was made before webContents was set.`)
    }
    if (this.webContents.isDestroyed()) {
      throw Error(`Message ${channel} was made on destroyed webContents.`)
    }
    return this.webContents.send(channel, ...args)
  },
  handle(channel, listener) {
    const subscription = (
      _event: IpcMainInvokeEvent,
      ...args: unknown[]
    ): ReturnType<typeof listener> =>
      listener(...(args as Parameters<typeof listener>))
    ipcMain.handle(channel, subscription)

    return () => {
      ipcMain.removeListener(channel, subscription)
    }
  },
}
