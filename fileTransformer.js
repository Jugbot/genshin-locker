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
