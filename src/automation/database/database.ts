import {
  createRxDatabase,
  addRxPlugin,
  RxJsonSchema,
  RxCollection,
  toTypedRxJsonSchema,
  ExtractDocumentTypeFromTypedRxJsonSchema,
  RxDatabase,
} from 'rxdb'
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder'
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import { getRxStorageMemory } from 'rxdb/plugins/memory'
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump'
import databaseData from './data.json'

addRxPlugin(RxDBJsonDumpPlugin)
addRxPlugin(RxDBQueryBuilderPlugin)
addRxPlugin(RxDBDevModePlugin)

const defaultSchemaLiteral = {
  title: 'precalculation schema',
  description: 'precalculated scores',
  version: 0,
  primaryKey: {
    key: 'id',
    fields: ['set', 'slot', 'main', 'subs'],
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
    subs: {
      type: 'string',
    },
    popularity: {
      type: 'number',
      default: 0,
    },
    rarity: {
      type: 'number',
      default: 0,
    },
  },
  required: ['set', 'slot', 'main', 'subs'],
} as const

const schemaTyped = toTypedRxJsonSchema(defaultSchemaLiteral)

type RxDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof schemaTyped>

const defaultSchema: RxJsonSchema<RxDocType> = schemaTyped

let db: RxDatabase<{
  default: RxCollection<RxDocType>
}>
export async function getDatabase() {
  if (db) return db
  db = await createRxDatabase({
    name: 'default',
    storage: getRxStorageMemory(),
  })

  console.log('creating collection..')
  await db.addCollections({
    default: {
      schema: defaultSchema,
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.importJSON(databaseData as any)

  return db
}
