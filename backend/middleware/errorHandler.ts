import { Request, Response, NextFunction } from 'express';
import { AppError, EnhancedAppError, ErrorUtils, ErrorContext } from '../utils/errors';
import { configService } from '../config/configService';

/**
 * Middleware global para manejo de errores mejorado
 */
export const errorHandler = (
  error: Error | AppError | EnhancedAppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Crear contexto del error
  const errorContext: ErrorContext = {
    requestId: req.headers['x-request-id'] as string,
    endpoint: req.path,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date(),
    additionalData: {
      query: req.query,
      params: req.params,
    },
  };

  // Logging mejorado del error
  const sanitizedError = ErrorUtils.sanitizeError(error);
  const config = configService.getLoggingConfig();

  if (config.level === 'debug' || config.level === 'info') {
    console.error(`[${new Date().toISOString()}] [ErrorHandler] Error caught:`, {
      ...sanitizedError,
      context: errorContext,
    });
  } else {
    console.error(`[${new Date().toISOString()}] [ErrorHandler] ${error.message}`);
  }

  // Preparar respuesta base
  const baseResponse = {
    timestamp: new Date().toISOString(),
    path: req.path,
    requestId: errorContext.requestId,
  };

  // Manejo de errores mejorados
  if (error instanceof EnhancedAppError) {
    const response = {
      error: error.message,
      code: error.code,
      category: error.category,
      severity: error.severity,
      ...baseResponse,
      ...(error.metadata && { metadata: error.metadata }),
      ...(error.isRetryable && {
        retryable: true,
        retryAfter: error.retryAfter,
      }),
    };

    // Agregar información de debugging en desarrollo
    if (configService.getServerConfig().nodeEnv === 'development') {
      response.metadata = {
        ...response.metadata,
        stack: error.stack,
        context: error.context,
      };
    }

    res.status(error.statusCode).json(response);
    return;
  }

  // Manejo de errores básicos de la aplicación
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
      ...baseResponse,
      ...(error.metadata && { metadata: error.metadata }),
    });
    return;
  }

  // Errores específicos de Multer (archivos)
  if (error.message.includes('File too large')) {
    res.status(413).json({
      error: 'Archivo demasiado grande',
      code: 'FILE_TOO_LARGE',
      category: 'validation',
      ...baseResponse,
      metadata: {
        maxSize: configService.getServerConfig().maxFileSize,
      },
    });
    return;
  }

  if (error.message.includes('Solo se permiten archivos PDF')) {
    res.status(400).json({
      error: error.message,
      code: 'INVALID_FILE_TYPE',
      category: 'validation',
      ...baseResponse,
    });
    return;
  }

  // Error de sintaxis JSON
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({
      error: 'JSON inválido en el cuerpo de la solicitud',
      code: 'INVALID_JSON',
      category: 'validation',
      ...baseResponse,
    });
    return;
  }

  // Errores de red/timeout
  if (
    error.message.includes('ECONNRESET') ||
    error.message.includes('ETIMEDOUT') ||
    error.message.includes('ENOTFOUND')
  ) {
    res.status(503).json({
      error: 'Error de conectividad del servicio',
      code: 'SERVICE_UNAVAILABLE',
      category: 'network',
      retryable: true,
      retryAfter: 5000,
      ...baseResponse,
    });
    return;
  }

  // Error genérico del servidor
  const isDevelopment = configService.getServerConfig().nodeEnv === 'development';

  res.status(500).json({
    error: 'Error interno del servidor',
    code: 'INTERNAL_SERVER_ERROR',
    category: 'internal',
    severity: 'high',
    ...baseResponse,
    ...(isDevelopment && {
      debug: {
        originalError: error.message,
        stack: error.stack,
        name: error.name,
      },
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
