// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { GenshinWindow } from './automation/window'
const window = new GenshinWindow()
window.capture()
window.click(528, 960)
