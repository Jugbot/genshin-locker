import {
  mainStatRollChance,
  subStatRollChance,
  getDatabase
} from '@gl/automation'
import {
  MainStatKey,
  SetKey,
  SlotKey,
  SubStatKey,
} from '@gl/types'

import { asCommand } from './types'

export async function insertRarity() {
  const db = await getDatabase()

  for (const set of Object.values(SetKey)) {
    for (const slot of Object.values(SlotKey)) {
      for (const main of Object.values(MainStatKey)) {
        for (const sub of Object.values(SubStatKey)) {
          const rarity =
            mainStatRollChance(main, slot) * subStatRollChance(sub, main)
          if (rarity === 0) {
            // Rarity is zero if the artifact is not valid.
            continue
          }
          const row = {
            set,
            slot,
            main,
            sub,
          }
          let doc = await db.default.findOne({ selector: row }).exec()
          if (!doc) {
            doc = await db.default.insert({
              ...row,
              popularity: 0,
              rarity: 0,
            })
          }
          await doc.update({
            $set: {
              rarity,
            },
          })
        }
      }
    }
  }

  await db.destroy()
  process.exit()
}

export const command = asCommand({
  command: 'rarity',
  describe: 'Hydrate the database with rarity information.',
  builder: {},
  handler: () => {
    insertRarity()
  },
})