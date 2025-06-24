import { google } from 'googleapis';
import { GoogleDriveServiceError } from '../../../utils/errors';
import { driveAuthService } from '../auth/authService';

/**
 * Interfaz para archivos de Drive
 */
export interface DriveFile {
  id: string;
  name: string;
  size: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
}

/**
 * Servicio especializado para búsqueda y análisis de archivos PDF en Google Drive.
 * Incluye funcionalidades para listar, buscar y filtrar por criterios avanzados,
 * así como obtener estadísticas y validar la salud del servicio.
 * Utiliza inicialización diferida y control de errores personalizado.
 */
export class DriveSearchService {
  private drive: any = null;

  /**
   * Inicializa el cliente de Google Drive solo cuando es necesario
   */
  private initializeDrive(): void {
    if (this.drive) return;

    const oauth2Client = driveAuthService.getOAuth2Client();
    this.drive = google.drive({ version: 'v3', auth: oauth2Client });

    console.log('[DriveSearchService] Google Drive client initialized');
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
   * Construye query de búsqueda optimizada para PDFs
   */
  private buildPdfQuery(folderId?: string, searchTerm?: string): string {
    let query = "mimeType='application/pdf' and trashed=false";

    if (folderId) {
      query += ` and '${folderId}' in parents`;
    }

    if (searchTerm) {
      // Escapar caracteres especiales en el término de búsqueda
      const escapedTerm = searchTerm.replace(/'/g, "\\'");
      query += ` and name contains '${escapedTerm}'`;
    }

    return query;
  }

  /**
   * Lista archivos PDF en Google Drive con paginación optimizada
   */
  async listPdfs(
    folderId?: string,
    pageSize: number = 10,
    pageToken?: string
  ): Promise<{
    files: DriveFile[];
    nextPageToken?: string;
  }> {
    try {
      console.log(`[${new Date().toISOString()}] [DriveSearchService.listPdfs] Listing PDFs:`, {
        folderId: folderId || 'root',
        pageSize,
        hasPageToken: !!pageToken,
      });

      const drive = this.getDriveClient();
      const query = this.buildPdfQuery(folderId);

      const response = await drive.files.list({
        q: query,
        pageSize: Math.min(pageSize, 100), // Limitar a máximo 100 por página
        pageToken: pageToken,
        fields: 'nextPageToken, files(id, name, size, createdTime, modifiedTime, webViewLink)',
        orderBy: 'modifiedTime desc',
      });

      console.log('[DriveSearchService.listPdfs] Files listed successfully:', {
        count: response.data.files?.length || 0,
        hasNextPage: !!response.data.nextPageToken,
      });

      return {
        files: response.data.files || [],
        nextPageToken: response.data.nextPageToken,
      };
    } catch (error: unknown) {
      console.error('[DriveSearchService.listPdfs] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GoogleDriveServiceError(
        `Error listando archivos de Google Drive: ${errorMessage}`,
        'DRIVE_LIST_ERROR',
        { originalError: errorMessage }
      );
    }
  }

  /**
   * Busca archivos PDF en Google Drive con términos específicos
   */
  async searchPdfs(
    searchTerm: string,
    folderId?: string,
    pageSize: number = 10
  ): Promise<{
    files: DriveFile[];
  }> {
    try {
      console.log(`[${new Date().toISOString()}] [DriveSearchService.searchPdfs] Searching:`, {
        searchTerm,
        folderId: folderId || 'root',
        pageSize,
      });

      const drive = this.getDriveClient();
      const query = this.buildPdfQuery(folderId, searchTerm);

      const response = await drive.files.list({
        q: query,
        pageSize: Math.min(pageSize, 100), // Limitar a máximo 100 por página
        fields: 'files(id, name, size, createdTime, modifiedTime, webViewLink)',
        orderBy: 'modifiedTime desc',
      });

      console.log('[DriveSearchService.searchPdfs] Search completed:', {
        searchTerm,
        count: response.data.files?.length || 0,
      });

      return {
        files: response.data.files || [],
      };
    } catch (error: unknown) {
      console.error('[DriveSearchService.searchPdfs] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GoogleDriveServiceError(
        `Error buscando archivos en Google Drive: ${errorMessage}`,
        'DRIVE_SEARCH_ERROR',
        { originalError: errorMessage }
      );
    }
  }

  /**
   * Busca archivos por múltiples criterios (búsqueda avanzada)
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
    try {
      console.log(
        `[${new Date().toISOString()}] [DriveSearchService.advancedSearch] Advanced search:`,
        criteria
      );

      const drive = this.getDriveClient();
      let query = "mimeType='application/pdf' and trashed=false";

      // Agregar criterios de búsqueda
      if (criteria.folderId) {
        query += ` and '${criteria.folderId}' in parents`;
      }

      if (criteria.searchTerm) {
        const escapedTerm = criteria.searchTerm.replace(/'/g, "\\'");
        query += ` and name contains '${escapedTerm}'`;
      }

      if (criteria.dateFrom) {
        query += ` and modifiedTime >= '${criteria.dateFrom}'`;
      }

      if (criteria.dateTo) {
        query += ` and modifiedTime <= '${criteria.dateTo}'`;
      }

      const response = await drive.files.list({
        q: query,
        pageSize: Math.min(criteria.pageSize || 10, 100),
        fields: 'files(id, name, size, createdTime, modifiedTime, webViewLink)',
        orderBy: 'modifiedTime desc',
      });

      let files = response.data.files || [];

      // Filtrar por tamaño si se especifica (Google Drive API no soporta filtros de tamaño directamente)
      if (criteria.minSize || criteria.maxSize) {
        files = files.filter((file: any) => {
          const size = parseInt(file.size || '0');
          if (criteria.minSize && size < criteria.minSize) return false;
          if (criteria.maxSize && size > criteria.maxSize) return false;
          return true;
        });
      }

      console.log('[DriveSearchService.advancedSearch] Advanced search completed:', {
        count: files.length,
      });

      return { files };
    } catch (error: unknown) {
      console.error('[DriveSearchService.advancedSearch] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GoogleDriveServiceError(
        `Error en búsqueda avanzada: ${errorMessage}`,
        'DRIVE_ADVANCED_SEARCH_ERROR',
        { originalError: errorMessage }
      );
    }
  }

  /**
   * Obtiene estadísticas de archivos en una carpeta
   */
  async getFolderStats(folderId?: string): Promise<{
    totalFiles: number;
    totalSize: number;
    lastModified?: string;
  }> {
    try {
      console.log(
        `[${new Date().toISOString()}] [DriveSearchService.getFolderStats] Getting stats for:`,
        {
          folderId: folderId || 'root',
        }
      );

      const drive = this.getDriveClient();
      const query = this.buildPdfQuery(folderId);

      const response = await drive.files.list({
        q: query,
        pageSize: 1000, // Obtener hasta 1000 archivos para estadísticas
        fields: 'files(size, modifiedTime)',
        orderBy: 'modifiedTime desc',
      });

      const files = response.data.files || [];
      const totalFiles = files.length;
      const totalSize = files.reduce((sum: number, file: any) => {
        return sum + parseInt(file.size || '0');
      }, 0);
      const lastModified = files.length > 0 ? files[0].modifiedTime : undefined;

      console.log('[DriveSearchService.getFolderStats] Stats calculated:', {
        totalFiles,
        totalSize,
        lastModified,
      });

      return {
        totalFiles,
        totalSize,
        lastModified,
      };
    } catch (error: unknown) {
      console.error('[DriveSearchService.getFolderStats] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GoogleDriveServiceError(
        `Error obteniendo estadísticas: ${errorMessage}`,
        'DRIVE_STATS_ERROR',
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

// Instancia singleton del servicio de búsqueda
export const driveSearchService = new DriveSearchService();
