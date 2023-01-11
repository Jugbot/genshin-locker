import type { RxCollection, RxCollectionCreator } from 'rxdb'
import * as Default from './default'
import * as TargetScore from './targetscore'

export type Collections = {
  default: RxCollection<Default.RxDocType>
  targetscore: RxCollection<TargetScore.RxDocType>
}

export const collections: Record<keyof Collections, RxCollectionCreator> = {
  default: {
    schema: Default.schema,
  },
  targetscore: {
    schema: TargetScore.schema,
  },
}
