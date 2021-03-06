module.exports = {
  preset: '',
  testEnvironment: 'node',

  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
  },
  transform: {
    "^.+\\.(js)$": "babel-jest",
    "^.+\\.(sjs)$": "babel-jest",
  },
}
