/**
 * Clases de error personalizadas para la aplicación
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
 * Error específico del servicio de calendario
 */
export class CalendarServiceError extends AppError {
  constructor(
    message: string,
    code: string = 'CALENDAR_ERROR',
    metadata?: Record<string, unknown>
  ) {
    super(message, code, 500, metadata);
  }
}

/**
 * Error específico del servicio de chat
 */
export class ChatServiceError extends AppError {
  constructor(message: string, code: string = 'CHAT_ERROR', metadata?: Record<string, unknown>) {
    super(message, code, 500, metadata);
  }
}

/**
 * Error específico del servicio de PDF
 */
export class PDFServiceError extends AppError {
  constructor(message: string, code: string = 'PDF_ERROR', metadata?: Record<string, unknown>) {
    super(message, code, 500, metadata);
  }
}

/**
 * Error de validación
 */
export class ValidationError extends AppError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, metadata);
  }
}

/**
 * Error de autenticación
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'No autorizado', metadata?: Record<string, unknown>) {
    super(message, 'AUTHENTICATION_ERROR', 401, metadata);
  }
}

/**
 * Error de autorización
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Acceso denegado', metadata?: Record<string, unknown>) {
    super(message, 'AUTHORIZATION_ERROR', 403, metadata);
  }
}

/**
 * Error de recurso no encontrado
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso no encontrado', metadata?: Record<string, unknown>) {
    super(message, 'NOT_FOUND_ERROR', 404, metadata);
  }
}

/**
 * Error de conflicto
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Conflicto de recursos', metadata?: Record<string, unknown>) {
    super(message, 'CONFLICT_ERROR', 409, metadata);
  }
}

/**
 * Error de límite de tasa
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Límite de tasa excedido', metadata?: Record<string, unknown>) {
    super(message, 'RATE_LIMIT_ERROR', 429, metadata);
  }
}

/**
 * Error específico del servicio de Google Drive
 */
export class GoogleDriveServiceError extends AppError {
  constructor(
    message: string,
    code: string = 'GOOGLE_DRIVE_ERROR',
    metadata?: Record<string, unknown>
  ) {
    super(message, code, 500, metadata);
  }
}

// ==================== ERROR HANDLER UTILITIES ====================

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

/**
 * Factory para crear errores específicos de servicios
 */
export class ServiceErrorFactory {
  /**
   * Crea un error de servicio de chat
   */
  static createChatError(
    message: string,
    code: string = 'CHAT_ERROR',
    context?: ErrorContext,
    metadata?: Record<string, unknown>
  ): EnhancedAppError {
    return new EnhancedAppError(
      message,
      code,
      500,
      ErrorCategory.EXTERNAL_SERVICE,
      ErrorSeverity.MEDIUM,
      { metadata, context, isRetryable: true, retryAfter: 5000 }
    );
  }

  /**
   * Crea un error de servicio de PDF
   */
  static createPdfError(
    message: string,
    code: string = 'PDF_ERROR',
    context?: ErrorContext,
    metadata?: Record<string, unknown>
  ): EnhancedAppError {
    return new EnhancedAppError(message, code, 500, ErrorCategory.INTERNAL, ErrorSeverity.MEDIUM, {
      metadata,
      context,
      isRetryable: false,
    });
  }

  /**
   * Crea un error de servicio de calendario
   */
  static createCalendarError(
    message: string,
    code: string = 'CALENDAR_ERROR',
    context?: ErrorContext,
    metadata?: Record<string, unknown>
  ): EnhancedAppError {
    return new EnhancedAppError(
      message,
      code,
      500,
      ErrorCategory.EXTERNAL_SERVICE,
      ErrorSeverity.MEDIUM,
      { metadata, context, isRetryable: true, retryAfter: 10000 }
    );
  }

  /**
   * Crea un error de servicio de Google Drive
   */
  static createGoogleDriveError(
    message: string,
    code: string = 'GOOGLE_DRIVE_ERROR',
    context?: ErrorContext,
    metadata?: Record<string, unknown>
  ): EnhancedAppError {
    return new EnhancedAppError(
      message,
      code,
      500,
      ErrorCategory.EXTERNAL_SERVICE,
      ErrorSeverity.MEDIUM,
      { metadata, context, isRetryable: true, retryAfter: 5000 }
    );
  }

  /**
   * Crea un error de validación
   */
  static createValidationError(
    message: string,
    field?: string,
    context?: ErrorContext
  ): EnhancedAppError {
    return new EnhancedAppError(
      message,
      'VALIDATION_ERROR',
      400,
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW,
      {
        metadata: { field },
        context,
        isRetryable: false,
      }
    );
  }

  /**
   * Crea un error de autenticación
   */
  static createAuthenticationError(
    message: string = 'No autorizado',
    context?: ErrorContext
  ): EnhancedAppError {
    return new EnhancedAppError(
      message,
      'AUTHENTICATION_ERROR',
      401,
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.HIGH,
      { context, isRetryable: false }
    );
  }

  /**
   * Crea un error de base de datos
   */
  static createDatabaseError(
    message: string,
    operation?: string,
    context?: ErrorContext,
    metadata?: Record<string, unknown>
  ): EnhancedAppError {
    return new EnhancedAppError(
      message,
      'DATABASE_ERROR',
      500,
      ErrorCategory.DATABASE,
      ErrorSeverity.HIGH,
      {
        metadata: { operation, ...metadata },
        context,
        isRetryable: true,
        retryAfter: 1000,
      }
    );
  }

  /**
   * Crea un error de red
   */
  static createNetworkError(
    message: string,
    url?: string,
    context?: ErrorContext
  ): EnhancedAppError {
    return new EnhancedAppError(
      message,
      'NETWORK_ERROR',
      503,
      ErrorCategory.NETWORK,
      ErrorSeverity.HIGH,
      {
        metadata: { url },
        context,
        isRetryable: true,
        retryAfter: 5000,
      }
    );
  }
}

/**
 * Utilidades para manejo de errores
 */
export class ErrorUtils {
  /**
   * Determina si un error es retryable
   */
  static isRetryable(error: Error): boolean {
    if (error instanceof EnhancedAppError) {
      return error.isRetryable;
    }

    // Errores de red generalmente son retryables
    if (
      error.message.includes('ECONNRESET') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('ENOTFOUND')
    ) {
      return true;
    }

    return false;
  }

  /**
   * Obtiene el tiempo de retry recomendado
   */
  static getRetryAfter(error: Error): number {
    if (error instanceof EnhancedAppError && error.retryAfter) {
      return error.retryAfter;
    }

    // Tiempo por defecto basado en el tipo de error
    if (error.message.includes('rate limit')) {
      return 60000; // 1 minuto
    }

    return 5000; // 5 segundos por defecto
  }

  /**
   * Sanitiza un error para logging seguro
   */
  static sanitizeError(error: Error): Record<string, any> {
    const sanitized: Record<string, any> = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };

    if (error instanceof EnhancedAppError) {
      sanitized.code = error.code;
      sanitized.statusCode = error.statusCode;
      sanitized.category = error.category;
      sanitized.severity = error.severity;
      sanitized.isRetryable = error.isRetryable;

      // Sanitizar metadatos sensibles
      if (error.metadata) {
        sanitized.metadata = this.sanitizeMetadata(error.metadata);
      }

      // Sanitizar contexto sensible
      if (error.context) {
        sanitized.context = this.sanitizeContext(error.context);
      }
    }

    return sanitized;
  }

  /**
   * Sanitiza metadatos removiendo información sensible
   */
  private static sanitizeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'auth'];
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(metadata)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Sanitiza contexto removiendo información sensible
   */
  private static sanitizeContext(context: ErrorContext): Partial<ErrorContext> {
    return {
      userId: context.userId ? '[REDACTED]' : undefined,
      requestId: context.requestId,
      endpoint: context.endpoint,
      method: context.method,
      userAgent: context.userAgent,
      ip: context.ip ? this.maskIp(context.ip) : undefined,
      timestamp: context.timestamp,
    };
  }

  /**
   * Enmascara una dirección IP para privacidad
   */
  private static maskIp(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.xxx.xxx`;
    }
    return 'xxx.xxx.xxx.xxx';
  }
}
