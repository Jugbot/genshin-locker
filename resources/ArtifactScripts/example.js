// @ts-check
/**
 * @typedef {Object} Artifact
 * @property {string} name - The name of the artifact.
 * @property {number} mainStatValue - The value of the artifact's main stat.
 * @property {SetKey} setKey - The set to which the artifact belongs.
 * @property {SlotKey} slotKey - The slot in which the artifact is equipped.
 * @property {number} rarity - The rarity level of the artifact.
 * @property {MainStatKey} mainStatKey - The key of the main stat of the artifact.
 * @property {number} level - The level of the artifact.
 * @property {SubStat[]} substats - An array of substats of the artifact.
 * @property {number} location - The location identifier of the artifact.
 * @property {boolean} lock - Whether the artifact is locked or not.
 * @property {string} id - The unique identifier of the artifact.
 */

/**
 * @typedef {Object} SubStat
 * @property {SubStatKey} key - The key of the substat.
 * @property {number} value - The value of the substat.
 */

/**
 * @typedef {string} SetKey - Enum for artifact set keys.
 * Specific values can be found here: https://github.com/Jugbot/genshin-locker/blob/main/packages/types/src/artifact.ts
 */

/**
 * @typedef {'flower' | 'plume' | 'sands' | 'circlet' | 'goblet'} SlotKey - Enum for artifact slot keys.
 */

/**
 * @typedef {'hp' | 'hp_' | 'atk' | 'atk_' | 'def_' | 'eleMas' | 'enerRech_' | 'critRate_' | 'critDMG_' | 'physical_dmg_' | 'anemo_dmg_' | 'geo_dmg_' | 'electro_dmg_' | 'hydro_dmg_' | 'pyro_dmg_' | 'cryo_dmg_' | 'dendro_dmg_' | 'heal_'} MainStatKey - Enum for artifact main stat keys.
 */

/**
 * @typedef {'hp' | 'hp_' | 'atk' | 'atk_' | 'def' | 'def_' | 'eleMas' | 'enerRech_' | 'critRate_' | 'critDMG_'} SubStatKey - Enum for artifact substat keys.
 */

/**
 * @typedef {Record<SlotKey, Partial<Record<MainStatKey, number>>>} MainStatDistribution
 */

/**
 * Locks an artifact based on various conditions.
 * @param {Artifact} artifact - The artifact to evaluate for locking.
 * @param {{mainStatDistribution: MainStatDistribution}} utilities - Various utilities regarding artifacts.
 * @returns {boolean} - True if the artifact should be locked, false otherwise.
 */
module.exports = (artifact, {mainStatDistribution}) => {
  // Lock anything that already has invested XP
  if (artifact.level > 0) {
    return true
  }
  // Lock all artifacts with full substats
  if (artifact.substats.length === 4) {
    return true
  }
  // Lock rare main stats
  if (
    (mainStatDistribution[artifact.slotKey][artifact.mainStatKey] ?? 0) < 15
  ) {
    return true
  }
  // Desireable substats have synergy
  /**
   * Counts the number of substats that match any of the given keys.
   * @param {SubStatKey[]} keys - The substat keys to count.
   * @returns {number} The count of matching substats.
   */
  const countAllOf = (keys) =>
    artifact.substats.filter(({ key }) => keys.includes(key)).length
  /**
   * Checks if at least one of the given substat keys is present.
   * @param {SubStatKey[]} keys - The substat keys to check.
   * @returns {number} 1 if at least one key is present, otherwise 0.
   */
  const countOneOf = (keys) => (countAllOf(keys) === 0 ? 0 : 1)
  /** @type {SubStatKey[]} */
  const critScalers = ['critDMG_', 'critRate_', 'enerRech_']
  /** @type {SubStatKey[]} */
  const emScalars = ['eleMas', 'enerRech_']
  /** @type {SubStatKey[]} */
  const basicStatScalers = ['hp_', 'atk_', 'def_']
  const critScalerScore =
    countAllOf(critScalers) +
    (countOneOf(basicStatScalers) + countOneOf(['eleMas'])) / 2
  if (critScalerScore >= 2) {
    return true
  }
  const emScalerScore = countAllOf(emScalars) + countOneOf(basicStatScalers) / 2
  if (
    (artifact.slotKey === 'flower' || artifact.slotKey === 'plume') &&
    emScalerScore >= 2
  ) {
    return true
  }
  if (artifact.mainStatKey === 'eleMas' && emScalerScore > 1) {
    return true
  }
  return false
}
