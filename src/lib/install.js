const { readFileSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

const { hasYarn } = require('./has-yarn.js');
const { briefPath } = require('./path.js');

exports.install = install;

/**
 *
 * @param {{ packageCwd: string; dependencies: string[]; devDependencies: string[]; }}
 * @param {{ forceInstall: boolean; }} options
 * @returns
 */
async function install({ packageCwd, dependencies = [], devDependencies = [] }, options) {
  const { forceInstall, dryRun } = options;

  // console.log('forceInstall:', forceInstall);

  const uninstalled = getUninstalled(packageCwd, dependencies.concat(devDependencies), options);

  if (!forceInstall && uninstalled.length === 0) {
    console.log(chalk.green('[paytm] 检测到依赖已安装，无需继续安装'));

    return;
  }

  const devCmd = genInstallCmd(devDependencies, 'dev', packageCwd);
  const prodCmd = genInstallCmd(dependencies, 'prod', packageCwd);
  const cmd = [devCmd, prodCmd].filter(Boolean).join(' && ');

  if (!cmd) {
    console.error(chalk.red('[paytm] 依赖入参不能同时为空，安装终止'));

    return;
  }

  console.log('[paytm] 正在目录', chalk.green(briefPath(packageCwd)), '下安装依赖 🚀 ');
  console.time('[paytm] 安装依赖');
  console.log(chalk.green('  ', cmd));
  console.log();

  try {
    !dryRun && execSync(cmd, { stdio: 'inherit', cwd: packageCwd });
    console.log('[paytm] 安装依赖成功 ✅');

    return true;
  } catch (error) {
    console.log('[paytm] 安装依赖失败 ❌');
    console.error(chalk.red(cmd, 'failed:'));
    console.error(error);

    return false;
  } finally {
    console.timeEnd('[paytm] 安装依赖');

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

    return dependencies.filter(dep => !content.includes(dep));
  } catch (error) {
    options.verbose && console.log('error:', error);

    return dependencies;
  }
}

/**
 *
 * @param {string[]} dependencies
 * @param {'dev' | 'prod'} scope
 * @returns {string}
 */
function genInstallCmd(dependencies, scope, packageCwd) {
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

  let installOptions = ['tnpm install', ...dependencies, npmMapping[scope]];

  if (hasYarn(packageCwd)) {
    installOptions = ['tnpm install', ...dependencies, yarnMapping[scope]];
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
