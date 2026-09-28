import fs from 'fs'
import path from 'path'

import sharp, { Sharp } from 'sharp'
import { describe, expect, test, vi } from 'vitest'

import { ScreenMap } from './landmarks'
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
    describe('aspect ratios', () => {
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

    test.each(['duplicateSubkeyIssue', 'unactivatedSubkey'])(
      '%s',
      async (baseName) => {
        const pngFile = `${baseName}.png`
        const jsonFile = `${baseName}.json`
        const testImagesDir = path.join(__dirname, 'testimages')
        const imagePath = path.join(testImagesDir, pngFile)
        const jsonPath = path.join(testImagesDir, jsonFile)
        const image = sharp(imagePath).removeAlpha()
        const testGenshinWindow = await createTestWindow(image)
        const navigator = new Navigator(testGenshinWindow)
        const expected = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
        const artifacts = await navigator.getArtifact(image)
        expect(artifacts).toEqual(expected)
      }
    )
  })

  describe('isSameArtifact', () => {
    const screenshotA = path.join(
      __dirname,
      'landmarks/maps/16x9/screenshot.png'
    )
    const screenshotB = path.join(
      __dirname,
      'testimages/duplicateSubkeyIssue.png'
    )

    /** Rebuilds a screenshot after editing its raw RGB pixels */
    async function editPixels(
      imagePath: string,
      edit: (pixels: Buffer, width: number) => void
    ) {
      const { data, info } = await sharp(imagePath)
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true })
      edit(data, info.width)
      return sharp(data, {
        raw: { width: info.width, height: info.height, channels: 3 },
      })
    }

    async function createNavigator(imagePath: string) {
      return new Navigator(
        await createTestWindow(sharp(imagePath).removeAlpha())
      )
    }

    test('matches the same screenshot', async () => {
      const navigator = await createNavigator(screenshotA)
      const image = sharp(screenshotA).removeAlpha()
      expect(await navigator.isSameArtifact(image, image.clone())).toBe(true)
    })

    test('tolerates slight capture noise', async () => {
      const navigator = await createNavigator(screenshotA)
      const noisy = await editPixels(screenshotA, (pixels) => {
        for (let i = 0; i < pixels.length; i++) {
          pixels[i] = Math.min(255, pixels[i] + (i % 2))
        }
      })
      expect(
        await navigator.isSameArtifact(sharp(screenshotA).removeAlpha(), noisy)
      ).toBe(true)
    })

    test('distinguishes different artifacts', async () => {
      const navigator = await createNavigator(screenshotA)
      expect(
        await navigator.isSameArtifact(
          sharp(screenshotA).removeAlpha(),
          sharp(screenshotB).removeAlpha()
        )
      ).toBe(false)
    })

    test('ignores the lock icon', async () => {
      const navigator = await createNavigator(screenshotA)
      const { left, top, width, height } =
        navigator.landmarks[ScreenMap.ARTIFACTS].card_lock.region()
      // Invert the lock icon, as if it had been toggled
      const toggled = await editPixels(screenshotA, (pixels, imageWidth) => {
        for (let y = top; y < top + height; y++) {
          for (let x = left; x < left + width; x++) {
            for (let channel = 0; channel < 3; channel++) {
              const i = (y * imageWidth + x) * 3 + channel
              pixels[i] = 255 - pixels[i]
            }
          }
        }
      })
      expect(
        await navigator.isSameArtifact(
          sharp(screenshotA).removeAlpha(),
          toggled
        )
      ).toBe(true)
    })
  })
})
