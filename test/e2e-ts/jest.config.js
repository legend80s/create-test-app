module.exports = {
  transform: {
    "^.+\\.(js)$": "babel-jest",
  },
  moduleNameMapper:   {
    "^/common/(.*)": [
      "<rootDir>/src/common/$1"
    ],
    "^/services/(.*)": [
      "<rootDir>/src/services/$1"
    ]
  },
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
