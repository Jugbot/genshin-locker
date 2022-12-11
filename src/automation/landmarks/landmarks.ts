import { XMLParser } from 'fast-xml-parser'
import maps from './maps'

export enum ScreenMap {
  ARTIFACTS = 'artifacts',
}

enum Direction {
  ROW = 'row',
  COL = 'col',
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
    this.x = Math.min(...boxes.map((box) => Number(box['attr:x'])))
    this.y = Math.min(...boxes.map((box) => Number(box['attr:y'])))
    this.repeat_x = boxes.filter((box) =>
      aboutEquals(Number(box['attr:y']), this.y)
    ).length
    this.repeat_y = boxes.filter((box) =>
      aboutEquals(Number(box['attr:x']), this.x)
    ).length
    this.w = Number(boxes[0]['attr:width'])
    this.h = Number(boxes[0]['attr:height'])
  }

  center() {
    return [this.x + this.w / 2, this.y + this.h / 2]
  }

  *centers() {
    const [cx, cy] = this.center()
    for (let x = 0; x < this.repeat_x; x += 1) {
      for (let y = 0; y < this.repeat_y; y += 1) {
        yield [cx + x * this.w, cy + y * this.h]
      }
    }
  }
}

export interface Landmarks {
  [ScreenMap.ARTIFACTS]: {
    card_lock: Landmark
    menu_artifacts: Landmark
    sort_dir: Landmark
    list_item: Landmark
  }
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
      [ScreenMap.ARTIFACTS]: {
        card_lock: findLandmark(data, 'card_lock'),
        menu_artifacts: findLandmark(data, 'menu_artifacts'),
        sort_dir: findLandmark(data, 'sort_dir'),
        list_item: findLandmark(data, 'list_item'),
      },
    }
  } else {
    console.error(`Unsupported ratio ${w}:${h}`)
  }

  return null
}
