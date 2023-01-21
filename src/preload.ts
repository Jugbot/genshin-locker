import child_process from 'child_process'
import { contextBridge } from 'electron'

import { readArtifacts } from './automation/routines'

try {
  child_process.execFileSync('net', ['session'], { stdio: 'ignore' })
  console.log('Successfully gained priviledge')
} catch (e) {
  console.error('Requires elevated permssions')
  throw e
}

const actions = {
  routine() {
    readArtifacts({
      percentile: 0.2,
      targetAttributes: { set: true, slot: true, main: false, sub: false },
    }).then(console.log)
  },
}

contextBridge.exposeInMainWorld('actions', actions)

declare global {
  interface Window {
    actions: typeof actions
  }
}
