import { ScoreType } from './scores'

export type Scoring = {
  type: ScoreType
  percentile: number
}

export type BinaryOperation = 'AND' | 'OR'
export type BinaryLogic<V> = [Logic<V>, BinaryOperation, Logic<V>]
export type UnaryOperation = 'NOT'
export type UnaryLogic<V> = [UnaryOperation, Logic<V>]
export type Logic<V> = BinaryLogic<V> | UnaryLogic<V> | [V]

export type Bucket = {
  set: boolean
  slot: boolean
  main: boolean
  sub: boolean
}
