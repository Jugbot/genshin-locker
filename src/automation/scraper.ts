import tesseract from 'node-tesseract-ocr'
import { Landmarks, load, ScreenMap } from './landmarks/landmarks'
import { GenshinWindow } from './window'
import sharp from 'sharp'
import path from 'path'
import os from 'os'
import fs from 'fs'

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

  async getArtifact() {
    this.gwindow.grab()
    const image = await this.gwindow.capture()
    const fileName = path.join(os.tmpdir(), `temp-${new Date().getTime()}.png`)
    image.toFile(fileName, (err) => {
      if (err) {
        console.error(err)
      } else {
        console.log('The file was saved!')
      }
    })
    console.log(fileName)
    // tesseract.recognize(image, {
    //   // "tessdata-dir": "",
    //   // lang: "genshin_best_eng",
    //   psm: 7,
    //   oem: 3,
    // })
  }
}
