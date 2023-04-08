/* eslint-env node */

import {join} from 'node:path';

import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'

import {chrome} from '../../.electron-vendors.cache.json';
import {injectAppVersion} from '../../inject-app-version-plugin'


const PACKAGE_ROOT = __dirname;
const PROJECT_ROOT = join(PACKAGE_ROOT, '../..');

const config = defineConfig(({mode}) => ({
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
    target: `chrome${chrome}`,
    outDir: 'dist',
    // assetsDir: '.',
    rollupOptions: {
      input: join(PACKAGE_ROOT, 'index.html'),
    },
    emptyOutDir: true,
    reportCompressedSize: false,
    minify: mode !== 'development',
  },
  test: {
    environment: 'happy-dom',
  },
  plugins: [
    react(),
    injectAppVersion(),
  ],
}))

export default config;
