const chalk = require('chalk')
const fs = require('fs');
const { join, resolve } = require('path');
const json5 = require('json5');

const { LABEL } = require('../constants');
const { execCmd } = require('../utils/exec-cmd');
const { fileExists } = require('../utils/file-exists');
const { patchJSON } = require('../utils/fs-extra-plus');
const { install } = require('../utils/install');
const { hasWord } = require('../utils/lite-lodash');
const { briefPath, paths2ModuleNameMapper } = require('../utils/path');
const { resolvePkgCwd } = require('../utils/resolve-pkg-cwd');
const { stringifyTransformers } = require('../utils/jest-utils');

const fsp = fs.promises;

const tsDevDependencies = [
  'jest',
  'ts-jest',
  '@types/jest',
];

const jsDevDependencies = [
  'jest',
  '@types/jest',
  'babel-jest',
  '@babel/preset-env',
];

const packageCwd = resolvePkgCwd();
const jestConfigFilepath = join(packageCwd, 'jest.config.js');
const babelConfigFilepath = join(__dirname, '../assets/babel.config.js');

const tsconfigFilepathRaw = join(packageCwd, 'tsconfig.json');
const jsconfigFilepathRaw = join(packageCwd, 'jsconfig.json');

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
  let tsconfig;
  const { coverage, type, silent } = options;
  const tsconfigFilepath = fileExists(tsconfigFilepathRaw) ?
    tsconfigFilepathRaw :
    jsconfigFilepathRaw
  ;

  !silent && console.log(LABEL, 'Project root:', chalk.green(briefPath(packageCwd)));

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
        !silent && console.log(LABEL, 'jest.config.js already exists. Won\'t execute $ npx ts-jest config:init')
      }

      if (fileExists(tsconfigFilepath)) {
        tsconfig = await updateTSConfig(tsconfigFilepath);
      }
    }

    if (coverage) {
      await insertCoverageConfig({ packageCwd, tsconfig }, options);
    } else {
      !silent && console.log(LABEL, chalk.yellow('Coverage flag not set, wont enable coverage.'))
    }

    await newBabelConfig(packageCwd);

    await newTest();
  } catch (error) {
    console.error(chalk.red(error));
    console.error(error);

    throw error;
  } finally {
    console.timeEnd(timeLabel)
  }

  console.log(LABEL, 'You can now run test by executing:')
  console.log(chalk.green('  npm test'));
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
async function insertCoverageConfig({ packageCwd, tsconfig }, options) {
  const { type, coverage, silent, transform } = options;
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
    },
  }`,
  transform: stringifyTransformers({ js: 'babel-jest', ...json5.parse(transform) }),
  };

  // console.log('config:', config);

  if (tsconfig) {
    const { compilerOptions: { paths } } = tsconfig;

    if (paths) {
      config.moduleNameMapper = JSON.stringify(
        paths2ModuleNameMapper(paths), null, 2
      )
        .replace(/^/gm, '  ');
    }
  }

  if (!fileExists(jestConfigFilepath)) {
    const content = `module.exports = {
  preset: '${config.preset}',
  testEnvironment: '${config.testEnvironment}',

  coverageDirectory: '${config.coverageDirectory}',
  coverageProvider: '${config.coverageProvider}',
  coverageThreshold: ${config.coverageThreshold},
  transform: ${config.transform},
` +
  (config.moduleNameMapper ? `\nmoduleNameMapper: ${config.moduleNameMapper},` : '')
  +
`}
`   ;
    !silent && console.log(LABEL, 'jest.config.js not exists. Written with:');
    !silent && console.log(content);

    await fsp.writeFile(jestConfigFilepath, content);
  } else {
    await updateConfig(jestConfigFilepath, config, options);
  }

  const pkg = JSON.parse((await fsp.readFile(pkgFilepath)).toString());

  prependToScript(pkg, 'test', 'jest --coverage', { force: true });
  prependToScript(pkg, 'build', 'npm test');

  await fsp.writeFile(pkgFilepath, JSON.stringify(pkg, null, 2));

  let gitignore = '';

  if (fileExists(gitignoreFilepath)) {
    gitignore = (await fsp.readFile(gitignoreFilepath)).toString();
  }

  if (!hasWord(gitignore, 'coverage')) {
    await fsp.appendFile(gitignoreFilepath, 'coverage/');

    !silent && console.log(LABEL, 'Add coverage/ to', briefPath(gitignoreFilepath));
  }
}

function resolveCoverageRate(coverage) {
  return typeof coverage === 'number' ? coverage : 100;
}

/**
 * @param {*} jestConfigFilepath
 * @param {*} config
 * @param {IOptions} options
 * @returns
 */
async function updateConfig(jestConfigFilepath, config, { verbose, coverage, silent }) {
  const content = (await fsp.readFile(jestConfigFilepath)).toString();
  let newContent = content;

  const configObj = require(jestConfigFilepath);

  Object.keys(config).forEach(key => {
    const value = config[key];
    // console.log('key:', key, 'configObj[key]', configObj[key]);

    // undefined 说明没有设置，则需要新增
    if (typeof configObj[key] === 'undefined') {
      // console.log('key:', key, 'value:', value, `${value}`);
      newContent = newContent.replace('module.exports = {', `module.exports = {
  ${key}: ${value.includes('{') ? value: "'" + value + "'"},`);
    } else if (key === 'coverageThreshold' && coverage !== false) {
      // coverageThreshold 即使设置了，如果有自定义覆盖率则必须重新覆盖掉
      newContent = newContent.replace(/: \d+/g, `: ${(resolveCoverageRate(coverage))}`);
    }
  });

  if (newContent === content) {
    !silent && console.log(LABEL, 'jest.config.js exists and has all the coverage config. Stop overwriting.');

    return;
  }

  !silent && console.log(LABEL, 'jest.config.js exists. Overwrite with:');

  // console.log('newContent.length', newContent.length, newContent);

  if (verbose || newContent.length <= 500) !silent && console.log(newContent);

  await fsp.writeFile(jestConfigFilepath, newContent);
}

function prependToScript(pkg, scriptKey, scriptVal, { force = false } = {}) {
  if (!pkg.scripts) {
    pkg.scripts = {};
  }

  if (pkg.scripts[scriptKey]) {
    if (pkg.scripts[scriptKey].includes(scriptVal)) {
      // do nothing
    } else {
      pkg.scripts[scriptKey] = `${scriptVal} && ${pkg.scripts[scriptKey]}`;
    }
  } else {
    if (force) {
      pkg.scripts[scriptKey] = scriptVal;
    }
  }
}

const ut = `/** FIXME: YOU SHOULD MODIFY ME TO MAKE THE TEST PASS. */
describe('lite-lodash', () => {
  describe('isPromise', () => {
    it('Should Promise.resolve be a promise', () => {
      const input = Promise.resolve();
      const actual = isPromise(input);
      const expected = true;

      expect(actual).toEqual(expected);
    });

    it('Should number not a promise', () => {
      const input = 100;
      const actual = isPromise(input);
      const expected = false;

      expect(actual).toEqual(expected);
    });
  });
});
`

async function newTest() {
  const testPath = resolve('./test');

  if (fileExists(testPath)) {
    return;
  }

  await fsp.mkdir(testPath);
  await fsp.writeFile(join(testPath, 'index.test.js'), ut);
}

async function newBabelConfig(pwd) {
  return fsp.copyFile(babelConfigFilepath, join(pwd, 'babel.config.js'))
}

async function updateTSConfig(tsconfigFilepath) {
  // types: ["a"] => types: ["a", "jest"]
  return patchJSON(tsconfigFilepath, {
    compilerOptions: (compilerOptions, key, json) => {
      const types = compilerOptions.types;

      if (typeof types === 'undefined') {
        return {
          ...compilerOptions,
          types: ['jest']
        };
      }

      return {
        ...compilerOptions,
        types: types.includes('jest') ? types : types.concat('jest')
      };
    }
  });
}
