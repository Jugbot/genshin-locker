/* eslint-env node */

import { join } from 'node:path'

import { defineConfig } from 'vite'

const PACKAGE_ROOT = __dirname
const PROJECT_ROOT = join(PACKAGE_ROOT, '../..')

const config = defineConfig(({ mode }) => ({
  root: PACKAGE_ROOT,
  envDir: PROJECT_ROOT,
  base: '',
  server: {
    fs: {
      strict: true,
    },
  },
  build: {
    sourcemap: true,
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      input: join(PACKAGE_ROOT, 'src/index.ts'),
    },
    emptyOutDir: true,
    reportCompressedSize: false,
    minify: mode !== 'development',
  },
  test: {
    // ...
  },
}))

export default config
