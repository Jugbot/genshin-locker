import type { RoutineOptions, Bucket, ScoringLogic } from '@gl/automation'
import type { Artifact } from '@gl/types'

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
  [Channel.SAVE_ARTIFACTS]: [success: boolean, args: [artifacts: Artifact[]]]
}

export type MainEmitChannels = Channel.ARTIFACT | Channel.PROGRESS | Channel.LOG
export type RendererEmitChannels =
  | Channel.START
  | Channel.CALCULATE
  | Channel.SAVE_ARTIFACTS

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
