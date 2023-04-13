import { contextBridge } from 'electron'

import { rendererApi } from '@gl/ipc-api'

contextBridge.exposeInMainWorld('electron', rendererApi)

export type ElectronHandler = typeof rendererApi
