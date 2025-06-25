/**
 * Punto de entrada principal para el sistema de errores modularizado
 */

// Exportar clases base
export { AppError, EnhancedAppError, ErrorCategory, ErrorSeverity, ErrorContext } from './base';

// Exportar errores HTTP
export {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
} from './http';

// Exportar errores de servicios
export {
  CalendarServiceError,
  ChatServiceError,
  PDFServiceError,
  GoogleDriveServiceError,
  DatabaseError,
  NetworkError,
} from './services';

// Exportar factory
export { ServiceErrorFactory } from './factory';

// Exportar utilidades
export { ErrorUtils } from './utils';

// Re-exportar todo para compatibilidad hacia atrás
export * from './base';
export * from './http';
export * from './services';
export * from './factory';
export * from './utils';
