import ref from 'ref-napi'

import { MOUSEINPUT, INPUT, INPUT_UNION } from './winapi'
import { MOUSEEVENTF } from './winconst'

export function ucsBufferFrom(str: string | undefined | null) {
  if (typeof str === 'string' && str.length) {
    return Buffer.from(str + '\0', 'ucs2')
  }
  return ref.NULL
}

const inputEvent = (
  type: 0 | 1 | 2,
  event: Parameters<typeof MOUSEINPUT>[0]
) => {
  const mi = MOUSEINPUT({
    dx: 0,
    dy: 0,
    mouseData: 0,
    dwFlags: MOUSEEVENTF.ABSOLUTE,
    time: 0,
    ...event,
  })
  const input = new INPUT({
    type,
    dummyUnionName: new INPUT_UNION({ mi }),
  })
  return input
}

export const mouseEvent = (event: Parameters<typeof inputEvent>[1]) =>
  inputEvent(0, event)
