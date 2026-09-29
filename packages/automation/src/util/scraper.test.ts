import { describe, expect, test } from 'vitest'

import { getSubstats } from './scraper'

describe('getSubstats', () => {
  test('all active', () => {
    expect(
      getSubstats(
        ['ATK+16', 'CRIT Rate+3.9%', 'ATK+5.8%', 'Elemental Mastery+91'],
        [false, false, false, false],
        20
      )
    ).toEqual({
      substats: [
        { key: 'atk', value: 16 },
        { key: 'critRate_', value: 3.9 },
        { key: 'atk_', value: 5.8 },
        { key: 'eleMas', value: 91 },
      ],
      unactivatedSubstats: [],
    })
  })

  test('last substat unactivated', () => {
    expect(
      getSubstats(
        [
          'DEF+16',
          'Energy Recharge+5.2%',
          'ATK+4.1%',
          'CRIT Rate+3.9% (unactivated)',
        ],
        [false, false, false, true],
        0
      )
    ).toEqual({
      substats: [
        { key: 'def', value: 16 },
        { key: 'enerRech_', value: 5.2 },
        { key: 'atk_', value: 4.1 },
      ],
      unactivatedSubstats: [{ key: 'critRate_', value: 3.9 }],
    })
  })

  test('ignores digits in the suffix', () => {
    expect(
      getSubstats(['ATK+5.8% (unact1vated)'], [true], 0).unactivatedSubstats
    ).toEqual([{ key: 'atk_', value: 5.8 }])
  })

  test('throws on active substat after unactivated', () => {
    expect(() =>
      getSubstats(['ATK+5.8%', 'DEF+16'], [true, false], 0)
    ).toThrow()
  })

  test('throws on more than one unactivated substat', () => {
    expect(() => getSubstats(['ATK+5.8%', 'DEF+16'], [true, true], 0)).toThrow()
  })

  test('throws on unactivated substat at level 4 and up', () => {
    expect(() =>
      getSubstats(['DEF+16', 'ATK+5.8%'], [false, true], 4)
    ).toThrow()
  })
})
