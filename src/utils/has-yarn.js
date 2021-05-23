const fs = require('fs');
const path = require('path');
const hasYarnNpm = require('has-yarn');
const { briefPath } = require('./path');
const chalk = require('chalk');

let has;

/**
 *
 * @param {string} packageCwd
 * @returns {boolean}
 */
exports.hasYarn = (packageCwd, { verbose = false } = {}) => {
  // console.log('packageCwd:', packageCwd);

  if (typeof has !== 'undefined') {
    return has;
  }

  if (hasYarnNpm(packageCwd)) {
    return has = true;
  }

  /** @type {string} */
  let pkgContent = '';
  const fp = path.join(packageCwd, 'package.json');

  try {
    pkgContent = fs.readFileSync(fp).toString()
  } catch (error) {
    console.error(chalk.yellow('readFileSync', briefPath(fp), 'failed:', error));

    verbose && console.error(error);

    return has = false;
  }

  return has = /\byarn\b/.test(pkgContent);
};
