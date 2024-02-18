#!/usr/bin/env node
import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'

import * as updateElectronVendors from './update-electron-vendors.mjs'

yargs(hideBin(process.argv))
  .command(updateElectronVendors.command)
  .demandCommand()
  .help()
  .parse()
