/**
 * Módulo Health - Punto de entrada principal
 * Maneja health checks y monitoreo del sistema
 */

export { default as healthRoutes } from './healthRoutes';
export { HealthCheckService } from './healthCheckService';
export { registerAllServices, unregisterAllServices } from './serviceRegistry';
