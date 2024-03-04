import { writeFileSync } from 'fs'
import path from 'path'

import { workspaceRoot } from '@nx/devkit'

import { asCommand } from './types.mjs'
import { execSync } from 'child_process'

export const command = asCommand({
  command: 'update-electron-vendors',
  describe:
    'Generate the node and chrome targets for the current version of electron.',
  builder: {},
  handler: () => {
    const electronVersions = JSON.parse(
      execSync(
        'cross-env ELECTRON_RUN_AS_NODE=1 electron -e "console.log(JSON.stringify(process.versions))"'
      ).toString()
    )

    const node = electronVersions.node.split('.')[0]
    const chrome = electronVersions.v8.split('.').splice(0, 2).join('')

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
