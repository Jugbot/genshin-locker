import { ScreenMap } from './landmarks/landmarks'
import { Navigator } from './navigator'
import { Artifact } from './types'

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

export async function readArtifacts() {
  const navigator = new Navigator()
  navigator.gwindow.grab()
  navigator.click('menu_artifacts')
  await sleep(200)
  navigator.click('sort_dir')
  navigator.click('sort_dir')

  const total = await navigator.getArtifactCount()
  const { repeat_y: rowsPerPage, repeat_x: itemsPerRow } =
    navigator.landmarks[ScreenMap.ARTIFACTS].list_item
  let count = 0

  const totalArtifacts: Artifact[] = []
  // eslint-disable-next-line no-constant-condition
  while (true) {
    for (const click of navigator.clickAll('list_item')) {
      click()
      count += 1
      const artifact = await navigator.getArtifact()
      if (artifact.rarity < 5) {
        return totalArtifacts
      }
      totalArtifacts.push(artifact)
      if (count === total) {
        return totalArtifacts
      }
    }
    const remaining = total - count
    const remainingRows = Math.min(
      Math.floor(remaining / itemsPerRow),
      rowsPerPage
    )
    navigator.scrollArtifacts(remainingRows)
  }
}
