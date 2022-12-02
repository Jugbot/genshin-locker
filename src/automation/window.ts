import { HANDLE } from 'win32-def'
import fs from 'fs'
import os from 'os'
import path from 'path'
import ffi from 'ffi-napi'
import ref from 'ref-napi'
import refstruct from 'ref-struct-di'
// @ts-expect-error idk
// eslint-disable-next-line import/no-unresolved
import * as W from 'win32-def/common.def'
// import * as WType from 'win32-def/src/index.def'
// const W = WVal as typeof WType

const Struct = refstruct(ref)

// https://www.magnumdb.com/
const BI_RGB = 0
const DIB_RGB_COLORS = 0
const SRCCOPY = 13369376

function ucsBufferFrom(str: string | undefined | null): Buffer {
  if (typeof str === 'string' && str.length) {
    return Buffer.from(str + '\0', 'ucs2')
  }
  return ref.NULL
}

const BITMAP = Struct(
  {
    bmType: W.LONG,
    bmWidth: W.LONG,
    bmHeight: W.LONG,
    bmWidthBytes: W.LONG,
    bmPlanes: W.WORD,
    bmBitsPixel: W.WORD,
    bmBits: W.LPVOID,
  },
  { packed: false }
)

const BITMAPINFOHEADER = Struct(
  {
    biSize: W.DWORD,
    biWidth: W.LONG,
    biHeight: W.LONG,
    biPlanes: W.WORD,
    biBitCount: W.WORD,
    biCompression: W.DWORD,
    biSizeImage: W.DWORD,
    biXPelsPerMeter: W.LONG,
    biYPelsPerMeter: W.LONG,
    biClrUsed: W.DWORD,
    biClrImportant: W.DWORD,
  },
  { packed: true }
)

const BITMAPFILEHEADER = Struct(
  {
    bfType: W.WORD,
    bfSize: W.DWORD,
    bfReserved1: W.WORD,
    bfReserved2: W.WORD,
    bfOffBits: W.DWORD,
  },
  { packed: true }
)

const LPRECT = Struct({
  left: W.LONG,
  top: W.LONG,
  right: W.LONG,
  bottom: W.LONG,
})

const user32 = ffi.Library('user32', {
  FindWindowW: [W.HWND, [W.LPCTSTR, W.LPCTSTR]],
  SetForegroundWindow: [W.BOOL, [W.HWND]],
  GetDC: [W.HDC, [W.HWND]],
  ReleaseDC: [W.INT, [W.HWND, W.HDC]],
  PrintWindow: [W.BOOL, [W.HWND, W.HBITMAP, W.UINT]],
  GetClientRect: [W.BOOL, [W.HWND, ref.refType(LPRECT)]],
})

const gdi32 = ffi.Library('gdi32', {
  CreateCompatibleBitmap: [W.HBITMAP, [W.HDC, W.INT, W.INT]],
  CreateCompatibleDC: [W.HDC, [W.HDC]],
  DeleteDC: [W.BOOL, [W.HDC]],
  SelectObject: [W.HBITMAP, [W.HDC, W.HBITMAP]],
  GetDeviceCaps: [W.INT, [W.HDC, W.INT]],
  GetObjectW: [W.INT, [W.HBITMAP, W.INT, ref.refType(BITMAP)]],
  GetDIBits: [
    W.INT,
    [W.HDC, W.HBITMAP, W.UINT, W.UINT, W.LPVOID, W.LPVOID, W.UINT],
  ],
  BitBlt: [
    W.BOOL,
    [W.HDC, W.INT, W.INT, W.INT, W.INT, W.HDC, W.INT, W.INT, W.DWORD],
  ],
})

export class GenshinWindow {
  handle: HANDLE
  width: number
  height: number

  constructor() {
    // this.handle = user32.FindWindowW(
    //   ucsBufferFrom('UnityWndClass'),
    //   ucsBufferFrom('Genshin Impact') // Buffer.from('Genshin Impact', 'ucs2')
    // )
    this.handle = user32.FindWindowW(null, ucsBufferFrom('Task Manager'))
    // user32.SetForegroundWindow(this.handle)
    const rect = new LPRECT()
    user32.GetClientRect(this.handle, rect.ref())
    console.log({ rect })
    this.width = rect.right - rect.left
    this.height = rect.bottom - rect.top
  }

  capture() {
    //https://learn.microsoft.com/en-us/windows/win32/gdi/capturing-an-image
    if (!this.handle) {
      console.error('No window handle!')
      return
    }
    // Gets the DC of the client rect of the window
    const hwndDC = user32.GetDC(this.handle)
    console.log({ hwndDC })
    // Gets a copy of the window DC for use
    const hdc = gdi32.CreateCompatibleDC(hwndDC)
    console.log({ hdc })
    //
    const hdcBlt = gdi32.CreateCompatibleBitmap(hwndDC, this.width, this.height)
    console.log({ hdcBlt })
    // Select the bitmap for the print operation
    gdi32.SelectObject(hdc, hdcBlt)

    const success = gdi32.BitBlt(
      hdc,
      0,
      0,
      this.width,
      this.height,
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
      Math.ceil((bmp.bmWidth * bmpInfo.biBitCount) / 32) * 4 * bmp.bmHeight
    )

    const result = gdi32.GetDIBits(
      hwndDC,
      hdcBlt,
      0,
      bmp.bmHeight,
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
    if (fs.existsSync(fileName)) {
      fs.unlinkSync(fileName)
    }
    fs.writeFile(
      fileName,
      Buffer.concat([bmfHeader.ref(), bmpInfo.ref(), imageBuf]),
      'binary',
      (err) => {
        if (err) {
          console.error(err)
        } else {
          console.log('The file was saved!')
        }
      }
    )
    console.log(fileName)

    user32.ReleaseDC(this.handle, hwndDC)
    gdi32.DeleteDC(hdc)
  }
}
