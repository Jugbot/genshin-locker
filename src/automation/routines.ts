import { mainWindow } from '..'
import { mainApi } from '../api'
import { Channel } from '../apiTypes'

import { ScreenMap } from './landmarks/landmarks'
import { Navigator } from './navigator'
import { calculate } from './scoring/logic'
import { Logic, Scoring, Bucket } from './scoring/types'
import { Artifact } from './types'
import { GBRAtoRGB } from './util/image'
import { VK } from './window/winconst'

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

export type RoutineOptions = {
  logic: Logic<Scoring>
  targetAttributes: Bucket
  lockWhileScanning: boolean
}

export async function readArtifacts({
  logic,
  targetAttributes,
  lockWhileScanning,
}: RoutineOptions) {
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
  await sleep(200)

  const total = await navigator.getArtifactCount(
    await navigator.gwindow.captureBGRA().then(GBRAtoRGB)
  )
  mainApi.send(
    mainWindow.webContents,
    Channel.LOG,
    'info',
    `Reading ${total} artifacts total`
  )
  const { repeat_y: rowsPerPage, repeat_x: itemsPerRow } =
    navigator.landmarks[ScreenMap.ARTIFACTS].list_item
  let count = 0

  const totalArtifacts: Promise<Artifact>[] = []
  while (count < total) {
    const pageActions: (() => Promise<unknown>)[] = []
    for (const click of navigator.clickAll('list_item')) {
      pageActions.push(async () => {
        click()
        await sleep(200)
        const imageBGRA = await navigator.gwindow.captureBGRA()
        const artifactPromise = GBRAtoRGB(imageBGRA).then((image) =>
          navigator.getArtifact(image)
        )
        totalArtifacts.push(artifactPromise)
        artifactPromise.then(async (artifact) => {
          const shouldBeLocked = await calculate(
            artifact,
            logic,
            targetAttributes
          )
          if (lockWhileScanning && shouldBeLocked !== artifact.lock) {
            const lockArtifact = async () => {
              // navigate to the artifact we want to lock again
              click()
              await sleep(200)
              navigator.click('card_lock')
              await sleep(200)
            }
            pageActions.push(lockArtifact)
          }
          mainApi.send(
            mainWindow.webContents,
            Channel.ARTIFACT,
            artifact,
            shouldBeLocked
          )
        })
      })
      count += 1
      mainApi.send(mainWindow.webContents, Channel.PROGRESS, {
        current: count,
        max: total,
      })
      if (count === total) {
        break
      }
    }
    // Wait for all artifacts to be read
    // await Promise.all(totalArtifacts)
    // Exhaust sequential actions on artifacts
    for (const action of pageActions) {
      await action()
      if (navigator.gwindow.keydown(VK.SPACE)) {
        throw Error('Keyboard Interrupt')
      }
    }
    const remaining = total - count
    const remainingRows = Math.min(
      Math.floor(remaining / itemsPerRow),
      rowsPerPage
    )
    await navigator.scrollArtifacts(remainingRows)
  }

  return Promise.all(totalArtifacts)
}
