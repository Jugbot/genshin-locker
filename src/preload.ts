// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
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

const window = new GenshinWindow()

contextBridge.exposeInMainWorld('actions', {
  click() {
    window.click(528, 960)
  },
  drag() {
    window.drag(0, 0, 0, -100)
  },
  capture() {
    window.capture()
  },
})
