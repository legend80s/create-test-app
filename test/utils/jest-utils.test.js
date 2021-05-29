const { stringifyTransformers } = require('../../src/utils/jest-utils');

describe.only('jest-utils', () => {
  describe('stringifyTransformers', () => {
    it('stringifyTransformers of one ext', () => {
      const input = { sjs: '@alipay/sjs-jest' };
      const actual = stringifyTransformers(input);
      const expected = `{
    "^.+\\\\.(sjs)$": "@alipay/sjs-jest",
  }`;

      expect(actual).toEqual(expected);
    });

    it('stringifyTransformers of 2 key', () => {
      const input = { sjs: '@alipay/sjs-jest', ts: 'ts-jest' };
      const actual = stringifyTransformers(input);
      const expected = `{
    "^.+\\\\.(sjs)$": "@alipay/sjs-jest",
    "^.+\\\\.(ts)$": "ts-jest",
  }`;

      expect(actual).toEqual(expected);
    });
  });
});
