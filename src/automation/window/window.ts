import {
  user32,
  gdi32,
  BITMAP,
  BITMAPINFOHEADER,
  INPUT,
  InputArray,
  POINT,
  RECT,
  StringBuffer,
} from './winapi'
import {
  MOUSEEVENTF,
  WHEEL_DELTA,
  BI_RGB,
  DIB_RGB_COLORS,
  SRCCOPY,
  SW_RESTORE,
} from './winconst'
import { mouseEvent, ucsBufferFrom } from './util'
import { Pointer } from 'ref-napi'
import sharp from 'sharp'

export class GenshinWindow {
  handle: bigint
  width: bigint
  height: bigint
  x: bigint
  y: bigint

  grab() {
    this.handle = BigInt(
      user32.FindWindowW(
        StringBuffer(ucsBufferFrom('UnityWndClass')),
        StringBuffer(ucsBufferFrom('Genshin Impact'))
      )
    )
    // this.handle = BigInt(user32.FindWindowW(null, StringBuffer(ucsBufferFrom('Steam'))))
    console.assert(this.handle, 'Handle not found.')
    user32.ShowWindow(String(this.handle), SW_RESTORE)
    user32.SetForegroundWindow(String(this.handle))
    const rect = new RECT()
    user32.GetClientRect(String(this.handle), rect.ref())
    const point = new POINT()
    user32.ClientToScreen(String(this.handle), point.ref())
    this.x = BigInt(point.x)
    this.y = BigInt(point.y)
    this.width = BigInt(rect.right)
    this.height = BigInt(rect.bottom)
  }

  show() {
    user32.ShowWindow(String(this.handle), SW_RESTORE)
    user32.SetForegroundWindow(String(this.handle))
  }

  goto(x: number, y: number) {
    user32.SetCursorPos(Number(this.x) + x, Number(this.y) + y)
  }

  click() {
    const inputEvents = [
      mouseEvent({ dwFlags: MOUSEEVENTF.LEFTDOWN }).ref(),
      mouseEvent({ dwFlags: MOUSEEVENTF.LEFTUP }).ref(),
    ]

    const inputArray = InputArray(
      Buffer.concat(inputEvents).reinterpret(INPUT.size * inputEvents.length),
      inputEvents.length
    )

    user32.SendInput(inputArray.length, inputArray, INPUT.size)
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
    }).ref()

    const inputArray = InputArray(inputEvent)

    user32.SendInput(inputArray.length, inputArray, INPUT.size)

    return remainder
  }

  async drag(dx: number, dy: number, duration = 1000) {
    // TODO: Bypass mouse acceleration with MOUSEEVENTF.ABSOLUTE

    user32.SendInput(
      1,
      InputArray(
        mouseEvent({
          dwFlags: MOUSEEVENTF.LEFTDOWN,
        }).ref()
      ),
      INPUT.size
    )

    const start = Date.now()
    let lastx = 0,
      lasty = 0
    let difference = 0
    const move = async (dx: number, dy: number) => {
      if (dx === 0 && dy === 0) {
        return
      }
      user32.SendInput(
        1,
        InputArray(
          mouseEvent({
            dx,
            dy,
            dwFlags: MOUSEEVENTF.MOVE,
          }).ref()
        ),
        INPUT.size
      )
      // Surrender control to not block other async process (e.g. console.log)
      await new Promise((r) => setTimeout(r, 10))
    }

    while ((difference = Date.now() - start) < duration) {
      const percentComplete = Math.min(difference, duration) / duration
      const toX = Math.floor(percentComplete * dx)
      const toY = Math.floor(percentComplete * dy)
      await move(toX - lastx, toY - lasty)
      lastx = toX
      lasty = toY
    }
    move(dx - lastx, dy - lasty)

    user32.SendInput(
      1,
      InputArray(
        mouseEvent({
          dwFlags: MOUSEEVENTF.LEFTUP,
        }).ref()
      ),
      INPUT.size
    )
  }

  async capture() {
    //https://learn.microsoft.com/en-us/windows/win32/gdi/capturing-an-image
    if (!this.handle) {
      throw Error('No window handle!')
    }
    // Gets the DC of the client rect of the window
    const hwndDC = user32.GetDC(String(this.handle))
    // Gets a copy of the window DC for use
    const hdc = gdi32.CreateCompatibleDC(hwndDC)
    //
    const hdcBlt = gdi32.CreateCompatibleBitmap(
      hwndDC,
      Number(this.width),
      Number(this.height)
    )
    // Select the bitmap for the print operation
    console.assert(gdi32.SelectObject(hdc, hdcBlt))

    const success = gdi32.BitBlt(
      hdc,
      0,
      0,
      Number(this.width),
      Number(this.height),
      hwndDC,
      0,
      0,
      SRCCOPY
    )
    console.assert(success, 'BitBlt operation failed')

    const bmp = new BITMAP()

    gdi32.GetObjectW(hdcBlt, BITMAP.size, bmp.ref())

    const bmpInfo = new BITMAPINFOHEADER({
      biSize: BITMAPINFOHEADER.size,
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
    })

    const imageBuf = Buffer.alloc(
      Math.ceil((Number(bmp.bmWidth) * bmpInfo.biBitCount) / 32) *
        4 *
        Number(bmp.bmHeight)
    ) as Pointer<number>

    // FIXME: HDR causes previous images to get written..?
    const result = gdi32.GetDIBits(
      hwndDC,
      hdcBlt,
      0,
      Number(bmp.bmHeight),
      imageBuf,
      bmpInfo.ref(),
      DIB_RGB_COLORS
    )
    if (!result) {
      throw Error('Failed getting DIBits')
    }

    user32.ReleaseDC(String(this.handle), hwndDC)
    gdi32.DeleteObject(hdcBlt)
    gdi32.DeleteDC(hdc)

    // BGRA, we need RGBA
    for (let i = 0; i < imageBuf.byteLength; i += 4) {
      const b = imageBuf.readUInt8(i)
      const r = imageBuf.readUInt8(i + 2)
      imageBuf.writeUInt8(r, i)
      imageBuf.writeUInt8(b, i + 2)
    }

    const sharpBitmap = sharp(imageBuf, {
      raw: {
        width: Number(bmp.bmWidth),
        height: Number(bmp.bmHeight),
        channels: 4,
        // premultiplied: true
      },
    })
      .flip()
      .removeAlpha()
      // We need reinitialize in order to "apply" the flip transform. Otherwise `extract()` will reference the unflipped y value.
      .withMetadata()
      .png()
      .toBuffer()
      .then((data) => sharp(data))

    return sharpBitmap
  }
}
