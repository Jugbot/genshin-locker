import { beforeEach, describe, expect, test, vi } from 'vitest'

import { load, ScreenMap } from '../../landmarks'
import { XUSB_BUTTON } from '../../window/winconst'

import {
  ARTIFACT_TAB_RB_PRESSES,
  GamepadDriver,
  GamepadNavigator,
} from './gamepad'

vi.mock('../util', () => ({ sleep: () => Promise.resolve() }))

function loadLandmarks() {
  const landmarks = load(1920, 1080)
  if (!landmarks) {
    throw Error('Missing 16x9 landmarks')
  }
  return landmarks
}
const landmarks = loadLandmarks()
const { repeat_x: cols } = landmarks[ScreenMap.ARTIFACTS].list_item

const RIGHT = [1, 0]
const LEFT = [-1, 0]

function createNavigator() {
  const flicks: number[][] = []
  const navigator = {
    landmarks,
    gwindow: {
      gamepadConnect: vi.fn(),
      gamepadDisconnect: vi.fn(),
      gamepadPress: vi.fn(async () => undefined),
      leftStickFlick: vi.fn(async (x: number, y: number) => {
        flicks.push([x, y])
      }),
    },
  } satisfies GamepadNavigator
  return { navigator, flicks }
}

describe('GamepadDriver', () => {
  let navigator: ReturnType<typeof createNavigator>['navigator']
  let flicks: number[][]
  let driver: GamepadDriver

  beforeEach(async () => {
    ;({ navigator, flicks } = createNavigator())
    driver = new GamepadDriver(navigator)
    await driver.setup()
  })

  test('setup connects and tabs to the artifacts', () => {
    expect(navigator.gwindow.gamepadConnect).toHaveBeenCalledOnce()
    expect(navigator.gwindow.gamepadPress).toHaveBeenCalledTimes(
      ARTIFACT_TAB_RB_PRESSES
    )
    expect(navigator.gwindow.gamepadPress).toHaveBeenCalledWith(
      XUSB_BUTTON.RIGHT_SHOULDER
    )
  })

  test('setup explains a missing driver', async () => {
    navigator.gwindow.gamepadConnect.mockImplementation(() => {
      throw Error('ViGEmBus driver not installed')
    })
    await expect(driver.setup()).rejects.toThrow(
      /is the ViGEmBus driver installed\?/
    )
  })

  test('batches are rows of the grid, left to right', async () => {
    const batches = driver.batches()
    expect((await batches.next()).value).toEqual(
      Array.from({ length: cols }, (_, i) => i)
    )
    expect((await batches.next()).value).toEqual(
      Array.from({ length: cols }, (_, i) => cols + i)
    )
  })

  test('selecting the next artifact is one flick right', async () => {
    await driver.select(1)
    expect(flicks).toEqual([RIGHT])
  })

  test('flicking right wraps from the row end to the next row', async () => {
    await driver.select(cols - 1)
    flicks.length = 0
    await driver.select(cols)
    expect(flicks).toEqual([RIGHT])
  })

  test('selecting ahead flicks right once per artifact', async () => {
    await driver.select(cols + 2)
    expect(flicks).toEqual(Array.from({ length: cols + 2 }, () => RIGHT))
  })

  test('navigating back flicks left once per artifact', async () => {
    await driver.select(3)
    flicks.length = 0
    await driver.select(1)
    expect(flicks).toEqual([LEFT, LEFT])
  })

  test('flicking left wraps from the row start to the previous row', async () => {
    await driver.select(cols)
    flicks.length = 0
    await driver.select(cols - 1)
    expect(flicks).toEqual([LEFT])
  })

  test('selecting the current artifact does not flick', async () => {
    await driver.select(0)
    expect(flicks).toEqual([])
  })

  test('markSelected corrects the position after a failed move', async () => {
    await driver.select(3) // pretend this failed and we are still on 2
    driver.markSelected(2)
    flicks.length = 0
    await driver.select(0)
    expect(flicks).toEqual([LEFT, LEFT])
  })

  test('toggleLock clicks the right stick', async () => {
    vi.mocked(navigator.gwindow.gamepadPress).mockClear()
    await driver.toggleLock()
    expect(navigator.gwindow.gamepadPress).toHaveBeenCalledWith(
      XUSB_BUTTON.RIGHT_THUMB
    )
  })

  test('teardown unplugs the controller', () => {
    driver.teardown()
    expect(navigator.gwindow.gamepadDisconnect).toHaveBeenCalledOnce()
  })
})
