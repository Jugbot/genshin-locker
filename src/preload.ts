import { contextBridge } from 'electron'

import { GenshinWindow } from './automation/window'
import child_process from 'child_process'

try {
  child_process.execFileSync('net', ['session'], { stdio: 'ignore' })
  console.log('Successfully gained priviledge')
} catch (e) {
  console.error('Requires elevated permssions')
  throw e
}

const gwindow = new GenshinWindow()

const actions = {
  click() {
    gwindow.click()
  },
  drag() {
    gwindow.drag(0, 120)
  },
  scroll() {
    const rem = gwindow.scroll(140)
    console.log({ rem })
  },
  capture() {
    gwindow.capture()
  },
}

contextBridge.exposeInMainWorld('actions', actions)

declare global {
  interface Window {
    actions: typeof actions
  }
}
