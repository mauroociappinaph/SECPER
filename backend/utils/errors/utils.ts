/**
 * Utilidades para manejo de errores
 */

import { EnhancedAppError, ErrorContext } from './base';

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

  /**
   * Crea un contexto de error a partir de una request de Express
   */
  static createErrorContext(req: any): ErrorContext {
    return {
      requestId: req.id || req.headers['x-request-id'],
      endpoint: req.path,
      method: req.method,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date(),
      additionalData: {
        query: req.query,
        params: req.params,
      },
    };
  }

  /**
   * Convierte un error desconocido en un AppError
   */
  static normalizeError(
    error: unknown,
    defaultMessage: string = 'Error interno del servidor'
  ): EnhancedAppError {
    if (error instanceof EnhancedAppError) {
      return error;
    }

    if (error instanceof Error) {
      return new EnhancedAppError(error.message || defaultMessage, 'INTERNAL_ERROR', 500);
    }

    return new EnhancedAppError(defaultMessage, 'UNKNOWN_ERROR', 500, undefined, undefined, {
      metadata: { originalError: String(error) },
    });
  }
}
