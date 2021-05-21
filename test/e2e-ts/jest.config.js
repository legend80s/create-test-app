module.exports = {
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  coverageProvider: 'v8',
  coverageDirectory: 'coverage',
  preset: 'ts-jest',
  testEnvironment: 'node',
};