import { contextBridge } from 'electron'

import { rendererApi } from './api'

contextBridge.exposeInMainWorld('electron', rendererApi)

export type ElectronHandler = typeof rendererApi
