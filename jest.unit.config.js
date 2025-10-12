module.exports = {
  displayName: 'Unit Tests',
  testMatch: ['**/__tests__/**/*.unit.test.js', '**/__tests__/**/unit-api.test.js', '**/__tests__/**/validation.test.js'],
  testEnvironment: 'node',
  collectCoverageFrom: [
    'routes/**/*.js',
    '!routes/**/*.test.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage/unit',
  setupFilesAfterEnv: [],
  // Don't use the main jest.setup.js which tries to start TestContainers
  globalSetup: undefined,
  globalTeardown: undefined
};
