const chalk = require('chalk')
const fs = require('fs')
const { join } = require('path');
const { LABEL } = require('../constants');
const { execCmd } = require('../lib/exec-cmd');
const { fileExists } = require('../lib/file-exists');
const { install } = require('../lib/install');
const { briefPath } = require('../lib/path');
const { resolvePkgCwd } = require('../lib/resolve-pkg-cwd');

const fsp = fs.promises;

const tsDevDependencies = [
  'jest',
  'ts-jest',
  '@types/jest',
];

const jsDevDependencies = [
  'jest',
  '@types/jest',
];

const packageCwd = resolvePkgCwd();
const jestConfigFilepath = join(packageCwd, 'jest.config.js');

const TYPE_MAPPING = {
  js: 'JavaScript',
  ts: 'TypeScript',
}

/**
 * @param {IOptions} options
 */
function isTS(options) {
  return options.type === 'ts';
}

/**
 *
 * @param {IOptions} options
 */
async function createTestSkeleton(options) {
  const { coverage, type } = options;

  console.log(LABEL, 'Project root:', chalk.green(packageCwd));

  const timeLabel = `${LABEL} create test skeleton for ${TYPE_MAPPING[type]} project costs`
  console.time(timeLabel)

  try {
    await install({
      packageCwd,
      devDependencies: isTS(options) ? tsDevDependencies : jsDevDependencies
    }, options);

    if (type === 'ts') {
      if (!fileExists(jestConfigFilepath)) {
        execCmd({ cmd: 'npx ts-jest config:init', packageCwd }, options);
      } else {
        console.log(LABEL, 'jest.config.js already exists. Won\'t execute $ npx ts-jest config:init')
      }
    }

    if (coverage) {
      await insertCoverageConfig({ packageCwd }, options);
    }
  } catch (error) {
    console.error(chalk.red(error));
    console.error(error);

    return;
  } finally {
    console.timeEnd(timeLabel)
  }

  console.log(LABEL, 'Run test:')
  console.log(chalk.green('  npm test'));
  console.log();
  console.log(LABEL, 'How to write Jest UT: https://juejin.cn/post/6941761746952519711/');
}

/**
 *
 * @param {IOptions} options
 */
exports.createTSTestSkeleton = async (options) => {
  return createTestSkeleton(options)
}

/**
 * @param {IOptions} options
 */
exports.createJSTestSkeleton = (options) => {
  return createTestSkeleton(options)
}

/**
 * @param {any} params
 * @param {IOptions} options
 */
async function insertCoverageConfig({ packageCwd }, options) {
  const { type, coverage } = options;
  const pkgFilepath = join(packageCwd, 'package.json');
  const gitignoreFilepath = join(packageCwd, '.gitignore');

  const rate = resolveCoverageRate(coverage);

  const config = {
    preset: type === 'ts' ? 'ts-jest' : '',
    testEnvironment: 'node',

    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    coverageThreshold: `{
    global: {
      branches: ${rate},
      functions: ${rate},
      lines: ${rate},
      statements: ${rate}
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
    console.log(LABEL, 'jest.config.js not exists. Written with:');
    console.log(content);

    await fsp.writeFile(jestConfigFilepath, content);
  } else {
    await updateConfig(jestConfigFilepath, config, options);
  }

  const pkg = JSON.parse((await fsp.readFile(pkgFilepath)).toString());

  pkg.scripts.test = 'jest --coverage';

  await fsp.writeFile(pkgFilepath, JSON.stringify(pkg, null, 2));

  let gitignore = '';

  if (fileExists(gitignoreFilepath)) {
    gitignore = (await fsp.readFile(gitignoreFilepath)).toString();
  }

  if (!gitignore.includes('coverage')) {
    await fsp.appendFile(gitignoreFilepath, 'coverage/');

    console.log(LABEL, 'Add coverage/ to', briefPath(gitignoreFilepath));
  }
}

function resolveCoverageRate(coverage) {
  return typeof coverage === 'number' ? coverage : 100;
}

/**
 *
 * @param {*} jestConfigFilepath
 * @param {*} config
 * @param {IOptions} options
 * @returns
 */
async function updateConfig(jestConfigFilepath, config, { verbose, coverage }) {
  const content = (await fsp.readFile(jestConfigFilepath)).toString();
  let newContent = content;

  const configObj = require(jestConfigFilepath);

  Object.keys(config).forEach(key => {
    const val = config[key];

    // undefined 说明没有设置，则需要新增
    if (typeof configObj[key] === 'undefined') {
      newContent = newContent.replace('module.exports = {', `module.exports = {
  ${key}: ${val.includes('{') ? val: "'" + val + "'"},`);
    } else if (key === 'coverageThreshold' && coverage !== false) {
      // coverageThreshold 即使设置了，如果有自定义覆盖率则必须重新覆盖掉
      newContent = newContent.replace(/: \d+/g, `: ${(resolveCoverageRate(coverage))}`);
    }
  });

  if (newContent === content) {
    console.log(LABEL, 'jest.config.js exists and has all the coverage config. Stop overwriting.');

    return;
  }

  console.log(LABEL, 'jest.config.js exists. Overwrite with:');

  // console.log(newContent.length, newContent);

  if (verbose || newContent.length <= 500) console.log(newContent);

  await fsp.writeFile(jestConfigFilepath, newContent);
}
