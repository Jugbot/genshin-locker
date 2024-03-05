/**
 * @typedef {import("yargs").Options} Options
 * @typedef {import("yargs").ArgumentsCamelCase} ArgumentsCamelCase
 * @typedef {{ [key: string]: Options; }} OptionsDict
 */

/**
 * @template {OptionsDict} O
 * @typedef {import("yargs").CommandModule<unknown, import("yargs").InferredOptionTypes<O>>} CommandModule
 */

/**
 * @template {OptionsDict} O
 * @typedef {CommandModule<O> & {
 *   builder?: O & OptionsDict;
 *   handler: (args: import("yargs").ArgumentsCamelCase<import("yargs").InferredOptionTypes<O>>) => void | Promise<void>;
 * }} MyCommandModule
 */

/**
 * Due to a limitation with typescript, we need this function to infer the generic portion of MyCommandModule.
 * @template {OptionsDict} T
 * @param {MyCommandModule<T>} module
 * @returns {import("yargs").CommandModule<unknown, import("yargs").InferredOptionTypes<T>>}
 */
export const asCommand = (module) => module
