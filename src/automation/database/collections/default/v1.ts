import {
  RxJsonSchema,
  toTypedRxJsonSchema,
  ExtractDocumentTypeFromTypedRxJsonSchema,
  MigrationStrategies,
} from 'rxdb'
import { MigrationStrategy } from '../types'

import { RxDocType as LastRxDocType, migrationStrategies as previousMigrationStrategies } from './v0'

const VERSION = 1

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
    popularity: {
      type: 'number'
    },
    rarity: {
      type: 'number'
    }
  },
  required: ['set', 'slot', 'main', 'sub', 'popularity', 'rarity'],
} as const

const schemaTyped = toTypedRxJsonSchema(schemaLiteral)

export type RxDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>

export const schema: RxJsonSchema<RxDocType> = schemaTyped

const migrationStrategy: MigrationStrategy<LastRxDocType, RxDocType> = (oldDoc)  => {
  return {
    ...oldDoc, 
    popularity: oldDoc.popularity ?? 0,
    rarity: 0
  }
}

export const migrationStrategies: MigrationStrategies = {
  ...previousMigrationStrategies,
  [VERSION]: migrationStrategy
}
