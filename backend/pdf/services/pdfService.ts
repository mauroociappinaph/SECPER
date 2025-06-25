import pdfParse from 'pdf-parse';
import { Mistral } from '@mistralai/mistralai';
import { PDFServiceError } from '../../utils/errors';
import { IPdfService } from '../../types/services.interfaces';

/**
 * Servicio para manejar operaciones con PDFs
 */
export class PdfService implements IPdfService {
  private mistralClient: Mistral | null = null;

  constructor() {
    this.initializeMistralClient();
  }

  /**
   * Inicializa el cliente de Mistral
   */
  private initializeMistralClient(): void {
    const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
    if (MISTRAL_API_KEY) {
      this.mistralClient = new Mistral({ apiKey: MISTRAL_API_KEY });
      console.log(`[PdfService] Mistral client initialized successfully`);
    } else {
      console.warn(`[PdfService] MISTRAL_API_KEY not found, OCR functionality will be limited`);
    }
  }

  /**
   * Lee texto de un PDF usando pdf-parse
   */
  async readPdfText(buffer: Buffer): Promise<string> {
    try {
      console.log(`[${new Date().toISOString()}] [PdfService.readPdfText] Processing PDF buffer:`, {
        size: buffer.length,
      });

      const data = await pdfParse(buffer);

      console.log(`[PdfService.readPdfText] Text extracted successfully:`, {
        textLength: data.text.length,
        pages: data.numpages,
      });

      return data.text;
    } catch (error: unknown) {
      console.error(`[PdfService.readPdfText] Error:`, error);

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new PDFServiceError(
        `Error al extraer texto del PDF: ${errorMessage}`,
        'PDF_TEXT_EXTRACTION_ERROR',
        { originalError: errorMessage }
      );
    }
  }

  /**
   * Analiza un PDF usando Mistral AI OCR
   */
  async analyzePdfWithMistral(buffer: Buffer): Promise<unknown> {
    try {
      console.log(
        `[${new Date().toISOString()}] [PdfService.analyzePdfWithMistral] Starting analysis:`,
        {
          bufferSize: buffer.length,
          mistralAvailable: !!this.mistralClient,
        }
      );

      if (!this.mistralClient) {
        throw new PDFServiceError(
          'MISTRAL_API_KEY no definida en variables de entorno',
          'MISTRAL_NOT_CONFIGURED'
        );
      }

      const base64Pdf = buffer.toString('base64');

      console.log(`[PdfService.analyzePdfWithMistral] Sending to Mistral OCR:`, {
        base64Length: base64Pdf.length,
      });

      const ocrResponse = await this.mistralClient.ocr.process({
        model: 'mistral-ocr-latest',
        document: {
          type: 'document_url',
          documentUrl: 'data:application/pdf;base64,' + base64Pdf,
        },
        includeImageBase64: false,
      });

      console.log(`[PdfService.analyzePdfWithMistral] OCR completed successfully`);
      return ocrResponse;
    } catch (error: unknown) {
      console.error(`[PdfService.analyzePdfWithMistral] Error:`, error);

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new PDFServiceError(
        `Error al analizar PDF con Mistral: ${errorMessage}`,
        'MISTRAL_OCR_ERROR',
        { originalError: errorMessage }
      );
    }
  }

  /**
   * Obtiene las capacidades del servicio
   */
  getCapabilities(): {
    textExtraction: boolean;
    mistralOcr: boolean;
    supportedFormats: string[];
    maxFileSize: string;
  } {
    return {
      textExtraction: true,
      mistralOcr: !!this.mistralClient,
      supportedFormats: ['application/pdf'],
      maxFileSize: '10MB',
    };
  }

  /**
   * Verifica si el servicio est‡ configurado correctamente
   */
  isConfigured(): boolean {
    return !!process.env.MISTRAL_API_KEY;
  }

  /**
   * Verifica si el servicio est‡ funcionando correctamente
   */
  isHealthy(): boolean {
    return !!this.mistralClient;
  }
}

// Instancia singleton del servicio
export const pdfService = new PdfService();
