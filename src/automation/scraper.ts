import tesseract from 'node-tesseract-ocr'
import { Landmarks, load, ScreenMap } from './landmarks/landmarks'
import { GenshinWindow } from './window'

export class Scraper {
  gwindow: GenshinWindow
  landmarks: Landmarks
  constructor() {
    this.gwindow = new GenshinWindow()
    const landmarks = load(
      Number(this.gwindow.width),
      Number(this.gwindow.height)
    )
    if (!landmarks) {
      throw Error('Resolution not supported.')
    }
    this.landmarks = landmarks
  }

  clickArtifactLock() {
    const [x, y] = this.landmarks[ScreenMap.ARTIFACTS]['card_lock'].center()
    this.gwindow.goto(x, y)
    this.gwindow.click()
  }

  getArtifact() {
    tesseract
  }
}
