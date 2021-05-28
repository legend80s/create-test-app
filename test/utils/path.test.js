const { paths2ModuleNameMapper } = require('../../src/utils/path');

describe('path', () => {
  describe('paths2ModuleNameMapper', () => {
    it('should transform 1 path array which prefixed with ./', () => {
      const input = { "@/*": ["./src/*"] };
      const actual = paths2ModuleNameMapper(input);
      const expected = { '^@/(.*)': ['<rootDir>/src/$1'] };

      expect(actual).toEqual(expected);
    });

    it('should transform 1 path array', () => {
      const input = {"@app/*": ["src/*"]};
      const actual = paths2ModuleNameMapper(input);
      const expected = {"^@app/(.*)": ["<rootDir>/src/$1"]};

      expect(actual).toEqual(expected);
    });

    it('should transform 2 path array', () => {
      const input = { "@app/*": ["src/*", "src/app/*"] };
      const actual = paths2ModuleNameMapper(input);
      const expected = {
        "^@app/(.*)": ["<rootDir>/src/$1", "<rootDir>/src/app/$1"],
      };

      expect(actual).toEqual(expected);
    });

    it('should transform multiple key paths', () => {
      const input = { "@app/*": ["src/*", "src/app/*"], "@/*": ["./src/*"]  };
      const actual = paths2ModuleNameMapper(input);
      const expected = {
        "^@app/(.*)": ["<rootDir>/src/$1", "<rootDir>/src/app/$1"],
        '^@/(.*)': ['<rootDir>/src/$1']
      };

      expect(actual).toEqual(expected);
    });
  });
});
