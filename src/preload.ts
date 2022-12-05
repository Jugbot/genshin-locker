// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge } from 'electron'

import { GenshinWindow } from './automation/window'
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
