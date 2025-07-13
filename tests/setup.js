// Configuration globale pour les tests
process.env.NODE_ENV = 'test';
process.env.PORT = '5001'; // Port différent pour les tests

// Mock console pour éviter le spam dans les tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Timeout global pour les tests d'API
jest.setTimeout(30000);