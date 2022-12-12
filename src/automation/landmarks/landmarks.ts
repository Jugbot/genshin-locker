import { XMLParser } from 'fast-xml-parser'
import { Region } from 'sharp'
import maps from './maps'

export enum ScreenMap {
  ARTIFACTS = 'artifacts',
}

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
  repeat_x: number
  repeat_y: number
  x: number
  y: number
  w: number
  h: number

  /** A rectangle or grid of rectangles */
  constructor(...boxes: SVGRect[]) {
    const aboutEquals = (a: number, b: number) => Math.abs(a - b) < 1
    this.x = Math.round(Math.min(...boxes.map((box) => Number(box['attr:x']))))
    this.y = Math.round(Math.min(...boxes.map((box) => Number(box['attr:y']))))
    this.repeat_x = boxes.filter((box) =>
      aboutEquals(Number(box['attr:y']), this.y)
    ).length
    this.repeat_y = boxes.filter((box) =>
      aboutEquals(Number(box['attr:x']), this.x)
    ).length
    this.w = Math.round(Number(boxes[0]['attr:width']))
    this.h = Math.round(Number(boxes[0]['attr:height']))
  }

  *#landmarks(): Generator<[x: number, y: number]> {
    // Utility for iterating through the (upper-left) grid points
    for (let x = 0; x < this.repeat_x; x += 1) {
      for (let y = 0; y < this.repeat_y; y += 1) {
        yield [this.x + x * this.w, this.y + y * this.h]
      }
    }
  }

  center(): [cx: number, cy: number] {
    return [Math.trunc(this.x + this.w / 2), Math.trunc(this.y + this.h / 2)]
  }

  *centers(): Generator<[cx: number, cy: number]> {
    for (const [x, y] of this.#landmarks()) {
      yield [Math.trunc(x + this.w / 2), Math.trunc(y + this.h / 2)]
    }
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
    for (const [x, y] of this.#landmarks()) {
      yield {
        left: x,
        top: y,
        width: this.w,
        height: this.h,
      }
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
  ] as const),
}

export interface Landmarks {
  [ScreenMap.ARTIFACTS]: Record<
    typeof landmarkKeys[ScreenMap.ARTIFACTS] extends Set<infer U> ? U : never,
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

function findLandmark(data: object[], name: string) {
  const boxes = data.filter(
    (box): box is SVGRect =>
      'attr:inkscape:label' in box && box['attr:inkscape:label'] === name
  )
  return new Landmark(...boxes)
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
    const data = flattenObjects(parser.parse(maps[map].artifacts))
    return {
      [ScreenMap.ARTIFACTS]: Object.fromEntries(
        Array.from(landmarkKeys[ScreenMap.ARTIFACTS]).map((id) => [
          id,
          findLandmark(data, id),
        ])
      ) as Landmarks[ScreenMap.ARTIFACTS],
    }
  } else {
    console.error(`Unsupported ratio ${w}:${h}`)
  }

  return null
}
