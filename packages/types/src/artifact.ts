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
  Adventurer = 'Adventurer',
  ArchaicPetra = 'ArchaicPetra',
  Berserker = 'Berserker',
  BlizzardStrayer = 'BlizzardStrayer',
  BloodstainedChivalry = 'BloodstainedChivalry',
  BraveHeart = 'BraveHeart',
  CrimsonWitchOfFlames = 'CrimsonWitchOfFlames',
  DeepwoodMemories = 'DeepwoodMemories',
  DefendersWill = 'DefendersWill',
  DesertPavilionChronicle = 'DesertPavilionChronicle',
  EchoesOfAnOffering = 'EchoesOfAnOffering',
  EmblemOfSeveredFate = 'EmblemOfSeveredFate',
  FlowerOfParadiseLost = 'FlowerOfParadiseLost',
  Gambler = 'Gambler',
  GildedDreams = 'GildedDreams',
  GladiatorsFinale = 'GladiatorsFinale',
  HeartOfDepth = 'HeartOfDepth',
  HuskOfOpulentDreams = 'HuskOfOpulentDreams',
  Instructor = 'Instructor',
  Lavawalker = 'Lavawalker',
  LuckyDog = 'LuckyDog',
  MaidenBeloved = 'MaidenBeloved',
  MartialArtist = 'MartialArtist',
  NoblesseOblige = 'NoblesseOblige',
  OceanHuedClam = 'OceanHuedClam',
  PaleFlame = 'PaleFlame',
  PrayersForDestiny = 'PrayersForDestiny',
  PrayersForIllumination = 'PrayersForIllumination',
  PrayersForWisdom = 'PrayersForWisdom',
  PrayersToSpringtime = 'PrayersToSpringtime',
  ResolutionOfSojourner = 'ResolutionOfSojourner',
  RetracingBolide = 'RetracingBolide',
  Scholar = 'Scholar',
  ShimenawasReminiscence = 'ShimenawasReminiscence',
  TenacityOfTheMillelith = 'TenacityOfTheMillelith',
  TheExile = 'TheExile',
  ThunderingFury = 'ThunderingFury',
  Thundersoother = 'Thundersoother',
  TinyMiracle = 'TinyMiracle',
  TravelingDoctor = 'TravelingDoctor',
  VermillionHereafter = 'VermillionHereafter',
  ViridescentVenerer = 'ViridescentVenerer',
  WanderersTroupe = 'WanderersTroupe',
  NymphsDream = 'NymphsDream',
  VourukashasGlow = 'VourukashasGlow',
  GoldenTroupe = 'GoldenTroupe',
  MarechausseeHunter = 'MarechausseeHunter',
  NighttimeWhispersInTheEchoingWoods = 'NighttimeWhispersInTheEchoingWoods',
  SongOfDaysPast = 'SongOfDaysPast',
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

export interface ArtifactMetrics {
  set: SetKey
  slot: SlotKey
  main: MainStatKey
  sub: SubStatKey
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
