import { Artifact, ArtifactMetrics } from '../types'
import { percentileScore } from '../util/statistics'

import { getDatabase } from './database'
import { Bucket, Logic, Scores, Scoring, scoreTypes } from './types'

const cache: Record<string, Record<Scores, number[]>> = {}
async function targetScore(
  selector: Partial<ArtifactMetrics>,
  type: Scores,
  targetPercentile: number
) {
  const db = await getDatabase()
  const cacheKey = Object.values(selector).join('|')
  let data: Record<Scores, number[]> | undefined = cache[cacheKey]
  if (!data) {
    const rows = await db.default.find({ selector }).exec()
    data = {} as Record<Scores, number[]>
    for (const scoreType of scoreTypes) {
      data[scoreType] = []
      for (const doc of rows) {
        data[scoreType].push(doc[scoreType])
      }
      data[scoreType].sort()
    }
    cache[cacheKey] = data
  }
  return percentileScore(targetPercentile, data[type])
}

async function scoreVal(artifact: Artifact, scoring: Scoring, bucket: Bucket) {
  const substatKeys = artifact.substats.map((s) => s.key)
  const { type, percentile } = scoring

  const bucketSelector = (
    metrics: ArtifactMetrics
  ): Partial<ArtifactMetrics> => {
    const { set, slot, main, sub } = metrics
    return {
      ...(bucket.set ? { set } : {}),
      ...(bucket.slot ? { slot } : {}),
      ...(bucket.main ? { main } : {}),
      ...(bucket.sub ? { sub } : {}),
    }
  }

  const targetScores: number[] = []
  for (const substatKey of substatKeys) {
    const selector = bucketSelector({
      set: artifact.setKey,
      slot: artifact.slotKey,
      main: artifact.mainStatKey,
      sub: substatKey,
    })
    const score = await targetScore(selector, type, percentile)
    targetScores.push(score)
    // Quit early if substats are not part of the bucket
    if (!selector.sub) {
      break
    }
  }

  // If the artifact does not have the max number of substats for its rarity,
  // take the weighted average of each possible upgraded artifact.
  // const maxSubstats = artifact.rarity - 1
  // if (artifact.substats.length < maxSubstats) {
  //   let weightedSum = 0
  //   let divisor = 0
  //   for (const possibleSubstat of Object.values(SubStatKey)) {
  //     const chance = subStatRollChance(
  //       possibleSubstat,
  //       artifact.mainStatKey,
  //       new Set(substatKeys)
  //     )
  //     const selector = bucketSelector({
  //       set: artifact.setKey,
  //       slot: artifact.slotKey,
  //       main: artifact.mainStatKey,
  //       sub: possibleSubstat,
  //     })
  //     const score = await targetScore(selector, type, percentile)
  //     weightedSum += score * chance
  //     divisor += chance
  //   }
  //   targetScores.push(weightedSum / divisor)
  // }

  const avgTargetScore =
    targetScores.reduce((a, b) => a + b, 0) / targetScores.length

  const artifactScores: number[] = []
  for (const substatKey of substatKeys) {
    const selector = {
      set: artifact.setKey,
      slot: artifact.slotKey,
      main: artifact.mainStatKey,
      sub: substatKey,
    }
    const score = await targetScore(selector, type, percentile)
    artifactScores.push(score)
  }

  const avgArtifactScore =
    artifactScores.reduce((a, b) => a + b, 0) / artifactScores.length

  // console.log(avgArtifactScore, avgTargetScore)
  return avgArtifactScore >= avgTargetScore
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
