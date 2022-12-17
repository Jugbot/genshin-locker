import { ScreenMap } from './landmarks/landmarks'
import { Navigator } from './navigator'
import { Artifact } from './types'
import { VK } from './window/winconst'

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

export async function readArtifacts() {
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

  const total = await navigator.getArtifactCount()
  console.log({ total })
  const { repeat_y: rowsPerPage, repeat_x: itemsPerRow } =
    navigator.landmarks[ScreenMap.ARTIFACTS].list_item
  let count = 0

  const totalArtifacts: Artifact[] = []
  // eslint-disable-next-line no-constant-condition
  while (true) {
    for (const click of navigator.clickAll('list_item')) {
      click()
      await sleep(200)
      count += 1
      const artifact = await navigator.getArtifact()
      if (artifact.rarity < 5) {
        return totalArtifacts
      }
      totalArtifacts.push(artifact)
      if (count === total) {
        return totalArtifacts
      }
      if (navigator.gwindow.keydown(VK.SPACE)) {
        throw Error('Keyboard Interrupt')
      }
    }
    console.log('next row')
    const remaining = total - count
    const remainingRows = Math.min(
      Math.floor(remaining / itemsPerRow),
      rowsPerPage
    )
    console.log({ remainingRows })
    await navigator.scrollArtifacts(remainingRows)
  }
}
