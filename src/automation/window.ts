import { User32 } from 'win32-api'
import { HANDLE } from 'win32-def'

const user32 = User32.load()

export class GenshinWindow {
  handle?: HANDLE

  // async grabWindow() {
  //   this.handle = await user32.FindWindowExW(
  //     0,
  //     0,
  //     Buffer.from('UnityWndClass', 'ucs2'),
  //     Buffer.from('Genshin Impact', 'ucs2'),
  //   )
  //   await user32.SetForegroundWindow(this.handle)
  // }

  grabWindow() {
    this.handle = user32.FindWindowExW(
      0,
      0,
      Buffer.from('UnityWndClass', 'ucs2'),
      Buffer.from('Genshin Impact', 'ucs2'),
    )
    user32.SetForegroundWindow(this.handle)
  }
}
