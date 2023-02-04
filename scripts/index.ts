import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs';

import { command } from './rarity'

yargs(hideBin(process.argv)).command(command).demandCommand().help().parse()
