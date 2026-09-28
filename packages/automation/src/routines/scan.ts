import { mainApi } from '@gl/ipc-api'
import { Artifact, Channel } from '@gl/types'
import { Sharp } from 'sharp'

import type { Navigator } from '../navigator'
import type { GenshinWindow } from '../window'
import { VK } from '../window/winconst'

import type { InputDriver } from './drivers/types'
import { runTasks, TaskManager } from './taskManager'

export type ScanNavigator = Pick<
  Navigator,
  'getArtifact' | 'getArtifactCount' | 'isSameArtifact' | 'debugPrint'
> & { gwindow: Pick<GenshinWindow, 'capture' | 'keydown'> }

export interface ScanOptions {
  lockWhileScanning: boolean
  /** Whether the artifact should be locked, or null on error */
  decideLock: (artifact: Artifact) => Promise<boolean | null>
}

export function reportParseError(
  navigator: Pick<Navigator, 'debugPrint'>,
  image: Sharp,
  reason: unknown
) {
  console.error(reason)
  mainApi.send(Channel.LOG, 'error', `Error parsing artifact, ${reason}`)
  return navigator
    .debugPrint(image)
    .then((fileName) =>
      mainApi.send(
        Channel.LOG,
        'error',
        `Saved failing artifact snapshot to ${fileName}`
      )
    )
}

/**
 * Visits every artifact in the Inventory, reporting (and optionally fixing) its lock state.
 * Selection and locking happen sequentially; OCR runs in the background.
 */
export async function scanArtifacts(
  navigator: ScanNavigator,
  driver: InputDriver,
  { lockWhileScanning, decideLock }: ScanOptions
) {
  const { gwindow } = navigator
  try {
    try {
      await driver.setup()
    } catch (e) {
      console.error(e)
      mainApi.send(Channel.LOG, 'error', `${e}`)
      return
    }

    // Informational only, the artifact count is not reliable enough to stop on
    const total = await navigator.getArtifactCount(await gwindow.capture())
    mainApi.send(Channel.LOG, 'info', `Reading ${total} artifacts total`)

    const visitedArtifacts = new Set<string>()
    let newInBatch = 0
    const evaluate = async (artifact: Artifact) => {
      if (visitedArtifacts.has(artifact.id)) {
        mainApi.send(Channel.LOG, 'info', `Skipping, already visited.`)
        return
      }
      visitedArtifacts.add(artifact.id)
      newInBatch += 1
      if (artifact.rarity < 5) {
        // TODO: Add option for rarity
        // There is not much point to filtering low rarity artifacts
        mainApi.send(Channel.LOG, 'info', `Skipping, not five star.`)
        return
      }
      return (await decideLock(artifact)) ?? artifact.lock
    }

    const taskManager = new TaskManager<boolean>()
    // Index of the artifact that is currently selected, if any
    let selected: number | undefined

    const lockArtifactTask =
      (
        index: number,
        expected: Sharp,
        artifact: Artifact,
        shouldBeLocked: boolean
      ) =>
      async () => {
        // navigate to the artifact we want to lock again
        await driver.select(index)
        selected = index
        if (
          !(await navigator.isSameArtifact(expected, await gwindow.capture()))
        ) {
          mainApi.send(
            Channel.LOG,
            'warn',
            `Skipping lock, could not navigate back to the artifact.`
          )
          return true
        }
        await driver.toggleLock()
        mainApi.send(
          Channel.ARTIFACT,
          { ...artifact, lock: shouldBeLocked },
          shouldBeLocked
        )
        return true
      }

    const parseArtifactTask = (index: number, image: Sharp) => () =>
      navigator.getArtifact(image).then(
        async (artifact) => {
          const shouldBeLocked = await evaluate(artifact)
          if (shouldBeLocked === undefined) {
            return
          }
          if (lockWhileScanning && shouldBeLocked !== artifact.lock) {
            taskManager.add(
              'sync',
              lockArtifactTask(index, image, artifact, shouldBeLocked)
            )
          }
          mainApi.send(Channel.ARTIFACT, artifact, shouldBeLocked)
        },
        (reason) => reportParseError(navigator, image, reason)
      )

    const artifactTask = (batch: number[], k: number) => async () => {
      const index = batch[k]
      const previous = selected
      // The first artifact is already selected, so there is nothing to compare
      const before = previous === undefined ? null : await gwindow.capture()
      await driver.select(index)
      const image = await gwindow.capture()
      if (
        previous !== undefined &&
        before &&
        (await navigator.isSameArtifact(before, image))
      ) {
        // Navigation failed, so there are no more artifacts
        driver.markSelected?.(previous)
        return false
      }
      selected = index
      // Do image parsing async since it doesnt interfere with actions
      taskManager.add('async', parseArtifactTask(index, image))
      if (k < batch.length - 1) {
        taskManager.add('sync', artifactTask(batch, k + 1))
      }
      return true
    }

    for await (const batch of driver.batches()) {
      newInBatch = 0
      taskManager.add('sync', artifactTask(batch, 0))
      if (await runTasks(taskManager, () => gwindow.keydown(VK.SPACE))) {
        return
      }
      // Guards against scrolling that silently does nothing at the end of the list
      if (newInBatch === 0) {
        mainApi.send(Channel.LOG, 'info', `Reached the end`)
        return
      }
    }
  } finally {
    driver.teardown()
  }
}
