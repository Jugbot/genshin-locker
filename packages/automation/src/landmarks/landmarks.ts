import { XMLParser } from 'fast-xml-parser'
import { Region } from 'sharp'

import maps from './maps'
import { ScreenMap } from './types'

function reducedFraction(numerator: number, denominator: number) {
  let a = numerator
  let b = denominator
  let c
  while (b) {
    c = a % b
    a = b
    b = c
  }
  return [numerator / a, denominator / a]
}

type SVGRect = {
  ['attr:x']: string
  ['attr:y']: string
  ['attr:width']: string
  ['attr:height']: string
}

class Landmark {
  readonly repeat_x: number
  readonly repeat_y: number
  readonly x: number
  readonly y: number
  readonly w: number
  readonly h: number

  private constructor(
    x: number,
    y: number,
    w: number,
    h: number,
    repeat_x: number,
    repeat_y: number
  ) {
    this.repeat_x = repeat_x
    this.repeat_y = repeat_y
    this.x = x
    this.y = y
    this.w = w
    this.h = h
  }

  /** A rectangle or grid of rectangles */
  static from(
    widthAdjustment: number,
    heightAdjustment: number,
    ...boxes: SVGRect[]
  ): Landmark {
    const aboutEquals = (a: number, b: number) => Math.abs(a - b) < 1
    const x = Math.round(
      Math.min(...boxes.map((box) => Number(box['attr:x']))) * widthAdjustment
    )
    const y = Math.round(
      Math.min(...boxes.map((box) => Number(box['attr:y']))) * heightAdjustment
    )
    const repeat_x = boxes.filter((box) =>
      aboutEquals(Number(box['attr:y']) * heightAdjustment, y)
    ).length
    const repeat_y = boxes.filter((box) =>
      aboutEquals(Number(box['attr:x']) * widthAdjustment, x)
    ).length
    const w = Math.round(Number(boxes[0]['attr:width']) * widthAdjustment)
    const h = Math.round(Number(boxes[0]['attr:height']) * heightAdjustment)
    return new Landmark(x, y, w, h, repeat_x, repeat_y)
  }

  *landmarks(): Generator<Landmark> {
    // Utility for iterating through the (upper-left) grid points
    for (let y = 0; y < this.repeat_y; y += 1) {
      for (let x = 0; x < this.repeat_x; x += 1) {
        yield this.at(x, y)
      }
    }
  }

  center(): [cx: number, cy: number] {
    return [this.x + this.w / 2, this.y + this.h / 2]
  }

  *centers(): Generator<[cx: number, cy: number]> {
    for (const landmark of this.landmarks()) {
      yield landmark.center()
    }
  }

  at(x: number, y: number) {
    if (!(0 <= x && x < this.repeat_x) || !(0 <= y && y < this.repeat_y)) {
      throw Error('Index out of range')
    }
    return new Landmark(
      this.x + x * this.w,
      this.y + y * this.h,
      this.w,
      this.h,
      0,
      0
    )
  }

  region(): Region {
    return {
      left: this.x,
      top: this.y,
      width: this.w,
      height: this.h,
    }
  }

  *regions(): Generator<Region> {
    for (const landmark of this.landmarks()) {
      yield landmark.region()
    }
  }
}

export const landmarkKeys = {
  [ScreenMap.ARTIFACTS]: new Set([
    'card_level',
    'card_lock',
    'card_mainstat_key',
    'card_mainstat_value',
    'card_name',
    'card_rarity',
    'card_set',
    'card_slot_type',
    'card_substat',
    'list_item',
    'menu_artifacts',
    'menu_artifacts',
    'sort_dir',
    'artifact_count',
  ] as const),
}

export interface Landmarks {
  [ScreenMap.ARTIFACTS]: Record<
    (typeof landmarkKeys)[ScreenMap.ARTIFACTS] extends Set<infer U> ? U : never,
    Landmark
  >
}

function flattenObjects(obj: object): object[] {
  return Object.entries(obj).reduce((acc: object[], [, value]): object[] => {
    if (typeof value === 'object' && value !== null) {
      return acc.concat([value, ...flattenObjects(value)])
    }
    return acc
  }, [])
}

function findLandmark(
  data: object[],
  name: string,
  widthRatio: number,
  heightRatio: number
) {
  const boxes = data.filter(
    (box): box is SVGRect =>
      'attr:inkscape:label' in box && box['attr:inkscape:label'] === name
  )
  return Landmark.from(widthRatio, heightRatio, ...boxes)
}

export function load(width: number, height: number): Landmarks | null {
  const [w, h] = reducedFraction(width, height)
  // const [w, h] = [43, 18]
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: 'attr:',
  })
  const map = `a${w}x${h}`
  if (map in maps) {
    const data = parser.parse(maps[map].artifacts)
    const { 'attr:width': mapWidth, 'attr:height': mapHeight } = data.svg
    const widthRatio = width / mapWidth
    const heightRatio = height / mapHeight
    const flatData = flattenObjects(data)
    return {
      [ScreenMap.ARTIFACTS]: Object.fromEntries(
        Array.from(landmarkKeys[ScreenMap.ARTIFACTS]).map((id) => [
          id,
          findLandmark(flatData, id, widthRatio, heightRatio),
        ])
      ) as Landmarks[ScreenMap.ARTIFACTS],
    }
  } else {
    console.error(`Unsupported ratio ${w}:${h}`)
  }

  return null
}
