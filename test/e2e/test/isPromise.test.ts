import { isPromise } from '../src/lib/isPromise';

describe('isPromise', () => {
  it('Should be promise when input is async function', () => {
    async function foo() {
    }

    const input = foo();
    const actual = isPromise(input);
    const expected = true;

    expect(actual).toEqual(expected);
  });
});
