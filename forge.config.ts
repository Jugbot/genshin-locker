import { MakerDeb } from '@electron-forge/maker-deb'
import { MakerRpm } from '@electron-forge/maker-rpm'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerZIP } from '@electron-forge/maker-zip'
import { WebpackPlugin } from '@electron-forge/plugin-webpack'
import type { ForgeConfig } from '@electron-forge/shared-types'

import { mainConfig } from './webpack.main.config'
import { rendererConfig } from './webpack.renderer.config'

const config: ForgeConfig = {
  packagerConfig: {
    win32metadata: {
      'requested-execution-level': 'requireAdministrator',
    },
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
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
