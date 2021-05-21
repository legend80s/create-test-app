const chalk = require('chalk');
const { CLI } = require('cli-aid');
const { createTSTestSkeleton, createJSTestSkeleton } = require('./cli/skeleton');
const pkg = require('../package.json');

/**
 * @type {IOptions}
 */
const options = new CLI()
  .package(pkg)
  .option('verbose', {
    default: false,
  })
  .option('dry-run', 'dr', {
    default: false,
  })
  .option('type', 't', {
    default: 'js',
    help: 'Project type. Default `JS`.',
  })
  .option('coverage', 'c', {
    default: true,
    help: 'Should collect coverage. Default true',
  })

  .parse(process.argv.slice(2));

const { type, verbose } = options;

verbose && console.log('options:', options);

// console.log('options:', options);
// process.exit(0)

if (type === 'ts') {
  console.log(chalk.cyan('[create-test-app] Arming TypeScript project with Jest.'))

  createTSTestSkeleton(options);
} else if (type === 'js') {
  console.log(chalk.cyan('[create-test-app] Arming JavaScript project with Jest.'))

  createJSTestSkeleton(options);
} else {
  console.error(chalk.red('[create-test-app] Invalid type, should be one of [ts, js].'))
}
