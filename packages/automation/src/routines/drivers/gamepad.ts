import { ScreenMap } from '../../landmarks'
import type { Navigator } from '../../navigator'
import type { GenshinWindow } from '../../window'
import { XUSB_BUTTON } from '../../window/winconst'
import { sleep } from '../util'

import type { InputDriver } from './types'

// Number of RB presses from the Inventory's opening tab to the Artifacts tab
export const ARTIFACT_TAB_RB_PRESSES = 1

export type GamepadNavigator = Pick<Navigator, 'landmarks'> & {
  gwindow: Pick<
    GenshinWindow,
    'gamepadConnect' | 'gamepadDisconnect' | 'gamepadPress' | 'leftStickFlick'
  >
}

/**
 * Moves the selection with left stick flicks, one row of the grid per batch.
 */
export class GamepadDriver implements InputDriver {
  private navigator: GamepadNavigator
  private cols: number
  private current = 0

  constructor(navigator: GamepadNavigator) {
    this.navigator = navigator
    this.cols = navigator.landmarks[ScreenMap.ARTIFACTS].list_item.repeat_x
  }

  async setup() {
    const { gwindow } = this.navigator
    try {
      gwindow.gamepadConnect()
    } catch (e) {
      throw Error(
        `Could not connect virtual gamepad, is the ViGEmBus driver installed? ${e}`
      )
    }
    // Give Genshin time to switch to the controller UI
    await sleep(500)
    // for (let i = 0; i < ARTIFACT_TAB_RB_PRESSES; i++) {
    //   await gwindow.gamepadPress(XUSB_BUTTON.RIGHT_SHOULDER)
    //   await sleep(200)
    // }
    // Switching tabs selects the first artifact
    this.current = 0
  }

  teardown() {
    this.navigator.gwindow.gamepadDisconnect()
  }

  async *batches() {
    for (let row = 0; ; row++) {
      yield Array.from({ length: this.cols }, (_, col) => row * this.cols + col)
    }
  }

  async select(index: number) {
    // Flicks wrap across rows, so the selection moves through artifacts in order
    const direction = Math.sign(index - this.current)
    for (let i = 0; i < Math.abs(index - this.current); i++) {
      await this.navigator.gwindow.leftStickFlick(direction, 0)
    }
    this.current = index
  }

  markSelected(index: number) {
    this.current = index
  }

  async toggleLock() {
    await this.navigator.gwindow.gamepadPress(XUSB_BUTTON.RIGHT_THUMB)
    await sleep(200)
  }
}
