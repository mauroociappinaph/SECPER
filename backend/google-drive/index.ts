/**
 * Punto de entrada centralizado del módulo Google Drive.
 * Reexporta servicios, controladores, validadores y rutas
 * para facilitar la importación desde otras partes del backend.
 */

/**
 * Módulo Google Drive Modularizado
 * Exportaciones centralizadas para el módulo de integración con Google Drive
 */

// Servicios principales
export { GoogleDriveService, googleDriveService } from './services/driveService';

// Servicios especializados
export { DriveAuthService, driveAuthService } from './services/auth/authService';
export {
  DriveFileOperationsService,
  driveFileOperationsService,
} from './services/files/fileOperationsService';
export { DriveSearchService, driveSearchService, DriveFile } from './services/search/searchService';

// Controladores
export { DriveController } from './controllers/driveController';

// Validadores
export { DriveValidators } from './utils/driveValidators';

// Rutas
export { default as driveRoutes } from './driveRoutes';
