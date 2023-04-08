/**
 * Entry function for get app version.
 * In current implementation, it returns `version` from `package.json`, but you can implement any logic here.
 * Runs several times for each vite configs and electron-builder config.
 * @return {string | undefined}
 */
export function getVersion() {
  return process.env.npm_package_version;
}

/**
 * Somehow inject app version to vite build context
 * @return {import('vite').Plugin}
 */
export const injectAppVersion = () => ({
  name: 'inject-version',
  config: () => {
    // TODO: Find better way to inject app version
    process.env.VITE_APP_VERSION = getVersion();
  },
});
