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

export enum VK {
  LBUTTON = 0x01, // Left mouse button
  RBUTTON = 0x02, // Right mouse button
  CANCEL = 0x03, // Control-break processing
  MBUTTON = 0x04, // Middle mouse button (three-button mouse)
  XBUTTON1 = 0x05, // X1 mouse button
  XBUTTON2 = 0x06, // X2 mouse button
  // -	0x07	Undefined
  BACK = 0x08, // BACKSPACE key
  TAB = 0x09, // TAB key
  // -	0x0A-0B	Reserved
  CLEAR = 0x0c, // CLEAR key
  RETURN = 0x0d, // ENTER key
  // -	0x0E-0F	Undefined
  SHIFT = 0x10, // SHIFT key
  CONTROL = 0x11, // CTRL key
  MENU = 0x12, // ALT key
  PAUSE = 0x13, // PAUSE key
  CAPITAL = 0x14, // CAPS LOCK key
  KANA = 0x15, // IME Kana mode
  HANGUEL = 0x15, // IME Hanguel mode (maintained for compatibility; use HANGUL)
  HANGUL = 0x15, // IME Hangul mode
  IME_ON = 0x16, // IME On
  JUNJA = 0x17, // IME Junja mode
  FINAL = 0x18, // IME final mode
  HANJA = 0x19, // IME Hanja mode
  KANJI = 0x19, // IME Kanji mode
  IME_OFF = 0x1a, // IME Off
  ESCAPE = 0x1b, // ESC key
  CONVERT = 0x1c, // IME convert
  NONCONVERT = 0x1d, // IME nonconvert
  ACCEPT = 0x1e, // IME accept
  MODECHANGE = 0x1f, // IME mode change request
  SPACE = 0x20, // SPACEBAR
  PRIOR = 0x21, // PAGE UP key
  NEXT = 0x22, // PAGE DOWN key
  END = 0x23, // END key
  HOME = 0x24, // HOME key
  LEFT = 0x25, // LEFT ARROW key
  UP = 0x26, // UP ARROW key
  RIGHT = 0x27, // RIGHT ARROW key
  DOWN = 0x28, // DOWN ARROW key
  SELECT = 0x29, // SELECT key
  PRINT = 0x2a, // PRINT key
  EXECUTE = 0x2b, // EXECUTE key
  SNAPSHOT = 0x2c, // PRINT SCREEN key
  INSERT = 0x2d, // INS key
  DELETE = 0x2e, // DEL key
  HELP = 0x2f, // HELP key
  N0 = 0x30, // 0 key
  N1 = 0x31, // 1 key
  N2 = 0x32, // 2 key
  N3 = 0x33, // 3 key
  N4 = 0x34, // 4 key
  N5 = 0x35, // 5 key
  N6 = 0x36, // 6 key
  N7 = 0x37, // 7 key
  N8 = 0x38, // 8 key
  N9 = 0x39, // 9 key
  // -	0x3A-40	Undefined
  A = 0x41, // A key
  B = 0x42, // B key
  C = 0x43, // C key
  D = 0x44, // D key
  E = 0x45, // E key
  F = 0x46, // F key
  G = 0x47, // G key
  H = 0x48, // H key
  I = 0x49, // I key
  J = 0x4a, // J key
  K = 0x4b, // K key
  L = 0x4c, // L key
  M = 0x4d, // M key
  N = 0x4e, // N key
  O = 0x4f, // O key
  P = 0x50, // P key
  Q = 0x51, // Q key
  R = 0x52, // R key
  S = 0x53, // S key
  T = 0x54, // T key
  U = 0x55, // U key
  V = 0x56, // V key
  W = 0x57, // W key
  X = 0x58, // X key
  Y = 0x59, // Y key
  Z = 0x5a, // Z key
  LWIN = 0x5b, // Left Windows key (Natural keyboard)
  RWIN = 0x5c, // Right Windows key (Natural keyboard)
  APPS = 0x5d, // Applications key (Natural keyboard)
  // -	0x5E	Reserved
  SLEEP = 0x5f, // Computer Sleep key
  NUMPAD0 = 0x60, // Numeric keypad 0 key
  NUMPAD1 = 0x61, // Numeric keypad 1 key
  NUMPAD2 = 0x62, // Numeric keypad 2 key
  NUMPAD3 = 0x63, // Numeric keypad 3 key
  NUMPAD4 = 0x64, // Numeric keypad 4 key
  NUMPAD5 = 0x65, // Numeric keypad 5 key
  NUMPAD6 = 0x66, // Numeric keypad 6 key
  NUMPAD7 = 0x67, // Numeric keypad 7 key
  NUMPAD8 = 0x68, // Numeric keypad 8 key
  NUMPAD9 = 0x69, // Numeric keypad 9 key
  MULTIPLY = 0x6a, // Multiply key
  ADD = 0x6b, // Add key
  SEPARATOR = 0x6c, // Separator key
  SUBTRACT = 0x6d, // Subtract key
  DECIMAL = 0x6e, // Decimal key
  DIVIDE = 0x6f, // Divide key
  F1 = 0x70, // F1 key
  F2 = 0x71, // F2 key
  F3 = 0x72, // F3 key
  F4 = 0x73, // F4 key
  F5 = 0x74, // F5 key
  F6 = 0x75, // F6 key
  F7 = 0x76, // F7 key
  F8 = 0x77, // F8 key
  F9 = 0x78, // F9 key
  F10 = 0x79, // F10 key
  F11 = 0x7a, // F11 key
  F12 = 0x7b, // F12 key
  F13 = 0x7c, // F13 key
  F14 = 0x7d, // F14 key
  F15 = 0x7e, // F15 key
  F16 = 0x7f, // F16 key
  F17 = 0x80, // F17 key
  F18 = 0x81, // F18 key
  F19 = 0x82, // F19 key
  F20 = 0x83, // F20 key
  F21 = 0x84, // F21 key
  F22 = 0x85, // F22 key
  F23 = 0x86, // F23 key
  F24 = 0x87, // F24 key
  // -	0x88-8F	Unassigned
  NUMLOCK = 0x90, // NUM LOCK key
  SCROLL = 0x91, // SCROLL LOCK key
  // 0x92-96	OEM specific
  // -	0x97-9F	Unassigned
  LSHIFT = 0xa0, // Left SHIFT key
  RSHIFT = 0xa1, // Right SHIFT key
  LCONTROL = 0xa2, // Left CONTROL key
  RCONTROL = 0xa3, // Right CONTROL key
  LMENU = 0xa4, // Left ALT key
  RMENU = 0xa5, // Right ALT key
  BROWSER_BACK = 0xa6, // Browser Back key
  BROWSER_FORWARD = 0xa7, // Browser Forward key
  BROWSER_REFRESH = 0xa8, // Browser Refresh key
  BROWSER_STOP = 0xa9, // Browser Stop key
  BROWSER_SEARCH = 0xaa, // Browser Search key
  BROWSER_FAVORITES = 0xab, // Browser Favorites key
  BROWSER_HOME = 0xac, // Browser Start and Home key
  VOLUME_MUTE = 0xad, // Volume Mute key
  VOLUME_DOWN = 0xae, // Volume Down key
  VOLUME_UP = 0xaf, // Volume Up key
  MEDIA_NEXT_TRACK = 0xb0, // Next Track key
  MEDIA_PREV_TRACK = 0xb1, // Previous Track key
  MEDIA_STOP = 0xb2, // Stop Media key
  MEDIA_PLAY_PAUSE = 0xb3, // Play/Pause Media key
  LAUNCH_MAIL = 0xb4, // Start Mail key
  LAUNCH_MEDIA_SELECT = 0xb5, // Select Media key
  LAUNCH_APP1 = 0xb6, // Start Application 1 key
  LAUNCH_APP2 = 0xb7, // Start Application 2 key
  // -	0xB8-B9	Reserved
  OEM_1 = 0xba, // Used for miscellaneous characters; it can vary by keyboard. For the US standard keyboard, the ';:' key
  OEM_PLUS = 0xbb, // For any country/region, the '+' key
  OEM_COMMA = 0xbc, // For any country/region, the ',' key
  OEM_MINUS = 0xbd, // For any country/region, the '-' key
  OEM_PERIOD = 0xbe, // For any country/region, the '.' key
  OEM_2 = 0xbf, // Used for miscellaneous characters; it can vary by keyboard. For the US standard keyboard, the '/?' key
  OEM_3 = 0xc0, // Used for miscellaneous characters; it can vary by keyboard. For the US standard keyboard, the '`~' key
  // -	0xC1-D7	Reserved
  // -	0xD8-DA	Unassigned
  OEM_4 = 0xdb, // Used for miscellaneous characters; it can vary by keyboard. For the US standard keyboard, the '[{' key
  OEM_5 = 0xdc, // Used for miscellaneous characters; it can vary by keyboard. For the US standard keyboard, the '\|' key
  OEM_6 = 0xdd, // Used for miscellaneous characters; it can vary by keyboard. For the US standard keyboard, the ']}' key
  OEM_7 = 0xde, // Used for miscellaneous characters; it can vary by keyboard. For the US standard keyboard, the 'single-quote/double-quote' key
  OEM_8 = 0xdf, // Used for miscellaneous characters; it can vary by keyboard.
  // -	0xE0	Reserved
  // 0xE1	OEM specific
  OEM_102 = 0xe2, // The <> keys on the US standard keyboard, or the \\| key on the non-US 102-key keyboard
  // 0xE3-E4	OEM specific
  PROCESSKEY = 0xe5, // IME PROCESS key
  // 0xE6	OEM specific
  PACKET = 0xe7, // Used to pass Unicode characters as if they were keystrokes. The PACKET key is the low word of a 32-bit Virtual Key value used for non-keyboard input methods. For more information, see Remark in KEYBDINPUT, SendInput, WM_KEYDOWN, and WM_KEYUP
  // -	0xE8	Unassigned
  // 0xE9-F5	OEM specific
  ATTN = 0xf6, // Attn key
  CRSEL = 0xf7, // CrSel key
  EXSEL = 0xf8, // ExSel key
  EREOF = 0xf9, // Erase EOF key
  PLAY = 0xfa, // Play key
  ZOOM = 0xfb, // Zoom key
  NONAME = 0xfc, // Reserved
  PA1 = 0xfd, // PA1 key
  OEM_CLEAR = 0xfe, // Clear key
}

export enum GAMEPAD_BTN {
  A = 1,
  B = 2,
  X = 3,
  Y = 4,
  LB = 5,
  RB = 6,
  Back = 7,
  Start = 8,
  LS = 9,
  RS = 10,
  // DPadUp = 11,
  // DPadDown = 12,
  // DPadLeft = 13,
  // DPadRight = 14,
}
