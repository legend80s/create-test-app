const chalk = require('chalk')
const fs = require('fs')
const { join, resolve } = require('fs')
const { execCmd } = require('../lib/exec-cmd');
const { fileExists } = require('../lib/file-exists');
const { install } = require('../lib/install')

const fsp = fs.promises;

const tsDevDependencies = [
  'jest',
  'ts-jest',
  '@types/jest',
];

/**
 *
 * @param {IOptions} options
 */
exports.createTSTestSkeleton = async (options) => {
  const { coverage } = options;

  const packageCwd = resolve('package.json');

  console.time('create test skeleton for TypeScript project costs')

  try {
    await install({ packageCwd, devDependencies: tsDevDependencies }, options);
    execCmd('npx ts-jest config:init');

    if (coverage) {
      await insertCoverageConfig({ packageCwd }, options);
    }

    console.log('[create-test-app] Run test:')
    console.log(chalk.green('  npm test'));
    console.log();
    console.log(chalk.green('单测书写规范见 https://juejin.cn/post/6941761746952519711/'));
  } catch (error) {
    console.error(chalk.red(error));
    console.error(error);
  } finally {
    console.timeEnd('[create-test-app] create test skeleton for TypeScript project costs')
  }
}

/**
 * @param {IOptions} options
 */
exports.createJSTestSkeleton = (options) => {

}

/**
 * @param {IOptions} options
 */
async function insertCoverageConfig({ packageCwd }, options) {
  const jestConfigFilepath = join(packageCwd, 'jest.config.js');
  const pkgFilepath = join(packageCwd, 'package.json');
  const gitignoreFilepath = join(packageCwd, '.gitignore');

  const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',

    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    coverageThreshold: `{
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }`,
  };

  if (!fileExists(jestConfigFilepath)) {
    const content = `module.exports = {
  preset: '${config.preset}',
  testEnvironment: '${config.testEnvironment}',

  coverageDirectory: '${config.coverageDirectory}',
  coverageProvider: '${config.coverageProvider}',
  coverageThreshold: ${config.coverageThreshold},
}
`
    await fsp.writeFile(jestConfigFilepath, content);
  } else {
    await updateConfig(jestConfigFilepath, config);
  }

  const pkg = JSON.parse((await fsp.readFile(pkgFilepath)).toString());

  pkg.test = 'jest --coverage';

  await fsp.writeFile(pkgFilepath, JSON.stringify(pkg));

  await fsp.appendFile(gitignoreFilepath, 'coverage/');
}

async function updateConfig(jestConfigFilepath, config) {
  const content = (await fsp.readFile(jestConfigFilepath)).toString();

  Object.keys(config).forEach(key => {
    const val = config[key];

    if (!content.includes(key)) {
      content = content.replace('module.exports = {', `module.exports = {
  ${key}: ${val.includes('{') ? val: "'" + val + "'"}`);
    }
  });

  console.log('Overwrite jest.config.js with content', content);

  await fsp.writeFile(jestConfigFilepath, content);
}