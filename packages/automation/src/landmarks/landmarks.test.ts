import { load } from './landmarks'

describe('landmarks', () => {
  it('loads maps', () => {
    const data = load(3440, 1440)
    expect(data).not.toBeNull()
  })
})
