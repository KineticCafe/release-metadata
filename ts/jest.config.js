module.exports = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    './src/**',
    '!./src/types.ts',
    '!./src/cli.ts',
    '!./src/json-utils.ts',
    '!./src/program.ts',
  ],
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 90,
      lines: 80,
    },
  },
  moduleFileExtensions: ['js', 'ts', 'json', 'node'],
  testEnvironment: 'node',
  testRegex: '/tests/.+\\.(test|spec)\\.[jt]s$',
  transform: { '^.+\\.ts$': 'ts-jest' },
}
