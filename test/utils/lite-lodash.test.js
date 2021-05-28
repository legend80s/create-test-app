const { intersection, hasWord, merge } = require('../../src/utils/lite-lodash');

describe('lite-lodash', () => {
  describe('intersection', () => {
    it('Should return the intersection array which is not empty', () => {
      const input = ['jest', '@types/jest'];
      const actual = intersection(input, ['@types/jest']);
      const expected = ['@types/jest'];

      expect(actual).toEqual(expected);
    });

    it('Should return an array which is empty', () => {
      const arr1 = ['jest', '@types/jest'];
      const arr2 = ['@type/jest'];
      const actual = intersection(arr1, arr2);
      const expected = [];

      expect(actual).toEqual(expected);
    });
  });

  describe('hasWord', () => {
    it('Should has word "coverage" in the end', () => {
      const actual = hasWord('.mini ide coverage', 'coverage');
      const expected = true;

      expect(actual).toEqual(expected);
    });

    it('has word "coverage" in the middle', () => {
      const actual = hasWord('.mini ide coverage middle', 'coverage');
      const expected = true;

      expect(actual).toEqual(expected);
    });

    it('"coverage2" not has word "coverage"', () => {
      const actual = hasWord('.mini ide coverage2', 'coverage');
      const expected = false;

      expect(actual).toEqual(expected);
    });

    it('"idecoverage/" not has word "coverage"', () => {
      const actual = hasWord('idecoverage/', 'coverage');
      const expected = false;

      expect(actual).toEqual(expected);
    });

    it('"idecoverage" not has word "coverage"', () => {
      const actual = hasWord('idecoverage', 'coverage');
      const expected = false;

      expect(actual).toEqual(expected);
    });
  });

  describe('merge', () => {
    it('Should add static version', () => {
      const input = { name: 'foo' };
      const actual = merge(input, { version: '1.0.0' });
      const expected = { name: 'foo', version: '1.0.0' };

      expect(actual).toEqual(expected);
    });

    it('Should overwrite name', () => {
      const input = { name: 'foo' };
      const actual = merge(input, { name: 'bar' });
      const expected = { name: 'bar' };

      expect(actual).toEqual(expected);
    });

    it('Should add version be evaluated by function', () => {
      const input = { name: 'foo' };
      const actual = merge(input, {
        version: (value, key, json) => {
          expect(value).toEqual(undefined);
          expect(key).toEqual('version');
          expect(json).toEqual(input);

          return '2.0.0';
        }
      });

      const expected = { name: 'foo', version: '2.0.0' };

      expect(actual).toEqual(expected);
    });

    it('Should transform to array', () => {
      const input = { name: 'foo', types: 'bar', list: ['baz'] };
      const actual = merge(input, {
        types: (value, key, json) => {
          return [value, 'bar2'];
        },
        list: (value, key, json) => {
          return [...value, 'baz2']
        }
      });

      const expected = {
        name: 'foo',
        types: ['bar', 'bar2'],
        list: ['baz', 'baz2'],
      };

      expect(actual).toEqual(expected);
    });
  });
});
