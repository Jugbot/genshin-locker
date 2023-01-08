import { existsSync, unlinkSync, writeFileSync } from 'fs'
import { getDatabase } from '../src/automation/database'
import { datamine } from '../src/automation/datamine'
import {
  MainStatKey,
  SetKey,
  SlotKey,
  SubStatKey,
} from '../src/automation/types'
import {
  combinations,
  mainStatDistribution,
  substatDistribution,
} from '../src/automation/util/statistics'
import artifactPopularity from '../src/automation/crowdsourced/crowdsourced.json'
import path from 'path'

const allArtifacts = Object.values(datamine.artifacts).map(
  (o) => o.GOOD as SetKey
)

/** Generateor for all possible artifact types. Useful for computing statistics based on arbitrary scoring */
function* generateAll(): Generator<{
  setKey: SetKey
  slotKey: SlotKey
  mainStatKey: MainStatKey
  substats: SubStatKey[]
}> {
  for (const setKey of allArtifacts) {
    const maxRarity = Math.max(
      ...(Object.values(datamine.artifacts).find((a) => a.GOOD === setKey)
        ?.rarities ?? [1])
    )
    const maxNumSubstats = maxRarity - 1
    for (const slotKey of Object.values(SlotKey)) {
      for (const mainStatKey of Object.keys(
        mainStatDistribution[slotKey]
      ) as MainStatKey[]) {
        const substatKeys = Object.keys(substatDistribution).filter(
          (stat) => stat !== mainStatKey
        ) as SubStatKey[]
        for (const substatKeySet of combinations(substatKeys, maxNumSubstats)) {
          yield {
            setKey,
            slotKey,
            mainStatKey,
            substats: substatKeySet,
          }
        }
      }
    }
  }
}

type PartialRecord<K extends string | number | symbol, T> = { [P in K]?: T }
type ArtifactPopularity = PartialRecord<
  SetKey,
  PartialRecord<
    SlotKey,
    PartialRecord<
      MainStatKey,
      PartialRecord<SubStatKey, number> & { total: number }
    >
  >
>

const writePath = path.resolve(
  __dirname,
  '../src/automation/database/data.json'
)

async function generateScores() {
  const db = await getDatabase()
  for (const pseudoArtifact of generateAll()) {
    const substatCounts = (artifactPopularity as ArtifactPopularity)?.[
      pseudoArtifact.setKey
    ]?.[pseudoArtifact.slotKey]?.[pseudoArtifact.mainStatKey]
    const popularity = substatCounts
      ? pseudoArtifact.substats.reduce(
          (acc, substat) =>
            acc + (substatCounts?.[substat] ?? 0) / substatCounts.total,
          0
        )
      : 0
    await db.default.upsert({
      set: pseudoArtifact.setKey,
      slot: pseudoArtifact.slotKey,
      main: pseudoArtifact.mainStatKey,
      subs: pseudoArtifact.substats.join(','),
      popularity,
    })
  }
  const json = await db.exportJSON()
  if (existsSync(writePath)) {
    unlinkSync(writePath)
  }
  writeFileSync(writePath, JSON.stringify(json, null, 2))
}

generateScores()
