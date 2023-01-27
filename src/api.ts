import {
  IpcMainInvokeEvent,
  IpcRendererEvent,
  // eslint-disable-next-line no-restricted-imports
  ipcMain,
  // eslint-disable-next-line no-restricted-imports
  ipcRenderer,
} from 'electron'

import { Channel } from './apiTypes'
import type { RoutineOptions } from './automation/routines'
import { Artifact } from './automation/types'

type EventPayload = {
  [Channel.START]: [void, [options: RoutineOptions]]
  [Channel.PROGRESS]: [void, [percent: number]]
  [Channel.ARTIFACT]: [void, [artifact: Artifact]]
  [Channel.LOG]: [void, [text: string]]
}

type MainEmitChannels = Channel.ARTIFACT
type RendererEmitChannels = Channel.START | Channel.PROGRESS | Channel.LOG

type IpcRenderer = {
  invoke<T extends RendererEmitChannels>(
    channel: T,
    ...args: EventPayload[T][1]
  ): Promise<EventPayload[T][0]>
  on<T extends MainEmitChannels>(
    channel: T,
    listener: (...args: EventPayload[T][1]) => void
  ): void
}

type IpcMain = {
  send<T extends MainEmitChannels>(
    webContents: Electron.WebContents,
    channel: T,
    ...args: EventPayload[T][1]
  ): void
  handle<T extends RendererEmitChannels>(
    channel: T,
    listener: (...args: EventPayload[T][1]) => EventPayload[T][0]
  ): void
}

export const rendererApi: IpcRenderer = {
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

export const mainApi: IpcMain = {
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
