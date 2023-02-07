import { load } from './landmarks'
import { ScreenMap } from './types'

describe('landmarks', () => {
  it('loads maps', () => {
    const data = load(3440, 1440)
    console.log(data?.[ScreenMap.ARTIFACTS].artifact_count)
    expect(data).not.toBeNull()
  })
})
