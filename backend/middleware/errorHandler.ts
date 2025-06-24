import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

/**
 * Middleware global para manejo de errores
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`[${new Date().toISOString()}] [ErrorHandler] Error caught:`, {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Si es un error personalizado de la aplicación
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
      path: req.path,
      ...(error.metadata && { metadata: error.metadata }),
    });
    return;
  }

  // Error de Multer (archivos)
  if (error.message.includes('File too large')) {
    res.status(413).json({
      error: 'Archivo demasiado grande',
      code: 'FILE_TOO_LARGE',
      timestamp: new Date().toISOString(),
      path: req.path,
    });
    return;
  }

  if (error.message.includes('Solo se permiten archivos PDF')) {
    res.status(400).json({
      error: error.message,
      code: 'INVALID_FILE_TYPE',
      timestamp: new Date().toISOString(),
      path: req.path,
    });
    return;
  }

  // Error de sintaxis JSON
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({
      error: 'JSON inválido en el cuerpo de la solicitud',
      code: 'INVALID_JSON',
      timestamp: new Date().toISOString(),
      path: req.path,
    });
    return;
  }

  // Error genérico del servidor
  res.status(500).json({
    error: 'Error interno del servidor',
    code: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString(),
    path: req.path,
    ...(process.env.NODE_ENV === 'development' && {
      originalError: error.message,
      stack: error.stack,
    }),
  });
};

/**
 * Middleware para manejar rutas no encontradas
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  console.warn(`[${new Date().toISOString()}] [NotFoundHandler] Route not found:`, {
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  res.status(404).json({
    error: `Ruta no encontrada: ${req.method} ${req.path}`,
    code: 'ROUTE_NOT_FOUND',
    timestamp: new Date().toISOString(),
    path: req.path,
    availableEndpoints: {
      calendar: ['POST /api/calendario/evento'],
      chat: [
        'POST /api/chat/message',
        'GET /api/chat/conversations',
        'GET /api/chat/conversations/:id',
        'DELETE /api/chat/conversations/:id',
        'PUT /api/chat/conversations/:id/title',
        'GET /api/chat/search',
        'GET /api/chat/stats',
        'GET /api/chat/health',
      ],
      pdf: [
        'POST /api/pdf/extract-text',
        'POST /api/pdf/analyze',
        'GET /api/pdf/capabilities',
        'GET /api/pdf/health',
      ],
    },
  });
};

/**
 * Middleware para logging de requests
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  // Log de inicio de request
  console.log(`[${new Date().toISOString()}] [Request] ${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
  });

  // Interceptar el final de la respuesta para logging
  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] [Response] ${req.method} ${req.url}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: body?.length || 0,
    });
    return originalSend.call(this, body);
  };

  next();
};
