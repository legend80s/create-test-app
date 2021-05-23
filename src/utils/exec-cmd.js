const chalk = require('chalk')
const { execSync } = require('child_process');

/**
 *
 * @param {string} cmd
 * @param {IOptions} options
 */
exports.execCmd = ({ cmd, packageCwd }, options = {}) => {
  const { dryRun } = options;

  console.time('[create-test-app] ' + cmd);

  console.log('execute command:');
  console.log(chalk.green('  ', cmd));
  console.log();

  try {
    !dryRun && execSync(cmd, { stdio: 'inherit', cwd: packageCwd });
    // execSync(cmd, { stdio: 'inherit', cwd: packageCwd });
    console.log(chalk.green(`[create-test-app] execute \`${cmd}\` ✅`));
  } catch (error) {
    console.log(chalk.red(`[create-test-app] executed \`${cmd}\` ❌`));
    console.error(error);

    throw error;
  } finally {
    console.timeEnd('[create-test-app] ' + cmd);

    console.log();
  }
}

