import { driveAuthService } from './auth/authService';
import { driveFileOperationsService } from './files/fileOperationsService';
import { driveSearchService, DriveFile } from './search/searchService';
import { IGoogleDriveService } from '../../types/services.interfaces';

/**
 * Servicio principal que orquesta la integración con Google Drive.
 * Agrupa operaciones de autenticación, carga/descarga de archivos, búsqueda y estado.
 * Utiliza servicios modulares para mejorar el mantenimiento y la reutilización.
 */
export class GoogleDriveService implements IGoogleDriveService {
  constructor() {
    console.log('[GoogleDriveService] Modular Google Drive service initialized');
  }

  // ==================== AUTENTICACIÓN ====================

  /**
   * Configura el token de acceso para el usuario
   */
  setAccessToken(accessToken: string, refreshToken?: string): void {
    driveAuthService.setAccessToken(accessToken, refreshToken);
  }

  /**
   * Genera URL de autorización para OAuth2
   */
  getAuthUrl(): string {
    return driveAuthService.getAuthUrl();
  }

  /**
   * Intercambia código de autorización por tokens
   */
  async getTokensFromCode(code: string): Promise<{ accessToken: string; refreshToken?: string }> {
    return driveAuthService.getTokensFromCode(code);
  }

  /**
   * Verifica si el token actual es válido
   */
  async isTokenValid(): Promise<boolean> {
    return driveAuthService.isTokenValid();
  }

  /**
   * Refresca el token de acceso si es necesario
   */
  async refreshTokenIfNeeded(): Promise<void> {
    return driveAuthService.refreshTokenIfNeeded();
  }

  // ==================== OPERACIONES DE ARCHIVOS ====================

  /**
   * Sube un archivo PDF a Google Drive
   */
  async uploadPdf(
    fileBuffer: Buffer,
    filename: string,
    folderId?: string
  ): Promise<{ fileId: string; webViewLink: string; webContentLink: string }> {
    return driveFileOperationsService.uploadPdf(fileBuffer, filename, folderId);
  }

  /**
   * Descarga un archivo PDF desde Google Drive
   */
  async downloadPdf(fileId: string): Promise<Buffer> {
    return driveFileOperationsService.downloadPdf(fileId);
  }

  /**
   * Elimina un archivo de Google Drive
   */
  async deletePdf(fileId: string): Promise<void> {
    return driveFileOperationsService.deletePdf(fileId);
  }

  /**
   * Obtiene información de un archivo
   */
  async getFileInfo(fileId: string): Promise<{
    id: string;
    name: string;
    size: string;
    mimeType: string;
    createdTime: string;
    modifiedTime: string;
    webViewLink: string;
    webContentLink: string;
  }> {
    return driveFileOperationsService.getFileInfo(fileId);
  }

  /**
   * Crea una carpeta en Google Drive
   */
  async createFolder(name: string, parentFolderId?: string): Promise<string> {
    return driveFileOperationsService.createFolder(name, parentFolderId);
  }

  // ==================== BÚSQUEDA Y LISTADO ====================

  /**
   * Lista archivos PDF en Google Drive
   */
  async listPdfs(
    folderId?: string,
    pageSize: number = 10,
    pageToken?: string
  ): Promise<{
    files: DriveFile[];
    nextPageToken?: string;
  }> {
    return driveSearchService.listPdfs(folderId, pageSize, pageToken);
  }

  /**
   * Busca archivos PDF en Google Drive
   */
  async searchPdfs(
    searchTerm: string,
    folderId?: string,
    pageSize: number = 10
  ): Promise<{
    files: DriveFile[];
  }> {
    return driveSearchService.searchPdfs(searchTerm, folderId, pageSize);
  }

  /**
   * Búsqueda avanzada con múltiples criterios
   */
  async advancedSearch(criteria: {
    searchTerm?: string;
    folderId?: string;
    dateFrom?: string;
    dateTo?: string;
    minSize?: number;
    maxSize?: number;
    pageSize?: number;
  }): Promise<{
    files: DriveFile[];
  }> {
    return driveSearchService.advancedSearch(criteria);
  }

  /**
   * Obtiene estadísticas de archivos en una carpeta
   */
  async getFolderStats(folderId?: string): Promise<{
    totalFiles: number;
    totalSize: number;
    lastModified?: string;
  }> {
    return driveSearchService.getFolderStats(folderId);
  }

  // ==================== ESTADO Y CAPACIDADES ====================

  /**
   * Verifica si el servicio está configurado correctamente
   */
  isHealthy(): boolean {
    return (
      driveAuthService.isHealthy() &&
      driveFileOperationsService.isHealthy() &&
      driveSearchService.isHealthy()
    );
  }

  /**
   * Verifica si las credenciales están configuradas
   */
  isConfigured(): boolean {
    return driveAuthService.isConfigured();
  }

  /**
   * Obtiene las capacidades del servicio
   */
  getCapabilities(): {
    auth: boolean;
    fileOperations: boolean;
    search: boolean;
    quotaUsed?: number;
    quotaLimit?: number;
  } {
    return {
      auth: driveAuthService.isHealthy(),
      fileOperations: driveFileOperationsService.isHealthy(),
      search: driveSearchService.isHealthy(),
      quotaUsed: undefined, // Se podría implementar en el futuro
      quotaLimit: undefined, // Se podría implementar en el futuro
    };
  }
}

// Instancia singleton del servicio principal
export const googleDriveService = new GoogleDriveService();
