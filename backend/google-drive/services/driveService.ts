import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Readable } from 'stream';
import { GoogleDriveServiceError } from '../../utils/errors';

/**
 * Servicio para manejar operaciones con Google Drive
 */
export class GoogleDriveService {
  private oauth2Client: OAuth2Client | null = null;
  private drive: any;

  constructor() {
    this.initializeAuth();
  }

  /**
   * Inicializa la autenticación con Google Drive
   */
  private initializeAuth(): void {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      console.warn('[GoogleDriveService] Google Drive credentials not configured');
      return;
    }

    this.oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });

    console.log('[GoogleDriveService] Google Drive client initialized');
  }

  /**
   * Configura el token de acceso para el usuario
   */
  setAccessToken(accessToken: string, refreshToken?: string): void {
    if (!this.oauth2Client) {
      throw new GoogleDriveServiceError('Google Drive no está configurado', 'DRIVE_NOT_CONFIGURED');
    }

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    console.log('[GoogleDriveService] Access token configured');
  }

  /**
   * Genera URL de autorización para OAuth2
   */
  getAuthUrl(): string {
    if (!this.oauth2Client) {
      throw new GoogleDriveServiceError('Google Drive no está configurado', 'DRIVE_NOT_CONFIGURED');
    }

    const scopes = [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.readonly',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  /**
   * Intercambia código de autorización por tokens
   */
  async getTokensFromCode(code: string): Promise<{ accessToken: string; refreshToken?: string }> {
    try {
      if (!this.oauth2Client) {
        throw new GoogleDriveServiceError(
          'Google Drive no está configurado',
          'DRIVE_NOT_CONFIGURED'
        );
      }

      const { tokens } = await this.oauth2Client.getToken(code);

      return {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token || undefined,
      };
    } catch (error: unknown) {
      console.error('[GoogleDriveService] Error getting tokens:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GoogleDriveServiceError(
        `Error obteniendo tokens: ${errorMessage}`,
        'TOKEN_EXCHANGE_ERROR',
        { originalError: errorMessage }
      );
    }
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
      console.log(`[${new Date().toISOString()}] [GoogleDriveService.uploadPdf] Uploading:`, {
        filename,
        size: fileBuffer.length,
        folderId: folderId || 'root',
      });

      if (!this.drive) {
        throw new GoogleDriveServiceError(
          'Google Drive no está configurado',
          'DRIVE_NOT_CONFIGURED'
        );
      }

      const fileMetadata: any = {
        name: filename,
        parents: folderId ? [folderId] : undefined,
      };

      const media = {
        mimeType: 'application/pdf',
        body: Readable.from(fileBuffer),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id,webViewLink,webContentLink',
      });

      console.log('[GoogleDriveService.uploadPdf] File uploaded successfully:', {
        fileId: response.data.id,
      });

      return {
        fileId: response.data.id,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink,
      };
    } catch (error: unknown) {
      console.error('[GoogleDriveService.uploadPdf] Error:', error);
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
      console.log(`[${new Date().toISOString()}] [GoogleDriveService.downloadPdf] Downloading:`, {
        fileId,
      });

      if (!this.drive) {
        throw new GoogleDriveServiceError(
          'Google Drive no está configurado',
          'DRIVE_NOT_CONFIGURED'
        );
      }

      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media',
      });

      console.log('[GoogleDriveService.downloadPdf] File downloaded successfully');

      return Buffer.from(response.data);
    } catch (error: unknown) {
      console.error('[GoogleDriveService.downloadPdf] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GoogleDriveServiceError(
        `Error descargando archivo de Google Drive: ${errorMessage}`,
        'DRIVE_DOWNLOAD_ERROR',
        { originalError: errorMessage }
      );
    }
  }

  /**
   * Lista archivos PDF en Google Drive
   */
  async listPdfs(
    folderId?: string,
    pageSize: number = 10,
    pageToken?: string
  ): Promise<{
    files: Array<{
      id: string;
      name: string;
      size: string;
      createdTime: string;
      modifiedTime: string;
      webViewLink: string;
    }>;
    nextPageToken?: string;
  }> {
    try {
      console.log(`[${new Date().toISOString()}] [GoogleDriveService.listPdfs] Listing PDFs:`, {
        folderId: folderId || 'root',
        pageSize,
      });

      if (!this.drive) {
        throw new GoogleDriveServiceError(
          'Google Drive no está configurado',
          'DRIVE_NOT_CONFIGURED'
        );
      }

      let query = "mimeType='application/pdf' and trashed=false";
      if (folderId) {
        query += ` and '${folderId}' in parents`;
      }

      const response = await this.drive.files.list({
        q: query,
        pageSize: pageSize,
        pageToken: pageToken,
        fields: 'nextPageToken, files(id, name, size, createdTime, modifiedTime, webViewLink)',
        orderBy: 'modifiedTime desc',
      });

      console.log('[GoogleDriveService.listPdfs] Files listed successfully:', {
        count: response.data.files?.length || 0,
      });

      return {
        files: response.data.files || [],
        nextPageToken: response.data.nextPageToken,
      };
    } catch (error: unknown) {
      console.error('[GoogleDriveService.listPdfs] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GoogleDriveServiceError(
        `Error listando archivos de Google Drive: ${errorMessage}`,
        'DRIVE_LIST_ERROR',
        { originalError: errorMessage }
      );
    }
  }

  /**
   * Busca archivos PDF en Google Drive
   */
  async searchPdfs(
    searchTerm: string,
    folderId?: string,
    pageSize: number = 10
  ): Promise<{
    files: Array<{
      id: string;
      name: string;
      size: string;
      createdTime: string;
      modifiedTime: string;
      webViewLink: string;
    }>;
  }> {
    try {
      console.log(`[${new Date().toISOString()}] [GoogleDriveService.searchPdfs] Searching:`, {
        searchTerm,
        folderId: folderId || 'root',
      });

      if (!this.drive) {
        throw new GoogleDriveServiceError(
          'Google Drive no está configurado',
          'DRIVE_NOT_CONFIGURED'
        );
      }

      let query = `mimeType='application/pdf' and trashed=false and name contains '${searchTerm}'`;
      if (folderId) {
        query += ` and '${folderId}' in parents`;
      }

      const response = await this.drive.files.list({
        q: query,
        pageSize: pageSize,
        fields: 'files(id, name, size, createdTime, modifiedTime, webViewLink)',
        orderBy: 'modifiedTime desc',
      });

      console.log('[GoogleDriveService.searchPdfs] Search completed:', {
        count: response.data.files?.length || 0,
      });

      return {
        files: response.data.files || [],
      };
    } catch (error: unknown) {
      console.error('[GoogleDriveService.searchPdfs] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GoogleDriveServiceError(
        `Error buscando archivos en Google Drive: ${errorMessage}`,
        'DRIVE_SEARCH_ERROR',
        { originalError: errorMessage }
      );
    }
  }

  /**
   * Elimina un archivo de Google Drive
   */
  async deletePdf(fileId: string): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] [GoogleDriveService.deletePdf] Deleting:`, {
        fileId,
      });

      if (!this.drive) {
        throw new GoogleDriveServiceError(
          'Google Drive no está configurado',
          'DRIVE_NOT_CONFIGURED'
        );
      }

      await this.drive.files.delete({
        fileId: fileId,
      });

      console.log('[GoogleDriveService.deletePdf] File deleted successfully');
    } catch (error: unknown) {
      console.error('[GoogleDriveService.deletePdf] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GoogleDriveServiceError(
        `Error eliminando archivo de Google Drive: ${errorMessage}`,
        'DRIVE_DELETE_ERROR',
        { originalError: errorMessage }
      );
    }
  }

  /**
   * Crea una carpeta en Google Drive
   */
  async createFolder(name: string, parentFolderId?: string): Promise<string> {
    try {
      console.log(`[${new Date().toISOString()}] [GoogleDriveService.createFolder] Creating:`, {
        name,
        parentFolderId: parentFolderId || 'root',
      });

      if (!this.drive) {
        throw new GoogleDriveServiceError(
          'Google Drive no está configurado',
          'DRIVE_NOT_CONFIGURED'
        );
      }

      const fileMetadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined,
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: 'id',
      });

      console.log('[GoogleDriveService.createFolder] Folder created successfully:', {
        folderId: response.data.id,
      });

      return response.data.id;
    } catch (error: unknown) {
      console.error('[GoogleDriveService.createFolder] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GoogleDriveServiceError(
        `Error creando carpeta en Google Drive: ${errorMessage}`,
        'DRIVE_CREATE_FOLDER_ERROR',
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
      if (!this.drive) {
        throw new GoogleDriveServiceError(
          'Google Drive no está configurado',
          'DRIVE_NOT_CONFIGURED'
        );
      }

      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, size, mimeType, createdTime, modifiedTime, webViewLink, webContentLink',
      });

      return response.data;
    } catch (error: unknown) {
      console.error('[GoogleDriveService.getFileInfo] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GoogleDriveServiceError(
        `Error obteniendo información del archivo: ${errorMessage}`,
        'DRIVE_GET_INFO_ERROR',
        { originalError: errorMessage }
      );
    }
  }

  /**
   * Verifica si el servicio está configurado correctamente
   */
  isHealthy(): boolean {
    return !!(this.oauth2Client && this.drive);
  }

  /**
   * Obtiene las capacidades del servicio
   */
  getCapabilities(): {
    upload: boolean;
    download: boolean;
    search: boolean;
    delete: boolean;
    createFolder: boolean;
    maxFileSize: string;
    supportedFormats: string[];
  } {
    return {
      upload: this.isHealthy(),
      download: this.isHealthy(),
      search: this.isHealthy(),
      delete: this.isHealthy(),
      createFolder: this.isHealthy(),
      maxFileSize: '100MB',
      supportedFormats: ['application/pdf'],
    };
  }
}

// Instancia singleton del servicio
export const googleDriveService = new GoogleDriveService();
