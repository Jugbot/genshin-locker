/**
 * TODO: Rewrite this config to ESM
 * But currently electron-builder doesn't support ESM configs
 * @see https://github.com/develar/read-config-file/issues/10
 */

/**
 * @type {() => import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
module.exports = function () {

  return {
    directories: {
      output: 'dist',
      buildResources: 'buildResources',
    },
    files: ['packages/**/dist/**'],
    extraMetadata: {
    },

    // Specify linux target just for disabling snap compilation
    // linux: {
    //   target: 'deb',
    // },
    win: {
      target: [
        {
          target: 'nsis',
          arch: ['x64'],
        },
      ],
      artifactName: '${productName}_${version}.${ext}',
    },
    // nsis: {
    //   oneClick: false,
    //   perMachine: false,
    //   allowToChangeInstallationDirectory: true,
    //   deleteAppDataOnUninstall: false,
    // },
  };
};
