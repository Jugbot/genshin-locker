export const binaryOperations = ['AND', 'OR'] as const
export type BinaryOperation = typeof binaryOperations[number]
export type BinaryLogic<V> = [Logic<V>, BinaryOperation, Logic<V>]
export const unaryOperations = ['NOT'] as const
export type UnaryOperation = typeof unaryOperations[number]
export type UnaryLogic<V> = [UnaryOperation, Logic<V>]
export type LeafLogic<V> = [V]
export type Logic<V> = BinaryLogic<V> | UnaryLogic<V> | LeafLogic<V>
