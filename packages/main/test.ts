import type {Plugin} from 'vite'

export const injectAppVersion = (): Plugin => ({
  name: 'inject-version',
  config: () => {
    // TODO: Find better way to inject app version
    process.env.VITE_APP_VERSION = process.env.npm_package_version;
  },
});
