import { Artifact, MainStatKey, SetKey, SlotKey, SubStatKey } from '@gl/types'
import { describe, expect, test } from 'vitest'

import { toScriptArtifact } from './scriptArtifact'

const artifact: Artifact = {
  id: 'test',
  setKey: SetKey.GladiatorsFinale,
  slotKey: SlotKey.PLUME,
  rarity: 5,
  level: 0,
  mainStatKey: MainStatKey.ATK_FLAT,
  mainStatValue: 47,
  substats: [
    { key: SubStatKey.DEF_FLAT, value: 16 },
    { key: SubStatKey.ENERGY_RECHARGE, value: 5.2 },
    { key: SubStatKey.ATK_PERCENT, value: 4.1 },
  ],
  unactivatedSubstats: [],
  location: 0,
  lock: false,
}

describe('toScriptArtifact', () => {
  test('all active', () => {
    const scriptArtifact = toScriptArtifact(artifact)
    expect(scriptArtifact.substats).toEqual(artifact.substats)
    expect(scriptArtifact.hasInactiveSubstat).toBe(false)
    expect(scriptArtifact).not.toHaveProperty('unactivatedSubstats')
  })

  test('inactive substat is appended to substats', () => {
    const inactive = { key: SubStatKey.CRIT_RATE, value: 3.9 }
    const scriptArtifact = toScriptArtifact({
      ...artifact,
      unactivatedSubstats: [inactive],
    })
    expect(scriptArtifact.substats).toEqual([...artifact.substats, inactive])
    expect(scriptArtifact.hasInactiveSubstat).toBe(true)
    expect(scriptArtifact).not.toHaveProperty('unactivatedSubstats')
  })
})
