import { app } from 'electron'
import path from 'path'

export const SCRIPT_DIR_NAME = 'ArtifactScripts'
export const SCRIPT_DIR = path.join(app.getPath('userData'), SCRIPT_DIR_NAME)
export const RESOURCES_DIR = path.join(
  app.isPackaged ? process.resourcesPath : app.getAppPath(),
  'resources'
)
export const RESOURCES_SCRIPT_DIR = path.join(RESOURCES_DIR, 'ArtifactScripts')
