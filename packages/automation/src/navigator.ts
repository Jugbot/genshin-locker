import os from 'os'
import path from 'path'

import { mainApi } from '@gl/ipc-api'
import { Artifact, Channel } from '@gl/types'
import { Region, Sharp } from 'sharp'

import { Landmarks, load, ScreenMap } from './landmarks'
import { createOCR } from './ocr'
import {
  getArtifactSet,
  getMainStat,
  getNumber,
  getSlot,
  getSubstats,
  removeWhitespace,
} from './util/scraper'
import { GenshinWindow } from './window'

type Offset = [x: number, y: number]

// Active substat text is ~83 at its darkest, unactivated text is ~156
const UNACTIVATED_SUBSTAT_MIN_BRIGHTNESS = 120
// Largest per-channel difference allowed for two captures to be considered unchanged
const SAME_IMAGE_MAX_DIFF = 16

export class Navigator {
  gwindow: GenshinWindow
  landmarks: Landmarks
  ocr: ReturnType<typeof createOCR>
  constructor(gwindow = new GenshinWindow(), ocr = createOCR()) {
    this.gwindow = gwindow
    this.ocr = ocr
    if (!this.gwindow.grab()) {
      mainApi.send(
        Channel.LOG,
        'error',
        `Could not find the Genshin Impact window.`
      )
      throw new Error('Could not find the Genshin Impact window.')
    }
    const landmarks = load(
      Number(this.gwindow.width),
      Number(this.gwindow.height)
    )
    if (!landmarks) {
      mainApi.send(Channel.LOG, 'error', 'Resolution not supported.')
      throw new Error('Resolution not supported.')
    }
    this.landmarks = landmarks
  }

  click(id: keyof Landmarks[ScreenMap.ARTIFACTS], offset: Offset = [0, 0]) {
    const [offsetX, offsetY] = offset
    const [x, y] = this.landmarks[ScreenMap.ARTIFACTS][id].center()
    this.gwindow.goto(x + offsetX, y + offsetY)
    this.gwindow.click()
  }

  *clickAll(id: keyof Landmarks[ScreenMap.ARTIFACTS]) {
    const centers = this.landmarks[ScreenMap.ARTIFACTS][id].centers()
    for (const point of centers) {
      const [x, y] = point
      yield () => {
        this.gwindow.goto(x, y)
        this.gwindow.click()
      }
    }
  }

  async resetScroll() {
    const landmark = this.landmarks[ScreenMap.ARTIFACTS]['scrollbar_top']

    const from = landmark.center()
    this.gwindow.goto(...from)
    this.gwindow.mouseDown()
    // In order to scroll to the top you can click the top of the scroll bar.
    // But to have the page scroll instantly you need to mousedown then drag off the scrollbar
    await this.gwindow.move(landmark.w, -landmark.h, 100)
    this.gwindow.mouseUp()
  }

  async scrollArtifacts(rows: number) {
    const landmark = this.landmarks[ScreenMap.ARTIFACTS]['list_item']
    const from = landmark.at(0, landmark.repeat_y - 1).center()
    this.gwindow.goto(...from)
    this.gwindow.mouseDown()
    // Break mouse drag deadzone
    await this.gwindow.move(100, 0, 100)
    await this.gwindow.move(-100, 0, 100)
    await this.gwindow.move(0, -landmark.h * rows, 1000)
    await new Promise((res) => setTimeout(res, 1000))
    this.gwindow.mouseUp()
    // Prevent momentum after drag
    this.gwindow.click()
  }

  async debugPrint(image: Sharp) {
    const fileName = path.join(
      os.tmpdir(),
      `temp-${new Date().getTime()}-${(Math.random() * 1000).toFixed(0)}.png`
    )
    console.info(fileName)
    await image
      .toFile(fileName)
      .catch((err) => console.error(err))
      .then(() => console.info('The file was saved!'))
    return fileName
  }

  async #readTexts(
    image: Sharp,
    id: keyof Landmarks[ScreenMap.ARTIFACTS],
    offset: Offset = [0, 0]
  ): Promise<string[]> {
    const [offsetX, offsetY] = offset
    return Promise.all(
      Array.from(this.landmarks[ScreenMap.ARTIFACTS][id].regions()).map(
        async (region) => {
          const imageRegion = image
            .clone()
            .extract({
              ...region,
              left: region.left + offsetX,
              top: region.top + offsetY,
            })
            .withMetadata()
            .png()
          return this.ocr.then(async (ocr) =>
            ocr.recognize(await imageRegion.toBuffer())
          )
        }
      )
    )
  }

  async #readText(
    image: Sharp,
    id: keyof Landmarks[ScreenMap.ARTIFACTS],
    offset: Offset = [0, 0]
  ): Promise<string> {
    return this.#readTexts(image, id, offset).then(([txt]) => txt)
  }

  async #pixelTest(
    image: Sharp,
    id: keyof Landmarks[ScreenMap.ARTIFACTS],
    colorLower: number[],
    colorUpper: number[] = [],
    offset: Offset = [0, 0]
  ) {
    const [offsetX, offsetY] = offset
    if (colorUpper.length === 0) {
      colorUpper = colorLower
    }
    const points = Array.from(
      this.landmarks[ScreenMap.ARTIFACTS][id].centers()
    ).map(
      ([cx, cy]): Offset => [Math.floor(cx) + offsetX, Math.floor(cy) + offsetY]
    )
    // Extract the bounding box of all points once rather than one pipeline per pixel
    const left = Math.min(...points.map(([x]) => x))
    const top = Math.min(...points.map(([, y]) => y))
    const width = Math.max(...points.map(([x]) => x)) - left + 1
    const height = Math.max(...points.map(([, y]) => y)) - top + 1
    const { data, info } = await image
      .clone()
      .extract({ left, top, width, height })
      .raw()
      .toBuffer({ resolveWithObject: true })
    const { channels } = info
    if (colorLower.length !== channels) {
      throw Error(
        `Pixel test colorLower is not of length ${channels}, was ${colorLower.length}`
      )
    }
    if (colorUpper.length !== channels) {
      throw Error(
        `Pixel test colorUpper is not of length ${channels}, was ${colorUpper.length}`
      )
    }
    const results = points.map(([x, y]) => {
      const start = ((y - top) * width + (x - left)) * channels
      return Array.from(data.subarray(start, start + channels))
    })

    return results.filter((pixel) => {
      return pixel.every((color, i) => {
        return colorLower[i] <= color && color <= colorUpper[i]
      })
    }).length
  }

  /**
   * Finds the darkest pixel value in each region of a grayscale image
   */
  async #darkestPixels(
    image: Sharp,
    id: keyof Landmarks[ScreenMap.ARTIFACTS],
    offset: Offset = [0, 0]
  ): Promise<number[]> {
    const [offsetX, offsetY] = offset
    return Promise.all(
      Array.from(this.landmarks[ScreenMap.ARTIFACTS][id].regions()).map(
        async (region) => {
          const pixels = await image
            .clone()
            .extract({
              ...region,
              left: region.left + offsetX,
              top: region.top + offsetY,
            })
            .raw()
            .toBuffer()
          return pixels.reduce((a, b) => Math.min(a, b), 255)
        }
      )
    )
  }

  async getArtifactCount(image: Sharp): Promise<number> {
    const line = await this.#readText(image, 'artifact_count')
    return Number.parseInt(line.match(/\d+/g)?.[0] ?? '')
  }

  /**
   * The bounding box containing every given region
   */
  #containingRegion(...regions: Region[]): Region {
    const left = Math.min(...regions.map((r) => r.left))
    const top = Math.min(...regions.map((r) => r.top))
    const right = Math.max(...regions.map((r) => r.left + r.width))
    const bottom = Math.max(...regions.map((r) => r.top + r.height))
    return { left, top, width: right - left, height: bottom - top }
  }

  /**
   * The region containing all relevant card details
   */
  cardRegion(): Region {
    return this.#containingRegion(
      ...this.landmarks[ScreenMap.ARTIFACTS]['card_name'].regions(),
      ...this.landmarks[ScreenMap.ARTIFACTS]['card_substat'].regions()
    )
  }

  /**
   * Detects if a region is (nearly) identical between two images
   */
  async isSameImage(a: Sharp, b: Sharp, region: Region) {
    const [pixelsA, pixelsB] = await Promise.all(
      [a, b].map((image) => image.clone().extract(region).raw().toBuffer())
    )
    if (pixelsA.length !== pixelsB.length) {
      return false
    }
    for (let i = 0; i < pixelsA.length; i += 1) {
      if (Math.abs(pixelsA[i] - pixelsB[i]) > SAME_IMAGE_MAX_DIFF) {
        return false
      }
    }
    return true
  }

  /**
   * Artifact EXP materials (Sanctifying Unction/Essence) are sorted after all artifacts
   */
  async isEnhancementMaterial(image: Sharp): Promise<boolean> {
    const name = await this.#readText(
      image.clone().toColorspace('b-w').negate(),
      'card_name'
    )
    return /sanctifying/i.test(removeWhitespace(name))
  }

  async getRarity(image: Sharp): Promise<number> {
    return this.#pixelTest(image, 'card_rarity', [255, 204, 50])
  }

  async getArtifact(image: Sharp): Promise<Artifact> {
    const imageBW = image.clone().toColorspace('b-w')
    const imageBWInverted = imageBW.clone().negate()

    const elixirLandmark = this.landmarks[ScreenMap.ARTIFACTS]['elixir']
    const isElixired = await this.#pixelTest(
      image.clone().extractChannel('blue'),
      'elixir',
      [250],
      [255],
      [-Math.floor(elixirLandmark.w * 0.48), 0]
    )

    const elixirOffsetY = isElixired ? elixirLandmark.h : 0
    const elixirOffset: Offset = [0, elixirOffsetY]

    const [
      card_slot_type,
      card_rarity,
      card_mainstat_key,
      card_level,
      card_substat,
      card_substat_darkest,
      card_lock,
      card_mainstat_value,
    ] = await Promise.all([
      this.#readText(imageBWInverted, 'card_slot_type'),
      this.getRarity(image),
      this.#readText(imageBWInverted, 'card_mainstat_key'),
      this.#readText(
        imageBW.clone().threshold(230),
        'card_level',
        elixirOffset
      ),
      this.#readTexts(image, 'card_substat', elixirOffset),
      this.#darkestPixels(imageBW, 'card_substat', elixirOffset),
      this.#pixelTest(
        image.clone().extractChannel('green'),
        'card_lock',
        [0],
        [150],
        elixirOffset
      ),
      this.#readText(imageBWInverted, 'card_mainstat_value'),
    ])
    // Cleanup & Validation
    const slotKey = getSlot(card_slot_type)
    const [mainStatKey, mainStatValue] = getMainStat(
      card_mainstat_key,
      card_mainstat_value
    )
    const level = getNumber(card_level)
    const rarity = card_rarity
    const unactivated = card_substat_darkest.map(
      (darkest) => darkest > UNACTIVATED_SUBSTAT_MIN_BRIGHTNESS
    )
    const { substats, unactivatedSubstats } = getSubstats(
      card_substat,
      unactivated,
      level
    )
    const substatLandmark = this.landmarks[ScreenMap.ARTIFACTS]['card_substat']
    const missingSubstatLines =
      substatLandmark.repeat_y - substats.length - unactivatedSubstats.length
    const card_set = await this.#readText(
      image.clone().extractChannel('blue').threshold(125, { grayscale: false }),
      'card_set',
      [0, elixirOffsetY - missingSubstatLines * substatLandmark.h]
    )
    const setKey = getArtifactSet(card_set)
    const lock = Boolean(card_lock)

    return {
      id: [
        setKey,
        rarity,
        slotKey,
        mainStatKey,
        mainStatValue,
        ...[...substats, ...unactivatedSubstats].flatMap((stat) => [
          stat.key,
          stat.value,
        ]),
      ].join('|'),
      level,
      location: 0,
      lock,
      mainStatKey,
      mainStatValue,
      rarity,
      setKey,
      slotKey,
      substats,
      unactivatedSubstats,
    }
  }
}
