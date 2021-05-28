const { intersection, hasWord } = require('../../src/utils/lite-lodash');

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
});
