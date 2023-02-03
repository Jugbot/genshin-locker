import {
  RxJsonSchema,
  toTypedRxJsonSchema,
  ExtractDocumentTypeFromTypedRxJsonSchema,
  MigrationStrategies,
} from 'rxdb'

const schemaLiteral = {
  title: 'target score given percentile schema',
  description: 'target scores by group',
  version: 0,
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
    score: {
      type: 'number',
    },
  },
  required: ['set', 'slot', 'main', 'sub', 'score'],
} as const

const schemaTyped = toTypedRxJsonSchema(schemaLiteral)

export type RxDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>

export const schema: RxJsonSchema<RxDocType> = schemaTyped

export const migrationStrategies: MigrationStrategies = {}