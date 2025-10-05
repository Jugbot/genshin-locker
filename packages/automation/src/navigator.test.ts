import path from 'path'

import sharp, { Sharp } from 'sharp'
import { describe, expect, test, vi } from 'vitest'

import { Navigator } from './navigator'
import { GenshinWindow } from './window'

async function createTestWindow(image: Sharp) {
  const { width, height } = await image.metadata()
  class MockGenshinWindow extends GenshinWindow {
    grab() {
      return true
    }
  }

  const window = new MockGenshinWindow()
  window.width = BigInt(width || 0)
  window.height = BigInt(height || 0)

  return window
}

// Avoid loading windows binaries in CI
vi.mock('./window/winapi.ts')

describe('Navigator', () => {
  describe('readArtifacts', () => {
    test('8x5', async () => {
      const imagePath = path.join(
        __dirname,
        'landmarks/maps/8x5/screenshot.png'
      )
      const image = sharp(imagePath).removeAlpha()
      const testGenshinWindow = await createTestWindow(image)
      const navigator = new Navigator(testGenshinWindow)

      const artifacts = await navigator.getArtifact(image)

      expect(artifacts).toMatchInlineSnapshot(`
        {
          "id": "ObsidianCodex|5|flower|hp|4780|critRate_|13.2|enerRech_|6.5|atk|27|critDMG_|12.4",
          "level": 20,
          "location": 0,
          "lock": true,
          "mainStatKey": "hp",
          "mainStatValue": 4780,
          "name": "Reckoning of the Xenogenic
        ",
          "rarity": 5,
          "setKey": "ObsidianCodex",
          "slotKey": "flower",
          "substats": [
            {
              "key": "critRate_",
              "value": 13.2,
            },
            {
              "key": "enerRech_",
              "value": 6.5,
            },
            {
              "key": "atk",
              "value": 27,
            },
            {
              "key": "critDMG_",
              "value": 12.4,
            },
          ],
        }
      `)
    })

    test('16x9', async () => {
      const imagePath = path.join(
        __dirname,
        'landmarks/maps/16x9/screenshot.png'
      )
      const image = sharp(imagePath).removeAlpha()
      const testGenshinWindow = await createTestWindow(image)
      const navigator = new Navigator(testGenshinWindow)

      const artifacts = await navigator.getArtifact(image)

      expect(artifacts).toMatchInlineSnapshot(`
        {
          "id": "ObsidianCodex|5|circlet|critDMG_|62.2|atk|16|critRate_|3.9|atk_|5.8|eleMas|91",
          "level": 20,
          "location": 0,
          "lock": true,
          "mainStatKey": "critDMG_",
          "mainStatValue": 62.2,
          "name": "Crown of the Saints
        ",
          "rarity": 5,
          "setKey": "ObsidianCodex",
          "slotKey": "circlet",
          "substats": [
            {
              "key": "atk",
              "value": 16,
            },
            {
              "key": "critRate_",
              "value": 3.9,
            },
            {
              "key": "atk_",
              "value": 5.8,
            },
            {
              "key": "eleMas",
              "value": 91,
            },
          ],
        }
      `)
    })

    test('43x18', async () => {
      const imagePath = path.join(
        __dirname,
        'landmarks/maps/43x18/screenshot.png'
      )
      const image = sharp(imagePath).removeAlpha()
      const testGenshinWindow = await createTestWindow(image)
      const navigator = new Navigator(testGenshinWindow)

      const artifacts = await navigator.getArtifact(image)

      expect(artifacts).toMatchInlineSnapshot(`
        {
          "id": "ObsidianCodex|5|flower|hp|4780|critRate_|13.2|enerRech_|6.5|atk|27|critDMG_|12.4",
          "level": 20,
          "location": 0,
          "lock": true,
          "mainStatKey": "hp",
          "mainStatValue": 4780,
          "name": "Reckoning of the Xenogenic
        ",
          "rarity": 5,
          "setKey": "ObsidianCodex",
          "slotKey": "flower",
          "substats": [
            {
              "key": "critRate_",
              "value": 13.2,
            },
            {
              "key": "enerRech_",
              "value": 6.5,
            },
            {
              "key": "atk",
              "value": 27,
            },
            {
              "key": "critDMG_",
              "value": 12.4,
            },
          ],
        }
      `)
    })
  })
})
