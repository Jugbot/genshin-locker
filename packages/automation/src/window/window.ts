import koffi from 'koffi'
import sharp from 'sharp'

import { GBRAtoRGB } from '../util/image'

import { mouseEvent } from './util'
import { user32, gdi32, BITMAP, BITMAPINFOHEADER, INPUT, vjoy } from './winapi'
import {
  MOUSEEVENTF,
  WHEEL_DELTA,
  BI_RGB,
  DIB_RGB_COLORS,
  SRCCOPY,
  SW_RESTORE,
  VK,
  GAMEPAD_BTN,
} from './winconst'

export class GenshinWindow {
  handle = 0n
  width = 0n
  height = 0n
  x = 0n
  y = 0n

  grab() {
    this.handle = BigInt(user32.FindWindowW('UnityWndClass', 'Genshin Impact'))
    if (!this.handle) {
      return false
    }
    user32.ShowWindow(this.handle, SW_RESTORE)
    user32.SetForegroundWindow(this.handle)
    const rect = {} as Record<string, number>
    user32.GetClientRect(this.handle, rect)
    const point = {} as Record<string, number>
    user32.ClientToScreen(this.handle, point)
    this.x = BigInt(point.x)
    this.y = BigInt(point.y)
    this.width = BigInt(rect.right)
    this.height = BigInt(rect.bottom)
    return true
  }

  show() {
    user32.ShowWindow(this.handle, SW_RESTORE)
    user32.SetForegroundWindow(this.handle)
  }

  keydown(char: VK): boolean {
    const state = user32.GetAsyncKeyState(char)
    // Most significant bit is "pressed" state
    return Boolean(state & 0x8000)
  }

  goto(x: number, y: number) {
    user32.SetCursorPos(Number(this.x) + x, Number(this.y) + y)
  }

  click() {
    const inputEvents = [
      mouseEvent({ dwFlags: MOUSEEVENTF.LEFTDOWN }),
      mouseEvent({ dwFlags: MOUSEEVENTF.LEFTUP }),
    ]

    user32.SendInput(inputEvents.length, inputEvents, koffi.sizeof(INPUT))
  }

  gamepadButton(btn: GAMEPAD_BTN, down: boolean) {
    console.info('AcquireVJD', vjoy?.AcquireVJD(1))
    console.info('SetBtn', vjoy?.SetBtn(down ? 1 : 0, 1, btn))
    console.info('RelinquishVJD', vjoy?.RelinquishVJD(1))
  }

  mouseDown() {
    user32.SendInput(
      1,
      [
        mouseEvent({
          dwFlags: MOUSEEVENTF.LEFTDOWN,
        }),
      ],
      koffi.sizeof(INPUT)
    )
  }

  mouseUp() {
    user32.SendInput(
      1,
      [
        mouseEvent({
          dwFlags: MOUSEEVENTF.LEFTUP,
        }),
      ],
      koffi.sizeof(INPUT)
    )
  }

  scroll(dy: number, unit: 'px' | 'clicks' = 'px'): number {
    let clicks = dy
    let remainder = 0
    if (unit === 'px') {
      clicks = Math.trunc(dy / WHEEL_DELTA)
      remainder = dy % WHEEL_DELTA
    }
    if (clicks === 0) {
      return remainder
    }
    const inputEvent = mouseEvent({
      dwFlags: MOUSEEVENTF.WHEEL,
      // Convert negatives to the 32-bit-two's-complement version
      mouseData: (clicks * WHEEL_DELTA) >>> 0,
    })

    const inputArray = [inputEvent]

    user32.SendInput(inputArray.length, inputArray, koffi.sizeof(INPUT))

    return remainder
  }

  async drag(dx: number, dy: number, duration = 1000) {
    this.mouseDown()
    await this.move(dx, dy, duration)
    this.mouseUp()
  }

  async move(dx: number, dy: number, duration = 1000) {
    // TODO: Bypass mouse acceleration with MOUSEEVENTF.ABSOLUTE
    const start = Date.now()
    let lastx = 0
    let lasty = 0
    let difference = 0
    const move = (dx: number, dy: number) => {
      if (dx === 0 && dy === 0) {
        return
      }
      user32.SendInput(
        1,
        [
          mouseEvent({
            dx,
            dy,
            dwFlags: MOUSEEVENTF.MOVE,
          }),
        ],
        koffi.sizeof(INPUT)
      )
    }

    while ((difference = Date.now() - start) < duration) {
      const percentComplete = Math.min(difference, duration) / duration
      const toX = Math.trunc(percentComplete * dx)
      const toY = Math.trunc(percentComplete * dy)
      move(toX - lastx, toY - lasty)
      lastx = toX
      lasty = toY
      // Surrender control to not block other async process (e.g. console.log)
      await new Promise((r) => setTimeout(r, 10))
    }
    move(dx - lastx, dy - lasty)
    // await new Promise(res => setTimeout(res, 1000))
  }

  async capture() {
    return this.captureBGRA().then(GBRAtoRGB)
  }

  async captureBGRA() {
    //https://learn.microsoft.com/en-us/windows/win32/gdi/capturing-an-image
    if (!this.handle) {
      throw Error('No window handle!')
    }
    // Gets the DC of the whole screen (getting the dc of the client area does not work sometimes)
    const hwndDC = user32.GetDC(0)
    // Gets a copy of the window DC for use
    const hdc = gdi32.CreateCompatibleDC(hwndDC)
    // Create bitmap that is compatible with the screen graphics
    const hdcBlt = gdi32.CreateCompatibleBitmap(
      hwndDC,
      Number(this.width),
      Number(this.height)
    )
    // Select the bitmap for the print operation
    const unknownLastObj = gdi32.SelectObject(hdc, hdcBlt)

    gdi32.BitBlt(
      hdc,
      0,
      0,
      Number(this.width),
      Number(this.height),
      hwndDC,
      Number(this.x),
      Number(this.y),
      SRCCOPY
    )

    // Select whatever was there before (might not be necessary)
    gdi32.SelectObject(hdc, unknownLastObj)

    // TODO: Proper type definition
    const bmp = {} as Record<string, unknown>

    gdi32.GetObjectW(hdcBlt, koffi.sizeof(BITMAP), bmp)

    const bmpInfo = {
      biSize: koffi.sizeof(BITMAPINFOHEADER),
      biWidth: bmp.bmWidth,
      biHeight: bmp.bmHeight,
      biPlanes: 1,
      biBitCount: 32,
      biCompression: BI_RGB,
      biSizeImage: 0,
      biXPelsPerMeter: 0,
      biYPelsPerMeter: 0,
      biClrUsed: 0,
      biClrImportant: 0,
    }

    const imageBuf = Buffer.alloc(
      Math.ceil((Number(bmp.bmWidth) * bmpInfo.biBitCount) / 32) *
        4 *
        Number(bmp.bmHeight)
    )

    // Get graphics in bitmap as bit buffer
    const result = gdi32.GetDIBits(
      hwndDC,
      hdcBlt,
      0,
      Number(bmp.bmHeight),
      imageBuf,
      bmpInfo,
      DIB_RGB_COLORS
    )
    if (!result) {
      throw Error('Failed getting DIBits')
    }

    gdi32.DeleteObject(hdcBlt)
    gdi32.DeleteObject(hdc)
    user32.ReleaseDC(0, hwndDC)

    return sharp(imageBuf, {
      raw: {
        width: Number(bmp.bmWidth),
        height: Number(bmp.bmHeight),
        channels: 4,
      },
    })
  }
}
