import { spawn } from 'child_process'
import path from 'path'

import { RESOURCES_DIR } from '../scoring/const'

/**
 * Launches the bundled ViGEmBus setup wizard, for users who skipped the
 * driver during install. The app already runs elevated, so no UAC prompt.
 */
export function installGamepadDriver() {
  const setup = path.join(
    RESOURCES_DIR,
    'drivers',
    'ViGEmBus_1.22.0_x64_x86_arm64.exe'
  )
  spawn(setup, { detached: true, stdio: 'ignore' }).unref()
}
