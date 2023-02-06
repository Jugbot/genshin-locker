import type { RoutineOptions } from './automation/routines'
import type { Artifact } from './automation/types'
import type { RoutineStatus } from './windows/main/app'

export enum Channel {
  START = 'start',
  PROGRESS = 'progress',
  PAUSE = 'pause',
  RESUME = 'resume',
  STOP = 'stop',
  LOG = 'log',
  ARTIFACT = 'artifact',
}

export type LogMode = 'info' | 'warn' | 'error'

export type EventPayload = {
  [Channel.START]: [void, [options: RoutineOptions]]
  [Channel.PROGRESS]: [void, [progress: RoutineStatus]]
  [Channel.ARTIFACT]: [void, [artifact: Artifact, shouldLock: boolean]]
  [Channel.LOG]: [void, [mode: LogMode, text: string]]
}

export type MainEmitChannels = Channel.ARTIFACT | Channel.PROGRESS | Channel.LOG
export type RendererEmitChannels = Channel.START

export type RendererAPI = {
  invoke<T extends RendererEmitChannels>(
    channel: T,
    ...args: EventPayload[T][1]
  ): Promise<EventPayload[T][0]>
  on<T extends MainEmitChannels>(
    channel: T,
    listener: (...args: EventPayload[T][1]) => void
  ): () => void
}

export type MainAPI = {
  send<T extends MainEmitChannels>(
    webContents: Electron.WebContents,
    channel: T,
    ...args: EventPayload[T][1]
  ): void
  handle<T extends RendererEmitChannels>(
    channel: T,
    listener: (...args: EventPayload[T][1]) => EventPayload[T][0]
  ): () => void
}
