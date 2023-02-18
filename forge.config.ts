import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { WebpackPlugin } from '@electron-forge/plugin-webpack'
import type { ForgeConfig } from '@electron-forge/shared-types'

import { mainConfig } from './webpack.main.config'
import { rendererConfig } from './webpack.renderer.config'

const config: ForgeConfig = {
  packagerConfig: {
    win32metadata: {
      'requested-execution-level': 'requireAdministrator',
    },
    icon: './src/icon.ico',
  },
  rebuildConfig: {},
  makers: [new MakerSquirrel({})],
  plugins: [
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/windows/main/index.html',
            js: './src/windows/main/app.tsx',
            name: 'main_window',
            preload: {
              js: './src/windows/main/preload.ts',
            },
          },
        ],
      },
    }),
  ],
}

export default config
