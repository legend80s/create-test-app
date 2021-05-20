const { execSync } = require('child_process');

/**
 *
 * @param {string} cmd
 * @param {IOptions} options
 * @returns {boolean}
 */
exports.execCmd = (cmd, options = {}) => {
  const { dryRun } = options;

  console.time('[create-test-app] ' + cmd);

  console.log(chalk.green('  ', cmd));
  console.log();

  try {
    !dryRun && execSync(cmd, { stdio: 'inherit', cwd: packageCwd });
    console.log('[create-test-app] executed ✅');

    return true;
  } catch (error) {
    console.log('[create-test-app] executed ❌');
    console.error(chalk.red(cmd, 'failed:'));
    console.error(error);

    return false;
  } finally {
    console.timeEnd('[create-test-app] ' + cmd);

    console.log();
  }
}

