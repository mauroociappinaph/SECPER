/**
 * Módulo PDF - Punto de entrada principal
 * Maneja operaciones de procesamiento y análisis de archivos PDF
 */

export { default as pdfRoutes } from './pdfRoutes';
export { PdfController } from './controllers/pdfController';
export { PdfService, pdfService } from './services/pdfService';
export { PdfValidators } from './utils/pdfValidators';
