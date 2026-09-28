import { mainApi } from '@gl/ipc-api'
import { Channel } from '@gl/types'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { runTasks, TaskManager } from './taskManager'

vi.mock('@gl/ipc-api', () => ({ mainApi: { send: vi.fn() } }))

const never = () => false

describe('TaskManager', () => {
  test('runs sync tasks in FIFO order, including tasks added while running', async () => {
    const taskManager = new TaskManager<string>()
    const order: string[] = []
    taskManager.add('sync', async () => {
      taskManager.add('sync', async () => 'c')
      return 'a'
    })
    taskManager.add('sync', async () => 'b')
    for await (const task of taskManager.run()) {
      order.push(await task())
    }
    expect(order).toEqual(['a', 'b', 'c'])
  })

  test('does not finish until async tasks settle', async () => {
    const taskManager = new TaskManager<boolean>()
    let resolved = false
    taskManager.add('async', async () => {
      await new Promise((r) => setTimeout(r, 20))
      resolved = true
    })
    for await (const task of taskManager.run()) {
      await task()
    }
    expect(resolved).toBe(true)
  })

  test('async tasks can queue sync tasks', async () => {
    const taskManager = new TaskManager<boolean>()
    const ran = vi.fn(async () => true)
    taskManager.add('async', async () => {
      await new Promise((r) => setTimeout(r, 10))
      taskManager.add('sync', ran)
    })
    for await (const task of taskManager.run()) {
      await task()
    }
    expect(ran).toHaveBeenCalledOnce()
  })
})

describe('runTasks', () => {
  beforeEach(() => {
    vi.mocked(mainApi.send).mockClear()
  })

  test('returns false when every task succeeds', async () => {
    const taskManager = new TaskManager<boolean>()
    taskManager.add('sync', async () => true)
    taskManager.add('sync', async () => true)
    expect(await runTasks(taskManager, never)).toBe(false)
  })

  test('stops everything on interrupt', async () => {
    const taskManager = new TaskManager<boolean>()
    const second = vi.fn(async () => true)
    taskManager.add('sync', async () => true)
    taskManager.add('sync', second)
    expect(await runTasks(taskManager, () => true)).toBe(true)
    expect(second).not.toHaveBeenCalled()
    expect(mainApi.send).toHaveBeenCalledWith(
      Channel.LOG,
      'warn',
      'Keyboard Interrupt'
    )
  })

  test('lets queued tasks drain after a task reports the end', async () => {
    const taskManager = new TaskManager<boolean>()
    const second = vi.fn(async () => true)
    taskManager.add('sync', async () => false)
    taskManager.add('sync', second)
    expect(await runTasks(taskManager, never)).toBe(true)
    expect(second).toHaveBeenCalledOnce()
    expect(mainApi.send).toHaveBeenCalledWith(
      Channel.LOG,
      'info',
      'Reached the end'
    )
  })

  test('stops everything when a task throws', async () => {
    const taskManager = new TaskManager<boolean>()
    const second = vi.fn(async () => true)
    taskManager.add('sync', async () => {
      throw Error('boom')
    })
    taskManager.add('sync', second)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(await runTasks(taskManager, never)).toBe(true)
    expect(second).not.toHaveBeenCalled()
    expect(mainApi.send).toHaveBeenCalledWith(
      Channel.LOG,
      'error',
      'Error: Error: boom'
    )
  })
})
