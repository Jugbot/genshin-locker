import { LokiFsAdapter, LokiMemoryAdapter } from 'lokijs'
import { createRxDatabase, addRxPlugin, RxDatabase } from 'rxdb'
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump'
import { RxDBLocalDocumentsPlugin } from 'rxdb/plugins/local-documents'
import { getRxStorageLoki } from 'rxdb/plugins/lokijs'
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration'
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder'
import { RxDBUpdatePlugin } from 'rxdb/plugins/update'

import { Collections, collections } from './collections'

addRxPlugin(RxDBDevModePlugin)
addRxPlugin(RxDBJsonDumpPlugin)
addRxPlugin(RxDBLocalDocumentsPlugin)
addRxPlugin(RxDBMigrationPlugin)
addRxPlugin(RxDBQueryBuilderPlugin)
addRxPlugin(RxDBUpdatePlugin)

let db: Promise<RxDatabase<Collections>>
export async function getDatabase(importData = true) {
  if (db) {
    return db
  }
  db = createRxDatabase<Collections>({
    name: 'default',
    storage: getRxStorageLoki({
      adapter: importData ? new LokiFsAdapter() : new LokiMemoryAdapter(),
    }),
  }).then(async (newDB) => {
    await newDB.addCollections(collections)
    return newDB
  })
  return db
}
