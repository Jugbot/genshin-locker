import { getDatabase } from '../database'

import { setTargetScores } from './statistics'

describe('statistics', () => {
  beforeEach(async () => {
    // remove test data
    const db = await getDatabase(false)
    await db.default.find().remove()
  })
  describe('getTargetScores', () => {
    it('interpolates', async () => {
      const db = await getDatabase(false)
      await db.default.bulkInsert([
        {
          set: 'SetA',
          slot: 'plume',
          main: 'atk_',
          sub: 'atk',
          rarity: 0,
          popularity: 200,
        },
        {
          set: 'SetA',
          slot: 'plume',
          main: 'atk_',
          sub: 'def',
          rarity: 0,
          popularity: 100,
        },
      ])

      await setTargetScores(0.95, {
        set: true,
        slot: true,
        main: true,
        sub: false,
      })

      const result = await db.targetscore.findOne().exec()
      if (!result) throw Error()
      const { set, slot, main, sub, score } = result
      expect({ set, slot, main, sub, score }).toEqual({
        set: 'SetA',
        slot: 'plume',
        main: 'atk_',
        sub: '',
        score: 195,
      })
    })
  })
})
