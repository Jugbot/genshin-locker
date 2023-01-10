import { createRxDatabase, addRxPlugin, RxDatabase } from 'rxdb'
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder'
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import { getRxStorageMemory } from 'rxdb/plugins/memory'
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump'
import databaseData from './data.json'
import { RxDBUpdatePlugin } from 'rxdb/plugins/update'
import { Collections, collections } from './collections'

addRxPlugin(RxDBUpdatePlugin)
addRxPlugin(RxDBJsonDumpPlugin)
addRxPlugin(RxDBQueryBuilderPlugin)
addRxPlugin(RxDBDevModePlugin)

let db: RxDatabase<Collections>
export async function getDatabase(importData = true) {
  if (db) return db
  db = await createRxDatabase({
    name: 'default',
    storage: getRxStorageMemory(),
  })

  await db.addCollections(collections)

  if (importData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.importJSON(databaseData as any)
  }

  return db
}
