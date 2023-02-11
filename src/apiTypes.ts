import type { RoutineOptions } from './automation/routines'
import type { Bucket, ScoringLogic } from './automation/scoring/types'
import type { Artifact } from './automation/types'
import type { ArtifactData, RoutineStatus } from './windows/main/app'

export enum Channel {
  START = 'start',
  PROGRESS = 'progress',
  PAUSE = 'pause',
  RESUME = 'resume',
  STOP = 'stop',
  LOG = 'log',
  ARTIFACT = 'artifact',
  CALCULATE = 'calculate',
}

export type LogMode = 'info' | 'warn' | 'error'

export type EventPayload = {
  [Channel.START]: [void, [options: RoutineOptions]]
  [Channel.PROGRESS]: [void, [progress: RoutineStatus]]
  [Channel.ARTIFACT]: [void, [artifact: Artifact, shouldLock: boolean]]
  [Channel.LOG]: [void, [mode: LogMode, text: string]]
  [Channel.CALCULATE]: [
    Array<ArtifactData>,
    [logic: ScoringLogic, bucket: Bucket, artifacts: Artifact[]]
  ]
}

export type MainEmitChannels = Channel.ARTIFACT | Channel.PROGRESS | Channel.LOG
export type RendererEmitChannels = Channel.START | Channel.CALCULATE

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
  webContents?: Electron.WebContents
  send<T extends MainEmitChannels>(
    channel: T,
    ...args: EventPayload[T][1]
  ): void
  handle<T extends RendererEmitChannels>(
    channel: T,
    listener: (...args: EventPayload[T][1]) => MaybePromise<EventPayload[T][0]>
  ): () => void
}
