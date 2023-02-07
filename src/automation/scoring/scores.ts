import { RxJsonSchema } from 'rxdb'

import { Artifact } from '../types'
import { artifactPopularity, artifactRarity } from '../util/statistics'

type TopLevelProperty = RxJsonSchema<never>['properties'] extends {
  [k: string]: infer U
}
  ? U
  : never

type ScoreDefinition = {
  implementation: (arg: Artifact) => number | Promise<number>
  dbSchema: TopLevelProperty
}

const rarity = {
  implementation: artifactRarity,
  dbSchema: {
    type: 'number',
    minimum: 0,
    maximum: 1,
  },
} satisfies ScoreDefinition

const popularity = {
  implementation: artifactPopularity,
  dbSchema: {
    type: 'number',
    minimum: 0,
    multipleOf: 1,
  },
} satisfies ScoreDefinition

export const scores = {
  rarity,
  popularity,
}

export type Scores = typeof scores
export type ScoreType = keyof Scores

export const scoreTypes = Object.keys(scores) as ScoreType[]

export const dbFields = Object.fromEntries(
  Object.entries(scores).map(([key, val]) => [key, val.dbSchema])
) as { [key in keyof Scores]: Scores[key]['dbSchema'] }
