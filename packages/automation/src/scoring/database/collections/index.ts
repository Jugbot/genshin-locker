import type { RxCollection, RxCollectionCreator } from 'rxdb'

import * as Default from './default'

export type Collections = {
  default: RxCollection<Default.RxDocType>
}

export const collections: Record<keyof Collections, RxCollectionCreator> = {
  default: Default.collection,
}
