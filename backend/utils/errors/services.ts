/**
 * Errores específicos de servicios
 */

import { AppError } from './base';

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

/**
 * Error específico de base de datos
 */
export class DatabaseError extends AppError {
  constructor(
    message: string,
    code: string = 'DATABASE_ERROR',
    metadata?: Record<string, unknown>
  ) {
    super(message, code, 500, metadata);
  }
}

/**
 * Error específico de red/conectividad
 */
export class NetworkError extends AppError {
  constructor(message: string, code: string = 'NETWORK_ERROR', metadata?: Record<string, unknown>) {
    super(message, code, 503, metadata);
  }
}
