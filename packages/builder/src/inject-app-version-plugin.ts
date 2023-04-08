import type { Plugin } from 'vite'

import { getVersion } from './getVersion'

/**
 * Somehow inject app version to vite build context
 */
export const injectAppVersion = (): Plugin => ({
  name: 'inject-version',
  config: () => {
    // TODO: Find better way to inject app version
    process.env.VITE_APP_VERSION = getVersion()
  },
})
