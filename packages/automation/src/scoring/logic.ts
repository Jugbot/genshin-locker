import fs from 'fs'
import path from 'path'
import { Script } from 'vm'

import { mainApi } from '@gl/ipc-api'
import { Artifact, Channel } from '@gl/types'

import { mainStatDistribution } from '../util/statistics'

import { SCRIPT_DIR } from './const'
import { ScriptArtifact, toScriptArtifact } from './scriptArtifact'

type LockResult = boolean | null
type LockFunction = (
  artifact: ScriptArtifact,
  utilities: {
    mainStatDistribution: typeof mainStatDistribution
  }
) => LockResult | Promise<LockResult>

const doNothing = () => null

export async function getLockerScript(
  scriptName?: string
): Promise<LockFunction> {
  if (!scriptName) {
    return doNothing
  }
  try {
    const filePath = path.join(SCRIPT_DIR, scriptName)
    const scriptContent = fs.readFileSync(filePath, 'utf8')
    const script = new Script(scriptContent)
    const sandbox = { module: { exports: {} as unknown } }
    script.runInNewContext(sandbox)
    const scriptFunction = sandbox.module.exports
    if (typeof scriptFunction !== 'function') {
      throw new Error('Script does not export function.')
    }
    return scriptFunction as LockFunction
  } catch (e) {
    mainApi.send(Channel.LOG, 'error', String(e))
    return doNothing
  }
}

export async function calculate(
  lockFunc: LockFunction,
  artifact: Artifact
): Promise<boolean | null> {
  try {
    return await lockFunc(toScriptArtifact(artifact), {
      mainStatDistribution,
    })
  } catch (e) {
    mainApi.send(Channel.LOG, 'error', String(e))
  }
  return null
}
