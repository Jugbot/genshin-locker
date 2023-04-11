import { MOUSEEVENTF } from './winconst'

export function ucsBufferFrom(str: string | undefined | null) {
  if (typeof str === 'string' && str.length) {
    return Buffer.from(str + '\0', 'ucs2')
  }
  return [null]
}

const inputEvent = (
  type: 0 | 1 | 2,
  // TODO: Proper type definition
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event: any
) => {
  const mi = {
    dx: 0,
    dy: 0,
    mouseData: 0,
    dwFlags: MOUSEEVENTF.ABSOLUTE,
    time: 0,
    dwExtraInfo: null,
    ...event,
  }
  const input = {
    type,
    dummyUnionName: { mi },
  }
  return input
}

export const mouseEvent = (event: Parameters<typeof inputEvent>[1]) =>
  inputEvent(0, event)
