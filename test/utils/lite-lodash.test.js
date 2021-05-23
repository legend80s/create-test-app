const { intersection } = require('../../src/utils/lite-lodash');

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
});
