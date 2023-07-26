import { expect, test, describe } from 'vitest'

import { load } from './landmarks'

describe('landmarks', () => {
  test('loads maps', () => {
    const data = load(3440, 1440)
    expect(data).not.toBeNull()
  })
})
