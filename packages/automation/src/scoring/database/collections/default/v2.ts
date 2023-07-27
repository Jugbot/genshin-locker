import {
  RxJsonSchema,
  toTypedRxJsonSchema,
  ExtractDocumentTypeFromTypedRxJsonSchema,
  MigrationStrategies,
  RxCollectionCreator,
} from 'rxdb'

import { MigrationStrategy } from '../types'

import {
  RxDocType as LastRxDocType,
  migrationStrategies as previousMigrationStrategies,
} from './v1'

const VERSION = 2

const scoreProperties = {
  rarity: {
    type: 'number',
    minimum: 0,
    maximum: 1,
  },
  popularity: {
    type: 'number',
    minimum: 0,
    multipleOf: 1,
  },
} as const

export type CachedScores = keyof typeof scoreProperties
export const cachedScoreTypes = Object.keys(scoreProperties) as CachedScores[]

const schemaLiteral = {
  title: 'precalculation schema',
  description: 'precalculated scores',
  version: VERSION,
  primaryKey: {
    key: 'id',
    fields: ['set', 'slot', 'main', 'sub'],
    separator: '|',
  },
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    set: {
      type: 'string',
    },
    slot: {
      type: 'string',
    },
    main: {
      type: 'string',
    },
    sub: {
      type: 'string',
    },
    ...scoreProperties,
  },
  required: [
    'set',
    'slot',
    'main',
    'sub',
    ...(Object.keys(scoreProperties) as CachedScores[]),
  ],
} as const // satisfies Parameters<typeof toTypedRxJsonSchema>[0]

const schemaTyped = toTypedRxJsonSchema(schemaLiteral)

export type RxDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>

export const schema: RxJsonSchema<RxDocType> = schemaTyped

const migrationStrategy: MigrationStrategy<LastRxDocType, RxDocType> = (
  oldDoc
) => {
  return {
    ...oldDoc,
  }
}

export const migrationStrategies: MigrationStrategies = {
  ...previousMigrationStrategies,
  [VERSION]: migrationStrategy,
}

export const collection: RxCollectionCreator<RxDocType> = {
  schema,
  migrationStrategies,
  localDocuments: true,
}
