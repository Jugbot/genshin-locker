import { defaultSchema, getDatabase } from '../database'
import { getTargetScores } from './statistics'

describe('statistics', () => {
  beforeEach(async () => {
    const db = await getDatabase(false)
    // insert test data
    await db.default.remove()
    await db.addCollections({ default: { schema: defaultSchema } })
    await db.default.bulkInsert([
      {
        set: 'SetA',
        slot: 'plume',
        main: 'atk_',
        sub: 'atk',
        popularity: 200,
      },
      {
        set: 'SetA',
        slot: 'plume',
        main: 'atk_',
        sub: 'def',
        popularity: 100,
      },
    ])
  })
  describe('getTargetScores', () => {
    it('interpolates', async () => {
      const scoreDict = await getTargetScores(0.95, {
        set: true,
        slot: true,
        main: true,
        sub: false,
      })
      expect(scoreDict).toEqual({
        'SetA|plume|atk_': 195,
      })
    })
  })
})
