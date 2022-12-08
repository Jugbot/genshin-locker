// https://www.magnumdb.com/
export const BI_RGB = 0
export const DIB_RGB_COLORS = 0
export const SRCCOPY = 13369376
export const WM_LBUTTONDOWN = 0x0201
export const WM_LBUTTONUP = 0x0202
export const WM_MOUSEMOVE = 0x0200
export const WM_MOUSEACTIVATE = 0x0021
export const WM_SETFOCUS = 0x0007
export const INPUT_MOUSE = 0
export const INPUT_KEYBOARD = 1
export const INPUT_HARDWARE = 2
export const MOUSEEVENTF_LEFTDOWN = 0x0002
export const MK_LBUTTON = 1
export const WHEEL_DELTA = 120
export const SW_RESTORE = 9

export enum MOUSEEVENTF {
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
