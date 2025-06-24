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
