/**
 * Clases de error base para la aplicación
 */

/**
 * Error base para la aplicación
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly metadata?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.metadata = metadata;

    // Mantener el stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Tipos de errores para categorización
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  RATE_LIMIT = 'rate_limit',
  EXTERNAL_SERVICE = 'external_service',
  DATABASE = 'database',
  NETWORK = 'network',
  INTERNAL = 'internal',
}

/**
 * Severidad del error
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Interface para contexto de error
 */
export interface ErrorContext {
  userId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  timestamp?: Date;
  additionalData?: Record<string, any>;
}

/**
 * Error extendido con contexto y categorización
 */
export class EnhancedAppError extends AppError {
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly context?: ErrorContext;
  public readonly isRetryable: boolean;
  public readonly retryAfter?: number;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    category: ErrorCategory = ErrorCategory.INTERNAL,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    options?: {
      metadata?: Record<string, unknown>;
      context?: ErrorContext;
      isRetryable?: boolean;
      retryAfter?: number;
    }
  ) {
    super(message, code, statusCode, options?.metadata);
    this.category = category;
    this.severity = severity;
    this.context = options?.context;
    this.isRetryable = options?.isRetryable ?? false;
    this.retryAfter = options?.retryAfter;
  }
}

export interface HealthCheckMetadata {
  configuration?: Record<string, unknown>;
  capabilities?: Record<string, unknown>;
  apiKeyConfigured?: boolean;
  zapierUrlConfigured?: boolean;
  credentialsConfigured?: boolean;
  metadataError?: string;
  // Agrega aquí otros campos esperados
}

export interface HealthCheckResult {
  // ...otros campos...
  metadata?: HealthCheckMetadata;
}
