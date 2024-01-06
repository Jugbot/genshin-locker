import { app, BrowserWindow, dialog, shell } from 'electron'
import fs from 'fs'
import { join } from 'node:path'
import { URL } from 'node:url'

import {
  calculate,
  getLockerScript,
  readArtifacts,
  RESOURCES_SCRIPT_DIR,
  SCRIPT_DIR,
} from '@gl/automation'
import { mainApi } from '@gl/ipc-api'
import { MENUBAR_BACKCOLOR, MENUBAR_COLOR } from '@gl/theme'
import { ArtifactData, Channel } from '@gl/types'

import { store } from './store'

fs.cpSync(RESOURCES_SCRIPT_DIR, SCRIPT_DIR, {
  recursive: true,
  force: false,
})
const fileWatcher = fs.watch(SCRIPT_DIR, 'utf-8')

async function createWindow() {
  const { width, height, x, y } = store.store as Record<
    string,
    number | undefined
  >

  const browserWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: MENUBAR_BACKCOLOR,
      symbolColor: MENUBAR_COLOR,
    },
    show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
    webPreferences: {
      sandbox: false, // Sandbox disabled because the demo of preload script depend on the Node.js api
      preload: join(app.getAppPath(), 'packages/preload/dist/index.cjs'),
    },
  })

  // IPC methods
  mainApi.webContents = browserWindow.webContents
  mainApi.handle(Channel.START, (lockWhileScanning, scriptName) => {
    try {
      readArtifacts(lockWhileScanning, scriptName)
    } catch (e) {
      console.error(e)
    }
  })
  mainApi.handle(Channel.CALCULATE, async (scriptName, artifacts) => {
    const results: ArtifactData[] = []
    const scriptFunc = await getLockerScript(scriptName)
    for (const artifact of artifacts) {
      const shouldBeLocked = await calculate(scriptFunc, artifact)
      if (shouldBeLocked === null) {
        // null === error
        continue
      }
      results.push({
        artifact,
        shouldBeLocked,
      })
    }
    return results
  })
  mainApi.handle(Channel.SAVE_ARTIFACTS, (artifacts) => {
    return dialog
      .showSaveDialog(browserWindow, {
        filters: [{ extensions: ['json'], name: 'GOOD format' }],
      })
      .then(({ filePath, canceled }) => {
        if (filePath) {
          fs.writeFileSync(
            filePath,
            JSON.stringify(
              {
                format: 'GOOD',
                version: 1,
                source: 'Genshin Locker',
                artifacts,
              },
              null,
              2
            )
          )
        }
        return !canceled
      })
  })

  mainApi.handle(Channel.OPEN_USER_SCRIPT_FOLDER, () => {
    shell.openPath(SCRIPT_DIR)
  })

  const updateScriptList = () => {
    fs.readdir(SCRIPT_DIR, (err, files) => {
      if (err) {
        mainApi.send(Channel.LOG, 'error', 'Error reading the user directory')
        console.error(err)
        return
      }
      // Here you can send the files array wherever you need to
      mainApi.send(Channel.USER_SCRIPT_CHANGE, files)
    })
  }

  fileWatcher.removeAllListeners()
  fileWatcher.addListener('change', updateScriptList)

  browserWindow.on('resized', () => {
    const [width, height] = browserWindow.getSize()
    store.set('width', width)
    store.set('height', height)
  })

  browserWindow.on('moved', () => {
    const [x, y] = browserWindow.getPosition()
    store.set('x', x)
    store.set('y', y)
  })

  /**
   * If the 'show' property of the BrowserWindow's constructor is omitted from the initialization options,
   * it then defaults to 'true'. This can cause flickering as the window loads the html content,
   * and it also has show problematic behaviour with the closing of the window.
   * Use `show: false` and listen to the  `ready-to-show` event to show the window.
   *
   * @see https://github.com/electron/electron/issues/25012 for the afford mentioned issue.
   */
  browserWindow.on('ready-to-show', () => {
    if (import.meta.env.DEV) {
      browserWindow.showInactive()
      browserWindow.webContents.openDevTools({
        activate: false,
        mode: 'undocked',
      })
      updateScriptList()
    } else {
      browserWindow.show()
    }
  })

  /**
   * URL for main window.
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test.
   */
  const pageUrl =
    import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined
      ? import.meta.env.VITE_DEV_SERVER_URL
      : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString()

  await browserWindow.loadURL(pageUrl)

  return browserWindow
}

/**
 * Restore an existing BrowserWindow or Create a new BrowserWindow.
 */
export async function restoreOrCreateWindow() {
  let window = BrowserWindow.getAllWindows().find((w) => !w.isDestroyed())

  if (window === undefined) {
    window = await createWindow()
  }

  if (window.isMinimized()) {
    window.restore()
  }
}
