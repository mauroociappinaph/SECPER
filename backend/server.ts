import express from 'express';
import cors from 'cors';
import routes from './routes/routes';
import healthRoutes from './health/healthRoutes';
import { requestLogger, notFoundHandler, errorHandler } from './middleware/errorHandler';
import { configService } from './config/configService';
import { registerAllServices } from './health/serviceRegistry';

const app = express();

// Inicializar configuracion y servicios
console.log('[Server] Initializing configuration and services...');
const config = configService.getConfig();
registerAllServices();

// Validar configuracion critica
const configValidation = configService.validateCriticalConfig();
if (!configValidation.isValid) {
  console.error('[Server] Critical configuration missing:', configValidation.missingConfigs);
  process.exit(1);
}

console.log('[Server] Configuration summary:', configService.getConfigSummary());

// Configuracion de CORS
app.use(
  cors({
    origin: config.server.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Middleware para logging de requests
app.use(requestLogger);

// Middleware para parsear JSON
app.use(express.json({ limit: `${config.server.maxFileSize}b` }));
app.use(express.urlencoded({ extended: true, limit: `${config.server.maxFileSize}b` }));

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
      health: '/health',
    },
    status: 'healthy',
    configuration: configService.getConfigSummary(),
  });
});

// Rutas de health checks
app.use(healthRoutes);

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

// Iniciar el servidor solo si este archivo se ejecuta directamente
if (require.main === module) {
  const PORT = config.server.port || 3000;

  app.listen(PORT, () => {
    console.log(`[Server] Servidor iniciado exitosamente`);
    console.log(`[Server] Escuchando en puerto ${PORT}`);
    console.log(`[Server] URL: http://localhost:${PORT}`);
    console.log(`[Server] Health check: http://localhost:${PORT}/health`);
    console.log(`[Server] API endpoints disponibles:`);
    console.log(`   - Chat: http://localhost:${PORT}/api/chat`);
    console.log(`   - PDF: http://localhost:${PORT}/api/pdf`);
    console.log(`   - Drive: http://localhost:${PORT}/api/drive`);
    console.log(`   - Calendar: http://localhost:${PORT}/api/calendario`);
    console.log(`[Server] Servidor listo para recibir peticiones`);
  });

  // Manejo graceful de cierre del servidor
  process.on('SIGTERM', () => {
    console.log('[Server] Recibida señal SIGTERM, cerrando servidor...');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('[Server] Recibida señal SIGINT, cerrando servidor...');
    process.exit(0);
  });
}

export default app;
