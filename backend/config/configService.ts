/**
 * Servicio de configuración centralizado y robusto
 */

import { z } from 'zod';

// ==================== SCHEMAS DE VALIDACIÓN ====================

/**
 * Schema para configuración de la aplicación
 */
const AppConfigSchema = z.object({
  // Configuración del servidor
  server: z.object({
    port: z.number().min(1).max(65535).default(3000),
    host: z.string().default('localhost'),
    nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
    corsOrigins: z.array(z.string()).default(['http://localhost:3000', 'http://localhost:3001']),
    maxFileSize: z
      .number()
      .positive()
      .default(10 * 1024 * 1024), // 10MB
    requestTimeout: z.number().positive().default(30000), // 30 segundos
  }),

  // Configuración de la base de datos
  database: z.object({
    url: z.string().default('file:./prisma/dev.db'),
    logLevel: z.enum(['info', 'warn', 'error']).default('warn'),
    connectionTimeout: z.number().positive().default(5000),
  }),

  // Configuración de Mistral AI
  mistral: z.object({
    apiKey: z.string().optional(),
    model: z.string().default('mistral-large-latest'),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().positive().default(1000),
    timeout: z.number().positive().default(30000),
    retryAttempts: z.number().min(0).max(5).default(3),
  }),

  // Configuración de Google Drive
  googleDrive: z.object({
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    redirectUri: z.string().default('http://localhost:3000/auth/google/callback'),
    scopes: z.array(z.string()).default(['https://www.googleapis.com/auth/drive']),
    timeout: z.number().positive().default(30000),
  }),

  // Configuración de Zapier (Calendario)
  zapier: z.object({
    mcpUrl: z.string().optional(),
    timeout: z.number().positive().default(30000),
    retryAttempts: z.number().min(0).max(5).default(3),
  }),

  // Configuración de logging
  logging: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    enableConsole: z.boolean().default(true),
    enableFile: z.boolean().default(false),
    filePath: z.string().default('./logs/app.log'),
    maxFileSize: z
      .number()
      .positive()
      .default(10 * 1024 * 1024), // 10MB
    maxFiles: z.number().positive().default(5),
  }),

  // Configuración de cache
  cache: z.object({
    enabled: z.boolean().default(true),
    ttl: z.number().positive().default(300), // 5 minutos
    maxSize: z.number().positive().default(1000),
    checkPeriod: z.number().positive().default(60), // 1 minuto
  }),

  // Configuración de rate limiting
  rateLimit: z.object({
    enabled: z.boolean().default(true),
    windowMs: z
      .number()
      .positive()
      .default(15 * 60 * 1000), // 15 minutos
    maxRequests: z.number().positive().default(100),
    skipSuccessfulRequests: z.boolean().default(false),
  }),

  // Configuración de health checks
  healthCheck: z.object({
    enabled: z.boolean().default(true),
    interval: z.number().positive().default(30000), // 30 segundos
    timeout: z.number().positive().default(5000), // 5 segundos
    retries: z.number().min(0).max(5).default(3),
    cacheTimeout: z.number().positive().default(30000), // 30 segundos
  }),

  // Configuración de métricas
  metrics: z.object({
    enabled: z.boolean().default(false),
    endpoint: z.string().default('/metrics'),
    collectDefaultMetrics: z.boolean().default(true),
    prefix: z.string().default('michatgpt_'),
  }),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

// ==================== SERVICIO DE CONFIGURACIÓN ====================

/**
 * Servicio centralizado de configuración
 */
export class ConfigService {
  private config: AppConfig;
  private isInitialized = false;

  constructor() {
    this.config = this.loadConfiguration();
  }

  /**
   * Carga la configuración desde variables de entorno
   */
  private loadConfiguration(): AppConfig {
    try {
      const rawConfig = {
        server: {
          port: this.getEnvAsNumber('PORT', 3000),
          host: this.getEnvAsString('HOST', 'localhost'),
          nodeEnv: this.getEnvAsString('NODE_ENV', 'development') as
            | 'development'
            | 'production'
            | 'test',
          corsOrigins: this.getEnvAsArray('CORS_ORIGINS', [
            'http://localhost:3000',
            'http://localhost:3001',
          ]),
          maxFileSize: this.getEnvAsNumber('MAX_FILE_SIZE', 10 * 1024 * 1024),
          requestTimeout: this.getEnvAsNumber('REQUEST_TIMEOUT', 30000),
        },
        database: {
          url: this.getEnvAsString('DATABASE_URL', 'file:./prisma/dev.db'),
          logLevel: this.getEnvAsString('DATABASE_LOG_LEVEL', 'warn') as 'info' | 'warn' | 'error',
          connectionTimeout: this.getEnvAsNumber('DATABASE_CONNECTION_TIMEOUT', 5000),
        },
        mistral: {
          apiKey: this.getEnvAsString('MISTRAL_API_KEY'),
          model: this.getEnvAsString('MISTRAL_MODEL', 'mistral-large-latest'),
          temperature: this.getEnvAsNumber('MISTRAL_TEMPERATURE', 0.7),
          maxTokens: this.getEnvAsNumber('MISTRAL_MAX_TOKENS', 1000),
          timeout: this.getEnvAsNumber('MISTRAL_TIMEOUT', 30000),
          retryAttempts: this.getEnvAsNumber('MISTRAL_RETRY_ATTEMPTS', 3),
        },
        googleDrive: {
          clientId: this.getEnvAsString('GOOGLE_CLIENT_ID'),
          clientSecret: this.getEnvAsString('GOOGLE_CLIENT_SECRET'),
          redirectUri: this.getEnvAsString(
            'GOOGLE_REDIRECT_URI',
            'http://localhost:3000/auth/google/callback'
          ),
          scopes: this.getEnvAsArray('GOOGLE_SCOPES', ['https://www.googleapis.com/auth/drive']),
          timeout: this.getEnvAsNumber('GOOGLE_DRIVE_TIMEOUT', 30000),
        },
        zapier: {
          mcpUrl: this.getEnvAsString('ZAPIER_MCP_URL'),
          timeout: this.getEnvAsNumber('ZAPIER_TIMEOUT', 30000),
          retryAttempts: this.getEnvAsNumber('ZAPIER_RETRY_ATTEMPTS', 3),
        },
        logging: {
          level: this.getEnvAsString('LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error',
          enableConsole: this.getEnvAsBoolean('LOG_ENABLE_CONSOLE', true),
          enableFile: this.getEnvAsBoolean('LOG_ENABLE_FILE', false),
          filePath: this.getEnvAsString('LOG_FILE_PATH', './logs/app.log'),
          maxFileSize: this.getEnvAsNumber('LOG_MAX_FILE_SIZE', 10 * 1024 * 1024),
          maxFiles: this.getEnvAsNumber('LOG_MAX_FILES', 5),
        },
        cache: {
          enabled: this.getEnvAsBoolean('CACHE_ENABLED', true),
          ttl: this.getEnvAsNumber('CACHE_TTL', 300),
          maxSize: this.getEnvAsNumber('CACHE_MAX_SIZE', 1000),
          checkPeriod: this.getEnvAsNumber('CACHE_CHECK_PERIOD', 60),
        },
        rateLimit: {
          enabled: this.getEnvAsBoolean('RATE_LIMIT_ENABLED', true),
          windowMs: this.getEnvAsNumber('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
          maxRequests: this.getEnvAsNumber('RATE_LIMIT_MAX_REQUESTS', 100),
          skipSuccessfulRequests: this.getEnvAsBoolean('RATE_LIMIT_SKIP_SUCCESSFUL', false),
        },
        healthCheck: {
          enabled: this.getEnvAsBoolean('HEALTH_CHECK_ENABLED', true),
          interval: this.getEnvAsNumber('HEALTH_CHECK_INTERVAL', 30000),
          timeout: this.getEnvAsNumber('HEALTH_CHECK_TIMEOUT', 5000),
          retries: this.getEnvAsNumber('HEALTH_CHECK_RETRIES', 3),
          cacheTimeout: this.getEnvAsNumber('HEALTH_CHECK_CACHE_TIMEOUT', 30000),
        },
        metrics: {
          enabled: this.getEnvAsBoolean('METRICS_ENABLED', false),
          endpoint: this.getEnvAsString('METRICS_ENDPOINT', '/metrics'),
          collectDefaultMetrics: this.getEnvAsBoolean('METRICS_COLLECT_DEFAULT', true),
          prefix: this.getEnvAsString('METRICS_PREFIX', 'michatgpt_'),
        },
      };

      const validatedConfig = AppConfigSchema.parse(rawConfig);
      this.isInitialized = true;

      console.log('[ConfigService] Configuration loaded and validated successfully');
      return validatedConfig;
    } catch (error) {
      console.error('[ConfigService] Failed to load configuration:', error);
      throw new Error(
        `Configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Obtiene la configuración completa
   */
  getConfig(): AppConfig {
    if (!this.isInitialized) {
      throw new Error('Configuration not initialized');
    }
    return this.config;
  }

  /**
   * Obtiene configuración del servidor
   */
  getServerConfig() {
    return this.config.server;
  }

  /**
   * Obtiene configuración de la base de datos
   */
  getDatabaseConfig() {
    return this.config.database;
  }

  /**
   * Obtiene configuración de Mistral
   */
  getMistralConfig() {
    return this.config.mistral;
  }

  /**
   * Obtiene configuración de Google Drive
   */
  getGoogleDriveConfig() {
    return this.config.googleDrive;
  }

  /**
   * Obtiene configuración de Zapier
   */
  getZapierConfig() {
    return this.config.zapier;
  }

  /**
   * Obtiene configuración de logging
   */
  getLoggingConfig() {
    return this.config.logging;
  }

  /**
   * Obtiene configuración de cache
   */
  getCacheConfig() {
    return this.config.cache;
  }

  /**
   * Obtiene configuración de rate limiting
   */
  getRateLimitConfig() {
    return this.config.rateLimit;
  }

  /**
   * Obtiene configuración de health checks
   */
  getHealthCheckConfig() {
    return this.config.healthCheck;
  }

  /**
   * Obtiene configuración de métricas
   */
  getMetricsConfig() {
    return this.config.metrics;
  }

  /**
   * Verifica si la configuración está completa para un servicio
   */
  isServiceConfigured(service: 'mistral' | 'googleDrive' | 'zapier'): boolean {
    switch (service) {
      case 'mistral':
        return !!this.config.mistral.apiKey;
      case 'googleDrive':
        return !!(this.config.googleDrive.clientId && this.config.googleDrive.clientSecret);
      case 'zapier':
        return !!this.config.zapier.mcpUrl;
      default:
        return false;
    }
  }

  /**
   * Obtiene un resumen de la configuración para debugging
   */
  getConfigSummary(): Record<string, any> {
    return {
      server: {
        port: this.config.server.port,
        nodeEnv: this.config.server.nodeEnv,
        corsOrigins: this.config.server.corsOrigins.length,
      },
      services: {
        mistral: this.isServiceConfigured('mistral'),
        googleDrive: this.isServiceConfigured('googleDrive'),
        zapier: this.isServiceConfigured('zapier'),
      },
      features: {
        cache: this.config.cache.enabled,
        rateLimit: this.config.rateLimit.enabled,
        healthCheck: this.config.healthCheck.enabled,
        metrics: this.config.metrics.enabled,
        fileLogging: this.config.logging.enableFile,
      },
      limits: {
        maxFileSize: this.config.server.maxFileSize,
        requestTimeout: this.config.server.requestTimeout,
        maxTokens: this.config.mistral.maxTokens,
      },
    };
  }

  /**
   * Valida que todas las configuraciones críticas estén presentes
   */
  validateCriticalConfig(): { isValid: boolean; missingConfigs: string[] } {
    const missingConfigs: string[] = [];

    // Validar configuraciones críticas
    if (!this.config.database.url) {
      missingConfigs.push('DATABASE_URL');
    }

    // Advertir sobre configuraciones opcionales pero importantes
    if (!this.config.mistral.apiKey) {
      console.warn(
        '[ConfigService] MISTRAL_API_KEY not configured - chat functionality will be limited'
      );
    }

    if (!this.isServiceConfigured('googleDrive')) {
      console.warn('[ConfigService] Google Drive not configured - file operations will be limited');
    }

    if (!this.isServiceConfigured('zapier')) {
      console.warn(
        '[ConfigService] Zapier not configured - calendar functionality will be limited'
      );
    }

    return {
      isValid: missingConfigs.length === 0,
      missingConfigs,
    };
  }

  // ==================== UTILIDADES PRIVADAS ====================

  private getEnvAsString(key: string, defaultValue?: string): string | undefined {
    const value = process.env[key];
    return value !== undefined ? value : defaultValue;
  }

  private getEnvAsNumber(key: string, defaultValue: number): number {
    const value = process.env[key];
    if (value === undefined) return defaultValue;

    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      console.warn(
        `[ConfigService] Invalid number for ${key}: ${value}, using default: ${defaultValue}`
      );
      return defaultValue;
    }

    return parsed;
  }

  private getEnvAsBoolean(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];
    if (value === undefined) return defaultValue;

    return value.toLowerCase() === 'true' || value === '1';
  }

  private getEnvAsArray(key: string, defaultValue: string[]): string[] {
    const value = process.env[key];
    if (value === undefined) return defaultValue;

    return value
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }
}

// Instancia singleton del servicio de configuración
export const configService = new ConfigService();
