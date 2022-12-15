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
import traineddata from '../tessdata/genshin_best_eng.traineddata'

export class Navigator {
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
      yield () => {
        this.gwindow.goto(x, y)
        this.gwindow.click()
      }
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
    const tessConfig: tesseract.Config = {
      'tessdata-dir': path.join(__dirname, path.dirname(traineddata)),
      lang: path.parse(traineddata).name,
      psm: 7,
      oem: 3,
    }
    return Promise.all(
      Array.from(this.landmarks[ScreenMap.ARTIFACTS][id].regions()).map(
        async (region) => {
          const imageRegion = image.clone().extract(region).withMetadata().png()
          return tesseract.recognize(await imageRegion.toBuffer(), tessConfig)
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
    // TODO: We can use `extract()` instead of manually searching the bitmap
    const { data: bytes, info } = await image
      .clone()
      .raw()
      .toBuffer({ resolveWithObject: true })
    const { channels, width } = info
    if (!width || !channels) {
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
    const getPixel = (x: number, y: number) => {
      const index = (y * width + x) * channels
      return Array.from(bytes.subarray(index, index + channels))
    }
    return Array.from(this.landmarks[ScreenMap.ARTIFACTS][id].centers())
      .map(([cx, cy]) => getPixel(cx, cy))
      .filter((pixel) => {
        // console.log({pixel})
        return pixel.every((color, i) => {
          return colorLower[i] <= color && color <= colorUpper[i]
        })
      }).length
  }

  async scrollArtifacts(rows: number) {
    const landmark = this.landmarks[ScreenMap.ARTIFACTS]['list_item']
    const from = landmark.at(0, landmark.repeat_y - 1).center()
    this.gwindow.goto(...from)
    this.gwindow.mouseDown()
    // Break mouse drag deadzone
    await this.gwindow.move(100, 0, 100)
    await this.gwindow.move(-100, 0, 100)
    await this.gwindow.move(0, -landmark.h * rows, 1000)
    await new Promise((res) => setTimeout(res, 1000))
    this.gwindow.mouseUp()
    // Prevent momentum after drag
    this.gwindow.click()
  }

  async getArtifactCount(): Promise<number> {
    const image = await this.gwindow.capture()
    const line = await this.#readText(image, 'artifact_count')
    return Number.parseInt(line.match(/\d+/g)?.[0] ?? '')
  }

  async getArtifact(): Promise<Artifact> {
    const image = await this.gwindow.capture()
    const imageBW = image.clone().toColorspace('b-w')
    const imageBWInverted = imageBW.clone().negate()

    // this.#debugPrint(imageBW.clone().threshold(230))
    // console.log(await this.#pixelTest(image, 'card_rarity', [255, 204, 50]))
    // return {} as Artifact

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
      this.#readText(imageBW.clone().threshold(230), 'card_level'),
      this.#readTexts(image, 'card_substat'),
      this.#pixelTest(
        image.clone().extractChannel('green'),
        'card_lock',
        [0],
        [150]
      ),
      this.#readText(imageBWInverted, 'card_name'),
      this.#readText(imageBWInverted, 'card_mainstat_value'),
    ])
    console.log({
      card_set,
      card_slot_type,
      card_rarity,
      card_mainstat_key,
      card_level,
      card_substat,
      card_lock,
      card_name,
      card_mainstat_value,
    })
    // Cleanup & Validation
    const slotKey = getSlot(card_slot_type)
    const [mainStatKey, mainStatValue] = getMainStat(
      card_mainstat_key,
      card_mainstat_value
    )
    const level = getNumber(card_level)
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

  async pause() {
    return Promise.resolve()
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

const slotMap: Record<string, SlotKey> = {
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
    throw Error(`"${value}" does not satisfy enum ${enumVariable}`)
  }
  return value as TEnumValue
}

const removeWhitespace = (txt: string) => txt.replaceAll(/\s+/g, '')
const digitsOnly = (txt: string) => txt.replaceAll(/\D+/g, '')
const getNumber = (txt: string) => {
  const num = Number.parseInt(digitsOnly(txt))
  if (isNaN(num)) {
    throw Error(`Could not parse integer from "${txt}"`)
  }
  return num
}
const cleanedStat = (key: string, val: string): [key: string, val: number] => {
  if (val.endsWith('%')) {
    key = `${key}%`
    val = val.replaceAll('%', '')
  }
  key = key.toLowerCase()
  key = key in statMap ? statMap[key] : ''
  return [key, getNumber(val)]
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
  const normalizedTxt = txt.toLowerCase().replaceAll(/[^a-z]+/g, '')
  const artifactData = datamine.artifacts
  if (!(normalizedTxt in artifactData)) {
    throw Error(`"${normalizedTxt}" not a valid artifact set`)
  }
  return artifactData[normalizedTxt as keyof typeof artifactData][
    'GOOD'
  ] as SetKey
}
const getSlot = (txt: string): SlotKey => {
  return stringToEnum(slotMap[removeWhitespace(txt)], SlotKey)
}
