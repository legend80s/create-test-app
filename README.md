<h1 align="center">Welcome to create-test-app 👋</h1>

> Armed your project with Jest.
>
> A opinionated scaffolding CLI to make your project tested by Jest and with coverage enabled.

## Why

Because configure Jest and set coverage is tedious 🤕.

**Just with one line cmd 🚀, everything is configured for U ❤️！**

## Use

For TypeScript project:

```sh
npx create-test-app --type ts
```

For JavaScript project:

```sh
npx create-test-app
```

**DONE!**

Files to be modified or created.

1. package.json
2. jest.config.js
3. babel.config.js
4. test/: auto generate test
5. won't modify tsconfig.json but auto mapping `paths` to jest's `moduleNameMapper`

## Advanced

set coverage to 50 and and add jest `transform`.

```sh
npx create-test-app --type ts --coverage 50 --transform="{ vue: 'vue-jest' }"
```

```diff
  'transform': {
+    '^.+\\.(vue)$': 'vue-jest',
  },
```

## How it works

Automatically armed your project with jest. You can do it manually if you don't trust this CLI.

### TS

For TS. It will go through the steps:

#### 1. Install

```sh
npm i -D jest typescript ts-jest @types/jest
```

#### 2. Initialize jest.config.js

```sh
npx ts-jest config:init
```

#### 3. Collect Coverage

```sh
npx jest --init
```

jest.config.js

```diff
module.exports = {
   preset: 'ts-jest',
   testEnvironment: "node",

+  coverageDirectory: "coverage",
+  coverageProvider: "v8",
+  coverageThreshold: {
    "global": {
      "branches": 100,
      "functions": 100,
      "lines": 100,
      "statements": 100
    }
  },
}

```

package.json

```diff
   "scripts": {
     "build": "tsc --declaration",
     "preversion": "npm run build",
     "postversion": "npm publish && git push && git push --tags",
-    "test": "jest"
+    "test": "jest --coverage"
   },
```

.gitignore

```diff
+coverage/
```

#### 4. Write tests

```sh
md test && cd test && touch lite-lodash.test.ts
```

```javascript
// lite-lodash.test.js
import { isPromise } from '../src/lib/lite-lodash'

describe('isPromise', () => {
  it('`Promise.resolve()` should be a promise', () => {
    const input = Promise.resolve();
    const actual = isPromise(input);
    const expected = true;

    expect(actual).toEqual(expected);
  });

  it('`new Promise` should be a promise', () => {
    const input = new Promise(() => {});
    const actual = isPromise(input);
    const expected = true;

    expect(actual).toEqual(expected);
  });
});
```

*from [Jest 运行 TypeScript 单测并增加覆盖率](https://juejin.cn/post/6953072509021323278).*

### JS

#### 1. Install

```sh
npm i -D jest @types/jest
```

All the same without `npx ts-jest config:init`.

## Run tests

```sh
npm test
```

## TODO

- [ ] UX improvement: auto check whether it is a TS project

## Author

👤 **legend80s**

- Github: [@legend80s](https://github.com/legend80s)

## Show your support

Give a ⭐️ if this project helped you!

***

*This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator).*

*Powered by pnpm.*
