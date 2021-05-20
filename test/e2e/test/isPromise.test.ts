import { isPromise } from '../src/lib/isPromise';

describe('isPromise', () => {
  it('Should be promise when input is async function', () => {
    const input = Promise.resolve(true);
    const actual = isPromise(input);
    const expected = true;

    expect(actual).toEqual(expected);
  });
});
