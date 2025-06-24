import express from 'express';
import cors from 'cors';
import routes from './routes/routes';
import { requestLogger, notFoundHandler, errorHandler } from './middleware/errorHandler';
import { CORS_ORIGINS } from './config/constants';

const app = express();

// Configuracion de CORS
app.use(
  cors({
    origin: CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Middleware para logging de requests
app.use(requestLogger);

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ruta de salud del servidor
app.get('/', (_req, res) => {
  res.json({
    message: 'Mi ChatGPT API - Servidor funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      calendar: '/api/calendario',
      chat: '/api/chat',
      pdf: '/api/pdf',
      drive: '/api/drive',
    },
    status: 'healthy',
  });
});

// Ruta de health check global
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    environment: process.env.NODE_ENV || 'development',
  });
});

// Uso del router modularizado
app.use(routes);

// Middleware para rutas no encontradas
app.use(notFoundHandler);

// Middleware global de manejo de errores
app.use(errorHandler);

// Manejo de errores no capturados
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
