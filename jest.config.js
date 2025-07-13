export default {
  testEnvironment: 'node',
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  moduleNameMapping: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
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
    '^.+\\.ts$': ['ts-jest', { useESM: true }],
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