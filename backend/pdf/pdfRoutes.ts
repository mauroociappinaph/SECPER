import { Router } from 'express';
import { PdfController } from './controllers/pdfController';
import multer from 'multer';

const router = Router();

// Configuración de multer para manejar archivos PDF
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  },
});

/**
 * POST /api/pdf/extract-text
 * Extrae texto de un archivo PDF usando pdf-parse
 * Body: FormData con archivo PDF
 */
router.post('/extract-text', upload.single('pdf'), PdfController.extractText);

/**
 * POST /api/pdf/analyze
 * Analiza un PDF usando Mistral AI OCR
 * Body: FormData con archivo PDF
 */
router.post('/analyze', upload.single('pdf'), PdfController.analyzePdf);

/**
 * GET /api/pdf/capabilities
 * Obtiene las capacidades del servicio PDF
 */
router.get('/capabilities', PdfController.getCapabilities);

/**
 * GET /api/pdf/health
 * Verifica el estado del módulo PDF
 */
router.get('/health', PdfController.healthCheck);

export default router;
