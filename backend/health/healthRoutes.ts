/**
 * Rutas para health checks del sistema
 */

import { Router, Request, Response } from 'express';
import { healthCheckService } from './healthCheckService';
import { configService } from '../config/configService';

const router = Router();

/**
 * Health check básico del sistema
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const systemHealth = await healthCheckService.checkAllServices();

    const statusCode =
      systemHealth.overall === 'healthy' ? 200 : systemHealth.overall === 'degraded' ? 200 : 503;

    res.status(statusCode).json({
      status: systemHealth.overall,
      timestamp: systemHealth.timestamp,
      uptime: systemHealth.uptime,
      version: systemHealth.version,
      environment: systemHealth.environment,
      services: systemHealth.services.map(service => ({
        name: service.service,
        status: service.status,
        configured: service.configured,
        responseTime: service.responseTime,
        ...(service.error && { error: service.error }),
      })),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Health check detallado del sistema
 */
router.get('/health/detailed', async (_req: Request, res: Response) => {
  try {
    const systemHealth = await healthCheckService.checkAllServices();
    const performanceMetrics = await healthCheckService.getPerformanceMetrics();
    const configSummary = configService.getConfigSummary();

    res.json({
      ...systemHealth,
      performance: performanceMetrics,
      configuration: configSummary,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Health check de un servicio específico
 */
router.get('/health/service/:serviceName', async (req: Request, res: Response) => {
  try {
    const { serviceName } = req.params;
    const serviceHealth = await healthCheckService.checkServiceHealth(serviceName);

    const statusCode =
      serviceHealth.status === 'healthy' ? 200 : serviceHealth.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(serviceHealth);
  } catch (error) {
    res.status(503).json({
      service: req.params.serviceName,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      lastCheck: new Date().toISOString(),
    });
  }
});

/**
 * Resumen rápido del estado del sistema
 */
router.get('/health/summary', async (_req: Request, res: Response) => {
  try {
    const summary = await healthCheckService.getHealthSummary();

    const statusCode =
      summary.status === 'healthy' ? 200 : summary.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(summary);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Métricas de rendimiento de los servicios
 */
router.get('/health/metrics', async (_req: Request, res: Response) => {
  try {
    const metrics = await healthCheckService.getPerformanceMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Limpia el cache de health checks (útil para debugging)
 */
router.post('/health/cache/clear', (_req: Request, res: Response) => {
  try {
    healthCheckService.clearCache();
    res.json({
      message: 'Health check cache cleared successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Obtiene la lista de servicios registrados
 */
router.get('/health/services', (_req: Request, res: Response) => {
  try {
    const services = healthCheckService.getRegisteredServices();
    res.json({
      services,
      count: services.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
