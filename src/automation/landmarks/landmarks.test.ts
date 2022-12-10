import { load } from './landmarks'

describe('landmarks', () => {
  it('loads maps', () => {
    const data = load(3440, 1440)
    console.log(data)
    expect(data).not.toBeNull()
  })
})
