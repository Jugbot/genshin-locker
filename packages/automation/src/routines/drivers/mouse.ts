import { ScreenMap } from '../../landmarks'
import type { Navigator } from '../../navigator'
import type { GenshinWindow } from '../../window'
import { sleep } from '../util'

import type { InputDriver } from './types'

export type MouseNavigator = Pick<
  Navigator,
  'click' | 'clickAll' | 'resetScroll' | 'scrollArtifacts' | 'landmarks'
> & { gwindow: Pick<GenshinWindow, 'goto' | 'scroll'> }

/**
 * Clicks artifacts directly. Batches are pages of the grid, scrolled by dragging.
 */
export class MouseDriver implements InputDriver {
  private navigator: MouseNavigator
  private clickArray: Array<() => void>
  private rowsPerPage: number
  private perPage: number

  constructor(navigator: MouseNavigator) {
    this.navigator = navigator
    const { repeat_x, repeat_y } =
      navigator.landmarks[ScreenMap.ARTIFACTS].list_item
    this.rowsPerPage = repeat_y
    this.perPage = repeat_x * repeat_y
    this.clickArray = Array.from(navigator.clickAll('list_item'))
  }

  async setup() {
    const { navigator } = this
    navigator.click('menu_artifacts')
    await sleep(200)
    await navigator.resetScroll()
    await sleep(200)

    navigator.gwindow.goto(
      ...navigator.landmarks[ScreenMap.ARTIFACTS].card_name.center()
    )
    navigator.gwindow.scroll(100, 'clicks')
    await sleep(200)
  }

  teardown() {
    // Nothing to release
  }

  async *batches() {
    for (let page = 0; ; page++) {
      if (page > 0) {
        await this.navigator.scrollArtifacts(this.rowsPerPage)
      }
      yield Array.from(
        { length: this.perPage },
        (_, slot) => page * this.perPage + slot
      )
    }
  }

  async select(index: number) {
    this.clickArray[index % this.perPage]()
    await sleep(150)
  }

  async toggleLock() {
    this.navigator.click('card_lock')
    await sleep(200)
  }
}
