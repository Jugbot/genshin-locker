import type { ScreenMap } from '../types'

import a16x9 from './16x9'
import a43x18 from './43x18'
import a8x5 from './8x5'

export default {
  a8x5,
  a16x9,
  a43x18,
} as Record<string, Record<ScreenMap, string>>
