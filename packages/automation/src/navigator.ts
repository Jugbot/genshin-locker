import os from 'os'
import path from 'path'

import { mainApi } from '@gl/ipc-api'
import { Artifact, Channel } from '@gl/types'
import { Region, Sharp } from 'sharp'

import { Landmarks, ScreenMap, load } from './landmarks'
import { OCR } from './ocr'
import {
  getArtifactSet,
  getMainStat,
  getNumber,
  getSlot,
  getSubstats,
} from './util/scraper'
import { GenshinWindow } from './window'

type Offset = [x: number, y: number]

export class Navigator {
  gwindow: GenshinWindow
  landmarks: Landmarks
  ocr = new OCR()
  constructor() {
    this.gwindow = new GenshinWindow()
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

  debugPrint(image: Sharp) {
    const fileName = path.join(os.tmpdir(), `temp-${new Date().getTime()}.png`)
    image.toFile(fileName, (err) => {
      if (err) {
        console.error(err)
      } else {
        console.info('The file was saved!')
      }
    })
    console.info(fileName)
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
          return this.ocr.recognize(await imageRegion.toBuffer())
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
    const getPixel = async (x: number, y: number) => {
      const bytes = await image
        .clone()
        .extract({
          top: Math.floor(y) + offsetY,
          left: Math.floor(x) + offsetX,
          width: 1,
          height: 1,
        })
        .raw()
        .toBuffer()
      const pixel = Array.from(bytes)
      if (
        colorLower.length !== colorUpper.length ||
        colorUpper.length !== pixel.length
      ) {
        throw Error(
          `Pixel test color range start or end are not of length ${pixel.length}`
        )
      }
      return pixel
    }
    const results = await Promise.all(
      Array.from(this.landmarks[ScreenMap.ARTIFACTS][id].centers()).map(
        ([cx, cy]) => getPixel(cx, cy)
      )
    )

    return results.filter((pixel) => {
      return pixel.every((color, i) => {
        return colorLower[i] <= color && color <= colorUpper[i]
      })
    }).length
  }

  async getArtifactCount(image: Sharp): Promise<number> {
    const line = await this.#readText(image, 'artifact_count')
    return Number.parseInt(line.match(/\d+/g)?.[0] ?? '')
  }

  /**
   * Detects if an image region is empty (i.e. has no edges detected)
   */
  async isEmpty(image: Sharp, region: Region) {
    const edges = image
      .clone()
      .convolve({
        // Sobel
        width: 3,
        height: 3,
        kernel: [-1, 0, 1, -2, 0, 2, -1, 0, 1],
      })
      .extract(region)
      .toColorspace('b-w')
    const pixels = await edges.raw().toBuffer()
    const max = pixels.reduce((a, b) => Math.max(a, b), 0)
    return max < 128
  }

  async getArtifact(image: Sharp): Promise<Artifact> {
    const imageBW = image.clone().toColorspace('b-w')
    const imageBWInverted = imageBW.clone().negate()

    const isElixired = await this.#pixelTest(
      image.clone().extractChannel('blue'),
      'elixir',
      [250],
      [255]
    )
    const offsetY = isElixired
      ? this.landmarks[ScreenMap.ARTIFACTS]['elixir'].region().height
      : 0
    const elixirOffset: Offset = [0, offsetY]

    const [
      card_set,
      card_slot_type,
      card_rarity,
      card_mainstat_key,
      card_level,
      card_substat,
      card_lock,
      card_name,
      card_mainstat_value,
    ] = await Promise.all([
      this.#readTexts(image, 'card_set', elixirOffset),
      this.#readText(imageBWInverted, 'card_slot_type'),
      this.#pixelTest(image, 'card_rarity', [255, 204, 50]),
      this.#readText(imageBWInverted, 'card_mainstat_key'),
      this.#readText(
        imageBW.clone().threshold(230),
        'card_level',
        elixirOffset
      ),
      this.#readTexts(image, 'card_substat', elixirOffset),
      this.#pixelTest(
        image.clone().extractChannel('green'),
        'card_lock',
        [0],
        [150],
        elixirOffset
      ),
      this.#readText(imageBWInverted, 'card_name'),
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
    const substats = getSubstats(card_substat)
    const setKey = getArtifactSet(card_set[substats.length])
    const lock = Boolean(card_lock)
    const name = card_name

    return {
      id: [
        setKey,
        rarity,
        slotKey,
        mainStatKey,
        mainStatValue,
        ...substats.flatMap((stat) => [stat.key, stat.value]),
      ].join('|'),
      level,
      location: 0,
      lock,
      mainStatKey,
      mainStatValue,
      name,
      rarity,
      setKey,
      slotKey,
      substats,
    }
  }
}
