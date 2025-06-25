/**
 * Registro centralizado de servicios para health checks
 */

import { healthCheckService } from './healthCheckService';
import { chatService } from '../chat/services/chatService';
import { pdfService } from '../pdf/services/pdfService';
import { calendarService } from '../calendar/services/calendarService';
import { googleDriveService } from '../google-drive/services/driveService';

/**
 * Registra todos los servicios en el sistema de health checks
 */
export function registerAllServices(): void {
  console.log('[ServiceRegistry] Registering services for health checks...');

  // Registrar servicio de chat
  healthCheckService.registerService('chat', chatService);

  // Registrar servicio de PDF
  healthCheckService.registerService('pdf', pdfService);

  // Registrar servicio de calendario
  healthCheckService.registerService('calendar', calendarService);

  // Registrar servicio de Google Drive
  healthCheckService.registerService('googleDrive', googleDriveService);

  console.log('[ServiceRegistry] All services registered successfully');

  // Mostrar resumen de servicios registrados
  const registeredServices = healthCheckService.getRegisteredServices();
  console.log(`[ServiceRegistry] Registered services: ${registeredServices.join(', ')}`);
}

/**
 * Desregistra todos los servicios (útil para testing)
 */
export function unregisterAllServices(): void {
  console.log('[ServiceRegistry] Unregistering all services...');

  const services = healthCheckService.getRegisteredServices();
  services.forEach(serviceName => {
    healthCheckService.unregisterService(serviceName);
  });

  console.log('[ServiceRegistry] All services unregistered');
}
