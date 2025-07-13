module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'server/**/*.{js,ts}',
    '!server/**/*.d.ts',
    '!server/**/node_modules/**',
  ],
  testMatch: [
    '**/tests/**/*.test.{js,ts}',
    '**/__tests__/**/*.{js,ts}',
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testTimeout: 30000, // 30 secondes pour les tests d'API
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 90,
      statements: 90,
    },
  },
};