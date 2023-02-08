import { Artifact } from '../types'
import { artifactPopularity, artifactRarity } from '../util/statistics'

import { Scores } from './types'

type ScoreDefinition = {
  implementation: (arg: Artifact) => number | Promise<number>
}

const rarity = {
  implementation: artifactRarity,
} satisfies ScoreDefinition

const popularity = {
  implementation: artifactPopularity,
} satisfies ScoreDefinition

export const scores: Record<Scores, ScoreDefinition> = {
  rarity,
  popularity,
}
