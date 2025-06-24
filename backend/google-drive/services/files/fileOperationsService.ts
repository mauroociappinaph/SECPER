import { google } from 'googleapis';
import { Readable } from 'stream';
import { GoogleDriveServiceError } from '../../../utils/errors';
import { driveAuthService } from '../auth/authService';

/**
 * Servicio especializado para operaciones de archivos en Google Drive
 * Optimizado para operaciones CRUD eficientes
 */
export class DriveFileOperationsService {
  private drive: any = null;

  /**
   * Inicializa el cliente de Google Drive solo cuando es necesario
   */
  private initializeDrive(): void {
    if (this.drive) return;

    const oauth2Client = driveAuthService.getOAuth2Client();
    this.drive = google.drive({ version: 'v3', auth: oauth2Client });

    console.log('[DriveFileOperationsService] Google Drive client initialized');
  }

  /**
   * Obtiene el cliente de Drive (inicializa si es necesario)
   */
  private getDriveClient(): any {
    this.initializeDrive();

    if (!this.drive) {
      throw new GoogleDriveServiceError('Google Drive no está configurado', 'DRIVE_NOT_CONFIGURED');
    }

    return this.drive;
  }

  /**
   * Sube un archivo PDF a Google Drive
   */
  async uploadPdf(
    fileBuffer: Buffer,
    filename: string,
    folderId?: string
  ): Promise<{ fileId: string; webViewLink: string; webContentLink: string }> {
    try {
      console.log(
        `[${new Date().toISOString()}] [DriveFileOperationsService.uploadPdf] Uploading:`,
        {
          filename,
          size: fileBuffer.length,
          folderId: folderId || 'root',
        }
      );

      const drive = this.getDriveClient();

      const fileMetadata: any = {
        name: filename,
        parents: folderId ? [folderId] : undefined,
      };

      const media = {
        mimeType: 'application/pdf',
        body: Readable.from(fileBuffer),
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id,webViewLink,webContentLink',
      });

      console.log('[DriveFileOperationsService.uploadPdf] File uploaded successfully:', {
        fileId: response.data.id,
      });

      return {
        fileId: response.data.id,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink,
      };
    } catch (error: unknown) {
      console.error('[DriveFileOperationsService.uploadPdf] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GoogleDriveServiceError(
        `Error subiendo archivo a Google Drive: ${errorMessage}`,
        'DRIVE_UPLOAD_ERROR',
        { originalError: errorMessage }
      );
    }
  }

  /**
   * Descarga un archivo PDF desde Google Drive
   */
  async downloadPdf(fileId: string): Promise<Buffer> {
    try {
      console.log(
        `[${new Date().toISOString()}] [DriveFileOperationsService.downloadPdf] Downloading:`,
        {
          fileId,
        }
      );

      const drive = this.getDriveClient();

      const response = await drive.files.get({
        fileId: fileId,
        alt: 'media',
      });

      console.log('[DriveFileOperationsService.downloadPdf] File downloaded successfully');

      return Buffer.from(response.data);
    } catch (error: unknown) {
      console.error('[DriveFileOperationsService.downloadPdf] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GoogleDriveServiceError(
        `Error descargando archivo de Google Drive: ${errorMessage}`,
        'DRIVE_DOWNLOAD_ERROR',
        { originalError: errorMessage }
      );
    }
  }

  /**
   * Elimina un archivo de Google Drive
   */
  async deletePdf(fileId: string): Promise<void> {
    try {
      console.log(
        `[${new Date().toISOString()}] [DriveFileOperationsService.deletePdf] Deleting:`,
        {
          fileId,
        }
      );

      const drive = this.getDriveClient();

      await drive.files.delete({
        fileId: fileId,
      });

      console.log('[DriveFileOperationsService.deletePdf] File deleted successfully');
    } catch (error: unknown) {
      console.error('[DriveFileOperationsService.deletePdf] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GoogleDriveServiceError(
        `Error eliminando archivo de Google Drive: ${errorMessage}`,
        'DRIVE_DELETE_ERROR',
        { originalError: errorMessage }
      );
    }
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
    try {
      const drive = this.getDriveClient();

      const response = await drive.files.get({
        fileId: fileId,
        fields: 'id, name, size, mimeType, createdTime, modifiedTime, webViewLink, webContentLink',
      });

      return response.data;
    } catch (error: unknown) {
      console.error('[DriveFileOperationsService.getFileInfo] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GoogleDriveServiceError(
        `Error obteniendo información del archivo: ${errorMessage}`,
        'DRIVE_GET_INFO_ERROR',
        { originalError: errorMessage }
      );
    }
  }

  /**
   * Crea una carpeta en Google Drive
   */
  async createFolder(name: string, parentFolderId?: string): Promise<string> {
    try {
      console.log(
        `[${new Date().toISOString()}] [DriveFileOperationsService.createFolder] Creating:`,
        {
          name,
          parentFolderId: parentFolderId || 'root',
        }
      );

      const drive = this.getDriveClient();

      const fileMetadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined,
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id',
      });

      console.log('[DriveFileOperationsService.createFolder] Folder created successfully:', {
        folderId: response.data.id,
      });

      return response.data.id;
    } catch (error: unknown) {
      console.error('[DriveFileOperationsService.createFolder] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GoogleDriveServiceError(
        `Error creando carpeta en Google Drive: ${errorMessage}`,
        'DRIVE_CREATE_FOLDER_ERROR',
        { originalError: errorMessage }
      );
    }
  }

  /**
   * Verifica si el servicio está listo para usar
   */
  isHealthy(): boolean {
    return driveAuthService.isHealthy();
  }
}

// Instancia singleton del servicio de operaciones de archivos
export const driveFileOperationsService = new DriveFileOperationsService();
