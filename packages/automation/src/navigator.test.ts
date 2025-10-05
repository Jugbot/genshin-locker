import path from 'path'

import sharp from 'sharp'
import { describe, expect, test, vi } from 'vitest'

import { Navigator } from './navigator'
import { GenshinWindow } from './window'

class TestGenshinWindow extends GenshinWindow {
  width = 1920n
  height = 1080n
  grab() {
    return true
  }
}

const testGenshinWindow = new TestGenshinWindow()

// Avoid loading windows binaries in CI
vi.mock('./window/winapi.ts')

describe('Navigator', () => {
  describe('readArtifacts', () => {
    test('8x5', async () => {
      const navigator = new Navigator(testGenshinWindow)
      const imagePath = path.join(
        __dirname,
        'landmarks/maps/8x5/screenshot.png'
      )
      const image = sharp(imagePath).removeAlpha()
      const artifacts = await navigator.getArtifact(image)

      expect(artifacts).toMatchObject({
        level: 20,
        location: 0,
        lock: true,
        mainStatKey: 'hp',
        mainStatValue: 4780,
        rarity: 5,
        setKey: 'ObsidianCodex',
        slotKey: 'flower',
        substats: [
          {
            key: 'critRate_',
            value: 13.21,
          },
          {
            key: 'enerRech_',
            value: 6.5,
          },
          {
            key: 'atk',
            value: 27,
          },
          {
            key: 'critDMG_',
            value: 12.4,
          },
        ],
      })
    })

    test.skip('16x9', async () => {
      const navigator = new Navigator(testGenshinWindow)
      const imagePath = path.join(
        __dirname,
        'landmarks/maps/16x9/screenshot.png'
      )
      const image = sharp(imagePath).removeAlpha()
      const artifacts = await navigator.getArtifact(image)

      expect(artifacts).toMatchInlineSnapshot()
    })

    test.skip('43x18', async () => {
      const navigator = new Navigator(testGenshinWindow)
      const imagePath = path.join(
        __dirname,
        'landmarks/maps/43x18/screenshot.png'
      )
      const image = sharp(imagePath).removeAlpha()
      const artifacts = await navigator.getArtifact(image)

      expect(artifacts).toMatchInlineSnapshot()
    })
  })
})
