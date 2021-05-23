const commandExistsSync = require('command-exists').sync;

exports.resolveInstallerName = () => {
  const packageManagerName = commandExistsSync('tnpm') ?
    'tnpm' :
    (commandExistsSync('yarn') && hasYarn(packageCwd) ?
      'yarn' :
      'npm'
    )

  return packageManagerName;
}
