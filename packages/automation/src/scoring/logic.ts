import fs from 'fs'
import path from 'path'
import { Script } from 'vm'

import { mainApi } from '@gl/ipc-api'
import { Artifact, Channel, MainStatKey, SlotKey, SubStatKey } from '@gl/types'

import { mainStatDistribution } from '../util/statistics'

import { SCRIPT_DIR } from './const'

function defaultShouldLock(artifact: Artifact) {
  // Lock anything that already has invested XP
  if (artifact.level > 0) {
    return true
  }
  // Lock all artifacts with full substats
  if (artifact.substats.length === 4) {
    return true
  }
  // Lock rare main stats
  if (
    (mainStatDistribution[artifact.slotKey][artifact.mainStatKey] ?? 0) < 15
  ) {
    return true
  }
  // Desireable substats have synergy
  const countAllOf = (keys: SubStatKey[]) =>
    artifact.substats.filter(({ key }) => keys.includes(key)).length
  const countOneOf = (keys: SubStatKey[]) => (countAllOf(keys) === 0 ? 0 : 1)
  const critScalers = [
    SubStatKey.CRIT_DAMAGE,
    SubStatKey.CRIT_RATE,
    SubStatKey.ENERGY_RECHARGE,
  ]
  const emScalars = [SubStatKey.ELEM_MASTERY, SubStatKey.ENERGY_RECHARGE]
  const basicStatScalers = [
    SubStatKey.HP_PERCENT,
    SubStatKey.ATK_PERCENT,
    SubStatKey.DEF_PERCENT,
  ]
  const critScalerScore =
    countAllOf(critScalers) +
    (countOneOf(basicStatScalers) + countOneOf([SubStatKey.ELEM_MASTERY])) / 2
  if (critScalerScore >= 2) {
    return true
  }
  const emScalerScore = countAllOf(emScalars) + countOneOf(basicStatScalers) / 2
  if (
    (artifact.slotKey === SlotKey.FLOWER ||
      artifact.slotKey === SlotKey.PLUME) &&
    emScalerScore >= 2
  ) {
    return true
  }
  if (artifact.mainStatKey === MainStatKey.ELEM_MASTERY && emScalerScore > 1) {
    return true
  }

  return false
}

type LockResult = boolean | null
type LockFunction = (
  artifact: Artifact,
  utilities: {
    mainStatDistribution: typeof mainStatDistribution
  }
) => LockResult | Promise<LockResult>

export async function getLockerScript(
  scriptName: string | undefined
): Promise<LockFunction> {
  if (scriptName) {
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
      return () => null
    }
  }

  return defaultShouldLock
}

export async function calculate(
  lockFunc: LockFunction,
  artifact: Artifact
): Promise<boolean | null> {
  try {
    return await lockFunc(artifact, {
      mainStatDistribution,
    })
  } catch (e) {
    mainApi.send(Channel.LOG, 'error', String(e))
  }
  return null
}
