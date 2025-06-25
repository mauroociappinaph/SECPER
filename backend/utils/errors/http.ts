/**
 * Errores HTTP específicos
 */

import { AppError } from './base';

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
