import path from 'path'

import koffi from 'koffi'

import { RESOURCES_DIR } from '../scoring/const'

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

export const BITMAP = koffi.struct('BITMAP', {
  bmType: 'long',
  bmWidth: 'long',
  bmHeight: 'long',
  bmWidthBytes: 'long',
  bmPlanes: 'int16',
  bmBitsPixel: 'int16',
  bmBits: 'void*',
})

export const BITMAPINFOHEADER = koffi.pack('BITMAPINFOHEADER', {
  biSize: 'uint32',
  biWidth: 'long',
  biHeight: 'long',
  biPlanes: 'int16',
  biBitCount: 'int16',
  biCompression: 'uint32',
  biSizeImage: 'uint32',
  biXPelsPerMeter: 'long',
  biYPelsPerMeter: 'long',
  biClrUsed: 'uint32',
  biClrImportant: 'uint32',
})

export const BITMAPFILEHEADER = koffi.pack('BITMAPFILEHEADER', {
  bfType: 'int16',
  bfSize: 'uint32',
  bfReserved1: 'int16',
  bfReserved2: 'int16',
  bfOffBits: 'uint32',
})

export const RECT = koffi.struct('RECT', {
  left: 'long',
  top: 'long',
  right: 'long',
  bottom: 'long',
})

export const MOUSEINPUT = koffi.struct('MOUSEINPUT', {
  dx: 'long',
  dy: 'long',
  mouseData: 'uint32',
  dwFlags: 'uint32',
  time: 'uint32',
  dwExtraInfo: koffi.pointer('ulong'),
})

export const KEYBDINPUT = koffi.struct('KEYBDINPUT', {
  wVk: 'int16',
  wScan: 'int16',
  dwFlags: 'uint32',
  time: 'uint32',
  dwExtraInfo: koffi.pointer('ulong'),
})

export const HARDWAREINPUT = koffi.struct('HARDWAREINPUT', {
  uMsg: 'uint32',
  wParamL: 'int16',
  wParamH: 'int16',
})

export const INPUT_UNION = koffi.struct('INPUT_UNION', {
  mi: MOUSEINPUT,
  // ki: KEYBDINPUT,
  // hi: HARDWAREINPUT,
})

export const INPUT = koffi.struct('INPUT', {
  type: 'uint32',
  dummyUnionName: INPUT_UNION,
})

export const POINT = koffi.struct('POINT', {
  x: 'long',
  y: 'long',
})

export const InputArray = koffi.pointer(INPUT)

export const StringBuffer = koffi.pointer('char16_t')

// C:\Program Files (x86)\Windows Kits\10\Include\10.0.22000.0\um\WinUser.h
const user32lib = koffi.load('user32')
export const user32 = {
  FindWindowW: user32lib.stdcall('FindWindowW', W.HWND, [
    StringBuffer,
    StringBuffer,
  ]),
  SetForegroundWindow: user32lib.stdcall('SetForegroundWindow', W.BOOL, [
    W.HWND,
  ]),
  BringWindowToTop: user32lib.stdcall('BringWindowToTop', W.BOOL, [W.HWND]),
  GetDC: user32lib.stdcall('GetDC', W.HDC, [W.HWND]),
  ReleaseDC: user32lib.stdcall('ReleaseDC', W.INT, [W.HWND, W.HDC]),
  PrintWindow: user32lib.stdcall('PrintWindow', W.BOOL, [
    W.HWND,
    W.HBITMAP,
    W.UINT,
  ]),
  GetClientRect: user32lib.stdcall('GetClientRect', W.BOOL, [
    W.HWND,
    koffi.out(koffi.pointer(RECT)),
  ]),
  SendMessageW: user32lib.stdcall('SendMessageW', W.LONG_PTR, [
    W.HWND,
    W.UINT,
    W.UINT_PTR,
    W.LONG_PTR,
  ]),
  PostMessageW: user32lib.stdcall('PostMessageW', W.LONG_PTR, [
    W.HWND,
    W.UINT,
    W.UINT_PTR,
    W.LONG_PTR,
  ]),
  SendInput: user32lib.stdcall('SendInput', W.UINT, [
    W.UINT,
    InputArray,
    W.UINT,
  ]),
  ShowWindow: user32lib.stdcall('ShowWindow', W.BOOL, [W.HWND, W.INT]),
  ClientToScreen: user32lib.stdcall('ClientToScreen', W.BOOL, [
    W.HWND,
    koffi.out(koffi.pointer(POINT)),
  ]),
  SetCursorPos: user32lib.stdcall('SetCursorPos', W.BOOL, [W.INT, W.INT]),
  GetAsyncKeyState: user32lib.stdcall('GetAsyncKeyState', W.SHORT, [W.INT]),
}

export const ImageBuffer = koffi.pointer(koffi.pointer('uint8'))

// C:\Program Files (x86)\Windows Kits\10\Include\10.0.22000.0\um\wingdi.h
const gdi32lib = koffi.load('gdi32')
export const gdi32 = {
  CreateCompatibleBitmap: gdi32lib.stdcall(
    'CreateCompatibleBitmap',
    W.HBITMAP,
    [W.HDC, W.INT, W.INT]
  ),
  CreateCompatibleDC: gdi32lib.stdcall('CreateCompatibleDC', W.HDC, [W.HDC]),
  DeleteDC: gdi32lib.stdcall('DeleteDC', W.BOOL, [W.HDC]),
  DeleteObject: gdi32lib.stdcall('DeleteObject', W.BOOL, [W.HGDIOBJ]),
  SelectObject: gdi32lib.stdcall('SelectObject', W.HBITMAP, [W.HDC, W.HBITMAP]),
  GetDeviceCaps: gdi32lib.stdcall('GetDeviceCaps', W.INT, [W.HDC, W.INT]),
  GetObjectW: gdi32lib.stdcall('GetObjectW', W.INT, [
    W.HBITMAP,
    W.INT,
    koffi.out(koffi.pointer(BITMAP)),
  ]),
  GetDIBits: gdi32lib.stdcall('GetDIBits', W.INT, [
    W.HDC,
    W.HBITMAP,
    W.UINT,
    W.UINT,
    koffi.out(W.LPVOID),
    koffi.inout(koffi.pointer(BITMAPINFOHEADER)),
    W.UINT,
  ]),
  BitBlt: gdi32lib.stdcall('BitBlt', W.BOOL, [
    W.HDC,
    W.INT,
    W.INT,
    W.INT,
    W.INT,
    W.HDC,
    W.INT,
    W.INT,
    W.DWORD,
  ]),
}

// https://github.com/nefarius/ViGEmClient/blob/master/include/ViGEm/Common.h
export const XUSB_REPORT = koffi.struct('XUSB_REPORT', {
  wButtons: 'uint16',
  bLeftTrigger: 'uint8',
  bRightTrigger: 'uint8',
  sThumbLX: 'int16',
  sThumbLY: 'int16',
  sThumbRX: 'int16',
  sThumbRY: 'int16',
})

const PVIGEM_CLIENT = koffi.pointer('VIGEM_CLIENT', koffi.opaque())
const PVIGEM_TARGET = koffi.pointer('VIGEM_TARGET', koffi.opaque())
const VIGEM_ERROR = 'uint32'

// https://github.com/nefarius/ViGEmClient/blob/master/include/ViGEm/Client.h
function loadViGEmLib() {
  try {
    const lib = koffi.load(path.join(RESOURCES_DIR, 'lib', 'ViGEmClient.dll'))
    return {
      vigem_alloc: lib.func('vigem_alloc', PVIGEM_CLIENT, []),
      vigem_free: lib.func('vigem_free', 'void', [PVIGEM_CLIENT]),
      vigem_connect: lib.func('vigem_connect', VIGEM_ERROR, [PVIGEM_CLIENT]),
      vigem_disconnect: lib.func('vigem_disconnect', 'void', [PVIGEM_CLIENT]),
      vigem_target_x360_alloc: lib.func(
        'vigem_target_x360_alloc',
        PVIGEM_TARGET,
        []
      ),
      vigem_target_free: lib.func('vigem_target_free', 'void', [PVIGEM_TARGET]),
      vigem_target_add: lib.func('vigem_target_add', VIGEM_ERROR, [
        PVIGEM_CLIENT,
        PVIGEM_TARGET,
      ]),
      vigem_target_remove: lib.func('vigem_target_remove', VIGEM_ERROR, [
        PVIGEM_CLIENT,
        PVIGEM_TARGET,
      ]),
      vigem_target_x360_update: lib.func(
        'vigem_target_x360_update',
        VIGEM_ERROR,
        [PVIGEM_CLIENT, PVIGEM_TARGET, XUSB_REPORT]
      ),
    }
  } catch (e) {
    console.warn('ViGEmClient is not available.')
  }
  return null
}
const vigem = loadViGEmLib()

export { vigem }
