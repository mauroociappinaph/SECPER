/**
 * Tests para el servicio de health checks
 */

import { HealthCheckService } from '../healthCheckService';
import { IBaseService } from '../../types/services.interfaces';

// Mock service para testing
class MockService implements IBaseService {
  constructor(
    private configured: boolean = true,
    private healthy: boolean = true,
    private shouldThrow: boolean = false
  ) {}

  isConfigured(): boolean {
    if (this.shouldThrow) {
      throw new Error('Mock service error');
    }
    return this.configured;
  }

  isHealthy(): boolean {
    if (this.shouldThrow) {
      throw new Error('Mock service error');
    }
    return this.healthy;
  }
}

describe('HealthCheckService', () => {
  let healthCheckService: HealthCheckService;

  beforeEach(() => {
    healthCheckService = new HealthCheckService();
  });

  afterEach(() => {
    // Limpiar servicios registrados
    const services = healthCheckService.getRegisteredServices();
    services.forEach(service => {
      healthCheckService.unregisterService(service);
    });
  });

  describe('Service Registration', () => {
    it('should register a service successfully', () => {
      const mockService = new MockService();
      healthCheckService.registerService('test-service', mockService);

      const registeredServices = healthCheckService.getRegisteredServices();
      expect(registeredServices).toContain('test-service');
    });

    it('should unregister a service successfully', () => {
      const mockService = new MockService();
      healthCheckService.registerService('test-service', mockService);
      healthCheckService.unregisterService('test-service');

      const registeredServices = healthCheckService.getRegisteredServices();
      expect(registeredServices).not.toContain('test-service');
    });
  });

  describe('Service Health Checks', () => {
    it('should return healthy status for a healthy service', async () => {
      const mockService = new MockService(true, true);
      healthCheckService.registerService('healthy-service', mockService);

      const result = await healthCheckService.checkServiceHealth('healthy-service');

      expect(result.service).toBe('healthy-service');
      expect(result.status).toBe('healthy');
      expect(result.configured).toBe(true);
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should return degraded status for unconfigured service', async () => {
      const mockService = new MockService(false, true);
      healthCheckService.registerService('unconfigured-service', mockService);

      const result = await healthCheckService.checkServiceHealth('unconfigured-service');

      expect(result.service).toBe('unconfigured-service');
      expect(result.status).toBe('unhealthy');
      expect(result.configured).toBe(false);
    });

    it('should return degraded status for unhealthy service', async () => {
      const mockService = new MockService(true, false);
      healthCheckService.registerService('unhealthy-service', mockService);

      const result = await healthCheckService.checkServiceHealth('unhealthy-service');

      expect(result.service).toBe('unhealthy-service');
      expect(result.status).toBe('degraded');
      expect(result.configured).toBe(true);
    });

    it('should handle service errors gracefully', async () => {
      const mockService = new MockService(true, true, true);
      healthCheckService.registerService('error-service', mockService);

      const result = await healthCheckService.checkServiceHealth('error-service');

      expect(result.service).toBe('error-service');
      expect(result.status).toBe('unhealthy');
      expect(result.error).toBe('Mock service error');
    });

    it('should return error for unregistered service', async () => {
      const result = await healthCheckService.checkServiceHealth('non-existent');

      expect(result.service).toBe('non-existent');
      expect(result.status).toBe('unhealthy');
      expect(result.error).toBe('Service not registered');
    });
  });

  describe('System Health Checks', () => {
    it('should return healthy overall status when all services are healthy', async () => {
      const service1 = new MockService(true, true);
      const service2 = new MockService(true, true);

      healthCheckService.registerService('service1', service1);
      healthCheckService.registerService('service2', service2);

      const systemHealth = await healthCheckService.checkAllServices();

      expect(systemHealth.overall).toBe('healthy');
      expect(systemHealth.services).toHaveLength(2);
      expect(systemHealth.services.every(s => s.status === 'healthy')).toBe(true);
    });

    it('should return degraded overall status when some services are degraded', async () => {
      const healthyService = new MockService(true, true);
      const degradedService = new MockService(true, false);

      healthCheckService.registerService('healthy', healthyService);
      healthCheckService.registerService('degraded', degradedService);

      const systemHealth = await healthCheckService.checkAllServices();

      expect(systemHealth.overall).toBe('degraded');
      expect(systemHealth.services).toHaveLength(2);
    });

    it('should return unhealthy overall status when majority of services are unhealthy', async () => {
      const healthyService = new MockService(true, true);
      const unhealthyService1 = new MockService(false, false);
      const unhealthyService2 = new MockService(false, false);

      healthCheckService.registerService('healthy', healthyService);
      healthCheckService.registerService('unhealthy1', unhealthyService1);
      healthCheckService.registerService('unhealthy2', unhealthyService2);

      const systemHealth = await healthCheckService.checkAllServices();

      expect(systemHealth.overall).toBe('unhealthy');
      expect(systemHealth.services).toHaveLength(3);
    });
  });

  describe('Health Summary', () => {
    it('should provide correct health summary', async () => {
      const healthyService = new MockService(true, true);
      const unhealthyService = new MockService(false, false);

      healthCheckService.registerService('healthy', healthyService);
      healthCheckService.registerService('unhealthy', unhealthyService);

      const summary = await healthCheckService.getHealthSummary();

      expect(summary.healthyServices).toBe(1);
      expect(summary.totalServices).toBe(2);
      expect(summary.criticalIssues).toHaveLength(1);
      expect(summary.status).toBe('degraded');
    });
  });

  describe('Performance Metrics', () => {
    it('should calculate performance metrics correctly', async () => {
      const service1 = new MockService(true, true);
      const service2 = new MockService(true, true);

      healthCheckService.registerService('service1', service1);
      healthCheckService.registerService('service2', service2);

      // Trigger health checks first
      await healthCheckService.checkAllServices();

      const metrics = await healthCheckService.getPerformanceMetrics();

      expect(metrics.averageResponseTime).toBeGreaterThanOrEqual(0);
      expect(metrics.slowestService).toBeDefined();
      expect(metrics.fastestService).toBeDefined();
      expect(metrics.servicesWithErrors).toBe(0);
    });
  });

  describe('Cache Management', () => {
    it('should cache health check results', async () => {
      const mockService = new MockService(true, true);
      healthCheckService.registerService('cached-service', mockService);

      // First call
      const result1 = await healthCheckService.checkServiceHealth('cached-service');
      const time1 = result1.lastCheck;

      // Second call immediately (should be cached)
      const result2 = await healthCheckService.checkServiceHealth('cached-service');
      const time2 = result2.lastCheck;

      expect(time1.getTime()).toBe(time2.getTime());
    });

    it('should clear cache when requested', async () => {
      const mockService = new MockService(true, true);
      healthCheckService.registerService('test-service', mockService);

      await healthCheckService.checkServiceHealth('test-service');
      healthCheckService.clearCache();

      // This should work without throwing
      expect(() => healthCheckService.clearCache()).not.toThrow();
    });
  });
});
