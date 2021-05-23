/**
 * @param {string} path
 * @returns {string}
 */
exports.briefPath = function briefPath(path) {
  return path.replace(/\/Users\/\w+\//, '~/')
}
