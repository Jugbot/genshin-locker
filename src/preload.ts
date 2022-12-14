import { contextBridge } from 'electron'

import child_process from 'child_process'
import { Navigator } from './automation/navigator'

try {
  child_process.execFileSync('net', ['session'], { stdio: 'ignore' })
  console.log('Successfully gained priviledge')
} catch (e) {
  console.error('Requires elevated permssions')
  throw e
}

const actions = {
  click() {
    const scraper = new Navigator()
    scraper.gwindow.click()
  },
  drag() {
    const scraper = new Navigator()
    scraper.gwindow.drag(0, 120)
  },
  async scroll() {
    const scraper = new Navigator()
    scraper.gwindow.grab()
    for (let i = 0; i < 5; i++) {
      await scraper.scrollArtifacts(4)
      await new Promise((res) => setTimeout(res, 200))
    }
  },
  capture() {
    const scraper = new Navigator()
    scraper.getArtifact().then(console.log)
  },
}

contextBridge.exposeInMainWorld('actions', actions)

declare global {
  interface Window {
    actions: typeof actions
  }
}
