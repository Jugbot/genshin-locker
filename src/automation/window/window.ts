import fs from 'fs'
import os from 'os'
import path from 'path'
import {
  user32,
  gdi32,
  BITMAP,
  BITMAPFILEHEADER,
  BITMAPINFOHEADER,
  INPUT,
  InputArray,
  POINT,
  RECT,
  StringBuffer,
  ImageBuffer,
} from './winapi'
import {
  MOUSEEVENTF,
  WHEEL_DELTA,
  WM_SETFOCUS,
  WM_LBUTTONDOWN,
  MK_LBUTTON,
  WM_LBUTTONUP,
  WM_MOUSEMOVE,
  BI_RGB,
  DIB_RGB_COLORS,
  SRCCOPY,
} from './winconst'
import { mouseEvent, ucsBufferFrom } from './util'
import { Pointer } from 'ref-napi'
console.log('ho')

export class GenshinWindow {
  handle: bigint
  width: bigint
  height: bigint
  x: bigint
  y: bigint

  constructor() {
    this.handle = BigInt(
      user32.FindWindowW(
        StringBuffer(ucsBufferFrom('UnityWndClass')),
        StringBuffer(ucsBufferFrom('Genshin Impact'))
      )
    )
    // this.handle = BigInt(user32.FindWindowW(null, StringBuffer(ucsBufferFrom('Steam'))))
    console.assert(this.handle, 'Handle not found.')
    // user32.ShowWindow(this.handle, SW_RESTORE)
    // user32.SetForegroundWindow(this.handle)
    const rect = new RECT()
    user32.GetClientRect(String(this.handle), rect.ref())
    const point = new POINT()
    user32.ClientToScreen(String(this.handle), point.ref())
    this.x = BigInt(point.x)
    this.y = BigInt(point.y)
    this.width = BigInt(rect.right)
    this.height = BigInt(rect.bottom)
    console.log(this)
  }

  goto(x: number, y: number) {
    user32.SendInput(
      1,
      InputArray(
        mouseEvent({
          dwFlags: MOUSEEVENTF.LEFTDOWN,
        }).ref()
      ),
      INPUT.size
    )
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

  clickDetached(x: number, y: number) {
    const pt = (x << 16) | (y & 0xffff)
    user32.SendMessageW(String(this.handle), WM_SETFOCUS, null, 0)
    user32.SendMessageW(String(this.handle), WM_LBUTTONDOWN, MK_LBUTTON, pt)
    user32.SendMessageW(String(this.handle), WM_LBUTTONUP, 0, pt)
    user32.SendMessageW(String(this.handle), WM_MOUSEMOVE, 0, pt)
  }

  capture() {
    //https://learn.microsoft.com/en-us/windows/win32/gdi/capturing-an-image
    if (!this.handle) {
      console.error('No window handle!')
      return
    }
    // Gets the DC of the client rect of the window
    const hwndDC = user32.GetDC(String(this.handle))
    console.log({ hwndDC })
    // Gets a copy of the window DC for use
    const hdc = gdi32.CreateCompatibleDC(hwndDC)
    console.log({ hdc })
    //
    const hdcBlt = gdi32.CreateCompatibleBitmap(
      hwndDC,
      Number(this.width),
      Number(this.height)
    )
    console.log({ hdcBlt })
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

    const bsize = gdi32.GetObjectW(hdcBlt, BITMAP.size, bmp.ref())
    console.log({ bmp, bsize })

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

    console.log({ bmpInfo })

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
      console.error('Failed getting DIBits')
      return
    }
    console.log({ rsultGetDIBits: result })

    console.log({ imageBuf })

    // Add the size of the headers to the size of the bitmap to get the total file size.
    const dwSizeofDIB =
      imageBuf.byteLength + BITMAPFILEHEADER.size + BITMAPINFOHEADER.size

    const bmfHeader = new BITMAPFILEHEADER({
      // Offset to where the actual bitmap bits start.
      bfOffBits: BITMAPFILEHEADER.size + BITMAPINFOHEADER.size,

      // Size of the file.
      bfSize: dwSizeofDIB,

      // bfType must always be BM for Bitmaps.
      bfType: 0x4d42, // BM.
    })

    console.log({ bmfHeader, bmpInfo, imageBuf })

    const fileName = path.join(os.tmpdir(), `temp-${new Date().getTime()}.bmp`)
    const fileBuffer = Buffer.concat([bmfHeader.ref(), bmpInfo.ref(), imageBuf])
    if (fs.existsSync(fileName)) {
      fs.unlinkSync(fileName)
    }
    fs.writeFile(fileName, fileBuffer, 'binary', (err) => {
      if (err) {
        console.error(err)
      } else {
        console.log('The file was saved!')
      }
    })
    console.log(fileName)

    user32.ReleaseDC(String(this.handle), hwndDC)
    gdi32.DeleteObject(hdcBlt)
    gdi32.DeleteDC(hdc)

    return fileBuffer
  }
}
