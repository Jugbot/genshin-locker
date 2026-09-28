import { beforeEach, describe, expect, test, vi } from 'vitest'

import { load, ScreenMap } from '../../landmarks'

import { MouseDriver, MouseNavigator } from './mouse'

vi.mock('../util', () => ({ sleep: () => Promise.resolve() }))

function loadLandmarks() {
  const landmarks = load(1920, 1080)
  if (!landmarks) {
    throw Error('Missing 16x9 landmarks')
  }
  return landmarks
}
const landmarks = loadLandmarks()
const { repeat_x: cols, repeat_y: rows } =
  landmarks[ScreenMap.ARTIFACTS].list_item
const perPage = cols * rows

function createNavigator() {
  const clickedSlots: number[] = []
  const navigator = {
    landmarks,
    click: vi.fn(),
    clickAll: vi.fn(function* () {
      for (let slot = 0; slot < perPage; slot++) {
        yield () => clickedSlots.push(slot)
      }
    }),
    resetScroll: vi.fn(async () => undefined),
    scrollArtifacts: vi.fn(async () => undefined),
    gwindow: { goto: vi.fn(), scroll: vi.fn(() => 0) },
  } satisfies MouseNavigator
  return { navigator, clickedSlots }
}

describe('MouseDriver', () => {
  let navigator: ReturnType<typeof createNavigator>['navigator']
  let clickedSlots: number[]
  let driver: MouseDriver

  beforeEach(() => {
    ;({ navigator, clickedSlots } = createNavigator())
    driver = new MouseDriver(navigator)
  })

  test('setup opens the artifacts tab and waits for the scroll reset', async () => {
    await driver.setup()
    expect(navigator.click).toHaveBeenCalledWith('menu_artifacts')
    expect(navigator.resetScroll).toHaveBeenCalledOnce()
  })

  test('batches are row-major pages, scrolling between them', async () => {
    const batches = driver.batches()

    const first = await batches.next()
    expect(first.value).toEqual(Array.from({ length: perPage }, (_, i) => i))
    expect(navigator.scrollArtifacts).not.toHaveBeenCalled()

    const second = await batches.next()
    expect(second.value).toEqual(
      Array.from({ length: perPage }, (_, i) => perPage + i)
    )
    expect(navigator.scrollArtifacts).toHaveBeenCalledOnce()
    expect(navigator.scrollArtifacts).toHaveBeenCalledWith(rows)
  })

  test('select clicks the slot of the index on the current page', async () => {
    await driver.select(0)
    await driver.select(cols + 1)
    await driver.select(perPage + 2)
    expect(clickedSlots).toEqual([0, cols + 1, 2])
  })

  test('toggleLock clicks the lock icon', async () => {
    await driver.toggleLock()
    expect(navigator.click).toHaveBeenCalledWith('card_lock')
  })
})
