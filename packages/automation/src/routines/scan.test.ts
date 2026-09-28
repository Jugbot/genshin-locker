import { mainApi } from '@gl/ipc-api'
import { Artifact, Channel } from '@gl/types'
import { Sharp } from 'sharp'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import type { InputDriver } from './drivers/types'
import { scanArtifacts, ScanNavigator } from './scan'

vi.mock('@gl/ipc-api', () => ({ mainApi: { send: vi.fn() } }))

const BATCH_SIZE = 4

function artifact(id: string, overrides: Partial<Artifact> = {}): Artifact {
  return {
    id,
    level: 20,
    location: 0,
    lock: false,
    mainStatKey: 'hp',
    mainStatValue: 4780,
    rarity: 5,
    setKey: 'GladiatorsFinale',
    slotKey: 'flower',
    substats: [],
    ...overrides,
  } as Artifact
}

/** A screenshot stand-in: which grid cell is shown on the artifact card */
type Screen = { cell: number }

/**
 * Simulates the Inventory. `screenFor` maps a requested index to the cell that
 * ends up selected, or null when navigation fails (the selection stays put).
 */
function createInventory(
  artifacts: Artifact[],
  screenFor: (index: number) => number | null = (index) =>
    index < artifacts.length ? index : null
) {
  const events: string[] = []
  let current = -1
  let batchesYielded = 0

  const driver = {
    setup: vi.fn(async () => {
      current = 0
    }),
    teardown: vi.fn(),
    batches: async function* () {
      for (let batch = 0; ; batch++) {
        batchesYielded += 1
        yield Array.from(
          { length: BATCH_SIZE },
          (_, k) => batch * BATCH_SIZE + k
        )
      }
    },
    select: vi.fn(async (index: number) => {
      events.push(`select:${index}`)
      const cell = screenFor(index)
      if (cell !== null) {
        current = cell
      }
    }),
    markSelected: vi.fn(),
    toggleLock: vi.fn(async () => {
      events.push(`toggle:${current}`)
    }),
  } satisfies InputDriver

  const keydown = vi.fn(() => false)
  const navigator = {
    getArtifactCount: vi.fn(async () => artifacts.length),
    getArtifact: vi.fn(
      async (image: Sharp) => artifacts[(image as unknown as Screen).cell]
    ),
    isSameArtifact: vi.fn(
      async (a: Sharp, b: Sharp) =>
        (a as unknown as Screen).cell === (b as unknown as Screen).cell
    ),
    debugPrint: vi.fn(async () => 'snapshot.png'),
    gwindow: {
      capture: vi.fn(async () => ({ cell: current } as unknown as Sharp)),
      keydown,
    },
  } satisfies ScanNavigator

  return {
    driver,
    navigator,
    events,
    keydown,
    batchesYielded: () => batchesYielded,
  }
}

const sentArtifacts = () =>
  vi
    .mocked(mainApi.send)
    .mock.calls.filter(([channel]) => channel === Channel.ARTIFACT)

describe('scanArtifacts', () => {
  beforeEach(() => {
    vi.mocked(mainApi.send).mockClear()
  })

  test('visits every artifact and stops when navigation fails', async () => {
    const artifacts = Array.from({ length: 6 }, (_, i) => artifact(`a${i}`))
    const { driver, navigator, events } = createInventory(artifacts)

    await scanArtifacts(navigator, driver, {
      lockWhileScanning: false,
      decideLock: async (a) => a.lock,
    })

    expect(events).toEqual([0, 1, 2, 3, 4, 5, 6].map((i) => `select:${i}`))
    expect(sentArtifacts().map(([, a]) => (a as Artifact).id)).toEqual(
      artifacts.map((a) => a.id)
    )
    // The selection never left the last artifact
    expect(driver.markSelected).toHaveBeenCalledWith(5)
    expect(driver.teardown).toHaveBeenCalledOnce()
  })

  test('the first artifact is never mistaken for a failed navigation', async () => {
    const { driver, navigator } = createInventory([artifact('only')])

    await scanArtifacts(navigator, driver, {
      lockWhileScanning: false,
      decideLock: async (a) => a.lock,
    })

    expect(sentArtifacts()).toHaveLength(1)
  })

  test('navigates back to an artifact before toggling its lock', async () => {
    const artifacts = Array.from({ length: 3 }, (_, i) => artifact(`a${i}`))
    const { driver, navigator, events } = createInventory(artifacts)

    await scanArtifacts(navigator, driver, {
      lockWhileScanning: true,
      decideLock: async (a) => a.id === 'a1',
    })

    const toggle = events.indexOf('toggle:1')
    expect(toggle).toBeGreaterThan(0)
    expect(events[toggle - 1]).toBe('select:1')
    expect(driver.toggleLock).toHaveBeenCalledOnce()
    expect(sentArtifacts()).toContainEqual([
      Channel.ARTIFACT,
      { ...artifacts[1], lock: true },
      true,
    ])
  })

  test('does not lock when lockWhileScanning is off', async () => {
    const artifacts = [artifact('a0'), artifact('a1')]
    const { driver, navigator } = createInventory(artifacts)

    await scanArtifacts(navigator, driver, {
      lockWhileScanning: false,
      decideLock: async () => true,
    })

    expect(driver.toggleLock).not.toHaveBeenCalled()
    expect(sentArtifacts()).toHaveLength(2)
  })

  test('skips artifacts below five stars', async () => {
    const artifacts = [artifact('a0', { rarity: 4 }), artifact('a1')]
    const decideLock = vi.fn(async () => true)
    const { driver, navigator } = createInventory(artifacts)

    await scanArtifacts(navigator, driver, {
      lockWhileScanning: true,
      decideLock,
    })

    expect(decideLock).toHaveBeenCalledOnce()
    expect(decideLock).toHaveBeenCalledWith(artifacts[1])
  })

  test('skips the lock if navigating back lands on another artifact', async () => {
    const artifacts = Array.from({ length: 3 }, (_, i) => artifact(`a${i}`))
    let scanned = false
    // Once scanning is over, going back to cell 1 lands on cell 2 instead
    const inventory = createInventory(artifacts, (index) => {
      if (index >= artifacts.length) {
        scanned = true
        return null
      }
      return scanned && index === 1 ? 2 : index
    })
    // Delay parsing so the lock task runs after the scan reaches the end
    inventory.navigator.getArtifact.mockImplementation(async (image) => {
      await new Promise((r) => setTimeout(r, 10))
      return artifacts[(image as unknown as Screen).cell]
    })

    await scanArtifacts(inventory.navigator, inventory.driver, {
      lockWhileScanning: true,
      decideLock: async (a) => a.id === 'a1',
    })

    expect(inventory.driver.toggleLock).not.toHaveBeenCalled()
    expect(mainApi.send).toHaveBeenCalledWith(
      Channel.LOG,
      'warn',
      'Skipping lock, could not navigate back to the artifact.'
    )
  })

  test('stops on keyboard interrupt', async () => {
    const artifacts = Array.from({ length: 6 }, (_, i) => artifact(`a${i}`))
    const { driver, navigator, keydown } = createInventory(artifacts)
    keydown.mockReturnValue(true)

    await scanArtifacts(navigator, driver, {
      lockWhileScanning: false,
      decideLock: async (a) => a.lock,
    })

    expect(driver.select).toHaveBeenCalledOnce()
    expect(driver.teardown).toHaveBeenCalledOnce()
  })

  test('ends when a whole batch only finds visited artifacts', async () => {
    // The list ends exactly on a batch boundary and the next "page" repeats it
    const artifacts = Array.from({ length: BATCH_SIZE }, (_, i) =>
      artifact(`a${i}`)
    )
    const inventory = createInventory(artifacts, (index) => index % BATCH_SIZE)

    await scanArtifacts(inventory.navigator, inventory.driver, {
      lockWhileScanning: false,
      decideLock: async (a) => a.lock,
    })

    expect(inventory.batchesYielded()).toBe(2)
    expect(sentArtifacts()).toHaveLength(BATCH_SIZE)
    expect(mainApi.send).toHaveBeenCalledWith(
      Channel.LOG,
      'info',
      'Reached the end'
    )
  })

  test('reports a failed setup and still tears down', async () => {
    const { driver, navigator } = createInventory([artifact('a0')])
    driver.setup.mockRejectedValue(Error('no gamepad'))
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await scanArtifacts(navigator, driver, {
      lockWhileScanning: false,
      decideLock: async (a) => a.lock,
    })

    expect(driver.select).not.toHaveBeenCalled()
    expect(driver.teardown).toHaveBeenCalledOnce()
    expect(mainApi.send).toHaveBeenCalledWith(
      Channel.LOG,
      'error',
      'Error: no gamepad'
    )
  })
})
