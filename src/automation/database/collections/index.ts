import type { RxCollection, RxCollectionCreator } from 'rxdb'
import * as Default from './default'
import * as TargetScore from './targetScore'

export type Collections = {
  default: RxCollection<Default.RxDocType>
  targetScore: RxCollection<TargetScore.RxDocType>
}

export const collections: Record<keyof Collections, RxCollectionCreator> = {
  default: {
    schema: Default.schema,
  },
  targetScore: {
    schema: TargetScore.schema,
  },
}
