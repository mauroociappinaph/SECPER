/**
 * Constantes de configuración de la aplicación
 * @deprecated Use configService instead for new code
 */

import { configService } from './configService';

// Mantener compatibilidad hacia atrás mientras migramos
const config = configService.getConfig();

// URL del MCP de Zapier para operaciones de calendario
export const ZAPIER_MCP_URL =
  config.zapier.mcpUrl || 'https://actions.zapier.com/mcp/sk-ak-EWFgp3S76EeFHBBFO4RCxQUXAn/sse';

// Configuración de la API de Mistral
export const MISTRAL_API_KEY = config.mistral.apiKey || '';
export const MISTRAL_MODEL = config.mistral.model;

// Configuración del servidor
export const PORT = config.server.port;
export const NODE_ENV = config.server.nodeEnv;

// Límites de la aplicación
export const MAX_FILE_SIZE = config.server.maxFileSize;
export const MAX_ATTENDEES = 50;
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 1000;

// Configuración de CORS
export const CORS_ORIGINS = config.server.corsOrigins;
