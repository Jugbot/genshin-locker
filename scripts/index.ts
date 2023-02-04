import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'

import * as popularity from './popularity'
import * as rarity from './rarity'

yargs(hideBin(process.argv))
  .command(rarity.command)
  .command(popularity.command)
  .demandCommand()
  .help()
  .parse()
