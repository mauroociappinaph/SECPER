/**
 * Constantes de configuración de la aplicación
 */

// URL del MCP de Zapier para operaciones de calendario
export const ZAPIER_MCP_URL =
  process.env.ZAPIER_MCP_URL ||
  'https://actions.zapier.com/mcp/sk-ak-EWFgp3S76EeFHBBFO4RCxQUXAn/sse';

// Configuración de la API de Mistral
export const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || '';
export const MISTRAL_MODEL = process.env.MISTRAL_MODEL || 'mistral-large-latest';

// Configuración del servidor
export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Límites de la aplicación
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_ATTENDEES = 50;
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 1000;

// Configuración de CORS
export const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001',
];
