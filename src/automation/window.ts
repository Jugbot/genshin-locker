import { HANDLE } from 'win32-def'
import fs from 'fs'
import ffi from 'ffi-napi'
import ref from 'ref-napi'
import refstruct from 'ref-struct-di'
// import * as M from 'win32-def'
// @ts-expect-error idk
// eslint-disable-next-line import/no-unresolved
import * as W from 'win32-def/common.def'
// import * as W from 'win32-def/src/index.def'

const Struct = refstruct(ref)

// https://www.magnumdb.com/
const PW_CLIENTONLY = 1
const BI_RGB = 0
const DIB_RGB_COLORS = 0

function ucsBufferFrom(str: string | undefined | null): Buffer {
  if (typeof str === 'string' && str.length) {
    return Buffer.from(str + '\0', 'ucs2')
  }
  return ref.NULL
}

// const user32 = User32.load()
// const gdi32 = Gdi32.load()

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
  PrintWindow: [W.BOOL, [W.HWND, W.HBITMAP, W.UINT]],
  GetClientRect: [W.BOOL, [W.HWND, ref.refType(LPRECT)]],
})

const gdi32 = ffi.Library('gdi32', {
  CreateCompatibleBitmap: [W.HBITMAP, [W.HDC, W.INT, W.INT]],
  CreateCompatibleDC: [W.HDC, [W.HDC]],
  SelectObject: [W.HBITMAP, [W.HDC, W.HBITMAP]],
  GetDeviceCaps: [W.INT, [W.HDC, W.INT]],
  GetObjectW: [W.INT, [W.HBITMAP, W.INT, ref.refType(BITMAP)]],
  GetDIBits: [
    W.INT,
    [W.HDC, W.HBITMAP, W.UINT, W.UINT, W.LPVOID, W.LPVOID, W.UINT],
  ],
})

export class GenshinWindow {
  handle: HANDLE
  w = 10
  h = 10

  grabWindow() {
    this.handle = user32.FindWindowW(
      ucsBufferFrom('UnityWndClass'),
      ucsBufferFrom('Genshin Impact') // Buffer.from('Genshin Impact', 'ucs2')
    )
    user32.SetForegroundWindow(this.handle)
    // user32.ClientToScreen
  }

  capture() {
    //https://learn.microsoft.com/en-us/windows/win32/gdi/capturing-an-image
    if (!this.handle) {
      console.error('No window handle!')
      return
    }
    // Gets the DC handle of the client rect of the window
    const hwndDC = user32.GetDC(this.handle)
    console.log({ hwndDC })
    // Gets the DC memory ptr from the handle
    const hdc = gdi32.CreateCompatibleDC(hwndDC)
    console.log({ hdc })
    //
    // const width = gdi32.GetDeviceCaps(hdc, HORZRES)
    // const height = gdi32.GetDeviceCaps(hdc, VERTRES)
    const rect = new LPRECT()
    user32.GetClientRect(this.handle, rect.ref())
    console.log({ rect })
    const width = rect.right - rect.left
    const height = rect.bottom - rect.top
    //
    const hdcBlt = gdi32.CreateCompatibleBitmap(hdc, width, height)
    console.log({ hdcBlt })
    // Select the bitmap for the print operation
    gdi32.SelectObject(hdc, hdcBlt)

    const failure = user32.PrintWindow(this.handle, hdcBlt, PW_CLIENTONLY)
    console.assert(!failure, 'Failed to capture screenshot.')

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

    gdi32.GetDIBits(
      hwndDC,
      hdcBlt,
      0,
      bmp.bmHeight,
      imageBuf.ref(),
      bmpInfo.ref(),
      DIB_RGB_COLORS
    )

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

    if (fs.existsSync('./test.bmp')) {
      fs.unlinkSync('./test.bmp')
    }
    fs.writeFile(
      './test.bmp',
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

    return

    // so we can all agree that a buffer with the int value written
    // to it could be represented as an "int *"
    const buf = Buffer.alloc(4)
    buf.writeInt32LE(12345, 0)

    // first, what is the memory address of the buffer?
    console.log(buf.hexAddress()) // ← '7FA89D006FD8'

    // using `ref`, you can set the "type", and gain magic abilities!
    buf.type = ref.types.int

    // now we can dereference to get the "meaningful" value
    console.log(buf.deref()) // ← 12345

    // you can also get references to the original buffer if you need it.
    // this buffer could be thought of as an "int **"
    const one = buf.ref()

    // and you can dereference all the way back down to an int
    console.log(one.deref().deref()) // ← 12345
  }
}
