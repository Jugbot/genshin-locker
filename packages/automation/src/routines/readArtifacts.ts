import { Navigator } from '../navigator'
import { calculate, getLockerScript } from '../scoring/logic'

import { GamepadDriver } from './drivers/gamepad'
import { MouseDriver } from './drivers/mouse'
import { scanArtifacts } from './scan'
import { sleep } from './util'

export async function readArtifacts(
  lockWhileScanning: boolean,
  useGamepad: boolean,
  scriptName?: string
) {
  const scriptFunc = await getLockerScript(scriptName)
  // Grabs the Genshin window
  const navigator = new Navigator()
  await sleep(200)

  const driver = useGamepad
    ? new GamepadDriver(navigator)
    : new MouseDriver(navigator)

  return scanArtifacts(navigator, driver, {
    lockWhileScanning,
    decideLock: (artifact) => calculate(scriptFunc, artifact),
  })
}
