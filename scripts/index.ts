import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs';

import * as rarity from './rarity'
import * as popularity from './popularity'

yargs(hideBin(process.argv)).command(rarity.command).command(popularity.command).demandCommand().help().parse()
