import { Request, Response } from 'express';
import { MulterRequest } from '../../types';
import { pdfService } from '../services/pdfService';
import { PdfValidators } from '../utils/pdfValidators';

/**
 * Controlador para operaciones relacionadas con PDFs
 */
export class PdfController {
  /**
   * Controlador para procesar un archivo PDF subido mediante una solicitud HTTP
   */
  static async readPdf(req: Request, res: Response): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] [PdfController.readPdf] Started`);

      const mReq = req as MulterRequest;

      // Validar que se envió un archivo
      if (!mReq.file) {
        console.warn(`[PdfController.readPdf] No file provided`);
        res.status(400).json({
          error: 'No se envió ningún archivo PDF.',
          code: 'NO_FILE_PROVIDED',
        });
        return;
      }

      // Validar el archivo
      const validation = PdfValidators.validatePdfFile(mReq.file);
      if (!validation.isValid) {
        console.warn(`[PdfController.readPdf] File validation failed:`, validation.error);
        res.status(400).json({
          error: validation.error,
          code: 'FILE_VALIDATION_ERROR',
        });
        return;
      }

      console.log(`[PdfController.readPdf] Processing PDF:`, {
        filename: mReq.file.originalname,
        size: mReq.file.size,
        mimetype: mReq.file.mimetype,
      });

      const result = await pdfService.analyzePdfWithMistral(mReq.file.buffer);

      console.log(`[PdfController.readPdf] PDF processed successfully`);
      res.status(200).json({
        resultado: result,
        metadata: {
          filename: mReq.file.originalname,
          size: mReq.file.size,
          processedAt: new Date().toISOString(),
        },
      });
    } catch (error: unknown) {
      console.error(`[PdfController.readPdf] Error:`, error);

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        error: errorMessage || 'Error al leer el PDF.',
        code: 'PDF_PROCESSING_ERROR',
      });
    }
  }

  /**
   * Extrae texto de un PDF usando pdf-parse
   */
  static async extractText(req: Request, res: Response): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] [PdfController.extractText] Started`);

      const mReq = req as MulterRequest;

      // Validar que se envió un archivo
      if (!mReq.file) {
        console.warn(`[PdfController.extractText] No file provided`);
        res.status(400).json({
          error: 'No se envió ningún archivo PDF.',
          code: 'NO_FILE_PROVIDED',
        });
        return;
      }

      // Validar el archivo
      const validation = PdfValidators.validatePdfFile(mReq.file);
      if (!validation.isValid) {
        console.warn(`[PdfController.extractText] File validation failed:`, validation.error);
        res.status(400).json({
          error: validation.error,
          code: 'FILE_VALIDATION_ERROR',
        });
        return;
      }

      console.log(`[PdfController.extractText] Processing PDF:`, {
        filename: mReq.file.originalname,
        size: mReq.file.size,
        mimetype: mReq.file.mimetype,
      });

      const text = await pdfService.readPdfText(mReq.file.buffer);

      console.log(`[PdfController.extractText] Text extracted successfully`);
      res.status(200).json({
        text: text,
        metadata: {
          filename: mReq.file.originalname,
          size: mReq.file.size,
          textLength: text.length,
          processedAt: new Date().toISOString(),
        },
      });
    } catch (error: unknown) {
      console.error(`[PdfController.extractText] Error:`, error);

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        error: errorMessage || 'Error al extraer texto del PDF.',
        code: 'PDF_TEXT_EXTRACTION_ERROR',
      });
    }
  }

  /**
   * Analiza un PDF usando Mistral AI OCR
   */
  static async analyzePdf(req: Request, res: Response): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] [PdfController.analyzePdf] Started`);

      const mReq = req as MulterRequest;

      // Validar que se envió un archivo
      if (!mReq.file) {
        console.warn(`[PdfController.analyzePdf] No file provided`);
        res.status(400).json({
          error: 'No se envió ningún archivo PDF.',
          code: 'NO_FILE_PROVIDED',
        });
        return;
      }

      // Validar el archivo
      const validation = PdfValidators.validatePdfFile(mReq.file);
      if (!validation.isValid) {
        console.warn(`[PdfController.analyzePdf] File validation failed:`, validation.error);
        res.status(400).json({
          error: validation.error,
          code: 'FILE_VALIDATION_ERROR',
        });
        return;
      }

      console.log(`[PdfController.analyzePdf] Processing PDF:`, {
        filename: mReq.file.originalname,
        size: mReq.file.size,
        mimetype: mReq.file.mimetype,
      });

      const result = await pdfService.analyzePdfWithMistral(mReq.file.buffer);

      console.log(`[PdfController.analyzePdf] PDF analyzed successfully`);
      res.status(200).json({
        result: result,
        metadata: {
          filename: mReq.file.originalname,
          size: mReq.file.size,
          processedAt: new Date().toISOString(),
        },
      });
    } catch (error: unknown) {
      console.error(`[PdfController.analyzePdf] Error:`, error);

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        error: errorMessage || 'Error al analizar el PDF.',
        code: 'PDF_ANALYSIS_ERROR',
      });
    }
  }

  /**
   * Obtiene información sobre las capacidades del servicio PDF
   */
  static async getCapabilities(req: Request, res: Response): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] [PdfController.getCapabilities] Started`);

      const capabilities = pdfService.getCapabilities();

      res.status(200).json(capabilities);
    } catch (error: unknown) {
      console.error(`[PdfController.getCapabilities] Error:`, error);

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        error: errorMessage,
        code: 'CAPABILITIES_ERROR',
      });
    }
  }

  /**
   * Verifica el estado del módulo PDF
   */
  static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] [PdfController.healthCheck] Started`);

      const isHealthy = pdfService.isHealthy();
      const capabilities = pdfService.getCapabilities();

      res.status(200).json({
        status: isHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        capabilities: capabilities,
        services: {
          textExtraction: true,
          mistralOcr: isHealthy,
        },
      });
    } catch (error: unknown) {
      console.error(`[PdfController.healthCheck] Error:`, error);

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        status: 'unhealthy',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
