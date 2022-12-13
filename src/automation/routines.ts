import { ScreenMap } from './landmarks/landmarks'
import { Scraper } from './scraper'
import { Artifact } from './types'

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

export async function readArtifacts() {
  const scraper = new Scraper()
  scraper.gwindow.grab()
  scraper.click('menu_artifacts')
  await sleep(200)
  scraper.click('sort_dir')
  scraper.click('sort_dir')

  const total = await scraper.getArtifactCount()
  const { repeat_y: rowsPerPage, repeat_x: itemsPerRow } =
    scraper.landmarks[ScreenMap.ARTIFACTS].list_item
  let count = 0

  const totalArtifacts: Artifact[] = []
  // eslint-disable-next-line no-constant-condition
  while (true) {
    for (const click of scraper.clickAll('list_item')) {
      click()
      count += 1
      const artifact = await scraper.getArtifact()
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
    scraper.scrollArtifacts(remainingRows)
  }
}
