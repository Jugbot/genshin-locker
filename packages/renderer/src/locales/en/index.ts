import type {
  MainStatKey,
  SetKey,
  SlotKey,
  SubStatKey,
} from '@gl/types'

import artifact from './artifact.json'
import translation from './translation.json'

artifact satisfies {
  slot: Record<SlotKey, string>
  stat: Record<SubStatKey | MainStatKey, string>
  set: Record<SetKey, string>
}

export default {
  translation,
  artifact,
}
