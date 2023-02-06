import { Artifact } from '../types'
import {
  percentileScore,
} from '../util/statistics'

import { getDatabase } from './database'
import { scores, ScoreType } from './scores'
import { Bucket, Logic, Scoring } from './types'

const cache: Record<string, Record<ScoreType, number[]>> = {}
async function scoreVal(artifact: Artifact, scoring: Scoring, bucket: Bucket) {
  const db = await getDatabase()

  // TODO: artifacts with no substats?
  for (const substat of artifact.substats) {
    const selector = {
      set: bucket.set ? artifact.setKey : undefined,
      slot: bucket.slot ? artifact.slotKey : undefined,
      main: bucket.main ? artifact.mainStatKey : undefined,
      sub: bucket.sub ? substat.key : undefined,
    }
    const cacheKey = Object.values(selector).join('|')
    let data: Record<ScoreType, number[]> | undefined = cache[cacheKey]
    if (!data) {
      const rows = await db.default.find({ selector }).exec()
      data = {} as Record<ScoreType, number[]>
      for (const scoreType of Object.keys(scores) as ScoreType[]) {
        data[scoreType] = []
        for (const doc of rows) {
          data[scoreType].push(doc[scoreType])
        }
        data[scoreType].sort()
      }
      cache[cacheKey] = data
    }
    const { type, percentile } = scoring
    return (
      percentileScore(
        await scores[type].implementation(artifact),
        data[type]
      ) >= percentile
    )
  }

  return false
}

export function calculate(
  artifact: Artifact,
  tree: Logic<Scoring>,
  bucket: Bucket
): Promise<boolean> {
  const evaluate = async (tree: Logic<Scoring>): Promise<boolean> => {
    if (tree.length === 2) {
      const [op, subtree] = tree
      const A = await evaluate(subtree)
      switch (op) {
        case 'NOT':
          return !A
      }
    } else if (tree.length === 3) {
      const [subtreeL, op, subtreeR] = tree
      const A = await evaluate(subtreeL)
      const B = await evaluate(subtreeR)
      switch (op) {
        case 'AND':
          return A && B
        case 'OR':
          return A || B
      }
    }
    const [scoring] = tree
    return scoreVal(artifact, scoring, bucket)
  }
  return evaluate(tree)
}
