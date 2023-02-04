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
interface MyCommandModule<O extends OptionsDict> extends CommandModule<unknown, InferredOptionTypes<O>> {
  builder?: O & OptionsDict
  handler: (
    args: ArgumentsCamelCase<InferredOptionTypes<O>>
  ) => void | Promise<void>
}

export const asCommand = <T extends OptionsDict>(
  module: MyCommandModule<T>
): CommandModule<
  unknown,
  InferredOptionTypes<T>
> => module
