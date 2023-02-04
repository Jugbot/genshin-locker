import {
  ArgumentsCamelCase,
  InferredOptionTypes,
  Options,
  CommandModule,
} from 'yargs'

type OptionsDict = { [key: string]: Options }

/**
 * The original CommandModule type did not make the `command` field consistent with `handler` so here is a new type.
 */
type MyCommandModule<O extends OptionsDict> = {
  /** array of strings (or a single string) representing aliases of `exports.command`, positional args defined in an alias are ignored */
  aliases?: ReadonlyArray<string> | string | undefined
  /** object declaring the options the command accepts, or a function accepting and returning a yargs instance */
  builder?: O & OptionsDict
  /** string (or array of strings) that executes this command when given on the command line, first string may contain positional args */
  command?: ReadonlyArray<string> | string | undefined
  /** boolean (or string) to show deprecation notice */
  deprecated?: boolean | string | undefined
  /** string used as the description for the command in help text, use `false` for a hidden command */
  describe?: string | false | undefined
  /** a function which will be passed the parsed argv. */
  handler: (
    args: ArgumentsCamelCase<InferredOptionTypes<O>>
  ) => void | Promise<void>
}

export const asCommand = <T extends OptionsDict>(
  module: MyCommandModule<T>
): CommandModule<
  {
    /*_*/
  },
  InferredOptionTypes<T>
> => module
