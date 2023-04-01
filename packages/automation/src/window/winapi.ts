import path from 'path'

import ffi from 'ffi-napi'
import refarray from 'ref-array-di'
import ref from 'ref-napi'
import refstruct from 'ref-struct-di'
import refunion from 'ref-union-di'


const RefStruct = refstruct(ref)
const RefUnion = refunion(ref)
const RefArray = refarray(ref)

const _WIN64 = process.arch === 'x64'

const HANDLE = _WIN64 ? 'uint64' : 'uint32'
const HWND = HANDLE
const LONG = 'long'
const WORD = 'int16'
const DWORD = 'uint32'
const LPVOID = 'void*'
const LPCTSTR = 'uint16*'
const BOOL = 'int'
const HDC = HANDLE
const INT = 'int'
const LONG_PTR = _WIN64 ? 'int64' : 'int32'
const HBITMAP = HANDLE
const UINT = 'uint'
const UINT_PTR = _WIN64 ? 'uint64' : 'uint32'
const HGDIOBJ = HANDLE
const SHORT = 'short'
const CHAR = 'char'
const UCHAR = 'uchar'

export const W = {
  HANDLE,
  HWND,
  LONG,
  WORD,
  DWORD,
  LPVOID,
  LPCTSTR,
  BOOL,
  HDC,
  INT,
  HBITMAP,
  LONG_PTR,
  UINT,
  UINT_PTR,
  HGDIOBJ,
  SHORT,
  CHAR,
  UCHAR,
} as const

export const BITMAP = RefStruct(
  {
    bmType: ref.types.long,
    bmWidth: ref.types.long,
    bmHeight: ref.types.long,
    bmWidthBytes: ref.types.long,
    bmPlanes: ref.types.int16,
    bmBitsPixel: ref.types.int16,
    bmBits: ref.refType(ref.types.void),
  },
  { packed: false }
)

export const BITMAPINFOHEADER = RefStruct(
  {
    biSize: ref.types.uint32,
    biWidth: ref.types.long,
    biHeight: ref.types.long,
    biPlanes: ref.types.int16,
    biBitCount: ref.types.int16,
    biCompression: ref.types.uint32,
    biSizeImage: ref.types.uint32,
    biXPelsPerMeter: ref.types.long,
    biYPelsPerMeter: ref.types.long,
    biClrUsed: ref.types.uint32,
    biClrImportant: ref.types.uint32,
  },
  { packed: true }
)

export const BITMAPFILEHEADER = RefStruct(
  {
    bfType: ref.types.int16,
    bfSize: ref.types.uint32,
    bfReserved1: ref.types.int16,
    bfReserved2: ref.types.int16,
    bfOffBits: ref.types.uint32,
  },
  { packed: true }
)

export const RECT = RefStruct({
  left: ref.types.long,
  top: ref.types.long,
  right: ref.types.long,
  bottom: ref.types.long,
})

export const MOUSEINPUT = RefStruct({
  dx: ref.types.long,
  dy: ref.types.long,
  mouseData: ref.types.uint32,
  dwFlags: ref.types.uint32,
  time: ref.types.uint32,
  dwExtraInfo: ref.refType(ref.types.ulong),
})

export const KEYBDINPUT = RefStruct({
  wVk: ref.types.int16,
  wScan: ref.types.int16,
  dwFlags: ref.types.uint32,
  time: ref.types.uint32,
  dwExtraInfo: ref.refType(ref.types.ulong),
})

export const HARDWAREINPUT = RefStruct({
  uMsg: ref.types.uint32,
  wParamL: ref.types.int16,
  wParamH: ref.types.int16,
})

export const INPUT_UNION = new RefUnion({
  mi: MOUSEINPUT,
  ki: KEYBDINPUT,
  hi: HARDWAREINPUT,
})

export const INPUT = RefStruct({
  type: ref.types.uint32,
  dummyUnionName: INPUT_UNION,
})

export const POINT = RefStruct({
  x: ref.types.long,
  y: ref.types.long,
})

export const InputArray = RefArray(INPUT)

export const StringBuffer = RefArray(ref.types.uint16)

export const user32 = ffi.Library('user32', {
  FindWindowW: [W.HWND, [StringBuffer, StringBuffer]],
  SetForegroundWindow: [W.BOOL, [W.HWND]],
  BringWindowToTop: [W.BOOL, [W.HWND]],
  GetDC: [W.HDC, [W.HWND]],
  ReleaseDC: [W.INT, [W.HWND, W.HDC]],
  PrintWindow: [W.BOOL, [W.HWND, W.HBITMAP, W.UINT]],
  GetClientRect: [W.BOOL, [W.HWND, ref.refType(RECT)]],
  SendMessageW: [W.LONG_PTR, [W.HWND, W.UINT, W.UINT_PTR, W.LONG_PTR]],
  PostMessageW: [W.LONG_PTR, [W.HWND, W.UINT, W.UINT_PTR, W.LONG_PTR]],
  SendInput: [W.UINT, [W.UINT, InputArray, W.UINT]],
  ShowWindow: [W.BOOL, [W.HWND, W.INT]],
  ClientToScreen: [W.BOOL, [W.HWND, ref.refType(POINT)]],
  SetCursorPos: [W.BOOL, [W.INT, W.INT]],
  GetAsyncKeyState: [W.SHORT, [W.INT]],
})

export const ImageBuffer = RefArray(ref.types.byte)

export const gdi32 = ffi.Library('gdi32', {
  CreateCompatibleBitmap: [W.HBITMAP, [W.HDC, W.INT, W.INT]],
  CreateCompatibleDC: [W.HDC, [W.HDC]],
  DeleteDC: [W.BOOL, [W.HDC]],
  DeleteObject: [W.BOOL, [W.HGDIOBJ]],
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

function loadVJoyLib() {
  try {
    return ffi.Library(path.join(__dirname, './lib/vJoyInterface.dll'), {
      GetvJoyVersion: [W.SHORT, []],
      vJoyEnabled: [W.BOOL, []],
      SetAxis: [W.BOOL, [W.LONG, W.UINT, W.UINT]],
      SetBtn: [W.BOOL, [W.BOOL, W.UINT, W.UCHAR]],
      SetDiscPov: [W.BOOL, [W.INT, W.UINT, W.UCHAR]],
      SetContPov: [W.BOOL, [W.DWORD, W.UINT, W.UCHAR]],
      AcquireVJD: [W.BOOL, [W.UINT]],
      RelinquishVJD: ['void', [W.UINT]],
      ResetVJD: [W.BOOL, [W.UINT]],
    })
  } catch (e) {
    console.warn('VJoy is not available.')
  }
  return null
}
const vjoy = loadVJoyLib()

export { vjoy }
