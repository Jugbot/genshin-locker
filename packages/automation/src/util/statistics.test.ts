import { expect, test, describe } from 'vitest'

import { percentileScore } from './statistics'

describe('statistics', () => {
  describe('getTargetScores', () => {
    test('interpolates', async () => {
      const result = percentileScore(0.95, [100, 200])
      expect(result).toEqual(195)
    })
  })
})
