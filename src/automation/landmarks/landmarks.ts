import { XMLParser } from 'fast-xml-parser'

enum Screen {
  ARTIFACTS = 'artifacts',
}

enum Direction {
  ROW = 'row',
  COL = 'col',
}

function reduce(numerator: number, denominator: number) {
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

class Landmark {
  multiples: number
  direction: Direction
  x: number
  y: number
  w: number
  h: number

  constructor() {
    return
  }
}

interface Landmarks {
  [Screen.ARTIFACTS]?: {
    card_lock: Landmark
    menu_artifacts: Landmark
    sort_dir: Landmark
    list_item: Landmark
  }
}

export async function load(width: number, height: number): Promise<Landmarks> {
  const [w, h] = reduce(width, height)
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: 'attr:',
  })
  // const svg = require('main_window/assets/a43x18.svg')
  // const svg = require(`a${w}x${h}.svg`)
  // const dom = new JSDOM(svg)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const data = parser.parse(require(`./a${w}x${h}.svg`))
  // console.log(dom.window.document)
  console.log(data.svg['attr:width'])

  return {}
}
