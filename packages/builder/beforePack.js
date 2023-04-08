/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')

module.exports = function () {
  if (!fs.existsSync('./build')) {
    fs.mkdirSync('./build')
  }
  fs.cpSync('../preload/dist', './build/preload', { recursive: true })
  fs.cpSync('../renderer/dist', './build/renderer', { recursive: true })
  fs.cpSync('../main/dist', './build/main', { recursive: true })
}
