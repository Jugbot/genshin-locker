import { Scores, scoreTypes } from './database/collections/default'

export type Scoring = {
  type: Scores
  percentile: number
}
export const binaryOperations = ['AND', 'OR'] as const
export type BinaryOperation = (typeof binaryOperations)[number]
export type BinaryLogic<V> = [Logic<V>, BinaryOperation, Logic<V>]
export const unaryOperations = ['NOT'] as const
export type UnaryOperation = (typeof unaryOperations)[number]
export type UnaryLogic<V> = [UnaryOperation, Logic<V>]
// export const allOperations = [...unaryOperations, ...binaryOperations] as const
// export type Operation = typeof allOperations[number]
export const leafOperation = ['LEAF'] as const
export type LeafLogic<V> = [V]
export type Logic<V> = BinaryLogic<V> | UnaryLogic<V> | LeafLogic<V>
export type ScoringLogic = Logic<Scoring>

export type Bucket = {
  set: boolean
  slot: boolean
  main: boolean
  sub: boolean
}

export { scoreTypes }
export type { Scores }
