import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'

import * as popularity from './popularity'
import * as rarity from './rarity'
// import * as vendors from './update-electron-vendors'

yargs(hideBin(process.argv))
  .command(rarity.command)
  .command(popularity.command)
  // .command(vendors.command)
  .demandCommand()
  .help()
  .parse()
