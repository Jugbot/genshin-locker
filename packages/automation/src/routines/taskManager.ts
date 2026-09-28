import { mainApi } from '@gl/ipc-api'
import { Channel } from '@gl/types'

import { sleep } from './util'

export class TaskManager<S> {
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

/**
 * Exhausts sequential and async tasks, stopping on interrupt or error.
 * @returns true if the routine should exit (interrupted, errored, or a task reported the end)
 */
export async function runTasks(
  taskManager: TaskManager<boolean>,
  shouldInterrupt: () => boolean
) {
  let shouldExit = false
  for await (const task of taskManager.run()) {
    await task()
      .then((shouldContinue) => {
        if (shouldInterrupt()) {
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
  return shouldExit
}
