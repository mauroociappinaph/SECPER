import { Request, Response } from 'express';
import { googleDriveService } from '../services/driveService';
import { DriveValidators } from '../utils/driveValidators';
import { GoogleDriveServiceError } from '../../utils/errors';

/**
 * Controlador para manejar operaciones de Google Drive
 */
export class DriveController {
  /**
   * Obtiene la URL de autorización de Google OAuth
   * GET /api/drive/auth-url
   */
  static async getAuthUrl(req: Request, res: Response): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] [DriveController.getAuthUrl] Getting auth URL`);

      const authUrl = googleDriveService.getAuthUrl();

      res.status(200).json({
        success: true,
        data: {
          authUrl,
          message: 'Visita esta URL para autorizar el acceso a Google Drive',
        },
      });
    } catch (error: unknown) {
      console.error('[DriveController.getAuthUrl] Error:', error);

      if (error instanceof GoogleDriveServiceError) {
        res.status(400).json({
          success: false,
          error: {
            message: error.message,
            code: error.code,
            details: error.metadata,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          details: error instanceof Error ? error.message : 'Error desconocido',
        },
      });
    }
  }

  /**
   * Intercambia código de autorización por tokens
   * POST /api/drive/auth-callback
   * Body: { code: string }
   */
  static async handleAuthCallback(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        `[${new Date().toISOString()}] [DriveController.handleAuthCallback] Processing callback`
      );

      const { code } = req.body;

      // Validar código de autorización
      const codeValidation = DriveValidators.validateAuthCode(code);
      if (!codeValidation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            message: codeValidation.error,
            code: 'INVALID_AUTH_CODE',
          },
        });
        return;
      }

      const tokens = await googleDriveService.getTokensFromCode(code);

      // Configurar tokens en el servicio
      googleDriveService.setAccessToken(tokens.accessToken, tokens.refreshToken);

      res.status(200).json({
        success: true,
        data: {
          message: 'Autorización exitosa',
          hasRefreshToken: !!tokens.refreshToken,
        },
      });
    } catch (error: unknown) {
      console.error('[DriveController.handleAuthCallback] Error:', error);

      if (error instanceof GoogleDriveServiceError) {
        res.status(400).json({
          success: false,
          error: {
            message: error.message,
            code: error.code,
            details: error.metadata,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          details: error instanceof Error ? error.message : 'Error desconocido',
        },
      });
    }
  }

  /**
   * Sube un archivo PDF a Google Drive
   * POST /api/drive/upload
   * Body: FormData con archivo PDF y opcionalmente folderId
   */
  static async uploadPdf(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        `[${new Date().toISOString()}] [DriveController.uploadPdf] Upload request received`
      );

      const file = req.file;
      const { folderId } = req.body;

      // Validar archivo
      if (!file) {
        res.status(400).json({
          success: false,
          error: {
            message: 'No se proporcionó ningún archivo',
            code: 'NO_FILE_PROVIDED',
          },
        });
        return;
      }

      const fileValidation = DriveValidators.validateUploadFile(file);
      if (!fileValidation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            message: fileValidation.error,
            code: 'INVALID_FILE',
          },
        });
        return;
      }

      // Validar folder ID si se proporciona
      if (folderId) {
        const folderValidation = DriveValidators.validateFolderId(folderId);
        if (!folderValidation.isValid) {
          res.status(400).json({
            success: false,
            error: {
              message: folderValidation.error,
              code: 'INVALID_FOLDER_ID',
            },
          });
          return;
        }
      }

      const result = await googleDriveService.uploadPdf(file.buffer, file.originalname, folderId);

      res.status(201).json({
        success: true,
        data: {
          fileId: result.fileId,
          filename: file.originalname,
          webViewLink: result.webViewLink,
          webContentLink: result.webContentLink,
          message: 'Archivo subido exitosamente a Google Drive',
        },
      });
    } catch (error: unknown) {
      console.error('[DriveController.uploadPdf] Error:', error);

      if (error instanceof GoogleDriveServiceError) {
        res.status(400).json({
          success: false,
          error: {
            message: error.message,
            code: error.code,
            details: error.metadata,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          details: error instanceof Error ? error.message : 'Error desconocido',
        },
      });
    }
  }

  /**
   * Descarga un archivo PDF desde Google Drive
   * GET /api/drive/download/:fileId
   */
  static async downloadPdf(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        `[${new Date().toISOString()}] [DriveController.downloadPdf] Download request received`
      );

      const { fileId } = req.params;

      // Validar file ID
      const fileIdValidation = DriveValidators.validateFileId(fileId);
      if (!fileIdValidation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            message: fileIdValidation.error,
            code: 'INVALID_FILE_ID',
          },
        });
        return;
      }

      // Obtener información del archivo primero
      const fileInfo = await googleDriveService.getFileInfo(fileId);

      // Descargar el archivo
      const fileBuffer = await googleDriveService.downloadPdf(fileId);

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.name}"`);
      res.setHeader('Content-Length', fileBuffer.length);

      res.send(fileBuffer);
    } catch (error: unknown) {
      console.error('[DriveController.downloadPdf] Error:', error);

      if (error instanceof GoogleDriveServiceError) {
        res.status(400).json({
          success: false,
          error: {
            message: error.message,
            code: error.code,
            details: error.metadata,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          details: error instanceof Error ? error.message : 'Error desconocido',
        },
      });
    }
  }

  /**
   * Lista archivos PDF en Google Drive
   * GET /api/drive/list
   * Query params: folderId?, pageSize?, pageToken?
   */
  static async listPdfs(req: Request, res: Response): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] [DriveController.listPdfs] List request received`);

      const { folderId, pageSize, pageToken } = req.query;

      // Validar parámetros
      const paginationValidation = DriveValidators.validatePaginationParams(
        pageSize ? parseInt(pageSize as string) : undefined,
        pageToken as string
      );
      if (!paginationValidation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            message: paginationValidation.error,
            code: 'INVALID_PAGINATION_PARAMS',
          },
        });
        return;
      }

      if (folderId) {
        const folderValidation = DriveValidators.validateFolderId(folderId as string);
        if (!folderValidation.isValid) {
          res.status(400).json({
            success: false,
            error: {
              message: folderValidation.error,
              code: 'INVALID_FOLDER_ID',
            },
          });
          return;
        }
      }

      const result = await googleDriveService.listPdfs(
        folderId as string,
        pageSize ? parseInt(pageSize as string) : 10,
        pageToken as string
      );

      res.status(200).json({
        success: true,
        data: {
          files: result.files,
          nextPageToken: result.nextPageToken,
          hasMore: !!result.nextPageToken,
          count: result.files.length,
        },
      });
    } catch (error: unknown) {
      console.error('[DriveController.listPdfs] Error:', error);

      if (error instanceof GoogleDriveServiceError) {
        res.status(400).json({
          success: false,
          error: {
            message: error.message,
            code: error.code,
            details: error.metadata,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          details: error instanceof Error ? error.message : 'Error desconocido',
        },
      });
    }
  }

  /**
   * Busca archivos PDF en Google Drive
   * GET /api/drive/search
   * Query params: q (search term), folderId?, pageSize?
   */
  static async searchPdfs(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        `[${new Date().toISOString()}] [DriveController.searchPdfs] Search request received`
      );

      const { q: searchTerm, folderId, pageSize } = req.query;

      // Validar término de búsqueda
      const searchValidation = DriveValidators.validateSearchParams(searchTerm as string);
      if (!searchValidation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            message: searchValidation.error,
            code: 'INVALID_SEARCH_TERM',
          },
        });
        return;
      }

      // Validar parámetros opcionales
      if (folderId) {
        const folderValidation = DriveValidators.validateFolderId(folderId as string);
        if (!folderValidation.isValid) {
          res.status(400).json({
            success: false,
            error: {
              message: folderValidation.error,
              code: 'INVALID_FOLDER_ID',
            },
          });
          return;
        }
      }

      if (pageSize) {
        const paginationValidation = DriveValidators.validatePaginationParams(
          parseInt(pageSize as string)
        );
        if (!paginationValidation.isValid) {
          res.status(400).json({
            success: false,
            error: {
              message: paginationValidation.error,
              code: 'INVALID_PAGE_SIZE',
            },
          });
          return;
        }
      }

      const result = await googleDriveService.searchPdfs(
        searchTerm as string,
        folderId as string,
        pageSize ? parseInt(pageSize as string) : 10
      );

      res.status(200).json({
        success: true,
        data: {
          files: result.files,
          searchTerm: searchTerm,
          count: result.files.length,
        },
      });
    } catch (error: unknown) {
      console.error('[DriveController.searchPdfs] Error:', error);

      if (error instanceof GoogleDriveServiceError) {
        res.status(400).json({
          success: false,
          error: {
            message: error.message,
            code: error.code,
            details: error.metadata,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          details: error instanceof Error ? error.message : 'Error desconocido',
        },
      });
    }
  }

  /**
   * Elimina un archivo PDF de Google Drive
   * DELETE /api/drive/delete/:fileId
   */
  static async deletePdf(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        `[${new Date().toISOString()}] [DriveController.deletePdf] Delete request received`
      );

      const { fileId } = req.params;

      // Validar file ID
      const fileIdValidation = DriveValidators.validateFileId(fileId);
      if (!fileIdValidation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            message: fileIdValidation.error,
            code: 'INVALID_FILE_ID',
          },
        });
        return;
      }

      await googleDriveService.deletePdf(fileId);

      res.status(200).json({
        success: true,
        data: {
          message: 'Archivo eliminado exitosamente de Google Drive',
          fileId: fileId,
        },
      });
    } catch (error: unknown) {
      console.error('[DriveController.deletePdf] Error:', error);

      if (error instanceof GoogleDriveServiceError) {
        res.status(400).json({
          success: false,
          error: {
            message: error.message,
            code: error.code,
            details: error.metadata,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          details: error instanceof Error ? error.message : 'Error desconocido',
        },
      });
    }
  }

  /**
   * Crea una carpeta en Google Drive
   * POST /api/drive/create-folder
   * Body: { name: string, parentFolderId?: string }
   */
  static async createFolder(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        `[${new Date().toISOString()}] [DriveController.createFolder] Create folder request received`
      );

      const { name, parentFolderId } = req.body;

      // Validar nombre de carpeta
      const nameValidation = DriveValidators.validateFolderName(name);
      if (!nameValidation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            message: nameValidation.error,
            code: 'INVALID_FOLDER_NAME',
          },
        });
        return;
      }

      // Validar parent folder ID si se proporciona
      if (parentFolderId) {
        const folderValidation = DriveValidators.validateFolderId(parentFolderId);
        if (!folderValidation.isValid) {
          res.status(400).json({
            success: false,
            error: {
              message: folderValidation.error,
              code: 'INVALID_PARENT_FOLDER_ID',
            },
          });
          return;
        }
      }

      const folderId = await googleDriveService.createFolder(name, parentFolderId);

      res.status(201).json({
        success: true,
        data: {
          folderId: folderId,
          name: name,
          parentFolderId: parentFolderId || 'root',
          message: 'Carpeta creada exitosamente en Google Drive',
        },
      });
    } catch (error: unknown) {
      console.error('[DriveController.createFolder] Error:', error);

      if (error instanceof GoogleDriveServiceError) {
        res.status(400).json({
          success: false,
          error: {
            message: error.message,
            code: error.code,
            details: error.metadata,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          details: error instanceof Error ? error.message : 'Error desconocido',
        },
      });
    }
  }

  /**
   * Obtiene información de un archivo
   * GET /api/drive/info/:fileId
   */
  static async getFileInfo(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        `[${new Date().toISOString()}] [DriveController.getFileInfo] Get info request received`
      );

      const { fileId } = req.params;

      // Validar file ID
      const fileIdValidation = DriveValidators.validateFileId(fileId);
      if (!fileIdValidation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            message: fileIdValidation.error,
            code: 'INVALID_FILE_ID',
          },
        });
        return;
      }

      const fileInfo = await googleDriveService.getFileInfo(fileId);

      res.status(200).json({
        success: true,
        data: fileInfo,
      });
    } catch (error: unknown) {
      console.error('[DriveController.getFileInfo] Error:', error);

      if (error instanceof GoogleDriveServiceError) {
        res.status(400).json({
          success: false,
          error: {
            message: error.message,
            code: error.code,
            details: error.metadata,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          details: error instanceof Error ? error.message : 'Error desconocido',
        },
      });
    }
  }

  /**
   * Obtiene las capacidades del servicio Google Drive
   * GET /api/drive/capabilities
   */
  static async getCapabilities(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        `[${new Date().toISOString()}] [DriveController.getCapabilities] Getting capabilities`
      );

      const capabilities = googleDriveService.getCapabilities();
      const validationRules = DriveValidators.getValidationRules();

      res.status(200).json({
        success: true,
        data: {
          ...capabilities,
          validationRules,
          isConfigured: googleDriveService.isHealthy(),
        },
      });
    } catch (error: unknown) {
      console.error('[DriveController.getCapabilities] Error:', error);

      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          details: error instanceof Error ? error.message : 'Error desconocido',
        },
      });
    }
  }

  /**
   * Verifica el estado del módulo Google Drive
   * GET /api/drive/health
   */
  static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] [DriveController.healthCheck] Health check`);

      const isHealthy = googleDriveService.isHealthy();
      const capabilities = googleDriveService.getCapabilities();

      res.status(200).json({
        success: true,
        data: {
          status: isHealthy ? 'healthy' : 'unhealthy',
          timestamp: new Date().toISOString(),
          capabilities,
          message: isHealthy
            ? 'Google Drive service is configured and ready'
            : 'Google Drive service needs configuration',
        },
      });
    } catch (error: unknown) {
      console.error('[DriveController.healthCheck] Error:', error);

      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          details: error instanceof Error ? error.message : 'Error desconocido',
        },
      });
    }
  }
}
