import { writeFileSync } from 'fs'
import path from 'path'

import { workspaceRoot } from '@nx/devkit'

import { asCommand } from './types.mjs'

const electronRelease = process.versions

const node = electronRelease.node.split('.')[0]
const chrome = electronRelease.v8.split('.').splice(0, 2).join('')

export const command = asCommand({
  command: 'update-electron-vendors',
  describe:
    'Generate the node and chrome targets for the current version of electron.',
  builder: {},
  handler: () => {
    if (!process.versions['electron']) {
      throw new Error(
        `This script should be run in electron context. Example: \`ELECTRON_RUN_AS_NODE=1 electron update-electron-vendors.mjs\``
      )
    }
    writeFileSync(
      path.join(workspaceRoot, '.electron-vendors.cache.json'),
      JSON.stringify({ chrome, node })
    )
    writeFileSync(
      path.join(workspaceRoot, '.browserslistrc'),
      `Chrome ${chrome}`,
      'utf8'
    )
  },
})
