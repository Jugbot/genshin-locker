import { join } from 'node:path'

import { defineConfig } from 'vite'

import { node } from '../../.electron-vendors.cache.json'
import { injectAppVersion } from '../../inject-app-version-plugin'

const PACKAGE_ROOT = __dirname
const PROJECT_ROOT = join(PACKAGE_ROOT, '../..')

const config = defineConfig(({ mode }) => ({
  root: PACKAGE_ROOT,
  envDir: PROJECT_ROOT,
  build: {
    ssr: true,
    sourcemap: 'inline',
    target: `node${node}`,
    outDir: 'dist',
    minify: mode !== 'development',
    lib: {
      entry: 'src/index.ts',
      formats: ['cjs'],
    },
    rollupOptions: {
      external: ['sharp', 'ffi-napi', 'ref-napi'],
      output: {
        entryFileNames: '[name].cjs',
        // preserveModules: true
      },
    },
    emptyOutDir: true,
    reportCompressedSize: false,
  },
  plugins: [injectAppVersion()],
}))

export default config
