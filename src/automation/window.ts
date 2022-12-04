import { HANDLE } from 'win32-def'
import fs from 'fs'
import os from 'os'
import path from 'path'
import ffi from 'ffi-napi'
import ref from 'ref-napi'
import refstruct from 'ref-struct-di'
import refunion from 'ref-union-di'
import refarray from 'ref-array-di'
// @ts-expect-error idk
// eslint-disable-next-line import/no-unresolved
import * as W from 'win32-def/common.def'
// import * as N from 'win32-def/src/index.def'
// const W = WVal as typeof WType

const Struct = refstruct(ref)
const Union = refunion(ref)
const RefArray = refarray(ref)

// https://www.magnumdb.com/
const BI_RGB = 0
const DIB_RGB_COLORS = 0
const SRCCOPY = 13369376
const WM_LBUTTONDOWN = 0x0201
const WM_LBUTTONUP = 0x0202
const WM_MOUSEMOVE = 0x0200
const WM_MOUSEACTIVATE = 0x0021
const WM_SETFOCUS = 0x0007
const INPUT_MOUSE = 0
const INPUT_KEYBOARD = 1
const INPUT_HARDWARE = 2
const MOUSEEVENTF_LEFTDOWN = 0x0002
const MK_LBUTTON = 1

enum MOUSEEVENTF {
  MOVE = 0x0001, //	Movement occurred.
  LEFTDOWN = 0x0002, //	The left button was pressed.
  LEFTUP = 0x0004, //	The left button was released.
  RIGHTDOWN = 0x0008, //	The right button was pressed.
  RIGHTUP = 0x0010, //	The right button was released.
  MIDDLEDOWN = 0x0020, //	The middle button was pressed.
  MIDDLEUP = 0x0040, //	The middle button was released.
  XDOWN = 0x0080, //	An X button was pressed.
  XUP = 0x0100, //	An X button was released.
  WHEEL = 0x0800, //	The wheel was moved, if the mouse has a wheel. The amount of movement is specified in mouseData.
  HWHEEL = 0x1000, //	The wheel was moved horizontally, if the mouse has a wheel. The amount of movement is specified in mouseData. Windows XP/2000: This value is not supported.
  MOVE_NOCOALESCE = 0x2000, //	The WM_MOUSEMOVE messages will not be coalesced. The default behavior is to coalesce WM_MOUSEMOVE messages. Windows XP/2000: This value is not supported.
  VIRTUALDESK = 0x4000, //	Maps coordinates to the entire desktop. Must be used with MOUSEEVENTF_ABSOLUTE.
  ABSOLUTE = 0x8000, //
}

function ucsBufferFrom(str: string | undefined | null): Buffer {
  if (typeof str === 'string' && str.length) {
    return Buffer.from(str + '\0', 'ucs2')
  }
  return ref.NULL
}

const POINT = Struct({
  x: W.LONG,
  y: W.LONG,
})

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

const MOUSEINPUT = Struct({
  dx: ref.types.long,
  dy: ref.types.long,
  mouseData: ref.types.uint32,
  dwFlags: ref.types.uint32,
  time: ref.types.uint32,
  dwExtraInfo: ref.refType(ref.types.ulong),
})

const KEYBDINPUT = Struct({
  wVk: ref.types.int16,
  wScan: ref.types.int16,
  dwFlags: ref.types.uint32,
  time: ref.types.uint32,
  dwExtraInfo: ref.refType(ref.types.ulong),
})

const HARDWAREINPUT = Struct({
  uMsg: ref.types.uint32,
  wParamL: ref.types.int16,
  wParamH: ref.types.int16,
})

const INPUT_UNION = new Union({
  mi: MOUSEINPUT,
  ki: KEYBDINPUT,
  hi: HARDWAREINPUT,
})

const INPUT = Struct({
  type: ref.types.uint32,
  dummyUnionName: INPUT_UNION,
})

const InputArray = RefArray(INPUT)

const user32 = ffi.Library('user32', {
  FindWindowW: [W.HWND, [W.LPCTSTR, W.LPCTSTR]],
  SetForegroundWindow: [W.BOOL, [W.HWND]],
  GetDC: [W.HDC, [W.HWND]],
  ReleaseDC: [W.INT, [W.HWND, W.HDC]],
  PrintWindow: [W.BOOL, [W.HWND, W.HBITMAP, W.UINT]],
  GetClientRect: [W.BOOL, [W.HWND, ref.refType(LPRECT)]],
  SendMessageW: [W.LONG_PTR, [W.HWND, W.UINT, W.UINT_PTR, W.LONG_PTR]],
  SendMessageA: [W.LONG_PTR, [W.HWND, W.UINT, W.UINT_PTR, W.LONG_PTR]],
  PostMessageW: [W.LONG_PTR, [W.HWND, W.UINT, W.UINT_PTR, W.LONG_PTR]],
  SendInput: ['uint', ['uint', ref.refType(INPUT), 'uint']],
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
    this.handle = user32.FindWindowW(
      ucsBufferFrom('UnityWndClass'),
      ucsBufferFrom('Genshin Impact') // Buffer.from('Genshin Impact', 'ucs2')
    )
    // this.handle = user32.FindWindowW(
    //   null,
    //   ucsBufferFrom('Untitled - Paint')
    // )
    // user32.SetForegroundWindow(this.handle)
    const rect = new LPRECT()
    user32.GetClientRect(this.handle, rect.ref())
    console.log({ rect })
    this.width = rect.right - rect.left
    this.height = rect.bottom - rect.top
  }

  click(x: number, y: number) {
    const mouseEvent = (event: MOUSEEVENTF) => {
      const mi = MOUSEINPUT({
        dx: x,
        dy: y,
        mouseData: 0,
        dwFlags: event,
        time: 0,
        dwExtraInfo: ref.NULL,
      })
      const input = new INPUT({
        type: 0,
        dummyUnionName: new INPUT_UNION({ mi }),
      })
      return input
    }
    const inputEvents = [
      mouseEvent(MOUSEEVENTF.LEFTDOWN).ref(),
      mouseEvent(MOUSEEVENTF.LEFTUP).ref(),
    ]
    const inputBuffer = Buffer.concat(inputEvents)
    inputBuffer.type = ref.refType(INPUT)
    user32.SendInput(
      inputEvents.length,
      inputBuffer as ref.Pointer<any>,
      INPUT.size
    )
  }

  clickDetach(x: number, y: number) {
    const pt = (x << 16) | (y & 0xffff)
    let failure = 0
    failure += user32.SendMessageW(this.handle, WM_SETFOCUS, null, 0)
    failure += user32.SendMessageW(this.handle, WM_LBUTTONDOWN, MK_LBUTTON, pt)
    failure += user32.SendMessageW(this.handle, WM_LBUTTONUP, 0, pt)
    failure += user32.SendMessageW(this.handle, WM_MOUSEMOVE, 0, pt)
    if (failure) {
      console.error('Failed ' + failure)
      return
    }
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
