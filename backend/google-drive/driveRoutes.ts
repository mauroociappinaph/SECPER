import { Router } from 'express';
import { DriveController } from './controllers/driveController';
import multer from 'multer';

const router = Router();

// Configuración de multer para manejar archivos PDF
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB (límite de Google Drive API)
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  },
});

// ==================== AUTENTICACIÓN ====================

/**
 * GET /api/drive/auth-url
 * Obtiene la URL de autorización de Google OAuth
 */
router.get('/auth-url', DriveController.getAuthUrl);

/**
 * POST /api/drive/auth-callback
 * Maneja el callback de autorización OAuth
 * Body: { code: string }
 */
router.post('/auth-callback', DriveController.handleAuthCallback);

// ==================== GESTIÓN DE ARCHIVOS ====================

/**
 * POST /api/drive/upload
 * Sube un archivo PDF a Google Drive
 * Body: FormData con archivo PDF y opcionalmente folderId
 */
router.post('/upload', upload.single('pdf'), DriveController.uploadPdf);

/**
 * GET /api/drive/download/:fileId
 * Descarga un archivo PDF desde Google Drive
 */
router.get('/download/:fileId', DriveController.downloadPdf);

/**
 * DELETE /api/drive/delete/:fileId
 * Elimina un archivo PDF de Google Drive
 */
router.delete('/delete/:fileId', DriveController.deletePdf);

/**
 * GET /api/drive/info/:fileId
 * Obtiene información de un archivo
 */
router.get('/info/:fileId', DriveController.getFileInfo);

// ==================== BÚSQUEDA Y LISTADO ====================

/**
 * GET /api/drive/list
 * Lista archivos PDF en Google Drive
 * Query params: folderId?, pageSize?, pageToken?
 */
router.get('/list', DriveController.listPdfs);

/**
 * GET /api/drive/search
 * Busca archivos PDF en Google Drive
 * Query params: q (search term), folderId?, pageSize?
 */
router.get('/search', DriveController.searchPdfs);

// ==================== GESTIÓN DE CARPETAS ====================

/**
 * POST /api/drive/create-folder
 * Crea una carpeta en Google Drive
 * Body: { name: string, parentFolderId?: string }
 */
router.post('/create-folder', DriveController.createFolder);

// ==================== INFORMACIÓN DEL SERVICIO ====================

/**
 * GET /api/drive/capabilities
 * Obtiene las capacidades del servicio Google Drive
 */
router.get('/capabilities', DriveController.getCapabilities);

/**
 * GET /api/drive/health
 * Verifica el estado del módulo Google Drive
 */
router.get('/health', DriveController.healthCheck);

export default router;
