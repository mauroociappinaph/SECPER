/**
 * Factory para crear errores específicos de servicios
 */

import { EnhancedAppError, ErrorCategory, ErrorSeverity, ErrorContext } from './base';

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
