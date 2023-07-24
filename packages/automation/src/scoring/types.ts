import { Logic } from '@gl/types'

export const scoreTypes = ['rarity', 'popularity', 'handcrafted'] as const
export type Scores = (typeof scoreTypes)[number]

export type Scoring =
  | {
      type: 'rarity'
      percentile: number
      bucket: Bucket
    }
  | {
      type: 'popularity'
      percentile: number
      bucket: Bucket
    }
  | {
      type: 'handcrafted'
    }

export type ScoringLogic = Logic<Scoring>

export type Bucket = {
  set: boolean
  slot: boolean
  main: boolean
  sub: boolean
}
