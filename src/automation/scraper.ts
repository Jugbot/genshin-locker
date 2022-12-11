import tesseract from 'node-tesseract-ocr'
import { Landmarks, load, ScreenMap } from './landmarks/landmarks'
import { GenshinWindow } from './window'
import { Sharp } from 'sharp'
import path from 'path'
import os from 'os'

export class Scraper {
  gwindow: GenshinWindow
  landmarks: Landmarks
  constructor() {
    this.gwindow = new GenshinWindow()
    this.gwindow.grab()
    const landmarks = load(
      Number(this.gwindow.width),
      Number(this.gwindow.height)
    )
    if (!landmarks) {
      throw Error('Resolution not supported.')
    }
    this.landmarks = landmarks
  }

  click(id: keyof Landmarks[ScreenMap.ARTIFACTS]) {
    const [x, y] = this.landmarks[ScreenMap.ARTIFACTS][id].center()
    this.gwindow.goto(x, y)
    this.gwindow.click()
  }

  *clickAll(id: keyof Landmarks[ScreenMap.ARTIFACTS]) {
    const centers = this.landmarks[ScreenMap.ARTIFACTS][id].centers()
    for (const point of centers) {
      const [x, y] = point
      this.gwindow.goto(x, y)
      this.gwindow.click()
      yield
    }
  }

  #debugPrint(image: Sharp) {
    const fileName = path.join(os.tmpdir(), `temp-${new Date().getTime()}.png`)
    image.toFile(fileName, (err) => {
      if (err) {
        console.error(err)
      } else {
        console.log('The file was saved!')
      }
    })
    console.log(fileName)
  }

  async #readText(
    image: Sharp,
    id: keyof Landmarks[ScreenMap.ARTIFACTS]
  ): Promise<string[]> {
    const cropped = image.extract(
      this.landmarks[ScreenMap.ARTIFACTS][id].region()
    )
    const tessConfig: tesseract.Config = {
      // "tessdata-dir": "",
      // lang: "genshin_best_eng",
      psm: 7,
      oem: 3,
    }
    return await Promise.all(
      Array.from(this.landmarks[ScreenMap.ARTIFACTS][id].regions()).map(
        async (region) => {
          return await tesseract.recognize(
            await cropped.extract(region).toBuffer(),
            tessConfig
          )
        }
      )
    )
  }

  async #pixelTest(
    image: Sharp,
    id: keyof Landmarks[ScreenMap.ARTIFACTS],
    color: number[]
  ) {
    const { height } = await image.metadata()
    if (!height) {
      throw Error()
    }
    const bytes = await image.raw().toBuffer()
    const channels = color.length
    const getPixel = (x: number, y: number) => {
      const index = (y * height + x) * channels
      return Array.from(bytes.subarray(index, index + channels))
    }
    return Array.from(this.landmarks[ScreenMap.ARTIFACTS][id].centers())
      .map(([cx, cy]) => getPixel(cx, cy))
      .filter((pixel) => pixel === color).length
  }

  async getArtifact() {
    this.gwindow.grab()
    const image = await this.gwindow.capture()
    const imageInverted = image.toColorspace('b-w').negate()
    const result = {
      setKey: this.#readText(image, 'card_set'),
      slotKey: this.#readText(image, 'card_slot_type'),
      rarity: this.#pixelTest(image, 'card_rarity', [255, 204, 50]),
      mainStatKey: this.#readText(image, 'card_mainstat_key'),
      level: this.#readText(image, 'card_level'),
      substats: this.#readText(image, 'card_substat'),
      lock: this.#readText(image, 'card_lock'),
      cardName: this.#readText(image, 'card_name'),
      mainStatValue: this.#readText(image, 'card_mainstat_value'),
    }

    return {}
  }
}
