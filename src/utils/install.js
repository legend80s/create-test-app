const { readFileSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

const { intersection } = require('./lite-lodash');

const { hasYarn } = require('./has-yarn.js');
const { briefPath } = require('./path.js');
const { LABEL } = require('../constants.js');
const { resolveInstallerName } = require('./resolve-installer.js');

/**
 *
 * @param {{ packageCwd: string; dependencies: string[]; devDependencies: string[]; }}
 * @param {IOptions} options
 * @returns
 */
exports.install = async function install({ packageCwd, dependencies = [], devDependencies = [] }, options) {
  const { forceInstall, dryRun, silent, verbose } = options;

  // console.log('forceInstall:', forceInstall);

  const uninstalled = getUninstalled(packageCwd, dependencies.concat(devDependencies), options);
  verbose && console.log('uninstalled:', uninstalled);
  // console.log('uninstalled:', uninstalled);

  if (!forceInstall && uninstalled.length === 0) {
    !silent && console.log(LABEL, chalk.green(`All the dependencies has been installed already. Stop installing`));

    return;
  }

  const pmName = resolveInstallerName();

  const devCmd = genInstallCmd({
    pmName,
    dependencies: intersection(devDependencies, uninstalled),
    scope: 'dev',
    packageCwd
  }, options);

  const prodCmd = genInstallCmd({
    pmName,
    dependencies: intersection(dependencies, uninstalled),
    scope: 'prod',
    packageCwd,
  }, options);

  const cmd = [devCmd, prodCmd].filter(Boolean).join(' && ');

  if (!cmd) {
    console.error(chalk.red(`${LABEL} 依赖入参不能同时为空，安装终止`));

    return;
  }

  !silent && console.log(`${LABEL} Installing to`, chalk.green(briefPath(packageCwd)), '🚀 ');
  console.time(`${LABEL} Install packages costs`);
  !silent && console.log(chalk.green('  ', cmd));
  !silent && console.log();

  try {
    !dryRun && execSync(cmd, { stdio: 'inherit', cwd: packageCwd });
    !silent && console.log(`${LABEL} Install success ✅`);

    return true;
  } catch (error) {
    console.error(`${LABEL} Install failed ❌`);
    console.error(chalk.red(cmd, 'failed:'));
    console.error(error);

    return false;
  } finally {
    console.timeEnd(`${LABEL} Install packages costs`);

    console.log();
  }
}

/**
 * @param {string} packageCwd
 * @param {string[]} dependencies
 * @returns {string[]} dependencies
 */
function getUninstalled(packageCwd, dependencies, options) {
  options.verbose && console.log('getUninstalled:', { packageCwd, dependencies, options });

  try {
    const content = readFileSync(join(packageCwd, 'package.json')).toString();

    return dependencies.filter(dep => !content.includes(`"${dep}"`));
  } catch (error) {
    options.verbose && console.log('error:', error);

    return dependencies;
  }
}

/**
 *
 * @param 'dev' | 'prod' options.scope
 * @returns {string}
 */
function genInstallCmd({ pmName, dependencies, scope, packageCwd }, options) {
  // console.log('dependencies:', dependencies);
  if (isEmpty(dependencies)) {
    return '';
  }

  const npmMapping = {
    dev: '--save-dev',
    prod: '--save',
  };

  const yarnMapping = {
    dev: '--dev',
    prod: '',
  };

  let installOptions = [pmName === 'yarn' ? 'yarn add' : `${pmName} install`, ...dependencies, npmMapping[scope]];

  if (hasYarn(packageCwd, options)) {
    installOptions = [pmName === 'yarn' ? 'yarn add' : `${pmName} install`, ...dependencies, yarnMapping[scope]];
  }

  return installOptions.join(' ');
}

/**
 *
 * @param {any[]} arr
 * @returns
 */
function isEmpty(arr) {
  return !arr || arr.length === 0;
}
