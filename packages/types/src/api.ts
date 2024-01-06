import type { WebContents } from 'electron'

import type { Artifact } from './artifact'

export type RoutineStatus = { max: number; current: number }
export type ArtifactData = { artifact: Artifact; shouldBeLocked: boolean }

export enum Channel {
  START = 'start',
  PROGRESS = 'progress',
  PAUSE = 'pause',
  RESUME = 'resume',
  STOP = 'stop',
  LOG = 'log',
  ARTIFACT = 'artifact',
  CALCULATE = 'calculate',
  SAVE_ARTIFACTS = 'save-artifacts',
  USER_SCRIPT_CHANGE = 'user-script-change',
  OPEN_USER_SCRIPT_FOLDER = 'open-user-script-folder',
}

export type LogMode = 'info' | 'warn' | 'error'

export type EventPayload = {
  [Channel.START]: [void, [lockWhileScanning: boolean, scriptName?: string]]
  [Channel.PROGRESS]: [void, [progress: RoutineStatus]]
  [Channel.ARTIFACT]: [void, [artifact: Artifact, shouldLock: boolean]]
  [Channel.LOG]: [void, [mode: LogMode, text: string]]
  [Channel.CALCULATE]: [
    Array<ArtifactData>,
    [scriptName: string | undefined, artifacts: Artifact[]]
  ]
  [Channel.SAVE_ARTIFACTS]: [success: boolean, args: [artifacts: Artifact[]]]
  [Channel.USER_SCRIPT_CHANGE]: [void, [fileNames: string[]]]
  [Channel.OPEN_USER_SCRIPT_FOLDER]: [void, []]
}

export type MainEmitChannels =
  | Channel.ARTIFACT
  | Channel.PROGRESS
  | Channel.LOG
  | Channel.USER_SCRIPT_CHANGE
export type RendererEmitChannels =
  | Channel.START
  | Channel.CALCULATE
  | Channel.SAVE_ARTIFACTS
  | Channel.OPEN_USER_SCRIPT_FOLDER

type MaybePromise<T> = T | Promise<T>

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
  webContents?: WebContents
  send<T extends MainEmitChannels>(
    channel: T,
    ...args: EventPayload[T][1]
  ): void
  handle<T extends RendererEmitChannels>(
    channel: T,
    listener: (...args: EventPayload[T][1]) => MaybePromise<EventPayload[T][0]>
  ): () => void
}
