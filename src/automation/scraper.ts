import tesseract from 'node-tesseract-ocr'
import { Landmarks, load, ScreenMap } from './landmarks/landmarks'
import { GenshinWindow } from './window'
import { Sharp } from 'sharp'
import path from 'path'
import os from 'os'
import {
  Artifact,
  MainStatKey,
  SetKey,
  SlotKey,
  SubStat,
  SubStatKey,
} from './types'
import { datamine } from './datamine'

export class Scraper {
  gwindow: GenshinWindow
  landmarks: Landmarks
  constructor() {
    this.gwindow = new GenshinWindow()
    this.gwindow.grab()
    const landmarks = load(
      Number(this.gwindow.width),
      Number(this.gwindow.height)
    )
    if (!landmarks) {
      throw Error('Resolution not supported.')
    }
    this.landmarks = landmarks
  }

  click(id: keyof Landmarks[ScreenMap.ARTIFACTS]) {
    const [x, y] = this.landmarks[ScreenMap.ARTIFACTS][id].center()
    this.gwindow.goto(x, y)
    this.gwindow.click()
  }

  *clickAll(id: keyof Landmarks[ScreenMap.ARTIFACTS]) {
    const centers = this.landmarks[ScreenMap.ARTIFACTS][id].centers()
    for (const point of centers) {
      const [x, y] = point
      this.gwindow.goto(x, y)
      this.gwindow.click()
      yield
    }
  }

  #debugPrint(image: Sharp) {
    const fileName = path.join(os.tmpdir(), `temp-${new Date().getTime()}.png`)
    image.toFile(fileName, (err) => {
      if (err) {
        console.error(err)
      } else {
        console.log('The file was saved!')
      }
    })
    console.log(fileName)
  }

  async #readTexts(
    image: Sharp,
    id: keyof Landmarks[ScreenMap.ARTIFACTS]
  ): Promise<string[]> {
    const cropped = image.extract(
      this.landmarks[ScreenMap.ARTIFACTS][id].region()
    )
    const tessConfig: tesseract.Config = {
      // "tessdata-dir": "",
      // lang: "genshin_best_eng",
      psm: 7,
      oem: 3,
    }
    return Promise.all(
      Array.from(this.landmarks[ScreenMap.ARTIFACTS][id].regions()).map(
        async (region) => {
          return tesseract.recognize(
            await cropped.extract(region).toBuffer(),
            tessConfig
          )
        }
      )
    )
  }

  async #readText(
    image: Sharp,
    id: keyof Landmarks[ScreenMap.ARTIFACTS]
  ): Promise<string> {
    return this.#readTexts(image, id).then(([txt]) => txt)
  }

  async #pixelTest(
    image: Sharp,
    id: keyof Landmarks[ScreenMap.ARTIFACTS],
    colorLower: number[],
    colorUpper: number[] = []
  ) {
    const { height, channels } = await image.metadata()
    if (!height || !channels) {
      throw Error('Missing image meta')
    }
    if (colorUpper.length === 0) {
      colorUpper = colorLower
    }
    if (
      colorLower.length !== colorUpper.length ||
      colorUpper.length !== channels
    ) {
      throw Error(
        `Pixel test color range start or end are not of length ${channels}`
      )
    }
    const bytes = await image.raw().toBuffer()
    const getPixel = (x: number, y: number) => {
      const index = (y * height + x) * channels
      return Array.from(bytes.subarray(index, index + channels))
    }
    return Array.from(this.landmarks[ScreenMap.ARTIFACTS][id].centers())
      .map(([cx, cy]) => getPixel(cx, cy))
      .filter((pixel) => {
        pixel.every((_, i) => {
          return colorLower[i] <= pixel[i] && pixel[i] <= colorUpper[i]
        })
      }).length
  }

  async getArtifact(): Promise<Artifact> {
    this.gwindow.grab()
    const image = await this.gwindow.capture()
    const imageBW = image.toColorspace('b-w')
    const imageBWInverted = imageBW.negate()
    const [
      card_set,
      card_slot_type,
      card_rarity,
      card_mainstat_key,
      card_level,
      card_substat,
      card_lock,
      card_name,
      card_mainstat_value,
    ] = await Promise.all([
      this.#readTexts(image, 'card_set'),
      this.#readText(imageBWInverted, 'card_slot_type'),
      this.#pixelTest(image, 'card_rarity', [255, 204, 50]),
      this.#readText(imageBWInverted, 'card_mainstat_key'),
      this.#readText(imageBW.threshold(230).negate(), 'card_level'),
      this.#readTexts(image, 'card_substat'),
      this.#pixelTest(image.extractChannel('green'), 'card_lock', [0], [150]),
      this.#readText(imageBWInverted, 'card_name'),
      this.#readText(imageBWInverted, 'card_mainstat_value'),
    ])
    // Cleanup & Validation
    const slotKey = getSlot(card_slot_type)
    const [mainStatKey, mainStatValue] = getMainStat(
      card_mainstat_key,
      card_mainstat_value
    )
    const level = Number(digitsOnly(card_level))
    const substats = getSubstats(card_substat)
    const setKey = getArtifactSet(card_set[substats.length])
    const rarity = card_rarity
    const lock = Boolean(card_lock)
    const name = card_name

    return {
      id: -1,
      level,
      location: 0,
      lock,
      mainStatKey,
      mainStatValue,
      name,
      rarity,
      setKey,
      slotKey,
      substats,
    }
  }
}

const statMap: Record<string, string> = {
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

const slotMap = {
  PlumeofDeath: 'plume',
  FlowerofLife: 'flower',
  SandsofEon: 'sands',
  CircletofLogos: 'circlet',
  GobletofEonothem: 'goblet',
}

function stringToEnum<T extends string, TEnumValue extends string>(
  value: string,
  enumVariable: { [key in T]: TEnumValue }
): TEnumValue {
  const enumValues = Object.values(enumVariable)
  if (!enumValues.includes(value)) {
    throw Error(`"${value}" does not satisfy enum ${enumVariable}`)
  }
  return value as TEnumValue
}

const removeWhitespace = (txt: string) => txt.replace(/\s+/, '')
const digitsOnly = (txt: string) => txt.replace(/\D+/, '')
const cleanedStat = (key: string, val: string): [key: string, val: number] => {
  if (val.endsWith('%')) {
    key = `${key}%`
    val = val.replace('%', '')
  }
  key = key.toLowerCase()
  key = key in statMap ? statMap[key] : ''
  // val = (val.replace(',', ''))
  return [key, Number(val)]
}
const getMainStat = (
  key: string,
  val: string
): [mainStatKey: MainStatKey, mainStatValue: number] => {
  const [mainStatKey, mainStatValue] = cleanedStat(
    removeWhitespace(key),
    removeWhitespace(val)
  )
  return [stringToEnum(mainStatKey, MainStatKey), mainStatValue]
}
const getSubstats = (txts: string[]): SubStat[] => {
  return txts
    .filter((txt) => txt.includes('+'))
    .map((txt) => {
      const split = removeWhitespace(txt).split('+')
      const [key, value] = cleanedStat(split[0], split[1])
      return { key: stringToEnum(key, SubStatKey), value }
    })
}
const getArtifactSet = (txt: string): SetKey => {
  const normalizedTxt = txt.toLowerCase().replace(/[^a-z]+/, '')
  const artifactData = datamine.artifacts
  if (!(normalizedTxt in artifactData)) {
    throw Error(`"${normalizedTxt}" not a valid artifact set`)
  }
  return artifactData[normalizedTxt as keyof typeof artifactData][
    'GOOD'
  ] as SetKey
}
const getSlot = (txt: string): SlotKey =>
  stringToEnum(removeWhitespace(txt), SlotKey)
