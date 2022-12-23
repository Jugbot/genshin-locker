/* eslint-disable @typescript-eslint/no-unused-vars */

module.exports = {
  process(sourceText) {
    return {
      code: `module.exports = \`${sourceText}\`;`,
    }
  },
  getCacheKey(sourceText) {
    return sourceText
  },
}
