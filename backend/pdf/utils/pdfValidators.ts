/**
 * Utilidades para validar archivos PDF
 */
export class PdfValidators {
  // Tamaño máximo de archivo: 10MB
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

  // Tipos MIME permitidos
  private static readonly ALLOWED_MIME_TYPES = ['application/pdf'];

  /**
   * Valida un archivo PDF
   */
  static validatePdfFile(file: {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
  }): { isValid: boolean; error?: string } {
    // Validar que el archivo existe
    if (!file) {
      return { isValid: false, error: 'No se proporcionó ningún archivo' };
    }

    // Validar nombre del archivo
    if (!file.originalname || typeof file.originalname !== 'string') {
      return { isValid: false, error: 'Nombre de archivo inválido' };
    }

    // Validar extensión del archivo
    const fileExtension = file.originalname.toLowerCase().split('.').pop();
    if (fileExtension !== 'pdf') {
      return { isValid: false, error: 'Solo se permiten archivos PDF (.pdf)' };
    }

    // Validar tipo MIME
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return {
        isValid: false,
        error: `Tipo de archivo no permitido: ${file.mimetype}. Solo se permiten archivos PDF.`,
      };
    }

    // Validar tamaño del archivo
    if (file.size > this.MAX_FILE_SIZE) {
      const maxSizeMB = this.MAX_FILE_SIZE / (1024 * 1024);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return {
        isValid: false,
        error: `Archivo demasiado grande: ${fileSizeMB}MB. Tamaño máximo permitido: ${maxSizeMB}MB`,
      };
    }

    // Validar que el archivo no esté vacío
    if (file.size === 0) {
      return { isValid: false, error: 'El archivo está vacío' };
    }

    // Validar buffer
    if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
      return { isValid: false, error: 'Buffer de archivo inválido' };
    }

    // Validar que el buffer no esté vacío
    if (file.buffer.length === 0) {
      return { isValid: false, error: 'El contenido del archivo está vacío' };
    }

    // Validar firma del archivo PDF (magic bytes)
    const pdfSignature = file.buffer.slice(0, 4);
    if (pdfSignature.toString() !== '%PDF') {
      return {
        isValid: false,
        error: 'El archivo no es un PDF válido (firma de archivo incorrecta)',
      };
    }

    return { isValid: true };
  }

  /**
   * Valida parámetros de configuración para procesamiento de PDF
   */
  static validateProcessingOptions(options: {
    extractText?: boolean;
    useOcr?: boolean;
    language?: string;
  }): { isValid: boolean; error?: string } {
    if (options.language && typeof options.language !== 'string') {
      return { isValid: false, error: 'El idioma debe ser una cadena de texto' };
    }

    if (options.language && options.language.length !== 2) {
      return {
        isValid: false,
        error: 'El código de idioma debe tener 2 caracteres (ej: "es", "en")',
      };
    }

    return { isValid: true };
  }

  /**
   * Obtiene información sobre las limitaciones del servicio
   */
  static getValidationRules(): {
    maxFileSize: number;
    maxFileSizeMB: number;
    allowedMimeTypes: string[];
    allowedExtensions: string[];
  } {
    return {
      maxFileSize: this.MAX_FILE_SIZE,
      maxFileSizeMB: this.MAX_FILE_SIZE / (1024 * 1024),
      allowedMimeTypes: [...this.ALLOWED_MIME_TYPES],
      allowedExtensions: ['pdf'],
    };
  }
}
