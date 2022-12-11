import { contextBridge } from 'electron'

import { GenshinWindow } from './automation/window'
import child_process from 'child_process'
import { Scraper } from './automation/scraper'

try {
  child_process.execFileSync('net', ['session'], { stdio: 'ignore' })
  console.log('Successfully gained priviledge')
} catch (e) {
  console.error('Requires elevated permssions')
  throw e
}

const actions = {
  click() {
    const scraper = new Scraper()
    scraper.gwindow.click()
  },
  drag() {
    const scraper = new Scraper()
    scraper.gwindow.drag(0, 120)
  },
  scroll() {
    const scraper = new Scraper()
    const rem = scraper.gwindow.scroll(140)
    console.log({ rem })
  },
  capture() {
    const scraper = new Scraper()
    scraper.getArtifact()
  },
}

contextBridge.exposeInMainWorld('actions', actions)

declare global {
  interface Window {
    actions: typeof actions
  }
}
