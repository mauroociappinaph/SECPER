/**
 * Clase utilitaria que centraliza validaciones para operaciones de Google Drive.
 * Incluye validaciones para archivos, IDs, nombres, paginación, términos de búsqueda
 * y códigos de autorización OAuth. Provee también reglas de validación globales.
 */
export class DriveValidators {
  // Tamaño máximo de archivo: 100MB (límite de Google Drive API)
  private static readonly MAX_FILE_SIZE = 100 * 1024 * 1024;

  // Tipos MIME permitidos
  private static readonly ALLOWED_MIME_TYPES = ['application/pdf'];

  /**
   * Valida un archivo para subir a Google Drive
   */
  static validateUploadFile(file: {
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

    // Validar que el nombre no esté vacío
    if (file.originalname.trim() === '') {
      return { isValid: false, error: 'El nombre del archivo no puede estar vacío' };
    }

    // Validar longitud del nombre
    if (file.originalname.length > 255) {
      return {
        isValid: false,
        error: 'El nombre del archivo es demasiado largo (máximo 255 caracteres)',
      };
    }

    // Validar caracteres especiales en el nombre
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(file.originalname)) {
      return { isValid: false, error: 'El nombre del archivo contiene caracteres no permitidos' };
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
   * Valida un ID de archivo de Google Drive
   */
  static validateFileId(fileId: string): { isValid: boolean; error?: string } {
    if (!fileId || typeof fileId !== 'string') {
      return { isValid: false, error: 'ID de archivo requerido' };
    }

    if (fileId.trim() === '') {
      return { isValid: false, error: 'ID de archivo no puede estar vacío' };
    }

    // Validar formato básico de ID de Google Drive (alfanumérico, guiones y guiones bajos)
    const driveIdPattern = /^[a-zA-Z0-9_-]+$/;
    if (!driveIdPattern.test(fileId)) {
      return { isValid: false, error: 'Formato de ID de archivo inválido' };
    }

    // Validar longitud típica de IDs de Google Drive
    if (fileId.length < 10 || fileId.length > 100) {
      return { isValid: false, error: 'Longitud de ID de archivo inválida' };
    }

    return { isValid: true };
  }

  /**
   * Valida un ID de carpeta de Google Drive
   */
  static validateFolderId(folderId?: string): { isValid: boolean; error?: string } {
    // Folder ID es opcional
    if (!folderId) {
      return { isValid: true };
    }

    if (typeof folderId !== 'string') {
      return { isValid: false, error: 'ID de carpeta debe ser una cadena de texto' };
    }

    if (folderId.trim() === '') {
      return { isValid: false, error: 'ID de carpeta no puede estar vacío' };
    }

    // Validar formato básico de ID de Google Drive
    const driveIdPattern = /^[a-zA-Z0-9_-]+$/;
    if (!driveIdPattern.test(folderId)) {
      return { isValid: false, error: 'Formato de ID de carpeta inválido' };
    }

    // Validar longitud típica de IDs de Google Drive
    if (folderId.length < 10 || folderId.length > 100) {
      return { isValid: false, error: 'Longitud de ID de carpeta inválida' };
    }

    return { isValid: true };
  }

  /**
   * Valida parámetros de búsqueda
   */
  static validateSearchParams(searchTerm: string): { isValid: boolean; error?: string } {
    if (!searchTerm || typeof searchTerm !== 'string') {
      return { isValid: false, error: 'Término de búsqueda requerido' };
    }

    if (searchTerm.trim() === '') {
      return { isValid: false, error: 'Término de búsqueda no puede estar vacío' };
    }

    if (searchTerm.length < 2) {
      return { isValid: false, error: 'Término de búsqueda debe tener al menos 2 caracteres' };
    }

    if (searchTerm.length > 100) {
      return {
        isValid: false,
        error: 'Término de búsqueda demasiado largo (máximo 100 caracteres)',
      };
    }

    // Validar caracteres especiales que podrían causar problemas en la query
    const dangerousChars = /['"\\]/;
    if (dangerousChars.test(searchTerm)) {
      return { isValid: false, error: 'Término de búsqueda contiene caracteres no permitidos' };
    }

    return { isValid: true };
  }

  /**
   * Valida parámetros de paginación
   */
  static validatePaginationParams(
    pageSize?: number,
    pageToken?: string
  ): { isValid: boolean; error?: string } {
    // Validar pageSize
    if (pageSize !== undefined) {
      if (typeof pageSize !== 'number' || !Number.isInteger(pageSize)) {
        return { isValid: false, error: 'Tamaño de página debe ser un número entero' };
      }

      if (pageSize < 1) {
        return { isValid: false, error: 'Tamaño de página debe ser mayor a 0' };
      }

      if (pageSize > 100) {
        return { isValid: false, error: 'Tamaño de página máximo es 100' };
      }
    }

    // Validar pageToken
    if (pageToken !== undefined) {
      if (typeof pageToken !== 'string') {
        return { isValid: false, error: 'Token de página debe ser una cadena de texto' };
      }

      if (pageToken.trim() === '') {
        return { isValid: false, error: 'Token de página no puede estar vacío' };
      }
    }

    return { isValid: true };
  }

  /**
   * Valida nombre de carpeta
   */
  static validateFolderName(folderName: string): { isValid: boolean; error?: string } {
    if (!folderName || typeof folderName !== 'string') {
      return { isValid: false, error: 'Nombre de carpeta requerido' };
    }

    if (folderName.trim() === '') {
      return { isValid: false, error: 'Nombre de carpeta no puede estar vacío' };
    }

    if (folderName.length > 255) {
      return { isValid: false, error: 'Nombre de carpeta demasiado largo (máximo 255 caracteres)' };
    }

    // Validar caracteres especiales en el nombre
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(folderName)) {
      return { isValid: false, error: 'El nombre de carpeta contiene caracteres no permitidos' };
    }

    return { isValid: true };
  }

  /**
   * Valida código de autorización OAuth
   */
  static validateAuthCode(code: string): { isValid: boolean; error?: string } {
    if (!code || typeof code !== 'string') {
      return { isValid: false, error: 'Código de autorización requerido' };
    }

    if (code.trim() === '') {
      return { isValid: false, error: 'Código de autorización no puede estar vacío' };
    }

    // Validar longitud mínima del código
    if (code.length < 10) {
      return { isValid: false, error: 'Código de autorización inválido' };
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
    maxPageSize: number;
    maxSearchTermLength: number;
    maxFolderNameLength: number;
  } {
    return {
      maxFileSize: this.MAX_FILE_SIZE,
      maxFileSizeMB: this.MAX_FILE_SIZE / (1024 * 1024),
      allowedMimeTypes: [...this.ALLOWED_MIME_TYPES],
      allowedExtensions: ['pdf'],
      maxPageSize: 100,
      maxSearchTermLength: 100,
      maxFolderNameLength: 255,
    };
  }
}
