import { mainApi } from '../api'
import { Channel } from '../apiTypes'

import { ScreenMap } from './landmarks/types'
import { Navigator } from './navigator'
import { calculate } from './scoring/logic'
import { Logic, Scoring, Bucket } from './scoring/types'
import { GBRAtoRGB } from './util/image'
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

export type RoutineOptions = {
  logic: Logic<Scoring>
  targetAttributes: Bucket
  lockWhileScanning: boolean
}

export async function readArtifacts({
  logic,
  targetAttributes,
  lockWhileScanning,
}: RoutineOptions) {
  const taskManager = new TaskManager<boolean>()
  const navigator = new Navigator()
  navigator.gwindow.grab()
  await sleep(200)
  navigator.click('menu_artifacts')
  await sleep(200)
  navigator.click('sort_dir')
  await sleep(200)
  navigator.click('sort_dir')
  await sleep(200)

  navigator.gwindow.goto(
    ...navigator.landmarks[ScreenMap.ARTIFACTS].card_name.center()
  )
  navigator.gwindow.scroll(100, 'clicks')
  await sleep(200)

  const total = await navigator.getArtifactCount(
    await navigator.gwindow.captureBGRA().then(GBRAtoRGB)
  )
  mainApi.send(Channel.LOG, 'info', `Reading ${total} artifacts total`)
  const { repeat_y: rowsPerPage } =
    navigator.landmarks[ScreenMap.ARTIFACTS].list_item

  const visitedArtifacts = new Set<string>()

  for (;;) {
    let pageIndex = 0
    for (const click of navigator.clickAll('list_item')) {
      const thisPageIndex = pageIndex
      taskManager.add('sync', async () => {
        click()
        await sleep(100)
        const imageBGRA = await navigator.gwindow.captureBGRA()
        const image = await GBRAtoRGB(imageBGRA)
        const regions = Array.from(
          navigator.landmarks[ScreenMap.ARTIFACTS].list_item.regions()
        )
        const region = regions[thisPageIndex]
        if (await navigator.isEmpty(image, region)) {
          return false
        }
        // Do image parsing async since it doesnt interfere with actions
        taskManager.add('async', () =>
          navigator.getArtifact(image).then(async (artifact) => {
            if (visitedArtifacts.has(artifact.id)) {
              mainApi.send(Channel.LOG, 'info', `Skipping, already visited.`)
              return
            }
            visitedArtifacts.add(artifact.id)
            const shouldBeLocked = await calculate(
              artifact,
              logic,
              targetAttributes
            )
            // console.log(shouldBeLocked, artifact.id)
            if (lockWhileScanning && shouldBeLocked !== artifact.lock) {
              const lockArtifact = async () => {
                // navigate to the artifact we want to lock again
                click()
                await sleep(200)
                navigator.click('card_lock')
                await sleep(200)
                return true
              }
              taskManager.add('sync', lockArtifact)
            }
            mainApi.send(Channel.ARTIFACT, artifact, shouldBeLocked)
          })
        )
        return true
      })
      mainApi.send(Channel.PROGRESS, {
        current: 0,
        max: total,
      })
      pageIndex += 1
    }
    let shouldExit = false
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
            taskManager.stop()
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
