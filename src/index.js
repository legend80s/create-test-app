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

if (type === 'ts') {
  createTSTestSkeleton(options);
} else if (type === 'js') {
  createJSTestSkeleton(options);
} else {
  console.error('[create-test-app] Invalid type, should be one of [ts, js].')
}
