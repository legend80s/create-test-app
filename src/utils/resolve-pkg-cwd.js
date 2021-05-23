const { resolve, dirname } = require('path')

exports.resolvePkgCwd = () => {
  return dirname(resolve('package.json'))
}
