import { getDatabase } from '../database'
import { Bucket, Logic, Scoring, ScoringKey } from '../routines'
import { Artifact } from '../types'

import {
  percentileScore,
  artifactPopularity,
  artifactRarity,
} from './statistics'

const cache: Record<string, Record<ScoringKey, number[]>> = {}
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
    let data: Record<ScoringKey, number[]> | undefined = cache[cacheKey]
    if (!data) {
      data = {
        rarity: [],
        popularity: [],
      }
      for (const doc of await db.default.find({ selector }).exec()) {
        data.rarity.push(doc.rarity)
        data.popularity.push(doc.popularity)
      }
      data.rarity.sort()
      data.popularity.sort()
      cache[cacheKey] = data
    }
    const { type, percentile } = scoring
    const scoringImpl = {
      popularity: artifactPopularity,
      rarity: artifactRarity,
    }
    return (
      percentileScore(await scoringImpl[type](artifact), data[type]) >=
      percentile
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
