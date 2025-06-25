/**
 * Servicio centralizado de health checks para todos los módulos de la aplicación
 */

import { IBaseService } from '../types/services.interfaces';

export interface HealthCheckMetadata {
  configuration?: Record<string, unknown>;
  capabilities?: Record<string, unknown>;
  apiKeyConfigured?: boolean;
  zapierUrlConfigured?: boolean;
  credentialsConfigured?: boolean;
  metadataError?: string;
  // Agrega aquí otros campos esperados
}

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  configured: boolean;
  lastCheck: Date;
  responseTime?: number;
  error?: string;
  metadata?: HealthCheckMetadata;
}

export interface SystemHealthStatus {
  overall: 'healthy' | 'unhealthy' | 'degraded';
  services: HealthCheckResult[];
  timestamp: Date;
  uptime: number;
  version: string;
  environment: string;
}

/**
 * Servicio centralizado para verificar el estado de salud de todos los servicios
 */
export class HealthCheckService {
  private registeredServices: Map<string, IBaseService> = new Map();
  private healthCache: Map<string, HealthCheckResult> = new Map();
  private cacheTimeout = 30000; // 30 segundos

  /**
   * Registra un servicio para health checks
   */
  registerService(name: string, service: IBaseService): void {
    this.registeredServices.set(name, service);
    console.log(`[HealthCheckService] Service '${name}' registered for health checks`);
  }

  /**
   * Desregistra un servicio
   */
  unregisterService(name: string): void {
    this.registeredServices.delete(name);
    this.healthCache.delete(name);
    console.log(`[HealthCheckService] Service '${name}' unregistered from health checks`);
  }

  /**
   * Verifica el estado de un servicio específico
   */
  async checkServiceHealth(serviceName: string): Promise<HealthCheckResult> {
    const service = this.registeredServices.get(serviceName);

    if (!service) {
      return {
        service: serviceName,
        status: 'unhealthy',
        configured: false,
        lastCheck: new Date(),
        error: 'Service not registered',
      };
    }

    // Verificar cache
    const cached = this.healthCache.get(serviceName);
    if (cached && Date.now() - cached.lastCheck.getTime() < this.cacheTimeout) {
      return cached;
    }

    const startTime = Date.now();
    let result: HealthCheckResult;

    try {
      const isConfigured = service.isConfigured();
      const isHealthy = service.isHealthy();
      const responseTime = Date.now() - startTime;

      let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

      if (!isConfigured) {
        status = 'unhealthy';
      } else if (!isHealthy) {
        status = 'degraded';
      }

      result = {
        service: serviceName,
        status,
        configured: isConfigured,
        lastCheck: new Date(),
        responseTime,
        metadata: this.getServiceMetadata(serviceName, service),
      };
    } catch (error) {
      result = {
        service: serviceName,
        status: 'unhealthy',
        configured: false,
        lastCheck: new Date(),
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Actualizar cache
    this.healthCache.set(serviceName, result);
    return result;
  }

  /**
   * Verifica el estado de todos los servicios registrados
   */
  async checkAllServices(): Promise<SystemHealthStatus> {
    const serviceChecks = await Promise.all(
      Array.from(this.registeredServices.keys()).map(serviceName =>
        this.checkServiceHealth(serviceName)
      )
    );

    // Determinar estado general del sistema
    const overall = this.determineOverallHealth(serviceChecks);

    return {
      overall,
      services: serviceChecks,
      timestamp: new Date(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  /**
   * Obtiene un resumen rápido del estado del sistema
   */
  async getHealthSummary(): Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded';
    healthyServices: number;
    totalServices: number;
    criticalIssues: string[];
  }> {
    const systemHealth = await this.checkAllServices();

    const healthyServices = systemHealth.services.filter(s => s.status === 'healthy').length;
    const criticalIssues = systemHealth.services
      .filter(s => s.status === 'unhealthy')
      .map(s => `${s.service}: ${s.error || 'Service unhealthy'}`);

    return {
      status: systemHealth.overall,
      healthyServices,
      totalServices: systemHealth.services.length,
      criticalIssues,
    };
  }

  /**
   * Verifica servicios críticos específicos
   */
  async checkCriticalServices(criticalServices: string[]): Promise<boolean> {
    const checks = await Promise.all(
      criticalServices.map(serviceName => this.checkServiceHealth(serviceName))
    );

    return checks.every(check => check.status === 'healthy');
  }

  /**
   * Obtiene métricas de rendimiento de los servicios
   */
  async getPerformanceMetrics(): Promise<{
    averageResponseTime: number;
    slowestService: string | null;
    fastestService: string | null;
    servicesWithErrors: number;
  }> {
    const systemHealth = await this.checkAllServices();

    const responseTimes = systemHealth.services
      .filter(s => s.responseTime !== undefined)
      .map(s => ({ name: s.service, time: s.responseTime! }));

    if (responseTimes.length === 0) {
      return {
        averageResponseTime: 0,
        slowestService: null,
        fastestService: null,
        servicesWithErrors: 0,
      };
    }

    const averageResponseTime =
      responseTimes.reduce((sum, s) => sum + s.time, 0) / responseTimes.length;
    const slowestService = responseTimes.reduce((prev, current) =>
      prev.time > current.time ? prev : current
    ).name;
    const fastestService = responseTimes.reduce((prev, current) =>
      prev.time < current.time ? prev : current
    ).name;
    const servicesWithErrors = systemHealth.services.filter(s => s.error).length;

    return {
      averageResponseTime: Math.round(averageResponseTime),
      slowestService,
      fastestService,
      servicesWithErrors,
    };
  }

  /**
   * Limpia el cache de health checks
   */
  clearCache(): void {
    this.healthCache.clear();
    console.log('[HealthCheckService] Health check cache cleared');
  }

  /**
   * Configura el timeout del cache
   */
  setCacheTimeout(timeoutMs: number): void {
    this.cacheTimeout = timeoutMs;
    console.log(`[HealthCheckService] Cache timeout set to ${timeoutMs}ms`);
  }

  /**
   * Obtiene la lista de servicios registrados
   */
  getRegisteredServices(): string[] {
    return Array.from(this.registeredServices.keys());
  }

  /**
   * Determina el estado general del sistema basado en los checks individuales
   */
  private determineOverallHealth(
    serviceChecks: HealthCheckResult[]
  ): 'healthy' | 'unhealthy' | 'degraded' {
    if (serviceChecks.length === 0) {
      return 'unhealthy';
    }

    const unhealthyCount = serviceChecks.filter(s => s.status === 'unhealthy').length;
    const degradedCount = serviceChecks.filter(s => s.status === 'degraded').length;

    // Si más del 50% de servicios están unhealthy, el sistema está unhealthy
    if (unhealthyCount > serviceChecks.length * 0.5) {
      return 'unhealthy';
    }

    // Si hay servicios unhealthy o degraded, el sistema está degraded
    if (unhealthyCount > 0 || degradedCount > 0) {
      return 'degraded';
    }

    return 'healthy';
  }

  /**
   * Obtiene metadatos específicos del servicio
   */
  private getServiceMetadata(serviceName: string, service: IBaseService): Record<string, any> {
    const metadata: Record<string, any> = {};

    try {
      // Intentar obtener configuración si el servicio la soporta
      if ('getConfiguration' in service && typeof service.getConfiguration === 'function') {
        metadata.configuration = (service as any).getConfiguration();
      }

      // Intentar obtener capacidades si el servicio las soporta
      if ('getCapabilities' in service && typeof service.getCapabilities === 'function') {
        metadata.capabilities = (service as any).getCapabilities();
      }

      // Metadatos específicos por tipo de servicio
      switch (serviceName) {
        case 'mistral':
          metadata.apiKeyConfigured = !!process.env.MISTRAL_API_KEY;
          break;
        case 'calendar':
          metadata.zapierUrlConfigured = !!process.env.ZAPIER_MCP_URL;
          break;
        case 'googleDrive':
          metadata.credentialsConfigured = !!(
            process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
          );
          break;
      }
    } catch (error) {
      metadata.metadataError = error instanceof Error ? error.message : 'Unknown error';
    }

    return metadata;
  }
}

// Instancia singleton del servicio de health checks
export const healthCheckService = new HealthCheckService();
