import { app, BrowserWindow, dialog } from 'electron'
import fs from 'fs'
import { join } from 'node:path'
import { URL } from 'node:url'

import { readArtifacts, calculate } from '@gl/automation'
import { mainApi } from '@gl/ipc-api'
import { MENUBAR_BACKCOLOR, MENUBAR_COLOR } from '@gl/theme'
import { Channel, ArtifactData } from '@gl/types'

async function createWindow() {
  const browserWindow = new BrowserWindow({
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
  mainApi.handle(Channel.START, (options) => {
    try {
      readArtifacts(options)
    } catch (e) {
      console.error(e)
    }
  })
  mainApi.handle(Channel.CALCULATE, async (logic, bucket, artifacts) => {
    const results: ArtifactData[] = []
    for (const artifact of artifacts) {
      results.push({
        artifact,
        shouldBeLocked: await calculate(artifact, logic, bucket),
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
      // TODO: remeber last window position so that dev reloading is less annoying
      browserWindow.showInactive()
    } else {
      browserWindow.show()
    }

    if (import.meta.env.DEV) {
      browserWindow?.webContents.openDevTools()
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

  window.focus()
}