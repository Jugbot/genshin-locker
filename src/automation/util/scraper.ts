import { datamine } from '../datamine'
import { MainStatKey, SetKey, SlotKey, SubStat, SubStatKey } from '../types'

export const statMap: Record<string, string> = {
  hp: 'hp',
  'hp%': 'hp_',
  atk: 'atk',
  'atk%': 'atk_',
  def: 'def',
  'def%': 'def_',
  'energyrecharge%': 'enerRech_',
  energyrecharge: 'enerRech_',
  elementalmastery: 'eleMas',
  'critrate%': 'critRate_',
  critrate: 'critRate_',
  'critdmg%': 'critDMG_',
  critdmg: 'critDMG_',
  'healingbonus%': 'heal_',
  'physicaldmgbonus%': 'physical_dmg_',
  'anemodmgbonus%': 'anemo_dmg_',
  'geodmgbonus%': 'geo_dmg_',
  'electrodmgbonus%': 'electro_dmg_',
  'hydrodmgbonus%': 'hydro_dmg_',
  'pyrodmgbonus%': 'pyro_dmg_',
  'cryodmgbonus%': 'cryo_dmg_',
  'dendrodmgbonus%': 'dendro_dmg_',
}

export const slotMap: Record<string, SlotKey> = {
  PlumeofDeath: SlotKey.PLUME,
  FlowerofLife: SlotKey.FLOWER,
  SandsofEon: SlotKey.SANDS,
  CircletofLogos: SlotKey.CIRCLET,
  GobletofEonothem: SlotKey.GOBLET,
}

function stringToEnum<T extends string, TEnumValue extends string>(
  value: string,
  enumVariable: { [key in T]: TEnumValue }
): TEnumValue {
  const enumValues = Object.values(enumVariable)
  if (!enumValues.includes(value)) {
    throw Error(`"${value}" does not satisfy enum ${enumValues}`)
  }
  return value as TEnumValue
}

export const removeWhitespace = (txt: string) => txt.replaceAll(/\s+/g, '')
export const getNumber = (txt: string) => {
  const num = Number.parseFloat(txt.replaceAll(/[^.0-9]+/g, ''))
  if (isNaN(num)) {
    throw Error(`Could not parse float from "${txt}"`)
  }
  return num
}
export const cleanedStat = (
  key: string,
  val: string
): [key: string, val: number] => {
  if (val.endsWith('%')) {
    key = `${key}%`
    val = val.replaceAll('%', '')
  }
  key = key.toLowerCase()
  key = key in statMap ? statMap[key] : ''
  return [key, getNumber(val)]
}
export const getMainStat = (
  key: string,
  val: string
): [mainStatKey: MainStatKey, mainStatValue: number] => {
  const [mainStatKey, mainStatValue] = cleanedStat(
    removeWhitespace(key),
    removeWhitespace(val)
  )
  return [stringToEnum(mainStatKey, MainStatKey), mainStatValue]
}

export const getSubstats = (txts: string[]): SubStat[] => {
  let lastIndex = txts.findIndex((txt) => !txt.includes('+'))
  lastIndex = lastIndex === -1 ? txts.length : lastIndex
  return txts.slice(0, lastIndex).map((txt) => {
    const split = removeWhitespace(txt).split('+')
    const [key, value] = cleanedStat(split[0], split[1])
    return { key: stringToEnum(key, SubStatKey), value }
  })
}
export const getArtifactSet = (txt: string): SetKey => {
  const normalizedTxt = txt.toLowerCase().replaceAll(/[^a-z]+/g, '')
  const artifactData = datamine.artifacts
  if (!(normalizedTxt in artifactData)) {
    throw Error(`"${normalizedTxt}" not a valid artifact set`)
  }
  return artifactData[normalizedTxt as keyof typeof artifactData][
    'GOOD'
  ] as SetKey
}
export const getStatKey = (txt: string): string => {
  let normalizedTxt = txt.toLowerCase().replaceAll(/[^a-z]+/g, '')
  normalizedTxt = normalizedTxt.replace('percentage', '%')
  if (normalizedTxt.endsWith('bonus')) normalizedTxt += '%'
  if (!(normalizedTxt in statMap)) {
    throw Error(`"${normalizedTxt}" not a valid stat key`)
  }
  return statMap[normalizedTxt]
}
export const getSlot = (txt: string): SlotKey => {
  return stringToEnum(slotMap[removeWhitespace(txt)], SlotKey)
}
