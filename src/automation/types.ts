export enum SlotKey {
  FLOWER = 'flower',
  PLUME = 'plume',
  SANDS = 'sands',
  CIRCLET = 'circlet',
  GOBLET = 'goblet',
}
export enum SubStatKey {
  HP_FLAT = 'hp',
  HP_PERCENT = 'hp_',
  ATK_FLAT = 'atk',
  ATK_PERCENT = 'atk_',
  DEF_FLAT = 'def',
  DEF_PERCENT = 'def_',
  ELEM_MASTERY = 'eleMas',
  ENERGY_RECHARGE = 'enerRech_',
  CRIT_RATE = 'critRate_',
  CRIT_DAMAGE = 'critDMG_',
}
export enum MainStatKey {
  HP_FLAT = 'hp',
  HP_PERCENT = 'hp_',
  ATK_FLAT = 'atk',
  ATK_PERCENT = 'atk_',
  DEF_PERCENT = 'def_',
  ELEM_MASTERY = 'eleMas',
  ENERGY_RECHARGE = 'enerRech_',
  CRIT_RATE = 'critRate_',
  CRIT_DAMAGE = 'critDMG_',
  PHYSICAL_DMG = 'physical_dmg_',
  ANEMO_DMG = 'anemo_dmg_',
  GEO_DMG = 'geo_dmg_',
  ELECTRO_DMG = 'electro_dmg_',
  HYDRO_DMG = 'hydro_dmg_',
  PYRO_DMG = 'pyro_dmg_',
  CRYO_DMG = 'cryo_dmg_',
  DENDRO_DMG = 'dendro_dmg_',
  HEAL_PERCENT = 'heal_',
}

export enum SetKey {
  ResolutionOfSojourner = 'ResolutionOfSojourner',
  BraveHeart = 'BraveHeart',
  DefendersWill = 'DefendersWill',
  TinyMiracle = 'TinyMiracle',
  Berserker = 'Berserker',
  MartialArtist = 'MartialArtist',
  Instructor = 'Instructor',
  Gambler = 'Gambler',
  TheExile = 'TheExile',
  Adventurer = 'Adventurer',
  LuckyDog = 'LuckyDog',
  Scholar = 'Scholar',
  TravelingDoctor = 'TravelingDoctor',
  BlizzardStrayer = 'BlizzardStrayer',
  Thundersoother = 'Thundersoother',
  Lavawalker = 'Lavawalker',
  MaidenBeloved = 'MaidenBeloved',
  GladiatorsFinale = 'GladiatorsFinale',
  ViridescentVenerer = 'ViridescentVenerer',
  WanderersTroupe = 'WanderersTroupe',
  ThunderingFury = 'ThunderingFury',
  CrimsonWitchOfFlames = 'CrimsonWitchOfFlames',
  NoblesseOblige = 'NoblesseOblige',
  BloodstainedChivalry = 'BloodstainedChivalry',
  PrayersForIllumination = 'PrayersForIllumination',
  PrayersForDestiny = 'PrayersForDestiny',
  PrayersForWisdom = 'PrayersForWisdom',
  PrayersToSpringtime = 'PrayersToSpringtime',
  ArchaicPetra = 'ArchaicPetra',
  RetracingBolide = 'RetracingBolide',
  HeartOfDepth = 'HeartOfDepth',
  TenacityOfTheMillelith = 'TenacityOfTheMillelith',
  PaleFlame = 'PaleFlame',
  ShimenawasReminiscence = 'ShimenawasReminiscence',
  EmblemOfSeveredFate = 'EmblemOfSeveredFate',
  HuskOfOpulentDreams = 'HuskOfOpulentDreams',
  OceanHuedClam = 'OceanHuedClam',
  VermillionHereafter = 'VermillionHereafter',
  EchoesOfAnOffering = 'EchoesOfAnOffering',
  GildedDreams = 'GildedDreams',
  DeepwoodMemories = 'DeepwoodMemories',
}

export interface SubStat {
  key: SubStatKey
  value: number
}

export interface Artifact {
  name: string
  mainStatValue: number
  setKey: SetKey
  slotKey: SlotKey
  rarity: number
  mainStatKey: MainStatKey
  level: number
  substats: SubStat[]
  location: number
  lock: boolean
  id: string
}

export const ElementalDamageTypes = new Set([
  MainStatKey.ANEMO_DMG,
  MainStatKey.GEO_DMG,
  MainStatKey.ELECTRO_DMG,
  MainStatKey.HYDRO_DMG,
  MainStatKey.PYRO_DMG,
  MainStatKey.CRYO_DMG,
])

export const FlatSubStats = new Set([
  SubStatKey.ATK_FLAT,
  SubStatKey.DEF_FLAT,
  SubStatKey.HP_FLAT,
])
