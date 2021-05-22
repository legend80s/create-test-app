const { intersection } = require('../../src/lib/lite-lodash');

describe('lite-lodash', () => {
  describe('intersection', () => {
    it('Should return the intersection array', () => {
      const input = ['jest', '@types/jest'];
      const actual = intersection(input, ['@types/jest']);
      const expected = ['@types/jest'];

      expect(actual).toEqual(expected);
    });
  });
});

