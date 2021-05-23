const fs = require('fs');
const { join, isAbsolute } = require('path');

/**
 * @param {string} filepath
 * @returns {boolean}
 */
exports.fileExists = (filepath) => {
  // console.log('filepath:',filepath);
  return fs.existsSync(isAbsolute(filepath) ? filepath : join(__dirname, filepath));
}
