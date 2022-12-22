import { Artifact, MainStatKey, SlotKey, SubStatKey } from '../types'

function mainStatRollChance(stat: MainStatKey, slot: SlotKey) {
  return (
    {
      [SlotKey.FLOWER]: {
        [MainStatKey.HP_FLAT]: 100.0,
      },
      [SlotKey.PLUME]: {
        [MainStatKey.ATK_FLAT]: 100.0,
      },
      [SlotKey.SANDS]: {
        [MainStatKey.HP_PERCENT]: 26.68,
        [MainStatKey.ATK_PERCENT]: 26.66,
        [MainStatKey.DEF_PERCENT]: 26.66,
        [MainStatKey.ENERGY_RECHARGE]: 10.0,
        [MainStatKey.ELEM_MASTERY]: 10.0,
      },
      [SlotKey.GOBLET]: {
        [MainStatKey.HP_PERCENT]: 19.25,
        [MainStatKey.ATK_PERCENT]: 19.25,
        [MainStatKey.DEF_PERCENT]: 19,
        [MainStatKey.PYRO_DMG]: 5.0,
        [MainStatKey.ELECTRO_DMG]: 5.0,
        [MainStatKey.CRYO_DMG]: 5.0,
        [MainStatKey.HYDRO_DMG]: 5.0,
        [MainStatKey.DENDRO_DMG]: 5.0,
        [MainStatKey.ANEMO_DMG]: 5.0,
        [MainStatKey.GEO_DMG]: 5.0,
        [MainStatKey.PHYSICAL_DMG]: 5.0,
        [MainStatKey.ELEM_MASTERY]: 2.5,
      },
      [SlotKey.CIRCLET]: {
        [MainStatKey.HP_PERCENT]: 22.0,
        [MainStatKey.DEF_PERCENT]: 22.0,
        [MainStatKey.ATK_PERCENT]: 22.0,
        [MainStatKey.HEAL_PERCENT]: 10.0,
        [MainStatKey.CRIT_RATE]: 10.0,
        [MainStatKey.CRIT_DAMAGE]: 10.0,
        [MainStatKey.ELEM_MASTERY]: 4.0,
      },
    }[slot][stat] ?? 0
  )
}

function subStatRollChance(
  stat: SubStatKey,
  mainStat: MainStatKey,
  exclude: Set<SubStatKey> = new Set()
) {
  const baseRollChance = {
    [SubStatKey.HP_FLAT]: 13.63,
    [SubStatKey.ATK_FLAT]: 13.64,
    [SubStatKey.DEF_FLAT]: 13.64,
    [SubStatKey.HP_PERCENT]: 9.09,
    [SubStatKey.ATK_PERCENT]: 9.09,
    [SubStatKey.DEF_PERCENT]: 9.09,
    [SubStatKey.ENERGY_RECHARGE]: 9.09,
    [SubStatKey.ELEM_MASTERY]: 9.09,
    [SubStatKey.CRIT_RATE]: 6.82,
    [SubStatKey.CRIT_DAMAGE]: 6.82,
  }
  const value = baseRollChance[stat]
  const denominator = Object.entries(baseRollChance).reduce(
    (acc, [key, val]) => {
      if (mainStat === key || exclude.has(key as SubStatKey)) {
        return acc
      }
      return acc + val
    },
    0
  )
  return value / denominator
}

function subStatOccurance(stats: Array<SubStatKey>, mainStat: MainStatKey) {
  let totalProb = 0
  for (const combo of permutations(stats)) {
    let prob = 1
    const excluded: Set<SubStatKey> = new Set()
    for (const stat of combo) {
      prob *= subStatRollChance(stat, mainStat, excluded)
      excluded.add(stat)
    }
    totalProb += prob
  }
  return totalProb
}

function subStatNumberRarity(artifact: Artifact) {
  // TODO: calculate original #of substats
  return artifact.rarity - 1 === artifact.substats.length ? 0.25 : 0.75
}

/**
 * Chance of getting this particular artifact ignoring substat order/variance
 */
export function artifactRarity(artifact: Artifact) {
  let rarity = 1
  rarity *= subStatOccurance(
    artifact.substats.map((s) => s.key),
    artifact.mainStatKey
  )
  rarity *= subStatNumberRarity(artifact)
  rarity *= mainStatRollChance(artifact.mainStatKey, artifact.slotKey)
  return rarity
}

export function* permutations<T>(arr: T[], size = arr.length) {
  // adapted from Generatorics
  const len = arr.length
  const data: T[] = []
  const indecesUsed: boolean[] = []
  yield* permutationUtil(0)
  function* permutationUtil(index: number): Generator<T[]> {
    if (index === size) {
      return yield data
    }
    for (let i = 0; i < len; i++) {
      if (!indecesUsed[i]) {
        indecesUsed[i] = true
        data[index] = arr[i]
        yield* permutationUtil(index + 1)
        indecesUsed[i] = false
      }
    }
  }
}

export function combinations<T>(array: T[]) {
  return array.flatMap((v, i) => array.slice(i + 1).map((w) => new Set([v, w])))
}
