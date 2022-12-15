import { load, ScreenMap } from './landmarks'

describe('landmarks', () => {
  it('loads maps', () => {
    const data = load(3440, 1440)
    console.log(data?.[ScreenMap.ARTIFACTS].artifact_count)
    expect(data).not.toBeNull()
  })
})
