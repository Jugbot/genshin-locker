import { mainApi } from '@gl/ipc-api'
import { Channel } from '@gl/types'
import { Sharp } from 'sharp'

import { ScreenMap } from './landmarks/types'
import { Navigator } from './navigator'
import { calculate, getLockerScript } from './scoring/logic'
import { VK } from './window/winconst'

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

class TaskManager<S> {
  syncTasks: Array<() => Promise<S>> = []
  asyncTasks: Set<Promise<unknown>> = new Set()

  async *run() {
    while (this.syncTasks.length || this.asyncTasks.size) {
      const task = this.syncTasks.shift()
      if (task) {
        yield task
      } else {
        await sleep(0)
      }
    }
  }

  stop() {
    this.syncTasks = []
    this.asyncTasks = new Set()
  }

  add(type: 'sync', task: () => Promise<S>): void
  add(type: 'async', task: () => Promise<unknown>): void
  add(type: 'async' | 'sync', task: () => Promise<unknown>): void {
    if (type === 'sync') {
      this.syncTasks.push(task as () => Promise<S>)
    }
    if (type === 'async') {
      const promise = task()
      this.asyncTasks.add(promise)
      promise.finally(() => this.asyncTasks.delete(promise))
    }
  }
}

export async function readArtifacts(
  lockWhileScanning: boolean,
  scriptName?: string
) {
  const scriptFunc = await getLockerScript(scriptName)
  const taskManager = new TaskManager<boolean>()
  const navigator = new Navigator()
  navigator.gwindow.grab()
  await sleep(200)
  navigator.click('menu_artifacts')
  await sleep(200)
  navigator.resetScroll()
  await sleep(200)

  navigator.gwindow.goto(
    ...navigator.landmarks[ScreenMap.ARTIFACTS].card_name.center()
  )
  navigator.gwindow.scroll(100, 'clicks')
  await sleep(200)

  const total = await navigator.getArtifactCount(
    await navigator.gwindow.capture()
  )
  mainApi.send(Channel.LOG, 'info', `Reading ${total} artifacts total`)
  const { repeat_y: rowsPerPage } =
    navigator.landmarks[ScreenMap.ARTIFACTS].list_item

  const visitedArtifacts = new Set<string>()

  const clickArray = Array.from(navigator.clickAll('list_item'))
  const regions = Array.from(
    navigator.landmarks[ScreenMap.ARTIFACTS].list_item.regions()
  )

  const lockArtifactTask =
    (thisPageIndex: number, lockCallback: () => void) => async () => {
      // navigate to the artifact we want to lock again
      clickArray[thisPageIndex]()
      await sleep(200)
      navigator.click('card_lock')
      lockCallback()
      await sleep(200)
      return true
    }

  const artifactTask = (thisPageIndex: number) => async () => {
    clickArray[thisPageIndex]()
    await sleep(100)
    const image = await navigator.gwindow.capture()
    const region = regions[thisPageIndex]
    if (await navigator.isEmpty(image, region)) {
      return false
    }
    // Do image parsing async since it doesnt interfere with actions
    taskManager.add('async', parseArtifactTask(thisPageIndex, image))
    if (thisPageIndex < clickArray.length - 1) {
      taskManager.add('sync', artifactTask(thisPageIndex + 1))
    }
    return true
  }

  const parseArtifactTask = (thisPageIndex: number, image: Sharp) => () =>
    navigator.getArtifact(image).then(
      async (artifact) => {
        if (artifact.rarity < 5) {
          // TODO: Add option for rarity
          // There is not much point to filtering low rarity artifacts
          mainApi.send(Channel.LOG, 'info', `Skipping, not five star.`)
          return
        }
        if (visitedArtifacts.has(artifact.id)) {
          mainApi.send(Channel.LOG, 'info', `Skipping, already visited.`)
          return
        }
        visitedArtifacts.add(artifact.id)
        const shouldBeLocked =
          (await calculate(scriptFunc, artifact)) ?? artifact.lock
        if (lockWhileScanning && shouldBeLocked !== artifact.lock) {
          taskManager.add(
            'sync',
            lockArtifactTask(thisPageIndex, () =>
              mainApi.send(
                Channel.ARTIFACT,
                {
                  ...artifact,
                  lock: shouldBeLocked,
                },
                shouldBeLocked
              )
            )
          )
        }
        mainApi.send(Channel.ARTIFACT, artifact, shouldBeLocked)
      },
      (reason) => {
        console.error(reason)
        navigator.debugPrint(image)
        mainApi.send(Channel.LOG, 'error', `Error parsing artifact, ${reason}`)
      }
    )

  for (;;) {
    let shouldExit = false
    taskManager.add('sync', artifactTask(0))
    // Exhaust sequential and async actions on artifacts
    for await (const task of taskManager.run()) {
      await task()
        .then((shouldContinue) => {
          if (navigator.gwindow.keydown(VK.SPACE)) {
            mainApi.send(Channel.LOG, 'warn', `Keyboard Interrupt`)
            taskManager.stop()
            shouldExit = true
          } else if (!shouldContinue) {
            mainApi.send(Channel.LOG, 'info', `Reached the end`)
            shouldExit = true
          }
        })
        .catch((e) => {
          console.error(e)
          mainApi.send(Channel.LOG, 'error', `Error: ${e}`)
          taskManager.stop()
          shouldExit = true
        })
    }
    if (shouldExit) {
      return
    }
    await navigator.scrollArtifacts(rowsPerPage)
  }
}
