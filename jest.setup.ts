/**
 * Configuración global para Jest
 */

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.LOG_LEVEL = 'error'; // Reducir logging en tests

// Mock de console para tests más limpios
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeAll(() => {
  // Silenciar logs durante tests a menos que sea necesario
  console.error = jest.fn();
  console.warn = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  // Restaurar console original
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});

// Configurar timeout global para tests
jest.setTimeout(10000);

// Mock de fetch global si es necesario
global.fetch = jest.fn();

// Limpiar mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});