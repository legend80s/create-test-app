const commandExistsSync = require('command-exists').sync;

/**
 *
 * @returns {'tnpm'|'npm'|'yarn'}
 */
exports.resolveInstallerName = () => {
  if (commandExistsSync('tnpm')) {
    return 'tnpm'
  }

  if (commandExistsSync('yarn') && hasYarn(packageCwd)) {
    return 'yarn'
  }

  return 'npm';
}
