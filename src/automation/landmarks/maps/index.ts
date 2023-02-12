import type { ScreenMap } from '../types'

import a16x9 from './16x9'
import a43x18 from './43x18'

export default {
  a43x18,
  a16x9,
} as Record<string, Record<ScreenMap, string>>
